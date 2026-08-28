import { HARDWARE_PRODUCTS, getLine } from '../data/hardware-catalog.js'
import { renderProductStory } from '../lib/product-story-render.js'

const LINE_OPTIONS = [
  ['space', '空间智能'],
  ['retail', '新零售与电子纸'],
  ['consumer', '3C 数码'],
]

let ctx = {
  api: null,
  toast: () => {},
  escapeHtml: (value) => String(value ?? ''),
  dateTime: () => '--',
  state: null,
}

function esc(value) {
  return ctx.escapeHtml(value)
}

function fieldHint(options = {}) {
  const parts = []
  if (options.size) parts.push(`建议尺寸 ${options.size}`)
  if (options.help) parts.push(options.help)
  return parts.length ? `<small>${parts.join(' · ')}</small>` : ''
}

function productField(path, label, value, options = {}) {
  const type = options.type || 'text'
  let field
  if (type === 'textarea') {
    field = `<textarea data-product-field="${path}" rows="${options.rows || 3}"${options.placeholder ? ` placeholder="${esc(options.placeholder)}"` : ''}>${esc(value ?? '')}</textarea>`
  } else if (type === 'select') {
    const opts = (options.options || []).map(([key, text]) => `<option value="${esc(key)}"${String(value) === String(key) ? ' selected' : ''}>${esc(text)}</option>`).join('')
    field = `<select data-product-field="${path}">${opts}</select>`
  } else if (type === 'checkbox') {
    field = `<input data-product-field="${path}" type="checkbox"${value ? ' checked' : ''} />`
  } else {
    field = `<input data-product-field="${path}" type="${type}" value="${esc(value ?? '')}"${options.placeholder ? ` placeholder="${esc(options.placeholder)}"` : ''} />`
  }
  const media = options.image
    ? `<div class="admin-home-media">
        <img data-product-preview-for="${path}" src="${esc(value ?? '')}" alt="" ${value ? '' : 'hidden'} />
        <label class="admin-home-upload">上传图片<input type="file" accept="image/jpeg,image/png,image/webp" data-product-upload-for="${path}" /></label>
      </div>`
    : ''
  return `<label class="admin-news-field${options.wide ? ' is-wide' : ''}"><span>${label}</span>${field}${media}${fieldHint(options)}</label>`
}

function lines(value) {
  return Array.isArray(value) ? value.join('\n') : String(value || '')
}

function emptyProduct() {
  return {
    id: '',
    slug: '',
    name: '',
    tag: '',
    hardwareLine: 'space',
    coverImage: '',
    shortDescription: '',
    fullDescription: '',
    capabilities: [],
    scenarios: [],
    detailCtaLabel: '查看产品详情',
    solutionLabel: '了解 ASpace 总体方案',
    solutionHref: '/solutions/',
    linkedHardwareIds: [],
    published: true,
    story: {
      hero: { title: '', headline: '', description: '', ctaLabel: '查看它如何工作', ctaHref: '#hpi-how', backgroundImage: '', deviceImage: '' },
      value: { title: '', deviceImage: '', left: [], right: [], footer: '' },
      howItWorks: { title: '', stages: [{}, {}, {}, {}] },
      scenarios: { title: '', items: [{}, {}, {}] },
      system: { title: '', upperLabel: '', upperItems: [], middleLabel: '', middleImage: '', lowerItems: [], aspaceHref: '/solutions/', aspaceLabel: '了解 ASpace 总体解决方案' },
      closing: { title: '', desc: '', primaryLabel: '预约方案演示', softLinks: [{ label: '查看技术资料' }, { label: '获取产品文档' }] },
    },
  }
}

function updateProductStatus(page) {
  const draft = document.querySelector('[data-products-draft-time]')
  const status = document.querySelector('[data-products-publish-status]')
  if (draft) draft.textContent = `草稿 ${ctx.dateTime(page.updatedAt)}`
  if (status) status.textContent = page.publishedAt ? `已发布 ${ctx.dateTime(page.publishedAt)}` : '尚未发布'
}

