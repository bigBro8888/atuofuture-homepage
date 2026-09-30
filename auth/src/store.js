import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
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
