const ALLOWED_TAGS = new Set([
  'p', 'br', 'div', 'span', 'h2', 'h3', 'h4',
  'strong', 'b', 'em', 'i', 'u', 'blockquote',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'td', 'th', 'caption',
  'img', 'a', 'figure', 'figcaption', 'hr',
])

const VOID_TAGS = new Set(['br', 'img', 'hr'])

const ALLOWED_ATTR = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
  table: new Set(['border']),
}

function safeUrl(value, kind) {
  const url = String(value || '').trim()
  if (!url) return ''
  if (url.startsWith('/') && !url.startsWith('//')) return url.slice(0, 1500)
  const lower = url.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('data:text') || lower.startsWith('vbscript:')) return ''
  if (kind === 'img' && lower.startsWith('data:image/')) return url.slice(0, 200000)
  try {
    const parsed = new URL(url)
    if (kind === 'a' && parsed.protocol === 'mailto:') return parsed.toString().slice(0, 1500)
    if (!['http:', 'https:'].includes(parsed.protocol)) return ''
    return parsed.toString().slice(0, 1500)
  } catch {
    return ''
  }
}

function parseAttributes(raw, tag) {
  const allowed = ALLOWED_ATTR[tag]
  if (!allowed) return ''
  const out = []
  const re = /([a-zA-Z:_][a-zA-Z0-9:_.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g
  let match
  while ((match = re.exec(raw))) {
    const name = match[1].toLowerCase()
    if (name.startsWith('on')) continue
    if (!allowed.has(name)) continue
    const value = match[3] ?? match[4] ?? match[5] ?? ''
    if (name === 'href' || name === 'src') {
      const cleaned = safeUrl(value, tag === 'img' ? 'img' : 'a')
      if (!cleaned) continue
      out.push(`${name}="${cleaned.replace(/"/g, '&quot;')}"`)
      if (name === 'href') out.push('rel="noopener noreferrer"')
      continue
    }
    if ((name === 'colspan' || name === 'rowspan' || name === 'width' || name === 'height' || name === 'border') && !/^\d{1,4}$/.test(value)) continue
    out.push(`${name}="${String(value).replace(/[<>"']/g, '')}"`)
  }
  return out.length ? ` ${out.join(' ')}` : ''
}

/** 去掉脚本和事件，只保留新闻正文需要的标签。浏览器和 Node 都能用。 */
export function sanitizeNewsHtml(dirty) {
  const source = String(dirty || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .slice(0, 300000)

  const parts = source.split(/(<[^>]+>)/g)
  let html = ''
  const stack = []

  for (const part of parts) {
    if (!part) continue
    if (part[0] !== '<') {
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
    const attrs = parseAttributes(open[2] || '', tag)
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
