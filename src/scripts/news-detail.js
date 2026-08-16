import { NEWS_ITEMS, getNewsById, formatNewsDate } from '../data/news.js'
import { loadNewsFeedContent } from '../services/site-settings-api.js'
import { hydrateNewsItem } from '../lib/format-news-body.js'

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
    <article class="sx-news-article">
      <nav class="sx-news-article__crumb">
        <a href="../">首页</a><span>/</span>
        <a href="../news/">全部新闻</a><span>/</span>
        <span>未找到</span>
      </nav>
      <h1>未找到该新闻</h1>
      <p class="sx-news-article__lead">${rawId ? `编号「${esc(rawId)}」不存在或已下线。` : '请从新闻中心选择一篇内容。'}</p>
      <a class="sx-news-article__back" href="../news/">← 返回新闻列表</a>
    </article>`
}

function renderSections(n) {
  return (n.sections || [])
    .map((section) => {
      const paras = (section.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('')
      const figure = section.showCover
        ? `<figure class="sx-news-article__figure">
            <img src="${esc(n.cover)}" alt="${esc(n.title)}" loading="lazy" decoding="async" />
          </figure>`
        : ''
      const heading = section.heading ? `<h3>${esc(section.heading)}</h3>` : ''
      return `
        ${heading}
        ${paras}
        ${figure}`
    })
    .join('')
}

function renderTags(tags = []) {
  if (!tags.length) return ''
  return `
    <div class="sx-news-article__tags">
      ${tags.map((t) => `<span>#${esc(t)}</span>`).join('')}
    </div>`
}

function renderRelated(currentId, allItems) {
  const others = allItems.filter((item) => item.id !== currentId).slice(0, 4)
  if (!others.length) return ''
  return `
    <aside class="sx-news-article__related">
      <h2>相关阅读</h2>
      <div class="sx-news-article__related-grid">
        ${others
          .map(
            (item) => `
          <a class="sx-news-article__related-card" href="./?id=${encodeURIComponent(item.id)}">
            <span class="sx-news-article__related-cat">${esc(item.category)}</span>
            <strong>${esc(item.title)}</strong>
            <time datetime="${esc(item.date)}">${esc(formatNewsDate(item.date))}</time>
          </a>`
          )
          .join('')}
      </div>
    </aside>`
}

function renderBody(n) {
  if (n.bodyHtml) return n.bodyHtml
  return renderSections(n)
}

function renderDetail(n) {
  document.title = `${n.title} | 安托未来`
  const author = n.author || '安托未来'
  return `
    <article class="sx-news-article">
      <nav class="sx-news-article__crumb" aria-label="面包屑">
        <a href="../">首页</a><span>/</span>
        <a href="../news/">全部新闻</a><span>/</span>
        <span>${esc(n.title)}</span>
      </nav>

      <header class="sx-news-article__header">
        <a class="sx-news-article__badge" href="../news/">${esc(n.category)}</a>
        <h1>${esc(n.title)}</h1>
        <div class="sx-news-article__meta">
          <span>作者 ${esc(author)}</span>
          <time datetime="${esc(n.date)}">${esc(formatNewsDate(n.date))}</time>
        </div>
        <p class="sx-news-article__lead">${esc(n.summary)}</p>
      </header>

      <div class="sx-news-article__content">
        ${renderBody(n)}
      </div>

      ${renderTags(n.tags)}
      ${renderRelated(n.id, allNewsItems)}

      <div class="sx-news-article__footer">
        <a class="sx-news-article__back" href="../news/">← 返回新闻列表</a>
      </div>
    </article>`
}

let allNewsItems = NEWS_ITEMS

function findNews(id) {
  if (!id) return null
  return allNewsItems.find((n) => n.id === id) || getNewsById(id)
}

export async function initNewsDetailPage() {
  const root = document.getElementById('news-detail-root')
  if (!root) return
  const feed = await loadNewsFeedContent()
  if (feed?.items?.length) {
    allNewsItems = feed.items.map((item) => hydrateNewsItem(item)).filter(Boolean)
  }
  const rawId = new URLSearchParams(window.location.search).get('id')
  const news = findNews(rawId)
  root.innerHTML = news ? renderDetail(news) : renderNotFound(rawId)
}
