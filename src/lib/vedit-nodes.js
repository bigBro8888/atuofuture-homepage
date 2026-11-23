/** 后台可视化编辑共用节点（contenteditable / 换图 / 链接） */

export function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 跳转链接字段：Edge/Chrome 粘贴网址时常变成「页面标题」富文本链接 */
export function isUrlEditPath(path = '') {
  return /(^|\.)(href|linkUrl|moreUrl|actionHref|ctaUrl|bottomUrl|applyHref|solutionHref|url)$/i.test(String(path || ''))
}

export function isUrlEditField(el) {
  if (!el) return false
  if (el.dataset?.editPlain === 'url') return true
  if (el.classList?.contains('admin-home-href')) return true
  return isUrlEditPath(el.dataset?.editPath || '')
}

/** 从剪贴板 HTML 取出真实 href（优先于可见标题文案） */
export function extractHrefFromClipboardHtml(html = '') {
  const match = String(html || '').match(/<a[^>]+href\s*=\s*["']([^"']+)["']/i)
  if (!match?.[1]) return ''
  const href = match[1].trim()
  if (!href || href === '#' || href.toLowerCase().startsWith('javascript:')) return ''
  try {
    return href.replace(/&amp;/g, '&')
  } catch {
    return href
  }
}

export function readEditableText(el) {
  if (!el) return ''
  if (isUrlEditField(el)) {
    const anchor = el.querySelector?.('a[href]')
    const href = String(anchor?.getAttribute('href') || '').trim()
    if (href && href !== '#') return href.replace(/\u00a0/g, ' ').trim()
  }
  return (el.innerText || '').replace(/\u00a0/g, ' ').trim()
}

/** 链接字段粘贴：强制纯文本；若浏览器给的是「标题」富链接则改用 href */
export function bindUrlFieldPlainPaste(root) {
  if (!root || root.dataset.urlPlainPasteBound === '1') return
  root.dataset.urlPlainPasteBound = '1'
  root.addEventListener('paste', (event) => {
    const target = event.target?.closest?.('[contenteditable="true"]')
    if (!target || !root.contains(target) || !isUrlEditField(target)) return
    event.preventDefault()
    const html = event.clipboardData?.getData('text/html') || ''
    const plain = (event.clipboardData?.getData('text/plain') || '').replace(/\u00a0/g, ' ').trim()
    const fromHtml = extractHrefFromClipboardHtml(html)
    const looksLikeUrl = /^(https?:\/\/|\/|#|\.\/|\.\.\/|[a-z0-9.-]+\.[a-z]{2,})/i.test(plain)
    // Edge 常把网址粘成「页面标题」；有富链接时优先用真实 href
    const value = fromHtml && (!looksLikeUrl || /[\u4e00-\u9fff]/.test(plain))
      ? fromHtml
      : (fromHtml || plain)
    target.textContent = value
  })
}

export function textNode(path, value, { editable = false, tag = 'span', className = '', multiline = false, placeholder = '', title = '' } = {}) {
  const safe = esc(value || '')
  const titleAttr = title ? ` title="${esc(title)}"` : ''
  if (!editable) {
    if (tag === 'span' && !className && !title) return safe
    return `<${tag}${className ? ` class="${className}"` : ''}${titleAttr}>${safe}</${tag}>`
  }
  const plainUrl = className.includes('admin-home-href') || isUrlEditPath(path)
  const attrs = [
    `contenteditable="true"`,
    `data-edit-path="${esc(path)}"`,
    `spellcheck="false"`,
    plainUrl ? `data-edit-plain="url"` : '',
    multiline ? `data-edit-multiline="true"` : '',
    placeholder ? `data-placeholder="${esc(placeholder)}"` : '',
    className ? `class="${className}"` : '',
    title ? `title="${esc(title)}"` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const body = safe || (placeholder ? '' : '&nbsp;')
  return `<${tag} ${attrs}>${body}</${tag}>`
}

export function imgNode(path, src, { editable = false, width, height, alt = '', loading = '', className = '' } = {}) {
  const url = String(src || '').trim()
  if (!url && !editable) return ''
  if (!url && editable) {
    return `<button type="button" class="hpi-edit-img hpi-edit-img--empty${className ? ` ${className}` : ''}" data-edit-image="${esc(path)}" data-edit-image-url="" title="点击添加图片"><span class="hpi-edit-img__tip is-visible">添加图片</span></button>`
  }
  const img = `<img src="${esc(url)}" alt="${esc(alt)}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}${loading ? ` loading="${loading}"` : ''} />`
  if (!editable) return img
  return `<button type="button" class="hpi-edit-img${className ? ` ${className}` : ''}" data-edit-image="${esc(path)}" data-edit-image-url="${esc(url)}" title="点击更换图片">${img}<span class="hpi-edit-img__tip">更换图片</span></button>`
}

export function linkNode({ className = '', href = '', label = '', labelPath, hrefPath, editable = false, arrow = true } = {}) {
  const safeHref = esc(href || '#')
  const safeLabel = esc(label || '')
  if (!editable) {
    return `<a class="${className}" href="${safeHref}">${safeLabel}${arrow ? ' →' : ''}</a>`
  }
  return `<button type="button" class="${className} hpi-edit-link" data-edit-link data-edit-label-path="${esc(labelPath)}" data-edit-href-path="${esc(hrefPath)}" data-edit-href="${safeHref}" title="点击设置文案与跳转"><span data-edit-link-label>${safeLabel || '链接文案'}</span>${arrow ? ' →' : ''}</button>`
}
