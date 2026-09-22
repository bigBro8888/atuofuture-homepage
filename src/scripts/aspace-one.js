const apps = [
  { id: 'energy', icon: 'eco', tone: 'green', name: '能源能耗', project: '王力集团总部项目', time: '2026-09-20 14:32' },
  { id: 'poster', icon: 'image', tone: 'violet', name: 'AI画报', project: '上海展示项目', time: '2026-09-19 10:15' },
  { id: 'album', icon: 'photo_library', tone: 'orange', name: '电子相册', project: '杭州园区项目', time: '2026-09-18 16:20' },
  { id: 'screen', icon: 'dashboard', tone: 'blue', name: '中控屏管理', project: '北京研发中心项目', time: '2026-09-21 09:12', warning: '1 台设备离线' },
]

const docs = [
  { title: 'Aspace One 快速入门指南', category: '全部文档', date: '2026-09-12' },
  { title: '能源能耗数据接入说明', category: '能源能耗', date: '2026-09-10' },
  { title: 'AI画报使用手册', category: 'AI画报', date: '2026-09-08' },
  { title: '电子相册发布流程', category: '电子相册', date: '2026-09-06' },
  { title: '中控屏配置操作指南', category: '中控屏管理', date: '2026-09-03' },
  { title: '设备管理平台 API 文档', category: '会议与空间', date: '2026-08-28' },
  { title: '项目实施规范', category: '项目服务', date: '2026-08-20' },
]

