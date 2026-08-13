import {
  HARDWARE_LINES,
  HARDWARE_SPACE_FLOW,
  ASPACE_SOLUTION_HREF,
  getCategoriesByLine,
  getLine,
  getProductBySlug,
  getProductsByCategory,
  getProductsByLine,
  getPublishedProducts,
} from '../data/hardware-catalog.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function productHref(product) {
  return `/hardware/product/?id=${encodeURIComponent(product.slug)}`
}

function linePreviewItems(lineId) {
  const map = {
    space: [
      { id: 'control-screen', label: '中控屏' },
      { id: 'e-table-sign', label: '电子桌牌' },
      { id: 'desk-screen', label: '工位屏' },
      { id: 'smart-lighting', label: '照明与空调' },
      { id: 'sensor', label: '传感器' },
      { id: 'gateway', label: '网关' },
    ],
    retail: [
      { id: 'eink-price-tag', label: '墨水屏电子价签' },
      { id: 'lcd-price-tag', label: 'LCD电子价签' },
      { id: 'cold-tag', label: '低温标签' },
      { id: 'aap', label: 'AAP资产盘点' },
    ],
    consumer: [
      { id: 'eink-phone-case', label: 'AI墨水屏手机壳' },
      { id: 'eink-frame', label: 'AI电子纸艺术相框' },
    ],
  }
  return (map[lineId] || [])
    .map((item) => {
      const p = getProductBySlug(item.id)
      return p
        ? {
            ...item,
            product: p,
            thumb: `/images/hardware/thumb-${item.id}.png`,
          }
        : null
    })
    .filter(Boolean)
}

function renderHero() {
  return `
    <section class="hwc-hero">
      <div class="hwc-hero__bg" aria-hidden="true">
        <img src="/images/hardware/hero-bg-3840.png" alt="" width="3840" height="1054" decoding="async" fetchpriority="high" />
      </div>
      <div class="hwc-shell hwc-hero__content">
        <div class="hwc-hero__copy">
          <h1>连接空间、商品与真实业务</h1>
          <p>安托未来以空间智能、电子纸与边缘连接能力，构建覆盖企业空间、新零售与智能终端的硬件产品体系。</p>
          <div class="hwc-hero__actions">
            <a class="hwc-btn hwc-btn--cyan hwc-btn--hero" href="#hwc-browser">浏览全部产品</a>
            <button type="button" class="hwc-btn hwc-btn--outline-dark" data-demo-modal-open>获取选型建议</button>
          </div>
        </div>
      </div>
    </section>`
}

function lineSystemIcon(kind) {
  const common =
    'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
  if (kind === 'building') {
    return `<svg class="hwc-sys__svg" viewBox="0 0 24 24" width="20" height="20" ${common}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`
  }
  if (kind === 'tags') {
    return `<svg class="hwc-sys__svg" viewBox="0 0 24 24" width="20" height="20" ${common}><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/></svg>`
  }
  return `<svg class="hwc-sys__svg" viewBox="0 0 24 24" width="20" height="20" ${common}><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`
}

function renderLineOverview() {
  const systems = [
    {
      id: 'space',
      name: '空间智能',
      icon: 'building',
      summary: '连接空间设备，让感知、控制与交互形成闭环。',
      highlights: '中控屏 · 电子桌牌 · 工位屏 · 照明与空调 · 传感器 · 网关',
    },
    {
      id: 'retail',
      name: '新零售与行业电子纸',
      icon: 'tags',
      summary: '以低功耗电子纸连接商品、资产与行业数据。',
      highlights: '墨水屏电子价签 · LCD电子价签 · 低温标签 · AAP资产盘点',
    },
    {
      id: 'consumer',
      name: '3C 数码',
      icon: 'phone',
      summary: '让电子纸进入个人设备与数字生活场景。',
      highlights: 'AI墨水屏手机壳 · AI电子纸艺术相框',
    },
  ]
  return `
    <section class="hwc-sys" id="hwc-lines">
      <div class="hwc-shell hwc-sys__shell">
        <div class="hwc-sys__grid">
          ${systems
            .map(
              (item) => `
            <button type="button" class="hwc-sys__card hwc-sys__card--${esc(item.id)}" data-hwc-goto-line="${esc(item.id)}">
              <span class="hwc-sys__top">
                <span class="hwc-sys__identity">
                  <span class="hwc-sys__icon" aria-hidden="true">${lineSystemIcon(item.icon)}</span>
                  <strong class="hwc-sys__title">${esc(item.name)}</strong>
                </span>
                <span class="hwc-sys__go" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                </span>
              </span>
              <span class="hwc-sys__summary">${esc(item.summary)}</span>
              <span class="hwc-sys__range">${esc(item.highlights)}</span>
            </button>`
            )
            .join('')}
        </div>
      </div>
    </section>`
}

