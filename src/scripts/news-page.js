import { NEWS_ITEMS } from '../data/news.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function initNewsPage() {
  const list = document.getElementById('news-list')
  const filters = document.getElementById('news-filters')
  if (!list || !filters) return

  let active = '全部'

  const render = () => {
    const items = active === '全部' ? NEWS_ITEMS : NEWS_ITEMS.filter((n) => n.category === active)
    list.innerHTML = items
      .map(
        (n) => `
      <a class="sx-news-item" href="../news-detail/?id=${encodeURIComponent(n.id)}">
        <div class="sx-news-item__cover" style="background-image:url('${esc(n.cover)}')" role="img" aria-hidden="true"></div>
        <div class="sx-news-item__body">
          <div class="sx-news-item__meta">
            <span>${esc(n.category)}</span>
            <time datetime="${esc(n.date)}">${esc(n.date)}</time>
          </div>
          <h3>${esc(n.title)}</h3>
          <p>${esc(n.summary)}</p>
        </div>
        <span class="material-symbols-outlined sx-news-item__arrow" aria-hidden="true">arrow_forward</span>
      </a>`
      )
      .join('')

    filters.querySelectorAll('[data-news-cat]').forEach((btn) => {
      const on = btn.dataset.newsCat === active
      btn.classList.toggle('is-active', on)
      btn.classList.toggle('site-header__btn--primary', on)
      btn.classList.toggle('site-header__btn--ghost', !on)
    })
  }

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-news-cat]')
    if (!btn) return
    active = btn.dataset.newsCat
    render()
  })

  render()
}
