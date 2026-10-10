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
  },
  {
    id: 'meeting-control-screen',
    name: '会议室自控',
    category: 'meeting',
    project: '会议空间',
    desc: '会议设备与空间环境集中控制能力正在开发中。',
    icon: 'settings_remote',
    locked: true,
  },
  {
    id: 'wireless-screen',
    name: '无线投屏',
    category: 'meeting',
    project: '会议空间',
    desc: '跨设备无线投屏与内容共享能力正在开发中。',
    icon: 'cast',
    locked: true,
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
    url: 'https://asset.atuofuture.com/',
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
    desc: '碳排核算、减排分析与双碳目标管理能力正在规划中。',
    icon: 'co2',
    locked: true,
  },
  {
    id: 'access-security',
    name: '门禁安防',
    category: 'security',
    project: '安全管理',
    desc: '门禁通行、事件告警与安防管理能力正在开发中。',
    icon: 'shield_lock',
    locked: true,
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
    desc: '统一设备接入、状态监测和设备生命周期管理能力正在建设中。',
    icon: 'devices_other',
    locked: true,
  },
  {
    id: 'space-center',
    name: '空间中心',
    category: 'foundation',
    group: 'base',
    project: '基础能力',
    desc: '统一园区、楼栋、楼层和房间空间模型能力正在建设中。',
    icon: 'map',
    locked: true,
  },
  {
    id: 'permission-center',
    name: '权限中心',
    category: 'foundation',
    group: 'base',
    project: '基础能力',
    desc: '统一角色、组织与业务权限配置能力正在建设中。',
    icon: 'admin_panel_settings',
    locked: true,
  },
  {
    id: 'person-center',
    name: '人员中心',
    category: 'foundation',
    group: 'base',
    project: '基础能力',
    desc: '统一人员档案、组织关系和身份信息管理能力正在建设中。',
    icon: 'badge',
    locked: true,
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
  },
  {
    id: 'smart-lighting',
    name: '智能照明',
    category: 'foundation',
    group: 'control',
    project: '智能控制',
    desc: '照明回路、调光策略与场景联动能力正在建设中。',
    icon: 'lightbulb',
    locked: true,
  },
  {
    id: 'smart-air',
    name: '智能空调',
    category: 'foundation',
    group: 'control',
    project: '智能控制',
    desc: '空调设备集中控制与节能策略能力正在建设中。',
    icon: 'ac_unit',
    locked: true,
  },
  {
    id: 'smart-sensor',
    name: '智能传感',
    category: 'foundation',
    group: 'control',
    project: '智能控制',
    desc: '环境与空间状态感知、数据采集能力正在建设中。',
    icon: 'sensors',
    locked: true,
  },
  {
    id: 'smart-scene',
    name: '智能场景',
    category: 'foundation',
    group: 'control',
    project: '智能控制',
    desc: '跨设备场景编排、自动联动与策略执行能力正在建设中。',
    icon: 'auto_awesome',
    locked: true,
  },
  {
    id: 'visitor-booking',
    name: '访客预约',
    category: 'visitor',
    project: '访客管理',
    desc: '访客邀约、审批、登记与到访管理能力正在开发中。',
    icon: 'person_add',
    locked: true,
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

function appCategoryMeta(categoryId) {
  const category = appCategories.find(([id]) => id === categoryId)
  return category || ['other', 'apps', '其他能力', '']
}

function catalogMeta(categoryId) {
  if (categoryId === 'favorites') return ['star', '我的收藏', '集中查看你收藏的常用业务能力']
  if (categoryId === 'all') return ['grid_view', '全部业务能力', '按业务场景浏览 Aspace空间智能 已接入和规划中的能力']
  const [, ico, label, description] = appCategoryMeta(categoryId)
  return [ico, label, description]
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

const docs = [
  { title: 'Aspace空间智能快速入门指南', category: '全部文档', date: '2026-09-12', featured: true, keywords: '权限申请 账号绑定 入门' },
  { title: '能源能耗数据接入说明', category: '能源能耗', date: '2026-09-10', featured: true, keywords: '能耗数据接入 网关 采集' },
  { title: 'AI画报使用手册', category: 'AI画报', date: '2026-09-08', keywords: '模板 发布' },
  { title: '电子相册发布流程', category: '电子相册', date: '2026-09-06', keywords: '电子相册发布 多屏同步' },
  { title: '会议室预约配置操作指南', category: '会议室预约系统', date: '2026-09-03', keywords: '会议室预约 中控屏配置 设备绑定' },
  { title: '设备管理平台 API 文档', category: '会议与空间', date: '2026-08-28', keywords: '接口 对接' },
  { title: '项目实施规范', category: '项目服务', date: '2026-08-20', keywords: '权限申请 交付 验收' },
]

const docCategories = [
  ['description', '全部文档'],
  ['bar_chart', '能源能耗'],
  ['image', 'AI画报'],
  ['photo_library', '电子相册'],
  ['desktop_windows', '会议室预约系统'],
  ['groups', '会议与空间'],
  ['folder', '项目服务'],
]

const hotSearches = ['会议室预约', '权限申请', '能耗数据接入', '电子相册发布']

const featuredDocs = [
  { title: 'Aspace空间智能快速入门指南', date: '2026-09-12', badge: '新手必读', tone: 'blue', art: 'lines' },
  { title: '能源能耗数据接入说明', date: '2026-09-10', badge: '热门文档', tone: 'teal', art: 'chart' },
]

const updates = [
  ['2026-09-18', '设备管理平台 v3.2 正式发布', '新增设备批量配置能力，优化告警通知机制。'],
  ['2026-09-10', 'AI画报新增模板库', '新增多套行业模板，支持企业文化发布。'],
  ['2026-09-03', '电子相册发布流程优化', '支持定时发布与多屏同步。'],
]

const supportCards = [
  ['monitor_heart', '系统状态查询', '查看各产品服务状态'],
  ['manage_accounts', '账号与权限', '账号绑定、权限申请'],
  ['support', '提交服务工单', '遇到问题？提交工单', true],
  ['contact_page', '联系客户经理', '获取一对一服务支持'],
  ['rate_review', '功能建议', '告诉我们您的想法'],
]

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
            : `<img src="${app.image}" alt="${app.alt}" width="640" height="400" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async" />`}
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
  const query = keyword.trim().toLowerCase()
  // 默认视图里精选文档已在上方卡片展示，不再重复出现在列表中。
  const isDefaultView = category === '全部文档' && !query
  const filtered = docs.filter((item) => {
    if (isDefaultView && item.featured) return false
    const categoryMatch = category === '全部文档' || item.category === category
    return categoryMatch && (!query || `${item.title} ${item.category} ${item.keywords || ''}`.toLowerCase().includes(query))
  })
  if (!filtered.length) return '<p class="aso-empty">没有找到匹配的文档。</p>'
  return filtered.map((item) => `
    <button class="aso-doc-row" type="button" data-doc="${item.title}">
      <i>${icon('description')}</i>
      <span class="aso-doc-row__title">${item.title}</span>
      <time>${item.date}</time>
      ${icon('chevron_right')}
    </button>`).join('')
}