function renderBrowser(state) {
  const line = getLine(state.lineId) || HARDWARE_LINES[0]
  const categories = getCategoriesByLine(line.id)
  const categoryId = categories.some((c) => c.id === state.categoryId) ? state.categoryId : categories[0]?.id
  const products = getProductsByCategory(categoryId)
  const featured =
    products.find((p) => p.slug === state.productSlug) || products[0] || getProductsByLine(line.id)[0]
  const indexProducts = getProductsByLine(line.id).filter((p) => p.id !== featured?.id)

  return `
    <section class="hwc-browser" id="hwc-browser">
      <div class="hwc-shell">
        <header class="hwc-section-head">
          <h2>按产品线浏览</h2>
          <p>从产品族进入分类，快速找到适合项目的硬件与资料。</p>
        </header>
        <div class="hwc-tabs" role="tablist" aria-label="产品线">
          ${HARDWARE_LINES.map(
            (l) => `
            <button type="button" class="hwc-tabs__btn${l.id === line.id ? ' is-active' : ''}" role="tab" aria-selected="${l.id === line.id ? 'true' : 'false'}" data-hwc-line="${esc(l.id)}">${esc(l.name)}</button>`
          ).join('')}
        </div>

        <div class="hwc-browser__layout" data-hwc-browser>
          <nav class="hwc-cats" aria-label="二级分类">
            <label class="hwc-cats__mobile">
              <span>选择分类</span>
              <select data-hwc-cat-select>
                ${categories
                  .map(
                    (c) =>
                      `<option value="${esc(c.id)}"${c.id === categoryId ? ' selected' : ''}>${esc(c.name)}</option>`
                  )
                  .join('')}
              </select>
            </label>
            <div class="hwc-cats__list" role="tablist">
              ${categories
                .map(
                  (c) => `
                <button type="button" class="hwc-cats__item${c.id === categoryId ? ' is-active' : ''}" data-hwc-cat="${esc(c.id)}" aria-selected="${c.id === categoryId ? 'true' : 'false'}">
                  <span class="material-symbols-outlined" aria-hidden="true">${esc(c.icon)}</span>
                  <span>${esc(c.name)}</span>
                </button>`
                )
                .join('')}
            </div>
          </nav>

          <div class="hwc-feature" data-hwc-feature>
            ${
              featured
                ? `
              <div class="hwc-feature__copy">
                <h3>${esc(featured.name)}</h3>
                <p>${esc(featured.shortDescription)}</p>
                <div class="hwc-feature__actions">
                  <a class="hwc-btn hwc-btn--orange" href="${productHref(featured)}">查看产品详情 <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
                  ${
                    featured.documentUrl
                      ? `<a class="hwc-btn hwc-btn--outline-dark" href="${esc(featured.documentUrl)}" target="_blank" rel="noopener noreferrer">获取产品资料 <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>`
                      : `<button type="button" class="hwc-btn hwc-btn--outline-dark" data-demo-modal-open>获取产品资料 <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>`
                  }
                </div>
              </div>
              <div class="hwc-feature__media">
                <img src="${esc(featured.coverImage)}" alt="${esc(featured.name)}" width="560" height="420" data-hwc-feature-img />
              </div>`
                : `<p class="hwc-empty">该分类暂无可展示产品。</p>`
            }
          </div>

          <div class="hwc-index" aria-label="产品索引">
            ${indexProducts
              .map(
                (p) => `
              <button type="button" class="hwc-index__row" data-hwc-pick="${esc(p.slug)}">
                <img src="${esc(p.coverImage)}" alt="" width="64" height="48" />
                <span>
                  <strong>${esc(p.name)}</strong>
                  <small>${esc(p.shortDescription)}</small>
                </span>
                <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>`
              )
              .join('')}
          </div>
        </div>

        ${
          line.id === 'space'
            ? `
        <section class="hwc-arch">
          <div class="hwc-arch__head">
            <div>
              <h3>空间智能硬件如何协同</h3>
              <p>空间智能产品线的协同架构。</p>
            </div>
            <a class="hwc-text-link" href="${ASPACE_SOLUTION_HREF}">了解 ASpace 总体解决方案 →</a>
          </div>
          <ol class="hwc-arch__flow">
            ${HARDWARE_SPACE_FLOW.map(
              (step) => `
              <li>
                <span class="material-symbols-outlined" aria-hidden="true">${esc(step.icon)}</span>
                <strong>${esc(step.title)}</strong>
                <small>${esc(step.desc)}</small>
              </li>`
            ).join('')}
          </ol>
        </section>`
            : ''
        }
      </div>
    </section>`
}

function renderRelatedPreviews(activeLineId) {
  const others = HARDWARE_LINES.filter((l) => l.id !== activeLineId)
  return `
    <section class="hwc-related">
      <div class="hwc-shell">
        ${others
          .map((line) => {
            const products = getProductsByLine(line.id)
            return `
            <div class="hwc-related__block">
              <div class="hwc-related__head">
                <h3>${esc(line.name)}</h3>
                <button type="button" class="hwc-text-link" data-hwc-goto-line="${esc(line.id)}">进入产品线 →</button>
              </div>
              <div class="hwc-related__grid">
                ${products
                  .map(
                    (p) => `
                  <a class="hwc-related__card" href="${productHref(p)}">
                    <img src="${esc(p.coverImage)}" alt="${esc(p.name)}" width="220" height="160" />
                    <strong>${esc(p.name)}</strong>
                  </a>`
                  )
                  .join('')}
              </div>
            </div>`
          })
          .join('')}
      </div>
    </section>`
}

