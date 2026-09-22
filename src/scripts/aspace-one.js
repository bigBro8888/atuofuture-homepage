const apps = [
  {
    id: 'energy',
    name: '能源能耗',
    project: '王力集团总部项目',
    time: '2026-09-20 14:32',
    image: '/images/aspace-one/app-energy.jpg',
    alt: '楼宇能耗看板场景',
  },
  {
    id: 'poster',
    name: 'AI画报',
    project: '上海展示项目',
    time: '2026-09-19 10:15',
    image: '/images/aspace-one/app-poster.jpg',
    alt: 'AI画报在平板上的展示效果',
  },
  {
    id: 'album',
    name: '电子相册',
    project: '杭州园区项目',
    time: '2026-09-18 16:20',
    image: '/images/aspace-one/app-album.jpg',
    alt: '大屏电子相册多屏展示场景',
  },
  {
    id: 'screen',
    name: '中控屏管理',
    project: '北京研发中心项目',
    time: '2026-09-21 09:12',
    warning: '1 台设备离线',
    image: '/images/aspace-one/app-control.jpg',
    alt: '会议室墙面中控屏场景',
  },
  {
    id: 'resource',
    name: '资源管理',
    desc: '统一管理空间、设备、项目与资源台账',
    locked: true,
    image: '/images/aspace-one/app-resource.jpg',
    alt: '资源管理示意插画',
  },
]

const openedApps = apps.filter((app) => !app.locked).length
const lockedApps = apps.length - openedApps

const appFilters = [
  ['all', '全部', apps.length],
  ['open', '已开通', openedApps],
  ['locked', '未开通', lockedApps],
]

const docs = [
  { title: 'Aspace One 快速入门指南', category: '全部文档', date: '2026-09-12', featured: true, keywords: '权限申请 账号绑定 入门' },
  { title: '能源能耗数据接入说明', category: '能源能耗', date: '2026-09-10', featured: true, keywords: '能耗数据接入 网关 采集' },
  { title: 'AI画报使用手册', category: 'AI画报', date: '2026-09-08', keywords: '模板 发布' },
  { title: '电子相册发布流程', category: '电子相册', date: '2026-09-06', keywords: '电子相册发布 多屏同步' },
  { title: '中控屏配置操作指南', category: '中控屏管理', date: '2026-09-03', keywords: '中控屏配置 设备绑定' },
  { title: '设备管理平台 API 文档', category: '会议与空间', date: '2026-08-28', keywords: '接口 对接' },
  { title: '项目实施规范', category: '项目服务', date: '2026-08-20', keywords: '权限申请 交付 验收' },
]

const docCategories = [
  ['description', '全部文档'],
  ['bar_chart', '能源能耗'],
  ['image', 'AI画报'],
  ['photo_library', '电子相册'],
  ['desktop_windows', '中控屏管理'],
  ['groups', '会议与空间'],
  ['folder', '项目服务'],
]

const hotSearches = ['中控屏配置', '权限申请', '能耗数据接入', '电子相册发布']

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

const quickActions = [
  ['bar_chart', '查看今日能耗', 'energy'],
  ['add_photo_alternate', '新建AI画报', 'poster'],
  ['collections', '更新电子相册', 'album'],
  ['desktop_windows', '配置中控屏', 'screen'],
  ['description', '导出运营报表', 'report'],
  ['person_add', '申请产品权限', 'permission'],
]

function icon(name, className = '') {
  return `<span class="material-symbols-outlined ${className}" aria-hidden="true">${name}</span>`
}

