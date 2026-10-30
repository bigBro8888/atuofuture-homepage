import createGlobe from 'cobe'
import { renderSiteFooter } from '../components/site-footer.js'
import { alignHelpWithCatalog } from '../lib/aspace-help-categories.js'
import { defaultDocsListRules, resolveHelpDocList } from '../lib/aspace-help-list.js'
import { clearPortalTokens, readPortalTokens, writePortalTokens } from '../lib/site-account.js'
import { fetchAboutPageContent, mountAboutContent } from './about-page.js'

const ABOUT_SECTION_IDS = new Set([
  'about',
  'intro',
  'story',
  'culture',
  'join',
  'contact',
  'team',
  'delivery',
  'company',
])

function aboutSectionIdFromHash(hash = window.location.hash) {
  const id = String(hash || '').replace(/^#\/?/, '').split('?')[0].split('/')[0]
  if (!ABOUT_SECTION_IDS.has(id)) return ''
  return id === 'about' ? 'intro' : id
}

/** 规范门户路径，避免 /aspace-one/apps/ 这类子路径脱离 SPA 丢头部 */
function aspaceCanonicalPath() {
  const path = String(window.location.pathname || '/').replace(/\/+$/, '') || '/'
  if (path === '/aspace-one' || path.startsWith('/aspace-one/')) return '/aspace-one/'
  return `${path.endsWith('/') ? path : `${path}/`}`
}

/**
 * 解析当前 URL：兼容
 * - /aspace-one/#apps、#/apps、#/apps?id=xxx、#/apps?category=twin
 * - /aspace-one/apps/、/aspace-one/apps/?id=xxx（错误子路径，需拉回 SPA）
 */
function parseAspaceLocation() {
  const pathname = String(window.location.pathname || '/')
  const pathNorm = pathname.replace(/\/+$/, '') || '/'
  const searchParams = new URLSearchParams(window.location.search || '')
  const rawHash = String(window.location.hash || '')
  const hashBody = rawHash.replace(/^#\/?/, '')
  const [hashPath = '', hashQuery = ''] = hashBody.split('?')
  const hashParts = hashPath.split('/').filter(Boolean)
  const hashView = String(hashParts[0] || '').toLowerCase()
  const hashParams = new URLSearchParams(hashQuery)

  const pathApps = /^\/aspace-one\/apps(?:\/|$)/i.test(pathname)
  const pathHelp = /^\/aspace-one\/help(?:\/|$)/i.test(pathname)
  const pathAbout = /^\/aspace-one\/about(?:\/|$)/i.test(pathname)
  const needsPathNormalize = pathApps || pathHelp || pathAbout || (pathNorm !== '/aspace-one' && /^\/aspace-one\//i.test(pathname))

  let view = 'home'
  let appId = ''
  let category = ''
  let section = ''

  if (pathApps || hashView === 'apps') {
    view = 'apps'
    appId = String(hashParams.get('id') || searchParams.get('id') || hashParts[1] || '').trim()
    category = String(hashParams.get('category') || searchParams.get('category') || '').trim()
  } else if (pathHelp || hashView === 'help') {
    view = 'help'
  } else if (pathAbout || ABOUT_SECTION_IDS.has(hashView)) {
    view = 'about'
    section = aboutSectionIdFromHash(hashView ? `#${hashView}` : '#intro') || 'intro'
  }

  return { view, appId, category, section, needsPathNormalize }
}

function buildAspaceHash(view, { section = '', appId = '', category = '' } = {}) {
  if (view === 'home') return ''
  if (view === 'about') return `#/${section || 'intro'}`
  if (view === 'help') return '#/help'
  const params = new URLSearchParams()
  if (appId) params.set('id', appId)
  if (category) params.set('category', category)
  const query = params.toString()
  return query ? `#/apps?${query}` : '#/apps'
}

/** 解析配置里的门户链接（hash /aspace-one/apps 等），非门户链接返回 null */
function parseConfiguredAspaceRoute(raw = '') {
  const target = String(raw || '').trim()
  if (!target) return null
  try {
    if (target.startsWith('#')) {
      const hash = target.startsWith('#/') ? target : `#/${target.replace(/^#/, '')}`
      const body = hash.replace(/^#\/?/, '')
      const [hashPath = '', hashQuery = ''] = body.split('?')
      const parts = hashPath.split('/').filter(Boolean)
      const viewName = String(parts[0] || '').toLowerCase()
      const params = new URLSearchParams(hashQuery)
      if (viewName === 'apps') {
        return {
          view: 'apps',
          appId: String(params.get('id') || parts[1] || '').trim(),
          category: String(params.get('category') || '').trim(),
          section: '',
        }
      }
      if (viewName === 'help') return { view: 'help', appId: '', category: '', section: '' }
      if (viewName === 'home' || viewName === '') return { view: 'home', appId: '', category: '', section: '' }
      if (ABOUT_SECTION_IDS.has(viewName)) {
        return { view: 'about', appId: '', category: '', section: aboutSectionIdFromHash(`#${viewName}`) || 'intro' }
      }
      return null
    }

    const resolved = new URL(target, window.location.origin)
    if (resolved.origin !== window.location.origin) return null
    const path = resolved.pathname.replace(/\/+$/, '') || '/'
    if (path === '/aspace-one' || path === '/aspace-one/') {
      if (resolved.hash) return parseConfiguredAspaceRoute(resolved.hash)
      return { view: 'home', appId: '', category: '', section: '' }
    }
    if (/^\/aspace-one\/apps(?:\/|$)/i.test(resolved.pathname)) {
      const params = new URLSearchParams(resolved.search)
      if (resolved.hash) {
        const fromHash = parseConfiguredAspaceRoute(resolved.hash)
        if (fromHash) return fromHash
      }
      return {
        view: 'apps',
        appId: String(params.get('id') || '').trim(),
        category: String(params.get('category') || '').trim(),
        section: '',
      }
    }
    if (/^\/aspace-one\/help(?:\/|$)/i.test(resolved.pathname)) {
      return { view: 'help', appId: '', category: '', section: '' }
    }
    if (/^\/aspace-one\/about(?:\/|$)/i.test(resolved.pathname)) {
      return { view: 'about', appId: '', category: '', section: 'intro' }
    }
    if (resolved.hash && /^\/aspace-one(?:\/|$)/i.test(resolved.pathname)) {
      return parseConfiguredAspaceRoute(resolved.hash)
    }
  } catch {
    return null
  }
  return null
}

let apps = [
  {
    id: 'digital-twin',
    name: '数字孪生',
    category: 'twin',
    project: '园区空间可视化',
    time: '2026-10-08 14:20',
    image: '/images/aspace-one/showcase-space.jpg',
    alt: '数字孪生楼宇场景',
    url: 'http://47.95.170.47:8002/',
  },
  {
    id: 'screen',
    name: '会议预约',
    category: 'meeting',
    project: '会议全流程服务',
    time: '2026-09-21 09:12',
    warning: '1 台设备离线',
    image: '/images/aspace-one/app-control.jpg',
    alt: '会议预约与中控屏场景',
    embedUrl: 'http://47.95.170.47/pages/dashboard.html?_av=20260929f',
  },
  {
    id: 'deskplate',
    name: '桌牌管理',
    category: 'meeting',
    project: '智慧办公桌牌',
    time: '2026-09-30 18:02',
    image: '/images/aspace-one/showcase-meeting.jpg',
    alt: '桌牌管理系统场景',
    embedUrl: 'https://cloud.atuofuture.com/',
  },
  {
    id: 'meeting-info-screen',
    name: '会议信息屏',
    category: 'meeting',
    project: '会议空间',
    desc: '会议日程与会议信息展示能力正在开发中。',
    icon: 'developer_board',
    locked: true,
    hidden: true,
  },
  {
    id: 'meeting-control-screen',
    name: '会议室智控',
    category: 'meeting',
    project: '会议空间',
    desc: '会议设备与空间环境集中控制能力正在开发中。',
    icon: 'settings_remote',
    locked: true,
    hidden: true,
  },
  {
    id: 'wireless-screen',
    name: '无线投屏',
    category: 'meeting',
    project: '会议空间',
    time: '2026-10-10 17:00',
    image: '/images/aspace-one/app-wireless.jpg',
    alt: '无线投屏素材与内容投屏场景',
    url: 'https://info-publish.atuofuture.com/publish/materials',
  },
  {
    id: 'info-publish',
    name: '信息发布平台',
    category: 'content',
    project: '多终端信息发布',
    time: '2026-09-30 18:02',
    image: '/images/aspace-one/app-poster.jpg',
    alt: '信息发布平台场景',
    embedUrl: 'https://info-publish.atuofuture.com/',
  },
  {
    id: 'poster',
    name: 'AI画报',
    category: 'content',
    project: '智能内容创作',
    time: '2026-09-19 10:15',
    image: '/images/aspace-one/app-poster.jpg',
    alt: 'AI画报在平板上的展示效果',
    url: 'http://47.103.102.65:5173/c/atuofuture/',
  },
  {
    id: 'album',
    name: '电子相册',
    category: 'content',
    project: '企业影像展示',
    time: '2026-09-18 16:20',
    image: '/images/aspace-one/app-album.jpg',
    alt: '大屏电子相册多屏展示场景',
    href: '/app-download/',
  },
  {
    id: 'resource',
    name: 'AAP资产管理系统',
    category: 'asset',
    project: '资产全生命周期管理',
    time: '2026-09-18 11:40',
    image: '/images/aspace-one/app-resource.jpg',
    alt: 'AAP 资产管理系统示意',
    url: 'https://zc.atuofuture.com/',
  },
  {
    id: 'energy',
    name: '能源能耗',
    category: 'energy',
    project: '园区能源精细化运营',
    time: '2026-09-20 14:32',
    image: '/images/aspace-one/app-energy.jpg',
    alt: '楼宇能耗看板场景',
    embedUrl: 'http://47.95.170.47:8001/',
  },
  {
    id: 'carbon-management',
    name: '双碳管理',
    category: 'carbon',
    project: '绿色低碳运营',
    time: '2026-10-10 17:26',
    image: '/images/aspace-one/app-energy.jpg',
    alt: '双碳管理与能耗分析场景',
    embedUrl: 'http://47.95.170.47:8001/',
  },
  {
    id: 'access-security',
    name: '门禁安防',
    category: 'security',
    project: '通行权限与安防告警',
    time: '2026-10-10 17:20',
    image: '/images/aspace-one/app-security.jpg',
    alt: '门禁安防通行与识别场景',
    requireDevice: true,
  },
  {
    id: 'aspace',
    name: '空间智能管理平台',
    category: 'foundation',
    group: 'platform',
    project: '空间智能统一底座',
    time: '2026-09-30 18:02',
    image: '/images/aspace-one/showcase-building.jpg',
    alt: '空间智能管理平台场景',
    embedUrl: 'https://aspacedev.atuofuture.com/',
  },
  {
    id: 'device-center',
    name: '设备中心',
    category: 'foundation',
    group: 'base',
    project: '基础能力',
    time: '2026-10-10 17:39',
    image: '/images/aspace-one/showcase-control.jpg',
    alt: '设备中心产品与接入管理场景',
    url: 'https://aspacedev.atuofuture.com/#/device-mgmt/products',
  },
  {
    id: 'space-center',
    name: '空间中心',
    category: 'foundation',
    group: 'base',
    project: '基础能力',
    time: '2026-10-10 17:41',
    image: '/images/aspace-one/showcase-space.jpg',
    alt: '空间中心园区与楼宇空间管理场景',
    url: 'https://aspacedev.atuofuture.com/#/space-list/query',
  },
  {
    id: 'permission-center',
    name: '权限中心',
    category: 'foundation',
    group: 'base',
    project: '基础能力',
    time: '2026-10-10 17:43',
    image: '/images/aspace-one/showcase-building.jpg',
    alt: '权限中心角色与组织权限管理场景',
    url: 'https://aspacedev.atuofuture.com/#/sys-list/info',
  },
  {
    id: 'person-center',
    name: '人员中心',
    category: 'foundation',
    group: 'base',
    project: '基础能力',
    time: '2026-10-10 17:44',
    image: '/images/aspace-one/showcase-meeting.jpg',
    alt: '人员中心组织与角色管理场景',
    url: 'https://aspacedev.atuofuture.com/#/sys-list/role-management',
  },
  {
    id: 'application-center',
    name: '应用中心',
    category: 'foundation',
    group: 'base',
    project: '基础能力',
    desc: '统一应用注册、配置和运行状态管理能力正在建设中。',
    icon: 'apps',
    locked: true,
    hidden: true,
  },
  {
    id: 'smart-lighting',
    name: '智能照明',
    category: 'foundation',
    group: 'control',
    project: '智能控制',
    time: '2026-10-10 17:47',
    image: '/images/aspace-one/showcase-control.jpg',
    alt: '智能照明回路与场景控制场景',
    url: 'https://aspacedev.atuofuture.com/#/device-mgmt/products',
  },
  {
    id: 'smart-air',
    name: '智能空调',
    category: 'foundation',
    group: 'control',
    project: '智能控制',
    time: '2026-10-10 17:47',
    image: '/images/aspace-one/app-control.jpg',
    alt: '智能空调集中控制场景',
    url: 'https://aspacedev.atuofuture.com/#/device-mgmt/products',
  },
  {
    id: 'smart-sensor',
    name: '智能传感',
    category: 'foundation',
    group: 'control',
    project: '智能控制',
    time: '2026-10-10 17:47',
    image: '/images/aspace-one/showcase-space.jpg',
    alt: '智能传感环境感知场景',
    url: 'https://aspacedev.atuofuture.com/#/device-mgmt/products',
  },
  {
    id: 'smart-scene',
    name: '智能场景',
    category: 'foundation',
    group: 'control',
    project: '智能控制',
    time: '2026-10-10 17:48',
    image: '/images/aspace-one/showcase-control.jpg',
    alt: '智能场景编排与联动策略场景',
    url: 'https://aspacedev.atuofuture.com/#/rule-list/query',
  },
  {
    id: 'visitor-booking',
    name: '访客邀约',
    category: 'visitor',
    project: '访客管理',
    time: '2026-10-10 17:30',
    image: '/images/aspace-one/app-visitor.jpg',
    alt: '访客邀约与到访接待场景',
    url: 'http://47.103.102.65:18181/',
  },
]

let appCategories = [
  ['twin', 'deployed_code', '数字孪生', '统一呈现园区、楼宇与空间运行态势'],
  ['meeting', 'groups', '会议管理', '覆盖会前预约、会中控制与会后服务'],
  ['content', 'campaign', '信息发布', '统一管理内容生产、发布与多终端展示'],
  ['asset', 'business_center', '资产管理', '管理资产台账、流转与全生命周期'],
  ['energy', 'eco', '能源能耗', '洞察能源使用、用能异常与节能空间'],
  ['carbon', 'co2', '双碳管理', '支撑碳排核算、分析与减排目标管理'],
  ['security', 'shield_lock', '门禁安防', '统一管理通行权限、事件与安全告警'],
  ['foundation', 'hub', '智能底座', '沉淀空间、设备、人员和智能控制基础能力'],
  ['visitor', 'person_add', '访客管理', '覆盖访客邀约、审批、登记与到访服务'],
]

function visibleApps() {
  return apps.filter((app) => !app.hidden)
}

function appCategoryMeta(categoryId) {
  const category = appCategories.find(([id]) => id === categoryId)
  return category || ['other', 'apps', '其他能力', '']
}

function catalogMeta(categoryId) {
  if (categoryId === 'favorites') return ['star', '我的收藏', '集中查看你收藏的常用业务能力']
  if (categoryId === 'recent') return ['history', '最近访问', '查看你最近进入过的业务能力']
  if (categoryId === 'all') return ['grid_view', '全部业务能力', '按业务场景浏览 Aspace空间智能 已接入和规划中的能力']
  const [, ico, label, description] = appCategoryMeta(categoryId)
  return [ico, label, description]
}

/** 校验应用广场分类 id，非法时回退到全部 */
function resolveAppsCategory(categoryId = '') {
  const id = String(categoryId || '').trim()
  if (!id || id === 'all') return 'all'
  if (id === 'favorites' || id === 'recent') return id
  if (appCategories.some(([category]) => category === id)) return id
  return 'all'
}

/** 点击分类时写入可分享 hash：#/apps?category=twin；全部则用 #/apps */
function syncAppsCategoryInUrl(categoryId, { replace = false } = {}) {
  const resolved = resolveAppsCategory(categoryId)
  const nextHash = buildAspaceHash('apps', {
    category: resolved === 'all' ? '' : resolved,
  })
  const nextUrl = `${aspaceCanonicalPath()}${nextHash}`
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (currentUrl === nextUrl) return
  const state = { asoView: 'apps', appId: '', category: resolved === 'all' ? '' : resolved }
  if (replace) window.history.replaceState(state, '', nextUrl)
  else window.history.pushState(state, '', nextUrl)
}

let favoriteAppIds = new Set(['resource', 'poster', 'digital-twin'])

function loadAppPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem('aspace-one-favorite-apps') || 'null')
    if (Array.isArray(saved)) favoriteAppIds = new Set(saved.filter((id) => apps.some((app) => app.id === id)))
  } catch {
    // 本地偏好损坏时使用默认收藏。
  }
  try {
    const savedCategoryOrder = JSON.parse(localStorage.getItem('aspace-one-category-order') || 'null')
    if (Array.isArray(savedCategoryOrder)) {
      const order = new Map(savedCategoryOrder.map((id, index) => [id, index]))
      appCategories = [...appCategories].sort((left, right) => (
        (order.get(left[0]) ?? Number.MAX_SAFE_INTEGER) - (order.get(right[0]) ?? Number.MAX_SAFE_INTEGER)
      ))
    }
  } catch {
    // 分类顺序损坏时使用产品定义的默认排序。
  }
  try {
    const savedOrder = JSON.parse(localStorage.getItem('aspace-one-capability-order') || '{}')
    const categoryIndex = new Map(appCategories.map(([id], index) => [id, index]))
    apps.sort((left, right) => {
      const categoryDiff = (categoryIndex.get(left.category) ?? 99) - (categoryIndex.get(right.category) ?? 99)
      if (categoryDiff) return categoryDiff
      if (left.group !== right.group) {
        const groups = ['platform', 'base', 'control']
        return groups.indexOf(left.group) - groups.indexOf(right.group)
      }
      const order = Array.isArray(savedOrder[left.category]) ? savedOrder[left.category] : []
      const leftIndex = order.indexOf(left.id)
      const rightIndex = order.indexOf(right.id)
      return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex)
    })
  } catch {
    // 能力顺序损坏时使用产品定义的默认排序。
  }
}