function renderCta() {
  return `
    <section class="hwc-cta">
      <div class="hwc-shell hwc-cta__inner">
        <div>
          <h2>获取适合项目的硬件选型建议</h2>
          <p>告诉我们空间类型、部署规模与接入需求，安托未来将协助完成硬件选型与联调方案。</p>
        </div>
        <div class="hwc-cta__actions">
          <button type="button" class="hwc-btn hwc-btn--cyan" data-demo-modal-open>预约方案演示</button>
          <button type="button" class="hwc-btn hwc-btn--ghost" data-demo-modal-open>获取选型建议</button>
        </div>
      </div>
    </section>`
}

function readInitialState() {
  const params = new URLSearchParams(window.location.search)
  const lineParam = params.get('line')
  const productParam = params.get('product') || params.get('id')
  const hash = window.location.hash.replace(/^#/, '')

  let lineId = HARDWARE_LINES[0].id
  let categoryId = getCategoriesByLine(lineId)[0]?.id
  let productSlug = getProductsByCategory(categoryId)[0]?.slug

  if (lineParam && getLine(lineParam)) {
    lineId = getLine(lineParam).id
    categoryId = getCategoriesByLine(lineId)[0]?.id
    productSlug = getProductsByCategory(categoryId)[0]?.slug
  }

  if (hash && ['terminal', 'sensor', 'gateway', 'av'].includes(hash)) {
    const map = {
      terminal: { lineId: 'space', categoryId: 'space-terminal' },
      sensor: { lineId: 'space', categoryId: 'sense-meter' },
      gateway: { lineId: 'space', categoryId: 'edge-access' },
      av: { lineId: 'space', categoryId: 'meeting-office' },
    }
    lineId = map[hash].lineId
    categoryId = map[hash].categoryId
    productSlug = getProductsByCategory(categoryId)[0]?.slug
  }

  if (productParam) {
    const product = getProductBySlug(productParam)
    if (product) {
      lineId = product.productLine
      categoryId = product.category
      productSlug = product.slug
    }
  }

  return { lineId, categoryId, productSlug }
}

export function initHardwareStore() {
  const root = document.getElementById('hardware-root')
  if (!root) return

  let state = readInitialState()

  const render = () => {
    root.innerHTML = `
      <div class="hwc-first">
        ${renderHero()}
        ${renderLineOverview()}
      </div>
      ${renderBrowser(state)}
      ${renderRelatedPreviews(state.lineId)}
      ${renderCta()}
    `
    bind()
  }

  const selectLine = (lineId, { resetCategory = true } = {}) => {
    const line = getLine(lineId)
    if (!line) return
    state.lineId = line.id
    if (resetCategory) {
      state.categoryId = getCategoriesByLine(line.id)[0]?.id
      state.productSlug = getProductsByCategory(state.categoryId)[0]?.slug
    }
    render()
    document.getElementById('hwc-browser')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const selectCategory = (categoryId) => {
    const cats = getCategoriesByLine(state.lineId)
    if (!cats.some((c) => c.id === categoryId)) return
    state.categoryId = categoryId
    state.productSlug = getProductsByCategory(categoryId)[0]?.slug
    render()
  }

  const selectProduct = (slug) => {
    const product = getProductBySlug(slug)
    if (!product) return
    state.lineId = product.productLine
    state.categoryId = product.category
    state.productSlug = product.slug
    render()
    document.getElementById('hwc-browser')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const bind = () => {
    root.querySelectorAll('[data-hwc-line]').forEach((btn) => {
      btn.addEventListener('click', () => selectLine(btn.dataset.hwcLine))
    })
    root.querySelectorAll('[data-hwc-goto-line]').forEach((btn) => {
      btn.addEventListener('click', () => selectLine(btn.dataset.hwcGotoLine))
    })
    root.querySelectorAll('[data-hwc-cat]').forEach((btn) => {
      btn.addEventListener('click', () => selectCategory(btn.dataset.hwcCat))
    })
    root.querySelector('[data-hwc-cat-select]')?.addEventListener('change', (e) => {
      selectCategory(e.target.value)
    })
    root.querySelectorAll('[data-hwc-pick]').forEach((btn) => {
      btn.addEventListener('click', () => selectProduct(btn.dataset.hwcPick))
    })
  }

  render()

  if (window.location.hash === '#hwc-browser' || ['terminal', 'sensor', 'gateway', 'av'].includes(window.location.hash.replace('#', ''))) {
    window.setTimeout(() => {
      document.getElementById('hwc-browser')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  // silence unused warning in some tooling
  void getPublishedProducts
}
