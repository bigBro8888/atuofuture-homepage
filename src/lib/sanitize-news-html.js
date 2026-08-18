import { resolveNewsVideo } from './news-video.js'

const ALLOWED_TAGS = new Set([
  'p', 'br', 'div', 'span', 'h2', 'h3', 'h4',
  'blockquote',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'td', 'th', 'caption',
  'img', 'a', 'figure', 'figcaption', 'hr', 'video', 'iframe',
])

const VOID_TAGS = new Set(['br', 'img', 'hr'])
const BREAK_PHRASING = new Set(['figure', 'table', 'ul', 'ol', 'blockquote', 'div', 'h2', 'h3', 'h4', 'video', 'iframe'])
const BOOLEAN_ATTRS = new Set(['controls', 'playsinline', 'allowfullscreen'])

const ALLOWED_ATTR = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
  table: new Set(['border']),
  span: new Set(['style']),
  figure: new Set(['class', 'contenteditable']),
  video: new Set(['src', 'controls', 'playsinline', 'preload', 'poster']),
  iframe: new Set(['src', 'title', 'allow', 'allowfullscreen', 'loading']),
}

function safeColor(value) {
  const text = String(value || '').trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text)) return text.toLowerCase()
  const rgb = text.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
  if (rgb && [...rgb.slice(1)].every((part) => Number(part) <= 255)) return `rgb(${rgb[1]}, ${rgb[2]}, ${rgb[3]})`
  return ''
}

function colorStyleFrom(value) {
  const match = String(value || '').match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)
  const color = safeColor(match?.[1] || '')
  return color ? `style="color:${color}"` : ''
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

function parseAttributes(raw, tag, keepColor = true) {
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
    if ((name === 'colspan' || name === 'rowspan' || name === 'width' || name === 'height' || name === 'border') && !/^\d{1,4}$/.test(value)) continue
    if (name === 'style') {
      if (!keepColor) continue
      const style = colorStyleFrom(value)
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

/** 去掉脚本、加粗斜体和字号，只保留结构；编辑器里设过的颜色可选择保留。 */
export function sanitizeNewsHtml(dirty, options = {}) {
  const keepColor = options.keepColor !== false
  const source = String(dirty || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*h1\b/gi, '<h3')
    .replace(/<\/\s*h1>/gi, '</h3>')
    .replace(/<\s*font\b([^>]*)>/gi, keepColor ? (_, attrs) => {
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
    const attrs = parseAttributes(open[2] || '', tag, keepColor)
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
    .replace(/<\/(p|div|h2|h3|h4|li|tr)>/gi, '\n')
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