function portalAccountMarkup() {
  const user = window.ASPACE_CURRENT_USER
  if (user?.id) {
    const name = String(user.name || user.displayName || user.email || '已登录')
    return `
      <button type="button" class="aso-shell__account is-logged-in" data-aso-account title="${escapeHtml(name)}">
        <span class="aso-shell__avatar">${escapeHtml(name.slice(0, 1))}</span>
        <span>${escapeHtml(name)}</span>
      </button>`
  }
  return `
    <button type="button" class="aso-shell__account" data-personal-login>
      ${icon('person')}
      <span>登录</span>
    </button>`
}

function renderShellHeader(activeView = 'home') {
  const items = [
    ['home', '首页'],
    ['apps', '应用广场'],
    ['help', '自助服务'],
    ['about', '关于我们'],
  ]
  return `
    <header class="aso-shell">
      <div class="aso-shell__inner">
        <a class="aso-shell__brand" href="/aspace-one/" data-aso-nav="home">
          <img src="/assets/artink-logo-light.png" alt="" width="120" height="28" />
          <span>安墨客空间智能</span>
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

function homeAppById(id) {
  return apps.find((app) => app.id === id)
}

function renderHomeFeaturedCard(id, desc) {
  const app = homeAppById(id)
  if (!app) return ''
  const image = app.image
    ? `<img src="${escapeHtml(app.image)}" alt="${escapeHtml(app.alt || app.name)}" loading="lazy" />`
    : `<div class="aso-home-pick__placeholder">${icon(app.icon || 'apps')}</div>`
  return `
    <article class="aso-home-pick">
      <div class="aso-home-pick__media">${image}</div>
      <h3>${escapeHtml(app.name)}</h3>
      <p>${escapeHtml(desc)}</p>
      <button type="button" data-enter-app="${escapeHtml(app.id)}">了解应用 ${icon('arrow_forward')}</button>
    </article>`
}

function renderHomeView() {
  const panorama = [
    {
      icon: 'calendar_month',
      title: '会议与办公',
      desc: '提升空间使用效率',
      items: [
        ['screen', '会议预约'],
        ['deskplate', '智能门牌'],
        ['meeting-control-screen', '会议控制'],
      ],
    },
    {
      icon: 'view_in_ar',
      title: '资产与仓储',
      desc: '掌握资产全生命周期',
      items: [
        ['resource', '资产台账'],
        ['resource', 'RFID盘点'],
        ['resource', '借还管理'],
      ],
    },
    {
      icon: 'settings',
      title: '设备与能源',
      desc: '看清运行与能源使用',
      items: [
        ['device-center', '设备监测'],
        ['smart-air', '空调控制'],
        ['energy', '能耗分析'],
      ],
    },
    {
      icon: 'person',
      title: '通行与服务',
      desc: '连接人员与日常服务',
      items: [
        ['visitor-booking', '访客接待'],
        ['access-security', '门禁通行'],
        ['aspace', '工单巡检'],
      ],
    },
    {
      icon: 'bar_chart',
      title: '可视化与展示',
      desc: '让空间状态清晰可见',
      items: [
        ['digital-twin', '数字孪生'],
        ['info-publish', '信息发布'],
        ['album', '电子相框'],
      ],
    },
  ]
  const scenes = [
    {
      id: 'office',
      label: '企业办公',
      title: '让办公空间高效运转',
      lead: '连接会议、资产与日常服务，提升办公体验与管理效率。',
      image: '/images/aspace-one/showcase-meeting.jpg',
      apps: [
        ['screen', '会议预约', 'calendar_month'],
        ['resource', '资产管理', 'view_in_ar'],
        ['info-publish', '信息发布', 'description'],
      ],
    },
    {
      id: 'campus',
      label: '园区楼宇',
      title: '让园区运行状态一目了然',
      lead: '以数字孪生串联楼宇、设备与能耗，支撑运营调度与态势感知。',
      image: '/images/aspace-one/showcase-building.jpg',
      apps: [
        ['digital-twin', '数字孪生', 'deployed_code'],
        ['energy', '能源能耗', 'eco'],
        ['aspace', '空间管理', 'hub'],
      ],
    },
    {
      id: 'factory',
      label: '生产制造',
      title: '让产线周边空间更可控',
      lead: '把设备状态、环境控制与安全通行纳入统一门户，缩短现场响应链路。',
      image: '/images/aspace-one/showcase-control.jpg',
      apps: [
        ['device-center', '设备中心', 'devices_other'],
        ['smart-sensor', '智能传感', 'sensors'],
        ['access-security', '门禁安防', 'shield_lock'],
      ],
    },
    {
      id: 'warehouse',
      label: '智慧仓储',
      title: '让资产流转更清晰可追溯',
      lead: '从台账到借还、盘点，帮助仓储与行政团队掌握物资位置与状态。',
      image: '/images/aspace-one/app-resource.jpg',
      apps: [
        ['resource', '资产管理', 'inventory_2'],
        ['visitor-booking', '访客预约', 'person_add'],
        ['info-publish', '信息发布', 'campaign'],
      ],
    },
  ]
  const featured = [
    ['digital-twin', '三维呈现园区与楼宇运行态势'],
    ['resource', '覆盖资产台账、流转与盘点'],
    ['screen', '会前预约与会议空间服务入口'],
    ['info-publish', '统一管理多终端内容发布'],
  ]

  return `
    <section class="aso-home" data-aso-view="home">
      <section class="aso-home-hero">
        <img class="aso-home-hero__bg" src="/images/aspace-one/showcase-building.jpg" alt="" />
        <div class="aso-home-hero__shade" aria-hidden="true"></div>
        <div class="aso-container aso-home-hero__content">
          <div class="aso-home-hero__copy">
            <p class="aso-home-hero__eyebrow">ASPACE · 空间智能应用平台</p>
            <h1>连接空间业务<br />让智能应用触手可及</h1>
            <p class="aso-home-hero__lead">汇聚会务、资产、设备与能源等能力，帮助园区与楼宇团队更快找到并进入业务系统。</p>
            <div class="aso-home-hero__cta">
              <button type="button" class="aso-btn aso-btn--primary" data-aso-nav="apps">浏览应用广场 ${icon('arrow_forward')}</button>
              <button type="button" class="aso-btn aso-btn--hero-ghost" data-home-scroll="scenes">探索业务场景</button>
            </div>
          </div>
        </div>
      </section>

      <section class="aso-home-panorama">
        <div class="aso-container">
          <header class="aso-home-panorama__head">
            <div>
              <h2>业务全景</h2>
              <p>从日常办公到空间运营，找到适合你的业务能力。</p>
            </div>
            <button type="button" class="aso-home-panorama__more" data-aso-nav="apps">查看全部能力 ${icon('north_east')}</button>
          </header>
          <div class="aso-home-panorama__grid">
            ${panorama.map((column) => `
            <article class="aso-home-panorama__col">
              <span class="aso-home-panorama__icon">${icon(column.icon)}</span>
              <h3>${escapeHtml(column.title)}</h3>
              <p>${escapeHtml(column.desc)}</p>
              <ul>
                ${column.items.map(([appId, label]) => `
                <li>
                  <button type="button" data-enter-app="${escapeHtml(appId)}">
                    <span>${escapeHtml(label)}</span>
                    ${icon('arrow_forward')}
                  </button>
                </li>`).join('')}
              </ul>
            </article>`).join('')}
          </div>
        </div>
      </section>

      <section class="aso-home-scenes" id="aso-home-scenes" data-home-scenes>
        <div class="aso-container">
          <header class="aso-home-section__head">
            <div>
              <h2>从你的业务场景开始</h2>
              <p>围绕实际需求，发现可以协同使用的应用。</p>
            </div>
          </header>
          <div class="aso-home-scenes__tabs" role="tablist" aria-label="业务场景">
            ${scenes.map((scene, index) => `
            <button type="button" role="tab" class="${index === 0 ? 'is-active' : ''}" aria-selected="${index === 0 ? 'true' : 'false'}" data-home-scene="${escapeHtml(scene.id)}">${escapeHtml(scene.label)}</button>`).join('')}
          </div>
          ${scenes.map((scene, index) => `
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
                  ${scene.apps.map(([appId, label, ico]) => `
                  <li>
                    <button type="button" data-enter-app="${escapeHtml(appId)}">
                      <i>${icon(ico)}</i>
                      <strong>${escapeHtml(label)}</strong>
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

      <section class="aso-home-featured">
        <div class="aso-container">
          <header class="aso-home-section__head">
            <div>
              <h2>精选应用</h2>
              <p>优先呈现高频业务入口，便于快速进入</p>
            </div>
            <button type="button" class="aso-home-section__more" data-aso-nav="apps">查看全部应用 ${icon('arrow_forward')}</button>
          </header>
          <div class="aso-home-featured__grid">
            ${featured.map(([id, desc]) => renderHomeFeaturedCard(id, desc)).join('')}
          </div>
        </div>
      </section>

      <section class="aso-home-utils">
        <div class="aso-container aso-home-utils__grid">
          <button type="button" data-aso-nav="help">
            <span>${icon('menu_book')}</span>
            <strong>使用指南</strong>
            <em>了解开通与使用方式</em>
          </button>
          <a href="/hardware/">
            <span>${icon('dns')}</span>
            <strong>智能硬件</strong>
            <em>探索配套设备与接入</em>
          </a>
          <button type="button" data-aso-nav="about">
            <span>${icon('support_agent')}</span>
            <strong>方案咨询</strong>
            <em>获取适合你的应用方案</em>
          </button>
        </div>
      </section>

      <footer class="aso-home-footer">
        <div class="aso-container aso-home-footer__inner">
          <div class="aso-home-footer__brand">
            <img src="/assets/artink-logo.png" alt="Artink 安墨客" width="108" height="26" />
            <p>AI 让空间更智能，让运营更简单</p>
          </div>
          <nav class="aso-home-footer__nav" aria-label="页脚导航">
            <button type="button" data-aso-nav="apps">应用广场</button>
            <button type="button" data-aso-nav="help">自助服务</button>
            <button type="button" data-aso-nav="about">关于我们</button>
          </nav>
        </div>
      </footer>
    </section>`
}

function renderAboutView() {
  return `
    <section class="aso-about" data-aso-view="about" hidden>
      <div class="aso-container">
        <header class="aso-about__head">
          <p class="aso-eyebrow">ABOUT</p>
          <h1>关于安墨客空间智能</h1>
          <p>安墨客空间智能（Aspace）面向园区、楼宇与运营团队，提供可浏览、可进入、可协作的空间业务门户。</p>
        </header>
        <div class="aso-about__grid">
          <article>
            <h2>我们做什么</h2>
            <p>把分散在会议、信息发布、资产、能耗、安防与智能底座中的能力汇聚到同一入口，减少系统切换成本，提升日常运营效率。</p>
          </article>
          <article>
            <h2>适合谁用</h2>
            <p>空间运营、行政会务、设施运维、信息化与业务管理员，都可以从应用广场进入对应能力，或在自助服务中心快速查找文档。</p>
          </article>
          <article>
            <h2>如何开始</h2>
            <p>登录后可同步收藏、最近访问与个性化排序。未登录也可浏览公开能力，进入已开通系统完成日常工作。</p>
          </article>
        </div>
        <div class="aso-about__cta">
          <button type="button" class="aso-btn aso-btn--primary" data-aso-nav="apps">进入应用广场</button>
          ${window.ASPACE_CURRENT_USER?.id
            ? `<button type="button" class="aso-btn aso-btn--ghost" data-aso-nav="home">返回首页</button>`
            : `<button type="button" class="aso-btn aso-btn--ghost" data-personal-login>登录账号</button>`}
        </div>
      </div>
    </section>`
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
                  ${icon('grid_view')}<span>全部能力</span><i>${apps.length}</i>
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
                  ${icon(ico)}<span>${label}</span>${icon('drag_indicator', 'aso-category-drag')}<i>${apps.filter((app) => app.category === id).length}</i>
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

              <div class="aso-app-grid" data-app-grid>${apps.map(appCard).join('')}${capabilityGroupHeadingsMarkup()}</div>
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
              <h2>自助服务中心</h2>
              <p class="aso-help__lead">搜索知识、获取帮助，让问题更快解决</p>
            </div>
            <div class="aso-help__find">
              <form class="aso-search" data-help-search>
                ${icon('search')}
                <input type="search" aria-label="搜索文档" placeholder="搜索帮助文档、问题或关键词，例如：如何预约会议室、如何申请权限" />
                <button type="submit">搜索</button>
              </form>
              <div class="aso-hot">
                <span>热门搜索：</span>
                ${hotSearches.map((word) => `<button type="button" data-hot-search="${word}">${word}</button>`).join('')}
              </div>
            </div>
            <figure class="aso-help__deco" aria-hidden="true">
              <i class="aso-help__deco-back"></i>
              <i class="aso-help__deco-page"><span></span><span></span><span></span></i>
            </figure>
          </header>
          <div class="aso-help__grid">
            <nav class="aso-doc-cats" aria-label="文档分类">
              ${docCategories.map(([ico, name], index) => `<button class="${index === 0 ? 'is-active' : ''}" type="button" data-doc-category="${name}">${icon(ico)}<span>${name}</span></button>`).join('')}
            </nav>
            <div class="aso-docs">
              <h3>文档中心</h3>
              <p class="aso-docs__lead">精选指南与操作说明，快速上手 Aspace空间智能。</p>
              <div class="aso-docs__feature">
                ${featuredDocs
                  .map(
                    (doc) => `
                <button class="aso-doc-card aso-doc-card--${doc.tone}" type="button" data-doc="${doc.title}">
                  <span class="aso-doc-art aso-doc-art--${doc.art}" aria-hidden="true">
                    <i class="aso-doc-art__back"></i>
                    <i class="aso-doc-art__page"><span></span><span></span><span></span><span></span></i>
                  </span>
                  <span class="aso-doc-card__copy">
                    <em>${doc.badge}</em>
                    <b>${doc.title}</b>
                    <time>${doc.date}</time>
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
                ${updates.map(([date, title, desc]) => `<li><time>${date}</time><div><b>${title}</b><p>${desc}</p></div></li>`).join('')}
              </ol>
            </aside>
          </div>
          <div class="aso-support" id="support">
            <div class="aso-support__head">
              ${icon('headset_mic')}
              <div><b>获取帮助</b><small>多种方式为您提供支持</small></div>
            </div>
            <div class="aso-support__list">
              ${supportCards
                .map(
                  ([ico, title, desc, primary]) => `
              <button class="aso-support__card${primary ? ' is-primary' : ''}" type="button" data-support="${title}">
                ${icon(ico)}<span><b>${title}</b><small>${desc}</small></span>${icon('chevron_right')}
              </button>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </section>
      </div>
      ${renderAboutView()}

      <div class="aso-toast" role="status" data-aso-toast aria-hidden="true"></div>
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

function setShellView(root, view, { portalMode } = {}) {
  let nextView = ['home', 'apps', 'help', 'about'].includes(view) ? view : 'home'
  if (nextView === 'apps' && portalMode === 'help') nextView = 'help'
  const contentView = nextView === 'help' ? 'apps' : nextView
  root.querySelectorAll('[data-aso-view]').forEach((section) => {
    section.hidden = section.dataset.asoView !== contentView
  })
  root.querySelectorAll('[data-aso-nav]').forEach((item) => {
    const active = item.dataset.asoNav === nextView
    item.classList.toggle('is-active', active)
    if (item.matches('button, a')) item.setAttribute('aria-current', active ? 'page' : 'false')
  })
  root.dataset.activeShellView = nextView
  root.classList.remove('is-menu-open')
  if (contentView === 'apps') setPortalMode(root, nextView === 'help' ? 'help' : 'overview')
  window.scrollTo({ top: 0, behavior: 'auto' })
  const nextHash = nextView === 'home' ? '' : `#${nextView}`
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
    window.history.replaceState({}, '', nextUrl)
  }
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
      sessionStorage.setItem('aspace-one-oidc-tokens', JSON.stringify(tokens))
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
    const tokens = JSON.parse(sessionStorage.getItem('aspace-one-oidc-tokens') || 'null')
    if (!tokens?.access_token) return
    const user = await readPortalUser(tokens.access_token)
    window.ASPACE_CURRENT_USER = { id: user.sub, ...user }
  } catch {
    sessionStorage.removeItem('aspace-one-oidc-tokens')
    window.ASPACE_CURRENT_USER = null
  }
}

async function createPortalLoginUrl() {
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = base64Url(await sha256(verifier))
  const state = base64Url(crypto.getRandomValues(new Uint8Array(24)))
  const nonce = base64Url(crypto.getRandomValues(new Uint8Array(24)))
  sessionStorage.setItem('aspace-one-oidc-pending', JSON.stringify({ verifier, state, nonce }))
  const authorizeUrl = new URL('/auth/auth', window.location.origin)
  authorizeUrl.search = new URLSearchParams({
    client_id: 'aspace-one',
    redirect_uri: `${window.location.origin}/aspace-one/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString()
  return authorizeUrl.toString()
}

function isPortalAuthenticated() {
  return Boolean(window.ASPACE_CURRENT_USER?.id)
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

async function startPersonalLogin(root) {
  const loginUrl = String(window.ASPACE_AUTH_LOGIN_URL || '').trim()
  if (loginUrl) {
    window.location.href = loginUrl
    return
  }
  const loginButton = root.querySelector('[data-login-prompt] [data-personal-login]')
  if (loginButton) {
    loginButton.disabled = true
    loginButton.textContent = '正在进入登录…'
  }
  try {
    window.location.href = await createPortalLoginUrl()
  } catch {
    if (loginButton) {
      loginButton.disabled = false
      loginButton.textContent = '立即登录'
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
    const assignments = new Map(data.catalog.apps.map((app) => [app.id, app.category]))
    apps.forEach((app) => {
      const category = assignments.get(app.id)
      if (configuredIds.has(category)) app.category = category
    })
  } catch {
    // 后台栏目配置不可用时继续使用页面内置配置。
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

function openQuickAction(root, action) {
  const url = String(action?.dataset.quickUrl || '').trim()
  if (!url) {
    showToast('该快捷入口尚未配置链接')
    return
  }
  if (url.startsWith('app:')) {
    const appId = url.slice(4)
    const button = root.querySelector(`[data-enter-app="${CSS.escape(appId)}"]`)
    if (button) {
      root.dataset.pendingActivityFeature = action.querySelector('span')?.textContent?.trim() || ''
      button.click()
    }
    else showToast('对应应用不存在或尚未开通')
    return
  }
  if (/^https?:\/\//i.test(url)) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  window.location.href = url
}

export async function initAspaceOne() {
  const root = document.getElementById('aspace-one-root')
  if (!root) return
  await initPortalAuth()
  await loadCatalog()
  loadAppPreferences()
  await Promise.all([loadQuickActions(), loadRecentActivities()])
  root.innerHTML = renderPortal()
  const hash = window.location.hash
  const initialView = hash === '#about'
    ? 'about'
    : hash === '#help'
      ? 'help'
      : hash === '#apps'
        ? 'apps'
        : 'home'
  setShellView(root, initialView)
  if (portalAuthError) showToast(portalAuthError)
  bindActivityMessages(root)

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-aso-menu]')) {
      root.classList.toggle('is-menu-open')
      return
    }
    const navButton = event.target.closest('[data-aso-nav]')
    if (navButton) {
      event.preventDefault()
      setShellView(root, navButton.dataset.asoNav, { portalMode: navButton.dataset.portalMode })
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
    if (event.target.closest('[data-personal-login]')) {
      void startPersonalLogin(root)
      return
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

    const enterApp = event.target.closest('[data-enter-app]')
    if (enterApp) {
      const appId = enterApp.dataset.enterApp
      const app = apps.find((item) => item.id === appId)
      const feature = root.dataset.pendingActivityFeature || (app ? `进入${app.name}首页` : '')
      delete root.dataset.pendingActivityFeature
      if (app) void reportActivity(root, app, feature)
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
        void openAppInNewPage(root, app)
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
      showToast(`正在打开《${doc.dataset.doc}》（文档接口待接入）`)
      return
    }

    const support = event.target.closest('[data-support]')
    if (support) {
      showToast(`${support.dataset.support}：服务流程待接入`)
      return
    }

    if (event.target.closest('[data-show-all]')) showToast('完整列表将在对应模块接口接入后开放')
  })

  root.addEventListener('submit', (event) => {
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

  root.querySelector('[data-embed-close]')?.addEventListener('click', () => closeAppEmbed(root))
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!root.querySelector('[data-login-prompt]')?.hidden) setLoginPromptOpen(root, false)
    else if (!root.querySelector('[data-quick-settings]')?.hidden) setQuickSettingsOpen(root, false)
    else if (!root.querySelector('[data-aso-embed]')?.hidden) closeAppEmbed(root)
  })
}