function renderProductList(content) {
  const items = [...(content.items || [])]
  const editor = document.querySelector('[data-products-editor]')
  if (!editor) return
  editor.classList.add('admin-news-editor')
  editor.innerHTML = `
    <div class="admin-news-toolbar">
      <p class="admin-form-section__hint" style="margin:0">点「编辑」进入可视化详情页，直接在预览上改文案和图片。</p>
      <div class="admin-news-toolbar__actions">
        <button type="button" class="admin-add-slide" data-product-add>+ 新建产品</button>
      </div>
    </div>
    <div class="admin-home-list" data-products-list>${items.map((item, index) => `
      <div class="admin-item-row" data-product-index="${index}">
        ${item.coverImage ? `<img class="admin-simple-item__thumb" src="${esc(item.coverImage)}" alt="" />` : '<span class="admin-simple-item__thumb is-empty"></span>'}
        <div>
          <strong>${esc(item.name || '未命名产品')}</strong>
          <small>${esc(item.slug || '')}${item.tag ? ` · ${esc(item.tag)}` : ''} · ${(item.linkedHardwareIds || []).length} 个硬件关联${item.published === false ? ' · 未发布' : ''}</small>
        </div>
        <span class="admin-slide-tools">
          <a href="/hardware/product/?id=${encodeURIComponent(item.slug || item.id)}" target="_blank">预览</a>
          <button type="button" data-product-edit="${index}">编辑</button>
          <button type="button" data-product-remove="${index}">删除</button>
        </span>
      </div>`).join('') || '<p class="admin-form-section__hint">还没有产品，先点上面的新建。</p>'}</div>`
}

function previewProduct(item) {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name || '未命名产品',
    productLine: item.hardwareLine || 'space',
    coverImage: item.coverImage || '',
    shortDescription: item.shortDescription || '',
  }
}

function renderBasicsBar(item) {
  const linked = new Set(item.linkedHardwareIds || [])
  return `
    <details class="admin-vedit-basics" open>
      <summary>
        <strong>基础设置</strong>
        <span>名称、标识、分类、封面与列表字段（页面上看不见的配置）</span>
      </summary>
      <div class="admin-vedit-basics__body">
        <input type="hidden" data-product-field="id" value="${esc(item.id || '')}" />
        <div class="admin-form-grid">
          ${productField('name', '产品名称', item.name, { wide: true, placeholder: '例如 中控屏' })}
          ${productField('slug', '详情页标识', item.slug, { placeholder: 'control-screen', help: '出现在 /hardware/product/?id= 后面' })}
          ${productField('tag', '列表标签', item.tag, { placeholder: '旗舰产品' })}
          ${productField('hardwareLine', '所属产品线', item.hardwareLine || 'space', { type: 'select', options: LINE_OPTIONS })}
          ${productField('coverImage', '列表封面图', item.coverImage, { image: true, wide: true, size: '1200×900' })}
          ${productField('shortDescription', '一句话简介（列表用）', item.shortDescription, { type: 'textarea', wide: true, rows: 2 })}
          ${productField('fullDescription', '详细介绍（列表用）', item.fullDescription, { type: 'textarea', wide: true, rows: 2 })}
          ${productField('capabilities', '能力卖点（列表用）', lines(item.capabilities), { type: 'textarea', wide: true, rows: 2, placeholder: '每行一条' })}
          ${productField('scenarios', '适用场景（列表用）', lines(item.scenarios), { type: 'textarea', wide: true, rows: 2, placeholder: '每行一条' })}
          ${productField('detailCtaLabel', '详情按钮文案', item.detailCtaLabel || '查看产品详情')}
          ${productField('solutionLabel', '方案链接文案', item.solutionLabel || '')}
          ${productField('solutionHref', '方案链接地址', item.solutionHref || '', { wide: true, placeholder: '/solutions/' })}
          <label class="admin-news-pin admin-form-wide">
            <input data-product-field="published" type="checkbox"${item.published !== false ? ' checked' : ''} />
            <span><b>发布后前台可见</b><small>取消勾选则详情页不对外展示。</small></span>
          </label>
        </div>
        <div class="admin-product-links">
          <p class="admin-form-section__hint">关联智能硬件：勾选后，硬件列表里对应产品会默认跳到本详情页。</p>
          ${HARDWARE_PRODUCTS.map((product) => `
            <label>
              <input type="checkbox" data-product-link="${esc(product.id)}"${linked.has(product.id) ? ' checked' : ''} />
              <span><b>${esc(product.name)}</b><small>${esc(product.id)}</small></span>
            </label>`).join('')}
        </div>
      </div>
    </details>`
}

