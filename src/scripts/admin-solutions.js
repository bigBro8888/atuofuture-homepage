import { getPublishedSolutions, SOLUTIONS } from '../data/solutions.js'
import { getProductAgent } from '../data/product-agents.js'
import { renderSolutionsChannel } from '../lib/solutions-channel-render.js'

const IMAGE_SIZE_GUIDE = [
  { test: (path) => path === 'bannerUrl', label: '首屏 Banner', size: '1920×800', tip: '横向全宽背景' },
  { test: (path) => /items\.\d+\.imageUrl/.test(path), label: '方案封面', size: '1200×800', tip: '场景大图' },
  { test: () => true, label: '图片', size: '1200×800', tip: '按前台比例裁切即可' },
]

let ctx = { escapeHtml: (v) => String(v ?? ''), toast: () => {}, api: null, state: null }

function esc(value) {
  return ctx.escapeHtml(value)
}

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
  const solutions = (getPublishedSolutions().length ? getPublishedSolutions() : SOLUTIONS).map((s) => {
    const hit = items.find((item) => item.id === s.id)
    return {
      ...s,
      name: hit?.title || s.name,
      value: hit?.summary || s.value || s.summary,
      summary: hit?.summary || s.summary,
      image: hit?.imageUrl || s.image,
    }
  })
  return {
    hero: {
      title: content.title || '',
      subtitle: content.subtitle || '',
      bannerUrl: content.bannerUrl || '',
      ctaLabel: content.ctaLabel || '',
    },
    solutions,
    resolveItemIndex,
    agentLabel: (id) => {
      const a = getProductAgent(id)
      return a ? a.name.replace(/智能体$/, '') : id
    },
  }
}

function imageModalHtml() {
  return `
      <div class="admin-link-modal" data-solutions-image-modal hidden>
        <div class="admin-link-modal__backdrop" data-solutions-image-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-sol-image-modal-title">
          <header>
            <h3 id="admin-sol-image-modal-title">更换图片</h3>
            <button type="button" data-solutions-image-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <div class="admin-image-modal__size">
              <strong data-solutions-image-modal-size-label>建议尺寸</strong>
              <em data-solutions-image-modal-size-value>1200×800</em>
              <span data-solutions-image-modal-size-tip>上传前请按建议尺寸准备素材</span>
            </div>
            <div class="admin-image-modal__preview">
              <img data-solutions-image-modal-preview src="" alt="" hidden />
              <span data-solutions-image-modal-empty>暂无预览</span>
            </div>
            <label class="admin-news-field is-wide">
              <span>图片链接</span>
              <input type="text" data-solutions-image-modal-url placeholder="/images/... 或 https://..." />
            </label>
            <div class="admin-image-modal__or">或</div>
            <label class="admin-image-modal__upload">
              上传本地图片
              <input type="file" accept="image/jpeg,image/png,image/webp" data-solutions-image-modal-file />
            </label>
          </div>
          <footer>
            <button type="button" data-solutions-image-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-solutions-image-modal-save>确定</button>
          </footer>
        </div>
      </div>`
}

export function renderSolutionsVisualEditor(content) {
  const editor = document.querySelector('[data-simple-editor]')
  if (!editor) return
  editor.classList.add('admin-news-editor')
  const model = buildModel(content || {})
  editor.innerHTML = `
    <div class="admin-vedit admin-vedit--solutions">
      <details class="admin-vedit-basics">
        <summary>
          <strong>说明</strong>
          <span>本页改频道首屏与方案卡片；详情正文在「内容中心 → 行业解决方案」</span>
        </summary>
        <div class="admin-vedit-basics__body">
          <p class="admin-form-section__hint">方案条目与前台目录对齐，不可在此随意增删。需要新方案请到内容中心新建并发布。</p>
        </div>
      </details>
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">点文字直接改，点图片换图。需要更大编辑区时点右侧全屏。</p>
        <button type="button" class="admin-vedit-fullscreen-btn" data-solutions-fullscreen>
          <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
          全屏编辑
        </button>
      </div>
      <div class="admin-vedit-canvas" data-solutions-visual>
        <div class="admin-vedit-fullscreen-bar" hidden>
          <strong>行业解决方案 · 全屏编辑</strong>
          <button type="button" data-solutions-fullscreen-exit>
            <span class="material-symbols-outlined" aria-hidden="true">fullscreen_exit</span>
            退出全屏
          </button>
        </div>
        ${renderSolutionsChannel(model, { editable: true })}
      </div>
      ${imageModalHtml()}
    </div>`
}