const showcase = [
  {
    image: '/images/aspace-one/showcase-control.jpg',
    width: 1160,
    height: 1220,
    eyebrow: 'ONE PLATFORM',
    title: '统一进入产品、项目与服务',
    place: '中控屏 · 北京研发中心项目',
    alt: 'Aspace One 中控屏运行界面',
  },
  {
    image: '/images/aspace-one/showcase-space.jpg',
    eyebrow: 'SPACE SERVICE',
    title: '空间与设备统一纳管',
    place: '开放办公区 · 王力集团总部项目',
    alt: '开放办公区空间场景',
  },
  {
    image: '/images/aspace-one/showcase-meeting.jpg',
    eyebrow: 'MEETING & VISITOR',
    title: '会议与访客协同调度',
    place: '多功能会议室 · 上海展示项目',
    alt: '多功能会议室场景',
  },
  {
    image: '/images/aspace-one/showcase-building.jpg',
    eyebrow: 'BUILDING OPS',
    title: '楼宇全域运营与能耗洞察',
    place: '办公楼层 · 杭州园区项目',
    alt: '办公楼层公共区域场景',
  },
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

function appRow(app) {
  return `
    <article class="aso-app" data-app="${app.id}">
      <span class="aso-app__icon aso-app__icon--${app.tone}">${icon(app.icon)}</span>
      <div class="aso-app__copy">
        <h3>${app.name}</h3>
        <p>${app.project}</p>
        <small>最近使用 · ${app.time}</small>
      </div>
      <div class="aso-app__state">
        <span class="aso-status"><i></i>运行中</span>
        ${app.warning ? `<span class="aso-status aso-status--warn"><i></i>${app.warning}</span>` : ''}
      </div>
      <button class="aso-btn aso-btn--primary aso-app__enter" type="button" data-enter-app="${app.id}">进入系统 ${icon('arrow_forward')}</button>
    </article>`
}

function showcaseSlide(slide, index) {
  return `
      <figure class="aso-showcase__slide" role="group" aria-roledescription="幻灯片" aria-label="${index + 1} / ${showcase.length}" aria-hidden="${index === 0 ? 'false' : 'true'}">
        <img src="${slide.image}" alt="${slide.alt}" width="${slide.width || 1160}" height="${slide.height || 1000}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" />
        <figcaption>
          <p class="aso-eyebrow">${slide.eyebrow}</p>
          <b>${slide.title}</b>
          <small><span class="aso-status aso-status--live"><i></i>实时在线</span>${slide.place}</small>
        </figcaption>
      </figure>`
}

function docRows(category = '全部文档', keyword = '') {
  const query = keyword.trim().toLowerCase()
  const filtered = docs.filter((item) => {
    const categoryMatch = category === '全部文档' || item.category === category
    return categoryMatch && (!query || `${item.title} ${item.category}`.toLowerCase().includes(query))
  })
  if (!filtered.length) return '<p class="aso-empty">没有找到匹配的文档。</p>'
  return filtered.map((item) => `
    <button class="aso-doc-row" type="button" data-doc="${item.title}">
      ${icon('description')}
      <span>${item.title}</span>
      <time>${item.date}</time>
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
            <a href="#catalog">业务目录</a>
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
        <div class="aso-container aso-hero__grid">
          <div class="aso-panel aso-apps" id="apps">
            <p class="aso-eyebrow">GOOD TO SEE YOU</p>
            <h1>欢迎回来，张三</h1>
            <p class="aso-lead">高效的空间智能运营，从 Aspace One 开始</p>
            <div class="aso-app-list">${apps.map(appRow).join('')}</div>
            <a class="aso-more" href="#catalog">查看全部应用 ${icon('arrow_forward')}</a>
          </div>

          <aside class="aso-showcase" id="catalog" data-showcase aria-roledescription="轮播" aria-label="Aspace One 平台场景">
            <div class="aso-showcase__track" data-showcase-track>
              ${showcase.map(showcaseSlide).join('')}
            </div>
            <div class="aso-showcase__dots" role="tablist" aria-label="切换场景">
              ${showcase
                .map(
                  (slide, i) => `
              <button class="aso-showcase__dot" type="button" role="tab" data-showcase-dot="${i}" aria-selected="${i === 0 ? 'true' : 'false'}">
                <span class="aso-sr">${slide.title}</span>
              </button>`
                )
                .join('')}
            </div>
          </aside>
        </div>
      </section>

      <section class="aso-work aso-section">
        <div class="aso-container">
          <p class="aso-eyebrow">GET THINGS DONE</p>
          <h2>从这里继续工作</h2>
          <p class="aso-section__lead">快速访问你关心的任务与常用操作，掌握最新动态。</p>
          <div class="aso-work__grid">
            <div class="aso-panel aso-resume">
              <h3>${icon('description')} 继续上次工作</h3>
              <div class="aso-resume__item">
                ${icon('description')}
                <div><b>王力大厦｜8月能源分析报告</b><small>今天 14:32 · 编辑</small></div>
                <button class="aso-btn aso-btn--primary aso-btn--small" type="button" data-deep-link>继续查看 ${icon('arrow_forward')}</button>
              </div>
              <h3 class="aso-subtitle">${icon('build')} 常用操作</h3>
              <div class="aso-actions">
                ${quickActions.map(([ico, label, id]) => `<button type="button" data-action="${id}">${icon(ico)}<span>${label}</span></button>`).join('')}
              </div>
            </div>
            <div class="aso-panel aso-tasks">
              <header><h3>${icon('notifications', 'is-orange')} 待处理与提醒</h3><button type="button" data-show-all>查看全部 ${icon('arrow_forward')}</button></header>
              <button type="button" data-task><span class="aso-dot aso-dot--orange"></span><b>2 份内容等待审核</b><small>今天</small>${icon('chevron_right')}</button>
              <button type="button" data-task><span class="aso-dot aso-dot--orange"></span><b>1 台中控屏离线</b><small>今天</small>${icon('chevron_right')}</button>
              <button type="button" data-task><span class="aso-dot aso-dot--orange"></span><b>1 个账号绑定待完成</b><small>9月20日</small>${icon('chevron_right')}</button>
              <button type="button" data-task><span class="aso-dot aso-dot--green"></span><b>能耗月报已生成</b><small>9月20日</small>${icon('chevron_right')}</button>
            </div>
          </div>
          <div class="aso-statusbar">
            <div class="aso-statusbar__head">
              <span class="aso-status-icon">${icon('check_circle')}</span>
              <b>系统运行状态</b>
              <small>所有系统运行正常，服务稳定可用。</small>
            </div>
            <div class="aso-statusbar__list">
              ${['能源能耗', 'AI画报', '电子相册', '中控屏管理'].map((name) => `<span class="aso-status aso-status--chip"><i></i><b>${name}</b><small>运行正常</small></span>`).join('')}
            </div>
            <a href="#support">查看详情 ${icon('arrow_forward')}</a>
          </div>
        </div>
      </section>

      <section class="aso-help aso-section" id="help">
        <div class="aso-container">
          <header class="aso-help__head">
            <div><p class="aso-eyebrow">HELP CENTER</p><h2>自助服务中心</h2></div>
            <p>搜索知识、获取帮助，让问题更快解决</p>
          </header>
          <form class="aso-search" data-help-search>
            ${icon('search')}
            <input type="search" aria-label="搜索文档" placeholder="搜索帮助文档、问题或关键词，例如：中控屏如何配置、如何申请权限" />
            <button type="submit">搜索</button>
          </form>
          <div class="aso-help__grid">
            <div class="aso-panel aso-docs">
              <h3>${icon('description')} 文档中心</h3>
              <div class="aso-docs__body">
                <div class="aso-doc-cats">
                  ${['全部文档', '能源能耗', 'AI画报', '电子相册', '中控屏管理', '会议与空间', '项目服务'].map((item, index) => `<button class="${index === 0 ? 'is-active' : ''}" type="button" data-doc-category="${item}">${icon('chevron_right')} ${item}</button>`).join('')}
                </div>
                <div class="aso-doc-list" data-doc-list>${docRows()}</div>
              </div>
            </div>
            <div class="aso-panel aso-updates">
              <header><h3>${icon('campaign')} 最新更新</h3><button type="button" data-show-all>查看更多 ${icon('arrow_forward')}</button></header>
              <article><time>2026-09-18</time><b>设备管理平台 v3.2 正式发布</b><p>新增设备批量配置能力，优化告警通知机制。</p></article>
              <article><time>2026-09-10</time><b>AI画报新增模板库</b><p>新增多套行业模板，支持企业文化发布。</p></article>
              <article><time>2026-09-03</time><b>电子相册发布流程优化</b><p>支持定时发布与多屏同步。</p></article>
            </div>
            <div class="aso-panel aso-support" id="support">
              <h3>${icon('headphones')} 获取帮助</h3>
              ${[
                ['monitor_heart', '系统状态查询', '查看各产品服务状态'],
                ['manage_accounts', '账号与权限', '账号绑定、权限申请'],
                ['support', '提交服务工单', '遇到问题？提交工单'],
                ['contact_page', '联系客户经理', '获取一对一服务支持'],
                ['rate_review', '功能建议', '告诉我们您的想法'],
              ].map(([ico, title, desc]) => `<button type="button" data-support="${title}">${icon(ico)}<span><b>${title}</b><small>${desc}</small></span>${icon('chevron_right')}</button>`).join('')}
            </div>
          </div>
          <div class="aso-help__bottom">
            <div class="aso-panel aso-faq">
              <h3>${icon('help')} 用户最常问</h3>
              ${['如何新增设备接入中控屏管理？', 'AI画报支持哪些文件格式？', '忘记密码怎么办？'].map((q, i) => `<button type="button" data-faq="${i}"><i>${i + 1}</i><span>${q}</span>${icon('chevron_right')}</button><p data-faq-answer="${i}" hidden>请进入文档中心查看操作指南；如仍无法解决，可提交服务工单。</p>`).join('')}
            </div>
            <aside class="aso-panel aso-quote">
              ${icon('support_agent')}
              <p><b>问题还没有解决？</b><br/>提交服务工单，或联系当前组织的客户经理获取一对一支持。</p>
              <button type="button" data-support="提交服务工单">提交服务工单 ${icon('arrow_forward')}</button>
            </aside>
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

function initShowcase(shell) {
  const track = shell?.querySelector('[data-showcase-track]')
  if (!track) return
  const slides = [...track.querySelectorAll('.aso-showcase__slide')]
  const dots = [...shell.querySelectorAll('[data-showcase-dot]')]
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let current = 0
  let timer = 0

  const goTo = (next) => {
    current = (next + slides.length) % slides.length
    track.style.transform = `translate3d(${-current * 100}%, 0, 0)`
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', i === current ? 'false' : 'true'))
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current)
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false')
    })
  }

  const stop = () => {
    window.clearInterval(timer)
    timer = 0
  }

  const play = () => {
    if (reduceMotion || timer || slides.length < 2) return
    timer = window.setInterval(() => goTo(current + 1), 5200)
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i)
      stop()
      play()
    })
  })

  shell.addEventListener('mouseenter', stop)
  shell.addEventListener('mouseleave', play)
  shell.addEventListener('focusin', stop)
  shell.addEventListener('focusout', play)
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()))

  goTo(0)
  play()
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
      root.querySelectorAll('.aso-app__copy p').forEach((p) => { p.textContent = org.dataset.project })
      setPopover(orgMenu, root.querySelector('[data-org-toggle]'), false)
      showToast(`已切换到 ${org.dataset.org} · ${org.dataset.project}`)
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

    const faq = event.target.closest('[data-faq]')
    if (faq) {
      const answer = root.querySelector(`[data-faq-answer="${faq.dataset.faq}"]`)
      answer.hidden = !answer.hidden
      faq.classList.toggle('is-open', !answer.hidden)
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

  root.querySelector('[data-help-search]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const keyword = event.currentTarget.querySelector('input').value
    docList.innerHTML = docRows(activeCategory, keyword)
    root.querySelector('.aso-docs')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

  initShowcase(root.querySelector('[data-showcase]'))

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.aso-subnav__tools, .aso-popover')) closePopovers()
  })
}
