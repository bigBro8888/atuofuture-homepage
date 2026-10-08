const apps = [
  {
    id: 'resource',
    name: 'AAP资产管理系统',
    category: 'asset',
    project: '王力集团总部项目',
    time: '2026-09-18 11:40',
    image: '/images/aspace-one/app-resource.jpg',
    alt: 'AAP 资产管理系统示意',
    url: 'https://asset.atuofuture.com/',
    embed: 'aap',
  },
  {
    id: 'screen',
    name: '会议室预约系统',
    category: 'meeting',
    project: '北京研发中心项目',
    time: '2026-09-21 09:12',
    warning: '1 台设备离线',
    image: '/images/aspace-one/app-control.jpg',
    alt: '会议室预约与中控屏场景',
    embedUrl: 'http://47.95.170.47/pages/dashboard.html?_av=20260929f',
  },
  {
    id: 'poster',
    name: 'AI画报',
    category: 'content',
    project: '上海展示项目',
    time: '2026-09-19 10:15',
    image: '/images/aspace-one/app-poster.jpg',
    alt: 'AI画报在平板上的展示效果',
    sso: 'poster',
  },
  {
    id: 'energy',
    name: '能源能耗',
    category: 'energy',
    project: '王力集团总部项目',
    time: '2026-09-20 14:32',
    image: '/images/aspace-one/app-energy.jpg',
    alt: '楼宇能耗看板场景',
    embedUrl: 'http://47.95.170.47:8001/',
  },
  {
    id: 'album',
    name: '电子相册',
    category: 'content',
    project: '杭州园区项目',
    time: '2026-09-18 16:20',
    image: '/images/aspace-one/app-album.jpg',
    alt: '大屏电子相册多屏展示场景',
    href: '/app-download/',
  },
  {
    id: 'aspace',
    name: '空间智能管理平台',
    category: 'space',
    project: 'Aspace One 综合管理项目',
    time: '2026-09-30 18:02',
    image: '/images/aspace-one/showcase-building.jpg',
    alt: '空间智能管理平台场景',
    embedUrl: 'https://aspacedev.atuofuture.com/',
  },
  {
    id: 'info-publish',
    name: '信息发布平台',
    category: 'content',
    project: '企业信息发布项目',
    time: '2026-09-30 18:02',
    image: '/images/aspace-one/app-poster.jpg',
    alt: '信息发布平台场景',
    embedUrl: 'https://info-publish.atuofuture.com/',
  },
  {
    id: 'deskplate',
    name: '桌牌管理系统',
    category: 'device',
    project: '智慧办公桌牌项目',
    time: '2026-09-30 18:02',
    image: '/images/aspace-one/showcase-meeting.jpg',
    alt: '桌牌管理系统场景',
    embedUrl: 'https://cloud.atuofuture.com/',
  },
  {
    id: 'digital-twin',
    name: '数字孪生',
    category: 'space',
    project: '楼宇数字孪生项目',
    time: '2026-10-08 14:20',
    image: '/images/aspace-one/showcase-space.jpg',
    alt: '数字孪生楼宇场景',
    url: 'http://47.95.170.47:8002/',
  },
]

const openedApps = apps.filter((app) => !app.locked).length
const lockedApps = apps.length - openedApps

const appFilters = [
  ['all', '全部', apps.length],
  ['open', '已开通', openedApps],
  ['locked', '未开通', lockedApps],
]

const appCategories = [
  ['asset', 'business_center', '资产管理'],
  ['meeting', 'groups', '会议管理'],
  ['energy', 'eco', '能源管理'],
  ['space', 'deployed_code', '空间运营'],
  ['content', 'description', '内容服务'],
  ['device', 'settings_input_component', '设备与物联'],
]

function appCategoryMeta(categoryId) {
  const category = appCategories.find(([id]) => id === categoryId)
  return category || ['other', 'apps', '其他应用']
}

let favoriteAppIds = new Set(['resource', 'poster', 'digital-twin'])

function loadAppPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem('aspace-one-favorite-apps') || 'null')
    if (Array.isArray(saved)) favoriteAppIds = new Set(saved.filter((id) => apps.some((app) => app.id === id)))
  } catch {
    // 本地偏好损坏时使用默认收藏。
  }
}

