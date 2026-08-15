import { NEWS_ITEMS, formatNewsDate } from '../data/news.js'
import { loadNewsFeedContent, loadSimplePageContent } from '../services/site-settings-api.js'
import { hydrateNewsItem } from '../lib/format-news-body.js'

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

let newsItems = NEWS_ITEMS
let cmsHero = null

function filterItems(active) {
  return active === '全部' ? newsItems : newsItems.filter((n) => n.category === active)
}

function renderLead(n) {
  if (!n) return ''
  return `
    <section class="nx-lead">
      <div class="nx-shell">
        <a class="nx-lead__main" href="../news-detail/?id=${encodeURIComponent(n.id)}">
          <div class="nx-lead__photo" style="background-image:url('${esc(n.cover)}')" role="img" aria-hidden="true"></div>
          <div class="nx-lead__overlay">
            <div class="nx-lead__meta">
              <span class="nx-chip nx-chip--${catKey(n.category)}">${esc(n.category)}</span>
              <time datetime="${esc(n.date)}">${esc(formatNewsDate(n.date))}</time>
            </div>
            <h1>${esc(n.title)}</h1>
            <p>${esc(n.summary)}</p>
          </div>
        </a>
      </div>
    </section>`
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
  const pool = filterItems(active)
  const featured = pool[0]
  const rest = pool.slice(1)
  const count = pool.length

  return `
    ${cmsHero?.title ? `<section class="nx-intro"><div class="nx-shell"><h1>${esc(cmsHero.title)}</h1>${cmsHero.subtitle ? `<p>${esc(cmsHero.subtitle)}</p>` : ''}</div></section>` : ''}
    ${renderLead(featured)}

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
            rest.length
              ? `<div class="nx-stream">${rest.map((n, i) => renderItem(n, i)).join('')}</div>`
              : pool.length
                ? ''
                : `<p class="nx-empty">该分类暂无内容</p>`
          }
        </div>
      </div>
    </section>`
}

export async function initNewsPage() {
  const root = document.getElementById('news-root')
  if (!root) return
  const [feed, simple] = await Promise.all([loadNewsFeedContent(), loadSimplePageContent('news')])
  if (feed?.items?.length) {
    newsItems = feed.items.map((item) => hydrateNewsItem(item)).filter(Boolean)
    cmsHero = { title: feed.title || simple?.title, subtitle: feed.subtitle || simple?.subtitle }
  } else {
    newsItems = NEWS_ITEMS
    cmsHero = simple
  }

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
