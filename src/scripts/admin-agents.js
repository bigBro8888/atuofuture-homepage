import { AGENTS_OVERVIEW } from '../data/agents-overview.js'
import { renderAgentsChannel } from '../lib/agents-channel-render.js'

const IMAGE_SIZE_GUIDE = [
  { test: (path) => path === 'bannerUrl', label: '首屏 Banner', size: '1920×1080', tip: '横向全宽背景' },
  { test: (path) => /items\.\d+\.imageUrl/.test(path), label: '智能体场景图', size: '960×600', tip: '任务故事与卡片用图' },
  { test: () => true, label: '图片', size: '1200×800', tip: '按前台比例裁切即可' },
]

let ctx = { escapeHtml: (v) => String(v ?? ''), toast: () => {}, api: null, state: null }

function resolveImageSizeGuide(path = '') {
  return IMAGE_SIZE_GUIDE.find((item) => item.test(path)) || IMAGE_SIZE_GUIDE[IMAGE_SIZE_GUIDE.length - 1]
}

function setNested(target, path, value) {
  const keys = path.split('.')
  let cursor = target
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value
      return
    }
    const nextKey = keys[index + 1]
    const isIndex = /^\d+$/.test(nextKey)
    if (!cursor[key]) cursor[key] = isIndex ? [] : {}
    cursor = cursor[key]
  })
}

function readEditableText(el) {
  return (el.innerText || '').replace(/\u00a0/g, ' ').trim()
}

function buildModel(content) {
  const items = Array.isArray(content.items) ? content.items : []
  const resolveItemIndex = (id) => items.findIndex((item) => item.id === id || item.group === id)
  const agents = AGENTS_OVERVIEW.map((agent) => {
    const hit = items.find((item) => item.id === agent.id)
    return {
      ...agent,
      name: hit?.title || agent.name,
      blurb: hit?.summary || agent.blurb,
      sceneImage: hit?.imageUrl || agent.sceneImage,
    }
  })
  return {
    hero: {
      title: content.title || '',
      subtitle: content.subtitle || '',
      bannerUrl: content.bannerUrl || '',
      ctaLabel: content.ctaLabel || '',
    },
    agents,
    resolveItemIndex,
  }
}

function imageModalHtml() {
  return `
      <div class="admin-link-modal" data-agents-image-modal hidden>
        <div class="admin-link-modal__backdrop" data-agents-image-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-ag-image-modal-title">
          <header>
            <h3 id="admin-ag-image-modal-title">更换图片</h3>
            <button type="button" data-agents-image-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <div class="admin-image-modal__size">
              <strong data-agents-image-modal-size-label>建议尺寸</strong>
              <em data-agents-image-modal-size-value>1200×800</em>
              <span data-agents-image-modal-size-tip>上传前请按建议尺寸准备素材</span>
            </div>
            <div class="admin-image-modal__preview">
              <img data-agents-image-modal-preview src="" alt="" hidden />
              <span data-agents-image-modal-empty>暂无预览</span>
            </div>
            <label class="admin-news-field is-wide">
              <span>图片链接</span>
              <input type="text" data-agents-image-modal-url placeholder="/images/... 或 https://..." />
            </label>
            <div class="admin-image-modal__or">或</div>
            <label class="admin-image-modal__upload">
              上传本地图片
              <input type="file" accept="image/jpeg,image/png,image/webp" data-agents-image-modal-file />
            </label>
          </div>
          <footer>
            <button type="button" data-agents-image-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-agents-image-modal-save>确定</button>
          </footer>
        </div>
      </div>`
}

export function renderAgentsVisualEditor(content) {
  const editor = document.querySelector('[data-simple-editor]')
  if (!editor) return
  editor.classList.add('admin-news-editor')
  const model = buildModel(content || {})
  editor.innerHTML = `
    <div class="admin-vedit admin-vedit--agents">
      <details class="admin-vedit-basics">
        <summary>
          <strong>说明</strong>
          <span>本页改频道首屏与八大智能体卡片；详情页在「内容中心 → 空间智能体」</span>
        </summary>
        <div class="admin-vedit-basics__body">
          <p class="admin-form-section__hint">生态图、任务故事等交互区仍用前台页面展示；这里改的名称/简介/场景图会同步到前台频道。</p>
        </div>
      </details>
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">点文字直接改，点图片换图。需要更大编辑区时点右侧全屏。</p>
        <button type="button" class="admin-vedit-fullscreen-btn" data-agents-fullscreen>
          <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
          全屏编辑
        </button>
      </div>
      <div class="admin-vedit-canvas" data-agents-visual>
        <div class="admin-vedit-fullscreen-bar" hidden>
          <strong>空间智能体 · 全屏编辑</strong>
          <button type="button" data-agents-fullscreen-exit>
            <span class="material-symbols-outlined" aria-hidden="true">fullscreen_exit</span>
            退出全屏
          </button>
        </div>
        ${renderAgentsChannel(model, { editable: true })}
      </div>
      ${imageModalHtml()}
    </div>`
}

export function collectAgentsVisualContent(baseContent) {
  const content = structuredClone(baseContent || { items: [] })
  content.items = Array.isArray(content.items) ? content.items : []
  const root = document.querySelector('[data-simple-editor]')
  if (!root) return content
  root.querySelectorAll('[data-edit-path]').forEach((el) => {
    setNested(content, el.dataset.editPath, readEditableText(el))
  })
  root.querySelectorAll('[data-edit-image]').forEach((el) => {
    const path = el.dataset.editImage
    if (!path) return
    const url = el.dataset.editImageUrl != null ? el.dataset.editImageUrl : el.querySelector('img')?.getAttribute('src') || ''
    setNested(content, path, url || '')
  })
  content.items = content.items.filter(Boolean)
  return content
}

