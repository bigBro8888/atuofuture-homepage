import { resolveNewsVideo } from './news-video.js'

const ALLOWED_TAGS = new Set([
  'p', 'br', 'div', 'span', 'section', 'h1', 'h2', 'h3', 'h4',
  'blockquote', 'pre', 'code',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'td', 'th', 'caption',
  'img', 'a', 'figure', 'figcaption', 'hr', 'video', 'iframe',
])

const VOID_TAGS = new Set(['br', 'img', 'hr'])
const BREAK_PHRASING = new Set([
  'figure', 'table', 'ul', 'ol', 'blockquote', 'pre', 'div', 'section',
  'h1', 'h2', 'h3', 'h4', 'video', 'iframe',
])
const BOOLEAN_ATTRS = new Set(['controls', 'playsinline', 'allowfullscreen'])
const SAFE_CODE_CLASS = /^(sx-news-code|language-[\w-]+|lang-[\w-]+)$/
const STYLE_TAGS = new Set([
  'p', 'div', 'span', 'section', 'h1', 'h2', 'h3', 'h4',
  'blockquote', 'li', 'ul', 'ol', 'table', 'td', 'th', 'tr',
  'img', 'figure', 'figcaption', 'a', 'pre', 'code',
])

const ALLOWED_ATTR = {
  a: new Set(['href', 'title', 'target', 'rel', 'style']),
  img: new Set(['src', 'alt', 'title', 'width', 'height', 'style', 'class']),
  td: new Set(['colspan', 'rowspan', 'style']),
  th: new Set(['colspan', 'rowspan', 'style']),
  table: new Set(['border', 'style']),
  tr: new Set(['style']),
  span: new Set(['style']),
  p: new Set(['style']),
  div: new Set(['style']),
  section: new Set(['style']),
  h1: new Set(['style']),
  h2: new Set(['style']),
  h3: new Set(['style']),
  h4: new Set(['style']),
  blockquote: new Set(['style']),
  li: new Set(['style']),
  ul: new Set(['style']),
  ol: new Set(['style']),
  figure: new Set(['class', 'contenteditable', 'style']),
  figcaption: new Set(['style']),
  pre: new Set(['class', 'style']),
  code: new Set(['class', 'style']),
  video: new Set(['src', 'controls', 'playsinline', 'preload', 'poster']),
  iframe: new Set(['src', 'title', 'allow', 'allowfullscreen', 'loading']),
}

const SAFE_STYLE_PROPS = new Set([
  'color', 'background', 'background-color',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-color', 'border-style', 'border-width',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-radius',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height',
  'font-size', 'font-weight', 'font-family', 'font-style',
  'letter-spacing', 'line-height', 'text-align', 'text-indent', 'text-decoration',
  'display', 'box-shadow', 'opacity', 'overflow', 'overflow-x', 'overflow-y',
  'white-space', 'word-break', 'word-wrap', 'vertical-align', 'object-fit',
])

function safeColor(value) {
  const text = String(value || '').trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text)) return text.toLowerCase()
  const rgb = text.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
  if (rgb && [...rgb.slice(1)].every((part) => Number(part) <= 255)) return `rgb(${rgb[1]}, ${rgb[2]}, ${rgb[3]})`
  const rgba = text.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|0?\.\d+|1|1\.0)\s*\)$/i)
  if (rgba && [...rgba.slice(1, 4)].every((part) => Number(part) <= 255)) {
    return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${rgba[4]})`
  }
  return ''
}

function isSafeStyleValue(value) {
  const text = String(value || '').trim()
  if (!text || text.length > 240) return false
  const lower = text.toLowerCase()
  if (/expression\s*\(|javascript:|vbscript:|data:|@import|behavior\s*:|-moz-binding|url\s*\(\s*['"]?\s*javascript/i.test(lower)) {
    return false
  }
  return true
}

/** 仅保留排版相关、无脚本风险的内联样式（微站迁移稿常用）。 */
export function safeInlineStyle(value, { colorOnly = false } = {}) {
  const declarations = []
  String(value || '').split(';').forEach((chunk) => {
    const trimmed = chunk.trim()
    if (!trimmed) return
    const colon = trimmed.indexOf(':')
    if (colon < 0) return
    const prop = trimmed.slice(0, colon).trim().toLowerCase()
    const rawVal = trimmed.slice(colon + 1).trim()
    if (!rawVal || !SAFE_STYLE_PROPS.has(prop)) return
    if (colorOnly && prop !== 'color') return
    if (!isSafeStyleValue(rawVal)) return
    if (prop === 'color' || prop === 'background-color' || prop.endsWith('-color')) {
      if (/^(transparent|inherit|currentcolor)$/i.test(rawVal)) {
        declarations.push(`${prop}:${rawVal.toLowerCase()}`)
        return
      }
      const color = safeColor(rawVal)
      if (color) declarations.push(`${prop}:${color}`)
      return
    }
    if (prop === 'background') {
      // 仅纯色背景，避免 url()
      if (/url\s*\(/i.test(rawVal)) return
      const color = safeColor(rawVal)
      if (color) declarations.push(`background:${color}`)
      else if (/^#[0-9a-f]{3,8}$/i.test(rawVal) || /^rgba?\(/i.test(rawVal)) {
        declarations.push(`background:${rawVal}`)
      }
      return
    }
    if (prop === 'font-family') {
      const cleaned = rawVal
        .replace(/["']/g, '')
        .split(',')
        .map((item) => item.trim())
        .filter((item) => /^[a-z0-9.\s_-]+$/i.test(item))
        .filter((item) => !/geist|inter|segoe|dingtalk|钉钉|sf pro|helvetica neue|arial black/i.test(item))
        .slice(0, 4)
      if (cleaned.length) declarations.push(`font-family:${cleaned.join(', ')}`)
      return
    }
    declarations.push(`${prop}:${rawVal.replace(/[<>'"]/g, '')}`)
  })
  return declarations.length ? `style="${declarations.join(';')}"` : ''
}