function renderProductCompose(item) {
  const body = document.querySelector('[data-products-compose-body]')
  if (!body) return
  const product = previewProduct(item)
  const line = getLine(product.productLine)
  const story = item.story || emptyProduct().story
  body.innerHTML = `
    <div class="admin-vedit">
      ${renderBasicsBar(item)}
      <div class="admin-vedit-hint">下方即详情页预览：点文字直接改，点图片可更换，点跳转链接会弹出设置。改完点右上角「发布上线」。</div>
      <div class="admin-vedit-canvas" data-product-visual>
        ${renderProductStory(product, story, line, { editable: true })}
      </div>
      <input type="file" accept="image/jpeg,image/png,image/webp" hidden data-product-visual-file />
      <div class="admin-link-modal" data-link-modal hidden>
        <div class="admin-link-modal__backdrop" data-link-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-link-modal-title">
          <header>
            <h3 id="admin-link-modal-title">设置链接</h3>
            <button type="button" data-link-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <label class="admin-news-field is-wide"><span>显示文案</span><input type="text" data-link-label placeholder="例如：查看它如何工作" /></label>
            <fieldset class="admin-link-modal__type">
              <legend>跳转方式</legend>
              <div class="admin-link-modal__type-list">
                <label><input type="radio" name="link-type" value="anchor" data-link-type /><em>当前页锚点</em></label>
                <label><input type="radio" name="link-type" value="url" data-link-type /><em>跳转到其他页面</em></label>
              </div>
            </fieldset>
            <label class="admin-news-field is-wide" data-link-anchor-wrap>
              <span>锚点板块</span>
              <select data-link-anchor>
                <option value="#hpi-value">价值说明</option>
                <option value="#hpi-how">如何工作</option>
                <option value="#hpi-scenes">应用场景</option>
                <option value="#hpi-system">系统位置</option>
                <option value="#hpi-close">收尾预约</option>
              </select>
            </label>
            <label class="admin-news-field is-wide" data-link-url-wrap hidden>
              <span>跳转地址</span>
              <input type="text" data-link-url placeholder="/solutions/ 或 https://..." />
            </label>
          </div>
          <footer>
            <button type="button" data-link-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-link-modal-save>确定</button>
          </footer>
        </div>
      </div>
    </div>`
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

function packIndexed(obj, key) {
  if (!obj || typeof obj[key] !== 'object' || Array.isArray(obj[key])) return
  const map = obj[key]
  const keys = Object.keys(map)
    .filter((k) => /^\d+$/.test(k))
    .sort((a, b) => Number(a) - Number(b))
  if (!keys.length) return
  obj[key] = keys.map((k) => String(map[k] || '').trim()).filter(Boolean)
}

function ensureArray(parent, key, length) {
  if (!parent) return
  const raw = parent[key]
  if (Array.isArray(raw)) {
    parent[key] = raw.slice(0, length)
    return
  }
  if (raw && typeof raw === 'object') {
    parent[key] = Array.from({ length }, (_, i) => raw[i] || raw[String(i)] || {})
    return
  }
  parent[key] = Array.from({ length }, () => ({}))
}

function collectProductFromCompose() {
  const root = document.querySelector('[data-products-compose-view]')
  const item = emptyProduct()
  root.querySelectorAll('[data-product-field]').forEach((field) => {
    const path = field.dataset.productField
    const value = field.type === 'checkbox' ? field.checked : field.value
    setNested(item, path, value)
  })
  root.querySelectorAll('[data-edit-path]').forEach((el) => {
    setNested(item, el.dataset.editPath, readEditableText(el))
  })
  root.querySelectorAll('[data-edit-link]').forEach((el) => {
    const labelPath = el.dataset.editLabelPath
    const hrefPath = el.dataset.editHrefPath
    const label = el.querySelector('[data-edit-link-label]')?.textContent?.trim() || ''
    const href = el.dataset.editHref || ''
    if (labelPath) setNested(item, labelPath, label)
    if (hrefPath) setNested(item, hrefPath, href)
  })
  root.querySelectorAll('[data-edit-image]').forEach((el) => {
    const path = el.dataset.editImage
    const url = el.dataset.editImageUrl || el.querySelector('img')?.getAttribute('src') || ''
    if (path && url) setNested(item, path, url)
  })
  const hero = root.querySelector('.hpi-hero')
  const bgBtn = root.querySelector('[data-edit-image="story.hero.backgroundImage"]')
  if (bgBtn?.dataset.editImageUrl) {
    setNested(item, 'story.hero.backgroundImage', bgBtn.dataset.editImageUrl)
  } else if (hero) {
    const match = String(hero.style.getPropertyValue('--hpi-hero-image') || '').match(/url\(['"]?(.*?)['"]?\)/)
    if (match?.[1]) setNested(item, 'story.hero.backgroundImage', match[1])
  }

  item.linkedHardwareIds = [...root.querySelectorAll('[data-product-link]:checked')].map((input) => input.dataset.productLink)
  const splitLines = (value) =>
    String(value || '')
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
  item.capabilities = splitLines(item.capabilities)
  item.scenarios = splitLines(item.scenarios)

  if (item.story?.value) {
    packIndexed(item.story.value, 'left')
    packIndexed(item.story.value, 'right')
  }
  if (item.story?.system) {
    packIndexed(item.story.system, 'upperItems')
    packIndexed(item.story.system, 'lowerItems')
  }
  if (item.story?.howItWorks) ensureArray(item.story.howItWorks, 'stages', 4)
  if (item.story?.scenarios) ensureArray(item.story.scenarios, 'items', 3)
  if (item.story?.closing) ensureArray(item.story.closing, 'softLinks', 2)

  return item
}

function showProductList() {
  const list = document.querySelector('[data-products-list-view]')
  const compose = document.querySelector('[data-products-compose-view]')
  if (list) list.hidden = false
  if (compose) compose.hidden = true
  ctx.state.productComposeIndex = -1
}

export function closeProductCompose() {
  showProductList()
}

function openProductCompose(index) {
  const items = ctx.state.productLibrary?.draftContent?.items || []
  const item = index >= 0 ? structuredClone(items[index]) : emptyProduct()
  ctx.state.productComposeIndex = index
  document.querySelector('[data-products-list-view]').hidden = true
  const compose = document.querySelector('[data-products-compose-view]')
  compose.hidden = false
  const title = compose.querySelector('.admin-news-compose__bar strong')
  if (title) title.textContent = item?.name ? `可视化编辑 · ${item.name}` : '可视化编辑 · 新建产品'
  renderProductCompose(item || emptyProduct())
  window.scrollTo({ top: 0 })
}

async function persistProductLibrary(content, message) {
  const { page } = await ctx.api('/pages/product-library/draft', { method: 'PUT', body: JSON.stringify({ content }) })
  const published = await ctx.api('/pages/product-library/publish', { method: 'POST' })
  ctx.state.productLibrary = published.page || page
  renderProductList(ctx.state.productLibrary.draftContent)
  updateProductStatus(ctx.state.productLibrary)
  if (message) ctx.toast(message)
  return ctx.state.productLibrary
}

export async function loadProductLibrary() {
  try {
    const { page } = await ctx.api('/pages/product-library')
    ctx.state.productLibrary = page
    renderProductList(page.draftContent)
    updateProductStatus(page)
  } catch (error) {
    ctx.toast(error.message, true)
  }
}

export function productLibraryOptions() {
  const items = ctx.state.productLibrary?.draftContent?.items || []
  return [
    ['', '默认（与产品 ID 同名）'],
    ...items.map((item) => [item.id, `${item.name || '未命名'}（${item.slug || item.id}）`]),
  ]
}

async function uploadImageFile(file) {
  const formData = new FormData()
  formData.append('image', file)
  const { url } = await ctx.api('/pages/media/image', { method: 'POST', body: formData })
  return url
}

const ANCHOR_IDS = new Set(['#hpi-value', '#hpi-how', '#hpi-scenes', '#hpi-system', '#hpi-close'])

function isAnchorHref(href) {
  const value = String(href || '').trim()
  return value.startsWith('#') || ANCHOR_IDS.has(value)
}

function syncLinkModalType(composeView) {
  const type = composeView.querySelector('[data-link-type]:checked')?.value || 'anchor'
  const anchorWrap = composeView.querySelector('[data-link-anchor-wrap]')
  const urlWrap = composeView.querySelector('[data-link-url-wrap]')
  if (anchorWrap) anchorWrap.hidden = type !== 'anchor'
  if (urlWrap) urlWrap.hidden = type !== 'url'
}

function openLinkModal(composeView, linkEl) {
  const modal = composeView.querySelector('[data-link-modal]')
  if (!modal || !linkEl) return
  modal.hidden = false
  modal._targetLink = linkEl
  const label = linkEl.querySelector('[data-edit-link-label]')?.textContent?.trim() || ''
  const href = linkEl.dataset.editHref || ''
  const labelInput = modal.querySelector('[data-link-label]')
  const urlInput = modal.querySelector('[data-link-url]')
  const anchorSelect = modal.querySelector('[data-link-anchor]')
  if (labelInput) labelInput.value = label
  const useAnchor = isAnchorHref(href)
  modal.querySelectorAll('[data-link-type]').forEach((input) => {
    input.checked = input.value === (useAnchor ? 'anchor' : 'url')
  })
  if (useAnchor) {
    const normalized = href.startsWith('#') ? href : `#${href.replace(/^#/, '')}`
    if (anchorSelect) {
      if (![...anchorSelect.options].some((opt) => opt.value === normalized)) {
        const option = document.createElement('option')
        option.value = normalized
        option.textContent = `自定义 ${normalized}`
        anchorSelect.appendChild(option)
      }
      anchorSelect.value = normalized
    }
    if (urlInput) urlInput.value = ''
  } else {
    if (urlInput) urlInput.value = href
    if (anchorSelect) anchorSelect.value = '#hpi-how'
  }
  syncLinkModalType(composeView)
  labelInput?.focus()
}

function closeLinkModal(composeView) {
  const modal = composeView.querySelector('[data-link-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetLink = null
}

function saveLinkModal(composeView) {
  const modal = composeView.querySelector('[data-link-modal]')
  const linkEl = modal?._targetLink
  if (!modal || !linkEl) return
  const label = modal.querySelector('[data-link-label]')?.value.trim() || ''
  const type = modal.querySelector('[data-link-type]:checked')?.value || 'anchor'
  let href = ''
  if (type === 'anchor') {
    href = modal.querySelector('[data-link-anchor]')?.value || '#hpi-how'
  } else {
    href = modal.querySelector('[data-link-url]')?.value.trim() || ''
    if (!href) {
      ctx.toast('请填写跳转地址', true)
      return
    }
  }
  const labelNode = linkEl.querySelector('[data-edit-link-label]')
  if (labelNode) labelNode.textContent = label || '链接文案'
  linkEl.dataset.editHref = href
  closeLinkModal(composeView)
  ctx.toast(type === 'anchor' ? '已设为页内锚点' : '已设为跳转链接')
}

export function bindProductLibraryAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const listView = document.querySelector('[data-products-list-view]')
  const composeView = document.querySelector('[data-products-compose-view]')
  if (!listView || !composeView) return

  listView.addEventListener('submit', (event) => event.preventDefault())
  document.querySelector('[data-products-editor]')?.addEventListener('click', async (event) => {
    if (event.target.closest('[data-product-add]')) {
      event.preventDefault()
      openProductCompose(-1)
      return
    }
    const edit = event.target.closest('[data-product-edit]')
    if (edit) {
      event.preventDefault()
      openProductCompose(Number(edit.dataset.productEdit))
      return
    }
    const remove = event.target.closest('[data-product-remove]')
    if (remove) {
      event.preventDefault()
      if (!window.confirm('删除后前台将不再展示该产品详情，确定吗？')) return
      const index = Number(remove.dataset.productRemove)
      const items = [...(ctx.state.productLibrary?.draftContent?.items || [])]
      items.splice(index, 1)
      try {
        await persistProductLibrary({ items }, '产品已删除并发布')
      } catch (error) {
        ctx.toast(error.message, true)
      }
    }
  })

  composeView.addEventListener('click', async (event) => {
    if (event.target.closest('[data-link-modal-close]')) {
      event.preventDefault()
      closeLinkModal(composeView)
      return
    }
    if (event.target.closest('[data-link-modal-save]')) {
      event.preventDefault()
      saveLinkModal(composeView)
      return
    }
    if (event.target.closest('[data-products-compose-back]')) {
      event.preventDefault()
      closeProductCompose()
      return
    }
    if (event.target.closest('[data-products-compose-publish]')) {
      event.preventDefault()
      const button = event.target.closest('[data-products-compose-publish]')
      const article = collectProductFromCompose()
      if (!article.name.trim()) {
        ctx.toast('请填写产品名称', true)
        return
      }
      if (!article.slug.trim()) {
        ctx.toast('请填写详情页标识', true)
        return
      }
      button.disabled = true
      try {
        const items = [...(ctx.state.productLibrary?.draftContent?.items || [])]
        const index = ctx.state.productComposeIndex
        if (!article.id) article.id = article.slug
        if (index >= 0 && items[index]) items[index] = { ...items[index], ...article }
        else items.unshift(article)
        await persistProductLibrary({ items }, '产品详情已发布')
        closeProductCompose()
      } catch (error) {
        ctx.toast(error.message, true)
      } finally {
        button.disabled = false
      }
      return
    }

    const linkBtn = event.target.closest('[data-edit-link]')
    if (linkBtn) {
      event.preventDefault()
      openLinkModal(composeView, linkBtn)
      return
    }

    const imageBtn = event.target.closest('[data-edit-image]')
    if (imageBtn) {
      event.preventDefault()
      const fileInput = composeView.querySelector('[data-product-visual-file]')
      if (!fileInput) return
      fileInput.dataset.targetPath = imageBtn.dataset.editImage
      fileInput.click()
      return
    }

    const link = event.target.closest('.admin-vedit-canvas a')
    if (link) event.preventDefault()
  })

  composeView.addEventListener('change', (event) => {
    if (event.target.closest('[data-link-type]')) {
      syncLinkModalType(composeView)
    }
  })

  composeView.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && composeView.querySelector('[data-link-modal]:not([hidden])')) {
      closeLinkModal(composeView)
      return
    }
    const editable = event.target.closest('[data-edit-path]')
    if (!editable) return
    if (event.key === 'Enter' && !editable.dataset.editMultiline) {
      event.preventDefault()
      editable.blur()
    }
  })

  composeView.addEventListener('input', (event) => {
    const field = event.target.closest('[data-product-field]')
    if (!field) return
    const preview = composeView.querySelector(`[data-product-preview-for="${field.dataset.productField}"]`)
    if (preview) {
      preview.src = field.value.trim()
      preview.hidden = !field.value.trim()
    }
    if (field.dataset.productField === 'name') {
      const crumb = composeView.querySelector('.hpi-hero__crumb')
      if (crumb) {
        const parts = crumb.innerHTML.split(' / ')
        if (parts.length) {
          parts[parts.length - 1] = esc(field.value || '未命名产品')
          crumb.innerHTML = parts.join(' / ')
        }
      }
      const title = composeView.querySelector('.admin-news-compose__bar strong')
      if (title) title.textContent = `可视化编辑 · ${field.value || '未命名产品'}`
    }
  })

  composeView.addEventListener('change', async (event) => {
    if (event.target.closest('[data-link-type]')) return

    const visualFile = event.target.closest('[data-product-visual-file]')
    if (visualFile) {
      const file = visualFile.files?.[0]
      const path = visualFile.dataset.targetPath
      if (!file || !path) return
      visualFile.disabled = true
      try {
        const url = await uploadImageFile(file)
        const canvas = composeView.querySelector('[data-product-visual]')
        const target = canvas?.querySelector(`[data-edit-image="${CSS.escape(path)}"]`) || canvas?.querySelector(`[data-edit-image="${path}"]`)
        if (target) {
          const img = target.querySelector('img')
          if (img) img.src = url
          target.dataset.editImageUrl = url
        }
        if (path.includes('backgroundImage')) {
          const hero = canvas?.querySelector('.hpi-hero')
          if (hero) hero.style.setProperty('--hpi-hero-image', `url('${url}')`)
          const bgBtn = canvas?.querySelector('[data-edit-image="story.hero.backgroundImage"]')
          if (bgBtn) bgBtn.dataset.editImageUrl = url
        }
        ctx.toast('图片已上传')
      } catch (error) {
        ctx.toast(error.message, true)
      } finally {
        visualFile.disabled = false
        visualFile.value = ''
        delete visualFile.dataset.targetPath
      }
      return
    }

    const upload = event.target.closest('[data-product-upload-for]')
    const file = upload?.files?.[0]
    if (!upload || !file) return
    upload.disabled = true
    try {
      const url = await uploadImageFile(file)
      const field = composeView.querySelector(`[data-product-field="${upload.dataset.productUploadFor}"]`)
      if (field) {
        field.value = url
        field.dispatchEvent(new Event('input', { bubbles: true }))
      }
      ctx.toast('图片已上传')
    } catch (error) {
      ctx.toast(error.message, true)
    } finally {
      upload.disabled = false
      upload.value = ''
    }
  })
}