const docs = [
  { title: 'Aspace One 快速入门指南', category: '全部文档', date: '2026-09-12', featured: true, keywords: '权限申请 账号绑定 入门' },
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
  { title: 'Aspace One 快速入门指南', date: '2026-09-12', badge: '新手必读', tone: 'blue', art: 'lines' },
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

function icon(name, className = '') {
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

function recentVisitsMarkup() {
  if (!recentActivities.length) {
    return `
      <div class="aso-recent-panel__empty">
        ${icon('history')}
        <b>暂无最近访问</b>
        <p>进入应用或使用具体功能后，访问记录会显示在这里。</p>
      </div>`
  }
  return recentActivities.map((activity, index) => {
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
}

function appCard(app, index) {
  const locked = Boolean(app.locked)
  const [, categoryIcon, categoryLabel] = appCategoryMeta(app.category)
  const isFavorite = favoriteAppIds.has(app.id)
  return `
      <article class="aso-app-card${locked ? ' is-locked' : ''}" data-app="${app.id}" data-app-state="${locked ? 'locked' : 'open'}" data-app-category="${escapeHtml(app.category)}" data-app-search="${escapeHtml(`${app.name} ${app.project} ${categoryLabel}`.toLowerCase())}">
        <figure class="aso-app-card__shot">
          <img src="${app.image}" alt="${app.alt}" width="640" height="400" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async" />
          <span class="aso-status${locked ? ' aso-status--idle' : ''}"><i></i>${locked ? '未开通' : '运行中'}</span>
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
          ? '<button class="aso-btn aso-btn--muted" type="button" disabled>暂未开通</button>'
          : `<button class="aso-btn aso-btn--primary" type="button" data-enter-app="${app.id}">进入系统 ${icon('arrow_forward')}</button>`}
      </article>`
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

function renderPortal() {
  return `
    <div class="aso-page">
      <nav class="aso-subnav" aria-label="Aspace One 导航">
        <div class="aso-container aso-subnav__inner">
          <a class="aso-brand" href="#overview"><strong>Aspace One</strong><span>/ 空间智能产品平台</span><em>前端演示</em></a>
          <div class="aso-subnav__links">
            <a class="is-active" href="#overview">概览</a>
            <a href="#apps">我的应用</a>
            <a href="#help">文档中心</a>
            <a href="#support">服务支持</a>
          </div>
          <div class="aso-subnav__tools">
            <button class="aso-org" type="button" data-org-toggle aria-expanded="false">
              <span data-org-name>王力集团</span>${icon('expand_more')}
            </button>
            <button class="aso-icon-btn" type="button" data-notice-toggle aria-label="通知" aria-expanded="false">
              ${icon('notifications')}<b>2</b>
            </button>
            <button class="aso-avatar" type="button" data-account-toggle aria-label="账号菜单" aria-expanded="false">张</button>
          </div>
          <div class="aso-popover aso-org-menu" data-org-menu aria-hidden="true">
            <p>切换组织 / 项目</p>
            <button type="button" data-org="王力集团" data-project="王力集团总部项目"><b>王力集团</b><small>总部项目</small></button>
            <button type="button" data-org="华东体验中心" data-project="上海展示项目"><b>华东体验中心</b><small>上海展示项目</small></button>
          </div>
          <div class="aso-popover aso-notice-menu" data-notice-menu aria-hidden="true">
            <p>最新通知</p>
            <button type="button">中控屏离线告警<small>10 分钟前</small></button>
            <button type="button">AI画报权限已开通<small>昨天</small></button>
          </div>
          <div class="aso-popover aso-account-menu" data-account-menu aria-hidden="true">
            <p>张三 · 客户普通用户</p>
            <button type="button">个人信息</button>
            <button type="button">账号与安全</button>
            <button type="button">账号绑定</button>
            <button type="button">退出登录</button>
          </div>
        </div>
      </nav>

      <section class="aso-hero" id="overview">
        <div class="aso-container aso-apps" id="apps">
          <header class="aso-app-center__masthead">
            <div>
              <p class="aso-eyebrow">APPLICATION CENTER</p>
              <h1>应用中心</h1>
              <p class="aso-lead">连接每一个空间场景与运营服务</p>
            </div>
            <button class="aso-more" type="button" data-action="manage-apps">管理应用 ${icon('arrow_forward')}</button>
          </header>

          <div class="aso-app-center">
            <aside class="aso-app-sidebar" aria-label="应用分类">
              <nav>
                <button type="button" data-app-category-filter="favorites">
                  ${icon('star')}<span>我的收藏</span><i data-favorite-count>${favoriteAppIds.size}</i>
                </button>
                <button class="is-active" type="button" data-app-category-filter="all" aria-current="true">
                  ${icon('grid_view')}<span>全部应用</span><i>${apps.length}</i>
                </button>
                <button type="button" data-app-category-filter="recent">
                  ${icon('history')}<span>最近访问</span><i data-recent-count>${recentActivities.length}</i>
                </button>
              </nav>
              <div class="aso-app-sidebar__divider"></div>
              <p>业务分类</p>
              <nav>
                ${appCategories.map(([id, ico, label]) => `
                <button type="button" data-app-category-filter="${id}">
                  ${icon(ico)}<span>${label}</span><i>${apps.filter((app) => app.category === id).length}</i>
                </button>`).join('')}
              </nav>
            </aside>

            <div class="aso-app-catalog">
              <div class="aso-app-catalog__toolbar">
                <label class="aso-app-search">
                  ${icon('search')}
                  <input type="search" data-app-search-input aria-label="搜索应用" placeholder="搜索应用名称、项目或分类" />
                </label>
                <label class="aso-app-sort">
                  ${icon('schedule')}
                  <select data-app-sort aria-label="应用排序">
                    <option value="default">默认排序</option>
                    <option value="recent">最近使用</option>
                    <option value="name">按名称</option>
                  </select>
                </label>
              </div>

              <div class="aso-app-catalog__controls">
                <div class="aso-filters" role="tablist" aria-label="按开通状态筛选应用">
                  ${appFilters.map(([id, label, count], index) => `
                  <button class="${index === 0 ? 'is-active' : ''}" type="button" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" data-app-filter="${id}">${label} <i>${count}</i></button>`).join('')}
                  <span>共 <b data-visible-app-count>${apps.length}</b> 个应用</span>
                </div>
                <div class="aso-app-view" aria-label="切换应用视图">
                  <button class="is-active" type="button" data-app-view="grid" aria-label="网格视图" aria-pressed="true">${icon('grid_view')}</button>
                  <button type="button" data-app-view="list" aria-label="列表视图" aria-pressed="false">${icon('view_list')}</button>
                </div>
              </div>

              <div class="aso-app-grid" data-app-grid>${apps.map(appCard).join('')}</div>
              <p class="aso-empty aso-app-grid__empty" data-app-empty hidden>没有找到符合条件的应用。</p>
            </div>
            <section class="aso-recent-panel" data-recent-panel hidden>
              <header>
                <div>
                  <p class="aso-eyebrow">RECENT ACTIVITY</p>
                  <h2>最近访问</h2>
                  <p>按时间查看你最近进入的系统与使用过的功能，最新记录排在最前。</p>
                </div>
                <span>共 <b data-recent-panel-count>${recentActivities.length}</b> 条记录</span>
              </header>
              <div class="aso-recent-panel__grid" data-recent-visits>
                ${recentVisitsMarkup()}
              </div>
            </section>
          </div>
        </div>
      </section>

      <section class="aso-help aso-section" id="help">
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
              <p class="aso-docs__lead">精选指南与操作说明，快速上手 Aspace One。</p>
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

      <div class="aso-toast" role="status" data-aso-toast aria-hidden="true"></div>
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
            <small data-embed-meta>统一登录中…</small>
          </div>
          <a class="aso-embed__open" data-embed-open href="#" target="_blank" rel="noopener noreferrer">新窗口打开 ${icon('open_in_new')}</a>
        </header>
        <div class="aso-embed__stage">
          <div class="aso-embed__loading" data-embed-loading>
            <span class="aso-embed__spinner" aria-hidden="true"></span>
            <p data-embed-loading-text>正在通过统一身份进入系统…</p>
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

function currentPortalUser(root) {
  const org = root.querySelector('[data-org-name]')?.textContent?.trim() || '王力集团'
  return {
    name: '张三',
    org,
    email: 'zhangsan@aspace.atuofuture.local',
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

  if (app.sso || app.embed) {
    const endpoint = app.sso
      ? `/api/public/aspace/sso/${app.sso}`
      : `/api/public/aspace/sso/embed/${app.embed}`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentPortalUser(root)),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.embedUrl) {
      throw new Error(data.message || data.error || (app.sso ? '统一登录签发失败' : '打开失败'))
    }
    return data.embedUrl
  }

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

function bindAapSsoMessages(root) {
  window.addEventListener('message', (event) => {
    const data = event?.data
    if (!data || data.type !== 'aso-aap-sso') return
    root.querySelector('[data-embed-loading]')?.setAttribute('hidden', '')
    window.clearTimeout(openAppEmbed._loadingTimer)
    const meta = root.querySelector('[data-embed-meta]')
    const org = root.querySelector('[data-org-name]')?.textContent?.trim() || '王力集团'
    if (data.ok) {
      if (meta) meta.textContent = `${org} · 已统一登录`
      return
    }
    if (meta) meta.textContent = `${org} · 请登录 AAP`
    if (data.message) showToast(data.message)
  })
}

function closePopovers(except) {
  document.querySelectorAll('.aso-popover').forEach((popover) => {
    if (popover === except) return
    popover.classList.remove('is-open')
    popover.setAttribute('aria-hidden', 'true')
  })
}

function setPopover(menu, trigger, open) {
  closePopovers(menu)
  menu.classList.toggle('is-open', open)
  menu.setAttribute('aria-hidden', String(!open))
  trigger?.setAttribute('aria-expanded', String(open))
}

function initAppFilters(root) {
  const grid = root.querySelector('[data-app-grid]')
  const empty = root.querySelector('[data-app-empty]')
  const statusButtons = [...root.querySelectorAll('[data-app-filter]')]
  const categoryButtons = [...root.querySelectorAll('[data-app-category-filter]')]
  const searchInput = root.querySelector('[data-app-search-input]')
  const sortSelect = root.querySelector('[data-app-sort]')
  const viewButtons = [...root.querySelectorAll('[data-app-view]')]
  const visibleCount = root.querySelector('[data-visible-app-count]')
  const catalog = root.querySelector('.aso-app-catalog')
  const recentPanel = root.querySelector('[data-recent-panel]')
  if (!grid || !statusButtons.length || !categoryButtons.length) return

  let status = 'all'
  let category = 'all'
  let query = ''

  const applyFilters = () => {
    let visible = 0
    grid.querySelectorAll('[data-app-state]').forEach((card) => {
      const statusMatch = status === 'all' || card.dataset.appState === status
      const categoryMatch = category === 'all'
        || (category === 'favorites' ? favoriteAppIds.has(card.dataset.app) : card.dataset.appCategory === category)
      const queryMatch = !query || card.dataset.appSearch.includes(query)
      const match = statusMatch && categoryMatch && queryMatch
      card.classList.toggle('is-hidden', !match)
      if (match) visible += 1
    })
    if (visibleCount) visibleCount.textContent = String(visible)
    if (empty) empty.hidden = visible > 0
  }

  statusButtons.forEach((button) => {
    button.addEventListener('click', () => {
      status = button.dataset.appFilter
      statusButtons.forEach((item) => {
        const active = item === button
        item.classList.toggle('is-active', active)
        item.setAttribute('aria-selected', String(active))
      })
      applyFilters()
    })
  })

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      category = button.dataset.appCategoryFilter
      const showingRecent = category === 'recent'
      if (catalog) catalog.hidden = showingRecent
      if (recentPanel) recentPanel.hidden = !showingRecent
      categoryButtons.forEach((item) => {
        const active = item === button
        item.classList.toggle('is-active', active)
        if (active) item.setAttribute('aria-current', 'true')
        else item.removeAttribute('aria-current')
      })
      if (!showingRecent) applyFilters()
    })
  })

  searchInput?.addEventListener('input', () => {
    query = searchInput.value.trim().toLowerCase()
    applyFilters()
  })

  sortSelect?.addEventListener('change', () => {
    const cards = [...grid.querySelectorAll('[data-app]')]
    cards.sort((left, right) => {
      const leftApp = apps.find((app) => app.id === left.dataset.app)
      const rightApp = apps.find((app) => app.id === right.dataset.app)
      if (sortSelect.value === 'name') return leftApp.name.localeCompare(rightApp.name, 'zh-CN')
      if (sortSelect.value === 'recent') return String(rightApp.time).localeCompare(String(leftApp.time))
      return apps.indexOf(leftApp) - apps.indexOf(rightApp)
    })
    cards.forEach((card) => grid.appendChild(card))
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

async function loadRecentActivities() {
  try {
    const response = await fetch('/api/public/aspace/activities', { cache: 'no-store' })
    const data = await response.json()
    recentActivities = response.ok && Array.isArray(data.activities) ? data.activities : []
  } catch {
    recentActivities = []
  }
}

function updateRecentVisits(root) {
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
    updateRecentVisits(root)
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
  loadAppPreferences()
  await Promise.all([loadQuickActions(), loadRecentActivities()])
  root.innerHTML = renderPortal()
  bindAapSsoMessages(root)
  bindActivityMessages(root)

  const orgMenu = root.querySelector('[data-org-menu]')
  const noticeMenu = root.querySelector('[data-notice-menu]')
  const accountMenu = root.querySelector('[data-account-menu]')

  root.addEventListener('click', (event) => {
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

    const orgToggle = event.target.closest('[data-org-toggle]')
    const noticeToggle = event.target.closest('[data-notice-toggle]')
    const accountToggle = event.target.closest('[data-account-toggle]')
    if (orgToggle || noticeToggle || accountToggle) {
      const menu = orgToggle ? orgMenu : noticeToggle ? noticeMenu : accountMenu
      const trigger = orgToggle || noticeToggle || accountToggle
      const willOpen = !menu.classList.contains('is-open')
      setPopover(menu, trigger, willOpen)
      return
    }

    const org = event.target.closest('[data-org]')
    if (org) {
      root.querySelector('[data-org-name]').textContent = org.dataset.org
      root.querySelectorAll('[data-app-project]').forEach((p) => { p.textContent = org.dataset.project })
      setPopover(orgMenu, root.querySelector('[data-org-toggle]'), false)
      showToast(`已切换到 ${org.dataset.org} · ${org.dataset.project}`)
      return
    }

    if (event.target.closest('[data-action="manage-apps"]')) {
      showToast('应用管理后台接口待接入，当前为前端流程预览')
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
      showToast('统一身份中转接口待接入，当前为前端流程预览')
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
      showToast('统一身份中转接口待接入，当前为前端流程预览')
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

  const navLinks = [...root.querySelectorAll('.aso-subnav__links a')]
  const setActiveNav = (href) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === href
      link.classList.toggle('is-active', active)
      if (active) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    })
  }
  navLinks.forEach((link) => {
    link.addEventListener('click', () => setActiveNav(link.getAttribute('href')))
  })
  setActiveNav('#overview')

  const observedSections = ['overview', 'help', 'support']
    .map((id) => document.getElementById(id))
    .filter(Boolean)
  if ('IntersectionObserver' in window && observedSections.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return
      setActiveNav(`#${visible.target.id}`)
    }, { rootMargin: '-124px 0px -55% 0px', threshold: [0.05, 0.25, 0.6] })
    observedSections.forEach((section) => observer.observe(section))
  }

  initAppFilters(root)

  root.querySelector('[data-embed-close]')?.addEventListener('click', () => closeAppEmbed(root))
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!root.querySelector('[data-quick-settings]')?.hidden) setQuickSettingsOpen(root, false)
    else if (!root.querySelector('[data-aso-embed]')?.hidden) closeAppEmbed(root)
  })

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.aso-subnav__tools, .aso-popover')) closePopovers()
  })
}
