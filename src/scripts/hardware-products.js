import { applyProductLibraryCms, getLine, getProductLibraryItems, getProductLibraryCategories } from '../data/hardware-catalog.js'
import { loadProductLibraryContent } from '../services/site-settings-api.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function detailHref(item) {
  const slug = item.slug || item.id || ''
  return `/hardware/product/?id=${encodeURIComponent(slug)}`
}

function lineLabel(item) {
  const line = getLine(item.hardwareLine || item.productLine || '')
  return line?.shortName || line?.name || item.tag || ''
}

function renderCard(item) {
  const name = item.name || '未命名产品'
  const summary = item.shortDescription || ''
  const cover = item.coverImage || ''
  const line = lineLabel(item)
  return `
    <a class="hwp-card" href="${esc(detailHref(item))}">
      <span class="hwp-card__media">
        ${
          cover
            ? `<img src="${esc(cover)}" alt="${esc(name)}" width="800" height="600" loading="lazy" />`
            : `<span class="hwp-card__placeholder" aria-hidden="true"></span>`
        }
      </span>
      <span class="hwp-card__body">
        ${line ? `<em class="hwp-card__line">${esc(line)}</em>` : ''}
        <strong>${esc(name)}</strong>
        ${summary ? `<small>${esc(summary)}</small>` : ''}
        <span class="hwp-card__more">查看详情</span>
      </span>
    </a>`
}

function renderTabs(categories, activeId) {
  const tabs = [{ id: '', name: '全部' }, ...categories]
  if (tabs.length <= 1) return ''
  return `
    <nav class="hwp__tabs" aria-label="商品分类">
      ${tabs
        .map(
          (tab) => `
        <button type="button" class="hwp__tab${tab.id === activeId ? ' is-active' : ''}" data-hwp-tab="${esc(tab.id)}">
          ${esc(tab.name)}
        </button>`,
        )
        .join('')}
    </nav>`
}

function renderPage(items, categories, activeId) {
  const count = items.length
  return `
    <section class="hwp">
      <div class="hwc-shell hwp__inner">
        <header class="hwp__head">
          <p class="hwp__crumb"><a href="/hardware/">智能硬件</a> / 全部产品</p>
          <h1>全部产品</h1>
          <p class="hwp__lead">来自内容中心已发布的商品详情，共 ${count} 款。</p>
        </header>
        ${renderTabs(categories, activeId)}
        ${
          count
            ? `<div class="hwp__grid">${items.map(renderCard).join('')}</div>`
            : `<p class="hwp__empty">暂无已发布产品，请先在后台「内容中心 → 商品详情」添加并发布。</p>`
        }
      </div>
    </section>`
}

function filterItems(items, categoryId) {
  if (!categoryId) return items
  return items.filter((item) => (item.category || '') === categoryId)
}

export async function initHardwareProductsPage() {
  const root = document.getElementById('hardware-products-root')
  if (!root) return
  const library = await loadProductLibraryContent()
  applyProductLibraryCms(library)
  const items = getProductLibraryItems()
  const categories = getProductLibraryCategories()
  let activeId = ''
  document.title = '全部产品 | 智能硬件 | 安托未来'
  root.innerHTML = renderPage(items, categories, activeId)
  root.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-hwp-tab]')
    if (!tab) return
    event.preventDefault()
    activeId = tab.dataset.hwpTab || ''
    root.innerHTML = renderPage(filterItems(items, activeId), categories, activeId)
  })
}