const defaultHelpContent = {
  title: '知识库',
  lead: '搜索知识、获取帮助，让问题更快解决',
  searchPlaceholder: '搜索帮助文档、问题或关键词，例如：如何预约会议室、如何申请权限',
  docsLead: '精选指南与操作说明，快速上手 Aspace空间智能。',
  docsList: structuredClone(defaultDocsListRules),
  hotSearches: ['会议室预约', '权限申请', '能耗数据接入', '电子相册发布'],
  categories: [
    { icon: 'description', name: '全部文档' },
    { icon: 'deployed_code', name: '数字孪生' },
    { icon: 'groups', name: '会议管理' },
    { icon: 'campaign', name: '信息发布' },
    { icon: 'business_center', name: '资产管理' },
    { icon: 'eco', name: '能源能耗' },
    { icon: 'co2', name: '双碳管理' },
    { icon: 'shield_lock', name: '门禁安防' },
    { icon: 'hub', name: '智能底座' },
    { icon: 'person_add', name: '访客管理' },
  ],
  featuredDocs: [
    { title: 'Aspace空间智能快速入门指南', date: '2026-09-12', badge: '新手必读', tone: 'blue', art: 'lines', fileUrl: '' },
    { title: '能源能耗数据接入说明', date: '2026-09-10', badge: '热门文档', tone: 'teal', art: 'chart', fileUrl: '' },
  ],
  docs: [
    { id: 'doc-getting-started', title: 'Aspace空间智能快速入门指南', category: '全部文档', date: '2026-09-12', featured: true, keywords: '权限申请 账号绑定 入门', badge: '新手必读', tone: 'blue', art: 'lines', fileUrl: '' },
    { id: 'doc-energy', title: '能源能耗数据接入说明', category: '能源能耗', date: '2026-09-10', featured: true, keywords: '能耗数据接入 网关 采集', badge: '热门文档', tone: 'teal', art: 'chart', fileUrl: '' },
    { id: 'doc-poster', title: 'AI画报使用手册', category: '信息发布', date: '2026-09-08', featured: false, keywords: '模板 发布', badge: '推荐', tone: 'blue', art: 'lines', fileUrl: '' },
    { id: 'doc-album', title: '电子相册发布流程', category: '信息发布', date: '2026-09-06', featured: false, keywords: '电子相册发布 多屏同步', badge: '推荐', tone: 'blue', art: 'lines', fileUrl: '' },
    { id: 'doc-meeting', title: '会议室预约配置操作指南', category: '会议管理', date: '2026-09-03', featured: false, keywords: '会议室预约 中控屏配置 设备绑定', badge: '推荐', tone: 'blue', art: 'lines', fileUrl: '' },
    { id: 'doc-device-api', title: '设备管理平台 API 文档', category: '智能底座', date: '2026-08-28', featured: false, keywords: '接口 对接', badge: '推荐', tone: 'blue', art: 'lines', fileUrl: '' },
    { id: 'doc-delivery', title: '项目实施规范', category: '智能底座', date: '2026-08-20', featured: false, keywords: '权限申请 交付 验收', badge: '推荐', tone: 'blue', art: 'lines', fileUrl: '' },
  ],
  updates: [
    { date: '2026-09-12', title: 'Aspace空间智能快速入门指南', desc: '权限申请 账号绑定 入门' },
    { date: '2026-09-10', title: '能源能耗数据接入说明', desc: '能耗数据接入 网关 采集' },
    { date: '2026-09-08', title: 'AI画报使用手册', desc: '模板 发布' },
    { date: '2026-09-06', title: '电子相册发布流程', desc: '电子相册发布 多屏同步' },
    { date: '2026-09-03', title: '会议室预约配置操作指南', desc: '会议室预约 中控屏配置 设备绑定' },
  ],
  support: {
    title: '有任何问题，请联系我们的客服人员',
    subtitle: '留下手机号，客服将尽快与您联系',
  },
}

let helpContent = structuredClone(defaultHelpContent)
let docs = helpContent.docs.map((item) => ({ ...item }))
let docCategories = helpContent.categories.map((item) => [item.icon, item.name])
let hotSearches = [...helpContent.hotSearches]
let featuredDocs = helpContent.featuredDocs.map((item) => ({ ...item }))
let updates = helpContent.updates.map((item) => [item.date, item.title, item.desc])

const defaultQuickActions = [
  { id: 'energy', icon: 'bar_chart', label: '查看今日能耗', url: 'app:energy' },
  { id: 'poster', icon: 'add_photo_alternate', label: '新建AI画报', url: 'app:poster' },
  { id: 'album', icon: 'collections', label: '更新电子相册', url: 'app:album' },
  { id: 'screen', icon: 'desktop_windows', label: '预约会议室', url: 'app:screen' },
  { id: 'report', icon: 'description', label: '导出运营报表', url: '' },
  { id: 'permission', icon: 'person_add', label: '申请产品权限', url: '' },
]
let quickActions = defaultQuickActions.map((item) => ({ ...item }))
let recentActivities = []
const RECENT_PAGE_SIZE = 5
let recentPage = 1
let portalAuthError = ''

function icon(name, className = '') {
  if (/^(?:https?:\/\/|\/)/i.test(name || '')) {
    return `<img class="aso-custom-icon ${className}" src="${escapeHtml(name)}" alt="" aria-hidden="true" />`
  }
  return `<span class="material-symbols-outlined ${className}" aria-hidden="true">${name}</span>`
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])
}

function quickActionsMarkup() {
  return quickActions.map(({ icon: ico, label, id, url }) => `
    <button class="aso-action" type="button" data-quick-action="${escapeHtml(id)}" data-quick-url="${escapeHtml(url)}">
      ${icon(ico)}<span>${escapeHtml(label)}</span><i>${icon('chevron_right')}</i>
    </button>`).join('')
}

function quickSettingsRowsMarkup() {
  return quickActions.map(({ id, icon: ico, label, url }) => `
    <div class="aso-quick-settings__row" data-quick-row="${escapeHtml(id)}">
      <span class="aso-quick-settings__icon">${icon(ico)}</span>
      <label>文案<input type="text" maxlength="40" value="${escapeHtml(label)}" data-quick-label required /></label>
      <label>链接<input type="text" maxlength="500" value="${escapeHtml(url)}" data-quick-link placeholder="https://…、/站内路径 或 app:应用ID" /></label>
    </div>`).join('')
}

function formatActivityDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function recentPageCount() {
  return Math.max(1, Math.ceil(recentActivities.length / RECENT_PAGE_SIZE) || 1)
}

function recentPagerMarkup(page, totalPages) {
  if (totalPages <= 1) return ''
  const pages = []
  const pushPage = (value) => {
    if (pages[pages.length - 1] === value) return
    pages.push(value)
  }
  pushPage(1)
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i += 1) pushPage(i)
  pushPage(totalPages)
  let markup = `
    <nav class="aso-recent-pager" aria-label="最近访问分页">
      <button type="button" data-recent-page="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="上一页">${icon('chevron_left')}</button>`
  let previous = 0
  pages.forEach((item) => {
    if (previous && item - previous > 1) markup += `<span class="aso-recent-pager__ellipsis">…</span>`
    markup += `
      <button type="button" class="${item === page ? 'is-active' : ''}" data-recent-page="${item}" aria-label="第 ${item} 页" aria-current="${item === page ? 'page' : 'false'}">${item}</button>`
    previous = item
  })
  markup += `
      <button type="button" data-recent-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''} aria-label="下一页">${icon('chevron_right')}</button>
    </nav>`
  return markup
}

function recentVisitsMarkup() {
  if (!recentActivities.length) {
    recentPage = 1
    return `
      <div class="aso-recent-panel__empty">
        ${icon('history')}
        <b>暂无最近访问</b>
        <p>进入应用或使用具体功能后，访问记录会显示在这里。</p>
      </div>`
  }
  const totalPages = recentPageCount()
  recentPage = Math.min(Math.max(1, recentPage), totalPages)
  const start = (recentPage - 1) * RECENT_PAGE_SIZE
  const pageItems = recentActivities.slice(start, start + RECENT_PAGE_SIZE)
  const list = pageItems.map((activity, offset) => {
    const index = start + offset
    const app = apps.find((item) => item.id === activity.appId)
    return `
      <button class="aso-recent-visit${index === 0 ? ' is-latest' : ''}" type="button" data-recent-activity="${index}">
        <img src="${escapeHtml(app?.image || '/images/aspace-one/showcase-space.jpg')}" alt="" width="112" height="72" loading="lazy" />
        <span class="aso-recent-visit__copy">
          <em>${index === 0 ? '最近访问' : '访问记录'}</em>
          <b>${escapeHtml(activity.feature || `进入${app?.name || '应用'}首页`)}</b>
          <small>${escapeHtml(activity.appName || app?.name || '应用系统')} · ${escapeHtml(activity.project || app?.project || '')}</small>
          <time>${icon('schedule')}${escapeHtml(formatActivityDate(activity.createdAt))}</time>
        </span>
        ${icon('arrow_forward', 'aso-recent-visit__arrow')}
      </button>`
  }).join('')
  return `<div class="aso-recent-panel__grid">${list}</div>${recentPagerMarkup(recentPage, totalPages)}`
}

function appCard(app, index) {
  const locked = Boolean(app.locked)
  const [, categoryIcon, categoryLabel] = appCategoryMeta(app.category)
  const isFavorite = favoriteAppIds.has(app.id)
  return `
      <article class="aso-app-card${locked ? ' is-locked' : ''}" draggable="true" data-app="${app.id}" data-app-state="${locked ? 'locked' : 'open'}" data-app-category="${escapeHtml(app.category)}" data-capability-group="${escapeHtml(app.group || '')}" data-app-search="${escapeHtml(`${app.name} ${app.project} ${categoryLabel}`.toLowerCase())}">
        <figure class="aso-app-card__shot">
          ${locked
            ? `<span class="aso-app-card__developing-art">${icon(app.icon || 'construction')}<b>开发中</b><small>COMING SOON</small></span>`
            : `<img src="${app.image}" alt="${app.alt}" width="640" height="400" loading="eager" decoding="async" fetchpriority="${index < 6 ? 'high' : 'auto'}" />`}
          <span class="aso-status${locked ? ' aso-status--idle' : ''}"><i></i>${locked ? '开发中' : '运行中'}</span>
          <button class="aso-app-favorite${isFavorite ? ' is-active' : ''}" type="button" data-favorite-app="${app.id}" aria-label="${isFavorite ? '取消收藏' : '收藏'}${escapeHtml(app.name)}" aria-pressed="${isFavorite}">
            ${icon('star')}
          </button>
        </figure>
        <div class="aso-app-card__copy">
          <h3>${app.name}</h3>
          ${locked
            ? `<p class="aso-app-card__desc">${app.desc}</p>`
            : `<p data-app-project>${app.project}</p>
          <div class="aso-app-card__meta">
            <span class="aso-app-card__category">${icon(categoryIcon)} ${categoryLabel}</span>
            <small>最近使用 · ${app.time}</small>
            ${app.warning ? `<span class="aso-status aso-status--warn"><i></i>${app.warning}</span>` : ''}
          </div>`}
        </div>
        ${locked
          ? `<button class="aso-btn aso-btn--muted" type="button" disabled>${icon('construction')} 开发中</button>`
          : `<button class="aso-btn aso-btn--primary" type="button" data-enter-app="${app.id}">进入功能 ${icon('arrow_forward')}</button>`}
      </article>`
}

