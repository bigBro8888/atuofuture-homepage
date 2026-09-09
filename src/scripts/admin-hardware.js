import {
  applyHardwareSimpleCms,
  applyProductLibraryCms,
  HARDWARE_PRODUCTS,
} from '../data/hardware-catalog.js'
import { buildHardwarePageModel } from './hardware-store.js'
import { renderHardwarePage } from '../lib/hardware-page-render.js'

const IMAGE_SIZE_GUIDE = [
  { test: (path) => path === 'bannerUrl', label: '首屏 Banner', size: '1920×528', tip: '横向全宽背景' },
  { test: (path) => /items\.\d+\.imageUrl/.test(path), label: '产品图', size: '1200×900', tip: '列表与矩阵卡片用图' },
  { test: () => true, label: '图片', size: '1200×800', tip: '按前台展示比例裁切即可' },
]

let ctx = {
  escapeHtml: (v) => String(v ?? ''),
  homeField: () => '',
  productLibraryOptions: () => [],
  renderHardwareNavEditor: () => '',
  toast: () => {},
  api: null,
  state: null,
}

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

function syncCatalogFromContent(content) {
  applyHardwareSimpleCms(content)
  const library = ctx.state?.productLibrary?.draftContent
  if (library) applyProductLibraryCms(library)
}

function renderBasics(content) {
  const items = Array.isArray(content.items) ? content.items : []
  const options = ctx.productLibraryOptions()
  const optionHtml = (selected) =>
    (options || [])
      .map(([value, label]) => `<option value="${esc(value)}"${String(selected) === String(value) ? ' selected' : ''}>${esc(label)}</option>`)
      .join('')
  return `
    <details class="admin-vedit-basics">
      <summary>
        <strong>基础设置</strong>
        <span>顶栏下拉菜单 · 详情页跳转（一般不用改）</span>
      </summary>
      <div class="admin-vedit-basics__body">
        ${ctx.renderHardwareNavEditor(content.navGroups || [], items)}
        <div class="admin-hw-links">
          <div class="admin-hw-links__head">
            <strong>详情页跳转</strong>
            <p>用户在频道页点「查看详情」时，打开哪一篇商品详情。正文请到「内容中心 → 商品详情」编辑；多数情况留空即可自动匹配。</p>
          </div>
          <div class="admin-hw-links__table" role="table">
            <div class="admin-hw-links__row is-head" role="row">
              <span>频道产品</span>
              <span>跳转到商品详情</span>
            </div>
            ${items
              .map(
                (entry, index) => `
              <div class="admin-hw-links__row" role="row">
                <input type="hidden" data-home-field="items.${index}.id" value="${esc(entry.id || '')}" />
                <input type="hidden" data-home-field="items.${index}.group" value="${esc(entry.group || '')}" />
                <span class="admin-hw-links__name">${esc(entry.title || entry.id || '未命名')}</span>
                <label class="admin-hw-links__select">
                  <select data-home-field="items.${index}.detailId">
                    <option value="">自动匹配（推荐）</option>
                    ${optionHtml(entry.detailId || '')}
                  </select>
                </label>
              </div>`
              )
              .join('') || '<p class="admin-form-section__hint">暂无产品。</p>'}
          </div>
        </div>
      </div>
    </details>`
}

function imageModalHtml() {
  return `
      <input type="file" accept="image/jpeg,image/png,image/webp" hidden data-hardware-visual-file />
      <div class="admin-link-modal" data-hardware-image-modal hidden>
        <div class="admin-link-modal__backdrop" data-hardware-image-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-hw-image-modal-title">
          <header>
            <h3 id="admin-hw-image-modal-title">更换图片</h3>
            <button type="button" data-hardware-image-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <div class="admin-image-modal__size">
              <strong data-hardware-image-modal-size-label>建议尺寸</strong>
              <em data-hardware-image-modal-size-value>1200×800</em>
              <span data-hardware-image-modal-size-tip>上传前请按建议尺寸准备素材</span>
            </div>
            <div class="admin-image-modal__preview">
              <img data-hardware-image-modal-preview src="" alt="" hidden />
              <span data-hardware-image-modal-empty>暂无预览</span>
            </div>
            <label class="admin-news-field is-wide">
              <span>图片链接</span>
              <input type="text" data-hardware-image-modal-url placeholder="/images/... 或 https://..." />
            </label>
            <div class="admin-image-modal__or">或</div>
            <label class="admin-image-modal__upload">
              上传本地图片
              <input type="file" accept="image/jpeg,image/png,image/webp" data-hardware-image-modal-file />
            </label>
          </div>
          <footer>
            <button type="button" data-hardware-image-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-hardware-image-modal-save>确定</button>
          </footer>
        </div>
      </div>`
}

