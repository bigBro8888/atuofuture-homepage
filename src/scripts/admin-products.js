import { HARDWARE_PRODUCTS } from '../data/hardware-catalog.js'

const PRODUCT_OUTLINE = [
  { id: 'basics', no: '01', title: '基础信息', desc: '名称、图片、简介与卖点' },
  { id: 'links', no: '02', title: '列表按钮', desc: '查看详情与方案链接' },
  { id: 'hardware', no: '03', title: '关联智能硬件', desc: '对应硬件库里的产品' },
  { id: 'hero', no: '04', title: '详情首屏', desc: '标题、背景与设备图' },
  { id: 'value', no: '05', title: '价值说明', desc: '左右能力与中心图' },
  { id: 'how', no: '06', title: '如何工作', desc: '四步流程' },
  { id: 'scenes', no: '07', title: '应用场景', desc: '三组场景图文' },
  { id: 'system', no: '08', title: '系统位置', desc: '上下层与方案链接' },
  { id: 'closing', no: '09', title: '收尾预约', desc: '底部行动按钮' },
]

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
      <p class="admin-form-section__hint" style="margin:0">这里编辑产品详情页。智能硬件页再选择关联哪一条，前台「查看产品详情」就会跳过来。</p>
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

function showProductSection(id) {
  if (!PRODUCT_OUTLINE.some((item) => item.id === id)) id = 'basics'
  ctx.state.productSection = id
  document.querySelectorAll('[data-product-goto]').forEach((button) => button.classList.toggle('is-active', button.dataset.productGoto === id))
  document.querySelectorAll('[data-product-section]').forEach((section) => {
    section.hidden = section.dataset.productSection !== id
  })
}

