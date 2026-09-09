/** 后台可视化编辑共用节点（contenteditable / 换图 / 链接） */

export function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function textNode(path, value, { editable = false, tag = 'span', className = '', multiline = false, placeholder = '' } = {}) {
  const safe = esc(value || '')
  if (!editable) {
    if (tag === 'span' && !className) return safe
    return `<${tag}${className ? ` class="${className}"` : ''}>${safe}</${tag}>`
  }
  const attrs = [
    `contenteditable="true"`,
    `data-edit-path="${esc(path)}"`,
    `spellcheck="false"`,
    multiline ? `data-edit-multiline="true"` : '',
    placeholder ? `data-placeholder="${esc(placeholder)}"` : '',
    className ? `class="${className}"` : '',
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