function safeUrl(value, kind) {
  let url = String(value || '').trim().replace(/&amp;/g, '&').replace(/&quot;/g, '')
  if (!url) return ''
  if (url.startsWith('//')) url = `https:${url}`
  if (url.startsWith('/') && !url.startsWith('//')) return url.slice(0, 4000)
  const lower = url.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('data:text') || lower.startsWith('vbscript:')) return ''
  if (kind === 'img' && lower.startsWith('data:image/')) return url.slice(0, 200000)
  try {
    const parsed = new URL(url)
    if (kind === 'a' && parsed.protocol === 'mailto:') return parsed.toString().slice(0, 4000)
    if (!['http:', 'https:'].includes(parsed.protocol)) return ''
    return parsed.toString().slice(0, 4000)
  } catch {
    return ''
  }
}

function parseAttributes(raw, tag, keepStyles = true) {
  const allowed = ALLOWED_ATTR[tag]
  if (!allowed) return ''
  const out = []
  const seen = new Set()
  const re = /([a-zA-Z:_][a-zA-Z0-9:_.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g
  let match
  while ((match = re.exec(raw))) {
    const name = match[1].toLowerCase()
    if (name.startsWith('on')) continue
    if (!allowed.has(name)) continue
    seen.add(name)
    const value = match[3] ?? match[4] ?? match[5] ?? ''
    if (name === 'href' || name === 'src') {
      const cleaned = safeUrl(value, tag === 'img' ? 'img' : 'a')
      if (!cleaned) continue
      if (tag === 'iframe') {
        const resolved = resolveNewsVideo(cleaned)
        if (!resolved || resolved.kind !== 'embed') continue
        out.push(`src="${resolved.src.replace(/"/g, '&quot;')}"`)
        continue
      }
      if (tag === 'video') {
        const resolved = resolveNewsVideo(cleaned)
        if (!resolved || resolved.kind === 'embed') continue
        out.push(`src="${resolved.src.replace(/"/g, '&quot;')}"`)
        continue
      }
      out.push(`${name}="${cleaned.replace(/"/g, '&quot;')}"`)
      if (name === 'href') out.push('rel="noopener noreferrer"')
      continue
    }
    if (name === 'class' && tag === 'figure') {
      if (/\bsx-news-video\b/.test(value)) out.push('class="sx-news-video" data-news-video="1"')
      continue
    }
    if (name === 'class' && tag === 'img') {
      if (/\bfullScreen\b/i.test(value)) out.push('class="sx-news-img"')
      continue
    }
    if (name === 'class' && (tag === 'pre' || tag === 'code')) {
      const classes = String(value || '')
        .split(/\s+/)
        .map((item) => item.trim())
        .filter((item) => SAFE_CODE_CLASS.test(item))
      if (tag === 'pre' && !classes.includes('sx-news-code')) classes.unshift('sx-news-code')
      if (classes.length) out.push(`class="${classes.join(' ')}"`)
      continue
    }
    if (name === 'contenteditable' && tag === 'figure') {
      out.push('contenteditable="false"')
      continue
    }
    if (['controls', 'playsinline', 'allowfullscreen'].includes(name)) {
      out.push(name)
      continue
    }
    if (name === 'allow' && tag === 'iframe') {
      out.push('allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"')
      continue
    }
    if (name === 'loading' && tag === 'iframe') {
      out.push('loading="lazy"')
      continue
    }
    if (name === 'preload' && tag === 'video') {
      out.push('preload="metadata"')
      continue
    }
    if ((name === 'colspan' || name === 'rowspan' || name === 'border') && !/^\d{1,4}$/.test(value)) continue
    if ((name === 'width' || name === 'height')) {
      const numeric = String(value).trim()
      if (!/^\d{1,5}(\.\d{1,20})?$/.test(numeric)) continue
      // 展示以 CSS 为准，过长小数收成整数，避免怪异属性
      out.push(`${name}="${String(Math.round(Number(numeric)))}"`)
      continue
    }
    if (name === 'style') {
      if (!keepStyles || !STYLE_TAGS.has(tag)) continue
      const style = safeInlineStyle(value, { colorOnly: keepStyles === 'color' })
      if (style) out.push(style)
      continue
    }
    out.push(`${name}="${String(value).replace(/[<>"']/g, '')}"`)
  }
  const boolRe = /(?:^|\s)([a-zA-Z:_][a-zA-Z0-9:_.-]*)(?=\s|\/|$)/g
  while ((match = boolRe.exec(raw))) {
    const name = match[1].toLowerCase()
    if (seen.has(name) || name.startsWith('on') || !allowed.has(name) || !BOOLEAN_ATTRS.has(name)) continue
    seen.add(name)
    out.push(name)
  }
  if (tag === 'video' && out.some((item) => item.startsWith('src='))) {
    if (!seen.has('controls')) out.push('controls')
    if (!seen.has('playsinline')) out.push('playsinline')
    if (!seen.has('preload')) out.push('preload="metadata"')
  }
  return out.length ? ` ${out.join(' ')}` : ''
}

/**
 * 去掉脚本与危险属性；结构标签与安全内联样式可保留。
 * options.keepColor === false → 去掉全部 style（可视化粘贴清洗）
 * 默认保留排版用内联样式（代码模式迁移稿）
 */
export function sanitizeNewsHtml(dirty, options = {}) {
  const keepStyles = options.keepColor === false ? false : true
  const source = String(dirty || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*font\b([^>]*)>/gi, keepStyles ? (_, attrs) => {
      const color = /color\s*=\s*("([^"]+)"|'([^']+)'|([^\s>]+))/i.exec(attrs)
      const value = safeColor((color?.[2] || color?.[3] || color?.[4] || '').replace(/&quot;/g, ''))
      return value ? `<span style="color:${value}">` : '<span>'
    } : '<span>')
    .replace(/<\/\s*font>/gi, '</span>')
    .slice(0, 300000)

  const parts = source.split(/(<[^>]+>)/g)
  let html = ''
  const stack = []

  for (const part of parts) {
    if (!part) continue
    if (part[0] !== '<') {
      if (part.length > 8000 && /^[A-Za-z0-9+/=\s]+$/.test(part.slice(0, 120))) continue
      html += part.replace(/</g, '&lt;')
      continue
    }
    const close = /^<\/\s*([a-zA-Z0-9]+)\s*>$/.exec(part)
    if (close) {
      const tag = close[1].toLowerCase()
      if (!ALLOWED_TAGS.has(tag) || VOID_TAGS.has(tag)) continue
      const idx = stack.lastIndexOf(tag)
      if (idx < 0) continue
      while (stack.length > idx) {
        const open = stack.pop()
        html += `</${open}>`
      }
      continue
    }
    const open = /^<\s*([a-zA-Z0-9]+)([^>]*?)(\/?)\s*>$/.exec(part)
    if (!open) continue
    const tag = open[1].toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) continue
    if (BREAK_PHRASING.has(tag)) {
      while (stack.length && (stack.at(-1) === 'p' || stack.at(-1) === 'span')) {
        html += `</${stack.pop()}>`
      }
    }
    let attrs = parseAttributes(open[2] || '', tag, keepStyles)
    if (tag === 'pre' && !/\bclass=/.test(attrs)) attrs += ' class="sx-news-code"'
    const selfClosing = VOID_TAGS.has(tag) || Boolean(open[3])
    html += `<${tag}${attrs}>`
    if (!selfClosing) stack.push(tag)
  }

  while (stack.length) html += `</${stack.pop()}>`
  return html.trim()
}

export function plainTextFromHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|h1|h2|h3|h4|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function htmlFromPlainBody(body) {
  const text = String(body || '').trim()
  if (!text) return ''
  if (/<[a-z][\s\S]*>/i.test(text)) return sanitizeNewsHtml(text)
  return text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const line = chunk.replace(/\n+/g, '')
      const heading = line.length <= 36 && !/[。！？.!?]$/.test(line) && !line.includes('\n')
      if (heading || /^[一二三四五六七八九十]+[、.．]/.test(line) || /^#+\s+/.test(chunk)) {
        return `<h3>${line.replace(/^#+\s*/, '')}</h3>`
      }
      return `<p>${chunk.replace(/\n/g, '<br>')}</p>`
    })
    .join('')
}
