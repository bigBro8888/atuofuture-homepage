import { SITE_NAV_ITEMS } from '../data/site-nav.js'
import { SHOW_APP_DOWNLOAD, SITE_CTA } from '../data/site-links.js'
import { resolveHardwareMegaGroups } from '../data/hardware-catalog.js'
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
    return child
  })
}

function renderVisualMega(item, root) {
  const entries = resolveVisualItems(item)
  const count = entries.length
  return `
    <div class="site-mega site-mega--visual" role="region">
      <div class="site-mega__visual" style="--mega-cols:${count > 6 ? 4 : count}">
        ${entries
          .map(
            (child) => `
          <a class="site-mega-prod site-mega-prod--scene" href="${buildHref(child, root)}">
            <span class="site-mega-prod__thumb${child.image ? '' : ' site-mega-prod__thumb--icon'}" ${
              child.image ? `style="background-image:url('${child.image}')"` : ''
            } aria-hidden="true">
              ${child.image ? '' : `<span class="material-symbols-outlined">${child.icon || 'image'}</span>`}
            </span>
            <span class="site-mega-prod__name">${child.label}</span>
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
    <div class="site-mega site-mega--hardware" role="region">
      <div class="site-mega__hardware">
        ${groups
          .map(
            (group) => `
          <section class="site-mega-col">
            <a class="site-mega-col__head" href="${root}hardware/?line=${group.id}#hwc-browser">
              <span class="material-symbols-outlined" aria-hidden="true">${group.icon}</span>
              <strong>${group.title}</strong>
            </a>
            <div class="site-mega-col__grid">
              ${group.products
                .map(
                  (p) => `
                <a class="site-mega-prod" href="${root}hardware/product/?id=${encodeURIComponent(p.slug)}">
                  <span class="site-mega-prod__thumb" style="background-image:url('${p.coverImage}')" aria-hidden="true"></span>
                  <span class="site-mega-prod__name">${p.name}</span>
                </a>`
                )
                .join('')}
            </div>
          </section>`
          )
          .join('')}
      </div>
    </div>
  `
}

function renderMegaChildren(item, root) {
  if (item.mega === 'hardware') return renderHardwareMega(root)
  if (item.mega === 'visual') return renderVisualMega(item, root)
  const children = item.children
  if (!children?.length) return ''
  return `
    <div class="site-mega" role="region">
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
    const wide = item.mega === 'hardware' || item.mega === 'visual'
    return `
      <div class="site-nav-item${active ? ' is-active' : ''}${wide ? ' site-nav-item--wide' : ''}" data-nav-item>
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
              ? resolveHardwareMegaGroups()
                  .map(
                    (group) => `
            <p class="site-mobile-nav-group">${group.title}</p>
            ${group.products
              .map(
                (p) => `
            <a class="site-mobile-nav-link site-mobile-nav-link--child" href="${root}hardware/product/?id=${encodeURIComponent(p.slug)}">
              <strong>${p.name}</strong>
            </a>`
              )
              .join('')}`
                  )
                  .join('')
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

export function renderSiteNav(activeId) {
  const root = getRootPrefix()
  return `
    <header class="site-header w-full fixed top-0 left-0 right-0 z-50" id="site-header">
      <div class="site-header__inner max-w-max-width mx-auto px-margin-desktop">
        <a href="${root}" class="site-header__logo" aria-label="安托未来首页">
          <img src="${root}assets/artink-logo-light.png" alt="安托未来" class="site-header__logo-img" />
        </a>
        <nav class="site-header__nav hidden lg:flex items-center" aria-label="主导航">
          ${renderDesktopNav(activeId, root)}
        </nav>
        <div class="site-header__actions hidden md:flex items-center gap-4">
          ${SHOW_APP_DOWNLOAD
            ? `<button type="button" class="site-header__btn site-header__btn--ghost" data-app-download-open>
            <span class="material-symbols-outlined" aria-hidden="true">download</span> ${SITE_CTA.downloadLabel}
          </button>`
            : ''}
          <button type="button" class="site-header__btn site-header__btn--primary" data-demo-modal-open>${SITE_CTA.demoLabel}</button>
        </div>
        <button type="button" class="site-header__menu lg:hidden" id="menu-toggle" aria-label="打开菜单">
          <span class="material-symbols-outlined">menu</span>
        </button>
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
              ? `<button type="button" class="site-header__btn site-header__btn--ghost w-full" data-app-download-open>${SITE_CTA.downloadLabel}</button>`
              : ''}
            <button type="button" class="site-header__btn site-header__btn--primary w-full" data-demo-modal-open>${SITE_CTA.demoLabel}</button>
          </div>
        </div>
      </div>
    </header>
  `
}

function initMegaMenu(header) {
  const items = header.querySelectorAll('[data-nav-item]')
  items.forEach((item) => {
    const trigger = item.querySelector('[data-nav-trigger]')
    let closeTimer = 0

    const open = () => {
      window.clearTimeout(closeTimer)
      items.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open')
          other.querySelector('[data-nav-trigger]')?.setAttribute('aria-expanded', 'false')
        }
      })
      item.classList.add('is-open')
      trigger?.setAttribute('aria-expanded', 'true')
    }
    const close = () => {
      window.clearTimeout(closeTimer)
      closeTimer = window.setTimeout(() => {
        item.classList.remove('is-open')
        trigger?.setAttribute('aria-expanded', 'false')
      }, 120)
    }
    item.addEventListener('mouseenter', open)
    item.addEventListener('mouseleave', close)
    item.addEventListener('focusin', open)
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) close()
    })
  })
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

  const activeId = document.body.dataset.page || 'home'
  const html = renderSiteNav(activeId)
  if (mount.tagName === 'HEADER' || mount.id === 'site-header') {
    mount.outerHTML = html
  } else {
    mount.outerHTML = html
  }

  const header = document.getElementById('site-header')
  if (!header) return
  initMegaMenu(header)
  initMobileAccordion(header)
}
