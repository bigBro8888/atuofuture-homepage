import { htmlFromPlainBody, sanitizeNewsHtml } from '../lib/sanitize-news-html.js'
import { newsVideoMarkup } from '../lib/news-video.js'

function isLocalMedia(src) {
  return src.startsWith('/api/public/uploads/') || src.startsWith('/images/') || src.startsWith('/assets/')
}

function normalizeImgSrc(src) {
  let value = String(src || '').trim().replace(/&amp;/g, '&')
  if (value.startsWith('//')) value = `https:${value}`
  return value
}

function escapeTextarea(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function newsRichEditorMarkup(item = {}) {
  const html = sanitizeNewsHtml(item.bodyHtml || htmlFromPlainBody(item.body || ''))
  return `
    <div class="admin-form-wide">
      <span class="admin-rich__label">主题正文</span>
      <div class="admin-rich" data-news-rich>
        <div class="admin-rich__bar" data-news-rich-bar>
          <button type="button" tabindex="-1" data-rich-cmd="h3">标题</button>
          <button type="button" tabindex="-1" data-rich-cmd="p">正文</button>
          <button type="button" tabindex="-1" data-rich-cmd="insertUnorderedList">项目</button>
          <button type="button" tabindex="-1" data-rich-cmd="insertOrderedList">编号</button>
          <button type="button" tabindex="-1" data-rich-cmd="link">链接</button>
          <button type="button" tabindex="-1" data-rich-cmd="table">表格</button>
          <button type="button" tabindex="-1" data-rich-cmd="image">插图</button>
          <button type="button" tabindex="-1" data-rich-cmd="video">视频</button>
          <label class="admin-rich__color">颜色<input type="color" value="#333333" data-rich-color /></label>
          <button type="button" tabindex="-1" data-rich-cmd="removeFormat">清除格式</button>
          <button type="button" tabindex="-1" data-rich-cmd="codeMode" data-rich-code-toggle title="粘贴 HTML / 源码，前台解析展示">代码</button>
        </div>
        <div class="admin-rich__editor" contenteditable="true" data-news-html-editor role="textbox" aria-multiline="true" aria-label="新闻正文">${html}</div>
        <textarea class="admin-rich__code" hidden data-news-html-code spellcheck="false" aria-label="新闻正文源码">${escapeTextarea(html)}</textarea>
        <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif,image/*" data-news-rich-file />
        <input type="file" hidden accept="video/mp4,video/webm,video/quicktime,video/*" data-news-rich-video />
        <small data-news-rich-hint>粘贴会去掉原网站的加粗、颜色和字号。插图建议宽度不少于 1200px，视频可上传或粘贴链接。点「代码」可粘贴 HTML 源码，发布后前台解析展示。</small>
      </div>
    </div>`
}

function newsRichRoot(scope) {
  if (!scope) return null
  if (scope.matches?.('[data-news-rich]')) return scope
  return scope.querySelector?.('[data-news-rich]') || null
}

function isNewsCodeMode(scope) {
  return newsRichRoot(scope)?.dataset.codeMode === '1'
}

function syncNewsCodeToEditor(scope) {
  const root = newsRichRoot(scope) || scope
  const editor = root.querySelector('[data-news-html-editor]')
  const code = root.querySelector('[data-news-html-code]')
  if (!editor || !code) return
  const raw = String(code.value || '').trim()
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(raw)
  editor.innerHTML = looksLikeHtml
    ? sanitizeNewsHtml(raw)
    : (raw ? `<pre class="sx-news-code"><code>${escapeTextarea(raw)}</code></pre>` : '')
}

export function readNewsRichContent(modal = document) {
  const root = newsRichRoot(modal) || modal
  if (isNewsCodeMode(root)) syncNewsCodeToEditor(root)
  const editor = root.querySelector('[data-news-html-editor]')
  const html = sanitizeNewsHtml(editor?.innerHTML || '')
  const text = (editor?.innerText || '').replace(/\u00a0/g, ' ').trim()
  return { bodyHtml: html, body: text }
}

function saveEditorRange(editor) {
  const selection = window.getSelection()
  if (!selection?.rangeCount) return null
  const range = selection.getRangeAt(0)
  if (!editor.contains(range.commonAncestorContainer)) return null
  return range.cloneRange()
}

function restoreEditorRange(editor, range) {
  editor.focus()
  const selection = window.getSelection()
  if (!selection) return
  selection.removeAllRanges()
  if (range) selection.addRange(range)
}

function dropCaretMarker(editor) {
  editor.querySelectorAll('[data-caret-marker]').forEach((node) => node.remove())
  const marker = document.createElement('span')
  marker.setAttribute('data-caret-marker', '1')
  try {
    const range = saveEditorRange(editor)
    if (range) {
      range.collapse(true)
      range.insertNode(marker)
      return
    }
  } catch {
    /* 选区失效时插到末尾 */
  }
  editor.appendChild(marker)
}

function takeCaretMarker(editor) {
  return editor.querySelector('[data-caret-marker]')
}

function insertNodesAtMarker(editor, nodes) {
  const marker = takeCaretMarker(editor)
  if (marker) marker.replaceWith(...nodes)
  else nodes.forEach((node) => editor.appendChild(node))
}

function createVideoNodes(url) {
  const temp = document.createElement('div')
  temp.innerHTML = newsVideoMarkup(url)
  return [...temp.childNodes]
}

async function uploadVideoFile(file, api) {
  const formData = new FormData()
  formData.append('video', file)
  const { url } = await api('/pages/media/video', { method: 'POST', body: formData })
  return url
}

function createImageBlock(url) {
  const figure = document.createElement('figure')
  figure.setAttribute('contenteditable', 'false')
  const image = document.createElement('img')
  image.src = url
  image.alt = ''
  figure.appendChild(image)
  const spacer = document.createElement('p')
  spacer.appendChild(document.createElement('br'))
  return [figure, spacer]
}

function insertHtmlAtCaret(editor, html, range) {
  const temp = document.createElement('div')
  temp.innerHTML = html
  const nodes = [...temp.childNodes]
  if (!nodes.length) return
  try {
    editor.focus()
    const selection = window.getSelection()
    if (range && selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
    const current = selection?.rangeCount ? selection.getRangeAt(0) : null
    if (current && editor.contains(current.commonAncestorContainer)) {
      current.deleteContents()
      const fragment = document.createDocumentFragment()
      nodes.forEach((node) => fragment.appendChild(node))
      current.insertNode(fragment)
      return
    }
  } catch {
    /* 落到编辑器末尾 */
  }
  nodes.forEach((node) => editor.appendChild(node))
}

async function uploadImageFile(file, api) {
  const type = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg'
  const named = new File([file], file.name || 'image.jpg', { type })
  const formData = new FormData()
  formData.append('image', named)
  const { url } = await api('/pages/media/image', { method: 'POST', body: formData })
  return url
}

async function importRemoteImage(src, api) {
  const { url } = await api('/pages/media/image-from-url', {
    method: 'POST',
    body: JSON.stringify({ url: src }),
  })
  return url
}

async function uploadFromSrc(src, api) {
  const normalized = normalizeImgSrc(src)
  if (normalized.startsWith('data:image/') || normalized.startsWith('blob:')) {
    const response = await fetch(normalized)
    const blob = await response.blob()
    return uploadImageFile(new File([blob], 'paste.png', { type: blob.type || 'image/png' }), api)
  }
  try {
    return await importRemoteImage(normalized, api)
  } catch (serverError) {
    try {
      const response = await fetch(normalized, { mode: 'cors' })
      if (!response.ok) throw serverError
      const blob = await response.blob()
      if (!blob.type.startsWith('image/') && blob.size < 32) throw serverError
      return await uploadImageFile(new File([blob], 'remote.jpg', { type: blob.type || 'image/jpeg' }), api)
    } catch {
      throw serverError
    }
  }
}

async function ingestEditorImages(editor, api, toast) {
  const images = [...editor.querySelectorAll('img')]
  let failed = 0
  for (const image of images) {
    const src = normalizeImgSrc(image.getAttribute('src') || '')
    if (!src || isLocalMedia(src)) continue
    try {
      image.src = await uploadFromSrc(src, api)
    } catch {
      failed += 1
      image.alt = image.alt || '图片转存失败，请点插图重新上传'
    }
  }
  if (failed) toast?.(`有 ${failed} 张外站图片未能转存，请用「插图」从本地上传`, true)
}

export async function ingestEditorVideos(modal, { api, toast }) {
  const editor = modal.querySelector('[data-news-html-editor]')
  if (!editor) return
  const media = [...editor.querySelectorAll('video, source')]
  for (const node of media) {
    const src = String(node.getAttribute('src') || '').trim()
    if (!src || isLocalMedia(src) || src.startsWith('http://') || src.startsWith('https://')) continue
    if (!src.startsWith('blob:') && !src.startsWith('data:video')) continue
    toast?.('正在上传正文中的视频…')
    const response = await fetch(src)
    const blob = await response.blob()
    if (blob.size > 200 * 1024 * 1024) throw new Error('正文视频超过 200MB，请压缩后再上传')
    const file = new File([blob], 'inline.mp4', { type: blob.type || 'video/mp4' })
    const url = await uploadVideoFile(file, api)
    node.setAttribute('src', url)
    if (node.tagName === 'VIDEO') node.src = url
  }
}

export function bindNewsRichEditor(modal, { api, toast }) {
  const rich = modal.querySelector('[data-news-rich]')
  const editor = modal.querySelector('[data-news-html-editor]')
  const codeInput = modal.querySelector('[data-news-html-code]')
  const hint = modal.querySelector('[data-news-rich-hint]')
  const codeToggle = modal.querySelector('[data-rich-code-toggle]')
  const fileInput = modal.querySelector('[data-news-rich-file]')
  const videoInput = modal.querySelector('[data-news-rich-video]')
  if (!editor || !rich) return
  let savedRange = null
  const rememberRange = () => {
    savedRange = saveEditorRange(editor) || savedRange
  }

  const setCodeMode = (enabled) => {
    if (enabled) {
      codeInput.value = editor.innerHTML
      editor.hidden = true
      codeInput.hidden = false
      rich.dataset.codeMode = '1'
      codeToggle?.classList.add('is-active')
      if (hint) {
        hint.textContent = '代码模式：直接粘贴 HTML / 源码。再点「代码」返回可视化编辑；发布时会自动消毒并在前台解析展示。'
      }
      codeInput.focus()
      return
    }
    syncNewsCodeToEditor(rich)
    codeInput.hidden = true
    editor.hidden = false
    delete rich.dataset.codeMode
    codeToggle?.classList.remove('is-active')
    if (hint) {
      hint.textContent = '粘贴会去掉原网站的加粗、颜色和字号。插图建议宽度不少于 1200px，视频可上传或粘贴链接。点「代码」可粘贴 HTML 源码，发布后前台解析展示。'
    }
    editor.focus()
    toast?.('源码已解析到正文')
  }

  editor.addEventListener('mouseup', rememberRange)
  editor.addEventListener('keyup', rememberRange)
  editor.addEventListener('focus', rememberRange)

  modal.querySelector('[data-rich-color]')?.addEventListener('mousedown', rememberRange)
  modal.querySelector('[data-rich-color]')?.addEventListener('input', (event) => {
    if (isNewsCodeMode(rich)) return
    restoreEditorRange(editor, savedRange)
    document.execCommand('foreColor', false, event.currentTarget.value)
    rememberRange()
  })

  modal.querySelector('[data-news-rich-bar]')?.addEventListener('mousedown', (event) => {
    const button = event.target.closest('[data-rich-cmd]')
    if (!button) return
    event.preventDefault()
    const command = button.dataset.richCmd
    if (command === 'codeMode') {
      setCodeMode(!isNewsCodeMode(rich))
      return
    }
    if (isNewsCodeMode(rich)) {
      toast?.('请先退出代码模式，再使用格式工具', true)
      return
    }
    rememberRange()
    restoreEditorRange(editor, savedRange)
    if (command === 'h3') document.execCommand('formatBlock', false, 'h3')
    else if (command === 'p') document.execCommand('formatBlock', false, 'p')
    else if (command === 'link') {
      const href = window.prompt('请输入链接地址', 'https://')
      if (href) document.execCommand('createLink', false, href)
    } else if (command === 'table') {
      insertHtmlAtCaret(editor, '<table><thead><tr><th>列 1</th><th>列 2</th><th>列 3</th></tr></thead><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table><p></p>', savedRange)
    } else if (command === 'image') {
      dropCaretMarker(editor)
      fileInput?.click()
    } else if (command === 'video') {
      dropCaretMarker(editor)
      const url = window.prompt('粘贴视频链接（B站 / YouTube / MP4 直链）。留空则上传本地视频', 'https://')
      if (url === null) {
        takeCaretMarker(editor)?.remove()
        return
      }
      const trimmed = url.trim()
      if (trimmed && trimmed !== 'https://') {
        const nodes = createVideoNodes(trimmed)
        if (!nodes.length) {
          takeCaretMarker(editor)?.remove()
          toast('无法识别该视频链接', true)
          return
        }
        insertNodesAtMarker(editor, nodes)
        editor.innerHTML = sanitizeNewsHtml(editor.innerHTML)
        editor.focus()
        toast('视频已插入')
        return
      }
      videoInput?.click()
    } else if (command === 'removeFormat') {
      document.execCommand('removeFormat', false, null)
      editor.innerHTML = sanitizeNewsHtml(editor.innerHTML, { keepColor: false })
    } else {
      document.execCommand(command, false, null)
    }
  })

  editor.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return
    event.stopPropagation()
  })

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files?.[0]
    fileInput.value = ''
    if (!file) {
      takeCaretMarker(editor)?.remove()
      return
    }
    try {
      toast('正在上传图片…')
      const url = await uploadImageFile(file, api)
      insertNodesAtMarker(editor, createImageBlock(url))
      editor.focus()
      toast('图片已插入')
    } catch (error) {
      takeCaretMarker(editor)?.remove()
      toast(error.message || '图片上传失败', true)
    }
  })

  videoInput?.addEventListener('change', async () => {
    const file = videoInput.files?.[0]
    videoInput.value = ''
    if (!file) {
      takeCaretMarker(editor)?.remove()
      return
    }
    try {
      toast('正在上传视频…')
      const url = await uploadVideoFile(file, api)
      insertNodesAtMarker(editor, createVideoNodes(url))
      editor.innerHTML = sanitizeNewsHtml(editor.innerHTML)
      editor.focus()
      toast('视频已插入')
    } catch (error) {
      takeCaretMarker(editor)?.remove()
      toast(error.message || '视频上传失败', true)
    }
  })

  editor.addEventListener('paste', async (event) => {
    const html = event.clipboardData?.getData('text/html')
    const text = event.clipboardData?.getData('text/plain')
    const items = [...(event.clipboardData?.items || [])]
    const imageItem = items.find((item) => item.type.startsWith('image/'))
    const file = imageItem ? imageItem.getAsFile() : [...(event.clipboardData?.files || [])].find((item) => item.type.startsWith('image/'))
    event.preventDefault()
    rememberRange()
    if (file) {
      try {
        toast('正在上传图片…')
        const url = await uploadImageFile(file, api)
        dropCaretMarker(editor)
        insertNodesAtMarker(editor, createImageBlock(url))
        toast('图片已插入')
      } catch (error) {
        toast(error.message || '图片上传失败', true)
      }
      return
    }
    if (html) {
      // 微站迁移稿（带 section / 大量 style）保留排版；普通网页粘贴仍清洗字号颜色
      const migrateHtml = /<section\b/i.test(html) || /border-top\s*:/i.test(html) || /text-indent\s*:/i.test(html)
      insertHtmlAtCaret(editor, sanitizeNewsHtml(html, { keepColor: migrateHtml }), savedRange)
    } else if (text) document.execCommand('insertText', false, text)
    const remoteCount = [...editor.querySelectorAll('img')].filter((image) => {
      const src = normalizeImgSrc(image.getAttribute('src') || '')
      return src && !isLocalMedia(src)
    }).length
    if (!remoteCount) return
    toast('正在转存粘贴内容中的图片…')
    await ingestEditorImages(editor, api, toast)
    toast('正文已粘贴')
  })
}