export function renderHardwareVisualEditor(content) {
  const editor = document.querySelector('[data-simple-editor]')
  if (!editor) return
  syncCatalogFromContent(content)
  const model = buildHardwarePageModel(content)
  editor.classList.add('admin-news-editor')
  editor.innerHTML = `
    <div class="admin-vedit admin-vedit--hardware">
      ${renderBasics(content)}
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">点文字直接改，点图片换图。需要更大编辑区时点右侧全屏。</p>
        <button type="button" class="admin-vedit-fullscreen-btn" data-hardware-fullscreen>
          <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
          全屏编辑
        </button>
      </div>
      <div class="admin-vedit-canvas" data-hardware-visual>
        <div class="admin-vedit-fullscreen-bar" hidden>
          <strong>智能硬件 · 全屏编辑</strong>
          <button type="button" data-hardware-fullscreen-exit>
            <span class="material-symbols-outlined" aria-hidden="true">fullscreen_exit</span>
            退出全屏
          </button>
        </div>
        ${renderHardwarePage(model, { editable: true })}
      </div>
      ${imageModalHtml()}
    </div>`
}

export function collectHardwareVisualContent(baseContent) {
  const content = structuredClone(baseContent || { items: [], navGroups: [], spaceMatrixRows: [], sections: {} })
  content.items = Array.isArray(content.items) ? content.items : []
  content.navGroups = Array.isArray(content.navGroups) ? content.navGroups : []
  content.spaceMatrixRows = Array.isArray(content.spaceMatrixRows) ? content.spaceMatrixRows : []
  content.sections = content.sections || {}

  const root = document.querySelector('[data-simple-editor]')
  if (!root) return content

  const fields = [
    ...root.querySelectorAll('[data-home-field]'),
    ...document.querySelectorAll('[data-item-modal]:not([hidden]) [data-home-field]'),
  ]
  fields.forEach((field) => {
    const path = field.dataset.homeField
    const value = field.value
    const match = /^items\.(\d+)\.(\w+)$/.exec(path)
    if (match) {
      const index = Number(match[1])
      content.items[index] = content.items[index] || {}
      content.items[index][match[2]] = value
      return
    }
    const navGroup = /^navGroups\.(\d+)\.(id|title|icon)$/.exec(path)
    if (navGroup) {
      const index = Number(navGroup[1])
      content.navGroups[index] = content.navGroups[index] || { products: [] }
      content.navGroups[index][navGroup[2]] = value
      return
    }
    const navProduct = /^navGroups\.(\d+)\.products\.(\d+)\.(id|label|href|imageUrl)$/.exec(path)
    if (navProduct) {
      const groupIndex = Number(navProduct[1])
      const productIndex = Number(navProduct[2])
      content.navGroups[groupIndex] = content.navGroups[groupIndex] || { products: [] }
      content.navGroups[groupIndex].products[productIndex] = content.navGroups[groupIndex].products[productIndex] || {}
      content.navGroups[groupIndex].products[productIndex][navProduct[3]] = value
      return
    }
    setNested(content, path, value)
  })

  root.querySelectorAll('[data-edit-path]').forEach((el) => {
    setNested(content, el.dataset.editPath, readEditableText(el))
  })
  root.querySelectorAll('[data-edit-image]').forEach((el) => {
    const path = el.dataset.editImage
    if (!path) return
    const url = el.dataset.editImageUrl != null ? el.dataset.editImageUrl : el.querySelector('img')?.getAttribute('src') || ''
    setNested(content, path, url || '')
  })

  // pack sparse spaceMatrixRows / sections objects that came from setNested
  if (content.spaceMatrixRows && !Array.isArray(content.spaceMatrixRows)) {
    const map = content.spaceMatrixRows
    content.spaceMatrixRows = Object.keys(map)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => {
        const row = map[k] || {}
        if (row.products && !Array.isArray(row.products)) {
          row.products = Object.keys(row.products)
            .filter((pk) => /^\d+$/.test(pk))
            .sort((a, b) => Number(a) - Number(b))
            .map((pk) => row.products[pk] || {})
        }
        return row
      })
  }

  // merge matrix labels into existing rows by index
  const baseRows = Array.isArray(baseContent?.spaceMatrixRows) ? structuredClone(baseContent.spaceMatrixRows) : []
  if (Array.isArray(content.spaceMatrixRows)) {
    content.spaceMatrixRows = baseRows.map((base, index) => {
      const extra = content.spaceMatrixRows[index] || {}
      const products = (base.products || []).map((product, productIndex) => ({
        ...product,
        ...(extra.products?.[productIndex] || {}),
        id: product.id,
      }))
      return {
        ...base,
        title: extra.title != null ? extra.title : base.title,
        subtitle: extra.subtitle != null ? extra.subtitle : base.subtitle,
        products,
      }
    })
  }

  content.items = content.items.filter(Boolean)
  content.navGroups = content.navGroups.filter(Boolean).map((group) => ({
    ...group,
    products: Array.isArray(group.products) ? group.products.filter(Boolean) : [],
  }))
  return content
}

