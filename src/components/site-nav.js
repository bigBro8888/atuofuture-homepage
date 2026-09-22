import { SITE_NAV_ITEMS } from '../data/site-nav.js'
import { SHOW_APP_DOWNLOAD, SITE_CTA, APP_DOWNLOAD_PATH, OFFICIAL_SITE_URL } from '../data/site-links.js'
import { applyHardwareSimpleCms, applyProductLibraryCms, resolveHardwareMegaGroups } from '../data/hardware-catalog.js'
import { loadProductLibraryContent, loadSimplePageContent } from '../services/site-settings-api.js'
import { SOLUTIONS } from '../data/solutions.js'
import { AGENTS_OVERVIEW } from '../data/agents-overview.js'

function getRootPrefix() {
  const depth = Number(document.body.dataset.navDepth || 0)
  if (depth <= 0) return './'
  return '../'.repeat(depth)
}

function buildHref(item, root) {
  if (item.external) return item.href
  if (item.anchor) return `${root}${item.segment}`
  if (!item.segment) return root
  return `${root}${item.segment}`
}

function isActiveNav(item, activeId) {
  if (item.id === activeId) return true
  if (activeId === 'agent-detail' && item.id === 'agents') return true
  if (activeId === 'hardware-product' && item.id === 'hardware') return true
  if (activeId === 'news-detail' && item.id === 'news') return true
  if (activeId?.startsWith('sol-') && item.id === 'solutions') return true
  return false
}

function resolveVisualItems(item) {
  return (item.children || []).map((child) => {
    if (item.id === 'solutions') {
      const sol = SOLUTIONS.find((s) => s.id === child.id.replace(/^sol-/, ''))
      return { ...child, image: sol?.image || '', icon: sol?.icon || 'domain' }
    }
    if (item.id === 'agents') {
      const agent = AGENTS_OVERVIEW.find((a) => a.id === child.id)
      return { ...child, image: agent?.sceneImage || '', icon: agent?.icon || 'smart_toy' }
    }
    return {
      ...child,
      image: child.image || '',
      icon: child.icon || 'image',
    }
  })
}

function renderVisualMega(item, root) {
  return `
    <div class="site-mega site-mega--visual" role="region" data-mega-panel>
      <div class="site-mega__glance">
        ${(item.children || [])
          .map(
            (child) => `
          <a class="site-mega-row" href="${buildHref(child, root)}">
            <strong>${child.label}</strong>
            ${child.desc ? `<small>${child.desc}</small>` : ''}
          </a>`
          )
          .join('')}
      </div>
    </div>
  `
}

function renderHardwareMega(root) {
  const groups = resolveHardwareMegaGroups()
  return `
    <div class="site-mega site-mega--hardware" data-hardware-mega role="region" data-mega-panel>
      <div class="site-mega__hardware">
        ${groups
          .map(
            (group) => `
          <section class="site-mega-col">
            <a class="site-mega-col__head" href="${root}hardware/?line=${group.id}#hwc-browser">
              <strong>${group.title}</strong>
            </a>
            <div class="site-mega-col__grid">
              ${group.products
                .map(
                  (p) => `
                <a class="site-mega-prod" href="${p.href || `${root}hardware/product/?id=${encodeURIComponent(p.slug)}`}">${p.name}</a>`
                )
                .join('')}
            </div>
          </section>`
          )
          .join('')}
      </div>
      <div class="site-mega__hardware-foot">
        <a class="site-mega__all-btn" href="${root}hardware/products/">浏览全部产品</a>
      </div>
    </div>
  `
}

function renderHardwareMobile(root) {
  return `${resolveHardwareMegaGroups()
    .map(
      (group) => `
            <p class="site-mobile-nav-group">${group.title}</p>
            ${group.products
              .map(
                (p) => `
            <a class="site-mobile-nav-link site-mobile-nav-link--child" href="${p.href || `${root}hardware/product/?id=${encodeURIComponent(p.slug)}`}">
              <strong>${p.name}</strong>
            </a>`
              )
              .join('')}`
    )
    .join('')}
            <a class="site-mobile-nav-link site-mobile-nav-link--cta" href="${root}hardware/products/">
              <strong>浏览全部产品</strong>
            </a>`
}

