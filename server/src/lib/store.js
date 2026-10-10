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

export const defaultAspaceQuickActions = [
  { id: 'energy', icon: 'bar_chart', label: '查看今日能耗', url: 'app:energy' },
  { id: 'poster', icon: 'add_photo_alternate', label: '新建AI画报', url: 'app:poster' },
  { id: 'album', icon: 'collections', label: '更新电子相册', url: 'app:album' },
  { id: 'screen', icon: 'desktop_windows', label: '预约会议室', url: 'app:screen' },
  { id: 'report', icon: 'description', label: '导出运营报表', url: '' },
  { id: 'permission', icon: 'person_add', label: '申请产品权限', url: '' },
]

export const defaultAspaceCatalog = {
  categories: [
    { id: 'twin', icon: 'deployed_code', label: '数字孪生', description: '统一呈现园区、楼宇与空间运行态势' },
    { id: 'meeting', icon: 'groups', label: '会议管理', description: '覆盖会前预约、会中控制与会后服务' },
    { id: 'content', icon: 'campaign', label: '信息发布', description: '统一管理内容生产、发布与多终端展示' },
    { id: 'asset', icon: 'business_center', label: '资产管理', description: '管理资产台账、流转与全生命周期' },
    { id: 'energy', icon: 'eco', label: '能源能耗', description: '洞察能源使用、用能异常与节能空间' },
    { id: 'carbon', icon: 'co2', label: '双碳管理', description: '支撑碳排核算、分析与减排目标管理' },
    { id: 'security', icon: 'shield_lock', label: '门禁安防', description: '统一管理通行权限、事件与安全告警' },
    { id: 'foundation', icon: 'hub', label: '智能底座', description: '沉淀空间、设备、人员和智能控制基础能力' },
    { id: 'visitor', icon: 'person_add', label: '访客管理', description: '覆盖访客邀约、审批、登记与到访服务' },
  ],
  apps: [
    { id: 'digital-twin', name: '数字孪生', category: 'twin' },
    { id: 'screen', name: '会议预约', category: 'meeting' },
    { id: 'deskplate', name: '桌牌管理', category: 'meeting' },
    { id: 'wireless-screen', name: '无线投屏', category: 'meeting' },
    { id: 'info-publish', name: '信息发布平台', category: 'content' },
    { id: 'poster', name: 'AI画报', category: 'content' },
    { id: 'album', name: '电子相册', category: 'content' },
    { id: 'resource', name: 'AAP资产管理系统', category: 'asset' },
    { id: 'energy', name: '能源能耗', category: 'energy' },
    { id: 'carbon-management', name: '双碳管理', category: 'carbon' },
    { id: 'access-security', name: '门禁安防', category: 'security' },
    { id: 'aspace', name: '空间智能管理平台', category: 'foundation' },
    { id: 'device-center', name: '设备中心', category: 'foundation' },
    { id: 'space-center', name: '空间中心', category: 'foundation' },
    { id: 'permission-center', name: '权限中心', category: 'foundation' },
    { id: 'person-center', name: '人员中心', category: 'foundation' },
    { id: 'application-center', name: '应用中心', category: 'foundation' },
    { id: 'smart-lighting', name: '智能照明', category: 'foundation' },
    { id: 'smart-air', name: '智能空调', category: 'foundation' },
    { id: 'smart-sensor', name: '智能传感', category: 'foundation' },
    { id: 'smart-scene', name: '智能场景', category: 'foundation' },
    { id: 'visitor-booking', name: '访客预约', category: 'visitor' },
  ],
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
  aspaceQuickActions: structuredClone(defaultAspaceQuickActions),
  aspaceCatalog: structuredClone(defaultAspaceCatalog),
  aspaceActivities: [],
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