function renderProductCompose(item) {
  const story = item.story || emptyProduct().story
  const hero = story.hero || {}
  const value = story.value || {}
  const how = story.howItWorks || {}
  const scenes = story.scenarios || {}
  const system = story.system || {}
  const closing = story.closing || {}
  const stages = [...(how.stages || []), {}, {}, {}, {}].slice(0, 4)
  const sceneItems = [...(scenes.items || []), {}, {}, {}].slice(0, 3)
  const linked = new Set(item.linkedHardwareIds || [])
  const body = document.querySelector('[data-products-compose-body]')
  if (!body) return
  body.innerHTML = `
    <div class="admin-home-editor admin-product-editor">
      <aside class="admin-home-outline">
        <p>按详情页从上到下编辑</p>
        ${PRODUCT_OUTLINE.map((entry) => `
          <button type="button" class="admin-home-outline__item${entry.id === (ctx.state.productSection || 'basics') ? ' is-active' : ''}" data-product-goto="${entry.id}">
            <em>${entry.no}</em>
            <span><b>${entry.title}</b><small>${entry.desc}</small></span>
          </button>`).join('')}
      </aside>
      <div class="admin-home-stage">
        <fieldset data-product-section="basics">
          <legend>基础信息</legend>
          <p class="admin-form-section__hint">这些字段同时用于产品详情页，以及硬件列表里关联后的名称、图片和卖点。</p>
          <input type="hidden" data-product-field="id" value="${esc(item.id || '')}" />
          <div class="admin-form-grid">
            ${productField('name', '产品名称', item.name, { wide: true, placeholder: '例如 中控屏' })}
            ${productField('slug', '详情页标识', item.slug, { placeholder: 'control-screen', help: '出现在 /hardware/product/?id= 后面' })}
            ${productField('tag', '列表标签', item.tag, { placeholder: '旗舰产品' })}
            ${productField('hardwareLine', '所属产品线', item.hardwareLine || 'space', { type: 'select', options: LINE_OPTIONS })}
            ${productField('coverImage', '产品图片', item.coverImage, { image: true, wide: true, size: '1200×900' })}
            ${productField('shortDescription', '一句话简介', item.shortDescription, { type: 'textarea', wide: true, rows: 2 })}
            ${productField('fullDescription', '详细介绍', item.fullDescription, { type: 'textarea', wide: true, rows: 3 })}
            ${productField('capabilities', '能力卖点', lines(item.capabilities), { type: 'textarea', wide: true, rows: 3, placeholder: '每行一条，例如：场景一键执行' })}
            ${productField('scenarios', '适用场景', lines(item.scenarios), { type: 'textarea', wide: true, rows: 2, placeholder: '每行一条' })}
            <label class="admin-news-pin admin-form-wide">
              <input data-product-field="published" type="checkbox"${item.published !== false ? ' checked' : ''} />
              <span><b>发布后前台可见</b><small>取消勾选则详情页不对外展示。</small></span>
            </label>
          </div>
        </fieldset>
        <fieldset data-product-section="links">
          <legend>列表按钮</legend>
          <p class="admin-form-section__hint">对应智能硬件页红框里的两个入口。关联到该产品后即可生效，也可在智能硬件页再单独改。</p>
          <div class="admin-form-grid">
            ${productField('detailCtaLabel', '详情按钮文案', item.detailCtaLabel || '查看产品详情')}
            ${productField('solutionLabel', '方案链接文案', item.solutionLabel || '')}
            ${productField('solutionHref', '方案链接地址', item.solutionHref || '', { wide: true, placeholder: '/solutions/' })}
          </div>
        </fieldset>
        <fieldset data-product-section="hardware">
          <legend>关联智能硬件</legend>
          <p class="admin-form-section__hint">勾选后，硬件列表里对应产品会默认跳到本详情页。也可反过来在「智能硬件」里下拉选择。</p>
          <div class="admin-product-links">
            ${HARDWARE_PRODUCTS.map((product) => `
              <label>
                <input type="checkbox" data-product-link="${esc(product.id)}"${linked.has(product.id) ? ' checked' : ''} />
                <span><b>${esc(product.name)}</b><small>${esc(product.id)}</small></span>
              </label>`).join('')}
          </div>
        </fieldset>
        <fieldset data-product-section="hero">
          <legend>详情首屏</legend>
          <div class="admin-form-grid">
            ${productField('story.hero.title', '主标题', hero.title, { wide: true })}
            ${productField('story.hero.headline', '副标题', hero.headline, { wide: true })}
            ${productField('story.hero.description', '说明', hero.description, { type: 'textarea', wide: true, rows: 3 })}
            ${productField('story.hero.ctaLabel', '首屏按钮文案', hero.ctaLabel || '查看它如何工作')}
            ${productField('story.hero.ctaHref', '首屏按钮链接', hero.ctaHref || '#hpi-how')}
            ${productField('story.hero.backgroundImage', '背景图', hero.backgroundImage, { image: true, wide: true, size: '1920×1080' })}
            ${productField('story.hero.deviceImage', '设备图', hero.deviceImage, { image: true, wide: true, size: '800×640' })}
          </div>
        </fieldset>
        <fieldset data-product-section="value">
          <legend>价值说明</legend>
          <div class="admin-form-grid">
            ${productField('story.value.title', '标题', value.title, { wide: true })}
            ${productField('story.value.deviceImage', '中心设备图', value.deviceImage, { image: true, wide: true, size: '640×480' })}
            ${productField('story.value.left', '左侧能力', lines(value.left), { type: 'textarea', rows: 4, placeholder: '每行一条' })}
            ${productField('story.value.right', '右侧能力', lines(value.right), { type: 'textarea', rows: 4, placeholder: '每行一条' })}
            ${productField('story.value.footer', '底部说明', value.footer, { type: 'textarea', wide: true, rows: 2 })}
          </div>
        </fieldset>
        <fieldset data-product-section="how">
          <legend>如何工作</legend>
          <div class="admin-form-grid">
            ${productField('story.howItWorks.title', '标题', how.title, { wide: true })}
            ${stages.map((stage, index) => `
              <div class="admin-product-card admin-form-wide">
                <h4>第 ${index + 1} 步</h4>
                <div class="admin-form-grid">
                  ${productField(`story.howItWorks.stages.${index}.title`, '步骤名', stage.title || '')}
                  ${productField(`story.howItWorks.stages.${index}.caption`, '说明', stage.caption || '')}
                  ${productField(`story.howItWorks.stages.${index}.image`, '配图', stage.image || '', { image: true, wide: true, size: '560×360' })}
                </div>
              </div>`).join('')}
          </div>
        </fieldset>
        <fieldset data-product-section="scenes">
          <legend>应用场景</legend>
          <div class="admin-form-grid">
            ${productField('story.scenarios.title', '标题', scenes.title, { wide: true })}
            ${sceneItems.map((scene, index) => `
              <div class="admin-product-card admin-form-wide">
                <h4>场景 ${index + 1}</h4>
                <div class="admin-form-grid">
                  ${productField(`story.scenarios.items.${index}.title`, '名称', scene.title || '')}
                  ${productField(`story.scenarios.items.${index}.desc`, '说明', scene.desc || '', { type: 'textarea', rows: 2, wide: true })}
                  ${productField(`story.scenarios.items.${index}.sceneImage`, '场景图', scene.sceneImage || '', { image: true, wide: true, size: '1200×700' })}
                  ${productField(`story.scenarios.items.${index}.deviceImage`, '设备图', scene.deviceImage || '', { image: true, wide: true, size: '640×480' })}
                </div>
              </div>`).join('')}
          </div>
        </fieldset>
        <fieldset data-product-section="system">
          <legend>系统位置</legend>
          <div class="admin-form-grid">
            ${productField('story.system.title', '标题', system.title, { wide: true })}
            ${productField('story.system.upperLabel', '上层标签', system.upperLabel)}
            ${productField('story.system.upperItems', '上层能力', lines(system.upperItems), { type: 'textarea', rows: 3, placeholder: '每行一条' })}
            ${productField('story.system.middleLabel', '中间层说明', system.middleLabel, { wide: true })}
            ${productField('story.system.middleImage', '中间层图片', system.middleImage, { image: true, wide: true, size: '560×400' })}
            ${productField('story.system.lowerItems', '下层设备', lines(system.lowerItems), { type: 'textarea', rows: 3, placeholder: '每行一条' })}
            ${productField('story.system.aspaceLabel', '方案链接文案', system.aspaceLabel)}
            ${productField('story.system.aspaceHref', '方案链接地址', system.aspaceHref, { wide: true })}
          </div>
        </fieldset>
        <fieldset data-product-section="closing">
          <legend>收尾预约</legend>
          <div class="admin-form-grid">
            ${productField('story.closing.title', '标题', closing.title, { wide: true })}
            ${productField('story.closing.desc', '说明', closing.desc, { type: 'textarea', wide: true, rows: 2 })}
            ${productField('story.closing.primaryLabel', '主按钮文案', closing.primaryLabel || '预约方案演示')}
            ${productField('story.closing.softLinks.0.label', '辅助链接 1', closing.softLinks?.[0]?.label || '')}
            ${productField('story.closing.softLinks.1.label', '辅助链接 2', closing.softLinks?.[1]?.label || '')}
          </div>
        </fieldset>
      </div>
    </div>`
  showProductSection(ctx.state.productSection || 'basics')
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

function collectProductFromCompose() {
  const root = document.querySelector('[data-products-compose-view]')
  const item = emptyProduct()
  root.querySelectorAll('[data-product-field]').forEach((field) => {
    const path = field.dataset.productField
    const value = field.type === 'checkbox' ? field.checked : field.value
    setNested(item, path, value)
  })
  item.linkedHardwareIds = [...root.querySelectorAll('[data-product-link]:checked')].map((input) => input.dataset.productLink)
  item.capabilities = item.capabilities || ''
  item.scenarios = item.scenarios || ''
  if (item.story?.value) {
    item.story.value.left = item.story.value.left || ''
    item.story.value.right = item.story.value.right || ''
  }
  if (item.story?.system) {
    item.story.system.upperItems = item.story.system.upperItems || ''
    item.story.system.lowerItems = item.story.system.lowerItems || ''
  }
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
  const item = index >= 0 ? items[index] : emptyProduct()
  ctx.state.productComposeIndex = index
  ctx.state.productSection = 'basics'
  document.querySelector('[data-products-list-view]').hidden = true
  const compose = document.querySelector('[data-products-compose-view]')
  compose.hidden = false
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
    const jump = event.target.closest('[data-product-goto]')
    if (jump) {
      event.preventDefault()
      showProductSection(jump.dataset.productGoto)
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
      button.disabled = true
      try {
        const items = [...(ctx.state.productLibrary?.draftContent?.items || [])]
        const index = ctx.state.productComposeIndex
        if (index >= 0 && items[index]) items[index] = { ...items[index], ...article }
        else items.unshift(article)
        await persistProductLibrary({ items }, '产品详情已发布')
        closeProductCompose()
      } catch (error) {
        ctx.toast(error.message, true)
      } finally {
        button.disabled = false
      }
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
  })

  composeView.addEventListener('change', async (event) => {
    const upload = event.target.closest('[data-product-upload-for]')
    const file = upload?.files?.[0]
    if (!upload || !file) return
    upload.disabled = true
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { url } = await ctx.api('/pages/media/image', { method: 'POST', body: formData })
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
