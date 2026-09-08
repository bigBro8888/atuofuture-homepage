import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { config } from '../config.js'

export const defaultAppFeatures = {
  title: '四大产品亮点，让电子相册更好用',
  subtitle: '从内容整理到设备投屏，手机就能掌控每一块电子纸屏幕',
  items: [
    { icon: 'photo_library', title: '相册管理', description: '手机端集中整理照片与作品，按主题归档，随时挑选要展示的内容。', accent: 'blue' },
    { icon: 'sync', title: '一键同步', description: '选中图片即可推送到电子相册，多设备内容同步更新，换画更省心。', accent: 'cyan' },
    { icon: 'cast', title: '随心投屏', description: '远程切换画框画面与展示方式，家里办公室一块屏，想换就换。', accent: 'violet' },
    { icon: 'auto_awesome', title: 'AI 创作', description: 'AI 辅助美化与生成展示画面，快速做出有氛围的电子相册内容。', accent: 'amber' },
  ],
}

export function normalizeAppFeatures(value = {}) {
  const clean = (input, fallback, max) => String(input ?? fallback ?? '').trim().slice(0, max) || fallback
  const accents = new Set(['blue', 'cyan', 'violet', 'amber'])
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
        accent: accents.has(item.accent) ? item.accent : fallback.accent,
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
  // 上一次写盘失败时不能让队列永久 rejected，否则后续所有保存都会连环失败。
  const job = writeQueue.catch(() => {}).then(persist)
  writeQueue = job.catch(() => {})
  return job
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