function renderMegaChildren(item, root) {
  if (item.mega === 'hardware') return renderHardwareMega(root)
  if (item.mega === 'visual') return renderVisualMega(item, root)
  const children = item.children
  if (!children?.length) return ''
  return `
    <div class="site-mega" role="region" data-mega-panel>
      <div class="site-mega__inner">
        ${children
          .map(
            (child) => `
          <a class="site-mega__card" href="${buildHref(child, root)}"${child.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
            <strong>${child.label}</strong>
            ${child.desc ? `<span>${child.desc}</span>` : ''}
          </a>`
          )
          .join('')}
      </div>
    </div>
  `
}

function renderDesktopNav(activeId, root) {
  return SITE_NAV_ITEMS.map((item) => {
    const href = buildHref(item, root)
    const active = isActiveNav(item, activeId)
    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    if (!hasChildren) {
      return `<a class="site-nav-link${active ? ' is-active' : ''}" href="${href}"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${item.label}</a>`
    }
    return `
      <div class="site-nav-item${active ? ' is-active' : ''}" data-nav-item data-nav-id="${item.id}">
        <a class="site-nav-link site-nav-link--parent${active ? ' is-active' : ''}" href="${href}" aria-haspopup="true" aria-expanded="false" data-nav-trigger>
          ${item.label}
          <span class="material-symbols-outlined site-nav-chevron" aria-hidden="true">expand_more</span>
        </a>
        ${renderMegaChildren(item, root)}
      </div>
    `
  }).join('')
}

function renderMobileNav(activeId, root) {
  return SITE_NAV_ITEMS.map((item) => {
    const href = buildHref(item, root)
    const active = isActiveNav(item, activeId)
    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    if (!hasChildren) {
      return `<a class="site-mobile-nav-link${active ? ' is-active' : ''}" href="${href}"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${item.label}</a>`
    }
    return `
      <div class="site-mobile-acc${active ? ' is-open' : ''}" data-mobile-acc>
        <button type="button" class="site-mobile-acc__btn${active ? ' is-active' : ''}" data-mobile-acc-toggle aria-expanded="${active ? 'true' : 'false'}">
          <span>${item.label}</span>
          <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
        </button>
        <div class="site-mobile-acc__panel">
          <a class="site-mobile-nav-link site-mobile-nav-link--all" href="${href}">查看全部</a>
          ${
            item.mega === 'hardware'
              ? `<div data-hardware-mobile>${renderHardwareMobile(root)}</div>`
              : resolveVisualItems(item)
                  .map(
                    (child) => `
            <a class="site-mobile-nav-link site-mobile-nav-link--child${child.image ? ' site-mobile-nav-link--visual' : ''}" href="${buildHref(child, root)}">
              ${
                child.image
                  ? `<span class="site-mobile-nav-thumb" style="background-image:url('${child.image}')" aria-hidden="true"></span>`
                  : ''
              }
              <span>
                <strong>${child.label}</strong>
                ${child.desc ? `<small>${child.desc}</small>` : ''}
              </span>
            </a>`
                  )
                  .join('')
          }
        </div>
      </div>
    `
  }).join('')
}

function renderAppDownloadHeader(root) {
  return `
    <header class="site-header site-header--download-only w-full fixed top-0 left-0 right-0 z-50" id="site-header">
      <div class="site-header__inner max-w-max-width mx-auto px-margin-desktop">
        <a href="${OFFICIAL_SITE_URL}" class="site-header__logo" aria-label="安托未来官网">
          <img src="${root}assets/artink-logo-light.png" alt="安托未来" class="site-header__logo-img" />
        </a>
        <p class="site-header__page-title">APP下载页</p>
      </div>
    </header>
  `
}

export function renderSiteNav(activeId) {
  const root = getRootPrefix()
  if (activeId === 'app-download') return renderAppDownloadHeader(root)
  return `
    <header class="site-header w-full fixed top-0 left-0 right-0 z-50" id="site-header">
      <div class="site-header__inner max-w-max-width mx-auto px-margin-desktop">
        <a href="${root}" class="site-header__logo" aria-label="安托未来首页">
          <img src="${root}assets/artink-logo-light.png" alt="安托未来" class="site-header__logo-img" />
        </a>
        <nav class="site-header__nav hidden lg:flex items-center" aria-label="主导航">
          ${renderDesktopNav(activeId, root)}
        </nav>
        <div class="site-header__actions hidden md:flex items-center">
          ${SHOW_APP_DOWNLOAD
            ? `<a href="${root}${APP_DOWNLOAD_PATH}" class="site-header__btn site-header__btn--ghost${activeId === 'app-download' ? ' is-current' : ''}">
            <span class="material-symbols-outlined" aria-hidden="true">download</span> ${SITE_CTA.downloadLabel}
          </a>`
            : ''}
        </div>
        <button type="button" class="site-header__menu lg:hidden" id="menu-toggle" aria-label="打开菜单">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
      <div class="site-nav-overlay" data-nav-overlay aria-hidden="true"></div>
      <div class="site-mega-shell" data-mega-shell aria-hidden="true">
        <div class="site-mega-shell__track" data-mega-track></div>
      </div>
      <div class="site-mobile-drawer translate-x-full" id="mobile-drawer" aria-hidden="true">
        <div class="site-mobile-drawer__panel">
          <div class="site-mobile-drawer__head">
            <a href="${root}" class="site-mobile-drawer__logo" aria-label="安托未来首页">
              <img src="${root}assets/artink-logo-light.png" alt="安托未来" class="site-header__logo-img" />
            </a>
            <button type="button" id="menu-close" aria-label="关闭菜单">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav class="site-mobile-drawer__nav">
            ${renderMobileNav(activeId, root)}
          </nav>
          <div class="site-mobile-drawer__actions">
            ${SHOW_APP_DOWNLOAD
              ? `<a href="${root}${APP_DOWNLOAD_PATH}" class="site-header__btn site-header__btn--ghost w-full${activeId === 'app-download' ? ' is-current' : ''}">${SITE_CTA.downloadLabel}</a>`
              : ''}
          </div>
        </div>
      </div>
    </header>
  `
}

function initMegaMenu(header) {
  const items = [...header.querySelectorAll('[data-nav-item]')]
  const shell = header.querySelector('[data-mega-shell]')
  const track = header.querySelector('[data-mega-track]')
  const overlay = header.querySelector('[data-nav-overlay]')
  if (!shell || !track || !overlay || !items.length) return
  if (header.dataset.megaBound === '1') return
  header.dataset.megaBound = '1'

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  items.forEach((item) => {
    const id = item.dataset.navId
    const mega = item.querySelector('[data-mega-panel]')
    if (!id || !mega) return
    mega.dataset.megaFor = id
    mega.setAttribute('aria-hidden', 'true')
    track.append(mega)
  })

  let activeId = ''
  let closeTimer = 0
  let heightTimer = 0

  const panelFor = (id) => (id ? track.querySelector(`[data-mega-for="${id}"]`) : null)

  const setShellHeight = (height, animate = true) => {
    if (!animate || reduceMotion) {
      shell.style.transition = 'none'
      shell.style.height = `${height}px`
      void shell.offsetHeight
      shell.style.transition = ''
      return
    }
    shell.style.height = `${height}px`
  }

  const measureActive = () => panelFor(activeId)?.scrollHeight || 0

  const showPanel = (id) => {
    track.querySelectorAll('[data-mega-panel]').forEach((panel) => {
      const on = panel.dataset.megaFor === id
      panel.classList.toggle('is-active', on)
      panel.setAttribute('aria-hidden', on ? 'false' : 'true')
    })
  }

  const open = (item) => {
    const id = item.dataset.navId
    if (!id || !panelFor(id)) return
    window.clearTimeout(closeTimer)
    if (activeId === id && header.classList.contains('is-mega-open')) return
    window.clearTimeout(heightTimer)

    const switching = Boolean(activeId) && activeId !== id
    items.forEach((other) => {
      const on = other === item
      other.classList.toggle('is-open', on)
      other.querySelector('[data-nav-trigger]')?.setAttribute('aria-expanded', on ? 'true' : 'false')
    })

    if (!activeId) {
      activeId = id
      showPanel(id)
      header.classList.add('is-mega-open')
      overlay.setAttribute('aria-hidden', 'false')
      shell.setAttribute('aria-hidden', 'false')
      setShellHeight(0, false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setShellHeight(measureActive()))
      })
      return
    }

    activeId = id
    showPanel(id)
    header.classList.add('is-mega-open')
    overlay.setAttribute('aria-hidden', 'false')
    shell.setAttribute('aria-hidden', 'false')
    heightTimer = window.setTimeout(() => setShellHeight(measureActive()), switching ? 16 : 0)
  }

  const forceClose = () => {
    window.clearTimeout(closeTimer)
    window.clearTimeout(heightTimer)
    items.forEach((item) => {
      item.classList.remove('is-open')
      item.querySelector('[data-nav-trigger]')?.setAttribute('aria-expanded', 'false')
    })
    setShellHeight(0)
    overlay.setAttribute('aria-hidden', 'true')
    shell.setAttribute('aria-hidden', 'true')
    header.classList.remove('is-mega-open')
    window.setTimeout(() => {
      activeId = ''
      showPanel('')
    }, reduceMotion ? 0 : 280)
  }

  const close = () => {
    window.clearTimeout(closeTimer)
    closeTimer = window.setTimeout(forceClose, 140)
  }

  const cancelClose = () => window.clearTimeout(closeTimer)

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => open(item))
    item.addEventListener('mouseleave', close)
    item.addEventListener('focusin', () => open(item))
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget) && !shell.contains(e.relatedTarget)) close()
    })
  })

  shell.addEventListener('mouseenter', cancelClose)
  shell.addEventListener('mouseleave', close)
  overlay.addEventListener('click', forceClose)

  window.addEventListener('resize', () => {
    if (!activeId) return
    setShellHeight(measureActive(), false)
  }, { passive: true })
}