function capabilityGroupHeadingsMarkup() {
  return `
    <div class="aso-capability-group" data-capability-group-heading="base" hidden>
      <span>${icon('account_tree')}</span>
      <div><b>基础能力</b><small>设备、空间、权限、人员与应用的统一数据底座</small></div>
    </div>
    <div class="aso-capability-group" data-capability-group-heading="control" hidden>
      <span>${icon('settings_input_component')}</span>
      <div><b>智能控制</b><small>面向照明、空调、传感与场景的联动控制能力</small></div>
    </div>`
}

function docRows(category = '全部文档', keyword = '') {
  const filtered = resolveHelpDocList(docs, helpContent.docsList || defaultDocsListRules, { category, keyword })
  if (!filtered.length) return '<p class="aso-empty">没有找到匹配的文档。</p>'
  return filtered.map((item) => `
    <button class="aso-doc-row" type="button" data-doc="${escapeHtml(item.title)}" data-doc-id="${escapeHtml(item.id || '')}" data-doc-url="${escapeHtml(item.fileUrl || '')}">
      <i>${icon('description')}</i>
      <span class="aso-doc-row__title">${escapeHtml(item.title)}</span>
      <time>${escapeHtml(item.date)}</time>
      ${icon('chevron_right')}
    </button>`).join('')
}

function portalAccountMarkup() {
  const user = window.ASPACE_CURRENT_USER
  if (user?.id) {
    const name = String(user.name || user.displayName || user.email || '已登录')
    return `
      <div class="aso-shell__account-menu" data-aso-account-menu>
        <button type="button" class="aso-shell__account is-logged-in" data-aso-account-toggle aria-expanded="false" aria-haspopup="menu" title="${escapeHtml(name)}">
          <span class="aso-shell__avatar">${escapeHtml(name.slice(0, 1))}</span>
          <span>${escapeHtml(name)}</span>
          ${icon('expand_more')}
        </button>
        <div class="aso-shell__account-dropdown" data-aso-account-dropdown hidden role="menu">
          <button type="button" role="menuitem" data-aso-logout>退出登录</button>
        </div>
      </div>`
  }
  return `
    <button type="button" class="aso-shell__account" data-personal-login>
      ${icon('person')}
      <span>登录</span>
    </button>`
}

function setAccountMenuOpen(root, open) {
  const menu = root.querySelector('[data-aso-account-menu]')
  const toggle = root.querySelector('[data-aso-account-toggle]')
  const dropdown = root.querySelector('[data-aso-account-dropdown]')
  if (!menu || !toggle || !dropdown) return
  menu.classList.toggle('is-open', open)
  toggle.setAttribute('aria-expanded', String(open))
  dropdown.hidden = !open
}

async function logoutPortalAccount() {
  let idToken = ''
  try {
    const tokens = readPortalTokens()
    idToken = String(tokens?.id_token || '')
  } catch {
    idToken = ''
  }
  clearPortalTokens()
  sessionStorage.removeItem('aspace-one-oidc-pending')
  window.ASPACE_CURRENT_USER = null

  // 有 id_token 时走统一认证静默退出（服务端已取消确认页）；否则直接回首页
  if (idToken) {
    const endUrl = new URL('/auth/session/end', window.location.origin)
    endUrl.searchParams.set('id_token_hint', idToken)
    endUrl.searchParams.set('client_id', 'aspace-one')
    endUrl.searchParams.set('post_logout_redirect_uri', `${window.location.origin}/aspace-one/`)
    window.location.replace(endUrl.toString())
    return
  }
  window.location.replace('/aspace-one/')
}

function renderShellHeader(activeView = 'home') {
  const items = [
    ['home', '首页'],
    ['apps', '应用广场'],
    ['help', '知识库'],
    ['about', '关于我们'],
  ]
  return `
    <header class="aso-shell">
      <div class="aso-shell__inner">
        <a class="aso-shell__brand" href="/" title="返回官网首页">
          <img src="/assets/artink-logo-light.png" alt="Artink 安墨客" width="120" height="28" />
          <span>空间智能应用平台</span>
        </a>
        <nav class="aso-shell__nav" aria-label="门户导航">
          ${items.map(([id, label]) => `
          <button type="button" class="${id === activeView ? 'is-active' : ''}" data-aso-nav="${id}" aria-current="${id === activeView ? 'page' : 'false'}">${label}</button>`).join('')}
        </nav>
        <div class="aso-shell__actions">
          ${portalAccountMarkup()}
          <button type="button" class="aso-shell__menu" data-aso-menu aria-label="打开菜单">${icon('menu')}</button>
        </div>
      </div>
    </header>`
}

const defaultHomeContent = {
  hero: {
    background: 'https://img.alicdn.com/imgextra/i2/52311814/O1CN01rXdBocv2JPBCHL4y_!!52311814.png',
    title: '连接空间业务\n让智能应用触手可及',
    primaryCta: '浏览应用广场',
    secondaryCta: '探索业务场景',
  },
  panorama: {
    title: '业务全景',
    lead: '从日常办公到空间运营，能力按业务链路串联协同。',
    moreLabel: '查看全部能力',
    items: [
      { id: 'collab', step: '01', stage: '协同', image: '/images/aspace-one/showcase-meeting.jpg', href: '', title: '会议与办公', desc: '提升空间使用效率', items: [{ category: 'meeting', label: '会议预约', appId: 'screen' }, { category: 'meeting', label: '智能门牌', appId: 'deskplate' }, { category: 'meeting', label: '会议控制', appId: 'wireless-screen' }] },
      { id: 'asset', step: '02', stage: '资产', image: '/images/aspace-one/app-resource.jpg', href: '', title: '资产与仓储', desc: '掌握资产全生命周期', items: [{ category: 'asset', label: '资产台账', appId: 'resource' }, { category: 'asset', label: 'RFID盘点', appId: 'resource' }, { category: 'asset', label: '借还管理', appId: 'resource' }] },
      { id: 'ops', step: '03', stage: '运维', image: '/images/aspace-one/app-energy.jpg', href: '', title: '设备与能源', desc: '看清运行与能源使用', items: [{ category: 'foundation', label: '设备监测', appId: 'device-center' }, { category: 'foundation', label: '空调控制', appId: 'smart-air' }, { category: 'energy', label: '能耗分析', appId: 'energy' }] },
      { id: 'service', step: '04', stage: '服务', image: '/images/aspace-one/showcase-building.jpg', href: '', title: '通行与服务', desc: '连接人员与日常服务', items: [{ category: 'visitor', label: '访客接待', appId: 'visitor-booking' }, { category: 'security', label: '门禁通行', appId: 'access-security' }, { category: 'foundation', label: '工单巡检', appId: 'aspace' }] },
      { id: 'insight', step: '05', stage: '洞察', image: '/images/aspace-one/showcase-space.jpg', href: '', title: '可视化与展示', desc: '让空间状态清晰可见', items: [{ category: 'twin', label: '数字孪生', appId: 'digital-twin' }, { category: 'content', label: '信息发布', appId: 'info-publish' }, { category: 'content', label: '电子相框', appId: 'album' }] },
    ],
  },
  scenes: {
    title: '从你的业务场景开始',
    lead: '围绕实际需求，发现可以协同使用的应用。',
    items: [
      { id: 'office', label: '企业办公', title: '让办公空间高效运转', lead: '连接会议、资产与日常服务，提升办公体验与管理效率。', image: '/images/aspace-one/showcase-meeting.jpg', apps: [{ id: 'screen', label: '会议预约', icon: 'calendar_month' }, { id: 'resource', label: '资产管理', icon: 'view_in_ar' }, { id: 'info-publish', label: '信息发布', icon: 'description' }] },
      { id: 'campus', label: '园区楼宇', title: '让园区运行状态一目了然', lead: '以数字孪生串联楼宇、设备与能耗，支撑运营调度与态势感知。', image: '/images/aspace-one/showcase-building.jpg', apps: [{ id: 'digital-twin', label: '数字孪生', icon: 'deployed_code' }, { id: 'energy', label: '能源能耗', icon: 'eco' }, { id: 'aspace', label: '空间管理', icon: 'hub' }] },
      { id: 'factory', label: '生产制造', title: '让产线周边空间更可控', lead: '把设备状态、环境控制与安全通行纳入统一门户，缩短现场响应链路。', image: '/images/aspace-one/showcase-control.jpg', apps: [{ id: 'device-center', label: '设备中心', icon: 'devices_other' }, { id: 'smart-sensor', label: '智能传感', icon: 'sensors' }, { id: 'access-security', label: '门禁安防', icon: 'shield_lock' }] },
      { id: 'warehouse', label: '智慧仓储', title: '让资产流转更清晰可追溯', lead: '从台账到借还、盘点，帮助仓储与行政团队掌握物资位置与状态。', image: '/images/aspace-one/app-resource.jpg', apps: [{ id: 'resource', label: '资产管理', icon: 'inventory_2' }, { id: 'visitor-booking', label: '访客邀约', icon: 'person_add' }, { id: 'info-publish', label: '信息发布', icon: 'campaign' }] },
    ],
  },
  infra: {
    title: '连接空间业务、覆盖多场景的智能应用能力',
    cta: '浏览应用广场',
    stats: [
      { value: '20', unit: '+', label: '空间智能应用' },
      { value: '9', unit: '', label: '业务能力分类' },
      { value: '300', unit: '+', label: '典型落地场景' },
      { value: '10000', unit: '+', label: '业务协同链路' },
    ],
  },
}

let homeContent = structuredClone(defaultHomeContent)

function heroTitleMarkup(title) {
  return String(title || '').split(/\n+/).filter(Boolean).map((line) => escapeHtml(line)).join('<br />')
}

function renderHomeView() {
  const { hero, panorama, scenes, infra } = homeContent
  return `
    <section class="aso-home" data-aso-view="home">
      <section class="aso-home-hero">
        <img class="aso-home-hero__bg" src="${escapeHtml(hero.background)}" alt="" decoding="async" fetchpriority="high" />
        <div class="aso-home-hero__shade" aria-hidden="true"></div>
        <div class="aso-container aso-home-hero__content">
          <div class="aso-home-hero__copy">
            <h1>${heroTitleMarkup(hero.title)}</h1>
          </div>
        </div>
        <div class="aso-home-hero__cta">
          <button type="button" class="aso-btn aso-btn--primary" data-aso-nav="apps">${escapeHtml(hero.primaryCta)} ${icon('arrow_forward')}</button>
          <button type="button" class="aso-btn aso-btn--hero-ghost" data-home-scroll="scenes">${escapeHtml(hero.secondaryCta)}</button>
        </div>
      </section>

      <section class="aso-home-panorama" data-panorama-flow>
        <div class="aso-container">
          <header class="aso-home-panorama__head">
            <div>
              <h2>${escapeHtml(panorama.title)}</h2>
              <p>${escapeHtml(panorama.lead)}</p>
            </div>
            <button type="button" class="aso-home-panorama__more" data-aso-nav="apps">${escapeHtml(panorama.moreLabel)} ${icon('north_east')}</button>
          </header>
          <div class="aso-home-panorama__flow">
            ${panorama.items.map((column, index) => `
            <article class="aso-home-panorama__node" style="--aso-delay: ${index * 90}ms">
              ${index > 0 ? `
              <span class="aso-home-panorama__bridge" aria-hidden="true">
                <svg class="aso-home-panorama__bridge-svg" viewBox="0 0 56 24" fill="none">
                  <path class="aso-home-panorama__track" d="M2 12h38" />
                  <path class="aso-home-panorama__flow" d="M2 12h38" />
                  <path class="aso-home-panorama__pulse" d="M2 12h38" />
                  <path class="aso-home-panorama__tip" d="M40 6.5 50 12 40 17.5" />
                </svg>
              </span>` : ''}
              <div class="aso-home-panorama__card">
                ${(() => {
                  const href = String(column.href || '').trim()
                  const first = column.items?.[0]
                  const mediaAttrs = href
                    ? `data-panorama-href="${escapeHtml(href)}" role="link" tabindex="0" aria-label="${escapeHtml(column.title)}"`
                    : `data-aso-nav="apps" data-app-category-goto="${escapeHtml(first?.category || '')}" data-app-goto="${escapeHtml(first?.appId || '')}" role="link" tabindex="0" aria-label="${escapeHtml(column.title)}"`
                  return `
                <figure class="aso-home-panorama__media is-link" ${mediaAttrs}>
                  <img src="${escapeHtml(column.image)}" alt="" loading="lazy" />
                  <header>
                    <em>${escapeHtml(column.step)}</em>
                    <b>${escapeHtml(column.stage)}</b>
                  </header>
                </figure>`
                })()}
                <div class="aso-home-panorama__body">
                  <h3>${escapeHtml(column.title)}</h3>
                  <p>${escapeHtml(column.desc)}</p>
                  <ul>
                    ${column.items.map((link) => `
                    <li>
                      <button type="button" data-aso-nav="apps" data-app-category-goto="${escapeHtml(link.category)}" data-app-goto="${escapeHtml(link.appId || '')}">
                        <span>${escapeHtml(link.label)}</span>
                        ${icon('arrow_forward')}
                      </button>
                    </li>`).join('')}
                  </ul>
                </div>
              </div>
            </article>`).join('')}
          </div>
        </div>
      </section>

      <section class="aso-home-scenes" id="aso-home-scenes" data-home-scenes>
        <div class="aso-container">
          <header class="aso-home-section__head">
            <div>
              <h2>${escapeHtml(scenes.title)}</h2>
              <p>${escapeHtml(scenes.lead)}</p>
            </div>
          </header>
          <div class="aso-home-scenes__tabs" role="tablist" aria-label="业务场景">
            ${scenes.items.map((scene, index) => `
            <button type="button" role="tab" class="${index === 0 ? 'is-active' : ''}" aria-selected="${index === 0 ? 'true' : 'false'}" data-home-scene="${escapeHtml(scene.id)}">${escapeHtml(scene.label)}</button>`).join('')}
          </div>
          ${scenes.items.map((scene, index) => `
          <div class="aso-home-scenes__panel${index === 0 ? ' is-active' : ''}" data-home-scene-panel="${escapeHtml(scene.id)}" ${index === 0 ? '' : 'hidden'}>
            <article class="aso-home-scenes__card">
              <figure class="aso-home-scenes__media">
                <img src="${escapeHtml(scene.image)}" alt="" loading="lazy" />
              </figure>
              <div class="aso-home-scenes__body">
                <p class="aso-home-scenes__label">${escapeHtml(scene.label)}</p>
                <h3>${escapeHtml(scene.title)}</h3>
                <p class="aso-home-scenes__lead">${escapeHtml(scene.lead)}</p>
                <ul class="aso-home-scenes__apps">
                  ${scene.apps.map((app) => `
                  <li>
                    <button type="button" data-enter-app="${escapeHtml(app.id)}">
                      <i>${icon(app.icon)}</i>
                      <strong>${escapeHtml(app.label)}</strong>
                      ${icon('chevron_right')}
                    </button>
                  </li>`).join('')}
                </ul>
                <button type="button" class="aso-home-scenes__link" data-aso-nav="apps">查看相关应用 ${icon('arrow_forward')}</button>
              </div>
            </article>
          </div>`).join('')}
        </div>
      </section>

      <section class="aso-home-infra" data-home-globe>
        <div class="aso-container aso-home-infra__content">
          <h2>${escapeHtml(infra.title)}</h2>
          <ul class="aso-home-infra__stats">
            ${infra.stats.map((stat) => `
            <li>
              <strong><em>${escapeHtml(stat.value)}</em>${stat.unit ? `<span>${escapeHtml(stat.unit)}</span>` : ''}</strong>
              <p>${escapeHtml(stat.label)}</p>
            </li>`).join('')}
          </ul>
          <button type="button" class="aso-home-infra__cta" data-aso-nav="apps">${escapeHtml(infra.cta)} ${icon('north_east')}</button>
        </div>
        <div class="aso-home-infra__globe" aria-hidden="true">
          <canvas data-home-globe-canvas></canvas>
        </div>
      </section>

    </section>`
}