function currentImageUrl(imageEl) {
  if (!imageEl) return ''
  if (imageEl.dataset.editImageUrl) return imageEl.dataset.editImageUrl
  return imageEl.querySelector('img')?.getAttribute('src') || ''
}

function setImageModalPreview(modal, url) {
  const preview = modal.querySelector('[data-agents-image-modal-preview]')
  const empty = modal.querySelector('[data-agents-image-modal-empty]')
  if (!preview) return
  if (url) {
    preview.src = url
    preview.hidden = false
    if (empty) empty.hidden = true
  } else {
    preview.removeAttribute('src')
    preview.hidden = true
    if (empty) empty.hidden = false
  }
}

function applyVisualImage(path, url) {
  const canvas = document.querySelector('[data-agents-visual]')
  if (!canvas || !path) return
  const target = canvas.querySelector(`[data-edit-image="${CSS.escape(path)}"]`) || canvas.querySelector(`[data-edit-image="${path}"]`)
  const safeUrl = String(url || '').trim()
  if (target) {
    target.dataset.editImageUrl = safeUrl
    let img = target.querySelector('img')
    if (safeUrl) {
      target.classList.remove('hpi-edit-img--empty')
      if (!img) {
        img = document.createElement('img')
        img.alt = ''
        target.prepend(img)
      }
      img.src = safeUrl
      if (target.matches('.hpi-edit-bg')) {
        target.textContent = '更换 Banner'
        const heroImg = canvas.querySelector('.ag-hero__bg img')
        if (heroImg) heroImg.src = safeUrl
      }
    } else if (target.matches('.hpi-edit-bg')) {
      target.textContent = '添加 Banner'
    }
  }
  if (path === 'bannerUrl') {
    const heroImg = canvas.querySelector('.ag-hero__bg img')
    if (heroImg && safeUrl) heroImg.src = safeUrl
  }
}

function openImageModal(imageEl) {
  const modal = document.querySelector('[data-agents-image-modal]')
  if (!modal || !imageEl) return
  modal.hidden = false
  modal._targetPath = imageEl.dataset.editImage || ''
  const guide = resolveImageSizeGuide(modal._targetPath)
  modal.querySelector('#admin-ag-image-modal-title').textContent = `更换图片 · ${guide.label}`
  modal.querySelector('[data-agents-image-modal-size-label]').textContent = `${guide.label} · 建议尺寸`
  modal.querySelector('[data-agents-image-modal-size-value]').textContent = guide.size
  modal.querySelector('[data-agents-image-modal-size-tip]').textContent = guide.tip
  const url = currentImageUrl(imageEl)
  const urlInput = modal.querySelector('[data-agents-image-modal-url]')
  if (urlInput) urlInput.value = url
  setImageModalPreview(modal, url)
}

function closeImageModal() {
  const modal = document.querySelector('[data-agents-image-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetPath = ''
}

function saveImageModal() {
  const modal = document.querySelector('[data-agents-image-modal]')
  if (!modal?._targetPath) return
  const url = modal.querySelector('[data-agents-image-modal-url]')?.value.trim() || ''
  applyVisualImage(modal._targetPath, url)
  closeImageModal()
  ctx.toast(url ? '图片已更新' : '已清除图片')
}

function setFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--agents')
  const canvas = document.querySelector('[data-agents-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-agents-fullscreen', on)
  if (bar) bar.hidden = !on
}

export function bindAgentsVisualAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const editor = document.querySelector('[data-simple-editor]')
  if (!editor) return

  editor.addEventListener('click', async (event) => {
    if (ctx.state?.simpleKey !== 'agents') return
    if (event.target.closest('[data-agents-fullscreen]')) {
      event.preventDefault()
      setFullscreen(true)
      return
    }
    if (event.target.closest('[data-agents-fullscreen-exit]')) {
      event.preventDefault()
      setFullscreen(false)
      return
    }
    if (event.target.closest('[data-agents-image-modal-close]')) {
      event.preventDefault()
      closeImageModal()
      return
    }
    if (event.target.closest('[data-agents-image-modal-save]')) {
      event.preventDefault()
      saveImageModal()
      return
    }
    const imageEl = event.target.closest('[data-edit-image]')
    if (imageEl && editor.contains(imageEl)) {
      event.preventDefault()
      openImageModal(imageEl)
      return
    }
    if (event.target.closest('[data-agents-visual] a, [data-agents-visual] button') && !event.target.closest('[data-edit-image]')) {
      event.preventDefault()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!document.body.classList.contains('admin-agents-fullscreen')) return
    setFullscreen(false)
  })

  editor.addEventListener('change', async (event) => {
    if (ctx.state?.simpleKey !== 'agents') return
    const fileInput = event.target.closest('[data-agents-image-modal-file]')
    if (!fileInput?.files?.[0] || !ctx.api) return
    const modal = document.querySelector('[data-agents-image-modal]')
    fileInput.disabled = true
    try {
      const body = new FormData()
      body.append('image', fileInput.files[0])
      const result = await ctx.api('/pages/media/image', { method: 'POST', body })
      const url = result.url || ''
      const urlInput = modal.querySelector('[data-agents-image-modal-url]')
      if (urlInput) urlInput.value = url
      setImageModalPreview(modal, url)
      ctx.toast('图片已上传，点确定应用')
    } catch (error) {
      ctx.toast(error.message, true)
    } finally {
      fileInput.disabled = false
      fileInput.value = ''
    }
  })
}
