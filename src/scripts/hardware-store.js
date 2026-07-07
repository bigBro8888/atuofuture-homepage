import { HARDWARE_CATALOG, HARDWARE_MAIN_CATEGORIES } from '../data/hardware-catalog.js'

function renderProductCard(product, groupLabel, categoryLabel) {
  const featured = product.featured ? ' hardware-card--featured' : ''
  const isQuote = product.price.includes('询价')
  return `
    <article class="hardware-card${featured}" data-category="${categoryLabel}" data-group="${groupLabel}">
      <div class="hardware-card__media">
        <span class="material-symbols-outlined">${product.icon}</span>
      </div>
      <div class="hardware-card__body">
        <div class="hardware-card__tags">
          <span>${categoryLabel}</span>
          <span>${groupLabel}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <div class="hardware-card__footer">
          <div class="hardware-card__price">${product.price}</div>
          <button type="button" class="hardware-card__btn${product.featured ? ' hardware-card__btn--primary' : ''}">
            ${isQuote ? '咨询方案' : '加入采购'}
          </button>
        </div>
      </div>
    </article>
  `
}

function renderCatalog(activeCategory = 'spatial') {
  const category = HARDWARE_CATALOG.find((c) => c.id === activeCategory) || HARDWARE_CATALOG[0]
  return category.groups
    .map(
      (group) => `
      <div class="hardware-group max-w-max-width mx-auto px-margin-desktop mb-14" data-group-section="${group.id}">
        <h2 class="hardware-group__title">${group.label}</h2>
        <div class="hardware-grid">
          ${group.products.map((p) => renderProductCard(p, group.label, category.label)).join('')}
        </div>
      </div>
    `
    )
    .join('')
}

export function initHardwareStore() {
  const tabs = document.getElementById('hardware-category-tabs')
  const catalog = document.getElementById('hardware-catalog')
  if (!tabs || !catalog) return

  let active = 'spatial'

  const render = () => {
    catalog.innerHTML = renderCatalog(active)
    tabs.querySelectorAll('[data-category]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.category === active)
    })
  }

  tabs.innerHTML = HARDWARE_MAIN_CATEGORIES.map(
    (cat) =>
      `<button type="button" class="hardware-category-tab${cat.id === active ? ' is-active' : ''}" data-category="${cat.id}">${cat.label}</button>`
  ).join('')

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]')
    if (!btn) return
    active = btn.dataset.category
    render()
  })

  render()
}
