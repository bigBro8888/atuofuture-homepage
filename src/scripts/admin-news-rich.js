import { adaptImportedArticleHtml, htmlFromPlainBody, sanitizeNewsHtml } from '../lib/sanitize-news-html.js'
import { newsVideoMarkup } from '../lib/news-video.js'

function isLocalMedia(src) {
  return src.startsWith('/api/public/uploads/') || src.startsWith('/images/') || src.startsWith('/assets/')
}

/** 已落本站或 OSS 的图，不再二次转存 */
function isStoredMedia(src) {
  const value = normalizeImgSrc(src)
  if (!value) return false
  if (isLocalMedia(value)) return true
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    // 当前官网桶：atuofuture.oss-cn-shanghai.aliyuncs.com/website/...
    if (url.hostname === 'atuofuture.oss-cn-shanghai.aliyuncs.com') return true
    if (url.hostname.endsWith('.aliyuncs.com') && /\/website\//.test(url.pathname)) return true
  } catch {
    return false
  }
  return false
}

function normalizeImgSrc(src) {
  let value = String(src || '').trim().replace(/&amp;/g, '&')
  if (value.startsWith('//')) value = `https:${value}`
  return value
}

/** 微信等站点真实地址常在 data-src，src 是占位 SVG / 空 */
function promoteImgDataSrc(html) {
  return String(html || '').replace(/<img\b([^>]*?)\/?>/gi, (full, attrs) => {
    const pick = (...names) => {
      for (const name of names) {
        const match = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(attrs)
        const value = match?.[2] ?? match?.[3] ?? match?.[4] ?? ''
        const url = normalizeImgSrc(value)
        if (url && !url.startsWith('data:') && !url.startsWith('blob:')) return url
      }
      return ''
    }
    const lazy = pick('data-src', 'data-original', 'data-lazy-src', 'data-actualsrc')
    const src = pick('src')
    if (!lazy) return full
    if (src && src === lazy) return full
    let next = String(attrs || '').replace(/\s*(?:data-src|data-original|data-lazy-src|data-actualsrc|src)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi, '')
    next = ` src="${lazy.replace(/"/g, '&quot;')}"${next}`
    return `<img${next}>`
  })
}

function promoteEditorLazyImages(root) {
  root?.querySelectorAll?.('img').forEach((image) => {
    const lazy =
      normalizeImgSrc(image.getAttribute('data-src') || '') ||
      normalizeImgSrc(image.getAttribute('data-original') || '') ||
      normalizeImgSrc(image.getAttribute('data-lazy-src') || '')
    const src = normalizeImgSrc(image.getAttribute('src') || '')
    if (!lazy) return
    if (!src || src.startsWith('data:') || src.startsWith('blob:') || /svg\+xml/i.test(src)) {
      image.setAttribute('src', lazy)
    }
  })
}

/** 预览里不直接加载微信图（会显示「未经允许不可引用」），真实地址留给服务端转存 */
function maskWeixinImagesForPreview(html) {
  const temp = document.createElement('div')
  temp.innerHTML = sanitizeNewsHtml(promoteImgDataSrc(html), { keepColor: true })
  promoteEditorLazyImages(temp)
  let index = 0
  temp.querySelectorAll('img').forEach((image) => {
    const src = normalizeImgSrc(image.getAttribute('src') || image.getAttribute('data-src') || '')
    index += 1
    if (src) image.setAttribute('data-import-src', src)
    image.removeAttribute('src')
    image.removeAttribute('data-src')
    image.removeAttribute('data-original')
    image.alt = `图片 ${index}（预览被微信防盗链拦截属正常，点「解析粘贴内容」后会转存到本站）`
    image.classList.add('admin-news-import__img-ph')
  })
  return temp.innerHTML
}

