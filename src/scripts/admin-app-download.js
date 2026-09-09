import { renderAppDownloadPage } from '../lib/app-download-page-render.js'

const IMAGE_SIZE_GUIDE = [
  { test: (path) => path === 'desktopBannerUrl', label: '桌面 Banner', size: '1920×823', tip: '21:9 横向背景' },
  { test: (path) => path === 'heroImageUrl', label: '手机展示图', size: '750×1334', tip: '竖屏手机界面图' },
  { test: (path) => path === 'iconUrl', label: 'App 图标', size: '1024×1024', tip: '圆角方形图标' },
  { test: () => true, label: '图片', size: '1200×800', tip: '按前台比例裁切即可' },
]

const FEATURE_ACCENTS = [
  ['blue', '深海蓝'],
  ['cyan', '科技青'],
  ['violet', '智能紫'],
  ['amber', '活力橙'],
]

const FEATURE_ICONS = [
  ['photo_library', '相册管理'],
  ['sync', '一键同步'],
  ['cast', '随心投屏'],
  ['auto_awesome', 'AI 创作'],
  ['brush', '图片编辑'],
  ['smart_toy', 'AI 助手'],
  ['bolt', '能耗管理'],
  ['shield', '安全防护'],
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

function field(path, label, value, options = {}) {
  const control =
    options.type === 'textarea'
      ? `<textarea data-app-field="${esc(path)}" rows="${options.rows || 2}">${esc(value || '')}</textarea>`
      : options.type === 'select'
        ? `<select data-app-field="${esc(path)}">${(options.options || [])
            .map(([v, labelText]) => `<option value="${esc(v)}"${String(value) === String(v) ? ' selected' : ''}>${esc(labelText)}</option>`)
            .join('')}</select>`
        : `<input data-app-field="${esc(path)}" type="text" value="${esc(value || '')}" />`
  return `<label class="${options.wide ? 'admin-form-wide' : ''}"><span>${label}</span>${control}</label>`
}

function renderBasics(app) {
  const buttons = app.buttons || {}
  const features = app.features || { items: [] }
  const items = Array.isArray(features.items) ? features.items : []
  return `
    <details class="admin-vedit-basics">
      <summary>
        <strong>基础设置</strong>
        <span>应用身份 · 下载链接 · 按钮文案 · 亮点图标色</span>
      </summary>
      <div class="admin-vedit-basics__body">
        <div class="admin-form-grid">
          ${field('name', 'App 名称', app.name || '')}
          ${field('iconUrl', 'App 图标链接', app.iconUrl || '', { wide: true })}
          ${field('description', '产品介绍', app.description || '', { type: 'textarea', wide: true, rows: 2 })}
          ${field('androidDownloadUrl', 'Android 下载链接', app.androidDownloadUrl || '', { wide: true })}
          ${field('iosStoreUrl', 'iOS App Store 链接', app.iosStoreUrl || '', { wide: true })}
          ${field('privacyUrl', '隐私政策链接', app.privacyUrl || '')}
          ${field('termsUrl', '服务协议链接', app.termsUrl || '')}
          ${field('buttons.androidLabel', 'Android 提示', buttons.androidLabel || '')}
          ${field('buttons.iosLabel', 'iOS 提示', buttons.iosLabel || '')}
          ${field('buttons.switchToAndroid', '切到 Android 文案', buttons.switchToAndroid || '')}
          ${field('buttons.switchToIos', '切到 iOS 文案', buttons.switchToIos || '')}
          ${field('buttons.switchToAndroidTag', 'Android 角标', buttons.switchToAndroidTag || '')}
          ${field('buttons.switchToIosTag', 'iOS 角标', buttons.switchToIosTag || '')}
        </div>
        <div class="admin-about-lists" style="margin-top:16px">
          ${[0, 1, 2, 3]
            .map((index) => {
              const item = items[index] || {}
              return `
            <div class="admin-about-list-block">
              <div class="admin-about-list-block__head"><strong>亮点卡 ${index + 1}</strong></div>
              <div class="admin-form-grid">
                ${field(`features.items.${index}.icon`, '图标', item.icon || FEATURE_ICONS[index]?.[0] || 'photo_library', {
                  type: 'select',
                  options: FEATURE_ICONS,
                })}
                ${field(`features.items.${index}.accent`, '强调色', item.accent || FEATURE_ACCENTS[index]?.[0] || 'blue', {
                  type: 'select',
                  options: FEATURE_ACCENTS,
                })}
              </div>
            </div>`
            })
            .join('')}
        </div>
      </div>
    </details>`
}

function imageModalHtml() {
  return `
      <div class="admin-link-modal" data-appdl-image-modal hidden>
        <div class="admin-link-modal__backdrop" data-appdl-image-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-appdl-image-modal-title">
          <header>
            <h3 id="admin-appdl-image-modal-title">更换图片</h3>
            <button type="button" data-appdl-image-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <div class="admin-image-modal__size">
              <strong data-appdl-image-modal-size-label>建议尺寸</strong>
              <em data-appdl-image-modal-size-value>1200×800</em>
              <span data-appdl-image-modal-size-tip>上传前请按建议尺寸准备素材</span>
            </div>
            <div class="admin-image-modal__preview">
              <img data-appdl-image-modal-preview src="" alt="" hidden />
              <span data-appdl-image-modal-empty>暂无预览</span>
            </div>
            <label class="admin-news-field is-wide">
              <span>图片链接</span>
              <input type="text" data-appdl-image-modal-url placeholder="/images/... 或 https://..." />
            </label>
            <div class="admin-image-modal__or">或</div>
            <label class="admin-image-modal__upload">
              上传本地图片
              <input type="file" accept="image/jpeg,image/png,image/webp" data-appdl-image-modal-file />
            </label>
          </div>
          <footer>
            <button type="button" data-appdl-image-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-appdl-image-modal-save>确定</button>
          </footer>
        </div>
      </div>`
}

export function renderAppDownloadVisualEditor(app) {
  const editor = document.querySelector('[data-config-editor]')
  if (!editor) return
  editor.classList.add('admin-news-editor')
  const published = document.querySelector('[data-config-form] [name="published"]')
  if (published) published.checked = Boolean(app?.published)
  editor.innerHTML = `
    <div class="admin-vedit admin-vedit--appdl">
      ${renderBasics(app || {})}
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">点文字直接改，点图片换图。下载链接与按钮文案在上方基础设置。</p>
        <button type="button" class="admin-vedit-fullscreen-btn" data-appdl-fullscreen>
          <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
          全屏编辑
        </button>
      </div>
      <div class="admin-vedit-canvas" data-appdl-visual>
        <div class="admin-vedit-fullscreen-bar" hidden>
          <strong>App 下载页 · 全屏编辑</strong>
          <button type="button" data-appdl-fullscreen-exit>
            <span class="material-symbols-outlined" aria-hidden="true">fullscreen_exit</span>
            退出全屏
          </button>
        </div>
        ${renderAppDownloadPage(app || {}, { editable: true })}
      </div>
      ${imageModalHtml()}
    </div>`
}

function packFeatureItems(value) {
  const source = Array.isArray(value) ? value : value && typeof value === 'object' ? Object.keys(value).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b)).map((k) => value[k]) : []
  return [0, 1, 2, 3].map((index) => {
    const item = source[index] || {}
    return {
      icon: String(item.icon || FEATURE_ICONS[index]?.[0] || 'photo_library').trim(),
      title: String(item.title || '').trim(),
      description: String(item.description || '').trim(),
      accent: String(item.accent || FEATURE_ACCENTS[index]?.[0] || 'blue').trim(),
    }
  })
}

