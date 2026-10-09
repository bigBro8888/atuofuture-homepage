import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { authConfig } from './config.js'

let state = { users: [], auditLogs: [] }
let writeQueue = Promise.resolve()

async function persist() {
  await mkdir(path.dirname(authConfig.dataFile), { recursive: true })
  const temporary = `${authConfig.dataFile}.tmp`
  await writeFile(temporary, JSON.stringify(state, null, 2), { encoding: 'utf8', mode: 0o600 })
  await rename(temporary, authConfig.dataFile)
}

export async function initAuthStore() {
  try {
    state = JSON.parse(await readFile(authConfig.dataFile, 'utf8'))
  } catch {
    state = { users: [], auditLogs: [] }
  }
  if (!Array.isArray(state.users)) state.users = []
  if (!Array.isArray(state.auditLogs)) state.auditLogs = []
  await persist()
}

export function saveAuthStore() {
  const job = writeQueue.catch(() => {}).then(persist)
  writeQueue = job.catch(() => {})
  return job
}

export function findUser(id) {
  return state.users.find((item) => item.id === id && item.enabled !== false) || null
}

function normalizeLocalAccount(value) {
  const account = String(value || '').trim().toLowerCase()
  if (!/^[a-z0-9_.@-]{3,64}$/.test(account)) {
    throw new Error('账号需为 3—64 位字母、数字或 _ . @ -')
  }
  return account
}

export async function registerLocalUser({ account: inputAccount, password, name }) {
  const account = normalizeLocalAccount(inputAccount)
  if (String(password || '').length < 8 || String(password || '').length > 72) {
    throw new Error('密码长度需为 8—72 位')
  }
  const exists = state.users.some((item) => (
    item.identities?.some((identity) => identity.provider === 'password' && identity.externalId === account)
  ))
  if (exists) throw new Error('该账号已注册')
  const now = new Date().toISOString()
  const user = {
    id: randomUUID(),
    name: String(name || account).trim().slice(0, 80) || account,
    email: account.includes('@') ? account : '',
    avatarUrl: '',
    enabled: true,
    passwordHash: await bcrypt.hash(String(password), 12),
    identities: [{ provider: 'password', externalId: account }],
    createdAt: now,
    updatedAt: now,
  }
  state.users.push(user)
  await saveAuthStore()
  return user
}

export async function verifyLocalUser(inputAccount, password) {
  let account
  try {
    account = normalizeLocalAccount(inputAccount)
  } catch {
    return null
  }
  const user = state.users.find((item) => (
    item.enabled !== false
    && item.passwordHash
    && item.identities?.some((identity) => identity.provider === 'password' && identity.externalId === account)
  ))
  if (!user) {
    await bcrypt.compare(String(password || ''), '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW')
    return null
  }
  return await bcrypt.compare(String(password || ''), user.passwordHash) ? user : null
}

export async function upsertFederatedUser(provider, externalId, profile = {}) {
  let user = state.users.find((item) => (
    item.identities?.some((identity) => identity.provider === provider && identity.externalId === externalId)
  ))
  const now = new Date().toISOString()
  if (!user) {
    user = {
      id: randomUUID(),
      name: String(profile.name || '新用户').trim().slice(0, 80),
      email: String(profile.email || '').trim().toLowerCase().slice(0, 160),
      avatarUrl: String(profile.avatarUrl || '').trim().slice(0, 500),
      enabled: true,
      identities: [{ provider, externalId }],
      createdAt: now,
      updatedAt: now,
    }
    state.users.push(user)
  } else {
    if (profile.name) user.name = String(profile.name).trim().slice(0, 80)
    if (profile.email) user.email = String(profile.email).trim().toLowerCase().slice(0, 160)
    if (profile.avatarUrl) user.avatarUrl = String(profile.avatarUrl).trim().slice(0, 500)
    user.updatedAt = now
  }
  await saveAuthStore()
  return user
}

export async function addAuthAudit(action, details = {}) {
  state.auditLogs.push({
    id: randomUUID(),
    action,
    details,
    createdAt: new Date().toISOString(),
  })
  if (state.auditLogs.length > 5000) state.auditLogs.splice(0, state.auditLogs.length - 5000)
  await saveAuthStore()
}

export function accountClaims(user) {
  return {
    sub: user.id,
    name: user.name,
    email: user.email || undefined,
    email_verified: Boolean(user.email),
    picture: user.avatarUrl || undefined,
  }
}
