import { htmlFromPlainBody, sanitizeNewsHtml } from '../lib/sanitize-news-html.js'

function isLocalMedia(src) {
  return src.startsWith('/api/public/uploads/') || src.startsWith('/images/') || src.startsWith('/assets/')
}

export function newsRichEditorMarkup(item = {}) {
  const html = sanitizeNewsHtml(item.bodyHtml || htmlFromPlainBody(item.body || ''))
  return `
    <label class="admin-form-wide">
      <span>主题正文</span>
      <div class="admin-rich" data-news-rich>
        <div class="admin-rich__bar" data-news-rich-bar>
          <button type="button" data-rich-cmd="h3">标题</button>
          <button type="button" data-rich-cmd="p">正文</button>
          <button type="button" data-rich-cmd="bold">加粗</button>
          <button type="button" data-rich-cmd="italic">斜体</button>
          <button type="button" data-rich-cmd="insertUnorderedList">项目</button>
          <button type="button" data-rich-cmd="insertOrderedList">编号</button>
          <button type="button" data-rich-cmd="link">链接</button>
          <button type="button" data-rich-cmd="table">表格</button>
          <button type="button" data-rich-cmd="image">插图</button>
          <button type="button" data-rich-cmd="removeFormat">清除格式</button>
        </div>
        <div class="admin-rich__editor" contenteditable="true" data-news-html-editor role="textbox" aria-label="新闻正文">${html}</div>
        <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" data-news-rich-file />
        <small>可从其它网页整篇复制粘贴。表格、图片会保留；外站图片会尽量转存到本站。</small>
      </div>
    </label>`
}

export function readNewsRichContent(modal = document) {
  const editor = modal.querySelector('[data-news-html-editor]')
  const html = sanitizeNewsHtml(editor?.innerHTML || '')
  const text = (editor?.innerText || '').replace(/\u00a0/g, ' ').trim()
  return { bodyHtml: html, body: text }
}

async function uploadImageFile(file, api) {
  const formData = new FormData()
  formData.append('image', file)
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

async function ingestEditorImages(editor, api, toast) {
  const images = [...editor.querySelectorAll('img')]
  for (const image of images) {
    const src = image.getAttribute('src') || ''
    if (!src || isLocalMedia(src)) continue
    try {
      if (src.startsWith('data:image/') || src.startsWith('blob:')) {
        const response = await fetch(src)
        const blob = await response.blob()
        const file = new File([blob], 'paste.png', { type: blob.type || 'image/png' })
        image.src = await uploadImageFile(file, api)
        continue
      }
      if (/^https?:\/\//i.test(src)) {
        try {
          image.src = await importRemoteImage(src, api)
        } catch {
          // 转存失败时仍保留原图，避免整篇粘贴失败
        }
      }
    } catch (error) {
      toast?.(error.message || '图片导入失败', true)
    }
  }
}

export function bindNewsRichEditor(modal, { api, toast }) {
  const editor = modal.querySelector('[data-news-html-editor]')
  const fileInput = modal.querySelector('[data-news-rich-file]')
  if (!editor) return

  modal.querySelector('[data-news-rich-bar]')?.addEventListener('mousedown', (event) => {
    const button = event.target.closest('[data-rich-cmd]')
    if (!button) return
    event.preventDefault()
    const command = button.dataset.richCmd
    editor.focus()
    if (command === 'h3') document.execCommand('formatBlock', false, 'h3')
    else if (command === 'p') document.execCommand('formatBlock', false, 'p')
    else if (command === 'link') {
      const href = window.prompt('请输入链接地址', 'https://')
      if (href) document.execCommand('createLink', false, href)
    } else if (command === 'table') {
      document.execCommand('insertHTML', false, '<table><thead><tr><th>列 1</th><th>列 2</th><th>列 3</th></tr></thead><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table><p></p>')
    } else if (command === 'image') {
      fileInput?.click()
    } else {
      document.execCommand(command, false, null)
    }
  })

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files?.[0]
    fileInput.value = ''
    if (!file) return
    try {
      const url = await uploadImageFile(file, api)
      editor.focus()
      document.execCommand('insertHTML', false, `<p><img src="${url}" alt=""></p>`)
    } catch (error) {
      toast(error.message, true)
    }
  })

  editor.addEventListener('paste', async (event) => {
    const html = event.clipboardData?.getData('text/html')
    const text = event.clipboardData?.getData('text/plain')
    const file = [...(event.clipboardData?.files || [])].find((item) => item.type.startsWith('image/'))
    event.preventDefault()
    if (file) {
      try {
        const url = await uploadImageFile(file, api)
        document.execCommand('insertHTML', false, `<p><img src="${url}" alt=""></p>`)
      } catch (error) {
        toast(error.message, true)
      }
      return
    }
    if (html) document.execCommand('insertHTML', false, sanitizeNewsHtml(html))
    else if (text) document.execCommand('insertText', false, text)
    toast('正在处理粘贴内容中的图片…')
    await ingestEditorImages(editor, api, toast)
    toast('正文已粘贴，可继续改格式后发布')
  })
}