export function collectSolutionsVisualContent(baseContent) {
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
  const preview = modal.querySelector('[data-solutions-image-modal-preview]')
  const empty = modal.querySelector('[data-solutions-image-modal-empty]')
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
  const canvas = document.querySelector('[data-solutions-visual]')
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
        const hero = canvas.querySelector('.sol-home-hero')
        if (hero) hero.style.setProperty('--sol-hero-image', `url('${safeUrl}')`)
      }
    } else if (target.matches('.hpi-edit-bg')) {
      target.textContent = '添加 Banner'
    }
  }
  if (path === 'bannerUrl') {
    const hero = canvas.querySelector('.sol-home-hero')
    if (hero && safeUrl) hero.style.setProperty('--sol-hero-image', `url('${safeUrl}')`)
  }
}

function openImageModal(imageEl) {
  const modal = document.querySelector('[data-solutions-image-modal]')
  if (!modal || !imageEl) return
  modal.hidden = false
  modal._targetPath = imageEl.dataset.editImage || ''
  const guide = resolveImageSizeGuide(modal._targetPath)
  modal.querySelector('#admin-sol-image-modal-title').textContent = `更换图片 · ${guide.label}`
  modal.querySelector('[data-solutions-image-modal-size-label]').textContent = `${guide.label} · 建议尺寸`
  modal.querySelector('[data-solutions-image-modal-size-value]').textContent = guide.size
  modal.querySelector('[data-solutions-image-modal-size-tip]').textContent = guide.tip
  const url = currentImageUrl(imageEl)
  const urlInput = modal.querySelector('[data-solutions-image-modal-url]')
  if (urlInput) urlInput.value = url
  setImageModalPreview(modal, url)
}

function closeImageModal() {
  const modal = document.querySelector('[data-solutions-image-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetPath = ''
}

function saveImageModal() {
  const modal = document.querySelector('[data-solutions-image-modal]')
  if (!modal?._targetPath) return
  const url = modal.querySelector('[data-solutions-image-modal-url]')?.value.trim() || ''
  applyVisualImage(modal._targetPath, url)
  closeImageModal()
  ctx.toast(url ? '图片已更新' : '已清除图片')
}

function setFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--solutions')
  const canvas = document.querySelector('[data-solutions-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-solutions-fullscreen', on)
  if (bar) bar.hidden = !on
}

export function bindSolutionsVisualAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const editor = document.querySelector('[data-simple-editor]')
  if (!editor) return

  editor.addEventListener('click', async (event) => {
    if (ctx.state?.simpleKey !== 'solutions') return
    if (event.target.closest('[data-solutions-fullscreen]')) {
      event.preventDefault()
      setFullscreen(true)
      return
    }
    if (event.target.closest('[data-solutions-fullscreen-exit]')) {
      event.preventDefault()
      setFullscreen(false)
      return
    }
    if (event.target.closest('[data-solutions-image-modal-close]')) {
      event.preventDefault()
      closeImageModal()
      return
    }
    if (event.target.closest('[data-solutions-image-modal-save]')) {
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
    if (event.target.closest('[data-solutions-visual] a, [data-solutions-visual] button') && !event.target.closest('[data-edit-image]')) {
      event.preventDefault()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!document.body.classList.contains('admin-solutions-fullscreen')) return
    setFullscreen(false)
  })

  editor.addEventListener('change', async (event) => {
    if (ctx.state?.simpleKey !== 'solutions') return
    const fileInput = event.target.closest('[data-solutions-image-modal-file]')
    if (!fileInput?.files?.[0] || !ctx.api) return
    const modal = document.querySelector('[data-solutions-image-modal]')
    fileInput.disabled = true
    try {
      const body = new FormData()
      body.append('image', fileInput.files[0])
      const result = await ctx.api('/pages/media/image', { method: 'POST', body })
      const url = result.url || ''
      const urlInput = modal.querySelector('[data-solutions-image-modal-url]')
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

void esc