function escapeTextarea(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function newsRichEditorMarkup(item = {}) {
  const html = adaptImportedArticleHtml(item.bodyHtml || htmlFromPlainBody(item.body || ''))
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
        <small data-news-rich-hint>粘贴会去掉原网站的加粗、颜色和字号。插图建议宽度不少于 1200px。右上角「链接解析」可抓取公众号等文章并转存图片；点「代码」可粘贴 HTML 源码。</small>
        <div class="admin-link-modal admin-news-import-modal" data-news-import-modal hidden>
          <div class="admin-link-modal__backdrop" data-news-import-close></div>
          <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-news-import-title">
            <header>
              <h3 id="admin-news-import-title">链接解析</h3>
              <button type="button" data-news-import-close aria-label="关闭">×</button>
            </header>
            <div class="admin-link-modal__body">
              <p class="admin-news-import__lead">粘贴文章链接后点「开始解析」。普通网页可直接抓取；微信公众号常会拦截服务器 IP，这时请用下方「打开原文 → 复制 → 从剪贴板导入」。</p>
              <label class="admin-news-field is-wide">
                <span>文章链接</span>
                <input type="url" data-news-import-url placeholder="https://mp.weixin.qq.com/s/…" autocomplete="off" />
              </label>
              <div class="admin-news-import__assist" data-news-import-assist hidden>
                <p><b>微信文章请按这三步：</b></p>
                <ol>
                  <li>点「打开原文」</li>
                  <li>在原文里用鼠标选中正文（或 Ctrl+A），再 Ctrl+C</li>
                  <li>回到此框 Ctrl+V 粘贴，再点「解析粘贴内容」</li>
                </ol>
                <div class="admin-news-field is-wide" style="margin-top:10px">
                  <span>粘贴原文（推荐，可带图片）</span>
                  <div
                    class="admin-news-import__paste"
                    contenteditable="true"
                    data-news-import-paste
                    role="textbox"
                    aria-multiline="true"
                    data-placeholder="在原文复制后，回到这里 Ctrl+V 粘贴全文（不要粘到正文编辑器）"
                  ></div>
                  <small>必须粘到这个黄框里。预览出现「未经允许不可引用」是微信防盗链，属正常；点「解析粘贴内容」会把图转存到本站。</small>
                </div>
              </div>
              <p class="admin-news-import__hint" data-news-import-hint>非微信链接一般可直接解析。微信若提示环境验证，不是链接坏了，是机房 IP 被风控。</p>
              <p class="admin-news-import__status" data-news-import-status hidden></p>
            </div>
            <footer>
              <button type="button" data-news-import-close>取消</button>
              <button type="button" data-news-import-open hidden>打开原文</button>
              <button type="button" data-news-import-clipboard hidden>解析粘贴内容</button>
              <button type="button" class="admin-link-modal__ok" data-news-import-run>开始解析</button>
            </footer>
          </div>
        </div>
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
  const html = adaptImportedArticleHtml(editor?.innerHTML || '')
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
  const { uploadAdminImage } = await import('../lib/admin-image-upload.js')
  return uploadAdminImage(api, named, 'news')
}

async function importRemoteImage(src, api) {
  const { url } = await api('/pages/media/image-from-url', {
    method: 'POST',
    body: JSON.stringify({ url: src, folder: 'news' }),
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

export async function ensureRemoteImageOnOss(src, api) {
  const normalized = normalizeImgSrc(src)
  if (!normalized || isStoredMedia(normalized)) return normalized
  return uploadFromSrc(normalized, api)
}

export async function ingestEditorImages(editorOrRoot, api, toast) {
  const editor =
    editorOrRoot?.matches?.('[data-news-html-editor]')
      ? editorOrRoot
      : editorOrRoot?.querySelector?.('[data-news-html-editor]')
  if (!editor) return { failed: 0, uploaded: 0 }
  promoteEditorLazyImages(editor)
  const images = [...editor.querySelectorAll('img')]
  let failed = 0
  let uploaded = 0
  for (const image of images) {
    const src = normalizeImgSrc(image.getAttribute('src') || '')
    if (!src || isStoredMedia(src)) continue
    try {
      image.src = await uploadFromSrc(src, api)
      uploaded += 1
    } catch {
      failed += 1
      image.alt = image.alt || '图片转存失败，请点插图重新上传'
    }
  }
  if (failed) toast?.(`有 ${failed} 张外站图片未能转存，请用「插图」从本地上传`, true)
  return { failed, uploaded }
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

function setNewsFieldValue(scope, name, value) {
  if (value == null || value === '') return
  const field = scope.querySelector(`[data-news-field="${name}"]`)
  if (!field) return
  field.value = value
  if (name === 'cover') {
    const preview = scope.querySelector(`[data-news-preview-for="${name}"]`)
    if (preview) {
      preview.src = value
      preview.hidden = !value
    }
  }
}

function applyImportedArticle(scope, result, { replaceBody }) {
  if (!result) return
  const titleField = scope.querySelector('[data-news-field="title"]')
  const shouldFillTitle = !String(titleField?.value || '').trim() || replaceBody
  if (shouldFillTitle && result.title) setNewsFieldValue(scope, 'title', result.title)
  if (result.summary) {
    const summaryField = scope.querySelector('[data-news-field="summary"]')
    if (!String(summaryField?.value || '').trim() || replaceBody) {
      setNewsFieldValue(scope, 'summary', result.summary)
    }
  }
  if (result.author) {
    const authorField = scope.querySelector('[data-news-field="author"]')
    if (!String(authorField?.value || '').trim() || replaceBody) {
      setNewsFieldValue(scope, 'author', result.author)
    }
  }
  if (result.date) setNewsFieldValue(scope, 'date', result.date)
  if (result.cover) {
    const coverField = scope.querySelector('[data-news-field="cover"]')
    if (!String(coverField?.value || '').trim() || replaceBody) {
      setNewsFieldValue(scope, 'cover', result.cover)
    }
  }
  const editor = scope.querySelector('[data-news-html-editor]')
  const codeInput = scope.querySelector('[data-news-html-code]')
  const rich = scope.querySelector('[data-news-rich]')
  if (!editor || !result.bodyHtml) return
  const nextHtml = adaptImportedArticleHtml(result.bodyHtml, { keepColor: true })
  if (replaceBody || !String(editor.innerText || '').trim()) {
    editor.innerHTML = nextHtml
  } else {
    editor.insertAdjacentHTML('beforeend', nextHtml)
  }
  if (codeInput) codeInput.value = editor.innerHTML
  if (rich?.dataset.codeMode === '1') {
    codeInput.value = editor.innerHTML
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
  const importModal = modal.querySelector('[data-news-import-modal]')
  const importUrlInput = modal.querySelector('[data-news-import-url]')
  const importStatus = modal.querySelector('[data-news-import-status]')
  const importAssist = modal.querySelector('[data-news-import-assist]')
  const importPaste = modal.querySelector('[data-news-import-paste]')
  const importRun = modal.querySelector('[data-news-import-run]')
  const importOpen = modal.querySelector('[data-news-import-open]')
  const importClipboard = modal.querySelector('[data-news-import-clipboard]')
  if (!editor || !rich) return
  let savedRange = null
  let importPasteHtml = ''
  const rememberRange = () => {
    savedRange = saveEditorRange(editor) || savedRange
  }

  const isWeixinUrl = (value) => {
    try {
      return /(^|\.)mp\.weixin\.qq\.com$/i.test(new URL(String(value || '').trim()).hostname)
    } catch {
      return /mp\.weixin\.qq\.com/i.test(String(value || ''))
    }
  }

  const showWeixinAssist = (show, message = '') => {
    if (importAssist) importAssist.hidden = !show
    if (importOpen) importOpen.hidden = !show
    if (importClipboard) importClipboard.hidden = !show
    if (importStatus) {
      importStatus.hidden = !message
      importStatus.textContent = message || ''
    }
  }

  const setImportOpen = (open) => {
    if (!importModal) return
    importModal.hidden = !open
    if (open) {
      showWeixinAssist(isWeixinUrl(importUrlInput?.value), '')
      importPasteHtml = ''
      if (importPaste) importPaste.innerHTML = ''
      importUrlInput?.focus()
      importUrlInput?.select?.()
    }
  }

  const confirmReplaceBody = () => {
    const hasBody = Boolean(String(editor.innerText || '').trim())
    const replaceBody = !hasBody || window.confirm('当前正文已有内容。确定用解析结果覆盖正文，并尽量补全标题/封面/简介吗？')
    return hasBody && !replaceBody ? null : true
  }

  const finishImport = (result) => {
    applyImportedArticle(modal, result, { replaceBody: true })
    setImportOpen(false)
    const warnText = Array.isArray(result.warnings) && result.warnings.length
      ? `（${result.warnings.length} 处图片未转存成功）`
      : ''
    toast?.(`已导入「${result.title || '文章'}」，转存 ${result.imageCount || 0} 张图片${warnText}`)
    editor.focus()
  }

  function normalizePastedArticle(raw) {
    const value = String(raw || '').trim()
    if (!value) return ''
    if (/^https?:\/\/\S+$/i.test(value) || /^https?:\/\/mp\.weixin\.qq\.com\/s\S*$/i.test(value)) {
      throw new Error('你粘贴的好像只是链接。请打开原文，选中文章正文再复制，粘贴到下方文本框。')
    }
    if (/<[a-z][\s\S]*>/i.test(value)) return value
    // 纯文本：按空行拆成段落，便于服务端识别
    return value
      .split(/\n{2,}/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => `<p>${chunk.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`)
      .join('')
  }

  async function readClipboardHtml() {
    try {
      if (navigator.clipboard?.read) {
        const items = await navigator.clipboard.read()
        for (const item of items) {
          if (item.types.includes('text/html')) {
            const blob = await item.getType('text/html')
            const html = await blob.text()
            if (html?.trim()) return html
          }
        }
        for (const item of items) {
          if (item.types.includes('text/plain')) {
            const blob = await item.getType('text/plain')
            const text = await blob.text()
            if (text?.trim()) return text
          }
        }
      }
    } catch {
      /* 权限被拒时退回纯文本 */
    }
    const text = (await navigator.clipboard?.readText?.()) || ''
    return text.trim()
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

  // 顶栏按钮在 compose 外壳里常驻，每次打开编辑要换掉旧监听，避免重复触发
  modal._newsImportAbort?.abort()
  modal._newsImportAbort = new AbortController()
  modal.querySelector('[data-rich-import-url]')?.addEventListener(
    'click',
    (event) => {
      event.preventDefault()
      setImportOpen(true)
    },
    { signal: modal._newsImportAbort.signal },
  )

  modal.querySelector('[data-news-rich-bar]')?.addEventListener('mousedown', (event) => {
    const button = event.target.closest('[data-rich-cmd]')
    if (!button) return
    event.preventDefault()
    const command = button.dataset.richCmd
    if (command === 'codeMode') {
      setCodeMode(!isNewsCodeMode(rich))
      return
    }
    if (command === 'importUrl') {
      setImportOpen(true)
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

  importModal?.addEventListener('click', (event) => {
    if (event.target.closest('[data-news-import-close]')) {
      event.preventDefault()
      setImportOpen(false)
    }
  })

  importUrlInput?.addEventListener('input', () => {
    showWeixinAssist(isWeixinUrl(importUrlInput.value), '')
  })

  importUrlInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      importRun?.click()
    }
  })

  importOpen?.addEventListener('click', (event) => {
    event.preventDefault()
    const url = String(importUrlInput?.value || '').trim()
    if (!url) {
      toast?.('请先粘贴文章链接', true)
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    showWeixinAssist(
      true,
      '已打开原文。请全选复制后，回到这个黄框里 Ctrl+V，再点「解析粘贴内容」。',
    )
    window.setTimeout(() => importPaste?.focus(), 300)
  })

  importPaste?.addEventListener('paste', (event) => {
    event.preventDefault()
    const html = promoteImgDataSrc(event.clipboardData?.getData('text/html') || '')
    const text = String(event.clipboardData?.getData('text/plain') || '').trim()
    importPasteHtml = html || text
    if (html) {
      // 预览遮罩防盗链图；真正导入仍用 importPasteHtml 里的原地址
      importPaste.innerHTML = maskWeixinImagesForPreview(html)
    } else {
      importPaste.textContent = text
    }
    const hasImg = Boolean(html && /<img\b/i.test(html))
    const previewText = (importPaste.innerText || '').replace(/\s+/g, '')
    if (!previewText && !hasImg) {
      showWeixinAssist(true, '粘贴内容为空。请在微信原文页选中正文后再复制。')
      return
    }
    showWeixinAssist(
      true,
      hasImg
        ? `已收到正文，共识别 ${html.match(/<img\b/gi)?.length || 0} 张图片。黄框里不直接显示原图（微信防盗链），请点「解析粘贴内容」转存到本站。`
        : '已收到文字。若原文有图但这里没有，请重新在原文里选中带图区域再复制粘贴到本框。',
    )
  })

  importClipboard?.addEventListener('click', async (event) => {
    event.preventDefault()
    if (!confirmReplaceBody()) return
    importClipboard.disabled = true
    showWeixinAssist(true, '正在解析粘贴内容并转存图片…')
    try {
      toast?.('正在导入…')
      let raw = String(importPasteHtml || '').trim()
      if (!raw) raw = String(importPaste?.innerHTML || '').trim()
      if (!raw || raw === '<br>') raw = await readClipboardHtml()
      const html = promoteImgDataSrc(normalizePastedArticle(raw))
      if (!html) throw new Error('还没有正文。请先打开原文复制，再粘贴到黄色区域里（不要粘到正文编辑器）。')
      if (!/<img\b/i.test(html) && /图片/.test(html) && html.replace(/图片/g, '').replace(/<[^>]+>/g, '').trim().length < 40) {
        throw new Error('只读到了「图片」占位文字。请重新复制原文，并粘贴到黄框（可带图的那种复制）。')
      }
      const result = await api('/pages/news/import-html', {
        method: 'POST',
        body: JSON.stringify({
          html,
          sourceUrl: String(importUrlInput?.value || '').trim() || 'https://mp.weixin.qq.com/',
        }),
        timeoutMs: 180000,
      })
      finishImport(result)
    } catch (error) {
      showWeixinAssist(true, error.message || '导入失败')
      toast?.(error.message || '导入失败', true)
    } finally {
      importClipboard.disabled = false
    }
  })

  importRun?.addEventListener('click', async () => {
    const url = String(importUrlInput?.value || '').trim()
    if (!url) {
      toast?.('请先粘贴文章链接', true)
      return
    }
    if (!confirmReplaceBody()) return
    importRun.disabled = true
    showWeixinAssist(isWeixinUrl(url), '正在抓取文章并转存图片，请稍候…')
    try {
      toast?.('正在解析链接…')
      const result = await api('/pages/news/import-url', {
        method: 'POST',
        body: JSON.stringify({ url }),
        timeoutMs: 180000,
      })
      finishImport(result)
    } catch (error) {
      const weixinBlocked = error.code === 'weixin_ip_block' || isWeixinUrl(url)
      showWeixinAssist(
        weixinBlocked || isWeixinUrl(url),
        error.message || '解析失败',
      )
      toast?.(error.message || '链接解析失败', true)
    } finally {
      importRun.disabled = false
    }
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
      // 微站/公众号：保留排版，并把 data-src 提升为可转存的 src
      const promoted = promoteImgDataSrc(html)
      const migrateHtml =
        /<section\b/i.test(promoted) ||
        /border-top\s*:/i.test(promoted) ||
        /text-indent\s*:/i.test(promoted) ||
        /mmbiz\.qpic\.cn/i.test(promoted) ||
        /mp\.weixin\.qq\.com/i.test(promoted)
      insertHtmlAtCaret(editor, sanitizeNewsHtml(promoted, { keepColor: migrateHtml }), savedRange)
      promoteEditorLazyImages(editor)
    } else if (text) {
      document.execCommand('insertText', false, text)
      if (/图片/.test(text) && !/<img\b/i.test(text)) {
        toast?.('微信纯文本粘贴带不来图片。请用右上角「链接解析」→ 粘到黄框再「解析粘贴内容」。', true)
        return
      }
    }
    const remoteCount = [...editor.querySelectorAll('img')].filter((image) => {
      const src = normalizeImgSrc(image.getAttribute('src') || '')
      return src && !isStoredMedia(src)
    }).length
    if (!remoteCount) return
    toast('正在转存粘贴内容中的图片到 OSS…')
    await ingestEditorImages(editor, api, toast)
    toast('正文已粘贴')
  })
}
