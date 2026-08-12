import { NEWS_ITEMS } from '../data/news.js'

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
      <article class="sx-news-item">
        <time datetime="${n.date}">${n.date}</time>
        <div>
          <div class="sx-news-item__meta">${n.category}</div>
          <h3>${n.title}</h3>
          <p>${n.summary}</p>
        </div>
        <span class="material-symbols-outlined text-primary">arrow_forward</span>
      </article>`
      )
      .join('')

    filters.querySelectorAll('[data-news-cat]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.newsCat === active)
      if (btn.dataset.newsCat === active) {
        btn.classList.add('site-header__btn--primary')
        btn.classList.remove('site-header__btn--ghost')
      } else {
        btn.classList.remove('site-header__btn--primary')
        btn.classList.add('site-header__btn--ghost')
      }
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
