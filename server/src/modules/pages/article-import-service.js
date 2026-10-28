/**
 * 从外站文章链接抓取标题/正文，并把图片转存到本站。
 * 重点适配微信公众号（mp.weixin.qq.com），其余站点做通用兜底。
 */
import { adaptImportedArticleHtml, plainTextFromHtml } from '../../../../src/lib/sanitize-news-html.js'

const MAX_HTML_BYTES = 4 * 1024 * 1024
const MAX_IMAGES = 40
const FETCH_TIMEOUT_MS = 25000

function assertPublicPageUrl(raw) {
  let text = String(raw || '').trim()
  if (!text) {
    const error = new Error('请粘贴文章链接')
    error.status = 400
    throw error
  }
  if (text.startsWith('//')) text = `https:${text}`
  let parsed
  try {
    parsed = new URL(text)
  } catch {
    const error = new Error('链接格式不正确')
    error.status = 400
    throw error
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    const error = new Error('只支持 http(s) 链接')
    error.status = 400
    throw error
  }
  const host = parsed.hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.localhost') || host === '0.0.0.0' || host === '::1') {
    const error = new Error('不允许抓取内网地址')
    error.status = 400
    throw error
  }
  if (/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) {
    const error = new Error('不允许抓取内网地址')
    error.status = 400
    throw error
  }
  return parsed.toString()
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code)
      return Number.isFinite(n) ? String.fromCodePoint(n) : ''
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const n = Number.parseInt(hex, 16)
      return Number.isFinite(n) ? String.fromCodePoint(n) : ''
    })
}

function metaContent(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${key}["']`, 'i'),
  ]
  for (const re of patterns) {
    const match = re.exec(html)
    if (match?.[1]) return decodeHtmlEntities(match[1]).trim()
  }
  return ''
}