function renderPortalFooter() {
  return renderSiteFooter()
}

function renderAboutView() {
  return `
    <section class="aso-about" data-aso-view="about" hidden>
      <div id="aso-about-root" class="aso-about__embed" aria-live="polite">
        <p class="aso-about__loading">正在加载关于我们…</p>
      </div>
    </section>`
}

async function initAboutEmbed(root) {
  const host = root.querySelector('#aso-about-root')
  if (!host || host.dataset.ready === '1') return
  host.dataset.ready = '1'
  try {
    mountAboutContent(host, await fetchAboutPageContent())
  } catch {
    host.innerHTML = '<p class="aso-about__loading">关于我们内容加载失败，请稍后重试。</p>'
    host.dataset.ready = '0'
  }
}

function scrollAboutSection(root, sectionId = 'intro') {
  const target = root.querySelector(`#${CSS.escape(sectionId)}`)
  if (!target) {
    window.scrollTo({ top: 0, behavior: 'auto' })
    return
  }
  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function renderPortal() {
  return `
    <div class="aso-page aso-page--shell">
      ${renderShellHeader('home')}
      ${renderHomeView()}
      <div data-aso-view="apps" hidden>
      <section class="aso-hero" id="overview">
        <div class="aso-container aso-apps" id="apps">
          <header class="aso-overview-head">
            <div class="aso-overview-head__intro">
              <p class="aso-eyebrow">ASPACE OVERVIEW</p>
              <h1>Aspace功能全览</h1>
              <p>统一浏览空间智能业务能力与应用服务</p>
            </div>
            <div class="aso-overview-head__find">
              <form class="aso-search" data-app-search-form>
                ${icon('search')}
                <input type="search" data-app-search-input aria-label="搜索业务能力" placeholder="搜索能力名称、业务场景或分类，例如：会议预约、能源能耗" />
                <button type="submit">搜索</button>
              </form>
              <div class="aso-hot">
                <span>热门搜索：</span>
                ${['会议管理', '资产管理', '数字孪生', '能源能耗'].map((word) => `<button type="button" data-app-search-hot="${word}">${word}</button>`).join('')}
              </div>
            </div>
            <figure class="aso-overview-deco" aria-hidden="true">
              <i class="aso-overview-deco__back"></i>
              <i class="aso-overview-deco__building">
                <span></span><span></span><span></span><span></span>
                <b></b>
              </i>
            </figure>
          </header>
          <div class="aso-app-center">
            <aside class="aso-app-sidebar" aria-label="业务导航">
              <nav>
                <button type="button" data-app-category-filter="favorites">
                  ${icon('star')}<span>我的收藏</span><i data-favorite-count>${favoriteAppIds.size}</i>
                </button>
                <button class="is-active" type="button" data-app-category-filter="all" aria-current="true">
                  ${icon('grid_view')}<span>全部能力</span><i>${visibleApps().length}</i>
                </button>
                <button type="button" data-app-category-filter="recent">
                  ${icon('history')}<span>最近访问</span><i data-recent-count>${recentActivities.length}</i>
                </button>
              </nav>
              <div class="aso-app-sidebar__divider"></div>
              <p><span>业务分类</span><small title="登录后可拖动分类或能力卡片调整顺序">${icon('drag_indicator')}拖拽排序</small></p>
              <nav data-business-category-nav>
                ${appCategories.map(([id, ico, label]) => `
                <button type="button" draggable="true" data-app-category-filter="${id}" title="登录后可拖拽调整分类顺序">
                  ${icon(ico)}<span>${label}</span>${icon('drag_indicator', 'aso-category-drag')}<i>${visibleApps().filter((app) => app.category === id).length}</i>
                </button>`).join('')}
              </nav>
            </aside>

            <div class="aso-app-catalog">
              <header class="aso-app-catalog__heading">
                <div>
                  <h2 data-catalog-title>全部业务能力</h2>
                  <p data-catalog-description>按业务场景浏览 Aspace空间智能 已接入和规划中的能力</p>
                </div>
                <div class="aso-app-controls-right">
                  <label class="aso-app-sort">
                    ${icon('schedule')}
                    <select data-app-sort aria-label="业务能力排序">
                      <option value="default">自定义排序</option>
                      <option value="recent">最近使用</option>
                      <option value="name">按名称</option>
                    </select>
                  </label>
                  <div class="aso-app-view" aria-label="切换应用视图">
                    <button class="is-active" type="button" data-app-view="grid" aria-label="网格视图" aria-pressed="true">${icon('grid_view')}</button>
                    <button type="button" data-app-view="list" aria-label="列表视图" aria-pressed="false">${icon('view_list')}</button>
                  </div>
                </div>
              </header>

              <div class="aso-app-grid" data-app-grid>${visibleApps().map(appCard).join('')}${capabilityGroupHeadingsMarkup()}</div>
              <p class="aso-empty aso-app-grid__empty" data-app-empty hidden>没有找到符合条件的业务能力。</p>
            </div>
            <section class="aso-recent-panel" data-recent-panel hidden>
              <header>
                <div>
                  <p class="aso-eyebrow">RECENT ACTIVITY</p>
                  <h2>最近访问</h2>
                  <p>按时间查看你最近进入的系统与使用过的功能，最新记录排在最前。</p>
                </div>
                <div class="aso-recent-panel__account">
                  <span>共 <b data-recent-panel-count>${recentActivities.length}</b> 条记录</span>
                </div>
              </header>
              <div class="aso-recent-panel__body" data-recent-visits>
                ${recentVisitsMarkup()}
              </div>
            </section>
          </div>
        </div>
      </section>

      <section class="aso-help aso-section" id="help" hidden>
        <div class="aso-container">
          <header class="aso-help__head">
            <div class="aso-help__intro">
              <p class="aso-eyebrow">HELP CENTER</p>
              <h2>${escapeHtml(helpContent.title || '知识库')}</h2>
              <p class="aso-help__lead">${escapeHtml(helpContent.lead || '')}</p>
            </div>
            <div class="aso-help__find">
              <form class="aso-search" data-help-search>
                ${icon('search')}
                <input type="search" aria-label="搜索文档" placeholder="${escapeHtml(helpContent.searchPlaceholder || '')}" />
                <button type="submit">搜索</button>
              </form>
              <div class="aso-hot">
                <span>热门搜索：</span>
                ${hotSearches.map((word) => `<button type="button" data-hot-search="${escapeHtml(word)}">${escapeHtml(word)}</button>`).join('')}
              </div>
            </div>
            <figure class="aso-help__deco" aria-hidden="true">
              <i class="aso-help__deco-back"></i>
              <i class="aso-help__deco-page"><span></span><span></span><span></span></i>
            </figure>
          </header>
          <div class="aso-help__grid">
            <nav class="aso-doc-cats" aria-label="文档分类">
              ${docCategories.map(([ico, name], index) => `<button class="${index === 0 ? 'is-active' : ''}" type="button" data-doc-category="${escapeHtml(name)}">${icon(ico)}<span>${escapeHtml(name)}</span></button>`).join('')}
            </nav>
            <div class="aso-docs">
              <h3>文档中心</h3>
              <p class="aso-docs__lead">${escapeHtml(helpContent.docsLead || '')}</p>
              <div class="aso-docs__feature">
                ${featuredDocs
                  .map(
                    (doc) => `
                <button class="aso-doc-card aso-doc-card--${escapeHtml(doc.tone)}" type="button" data-doc="${escapeHtml(doc.title)}" data-doc-id="${escapeHtml(doc.id || '')}" data-doc-url="${escapeHtml(doc.fileUrl || '')}">
                  <span class="aso-doc-art aso-doc-art--${escapeHtml(doc.art)}" aria-hidden="true">
                    <i class="aso-doc-art__back"></i>
                    <i class="aso-doc-art__page"><span></span><span></span><span></span><span></span></i>
                  </span>
                  <span class="aso-doc-card__copy">
                    <em>${escapeHtml(doc.badge)}</em>
                    <b>${escapeHtml(doc.title)}</b>
                    <time>${escapeHtml(doc.date)}</time>
                  </span>
                  <i class="aso-doc-card__go">${icon('chevron_right')}</i>
                </button>`
                  )
                  .join('')}
              </div>
              <div class="aso-doc-list" data-doc-list>${docRows()}</div>
            </div>
            <aside class="aso-updates">
              <header><h3>${icon('campaign')} 最新更新</h3><button type="button" data-show-all>查看更多 ${icon('arrow_forward')}</button></header>
              <ol class="aso-updates__list">
                ${updates.map(([date, title, desc, id, fileUrl]) => `
                  <li>
                    <time>${escapeHtml(date)}</time>
                    <div>
                      <button type="button" class="aso-updates__doc" data-doc="${escapeHtml(title)}" data-doc-id="${escapeHtml(id || '')}" data-doc-url="${escapeHtml(fileUrl || '')}">
                        <b>${escapeHtml(title)}</b>
                        <p>${escapeHtml(desc)}</p>
                      </button>
                    </div>
                  </li>`).join('') || '<li class="aso-empty">暂无文档更新</li>'}
              </ol>
            </aside>
          </div>
          <button class="aso-support-cta" id="support" type="button" data-contact-open>
            <span class="aso-support-cta__icon">${icon('headset_mic')}</span>
            <span class="aso-support-cta__copy">
              <b>${escapeHtml(helpContent.support?.title || '')}</b>
              <small>${escapeHtml(helpContent.support?.subtitle || '')}</small>
            </span>
            <span class="aso-support-cta__action">立即联系 ${icon('arrow_forward')}</span>
          </button>
        </div>
      </section>
      </div>
      ${renderAboutView()}
      ${renderPortalFooter()}

      <div class="aso-toast" role="status" data-aso-toast aria-hidden="true"></div>
      <div class="aso-device-modal" data-device-modal hidden aria-hidden="true">
        <div class="aso-device-modal__backdrop" data-device-modal-close></div>
        <section class="aso-device-modal__panel" role="dialog" aria-modal="true" aria-labelledby="aso-device-modal-title">
          <div class="aso-device-modal__scan" aria-hidden="true"></div>
          <div class="aso-device-modal__ring" aria-hidden="true"><i></i><i></i><i></i></div>
          <button type="button" class="aso-device-modal__close" data-device-modal-close aria-label="关闭">${icon('close')}</button>
          <div class="aso-device-modal__badge">${icon('sensors')}</div>
          <p class="aso-device-modal__eyebrow">ACCESS SECURITY</p>
          <h2 id="aso-device-modal-title">请接入设备</h2>
          <p>尚未检测到可用门禁终端。接入读卡器、闸机或识别设备后，即可开通通行权限与安防告警能力。</p>
          <ul class="aso-device-modal__signals" aria-hidden="true">
            <li><span></span>设备探测中</li>
            <li><span></span>通道链路待命</li>
            <li><span></span>等待终端上线</li>
          </ul>
          <button type="button" class="aso-device-modal__action" data-device-modal-close>我知道了</button>
        </section>
      </div>
      <div class="aso-invite-modal" data-invite-modal hidden aria-hidden="true">
        <div class="aso-invite-modal__backdrop" data-invite-modal-close></div>
        <section class="aso-invite-modal__panel" role="dialog" aria-modal="true" aria-labelledby="aso-invite-modal-title">
          <div class="aso-invite-modal__glow" aria-hidden="true"></div>
          <div class="aso-invite-modal__orbit" aria-hidden="true"><i></i><i></i></div>
          <button type="button" class="aso-invite-modal__close" data-invite-modal-close aria-label="关闭">${icon('close')}</button>
          <header class="aso-invite-modal__head">
            <div class="aso-invite-modal__badge">${icon('person_add')}</div>
            <div>
              <p class="aso-invite-modal__eyebrow">VISITOR INVITE</p>
              <h2 id="aso-invite-modal-title">访客邀约</h2>
              <p>填写访客信息，一键发起邀约并生成到访通行凭证。</p>
            </div>
          </header>
          <form class="aso-invite-modal__form" data-invite-form>
            <div class="aso-invite-modal__grid">
              <label>
                <span>访客姓名</span>
                <input name="guestName" type="text" required maxlength="40" placeholder="请输入姓名" autocomplete="name" />
              </label>
              <label>
                <span>手机号</span>
                <input name="guestPhone" type="tel" required maxlength="11" pattern="1[3-9]\\d{9}" placeholder="11 位手机号" inputmode="numeric" />
              </label>
              <label>
                <span>来访单位</span>
                <input name="guestOrg" type="text" maxlength="60" placeholder="公司 / 机构名称" />
              </label>
              <label>
                <span>被访人</span>
                <input name="hostName" type="text" required maxlength="40" placeholder="接待同事姓名" />
              </label>
              <label>
                <span>到访日期</span>
                <input name="visitDate" type="date" required />
              </label>
              <label>
                <span>预计到访</span>
                <input name="visitTime" type="time" required />
              </label>
              <label class="aso-invite-modal__full">
                <span>来访事由</span>
                <input name="purpose" type="text" required maxlength="80" placeholder="例如：商务洽谈、项目对接、参观交流" />
              </label>
            </div>
            <div class="aso-invite-modal__steps" aria-hidden="true">
              <span class="is-active"><i></i>填写信息</span>
              <span><i></i>发送邀约</span>
              <span><i></i>通行到访</span>
            </div>
            <div class="aso-invite-modal__actions">
              <button type="button" class="aso-invite-modal__ghost" data-invite-modal-close>取消</button>
              <button type="submit" class="aso-invite-modal__submit">${icon('send')} 发送邀约</button>
            </div>
          </form>
        </section>
      </div>
      <div class="aso-contact-modal" data-contact-modal hidden aria-hidden="true">
        <div class="aso-contact-modal__backdrop" data-contact-modal-close></div>
        <section class="aso-contact-modal__panel" role="dialog" aria-modal="true" aria-labelledby="aso-contact-modal-title">
          <button type="button" class="aso-contact-modal__close" data-contact-modal-close aria-label="关闭">${icon('close')}</button>
          <div class="aso-contact-modal__badge">${icon('support_agent')}</div>
          <h2 id="aso-contact-modal-title">联系客服</h2>
          <p>请留下您的手机用户信息，客服人员将尽快与您联系。</p>
          <form class="aso-contact-modal__form" data-contact-form>
            <label>
              <span>姓名</span>
              <input name="contactName" type="text" required maxlength="40" placeholder="请输入姓名" autocomplete="name" />
            </label>
            <label>
              <span>手机号</span>
              <input name="contactPhone" type="tel" required maxlength="11" pattern="1[3-9]\\d{9}" placeholder="11 位手机号" inputmode="numeric" autocomplete="tel" />
            </label>
            <label>
              <span>问题描述（选填）</span>
              <textarea name="contactNote" rows="3" maxlength="200" placeholder="简单描述您遇到的问题，便于客服更快处理"></textarea>
            </label>
            <div class="aso-contact-modal__actions">
              <button type="button" class="aso-btn aso-btn--muted" data-contact-modal-close>取消</button>
              <button type="submit" class="aso-btn aso-btn--primary">${icon('send')} 提交联系方式</button>
            </div>
          </form>
        </section>
      </div>
      <div class="aso-login-prompt" data-login-prompt hidden aria-hidden="true">
        <div class="aso-login-prompt__backdrop" data-login-prompt-close></div>
        <section class="aso-login-prompt__panel" role="dialog" aria-modal="true" aria-labelledby="aso-login-prompt-title">
          <span class="aso-login-prompt__icon">${icon('person')}</span>
          <h2 id="aso-login-prompt-title">登录后使用个人功能</h2>
          <p data-login-prompt-message>收藏和拖拽排序会跟随你的个人账号保存，请先登录。</p>
          <div>
            <button class="aso-btn aso-btn--muted" type="button" data-login-prompt-close>暂不登录</button>
            <button class="aso-btn aso-btn--primary" type="button" data-personal-login>立即登录</button>
          </div>
        </section>
      </div>
      <div class="aso-quick-settings" data-quick-settings hidden aria-hidden="true">
        <div class="aso-quick-settings__backdrop" data-quick-settings-close></div>
        <section class="aso-quick-settings__panel" role="dialog" aria-modal="true" aria-labelledby="aso-quick-settings-title">
          <header>
            <div>
              <h2 id="aso-quick-settings-title">配置快捷入口</h2>
              <p>修改文案和链接并发布后，所有访问者都会使用这份线上配置。</p>
            </div>
            <button type="button" class="aso-quick-settings__close" data-quick-settings-close aria-label="关闭">${icon('close')}</button>
          </header>
          <form data-quick-settings-form>
            <div class="aso-quick-settings__rows" data-quick-settings-rows>${quickSettingsRowsMarkup()}</div>
            <p class="aso-quick-settings__hint">链接支持 HTTP(S)、站内路径（如 /app-download/），或 app:energy / app:poster / app:album / app:screen / app:resource。</p>
            <div class="aso-quick-settings__auth" data-quick-auth hidden>
              <strong>需要管理员身份才能发布线上配置</strong>
              <div>
                <label>管理员账号<input type="text" autocomplete="username" data-quick-admin-account /></label>
                <label>密码<input type="password" autocomplete="current-password" data-quick-admin-password /></label>
                <button type="button" data-quick-admin-login>登录并继续保存</button>
              </div>
            </div>
            <p class="aso-quick-settings__message" data-quick-settings-message aria-live="polite"></p>
            <footer>
              <button type="button" class="aso-btn aso-btn--muted" data-quick-settings-close>取消</button>
              <button type="submit" class="aso-btn aso-btn--primary" data-quick-save>保存线上配置</button>
            </footer>
          </form>
        </section>
      </div>
      <div class="aso-embed" data-aso-embed hidden aria-hidden="true">
        <header class="aso-embed__bar">
          <button class="aso-embed__back" type="button" data-embed-close>${icon('arrow_back')}<span>返回门户</span></button>
          <div class="aso-embed__title">
            <b data-embed-title>AI画报</b>
            <small data-embed-meta>正在打开系统…</small>
          </div>
          <a class="aso-embed__open" data-embed-open href="#" target="_blank" rel="noopener noreferrer">新窗口打开 ${icon('open_in_new')}</a>
        </header>
        <div class="aso-embed__stage">
          <div class="aso-embed__loading" data-embed-loading>
            <span class="aso-embed__spinner" aria-hidden="true"></span>
            <p data-embed-loading-text>正在打开业务系统…</p>
          </div>
          <iframe class="aso-embed__frame" data-embed-frame title="应用嵌入" allow="clipboard-read; clipboard-write; fullscreen"></iframe>
        </div>
      </div>
    </div>`
}

function showToast(message) {
  const toast = document.querySelector('[data-aso-toast]')
  if (!toast) return
  toast.textContent = message
  toast.classList.add('is-visible')
  toast.setAttribute('aria-hidden', 'false')
  window.clearTimeout(showToast.timer)
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove('is-visible')
    toast.setAttribute('aria-hidden', 'true')
  }, 2600)
}