function currentImageUrl(imageEl) {
  if (!imageEl) return ''
  if (imageEl.dataset.editImageUrl) return imageEl.dataset.editImageUrl
  return imageEl.querySelector('img')?.getAttribute('src') || ''
}

function setImageModalPreview(modal, url) {
  const preview = modal.querySelector('[data-hardware-image-modal-preview]')
  const empty = modal.querySelector('[data-hardware-image-modal-empty]')
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
  const canvas = document.querySelector('[data-hardware-visual]')
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
      const tip = target.querySelector('.hpi-edit-img__tip')
      if (tip) {
        tip.textContent = path === 'bannerUrl' ? '更换 Banner' : '更换图片'
        tip.classList.remove('is-visible')
      }
      if (target.matches('.hpi-edit-bg')) target.textContent = '更换 Banner'
    } else {
      if (img) img.remove()
      target.classList.add('hpi-edit-img--empty')
      if (target.matches('.hpi-edit-bg')) target.textContent = '添加 Banner'
    }
  }
  if (path === 'bannerUrl') {
    const heroImg = canvas.querySelector('.hwc-hero__bg img')
    if (heroImg && safeUrl) heroImg.src = safeUrl
  }
}

function openImageModal(imageEl) {
  const modal = document.querySelector('[data-hardware-image-modal]')
  if (!modal || !imageEl) return
  modal.hidden = false
  modal._targetPath = imageEl.dataset.editImage || ''
  const guide = resolveImageSizeGuide(modal._targetPath)
  const title = modal.querySelector('#admin-hw-image-modal-title')
  if (title) title.textContent = `更换图片 · ${guide.label}`
  modal.querySelector('[data-hardware-image-modal-size-label]').textContent = `${guide.label} · 建议尺寸`
  modal.querySelector('[data-hardware-image-modal-size-value]').textContent = guide.size
  modal.querySelector('[data-hardware-image-modal-size-tip]').textContent = guide.tip
  const url = currentImageUrl(imageEl)
  const urlInput = modal.querySelector('[data-hardware-image-modal-url]')
  if (urlInput) urlInput.value = url
  setImageModalPreview(modal, url)
  urlInput?.focus()
}

function closeImageModal() {
  const modal = document.querySelector('[data-hardware-image-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetPath = ''
  const fileInput = modal.querySelector('[data-hardware-image-modal-file]')
  if (fileInput) fileInput.value = ''
}

function saveImageModal() {
  const modal = document.querySelector('[data-hardware-image-modal]')
  if (!modal?._targetPath) return
  const url = modal.querySelector('[data-hardware-image-modal-url]')?.value.trim() || ''
  applyVisualImage(modal._targetPath, url)
  closeImageModal()
  ctx.toast(url ? '图片已更新' : '已清除图片')
}

function setHardwareFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--hardware')
  const canvas = document.querySelector('[data-hardware-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-hardware-fullscreen', on)
  if (bar) bar.hidden = !on
}

export function bindHardwareVisualAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const editor = document.querySelector('[data-simple-editor]')
  if (!editor) return

  editor.addEventListener('click', async (event) => {
    if (ctx.state?.simpleKey !== 'hardware') return
    if (event.target.closest('[data-hardware-fullscreen]')) {
      event.preventDefault()
      setHardwareFullscreen(true)
      return
    }
    if (event.target.closest('[data-hardware-fullscreen-exit]')) {
      event.preventDefault()
      setHardwareFullscreen(false)
      return
    }
    if (event.target.closest('[data-hardware-image-modal-close]')) {
      event.preventDefault()
      closeImageModal()
      return
    }
    if (event.target.closest('[data-hardware-image-modal-save]')) {
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
    if (!document.body.classList.contains('admin-hardware-fullscreen')) return
    setHardwareFullscreen(false)
  })

  editor.addEventListener('change', async (event) => {
    if (ctx.state?.simpleKey !== 'hardware') return
    const fileInput = event.target.closest('[data-hardware-image-modal-file]')
    if (!fileInput?.files?.[0] || !ctx.api) return
    const modal = document.querySelector('[data-hardware-image-modal]')
    const path = modal?._targetPath
    if (!path) return
    fileInput.disabled = true
    try {
      const body = new FormData()
      body.append('file', fileInput.files[0])
      const result = await ctx.api('/admin/uploads', { method: 'POST', body })
      const url = result.url || result.path || ''
      const urlInput = modal.querySelector('[data-hardware-image-modal-url]')
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

// silence unused import warning in some bundlers
void HARDWARE_PRODUCTS