function tagText(html, tag) {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(html)
  if (!match) return ''
  return decodeHtmlEntities(match[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function normalizeRemoteUrl(raw, pageUrl) {
  let value = decodeHtmlEntities(String(raw || '').trim()).replace(/&amp;/g, '&')
  if (!value || value.startsWith('data:')) return ''
  if (value.startsWith('//')) value = `https:${value}`
  try {
    return new URL(value, pageUrl).toString()
  } catch {
    return ''
  }
}

function promoteLazyImages(html, pageUrl) {
  return String(html || '').replace(/<img\b([^>]*?)\/?>/gi, (full, attrs) => {
    const pick = (...names) => {
      for (const name of names) {
        const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
        const match = re.exec(attrs)
        const value = match?.[2] ?? match?.[3] ?? match?.[4] ?? ''
        const url = normalizeRemoteUrl(value, pageUrl)
        if (url) return url
      }
      return ''
    }
    const src = pick('data-src', 'data-original', 'data-lazy-src', 'data-actualsrc', 'src')
    if (!src) return ''
    let nextAttrs = String(attrs || '')
      .replace(/\s*(?:data-src|data-original|data-lazy-src|data-actualsrc|src)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi, '')
      .replace(/\s*(?:onload|onerror|onclick)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi, '')
      .trim()
    nextAttrs = `src="${src.replace(/"/g, '&quot;')}"${nextAttrs ? ` ${nextAttrs}` : ''}`
    return `<img ${nextAttrs}>`
  })
}

function stripNoise(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<\/?(?:button|form|input|textarea|select|noscript)\b[^>]*>/gi, '')
}

function extractById(html, id) {
  const open = new RegExp(`<(div|section)([^>]*\\bid=["']${id}["'][^>]*)>`, 'i').exec(html)
  if (!open) return ''
  const tag = open[1].toLowerCase()
  const start = open.index + open[0].length
  const slice = html.slice(start)
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi')
  let depth = 1
  let match
  while ((match = re.exec(slice))) {
    if (match[1]) depth -= 1
    else depth += 1
    if (depth === 0) return slice.slice(0, match.index)
  }
  return slice.slice(0, 200000)
}

function extractByClassHint(html, hint) {
  const open = new RegExp(
    `<(div|section|article)([^>]*\\b(?:class|id)=["'][^"']*${hint}[^"']*["'][^>]*)>`,
    'i',
  ).exec(html)
  if (!open) return ''
  const tag = open[1].toLowerCase()
  const start = open.index + open[0].length
  const slice = html.slice(start)
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi')
  let depth = 1
  let match
  while ((match = re.exec(slice))) {
    if (match[1]) depth -= 1
    else depth += 1
    if (depth === 0) return slice.slice(0, match.index)
  }
  return slice.slice(0, 200000)
}

function isWeixin(url) {
  try {
    return /(^|\.)mp\.weixin\.qq\.com$/i.test(new URL(url).hostname)
  } catch {
    return false
  }
}

function extractArticleHtml(html, pageUrl) {
  if (isWeixin(pageUrl)) {
    const weixin = extractById(html, 'js_content') || extractByClassHint(html, 'rich_media_content')
    if (weixin) return weixin
  }
  const candidates = [
    extractById(html, 'js_content'),
    extractByClassHint(html, 'rich_media_content'),
    extractByClassHint(html, 'article-content'),
    extractByClassHint(html, 'post-content'),
    extractByClassHint(html, 'entry-content'),
    extractByClassHint(html, 'article-body'),
    extractByClassHint(html, 'news-content'),
  ].filter(Boolean)
  const article = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(html)?.[1]
  if (article) candidates.unshift(article)
  candidates.sort((a, b) => b.length - a.length)
  return candidates[0] || ''
}

function collectImageUrls(html, pageUrl) {
  const urls = []
  const seen = new Set()
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
  let match
  while ((match = re.exec(html))) {
    const url = normalizeRemoteUrl(match[1], pageUrl)
    if (!url || seen.has(url) || url.startsWith('data:')) continue
    seen.add(url)
    urls.push(url)
    if (urls.length >= MAX_IMAGES) break
  }
  return urls
}

async function fetchPageHtml(pageUrl) {
  const weixin = isWeixin(pageUrl)
  const response = await fetch(pageUrl, {
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      ...(weixin ? { Referer: 'https://mp.weixin.qq.com/' } : {}),
    },
  })
  if (!response.ok) {
    const error = new Error(`无法打开该链接（HTTP ${response.status}）`)
    error.status = 400
    throw error
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length > MAX_HTML_BYTES) {
    const error = new Error('页面过大，无法解析')
    error.status = 400
    throw error
  }
  let charset = 'utf-8'
  const contentType = response.headers.get('content-type') || ''
  const headerCharset = /charset=([^\s;]+)/i.exec(contentType)?.[1]
  if (headerCharset) charset = headerCharset.replace(/["']/g, '')
  let html = buffer.toString('utf8')
  const metaCharset = /<meta[^>]+charset=["']?\s*([^\s"'/>]+)/i.exec(html)?.[1]
  if (metaCharset && !/utf-?8/i.test(metaCharset)) {
    try {
      html = new TextDecoder(metaCharset).decode(buffer)
    } catch {
      /* keep utf8 */
    }
  } else if (charset && !/utf-?8/i.test(charset)) {
    try {
      html = new TextDecoder(charset).decode(buffer)
    } catch {
      /* keep utf8 */
    }
  }
  const blocked =
    /wappoc_appmsgcaptcha|weui-msg__title">环境异常|id=["']js_verify["']|当前环境异常/i.test(html) ||
    (/环境异常|操作频繁|security_verify/i.test(html) && !/id=["']js_content["']/i.test(html))
  if (blocked) {
    const error = new Error(
      '微信拦截了服务器机房 IP（要求人机验证）。链接本身没问题：请点「打开原文」，在浏览器里 Ctrl+A / Ctrl+C，再点「从剪贴板导入」。',
    )
    error.status = 400
    error.code = 'weixin_ip_block'
    throw error
  }
  return html
}

/**
 * 解析已拿到的文章 HTML（服务端抓取或浏览器剪贴板/另存文件），并转存图片。
 * @param {string} html
 * @param {string} pageUrl
 * @param {{
 *   fetchRemoteImage: (url: string, referer?: string) => Promise<{ buffer: Buffer, mimeType: string }>,
 *   saveImageBuffer: (buffer: Buffer, mimeType: string, extra?: object) => Promise<string>,
 * }} deps
 */
export async function importArticleFromHtml(html, pageUrl, deps) {
  const sourceUrl = pageUrl ? assertPublicPageUrl(pageUrl) : 'https://mp.weixin.qq.com/'
  const rawHtml = String(html || '')
  if (rawHtml.length < 40) {
    const error = new Error('未读到网页内容，请先在原文页全选复制后再试')
    error.status = 400
    throw error
  }
  if (rawHtml.length > MAX_HTML_BYTES) {
    const error = new Error('网页内容过大，无法解析')
    error.status = 400
    throw error
  }

  const title =
    (isWeixin(sourceUrl) ? tagText(rawHtml, 'h1') : '') ||
    metaContent(rawHtml, 'og:title') ||
    metaContent(rawHtml, 'twitter:title') ||
    tagText(rawHtml, 'title') ||
    ''

  const summary =
    metaContent(rawHtml, 'og:description') ||
    metaContent(rawHtml, 'description') ||
    metaContent(rawHtml, 'twitter:description') ||
    ''

  const author =
    metaContent(rawHtml, 'author') ||
    metaContent(rawHtml, 'og:article:author') ||
    (/id=["']js_name["'][^>]*>([^<]+)</i.exec(rawHtml)?.[1] || '').trim() ||
    ''

  let date =
    metaContent(rawHtml, 'article:published_time') ||
    metaContent(rawHtml, 'og:article:published_time') ||
    (/id=["']publish_time["'][^>]*>([^<]+)</i.exec(rawHtml)?.[1] || '').trim() ||
    ''
  if (date) {
    const parsed = Date.parse(date)
    if (Number.isFinite(parsed)) date = new Date(parsed).toISOString().slice(0, 10)
    else {
      const m = date.match(/(\d{4})\s*[年/-]\s*(\d{1,2})\s*[月/-]\s*(\d{1,2})/)
      if (m) date = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
      else date = ''
    }
  }

  let cover = normalizeRemoteUrl(metaContent(rawHtml, 'og:image') || metaContent(rawHtml, 'twitter:image'), sourceUrl)

  let bodyRaw = extractArticleHtml(rawHtml, sourceUrl)
  // 剪贴板常常只有正文片段，不一定带 js_content 外壳
  if (!bodyRaw || bodyRaw.replace(/<[^>]+>/g, '').trim().length < 20) {
    bodyRaw = rawHtml
  }
  const plainLen = bodyRaw.replace(/<[^>]+>/g, '').replace(/\s+/g, '').length
  if (!bodyRaw || plainLen < 8) {
    const error = new Error('未能识别文章正文。请打开原文，选中正文复制后，粘贴到弹窗黄色区域的文本框，再点「解析粘贴内容」')
    error.status = 400
    throw error
  }

  bodyRaw = promoteLazyImages(stripNoise(bodyRaw), sourceUrl)
  // 按本站白底阅读栏适配：去微信黑底/手机定宽，保留对齐与段落结构
  let bodyHtml = adaptImportedArticleHtml(bodyRaw, { keepColor: true })
  if (!bodyHtml.trim()) {
    const error = new Error('正文解析后为空，请检查复制内容后重试')
    error.status = 400
    throw error
  }

  const imageUrls = collectImageUrls(bodyHtml, sourceUrl)
  if (cover && !imageUrls.includes(cover)) imageUrls.unshift(cover)

  const warnings = []
  const rewrite = new Map()
  let importedImages = 0
  for (const remote of imageUrls) {
    if (rewrite.has(remote)) continue
    try {
      const host = new URL(remote).hostname
      const referer =
        isWeixin(sourceUrl) || /\.qpic\.cn$/i.test(host) ? 'https://mp.weixin.qq.com/' : sourceUrl
      const { buffer, mimeType } = await deps.fetchRemoteImage(remote, referer)
      const local = await deps.saveImageBuffer(buffer, mimeType, { source: remote, from: 'news.import' })
      rewrite.set(remote, local)
      importedImages += 1
    } catch (error) {
      warnings.push(`图片转存失败：${remote.slice(0, 80)}（${error.message || '未知错误'}）`)
    }
  }

  for (const [remote, local] of rewrite) {
    const escaped = remote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    bodyHtml = bodyHtml.replace(new RegExp(escaped, 'g'), local)
    if (cover === remote) cover = local
  }

  if (cover && !cover.startsWith('/api/public/uploads/') && !rewrite.has(cover)) {
    try {
      const { buffer, mimeType } = await deps.fetchRemoteImage(
        cover,
        isWeixin(sourceUrl) ? 'https://mp.weixin.qq.com/' : sourceUrl,
      )
      cover = await deps.saveImageBuffer(buffer, mimeType, { source: cover, from: 'news.import.cover' })
      importedImages += 1
    } catch {
      cover = ''
      warnings.push('封面图转存失败，已跳过')
    }
  }

  const plain = plainTextFromHtml(bodyHtml)
  const shortSummary = (summary || plain).replace(/\s+/g, ' ').trim().slice(0, 120)

  return {
    sourceUrl,
    title: title.slice(0, 200),
    summary: shortSummary,
    author: author.slice(0, 80),
    date,
    cover,
    bodyHtml,
    imageCount: importedImages,
    warnings: warnings.slice(0, 8),
  }
}

/**
 * @param {string} rawUrl
 * @param {{
 *   fetchRemoteImage: (url: string, referer?: string) => Promise<{ buffer: Buffer, mimeType: string }>,
 *   saveImageBuffer: (buffer: Buffer, mimeType: string, extra?: object) => Promise<string>,
 * }} deps
 */
export async function importArticleFromUrl(rawUrl, deps) {
  const pageUrl = assertPublicPageUrl(rawUrl)
  const html = await fetchPageHtml(pageUrl)
  return importArticleFromHtml(html, pageUrl, deps)
}

export { isWeixin, assertPublicPageUrl }
