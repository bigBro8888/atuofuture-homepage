import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { config } from '../config.js'

export const defaultAppFeatures = {
  title: '四大核心能力，重塑办公体验',
  subtitle: '全场景覆盖，让空间更懂你的需求',
  items: [
    { icon: 'settings_remote', title: 'Space Control', description: '一键调节灯光、空调与遮阳系统，打造舒适的个性化空间环境。' },
    { icon: 'calendar_month', title: 'Meeting Service', description: '智能会议室预约，实时查看空间状态，告别会议资源冲突。' },
    { icon: 'confirmation_number', title: 'Message & Ticket', description: '快速发起报修与服务申请，实时追踪进度，问题响应更及时。' },
    { icon: 'smart_toy', title: 'AI Assistant', description: '学习用户习惯，主动提供空间调节建议与日程管理服务。' },
  ],
}

export function normalizeAppFeatures(value = {}) {
  const clean = (input, fallback, max) => String(input ?? fallback ?? '').trim().slice(0, max) || fallback
  const source = Array.isArray(value.items) ? value.items : []
  return {
    title: clean(value.title, defaultAppFeatures.title, 120),
    subtitle: clean(value.subtitle, defaultAppFeatures.subtitle, 240),
    items: defaultAppFeatures.items.map((fallback, index) => {
      const item = source[index] || {}
      return {
        icon: clean(item.icon, fallback.icon, 40),
        title: clean(item.title, fallback.title, 80),
        description: clean(item.description, fallback.description, 300),
      }
    }),
  }
}

export const defaultAppButtons = {
  androidLabel: '立即下载 {version}',
  iosLabel: '前往 App Store',
  switchToAndroid: '需要 Android 版本？',
  switchToIos: '需要 iPhone 版本？',
  switchToAndroidTag: 'Android',
  switchToIosTag: 'iOS',
}

export function normalizeAppButtons(value = {}) {
  const clean = (input, fallback) => String(input ?? fallback ?? '').trim().slice(0, 40) || fallback
  // 角标允许清空，因此只有字段缺失时才回退到默认值。
  const optional = (input, fallback) => (input === undefined ? fallback : String(input).trim().slice(0, 12))
  return {
    androidLabel: clean(value.androidLabel, defaultAppButtons.androidLabel),
    iosLabel: clean(value.iosLabel, defaultAppButtons.iosLabel),
    switchToAndroid: clean(value.switchToAndroid, defaultAppButtons.switchToAndroid),
    switchToIos: clean(value.switchToIos, defaultAppButtons.switchToIos),
    switchToAndroidTag: optional(value.switchToAndroidTag, defaultAppButtons.switchToAndroidTag),
    switchToIosTag: optional(value.switchToIosTag, defaultAppButtons.switchToIosTag),
  }
}

const initialData = {
  apps: [{
    id: 'artink',
    name: 'AI投屏',
    description: '通过 Artink App 管理电子纸设备、同步创意内容，开启更轻盈的智能生活。',
    iconUrl: '',
    heroImageUrl: '',
    desktopBannerUrl: '/images/app-download/back.png',
    downloadTitle: 'AI投屏',
    downloadSubtitle: '随时随地，连接并管理智能空间',
    downloadDescription: '通过 Artink App 管理电子纸设备、同步创意内容，开启更轻盈的智能生活。',
    features: structuredClone(defaultAppFeatures),
    buttons: structuredClone(defaultAppButtons),
    iosStoreUrl: 'https://apps.apple.com/cn/app/id6590617105',
    androidDownloadUrl: '',
    privacyUrl: '',
    termsUrl: '',
    published: true,
    updatedAt: new Date().toISOString(),
  }],
  releases: [],
  pageConfigs: [],
  downloadEvents: [],
  adminUsers: [],
  auditLogs: [],
  sourceHealth: { status: 'unknown', checkedAt: null, message: '' },
}

let state
let writeQueue = Promise.resolve()

async function persist() {
  const directory = path.dirname(config.dataFile)
  await mkdir(directory, { recursive: true })
  const temporary = `${config.dataFile}.tmp`
  await writeFile(temporary, JSON.stringify(state, null, 2), 'utf8')
  await rename(temporary, config.dataFile)
}

export async function initStore() {
  try {
    state = JSON.parse(await readFile(config.dataFile, 'utf8'))
  } catch {
    state = structuredClone(initialData)
  }

  for (const [key, value] of Object.entries(initialData)) {
    if (state[key] === undefined) state[key] = structuredClone(value)
  }

  if (!state.adminUsers.length) {
    state.adminUsers.push({
      id: randomUUID(),
      email: config.adminEmail.toLowerCase(),
      name: '系统管理员',
      passwordHash: await bcrypt.hash(config.adminPassword, 12),
      role: 'super_admin',
      enabled: true,
      createdAt: new Date().toISOString(),
    })
  }
  await persist()
  return state
}

export function db() {
  if (!state) throw new Error('Store has not been initialized')
  return state
}

export function save() {
  writeQueue = writeQueue.then(persist)
  return writeQueue
}

export function addRecord(collection, record) {
  const value = { id: randomUUID(), createdAt: new Date().toISOString(), ...record }
  db()[collection].push(value)
  return save().then(() => value)
}

export async function addAudit(user, action, target, details = {}) {
  return addRecord('auditLogs', {
    userId: user?.id || null,
    userEmail: user?.email || 'system',
    action,
    target,
    details,
  })
}

export function publicUser(user) {
  const { passwordHash, ...safe } = user
  return safe
}
