/** 把粘贴的纯文本拆成标题 + 段落，便于前台排版。 */
export function formatNewsBody(body) {
  const chunks = String(body || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)

  const sections = []
  let current = null

  const isHeading = (text) => {
    if (text.includes('\n')) return false
    const line = text.replace(/^#+\s*/, '').trim()
    if (!line) return false
    if (/^[一二三四五六七八九十]+[、.．]/.test(line)) return true
    if (/^\d+[、.．]/.test(line) && line.length < 48) return true
    if (line.length <= 36 && !/[。！？.!?]$/.test(line)) return true
    return Boolean(text.match(/^#+\s+/))
  }

  for (const chunk of chunks) {
    if (isHeading(chunk)) {
      current = { heading: chunk.replace(/^#+\s*/, '').trim(), paragraphs: [] }
      sections.push(current)
      continue
    }
    if (!current) {
      current = { heading: '', paragraphs: [] }
      sections.push(current)
    }
    current.paragraphs.push(chunk.replace(/\n+/g, ''))
  }

  return sections
    .filter((section) => section.heading || section.paragraphs.length)
    .map((section, index) => ({
      heading: section.heading,
      paragraphs: section.paragraphs,
      ...(index === 0 ? { showCover: true } : {}),
    }))
}

export function hydrateNewsItem(item) {
  if (!item) return null
  const sections = Array.isArray(item.sections) && item.sections.length
    ? item.sections
    : formatNewsBody(item.body)
  return { ...item, sections }
}
