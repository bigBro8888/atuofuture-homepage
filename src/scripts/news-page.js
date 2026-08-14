import { NEWS_ITEMS, formatNewsDate } from '../data/news.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const FILTERS = [
  { id: '全部', label: '全部' },
  { id: '公司动态', label: '公司' },
  { id: '产品更新', label: '产品' },
  { id: '方案实践', label: '方案' },
]

function catKey(category) {
  if (category === '公司动态') return 'company'
  if (category === '产品更新') return 'product'
  if (category === '方案实践') return 'solution'
  return 'default'
}

function filterItems(active) {
  return active === '全部' ? NEWS_ITEMS : NEWS_ITEMS.filter((n) => n.category === active)
}

function renderFeatured(n) {
  if (!n) return ''
  return `
    <a class="nx-feature" href="../news-detail/?id=${encodeURIComponent(n.id)}" style="--nx-feature-image:url('${esc(n.cover)}')">
      <div class="nx-feature__media" aria-hidden="true"></div>
      <div class="nx-feature__shade" aria-hidden="true"></div>
      <div class="nx-shell nx-feature__copy">
        <div class="nx-feature__meta">
          <span class="nx-chip nx-chip--${catKey(n.category)}">${esc(n.category)}</span>
          <time datetime="${esc(n.date)}">${esc(formatNewsDate(n.date))}</time>
        </div>
        <h1>${esc(n.title)}</h1>
        <p>${esc(n.summary)}</p>
        <span class="nx-feature__cta">
          阅读全文
          <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </span>
      </div>
    </a>`
}

function renderItem(n, index) {
  return `
    <a class="nx-item" href="../news-detail/?id=${encodeURIComponent(n.id)}" style="--nx-i:${index}">
      <div class="nx-item__cover" style="background-image:url('${esc(n.cover)}')" role="img" aria-hidden="true"></div>
      <div class="nx-item__body">
        <div class="nx-item__meta">
          <span class="nx-chip nx-chip--${catKey(n.category)}">${esc(n.category)}</span>
          <time datetime="${esc(n.date)}">${esc(formatNewsDate(n.date))}</time>
        </div>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.summary)}</p>
      </div>
      <span class="nx-item__arrow material-symbols-outlined" aria-hidden="true">arrow_forward</span>
    </a>`
}

function renderPage(active) {
  const featured = NEWS_ITEMS[0]
  const items = filterItems(active).filter((n) => n.id !== featured?.id)
  const count = filterItems(active).length

  return `
    ${renderFeatured(featured)}

    <section class="nx-main">
      <div class="nx-shell">
        <div class="nx-toolbar">
          <div class="nx-filters" id="news-filters" role="tablist" aria-label="新闻分类">
            ${FILTERS.map(
              (f) => `
              <button
                type="button"
                class="nx-filter${f.id === active ? ' is-active' : ''}"
                data-news-cat="${esc(f.id)}"
                role="tab"
                aria-selected="${f.id === active ? 'true' : 'false'}"
              >${esc(f.label)}</button>`
            ).join('')}
          </div>
          <p class="nx-toolbar__count" data-nx-count>${count} 篇内容</p>
        </div>

        <div class="nx-board" id="news-list">
          ${
            items.length
              ? `<div class="nx-stream">${items.map((n, i) => renderItem(n, i)).join('')}</div>`
              : `<p class="nx-empty">该分类暂无更多内容</p>`
          }
        </div>
      </div>
    </section>`
}

export function initNewsPage() {
  const root = document.getElementById('news-root')
  if (!root) return

  let active = '全部'

  const paint = () => {
    root.innerHTML = renderPage(active)
    root.querySelector('#news-filters')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-news-cat]')
      if (!btn) return
      active = btn.dataset.newsCat
      paint()
    })
  }

  paint()
}