export function collectAppDownloadVisualContent(baseApp) {
  const app = structuredClone(baseApp || {})
  app.features = app.features || { title: '', subtitle: '', items: [] }
  app.buttons = app.buttons || {}
  const root = document.querySelector('[data-config-editor]')
  if (!root) return app

  root.querySelectorAll('[data-app-field]').forEach((field) => {
    setNested(app, field.dataset.appField, field.value.trim())
  })
  root.querySelectorAll('[data-edit-path]').forEach((el) => {
    setNested(app, el.dataset.editPath, readEditableText(el))
  })
  root.querySelectorAll('[data-edit-image]').forEach((el) => {
    const path = el.dataset.editImage
    if (!path) return
    const url = el.dataset.editImageUrl != null ? el.dataset.editImageUrl : el.querySelector('img')?.getAttribute('src') || ''
    setNested(app, path, url || '')
  })

  app.features.items = packFeatureItems(app.features.items)
  const published = document.querySelector('[data-config-form] [name="published"]')
  app.published = Boolean(published?.checked)
  delete app.heroImageFile
  delete app.desktopBannerFile
  return app
}

function currentImageUrl(imageEl) {
  if (!imageEl) return ''
  if (imageEl.dataset.editImageUrl) return imageEl.dataset.editImageUrl
  return imageEl.querySelector('img')?.getAttribute('src') || ''
}

