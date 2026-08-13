import { NEWS_ITEMS, getNewsById } from '../data/news.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderNotFound(rawId) {
  document.title = '新闻未找到 | 安托未来'
  return `
    <section class="pb-24">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <nav class="agent-detail-breadcrumb mb-8">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="../news/">新闻中心</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>未找到</span>
        </nav>
        <h1>未找到该新闻</h1>
        <p class="mt-4" style="color:#5b6b7c">${rawId ? `编号「${esc(rawId)}」不存在或已下线。` : '请从新闻中心选择一篇内容。'}</p>
        <p class="mt-8"><a class="site-header__btn site-header__btn--primary" href="../news/">返回新闻中心</a></p>
      </div>
    </section>`
}

function renderDetail(n) {
  document.title = `${n.title} | 安托未来`
  const others = NEWS_ITEMS.filter((item) => item.id !== n.id).slice(0, 3)
  return `
    <article class="sx-news-detail">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <nav class="agent-detail-breadcrumb mb-8">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="../news/">新闻中心</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>${esc(n.title)}</span>
        </nav>

        <header class="sx-news-detail__head">
          <div class="sx-news-item__meta">
            <span>${esc(n.category)}</span>
            <time datetime="${esc(n.date)}">${esc(n.date)}</time>
          </div>
          <h1>${esc(n.title)}</h1>
          <p class="sx-news-detail__lead">${esc(n.summary)}</p>
        </header>

        <div class="sx-news-detail__cover" style="background-image:url('${esc(n.cover)}')" role="img" aria-label="${esc(n.title)}"></div>

        <div class="sx-news-detail__content">
          ${n.body.map((p) => `<p>${esc(p)}</p>`).join('')}
        </div>

        <div class="sx-news-detail__actions">
          <a class="site-header__btn site-header__btn--ghost" href="../news/">返回新闻中心</a>
          <button type="button" class="site-header__btn site-header__btn--primary" data-demo-modal-open>预约方案演示</button>
        </div>

        ${
          others.length
            ? `<aside class="sx-news-detail__more">
          <h2>相关阅读</h2>
          <div class="sx-news-detail__more-grid">
            ${others
              .map(
                (item) => `
              <a class="sx-news-detail__more-card" href="./?id=${encodeURIComponent(item.id)}">
                <div class="sx-news-detail__more-cover" style="background-image:url('${esc(item.cover)}')" aria-hidden="true"></div>
                <strong>${esc(item.title)}</strong>
                <span>${esc(item.date)}</span>
              </a>`
              )
              .join('')}
          </div>
        </aside>`
            : ''
        }
      </div>
    </article>`
}

export function initNewsDetailPage() {
  const root = document.getElementById('news-detail-root')
  if (!root) return
  const rawId = new URLSearchParams(window.location.search).get('id')
  const news = getNewsById(rawId)
  root.innerHTML = news ? renderDetail(news) : renderNotFound(rawId)
}