function setPortalMode(root, mode) {
  const nextMode = mode === 'help' ? 'help' : 'overview'
  const overview = root.querySelector('#overview')
  const help = root.querySelector('#help')
  if (overview) overview.hidden = nextMode !== 'overview'
  if (help) help.hidden = nextMode !== 'help'
  root.dataset.activePortalMode = nextMode
}

/** 程序化切分类时不改 URL（避免冲掉 ?id= 或重复入栈） */
let suppressCategoryUrlSync = false

function selectAppCategory(root, categoryId) {
  const resolved = resolveAppsCategory(categoryId)
  const button = root.querySelector(`[data-app-category-filter="${resolved}"]`)
  if (!button) return
  suppressCategoryUrlSync = true
  try {
    button.click()
  } finally {
    suppressCategoryUrlSync = false
  }
}

function focusAppCard(root, appId) {
  if (!appId) return
  const app = apps.find((item) => item.id === appId && !item.hidden)
  if (!app) return
  selectAppCategory(root, app.category)
  window.requestAnimationFrame(() => {
    const card = root.querySelector(`[data-app="${CSS.escape(appId)}"]`)
    if (!card || card.classList.contains('is-hidden')) return
    // 禁止 scrollIntoView：它会连带滚文档，把顶栏 +「Aspace功能全览」顶出视口
    window.scrollTo({ top: 0, behavior: 'auto' })
    const scroller = card.closest('.aso-app-grid') || root.querySelector('[data-app-grid]')
    if (scroller && scroller !== card) {
      const cardRect = card.getBoundingClientRect()
      const scrollerRect = scroller.getBoundingClientRect()
      const offset = cardRect.top - scrollerRect.top - Math.max(12, (scrollerRect.height - cardRect.height) / 2)
      scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + offset), behavior: 'smooth' })
    }
    card.classList.add('is-spotlight')
    window.clearTimeout(focusAppCard.timer)
    focusAppCard.timer = window.setTimeout(() => card.classList.remove('is-spotlight'), 2200)
  })
}

function initPanoramaFlow(root) {
  const section = root.querySelector('[data-panorama-flow]')
  if (!section) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    section.classList.add('is-inview')
    return
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      section.classList.add('is-inview')
      observer.disconnect()
    })
  }, { threshold: 0.28 })
  observer.observe(section)
}

function initHomeGlobe(root) {
  const section = root.querySelector('[data-home-globe]')
  const canvas = root.querySelector('[data-home-globe-canvas]')
  if (!section || !canvas) return

  let globe = null
  let raf = 0
  let phi = 2.35
  let visible = false
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const stop = () => {
    if (!raf) return
    cancelAnimationFrame(raf)
    raf = 0
  }

  const tick = () => {
    if (!visible || !globe || reducedMotion) {
      raf = 0
      return
    }
    phi += 0.0024
    globe.update({ phi })
    raf = requestAnimationFrame(tick)
  }

  const start = () => {
    if (reducedMotion || !visible || !globe || raf) return
    raf = requestAnimationFrame(tick)
  }

  const mount = () => {
    stop()
    if (globe) {
      globe.destroy()
      globe = null
    }
    const width = Math.max(canvas.clientWidth || 720, 320)
    const height = Math.max(canvas.clientHeight || 360, 220)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      // cobe 会再乘 devicePixelRatio，这里只传 CSS 像素
      width,
      height,
      phi,
      theta: 0.16,
      dark: 0,
      diffuse: 1.2,
      mapSamples: width < 640 ? 14000 : 24000,
      mapBrightness: 5.6,
      mapBaseBrightness: 0.05,
      baseColor: [0.74, 0.86, 1],
      markerColor: [0.03, 0.47, 0.98],
      glowColor: [0.96, 0.98, 1],
      opacity: 1,
      scale: 2.8,
      // 球心下移，露出完整上半圆（顶弧不被画布裁断）
      offset: [0, Math.round(height * 0.62)],
      markers: [],
      context: { alpha: true, antialias: true },
    })
    start()
  }

  mount()

  const visibility = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
  }, { threshold: 0.12 })
  visibility.observe(section)

  let resizeTimer = 0
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(mount, 160)
  })
}

function setShellView(root, view, {
  portalMode,
  category,
  appId,
  section,
  preserveScroll,
  replace = false,
  syncUrl = true,
} = {}) {
  let nextView = ['home', 'apps', 'help', 'about'].includes(view) ? view : 'home'
  if (nextView === 'apps' && portalMode === 'help') nextView = 'help'
  const contentView = nextView === 'help' ? 'apps' : nextView
  const aboutSection = nextView === 'about'
    ? (section || aboutSectionIdFromHash() || 'intro')
    : ''
  const nextAppId = nextView === 'apps' ? String(appId || '').trim() : ''
  const nextCategory = nextView === 'apps' ? resolveAppsCategory(category) : ''
  const urlCategory = nextView === 'apps' && !nextAppId && nextCategory !== 'all' ? nextCategory : ''

  root.querySelectorAll('[data-aso-view]').forEach((sectionEl) => {
    sectionEl.hidden = sectionEl.dataset.asoView !== contentView
  })
  // 顶栏导航高亮（排除首页业务卡上的 data-aso-nav）
  root.querySelectorAll('.aso-shell__nav [data-aso-nav]').forEach((item) => {
    const active = item.dataset.asoNav === nextView
    item.classList.toggle('is-active', active)
    if (item.matches('button, a')) item.setAttribute('aria-current', active ? 'page' : 'false')
  })
  root.dataset.activeShellView = nextView
  root.classList.remove('is-menu-open')
  if (contentView === 'apps') setPortalMode(root, nextView === 'help' ? 'help' : 'overview')

  if (syncUrl) {
    const nextHash = buildAspaceHash(nextView, {
      section: aboutSection,
      appId: nextAppId,
      category: urlCategory,
    })
    const nextUrl = `${aspaceCanonicalPath()}${nextHash}`
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (currentUrl !== nextUrl) {
      const state = { asoView: nextView, appId: nextAppId, category: nextCategory, section: aboutSection }
      if (replace) window.history.replaceState(state, '', nextUrl)
      else window.history.pushState(state, '', nextUrl)
    }
  }

  if (!preserveScroll && nextView !== 'about') window.scrollTo({ top: 0, behavior: 'auto' })
  if (contentView === 'apps' && nextView !== 'help') {
    window.requestAnimationFrame(() => {
      if (nextAppId) focusAppCard(root, nextAppId)
      else selectAppCategory(root, nextCategory || 'all')
      // 再次钉回顶部，防止分类切换 / 焦点把门户顶栏滚走
      if (!preserveScroll) window.scrollTo({ top: 0, behavior: 'auto' })
    })
  }
  if (nextView === 'about') {
    void initAboutEmbed(root).then(() => {
      if (preserveScroll) return
      scrollAboutSection(root, aboutSection)
    })
  }
}

function applyAspaceLocation(root, { replace = true, preserveScroll = false } = {}) {
  const route = parseAspaceLocation()
  setShellView(root, route.view, {
    appId: route.appId,
    category: route.category,
    section: route.section,
    replace: replace || route.needsPathNormalize,
    preserveScroll,
    syncUrl: true,
  })
}

/** 点击左侧分类时锁定当前滚动，避免焦点/锚定把页面拽走。 */
function keepScrollPosition(run) {
  const html = document.documentElement
  const scrollY = window.scrollY
  const previousBehavior = html.style.scrollBehavior
  html.style.scrollBehavior = 'auto'
  run()
  html.scrollTop = scrollY
  html.style.scrollBehavior = previousBehavior
}

