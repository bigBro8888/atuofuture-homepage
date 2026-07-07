import { SITE_NAV_ITEMS } from '../data/site-nav.js'

function getRootPrefix() {
  const depth = Number(document.body.dataset.navDepth || 0)
  if (depth <= 0) return './'
  return '../'.repeat(depth)
}

function buildHref(item, root) {
  if (item.anchor) return `${root}${item.segment}`
  if (!item.segment) return root
  return `${root}${item.segment}`
}

export function renderSiteNav(activeId) {
  const root = getRootPrefix()
  const links = SITE_NAV_ITEMS.map((item) => {
    const href = buildHref(item, root)
    const isActive = item.id === activeId
    return `<a class="site-nav-link${isActive ? ' is-active' : ''}" href="${href}">${item.label}</a>`
  }).join('')

  return `
    <header class="site-header w-full sticky top-0 z-50 bg-white/70 backdrop-blur-3xl shadow-[0_8px_32px_rgba(23,105,255,0.08)]">
      <div class="site-header__inner max-w-max-width mx-auto px-margin-desktop">
        <a href="${root}" class="site-header__logo font-headline-md text-headline-md font-bold text-primary">Atuo Future</a>
        <nav class="site-header__nav hidden lg:flex items-center" aria-label="主导航">
          ${links}
        </nav>
        <div class="site-header__actions hidden md:flex items-center gap-4">
          <button type="button" class="site-header__btn site-header__btn--ghost">联系我们</button>
          <button type="button" class="site-header__btn site-header__btn--primary">预约方案演示</button>
        </div>
        <button type="button" class="site-header__menu lg:hidden" id="menu-toggle" aria-label="打开菜单">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
      <div class="site-mobile-drawer translate-x-full" id="mobile-drawer" aria-hidden="true">
        <div class="site-mobile-drawer__panel">
          <div class="site-mobile-drawer__head">
            <a href="${root}" class="font-headline-md text-headline-md font-bold text-primary">Atuo Future</a>
            <button type="button" id="menu-close" aria-label="关闭菜单">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav class="site-mobile-drawer__nav">
            ${SITE_NAV_ITEMS.map((item) => {
              const href = buildHref(item, root)
              const isActive = item.id === activeId
              return `<a class="site-mobile-nav-link${isActive ? ' is-active' : ''}" href="${href}">${item.label}</a>`
            }).join('')}
          </nav>
          <div class="site-mobile-drawer__actions">
            <button type="button" class="site-header__btn site-header__btn--primary w-full">预约方案演示</button>
            <button type="button" class="site-header__btn site-header__btn--ghost w-full">联系我们</button>
          </div>
        </div>
      </div>
    </header>
  `
}

export function initSiteNav() {
  const mount = document.getElementById('site-header')
  if (!mount) return

  const activeId = document.body.dataset.page || 'home'
  mount.outerHTML = renderSiteNav(activeId)
}