function setImageModalPreview(modal, url) {
  const preview = modal.querySelector('[data-appdl-image-modal-preview]')
  const empty = modal.querySelector('[data-appdl-image-modal-empty]')
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
  const canvas = document.querySelector('[data-appdl-visual]')
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
        target.textContent = '更换桌面 Banner'
        const wrap = canvas.querySelector('.dl-vedit')
        if (wrap) wrap.style.setProperty('--dl-banner', `url('${safeUrl}')`)
      }
    } else if (target.matches('.hpi-edit-bg')) {
      target.textContent = '添加桌面 Banner'
    }
  }
  if (path === 'desktopBannerUrl') {
    const wrap = canvas.querySelector('.dl-vedit')
    if (wrap && safeUrl) wrap.style.setProperty('--dl-banner', `url('${safeUrl}')`)
  }
}

function openImageModal(imageEl) {
  const modal = document.querySelector('[data-appdl-image-modal]')
  if (!modal || !imageEl) return
  modal.hidden = false
  modal._targetPath = imageEl.dataset.editImage || ''
  const guide = resolveImageSizeGuide(modal._targetPath)
  modal.querySelector('#admin-appdl-image-modal-title').textContent = `更换图片 · ${guide.label}`
  modal.querySelector('[data-appdl-image-modal-size-label]').textContent = `${guide.label} · 建议尺寸`
  modal.querySelector('[data-appdl-image-modal-size-value]').textContent = guide.size
  modal.querySelector('[data-appdl-image-modal-size-tip]').textContent = guide.tip
  const url = currentImageUrl(imageEl)
  const urlInput = modal.querySelector('[data-appdl-image-modal-url]')
  if (urlInput) urlInput.value = url
  setImageModalPreview(modal, url)
}

function closeImageModal() {
  const modal = document.querySelector('[data-appdl-image-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetPath = ''
}

function saveImageModal() {
  const modal = document.querySelector('[data-appdl-image-modal]')
  if (!modal?._targetPath) return
  const url = modal.querySelector('[data-appdl-image-modal-url]')?.value.trim() || ''
  applyVisualImage(modal._targetPath, url)
  closeImageModal()
  ctx.toast(url ? '图片已更新' : '已清除图片')
}

function setFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--appdl')
  const canvas = document.querySelector('[data-appdl-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-appdl-fullscreen', on)
  if (bar) bar.hidden = !on
}

export function bindAppDownloadVisualAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const form = document.querySelector('[data-config-form]')
  const editor = document.querySelector('[data-config-editor]')
  if (!form || !editor) return

  form.addEventListener('click', (event) => {
    if (event.target.closest('[data-appdl-fullscreen]')) {
      event.preventDefault()
      setFullscreen(true)
      return
    }
    if (event.target.closest('[data-appdl-fullscreen-exit]')) {
      event.preventDefault()
      setFullscreen(false)
      return
    }
    if (event.target.closest('[data-appdl-image-modal-close]')) {
      event.preventDefault()
      closeImageModal()
      return
    }
    if (event.target.closest('[data-appdl-image-modal-save]')) {
      event.preventDefault()
      saveImageModal()
      return
    }
    const imageEl = event.target.closest('[data-edit-image]')
    if (imageEl && editor.contains(imageEl)) {
      event.preventDefault()
      openImageModal(imageEl)
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!document.body.classList.contains('admin-appdl-fullscreen')) return
    setFullscreen(false)
  })

  editor.addEventListener('change', async (event) => {
    const fileInput = event.target.closest('[data-appdl-image-modal-file]')
    if (!fileInput?.files?.[0] || !ctx.api) return
    const modal = document.querySelector('[data-appdl-image-modal]')
    fileInput.disabled = true
    try {
      const body = new FormData()
      body.append('image', fileInput.files[0])
      const result = await ctx.api('/app/hero-image', { method: 'POST', body })
      const url = result.url || ''
      const urlInput = modal.querySelector('[data-appdl-image-modal-url]')
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