function base64Url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function sha256Fallback(value) {
  const rightRotate = (number, amount) => (number >>> amount) | (number << (32 - amount))
  const maxWord = 2 ** 32
  const words = []
  const hash = []
  const constants = []
  const byteLength = value.length
  const bitLength = byteLength * 8
  const composite = {}
  let primeCounter = 0
  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (composite[candidate]) continue
    for (let multiple = candidate * candidate; multiple < 313; multiple += candidate) composite[multiple] = true
    if (primeCounter < 8) hash[primeCounter] = (Math.sqrt(candidate) * maxWord) | 0
    constants[primeCounter] = (candidate ** (1 / 3) * maxWord) | 0
    primeCounter += 1
  }
  const bytes = [...new TextEncoder().encode(value), 0x80]
  while ((bytes.length % 64) !== 56) bytes.push(0)
  for (let index = 7; index >= 0; index -= 1) bytes.push(index < 4 ? (bitLength >>> (index * 8)) & 255 : 0)
  for (let index = 0; index < bytes.length; index += 4) {
    words.push((bytes[index] << 24) | (bytes[index + 1] << 16) | (bytes[index + 2] << 8) | bytes[index + 3])
  }
  for (let block = 0; block < words.length; block += 16) {
    const schedule = words.slice(block, block + 16)
    const oldHash = hash.slice()
    for (let index = 0; index < 64; index += 1) {
      const w15 = schedule[index - 15]
      const w2 = schedule[index - 2]
      const a = hash[0]
      const e = hash[4]
      const temp1 = (
        hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ (~e & hash[6]))
        + constants[index]
        + (schedule[index] = index < 16 ? schedule[index] : (
          schedule[index - 16]
          + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
          + schedule[index - 7]
          + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0)
      ) | 0
      const temp2 = (
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]))
      ) | 0
      hash.pop()
      hash.unshift((temp1 + temp2) | 0)
      hash[4] = (hash[4] + temp1) | 0
    }
    hash.forEach((valueAtIndex, index) => {
      hash[index] = (valueAtIndex + oldHash[index]) | 0
    })
  }
  return Uint8Array.from(hash.flatMap((word) => [
    (word >>> 24) & 255,
    (word >>> 16) & 255,
    (word >>> 8) & 255,
    word & 255,
  ]))
}

async function sha256(value) {
  if (crypto.subtle) return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))
  return sha256Fallback(value)
}

async function readPortalUser(accessToken) {
  const response = await fetch('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('登录状态已过期')
  return response.json()
}

async function initPortalAuth() {
  const callbackPath = window.location.pathname.replace(/\/+$/, '') === '/aspace-one/auth/callback'
  if (callbackPath) {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('error')) throw new Error(params.get('error_description') || params.get('error'))
      const code = params.get('code')
      const state = params.get('state')
      const pending = JSON.parse(sessionStorage.getItem('aspace-one-oidc-pending') || 'null')
      if (!code || !pending?.verifier || !state || state !== pending.state) throw new Error('登录回调校验失败，请重新登录')
      const tokenResponse = await fetch('/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: 'aspace-one',
          code,
          code_verifier: pending.verifier,
          redirect_uri: `${window.location.origin}/aspace-one/auth/callback`,
        }),
      })
      const tokens = await tokenResponse.json()
      if (!tokenResponse.ok || !tokens.access_token) throw new Error(tokens.error_description || '无法完成登录')
      const user = await readPortalUser(tokens.access_token)
      writePortalTokens(tokens)
      sessionStorage.removeItem('aspace-one-oidc-pending')
      window.ASPACE_CURRENT_USER = { id: user.sub, ...user }
      window.location.replace('/aspace-one/')
      return
    } catch (error) {
      sessionStorage.removeItem('aspace-one-oidc-pending')
      portalAuthError = error instanceof Error ? error.message : '登录失败，请重试'
      window.history.replaceState({}, '', '/aspace-one/')
    }
  }
  try {
    const tokens = readPortalTokens()
    if (!tokens?.access_token) return
    const user = await readPortalUser(tokens.access_token)
    writePortalTokens(tokens)
    window.ASPACE_CURRENT_USER = { id: user.sub, ...user }
  } catch {
    clearPortalTokens()
    window.ASPACE_CURRENT_USER = null
  }
}