function initMobileAccordion(header) {
  header.querySelectorAll('[data-mobile-acc-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('[data-mobile-acc]')
      if (!wrap) return
      const open = !wrap.classList.contains('is-open')
      header.querySelectorAll('[data-mobile-acc]').forEach((el) => {
        el.classList.remove('is-open')
        el.querySelector('[data-mobile-acc-toggle]')?.setAttribute('aria-expanded', 'false')
      })
      if (open) {
        wrap.classList.add('is-open')
        btn.setAttribute('aria-expanded', 'true')
      }
    })
  })
}

export function initSiteNav() {
  const mount = document.getElementById('site-header')
  if (!mount) return

  const paint = () => {
    const activeId = document.body.dataset.page || 'home'
    const html = renderSiteNav(activeId)
    const current = document.getElementById('site-header')
    if (!current) return
    current.outerHTML = html
    const header = document.getElementById('site-header')
    if (!header || activeId === 'app-download') return
    initMegaMenu(header)
    initMobileAccordion(header)
  }

  paint()
  if ((document.body.dataset.page || '') === 'app-download') return
  void Promise.all([loadSimplePageContent('hardware'), loadProductLibraryContent()])
    .then(([content, library]) => {
      applyHardwareSimpleCms(content)
      applyProductLibraryCms(library)
      const header = document.getElementById('site-header')
      if (!header) return
      const root = getRootPrefix()
      const mega = header.querySelector('[data-hardware-mega]')
      if (mega) {
        const wrap = document.createElement('div')
        wrap.innerHTML = renderHardwareMega(root).trim()
        const next = wrap.firstElementChild
        if (next) {
          next.dataset.megaFor = mega.dataset.megaFor || 'hardware'
          next.setAttribute('aria-hidden', mega.getAttribute('aria-hidden') || 'true')
          if (mega.classList.contains('is-active')) next.classList.add('is-active')
          mega.replaceWith(next)
        }
      }
      const mobile = header.querySelector('[data-hardware-mobile]')
      if (mobile) mobile.innerHTML = renderHardwareMobile(root)
    })
    .catch(() => {})
}
