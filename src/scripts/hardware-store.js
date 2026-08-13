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
        <img src="/images/hardware/hero-bg.png" alt="" width="1920" height="1080" />
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

function renderLineOverview() {
  const lineMeta = {
    space: { icon: 'apartment', arrow: 'cyan' },
    retail: { icon: 'shopping_bag', arrow: 'cyan' },
    consumer: { icon: 'smartphone', arrow: 'orange' },
  }
  return `
    <section class="hwc-lines" id="hwc-lines">
      <div class="hwc-shell hwc-lines__shell">
        <div class="hwc-lines__grid">
          ${HARDWARE_LINES.map((line) => {
            const items = linePreviewItems(line.id)
            const meta = lineMeta[line.id] || { icon: line.icon, arrow: 'cyan' }
            return `
            <article class="hwc-lines__card hwc-lines__card--${esc(line.id)}">
              <button type="button" class="hwc-lines__head" data-hwc-goto-line="${esc(line.id)}">
                <span class="hwc-lines__node" aria-hidden="true"></span>
                <span class="material-symbols-outlined hwc-lines__icon" aria-hidden="true">${esc(meta.icon)}</span>
                <strong>${esc(line.name)}</strong>
                <span class="material-symbols-outlined hwc-lines__arrow hwc-lines__arrow--${esc(meta.arrow)}" aria-hidden="true">arrow_forward</span>
              </button>
              <div class="hwc-lines__items">
                ${items
                  .map(
                    (item) => `
                  <button type="button" class="hwc-lines__item" data-hwc-pick="${esc(item.product.slug)}">
                    <span class="hwc-lines__thumb">
                      <img src="${esc(item.thumb)}" alt="" width="72" height="72" loading="lazy" />
                    </span>
                    <span class="hwc-lines__label">${esc(item.label)}</span>
                  </button>`
                  )
                  .join('')}
              </div>
            </article>`
          }).join('')}
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