async function createPortalLoginUrl({ forceLogin = true } = {}) {
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = base64Url(await sha256(verifier))
  const state = base64Url(crypto.getRandomValues(new Uint8Array(24)))
  const nonce = base64Url(crypto.getRandomValues(new Uint8Array(24)))
  sessionStorage.setItem('aspace-one-oidc-pending', JSON.stringify({ verifier, state, nonce }))
  // 主动登录时强制出现登录页，避免沿用统一认证侧已有会话直接静默回跳
  const params = {
    client_id: 'aspace-one',
    redirect_uri: `${window.location.origin}/aspace-one/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }
  if (forceLogin) params.prompt = 'login'
  const authorizeUrl = new URL('/auth/auth', window.location.origin)
  authorizeUrl.search = new URLSearchParams(params).toString()
  return authorizeUrl.toString()
}

function isPortalAuthenticated() {
  return Boolean(window.ASPACE_CURRENT_USER?.id)
}

function setDeviceModalOpen(root, open) {
  const modal = root.querySelector('[data-device-modal]')
  if (!modal) return
  modal.hidden = !open
  modal.setAttribute('aria-hidden', String(!open))
  document.body.classList.toggle('aso-device-modal-open', open)
  if (open) {
    modal.classList.remove('is-open')
    // restart enter animation
    void modal.offsetWidth
    modal.classList.add('is-open')
    window.setTimeout(() => modal.querySelector('[data-device-modal-close]')?.focus(), 20)
  } else {
    modal.classList.remove('is-open')
  }
}

function defaultInviteDate() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function setInviteModalOpen(root, open) {
  const modal = root.querySelector('[data-invite-modal]')
  if (!modal) return
  modal.hidden = !open
  modal.setAttribute('aria-hidden', String(!open))
  document.body.classList.toggle('aso-invite-modal-open', open)
  if (open) {
    const form = modal.querySelector('[data-invite-form]')
    form?.reset()
    const dateInput = form?.querySelector('[name="visitDate"]')
    const timeInput = form?.querySelector('[name="visitTime"]')
    if (dateInput) dateInput.value = defaultInviteDate()
    if (timeInput) timeInput.value = '10:00'
    const host = window.ASPACE_CURRENT_USER?.name || window.ASPACE_CURRENT_USER?.displayName || ''
    const hostInput = form?.querySelector('[name="hostName"]')
    if (hostInput && host) hostInput.value = host
    modal.classList.remove('is-open')
    void modal.offsetWidth
    modal.classList.add('is-open')
    window.setTimeout(() => form?.querySelector('[name="guestName"]')?.focus(), 20)
  } else {
    modal.classList.remove('is-open')
  }
}

function submitVisitorInvite(root, form) {
  const data = new FormData(form)
  const guestName = String(data.get('guestName') || '').trim()
  const guestPhone = String(data.get('guestPhone') || '').trim()
  const visitDate = String(data.get('visitDate') || '').trim()
  const visitTime = String(data.get('visitTime') || '').trim()
  if (!guestName || !guestPhone || !visitDate || !visitTime) {
    showToast('请完整填写访客邀约信息')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(guestPhone)) {
    showToast('请输入正确的 11 位手机号')
    return
  }
  setInviteModalOpen(root, false)
  showToast(`已向 ${guestName} 发送访客邀约（${visitDate} ${visitTime}）`)
}

function setContactModalOpen(root, open) {
  const modal = root.querySelector('[data-contact-modal]')
  if (!modal) return
  modal.hidden = !open
  modal.setAttribute('aria-hidden', String(!open))
  document.body.classList.toggle('aso-contact-modal-open', open)
  if (open) {
    const form = modal.querySelector('[data-contact-form]')
    form?.reset()
    const user = window.ASPACE_CURRENT_USER
    const nameInput = form?.querySelector('[name="contactName"]')
    if (nameInput && (user?.name || user?.displayName)) {
      nameInput.value = user.name || user.displayName
    }
    modal.classList.remove('is-open')
    void modal.offsetWidth
    modal.classList.add('is-open')
    window.setTimeout(() => form?.querySelector('[name="contactPhone"]')?.focus(), 20)
  } else {
    modal.classList.remove('is-open')
  }
}

async function submitContactRequest(root, form) {
  const data = new FormData(form)
  const name = String(data.get('contactName') || '').trim()
  const phone = String(data.get('contactPhone') || '').trim()
  const note = String(data.get('contactNote') || data.get('contactMessage') || '').trim()
  if (!name || !phone) {
    showToast('请填写姓名和手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    showToast('请输入正确的 11 位手机号')
    return
  }
  try {
    const response = await fetch('/api/public/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name,
        contact: phone,
        requirement: note || 'Aspace 联系客服',
        source: 'aspace-contact',
        pageUrl: window.location.href.slice(0, 300),
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.message || '提交失败，请稍后重试')
    form.reset()
    setContactModalOpen(root, false)
    showToast('已提交联系方式，客服将尽快与您联系')
  } catch (error) {
    showToast(error.message || '提交失败，请稍后重试')
  }
}

function setLoginPromptOpen(root, open, message = '') {
  const modal = root.querySelector('[data-login-prompt]')
  if (!modal) return
  modal.hidden = !open
  modal.setAttribute('aria-hidden', String(!open))
  document.body.classList.toggle('aso-login-prompt-open', open)
  const copy = modal.querySelector('[data-login-prompt-message]')
  if (copy && message) copy.textContent = message
  const loginButton = modal.querySelector('[data-personal-login]')
  if (open && loginButton) {
    loginButton.disabled = false
    loginButton.textContent = '立即登录'
    window.setTimeout(() => loginButton.focus(), 20)
  }
}

function requirePersonalLogin(root, action) {
  if (isPortalAuthenticated()) return true
  const messages = {
    favorite: '收藏内容会跟随你的个人账号保存，请先登录后再操作。',
    favoritesView: '收藏列表属于个人数据，请先登录后查看。',
    recent: '最近访问记录属于个人数据，请先登录后查看。',
    categorySort: '业务分类顺序会跟随你的个人账号保存，请先登录后再拖拽。',
    capabilitySort: '能力卡片顺序会跟随你的个人账号保存，请先登录后再拖拽。',
  }
  setLoginPromptOpen(root, true, messages[action] || '该功能需要登录后使用。')
  return false
}

async function startPersonalLogin(root, trigger) {
  const loginUrl = String(window.ASPACE_AUTH_LOGIN_URL || '').trim()
  if (loginUrl) {
    window.location.href = loginUrl
    return
  }
  const loginButton = trigger?.closest?.('[data-personal-login]')
    || root.querySelector('[data-login-prompt] [data-personal-login]')
    || root.querySelector('.aso-shell__account[data-personal-login]')
  if (loginButton) {
    loginButton.disabled = true
    const label = loginButton.querySelector('span:last-child')
    if (label) label.textContent = '正在进入登录…'
    else loginButton.textContent = '正在进入登录…'
  }
  try {
    // 清除本地登录缓存，并强制统一认证弹出登录界面
    clearPortalTokens()
    window.ASPACE_CURRENT_USER = null
    window.location.href = await createPortalLoginUrl({ forceLogin: true })
  } catch {
    if (loginButton) {
      loginButton.disabled = false
      const label = loginButton.querySelector('span:last-child')
      if (label) label.textContent = '登录'
      else loginButton.textContent = '立即登录'
    }
    const message = root.querySelector('[data-login-prompt-message]')
    if (message) message.textContent = '无法启动登录，请检查浏览器安全设置后重试。'
  }
}

function closeAppEmbed(root) {
  const shell = root.querySelector('[data-aso-embed]')
  const frame = root.querySelector('[data-embed-frame]')
  if (!shell) return
  shell.hidden = true
  shell.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('aso-embed-open')
  if (frame) frame.removeAttribute('src')
  root.querySelector('[data-embed-loading]')?.removeAttribute('hidden')
}

async function resolveAppOpenUrl(root, app) {
  if (!app) return ''
  if (app.href) return app.href
  if (app.embedUrl) return app.embedUrl
  if (app.url) return app.url

  return ''
}

async function openAppInNewPage(root, app) {
  if (!app) return
  try {
    const targetUrl = await resolveAppOpenUrl(root, app)
    if (!targetUrl) {
      showToast('该系统暂未配置访问地址')
      return
    }
    const opened = window.open(targetUrl, '_blank', 'noopener,noreferrer')
    if (!opened) showToast('浏览器拦截了新窗口，请允许弹窗后重试')
  } catch (error) {
    showToast(error instanceof Error ? error.message : `无法进入 ${app.name}，请稍后重试`)
  }
}

async function openAppEmbed(root, app) {
  // 保留嵌入壳，默认入口改为新开页面；仅在显式需要时复用。
  await openAppInNewPage(root, app)
}

function updateCapabilityOrder(categoryId, orderedIds) {
  const rank = new Map(orderedIds.map((id, index) => [id, index]))
  const categoryApps = apps
    .filter((app) => app.category === categoryId)
    .sort((left, right) => (rank.get(left.id) ?? 999) - (rank.get(right.id) ?? 999))
  let cursor = 0
  apps = apps.map((app) => app.category === categoryId ? categoryApps[cursor++] : app)
  try {
    const saved = JSON.parse(localStorage.getItem('aspace-one-capability-order') || '{}')
    saved[categoryId] = categoryApps.map((app) => app.id)
    localStorage.setItem('aspace-one-capability-order', JSON.stringify(saved))
  } catch {
    // 浏览器禁用本地存储时，本次会话内仍保留排序结果。
  }
}

function initCategoryDrag(root) {
  const nav = root.querySelector('[data-business-category-nav]')
  if (!nav) return
  let dragged = null

  nav.addEventListener('dragstart', (event) => {
    const button = event.target.closest('[data-app-category-filter]')
    if (!button) return
    if (!requirePersonalLogin(root, 'categorySort')) {
      event.preventDefault()
      return
    }
    dragged = button
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', button.dataset.appCategoryFilter)
    window.requestAnimationFrame(() => button.classList.add('is-dragging'))
  })

  nav.addEventListener('dragover', (event) => {
    if (!dragged) return
    const target = event.target.closest('[data-app-category-filter]')
    if (!target || target === dragged) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const rect = target.getBoundingClientRect()
    nav.insertBefore(dragged, event.clientY > rect.top + rect.height / 2 ? target.nextSibling : target)
  })

  nav.addEventListener('drop', (event) => {
    if (!dragged) return
    event.preventDefault()
    const order = [...nav.querySelectorAll('[data-app-category-filter]')]
      .map((button) => button.dataset.appCategoryFilter)
    localStorage.setItem('aspace-one-category-order', JSON.stringify(order))
    appCategories = order
      .map((id) => appCategories.find(([categoryId]) => categoryId === id))
      .filter(Boolean)
    showToast('业务分类顺序已保存')
  })

  nav.addEventListener('dragend', () => {
    dragged?.classList.remove('is-dragging')
    dragged = null
  })
}

function arrangeCapabilityGrid(grid, category, sortMode = 'default') {
  const cards = [...grid.querySelectorAll('[data-app]')]
  const appForCard = (card) => apps.find((app) => app.id === card.dataset.app)
  cards.sort((left, right) => {
    const leftApp = appForCard(left)
    const rightApp = appForCard(right)
    if (sortMode === 'name') return leftApp.name.localeCompare(rightApp.name, 'zh-CN')
    if (sortMode === 'recent') return String(rightApp.time || '').localeCompare(String(leftApp.time || ''))
    return apps.indexOf(leftApp) - apps.indexOf(rightApp)
  })

  const headings = [...grid.querySelectorAll('[data-capability-group-heading]')]
  headings.forEach((heading) => {
    heading.hidden = true
    grid.appendChild(heading)
  })
  if (category !== 'foundation') {
    cards.forEach((card) => grid.insertBefore(card, headings[0] || null))
    return
  }

  const appendGroup = (group) => {
    const heading = headings.find((item) => item.dataset.capabilityGroupHeading === group)
    if (heading) grid.appendChild(heading)
    cards.filter((card) => card.dataset.capabilityGroup === group).forEach((card) => grid.appendChild(card))
  }
  cards.filter((card) => card.dataset.appCategory === 'foundation' && !card.dataset.capabilityGroup).forEach((card) => grid.appendChild(card))
  cards.filter((card) => card.dataset.capabilityGroup === 'platform').forEach((card) => grid.appendChild(card))
  appendGroup('base')
  appendGroup('control')
}

function updateCapabilityGroupHeadings(grid, category) {
  grid.querySelectorAll('[data-capability-group-heading]').forEach((heading) => {
    const group = heading.dataset.capabilityGroupHeading
    const hasVisibleCard = [...grid.querySelectorAll(`[data-capability-group="${group}"]`)]
      .some((card) => !card.classList.contains('is-hidden'))
    heading.hidden = category !== 'foundation' || !hasVisibleCard
  })
}

function initAppFilters(root) {
  const grid = root.querySelector('[data-app-grid]')
  const empty = root.querySelector('[data-app-empty]')
  const categoryButtons = [...root.querySelectorAll('[data-app-category-filter]')]
  const searchInput = root.querySelector('[data-app-search-input]')
  const sortSelect = root.querySelector('[data-app-sort]')
  const viewButtons = [...root.querySelectorAll('[data-app-view]')]
  const catalog = root.querySelector('.aso-app-catalog')
  const recentPanel = root.querySelector('[data-recent-panel]')
  const catalogTitle = root.querySelector('[data-catalog-title]')
  const catalogDescription = root.querySelector('[data-catalog-description]')
  if (!grid || !categoryButtons.length) return

  let category = 'all'
  let query = ''
  let draggedCard = null

  const applyFilters = () => {
    arrangeCapabilityGrid(grid, category, sortSelect?.value || 'default')
    let visible = 0
    grid.querySelectorAll('[data-app-state]').forEach((card) => {
      const categoryMatch = category === 'all'
        || (category === 'favorites' ? favoriteAppIds.has(card.dataset.app) : card.dataset.appCategory === category)
      const queryMatch = !query || card.dataset.appSearch.includes(query)
      const match = categoryMatch && queryMatch
      card.classList.toggle('is-hidden', !match)
      if (match) visible += 1
    })
    if (empty) empty.hidden = visible > 0
    updateCapabilityGroupHeadings(grid, category)
  }

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextCategory = button.dataset.appCategoryFilter
      if (nextCategory === 'recent' && !requirePersonalLogin(root, 'recent')) return
      if (nextCategory === 'favorites' && !requirePersonalLogin(root, 'favoritesView')) return
      keepScrollPosition(() => {
        category = nextCategory
        const showingRecent = category === 'recent'
        if (catalog) catalog.hidden = showingRecent
        if (recentPanel) recentPanel.hidden = !showingRecent
        const [, headingTitle, headingDescription] = catalogMeta(category)
        if (catalogTitle) catalogTitle.textContent = headingTitle
        if (catalogDescription) catalogDescription.textContent = headingDescription
        categoryButtons.forEach((item) => {
          const active = item === button
          item.classList.toggle('is-active', active)
          if (active) item.setAttribute('aria-current', 'true')
          else item.removeAttribute('aria-current')
        })
        if (!showingRecent) applyFilters()
        button.focus({ preventScroll: true })
        if (!suppressCategoryUrlSync) syncAppsCategoryInUrl(nextCategory)
      })
    })
  })

  searchInput?.addEventListener('input', () => {
    query = searchInput.value.trim().toLowerCase()
    applyFilters()
  })
  root.querySelector('[data-app-search-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    searchInput?.focus()
    applyFilters()
  })
  root.querySelectorAll('[data-app-search-hot]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!searchInput) return
      searchInput.value = button.dataset.appSearchHot
      searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    })
  })

  sortSelect?.addEventListener('change', () => {
    applyFilters()
  })

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.appView
      grid.classList.toggle('is-list-view', view === 'list')
      viewButtons.forEach((item) => {
        const active = item === button
        item.classList.toggle('is-active', active)
        item.setAttribute('aria-pressed', String(active))
      })
    })
  })

  grid.querySelectorAll('[data-favorite-app]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!requirePersonalLogin(root, 'favorite')) return
      const appId = button.dataset.favoriteApp
      if (favoriteAppIds.has(appId)) favoriteAppIds.delete(appId)
      else favoriteAppIds.add(appId)
      localStorage.setItem('aspace-one-favorite-apps', JSON.stringify([...favoriteAppIds]))
      const active = favoriteAppIds.has(appId)
      button.classList.toggle('is-active', active)
      button.setAttribute('aria-pressed', String(active))
      button.setAttribute('aria-label', `${active ? '取消收藏' : '收藏'}${apps.find((app) => app.id === appId)?.name || ''}`)
      const favoriteCount = root.querySelector('[data-favorite-count]')
      if (favoriteCount) favoriteCount.textContent = String(favoriteAppIds.size)
      applyFilters()
    })
  })

  grid.addEventListener('dragstart', (event) => {
    const card = event.target.closest('[data-app]')
    if (!card || event.target.closest('button')) {
      event.preventDefault()
      return
    }
    if (!requirePersonalLogin(root, 'capabilitySort')) {
      event.preventDefault()
      return
    }
    draggedCard = card
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', card.dataset.app)
    window.requestAnimationFrame(() => card.classList.add('is-dragging'))
  })

  grid.addEventListener('dragover', (event) => {
    if (!draggedCard) return
    const target = event.target.closest('[data-app]')
    const sameCategory = target?.dataset.appCategory === draggedCard.dataset.appCategory
    const sameGroup = target?.dataset.capabilityGroup === draggedCard.dataset.capabilityGroup
    if (!target || target === draggedCard || !sameCategory || !sameGroup) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const rect = target.getBoundingClientRect()
    const after = event.clientY > rect.top + rect.height / 2
      || (Math.abs(event.clientY - (rect.top + rect.height / 2)) < rect.height / 3 && event.clientX > rect.left + rect.width / 2)
    grid.insertBefore(draggedCard, after ? target.nextSibling : target)
  })

  grid.addEventListener('drop', (event) => {
    if (!draggedCard) return
    event.preventDefault()
    const categoryId = draggedCard.dataset.appCategory
    const orderedIds = [...grid.querySelectorAll(`[data-app-category="${categoryId}"]`)].map((card) => card.dataset.app)
    updateCapabilityOrder(categoryId, orderedIds)
    if (sortSelect) sortSelect.value = 'default'
    showToast('功能顺序已保存在当前浏览器')
  })

  grid.addEventListener('dragend', () => {
    draggedCard?.classList.remove('is-dragging')
    draggedCard = null
    applyFilters()
  })

  applyFilters()
}

async function loadQuickActions() {
  try {
    const response = await fetch('/api/public/aspace/quick-actions', { cache: 'no-store' })
    const data = await response.json()
    if (response.ok && Array.isArray(data.actions) && data.actions.length) {
      quickActions = data.actions.map((item) => ({ ...item }))
    }
  } catch {
    quickActions = defaultQuickActions.map((item) => ({ ...item }))
  }
}

async function loadCatalog() {
  try {
    const response = await fetch('/api/public/aspace/catalog', { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok || !Array.isArray(data.catalog?.categories) || !Array.isArray(data.catalog?.apps)) return
    const existingById = new Map(appCategories.map((category) => [category[0], category]))
    const configuredIds = new Set(data.catalog.categories.map((category) => category.id))
    appCategories = data.catalog.categories
      .filter((category) => existingById.has(category.id))
      .map((category) => {
        const fallback = existingById.get(category.id)
        return [
          category.id,
          category.iconUrl || category.icon || fallback[1],
          category.label || fallback[2],
          category.description ?? fallback[3],
        ]
      })
    existingById.forEach((category, id) => {
      if (!configuredIds.has(id)) appCategories.push(category)
    })
    const catalogApps = new Map(data.catalog.apps.map((app) => [app.id, app]))
    apps.forEach((app) => {
      const meta = catalogApps.get(app.id)
      if (!meta) return
      if (configuredIds.has(meta.category)) app.category = meta.category
      if (meta.name) app.name = meta.name
      if (meta.description) {
        app.project = meta.description
        app.desc = meta.description
      }
      if (meta.image) {
        app.image = meta.image
        if (!app.alt) app.alt = `${meta.name || app.name}封面`
      }
    })
  } catch {
    // 后台栏目配置不可用时继续使用页面内置配置。
  }
}

async function loadHomeContent() {
  try {
    const response = await fetch('/api/public/aspace/home', { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok || !data.home?.hero || !data.home?.panorama || !data.home?.scenes || !data.home?.infra) return
    homeContent = data.home
  } catch {
    homeContent = structuredClone(defaultHomeContent)
  }
}

function catalogShapeFromAppCategories() {
  return {
    categories: appCategories.map(([id, icon, label, description]) => ({
      id,
      icon,
      label,
      description,
    })),
  }
}

function applyHelpContent(help) {
  if (!help || typeof help !== 'object') return
  const aligned = alignHelpWithCatalog({
    ...structuredClone(defaultHelpContent),
    ...help,
    docsList: { ...defaultDocsListRules, ...(help.docsList || {}) },
    support: { ...defaultHelpContent.support, ...(help.support || {}) },
  }, catalogShapeFromAppCategories())
  helpContent = aligned
  docs = Array.isArray(helpContent.docs) ? helpContent.docs.map((item) => ({ ...item })) : structuredClone(defaultHelpContent.docs)
  docCategories = Array.isArray(helpContent.categories)
    ? helpContent.categories.map((item) => [item.icon || 'description', item.name || ''])
    : defaultHelpContent.categories.map((item) => [item.icon, item.name])
  hotSearches = Array.isArray(helpContent.hotSearches) ? [...helpContent.hotSearches] : [...defaultHelpContent.hotSearches]
  const fromDocs = docs.filter((item) => item.featured).slice(0, 4).map((item) => ({
    id: item.id || '',
    title: item.title,
    date: item.date,
    badge: item.badge || '推荐',
    tone: item.tone || 'blue',
    art: item.art || 'lines',
    fileUrl: item.fileUrl || '',
  }))
  featuredDocs = fromDocs.length
    ? fromDocs
    : Array.isArray(helpContent.featuredDocs)
      ? helpContent.featuredDocs.map((item) => ({ ...item }))
      : structuredClone(defaultHelpContent.featuredDocs)
  const updateSource = Array.isArray(helpContent.updates) && helpContent.updates.length
    ? helpContent.updates
    : defaultHelpContent.updates
  const docsByTitle = new Map(docs.map((item) => [item.title, item]))
  updates = updateSource.map((item) => {
    const matched = docsByTitle.get(item.title)
    return [item.date, item.title, item.desc, matched?.id || '', matched?.fileUrl || '']
  })
}

async function loadHelpContent() {
  try {
    const response = await fetch('/api/public/aspace/help', { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok || !data.help) return
    applyHelpContent(data.help)
  } catch {
    applyHelpContent(defaultHelpContent)
  }
}

async function loadRecentActivities() {
  try {
    const response = await fetch('/api/public/aspace/activities', { cache: 'no-store' })
    const data = await response.json()
    recentActivities = response.ok && Array.isArray(data.activities) ? data.activities : []
  } catch {
    recentActivities = []
  }
}

function updateRecentVisits(root, { resetPage = false } = {}) {
  if (resetPage) recentPage = 1
  const container = root.querySelector('[data-recent-visits]')
  if (container) container.innerHTML = recentVisitsMarkup()
  root.querySelectorAll('[data-recent-count], [data-recent-panel-count]').forEach((element) => {
    element.textContent = String(recentActivities.length)
  })
}

async function reportActivity(root, app, feature, deepLink = '') {
  if (!app || !feature) return
  try {
    const response = await fetch('/api/public/aspace/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: app.id,
        appName: app.name,
        project: app.project,
        feature,
        deepLink,
      }),
      keepalive: true,
    })
    const data = await response.json()
    if (!response.ok || !data.activity) return
    recentActivities.unshift(data.activity)
    updateRecentVisits(root, { resetPage: true })
  } catch {
    // 操作记录失败不能阻断用户进入业务系统。
  }
}

function bindActivityMessages(root) {
  window.addEventListener('message', (event) => {
    const data = event?.data
    if (!data || data.type !== 'aspace:activity') return
    const frame = root.querySelector('[data-embed-frame]')
    if (!frame || event.source !== frame.contentWindow) return
    const app = apps.find((item) => item.id === frame.dataset.appId)
    const feature = String(data.feature || data.label || '').trim().slice(0, 100)
    if (!app || !feature) return
    let deepLink = String(data.deepLink || '').trim()
    if (deepLink.startsWith('/') && event.origin && event.origin !== 'null') deepLink = `${event.origin}${deepLink}`
    void reportActivity(root, app, feature, deepLink)
  })
}

function setQuickSettingsOpen(root, open) {
  const modal = root.querySelector('[data-quick-settings]')
  if (!modal) return
  modal.hidden = !open
  modal.setAttribute('aria-hidden', String(!open))
  document.body.classList.toggle('aso-settings-open', open)
  if (open) {
    const rows = modal.querySelector('[data-quick-settings-rows]')
    if (rows) rows.innerHTML = quickSettingsRowsMarkup()
    modal.querySelector('[data-quick-auth]')?.setAttribute('hidden', '')
    const message = modal.querySelector('[data-quick-settings-message]')
    if (message) message.textContent = ''
    window.setTimeout(() => modal.querySelector('[data-quick-label]')?.focus(), 20)
  }
}

function collectQuickSettings(root) {
  return [...root.querySelectorAll('[data-quick-row]')].map((row) => {
    const current = quickActions.find((item) => item.id === row.dataset.quickRow)
    return {
      id: row.dataset.quickRow,
      icon: current?.icon || '',
      label: row.querySelector('[data-quick-label]')?.value.trim() || '',
      url: row.querySelector('[data-quick-link]')?.value.trim() || '',
    }
  })
}

async function publishQuickSettings(root) {
  const modal = root.querySelector('[data-quick-settings]')
  const message = modal?.querySelector('[data-quick-settings-message]')
  const saveButton = modal?.querySelector('[data-quick-save]')
  if (!modal || !message || !saveButton) return false
  const actions = collectQuickSettings(modal)
  if (actions.some((item) => !item.label)) {
    message.textContent = '快捷入口文案不能为空。'
    return false
  }
  saveButton.disabled = true
  message.textContent = '正在保存线上配置…'
  try {
    const response = await fetch('/api/admin/aspace/quick-actions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions }),
    })
    const data = await response.json().catch(() => ({}))
    if (response.status === 401) {
      modal.querySelector('[data-quick-auth]')?.removeAttribute('hidden')
      message.textContent = '请先登录管理员账号，再发布线上配置。'
      modal.querySelector('[data-quick-admin-account]')?.focus()
      return false
    }
    if (!response.ok) throw new Error(data.message || '保存失败')
    quickActions = data.actions.map((item) => ({ ...item }))
    const container = root.querySelector('[data-quick-actions]')
    if (container) container.innerHTML = quickActionsMarkup()
    setQuickSettingsOpen(root, false)
    showToast('快捷入口线上配置已更新')
    return true
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : '保存失败，请稍后重试。'
    return false
  } finally {
    saveButton.disabled = false
  }
}

async function loginQuickSettingsAdmin(root) {
  const modal = root.querySelector('[data-quick-settings]')
  const account = modal?.querySelector('[data-quick-admin-account]')?.value.trim() || ''
  const password = modal?.querySelector('[data-quick-admin-password]')?.value || ''
  const message = modal?.querySelector('[data-quick-settings-message]')
  const button = modal?.querySelector('[data-quick-admin-login]')
  if (!modal || !message || !button) return
  if (!account || !password) {
    message.textContent = '请输入管理员账号和密码。'
    return
  }
  button.disabled = true
  message.textContent = '正在验证管理员身份…'
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account, password }),
    })
    if (!response.ok) {
      message.textContent = response.status === 429 ? '登录尝试过多，请稍后再试。' : '管理员账号或密码错误。'
      return
    }
    modal.querySelector('[data-quick-auth]')?.setAttribute('hidden', '')
    const passwordInput = modal.querySelector('[data-quick-admin-password]')
    if (passwordInput) passwordInput.value = ''
    await publishQuickSettings(root)
  } catch {
    message.textContent = '登录请求失败，请检查网络后重试。'
  } finally {
    button.disabled = false
  }
}

function openConfiguredLink(root, url, { pendingFeature = '' } = {}) {
  const target = String(url || '').trim()
  if (!target) {
    showToast('尚未配置跳转链接')
    return
  }
  if (target.startsWith('app:')) {
    const appId = target.slice(4)
    const button = root.querySelector(`[data-enter-app="${CSS.escape(appId)}"]`)
    if (button) {
      if (pendingFeature) root.dataset.pendingActivityFeature = pendingFeature
      button.click()
    }
    else showToast('对应应用不存在或尚未开通')
    return
  }

  // 门户内跳转：保持 SPA + 顶栏，避免 /aspace-one/apps/ 整页跳出丢头部
  const portalRoute = parseConfiguredAspaceRoute(target)
  if (portalRoute) {
    setShellView(root, portalRoute.view, {
      appId: portalRoute.appId,
      category: portalRoute.category,
      section: portalRoute.section,
    })
    return
  }

  if (/^https?:\/\//i.test(target)) {
    window.open(target, '_blank', 'noopener,noreferrer')
    return
  }
  window.location.href = target
}

function openQuickAction(root, action) {
  openConfiguredLink(root, action?.dataset.quickUrl, {
    pendingFeature: action.querySelector('span')?.textContent?.trim() || '',
  })
}

export async function initAspaceOne() {
  const root = document.getElementById('aspace-one-root')
  if (!root) return
  await initPortalAuth()
  await Promise.all([loadCatalog(), loadHomeContent(), loadHelpContent()])
  loadAppPreferences()
  await Promise.all([loadQuickActions(), loadRecentActivities()])
  root.innerHTML = renderPortal()
  applyAspaceLocation(root, { replace: true })
  if (portalAuthError) showToast(portalAuthError)
  bindActivityMessages(root)

  const syncRouteFromHistory = () => {
    applyAspaceLocation(root, { replace: true, preserveScroll: false })
  }
  window.addEventListener('popstate', syncRouteFromHistory)
  window.addEventListener('hashchange', syncRouteFromHistory)

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-aso-menu]')) {
      root.classList.toggle('is-menu-open')
      return
    }
    const aboutAnchor = event.target.closest('.aso-about a[href^="#"]')
    if (aboutAnchor) {
      const section = aboutSectionIdFromHash(aboutAnchor.getAttribute('href') || '')
      if (section) {
        event.preventDefault()
        setShellView(root, 'about', { section })
        return
      }
    }
    const panoramaLink = event.target.closest('[data-panorama-href]')
    if (panoramaLink) {
      event.preventDefault()
      openConfiguredLink(root, panoramaLink.dataset.panoramaHref)
      return
    }
    const navButton = event.target.closest('[data-aso-nav]')
    if (navButton) {
      event.preventDefault()
      setShellView(root, navButton.dataset.asoNav, {
        portalMode: navButton.dataset.portalMode,
        category: navButton.dataset.appCategoryGoto,
        appId: navButton.dataset.appGoto,
        section: navButton.dataset.asoNav === 'about' ? 'intro' : undefined,
      })
      return
    }
    const homeScroll = event.target.closest('[data-home-scroll]')
    if (homeScroll) {
      const target = root.querySelector(`#aso-home-${homeScroll.dataset.homeScroll}`) || root.querySelector(`[data-home-${homeScroll.dataset.homeScroll}]`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const sceneTab = event.target.closest('[data-home-scene]')
    if (sceneTab) {
      const sceneId = sceneTab.dataset.homeScene
      const scenesRoot = sceneTab.closest('[data-home-scenes]')
      if (!scenesRoot) return
      scenesRoot.querySelectorAll('[data-home-scene]').forEach((button) => {
        const active = button === sceneTab
        button.classList.toggle('is-active', active)
        button.setAttribute('aria-selected', String(active))
      })
      scenesRoot.querySelectorAll('[data-home-scene-panel]').forEach((panel) => {
        const active = panel.dataset.homeScenePanel === sceneId
        panel.classList.toggle('is-active', active)
        panel.hidden = !active
      })
      return
    }
    if (event.target.closest('[data-login-prompt-close]')) {
      setLoginPromptOpen(root, false)
      return
    }
    const personalLogin = event.target.closest('[data-personal-login]')
    if (personalLogin) {
      void startPersonalLogin(root, personalLogin)
      return
    }
    const accountToggle = event.target.closest('[data-aso-account-toggle]')
    if (accountToggle) {
      const menu = accountToggle.closest('[data-aso-account-menu]')
      const open = !menu?.classList.contains('is-open')
      setAccountMenuOpen(root, open)
      return
    }
    if (event.target.closest('[data-aso-logout]')) {
      setAccountMenuOpen(root, false)
      void logoutPortalAccount()
      return
    }
    if (root.querySelector('[data-aso-account-menu].is-open') && !event.target.closest('[data-aso-account-menu]')) {
      setAccountMenuOpen(root, false)
    }
    if (event.target.closest('[data-quick-settings-open]')) {
      setQuickSettingsOpen(root, true)
      return
    }
    if (event.target.closest('[data-quick-settings-close]')) {
      setQuickSettingsOpen(root, false)
      return
    }
    if (event.target.closest('[data-quick-admin-login]')) {
      void loginQuickSettingsAdmin(root)
      return
    }
    const quickAction = event.target.closest('[data-quick-action]')
    if (quickAction) {
      openQuickAction(root, quickAction)
      return
    }

    if (event.target.closest('[data-action="manage-apps"]')) {
      showToast('已预留统一能力注册与子系统快速接入接口')
      return
    }

    if (event.target.closest('[data-embed-close]')) {
      closeAppEmbed(root)
      return
    }

    if (event.target.closest('[data-device-modal-close]')) {
      setDeviceModalOpen(root, false)
      return
    }

    if (event.target.closest('[data-invite-modal-close]')) {
      setInviteModalOpen(root, false)
      return
    }

    const enterApp = event.target.closest('[data-enter-app]')
    if (enterApp) {
      const appId = enterApp.dataset.enterApp
      const app = apps.find((item) => item.id === appId)
      const feature = root.dataset.pendingActivityFeature || (app ? `进入${app.name}首页` : '')
      delete root.dataset.pendingActivityFeature
      if (app) void reportActivity(root, app, feature)
      if (app?.requireDevice) {
        setDeviceModalOpen(root, true)
        return
      }
      if (app?.requireInvite) {
        setInviteModalOpen(root, true)
        return
      }
      if (app) {
        void openAppInNewPage(root, app)
        return
      }
      showToast('该业务系统暂未配置访问地址')
      return
    }

    const recentPageButton = event.target.closest('[data-recent-page]')
    if (recentPageButton) {
      if (recentPageButton.disabled) return
      const nextPage = Number(recentPageButton.dataset.recentPage)
      if (!Number.isFinite(nextPage) || nextPage < 1 || nextPage > recentPageCount()) return
      recentPage = nextPage
      updateRecentVisits(root)
      return
    }

    const recentVisit = event.target.closest('[data-recent-activity]')
    if (recentVisit) {
      const activity = recentActivities[Number(recentVisit.dataset.recentActivity)]
      if (!activity) return
      if (activity.deepLink) {
        window.open(activity.deepLink, '_blank', 'noopener,noreferrer')
        return
      }
      const app = apps.find((item) => item.id === activity.appId)
      if (app) {
        void reportActivity(root, app, activity.feature || `进入${app.name}首页`)
        if (app.requireDevice) setDeviceModalOpen(root, true)
        else if (app.requireInvite) setInviteModalOpen(root, true)
        else void openAppInNewPage(root, app)
      }
      else showToast('对应系统暂时无法打开')
      return
    }

    const enter = event.target.closest('[data-action], [data-task]')
    if (enter) {
      showToast('该功能暂未配置访问地址')
      return
    }

    const doc = event.target.closest('[data-doc]')
    if (doc) {
      const fileUrl = doc.dataset.docUrl || docs.find((item) => item.id === doc.dataset.docId || item.title === doc.dataset.doc)?.fileUrl || ''
      if (fileUrl) {
        window.open(fileUrl, '_blank', 'noopener,noreferrer')
        return
      }
      showToast(`《${doc.dataset.doc || '文档'}》尚未上传文件`)
      return
    }

    if (event.target.closest('[data-contact-open]')) {
      setContactModalOpen(root, true)
      return
    }

    if (event.target.closest('[data-contact-modal-close]')) {
      setContactModalOpen(root, false)
      return
    }

    if (event.target.closest('[data-show-all]')) {
      const list = root.querySelector('[data-doc-list]')
      const allBtn = root.querySelector('[data-doc-category="全部文档"]')
      allBtn?.click()
      list?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  })

  root.addEventListener('submit', (event) => {
    if (event.target.matches('[data-invite-form]')) {
      event.preventDefault()
      submitVisitorInvite(root, event.target)
      return
    }
    if (event.target.matches('[data-contact-form]')) {
      event.preventDefault()
      submitContactRequest(root, event.target)
      return
    }
    if (!event.target.matches('[data-quick-settings-form]')) return
    event.preventDefault()
    void publishQuickSettings(root)
  })

  const docList = root.querySelector('[data-doc-list]')
  let activeCategory = '全部文档'
  root.querySelectorAll('[data-doc-category]').forEach((button) => {
    button.addEventListener('click', () => {
      root.querySelectorAll('[data-doc-category]').forEach((item) => item.classList.toggle('is-active', item === button))
      activeCategory = button.dataset.docCategory
      docList.innerHTML = docRows(activeCategory)
    })
  })

  const searchForm = root.querySelector('[data-help-search]')
  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault()
    const keyword = event.currentTarget.querySelector('input').value
    docList.innerHTML = docRows(activeCategory, keyword)
    root.querySelector('.aso-docs')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })

  root.querySelectorAll('[data-hot-search]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const keyword = chip.dataset.hotSearch
      const input = searchForm?.querySelector('input')
      if (input) input.value = keyword
      docList.innerHTML = docRows(activeCategory, keyword)
    })
  })

  initAppFilters(root)
  initCategoryDrag(root)
  initPanoramaFlow(root)
  initHomeGlobe(root)

  root.querySelector('[data-embed-close]')?.addEventListener('click', () => closeAppEmbed(root))
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!root.querySelector('[data-contact-modal]')?.hidden) setContactModalOpen(root, false)
    else if (!root.querySelector('[data-invite-modal]')?.hidden) setInviteModalOpen(root, false)
    else if (!root.querySelector('[data-device-modal]')?.hidden) setDeviceModalOpen(root, false)
    else if (!root.querySelector('[data-login-prompt]')?.hidden) setLoginPromptOpen(root, false)
    else if (!root.querySelector('[data-quick-settings]')?.hidden) setQuickSettingsOpen(root, false)
    else if (!root.querySelector('[data-aso-embed]')?.hidden) closeAppEmbed(root)
  })
}
