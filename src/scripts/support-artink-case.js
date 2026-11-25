import { NEWS_ITEMS, compareNewsByDateDesc, getNewsById, formatNewsDate } from '../data/news.js'
import { loadNewsFeedContent } from '../services/site-settings-api.js'
import { hydrateNewsItem } from '../lib/format-news-body.js'
import { sanitizeNewsHtml } from '../lib/sanitize-news-html.js'

const ARTICLE_ID = 'n-33589a85'
const CRUMB_TITLE = 'Artink安墨客墨水屏手机帮助中心'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderBody(n) {
  if (n.bodyHtml) return sanitizeNewsHtml(n.bodyHtml)
  return (n.sections || [])
    .map((section) => {
      const paras = (section.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('')
      const figure = section.showCover
        ? `<figure class="sx-news-article__figure">
            <img src="${esc(n.cover)}" alt="${esc(n.title)}" loading="lazy" decoding="async" />
          </figure>`
        : ''
      const heading = section.heading ? `<h3>${esc(section.heading)}</h3>` : ''
      return `${heading}${paras}${figure}`
    })
    .join('')
}

function renderPage(n) {
  document.title = `${CRUMB_TITLE} | 安托未来`
  const author = n.author || '安托未来'
  return `
    <article class="sx-news-article">
      <nav class="sx-news-article__crumb" aria-label="面包屑">
        <a href="../">首页</a><span>/</span>
        <span>${esc(CRUMB_TITLE)}</span>
      </nav>

      <header class="sx-news-article__header">
        <h1>${esc(n.title || CRUMB_TITLE)}</h1>
        <div class="sx-news-article__meta">
          <span>作者 ${esc(author)}</span>
          <time datetime="${esc(n.date)}">${esc(formatNewsDate(n.date))}</time>
        </div>
      </header>

      <div class="sx-news-article__content">
        ${renderBody(n)}
      </div>
    </article>`
}

function renderMissing() {
  document.title = `${CRUMB_TITLE} | 安托未来`
  return `
    <article class="sx-news-article">
      <nav class="sx-news-article__crumb" aria-label="面包屑">
        <a href="../">首页</a><span>/</span>
        <span>${esc(CRUMB_TITLE)}</span>
      </nav>
      <h1>${esc(CRUMB_TITLE)}</h1>
      <p class="sx-news-article__lead">内容暂不可用，请稍后再试。</p>
      <a class="sx-news-article__back" href="../">← 返回首页</a>
    </article>`
}

export async function initSupportArtinkCasePage() {
  const root = document.getElementById('support-artink-case-root')
  if (!root) return

  let items = NEWS_ITEMS
  const feed = await loadNewsFeedContent()
  if (feed?.items?.length) {
    items = feed.items.map((item) => hydrateNewsItem(item)).filter(Boolean).sort(compareNewsByDateDesc)
  }

  const news = items.find((n) => n.id === ARTICLE_ID) || getNewsById(ARTICLE_ID)
  root.innerHTML = news ? renderPage(news) : renderMissing()
}