function appCard(app, index) {
  const locked = Boolean(app.locked)
  return `
      <article class="aso-app-card${locked ? ' is-locked' : ''}" data-app="${app.id}" data-app-state="${locked ? 'locked' : 'open'}">
        <figure class="aso-app-card__shot">
          <img src="${app.image}" alt="${app.alt}" width="640" height="400" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async" />
          <span class="aso-status${locked ? ' aso-status--idle' : ''}"><i></i>${locked ? '未开通' : '运行中'}</span>
        </figure>
        <div class="aso-app-card__copy">
          <h3>${app.name}</h3>
          ${locked
            ? `<p class="aso-app-card__desc">${app.desc}</p>`
            : `<p data-app-project>${app.project}</p>
          <div class="aso-app-card__meta">
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
          <header class="aso-apps__head">
            <div class="aso-apps__intro">
              <p class="aso-eyebrow">GOOD TO SEE YOU</p>
              <h1>欢迎回来，张三</h1>
              <p class="aso-lead">高效的空间智能运营，从 Aspace One 开始</p>
            </div>
            <div class="aso-apps__tools">
              <div class="aso-filters" role="tablist" aria-label="按开通状态筛选应用">
                ${appFilters
                  .map(
                    ([id, label, count], index) => `
                <button class="${index === 0 ? 'is-active' : ''}" type="button" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" data-app-filter="${id}">${label} <i>${count}</i></button>`
                  )
                  .join('')}
              </div>
              <button class="aso-more" type="button" data-action="manage-apps">管理应用 ${icon('arrow_forward')}</button>
            </div>
          </header>
          <div class="aso-app-grid" data-app-grid>${apps.map(appCard).join('')}</div>
          <p class="aso-empty aso-app-grid__empty" data-app-empty hidden>该状态下暂时没有应用。</p>
        </div>
      </section>

      <section class="aso-work aso-section">
        <div class="aso-container">
          <p class="aso-eyebrow">GET THINGS DONE</p>
          <h2>从这里继续工作</h2>
          <p class="aso-section__lead">快速访问你关心的任务与常用操作，掌握最新动态。</p>
          <div class="aso-work__grid">
            <article class="aso-resume">
              <figure class="aso-resume__preview" aria-hidden="true">
                <span class="aso-resume__sheet"></span>
                <span class="aso-resume__sheet"></span>
                <div class="aso-resume__doc">
                  <b>8月能源分析报告</b>
                  <small>王力大厦</small>
                  <div class="aso-resume__chart">
                    ${[34, 44, 52, 66, 84, 72].map((h) => `<i style="--bar:${h}%"></i>`).join('')}
                  </div>
                  <div class="aso-resume__foot">
                    <span class="aso-resume__lines"><i></i><i></i><i></i></span>
                    <span class="aso-resume__donut"></span>
                  </div>
                </div>
              </figure>
              <div class="aso-resume__body">
                <p class="aso-resume__kicker">${icon('description')} 继续上次工作</p>
                <h3>王力大厦<i>|</i>8月能源分析报告</h3>
                <p class="aso-resume__time">今天 14:32 · 编辑</p>
                <div class="aso-resume__progress">
                  <span class="aso-resume__bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" aria-label="报告完成度"><i style="width: 60%"></i></span>
                  <small>继续编辑你的报告，已完成约 60%</small>
                </div>
                <button class="aso-btn aso-btn--primary aso-resume__cta" type="button" data-deep-link>继续查看 ${icon('arrow_forward')}</button>
              </div>
            </article>
            <article class="aso-tasks">
              <header><h3>${icon('notifications', 'is-orange')} 待处理与提醒</h3><button type="button" data-show-all>查看全部 ${icon('arrow_forward')}</button></header>
              <div class="aso-tasks__list">
                <button type="button" data-task><span class="aso-dot aso-dot--orange"></span><b>2 份内容等待审核</b><small>今天</small>${icon('chevron_right')}</button>
                <button type="button" data-task><span class="aso-dot aso-dot--orange"></span><b>1 台中控屏离线</b><small>今天</small>${icon('chevron_right')}</button>
                <button type="button" data-task><span class="aso-dot aso-dot--orange"></span><b>1 个账号绑定待完成</b><small>9月20日</small>${icon('chevron_right')}</button>
                <button type="button" data-task><span class="aso-dot aso-dot--green"></span><b>能耗月报已生成</b><small>9月20日</small>${icon('chevron_right')}</button>
              </div>
            </article>
          </div>
          <section class="aso-quick">
            <h3>${icon('grid_view')} 快捷入口</h3>
            <div class="aso-actions">
              ${quickActions
                .map(
                  ([ico, label, id]) => `
              <button class="aso-action" type="button" data-action="${id}">
                ${icon(ico)}<span>${label}</span><i>${icon('chevron_right')}</i>
              </button>`
                )
                .join('')}
            </div>
          </section>
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
                <input type="search" aria-label="搜索文档" placeholder="搜索帮助文档、问题或关键词，例如：中控屏如何配置、如何申请权限" />
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
  const buttons = [...root.querySelectorAll('[data-app-filter]')]
  if (!grid || !buttons.length) return

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.appFilter
      buttons.forEach((item) => {
        const active = item === button
        item.classList.toggle('is-active', active)
        item.setAttribute('aria-selected', String(active))
      })
      let visible = 0
      grid.querySelectorAll('[data-app-state]').forEach((card) => {
        const match = filter === 'all' || card.dataset.appState === filter
        card.classList.toggle('is-hidden', !match)
        if (match) visible += 1
      })
      if (empty) empty.hidden = visible > 0
    })
  })
}

export function initAspaceOne() {
  const root = document.getElementById('aspace-one-root')
  if (!root) return
  root.innerHTML = renderPortal()

  const orgMenu = root.querySelector('[data-org-menu]')
  const noticeMenu = root.querySelector('[data-notice-menu]')
  const accountMenu = root.querySelector('[data-account-menu]')

  root.addEventListener('click', (event) => {
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

    const enter = event.target.closest('[data-enter-app], [data-deep-link], [data-action], [data-task]')
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

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.aso-subnav__tools, .aso-popover')) closePopovers()
  })
}
