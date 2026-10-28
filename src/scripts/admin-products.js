import { HARDWARE_PRODUCTS, getLine } from '../data/hardware-catalog.js'
import { parseProductBulletsText } from '../lib/parse-product-bullets.js'
import {
  MAX_PRODUCT_SPEC_ROWS,
  mergeProductSpecRows,
  parseProductSpecsText,
} from '../lib/parse-product-specs.js'
import { bindProductStoryTabs, renderProductStory } from '../lib/product-story-render.js'

const IMAGE_SIZE_GUIDE = [
  { test: (path) => path === 'story.showcase.image', label: '产品主视觉图', size: '960×720', tip: '兼容旧字段；主图框 4:3，优先用下方 5 张商品轮播图' },
  { test: (path) => /story\.showcase\.gallery\.\d+\.url/.test(path), label: '商品轮播图', size: '960×720', tip: '主图框 4:3（约 480×360 展示），最多 5 张，建议同比例白底图' },
  { test: (path) => path === 'story.value.diagramImage' || path === 'story.value.deviceImage', label: '原理链路图', size: '1760×900', tip: '整段单图铺满内容宽，标题与说明可设计进图内' },
  { test: (path) => /story\.howItWorks\.stages\.\d+\.image/.test(path), label: '如何工作步骤图', size: '560×360', tip: '四步流程配图，尺寸尽量统一' },
  { test: (path) => /story\.scenarios\.items\.\d+\.sceneImage/.test(path), label: '场景介绍配图', size: '860×560', tip: '卡片左侧大图，约占一半宽度' },
  { test: (path) => /story\.scenarios\.items\.\d+\.logoImage/.test(path), label: '场景主图标', size: '128×128', tip: '标题前圆形小 logo，透明底 PNG 更佳' },
  { test: (path) => /story\.scenarios\.items\.\d+\.tags\.\d+\.logoImage/.test(path), label: '能力标签图标', size: '64×64', tip: '底部标签左侧小图标' },
  { test: (path) => /story\.cases\.items\.\d+\.image/.test(path), label: '实际案例图', size: '560×360', tip: '三列卡片顶图，横向构图' },
  { test: (path) => /story\.album\.items\.\d+\.url/.test(path), label: '产品相册实拍', size: '1200×900', tip: '产品真实照片，横向构图更佳' },
  { test: (path) => /story\.detailImages\.items\.\d+\.url/.test(path), label: '商品详情图', size: '1600×1000', tip: '淘宝式详情长图，建议宽度 1600' },
  { test: (path) => path === 'coverImage', label: '列表封面图', size: '1200×900', tip: '商品列表与封面用图' },
]

const LINE_OPTIONS = [
  ['space', '空间智能'],
  ['retail', '新零售与电子纸'],
  ['consumer', '3C 数码'],
]

function resolveImageSizeGuide(path = '') {
  const hit = IMAGE_SIZE_GUIDE.find((item) => item.test(path))
  return hit || { label: '图片', size: '1200×800', tip: '按前台展示比例裁切即可' }
}

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

/** 标签旁可点开的用途备注 */
function fieldLabelNote(label, noteHtml) {
  if (!noteHtml) return `<span>${label}</span>`
  return `<span class="admin-field-label">${label}<details class="admin-field-note"><summary>备注</summary><div class="admin-field-note__body">${noteHtml}</div></details></span>`
}

const PRODUCT_LINE_NOTE = `
  <p>粗分桶：空间智能 / 新零售与电子纸 / 3C 数码。</p>
  <ul>
    <li>全部产品页：卡片上会显示这条产品线小标签</li>
    <li>智能硬件首页：配套硬件默认只捞「空间智能」；3C 区块只捞「3C 数码」</li>
    <li>商品详情页：面包屑归属会用到</li>
  </ul>
  <p>不控制顶栏「智能硬件」下拉，也不控制全部产品页顶部的分类 Tab。</p>`

const PRODUCT_CATEGORY_NOTE = `
  <p>控制前台「全部产品」页顶部的分类页签与筛选。</p>
  <ul>
    <li>点右侧「管理分类」可新增、改名、排序或删除</li>
    <li>可选分类会随上方「所属产品线」过滤</li>
  </ul>
  <p>不控制顶栏「智能硬件」下拉菜单。</p>`

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
  // 带备注时用 div，避免点「备注」时连带激活表单控件
  const tag = options.note ? 'div' : 'label'
  return `<${tag} class="admin-news-field${options.wide ? ' is-wide' : ''}">${fieldLabelNote(label, options.note)}${field}${media}${fieldHint(options)}</${tag}>`
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
    category: '',
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
    releasedAt: '',
    story: {
      hero: { title: '', headline: '', description: '', ctaLabel: '查看它如何工作', ctaHref: '#hpi-how', backgroundImage: '', deviceImage: '' },
      showcase: {
        title: '产品亮点',
        subtitle: '',
        mediaType: 'image',
        image: '',
        gallery: [{ url: '', caption: '' }, { url: '', caption: '' }, { url: '', caption: '' }, { url: '', caption: '' }, { url: '', caption: '' }],
        model3d: { src: '', title: '', poster: '' },
        points: [{ title: '', desc: '' }, { title: '', desc: '' }, { title: '', desc: '' }, { title: '', desc: '' }],
      },
      capabilities: {
        title: '核心能力',
        items: [
          { icon: 'sensors', title: '', desc: '' },
          { icon: 'cloud_upload', title: '', desc: '' },
          { icon: 'notifications_active', title: '', desc: '' },
          { icon: 'bolt', title: '', desc: '' },
        ],
      },
      value: { title: '原理与链路', subtitle: '', diagramImage: '' },
      howItWorks: { title: '', stages: [{}, {}, {}, {}] },
      scenarios: {
        title: '应用场景',
        items: [
          { tags: [{}, {}, {}] },
          { tags: [{}, {}, {}] },
          { tags: [{}, {}, {}] },
        ],
      },
      cases: { title: '实际案例', items: [{}, {}, {}] },
      specs: { title: '产品参数', rows: [{ label: '', value: '' }] },
      album: { title: '产品图拍', items: [] },
      detailImages: { title: '产品详情信息', subtitle: '', items: [] },
      videos: { title: '使用视频', items: [] },
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
  const categories = [...(content.categories || [])]
  const editor = document.querySelector('[data-products-editor]')
  if (!editor) return
  editor.classList.add('admin-news-editor')
  const catsOpen = Boolean(ctx.state.productCatsOpen)
  editor.innerHTML = `
    <div class="admin-news-toolbar">
      <p class="admin-form-section__hint" style="margin:0">点「编辑」进入可视化详情页。列表可用左侧序号或拖拽把手调整顺序，保存后同步前台。</p>
      <div class="admin-news-toolbar__actions">
        <button type="button" class="admin-news-toolbar__link" data-product-cats-toggle>${catsOpen ? '收起分类' : '管理分类'}</button>
        <button type="button" class="admin-add-slide" data-product-add>+ 新建产品</button>
      </div>
    </div>
    <div class="admin-product-cats" data-product-cats-panel ${catsOpen ? '' : 'hidden'}>
      ${renderCategoryManager(categories)}
    </div>
    <div class="admin-home-list" data-products-list>${items.map((item, index) => {
      const category = categories.find((c) => c.id === item.category)
      return `
      <div class="admin-item-row" data-product-index="${index}">
        <button type="button" class="admin-item-row__drag" data-product-drag-handle draggable="true" title="拖拽排序" aria-label="拖拽排序">⋮⋮</button>
        <label class="admin-item-row__sort">
          <span>序号</span>
          <input type="number" min="1" max="${items.length}" step="1" value="${index + 1}" data-product-sort="${index}" title="改成第几位，其余会自动顺延" />
        </label>
        ${item.coverImage ? `<img class="admin-simple-item__thumb" src="${esc(item.coverImage)}" alt="" />` : '<span class="admin-simple-item__thumb is-empty"></span>'}
        <div class="admin-item-row__copy">
          <strong>${esc(item.name || '未命名产品')}</strong>
          <small>${esc(item.slug || '')}${item.tag ? ` · ${esc(item.tag)}` : ''}${category ? ` · ${esc(category.name)}` : ''} · ${(item.linkedHardwareIds || []).length} 个硬件关联${item.published === false ? ' · 未发布' : ''}</small>
        </div>
        <span class="admin-slide-tools">
          <a href="/hardware/product/?id=${encodeURIComponent(item.slug || item.id)}" target="_blank">预览</a>
          <button type="button" data-product-edit="${index}">编辑</button>
          <button type="button" data-product-remove="${index}">删除</button>
        </span>
      </div>`
    }).join('') || '<p class="admin-form-section__hint">还没有产品，先点上面的新建。</p>'}</div>`
  bindProductListDrag(editor)
}

async function moveProductToRank(fromIndex, rawRank) {
  const draft = ctx.state.productLibrary?.draftContent || {}
  const items = [...(draft.items || [])]
  if (!items[fromIndex]) return
  let rank = Math.round(Number(rawRank))
  if (!Number.isFinite(rank)) rank = fromIndex + 1
  rank = Math.min(Math.max(rank, 1), items.length)
  if (rank === fromIndex + 1) {
    const input = document.querySelector(`[data-product-sort="${fromIndex}"]`)
    if (input) input.value = String(fromIndex + 1)
    return
  }
  const next = items.filter((_, index) => index !== fromIndex)
  next.splice(rank - 1, 0, items[fromIndex])
  await persistProductLibrary({ ...draft, items: next }, `已排到第 ${rank} 位，其余已自动顺延`)
}

function bindProductListDrag(editor) {
  const list = editor.querySelector('[data-products-list]')
  if (!list || list.dataset.dragBound === '1') return
  list.dataset.dragBound = '1'

  let dragIndex = -1

  const clearState = () => {
    list.querySelectorAll('.admin-item-row.is-dragging, .admin-item-row.is-drop-target').forEach((row) => {
      row.classList.remove('is-dragging', 'is-drop-target')
    })
  }

  list.addEventListener('dragstart', (event) => {
    const handle = event.target.closest('[data-product-drag-handle]')
    if (!handle || !list.contains(handle)) return
    const row = handle.closest('[data-product-index]')
    if (!row) return
    dragIndex = Number(row.dataset.productIndex)
    if (Number.isNaN(dragIndex)) {
      dragIndex = -1
      return
    }
    row.classList.add('is-dragging')
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(dragIndex))
    try {
      event.dataTransfer.setDragImage(row, 24, 24)
    } catch {
      /* ignore */
    }
  })

  list.addEventListener('dragend', () => {
    clearState()
    dragIndex = -1
  })

  list.addEventListener('dragover', (event) => {
    const row = event.target.closest('[data-product-index]')
    if (!row || !list.contains(row) || dragIndex < 0) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    list.querySelectorAll('.admin-item-row.is-drop-target').forEach((el) => {
      if (el !== row) el.classList.remove('is-drop-target')
    })
    row.classList.add('is-drop-target')
  })

  list.addEventListener('dragleave', (event) => {
    const row = event.target.closest('[data-product-index]')
    if (!row) return
    if (event.relatedTarget && row.contains(event.relatedTarget)) return
    row.classList.remove('is-drop-target')
  })

  list.addEventListener('drop', async (event) => {
    event.preventDefault()
    const row = event.target.closest('[data-product-index]')
    clearState()
    if (!row || !list.contains(row) || dragIndex < 0) return
    const toIndex = Number(row.dataset.productIndex)
    if (Number.isNaN(toIndex) || toIndex === dragIndex) return
    try {
      await moveProductToRank(dragIndex, toIndex + 1)
    } catch (error) {
      ctx.toast(error.message, true)
    } finally {
      dragIndex = -1
    }
  })
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

function currentCategories() {
  return [...(ctx.state.productLibrary?.draftContent?.categories || [])]
}

function categoryOptions(lineId, extraValue = '') {
  const categories = currentCategories()
  const filtered = lineId
    ? categories.filter((item) => !item.lineId || item.lineId === lineId)
    : categories
  const source = filtered.length ? filtered : categories
  const options = [['', '未分类']]
  source.forEach((item) => options.push([item.id, item.name]))
  if (extraValue && !options.some(([id]) => id === extraValue)) {
    const hit = categories.find((item) => item.id === extraValue)
    if (hit) options.push([extraValue, hit.name])
  }
  return options
}

function renderCategoryLineOptions(selected = '') {
  return [['', '全部产品线'], ...LINE_OPTIONS]
    .map(([id, name]) => `<option value="${esc(id)}"${String(selected) === String(id) ? ' selected' : ''}>${esc(name)}</option>`)
    .join('')
}

function renderCategoryManager(categories = []) {
  return `
    <p class="admin-form-section__hint" style="margin:0 0 10px">分类会出现在前台「全部产品」页签。改名、排序、新增后会立即发布。</p>
    <div class="admin-product-cats__list" data-product-cats-list>
      ${(categories.length ? categories : []).map((item, index) => `
        <div class="admin-product-cats__row" data-product-cat-row data-product-cat-id="${esc(item.id)}">
          <label>
            <span>分类名称</span>
            <input type="text" maxlength="40" value="${esc(item.name || '')}" data-product-cat-name placeholder="例如 毫米波雷达" />
          </label>
          <label>
            <span>适用产品线</span>
            <select data-product-cat-line>${renderCategoryLineOptions(item.lineId || '')}</select>
          </label>
          <div class="admin-product-cats__tools">
            <button type="button" data-product-cat-move="-1" ${index === 0 ? 'disabled' : ''} title="上移">↑</button>
            <button type="button" data-product-cat-move="1" ${index === categories.length - 1 ? 'disabled' : ''} title="下移">↓</button>
            <button type="button" data-product-cat-remove title="删除分类">删除</button>
          </div>
        </div>`).join('') || '<p class="admin-form-section__hint">还没有分类，点下面添加。</p>'}
    </div>
    <button type="button" class="admin-add-slide" data-product-cat-add>+ 添加分类</button>`
}

function collectCategoriesFrom(root) {
  return [...(root?.querySelectorAll('[data-product-cat-row]') || [])]
    .map((row) => ({
      id: row.dataset.productCatId || '',
      name: row.querySelector('[data-product-cat-name]')?.value.trim() || '',
      lineId: row.querySelector('[data-product-cat-line]')?.value.trim() || '',
    }))
    .filter((item) => item.name)
}

async function persistCategories(next, message) {
  const draft = ctx.state.productLibrary?.draftContent || {}
  await persistProductLibrary({ ...draft, categories: next }, message)
}

function refreshComposeCategorySelect(composeView, selected) {
  if (!composeView) return
  const select = composeView.querySelector('[data-product-field="category"]')
  if (!select) return
  const lineId = composeView.querySelector('[data-product-field="hardwareLine"]')?.value || 'space'
  const value = selected !== undefined ? selected : select.value
  const options = categoryOptions(lineId, value)
  select.innerHTML = options.map(([key, text]) => `<option value="${esc(key)}"${String(value) === String(key) ? ' selected' : ''}>${esc(text)}</option>`).join('')
}

function openProductCatsModal(composeView) {
  const modal = composeView.querySelector('[data-product-cats-modal]')
  if (!modal) return
  const body = modal.querySelector('[data-product-cats-modal-body]')
  if (body) body.innerHTML = renderCategoryManager(currentCategories())
  modal.hidden = false
}

function closeProductCatsModal(composeView) {
  const modal = composeView.querySelector('[data-product-cats-modal]')
  if (modal) modal.hidden = true
}

function categoryManagerRoot(event, scope) {
  return event.target.closest('[data-product-cats-panel], [data-product-cats-modal-body]') || scope?.querySelector?.('[data-product-cats-panel], [data-product-cats-modal-body]')
}

async function handleProductCategoryClick(event, scope) {
  const add = event.target.closest('[data-product-cat-add]')
  const remove = event.target.closest('[data-product-cat-remove]')
  const move = event.target.closest('[data-product-cat-move]')
  if (!add && !remove && !move) return false
  event.preventDefault()
  const root = categoryManagerRoot(event, scope)
  if (!root) return true
  let next = collectCategoriesFrom(root)
  if (add) {
    if (next.length >= 24) {
      ctx.toast('最多 24 个分类', true)
      return true
    }
    next.push({ id: '', name: '新分类', lineId: '' })
    ctx.state.productCatsOpen = true
    try {
      await persistCategories(next, '已添加分类')
      refreshAfterCategorySave(scope)
    } catch (error) {
      ctx.toast(error.message, true)
    }
    return true
  }
  if (remove) {
    const row = remove.closest('[data-product-cat-row]')
    const id = row?.dataset.productCatId || ''
    const name = row?.querySelector('[data-product-cat-name]')?.value.trim() || '该分类'
    const used = (ctx.state.productLibrary?.draftContent?.items || []).filter((item) => item.category === id).length
    const extra = used ? ` 当前有 ${used} 个商品使用它，删除后这些商品会变成未分类。` : ''
    if (!window.confirm(`确定删除分类「${name}」吗？${extra}`)) return true
    next = next.filter((item) => item.id !== id)
    const draft = ctx.state.productLibrary?.draftContent || {}
    const items = (draft.items || []).map((item) => (item.category === id ? { ...item, category: '' } : item))
    try {
      await persistProductLibrary({ ...draft, categories: next, items }, '分类已删除')
      refreshAfterCategorySave(scope)
    } catch (error) {
      ctx.toast(error.message, true)
    }
    return true
  }
  if (move) {
    const row = move.closest('[data-product-cat-row]')
    const id = row?.dataset.productCatId || ''
    const index = next.findIndex((item) => item.id === id)
    const target = index + Number(move.dataset.productCatMove)
    if (index < 0 || target < 0 || target >= next.length) return true
    const [cat] = next.splice(index, 1)
    next.splice(target, 0, cat)
    try {
      await persistCategories(next, '分类顺序已更新')
      refreshAfterCategorySave(scope)
    } catch (error) {
      ctx.toast(error.message, true)
    }
    return true
  }
  return false
}

async function handleProductCategoryChange(event, scope) {
  const name = event.target.closest('[data-product-cat-name]')
  const line = event.target.closest('[data-product-cat-line]')
  if (!name && !line) return false
  const root = categoryManagerRoot(event, scope)
  if (!root) return true
  const next = collectCategoriesFrom(root)
  if (!next.length && currentCategories().length) {
    ctx.toast('分类名称不能为空', true)
    return true
  }
  try {
    await persistCategories(next, '分类已更新')
    refreshAfterCategorySave(scope)
  } catch (error) {
    ctx.toast(error.message, true)
  }
  return true
}

function refreshAfterCategorySave(scope) {
  const compose = document.querySelector('[data-products-compose-view]')
  if (compose && !compose.hidden) {
    const modal = compose.querySelector('[data-product-cats-modal]')
    const body = modal?.querySelector('[data-product-cats-modal-body]')
    if (modal && !modal.hidden && body) body.innerHTML = renderCategoryManager(currentCategories())
    refreshComposeCategorySelect(compose)
  }
  void scope
}

function renderBasicsBar(item) {
  const linked = new Set(item.linkedHardwareIds || [])
  return `
    <details class="admin-vedit-basics" open>
      <summary>
        <strong>基础设置</strong>
        <span>名称、分类、封面；日常改商品主要填这里</span>
      </summary>
      <div class="admin-vedit-basics__body">
        <input type="hidden" data-product-field="id" value="${esc(item.id || '')}" />
        <div class="admin-form-grid">
          ${productField('name', '产品名称', item.name, { wide: true, placeholder: '例如 智能门锁' })}
          ${productField('hardwareLine', '所属产品线', item.hardwareLine || 'space', {
            type: 'select',
            options: LINE_OPTIONS,
            note: PRODUCT_LINE_NOTE,
          })}
          <div class="admin-news-field">
            ${fieldLabelNote('商品分类', PRODUCT_CATEGORY_NOTE)}
            <div class="admin-product-cat-field">
              <select data-product-field="category">
                ${categoryOptions(item.hardwareLine || 'space', item.category || '').map(([key, text]) => `<option value="${esc(key)}"${String(item.category || '') === String(key) ? ' selected' : ''}>${esc(text)}</option>`).join('')}
              </select>
              <button type="button" class="admin-news-toolbar__link" data-product-cats-open>管理分类</button>
            </div>
          </div>
          ${productField('coverImage', '列表封面图', item.coverImage, {
            image: true,
            wide: true,
            size: '1200×900',
            help: '出现在「全部产品」列表卡片上',
          })}
          ${productField('shortDescription', '列表简介', item.shortDescription, {
            type: 'textarea',
            wide: true,
            rows: 2,
            placeholder: '一句话说明这个产品是干什么的',
            help: '出现在「全部产品」卡片标题下方；不填则卡片无简介',
          })}
          ${productField('releasedAt', '上架时间', item.releasedAt || '', {
            placeholder: '2026-09-10',
            help: '仅智能硬件首页「按上架时间自动」展示时用到，格式 YYYY-MM-DD',
          })}
          <label class="admin-news-pin admin-form-wide">
            <input data-product-field="published" type="checkbox"${item.published !== false ? ' checked' : ''} />
            <span><b>发布后前台可见</b><small>取消勾选则详情页与全部产品列表都不展示。</small></span>
          </label>
        </div>

        <details class="admin-vedit-advanced">
          <summary>高级设置（一般不用改）</summary>
          <div class="admin-form-grid" style="margin-top:12px">
            ${productField('slug', '详情页网址标识', item.slug, {
              placeholder: 'smart-door-lock',
              help: '出现在地址栏 /hardware/product/?id= 后面；新建时建议用英文短横线，发布后尽量不要改',
            })}
            ${productField('tag', '首页角标（可选）', item.tag, {
              placeholder: '旗舰产品',
              help: '仅智能硬件首页「旗舰」位会显示；普通商品请留空',
            })}
            ${productField('fullDescription', '首页长介绍（可选）', item.fullDescription, {
              type: 'textarea',
              wide: true,
              rows: 2,
              help: '仅智能硬件首页旗舰/零售区块用；详情页正文请在下方预览里直接改',
            })}
            ${productField('capabilities', '首页能力点（可选）', lines(item.capabilities), {
              type: 'textarea',
              wide: true,
              rows: 2,
              placeholder: '每行一条',
              help: '仅智能硬件首页旗舰位展示；详情页能力请在下方预览里改',
            })}
            ${productField('scenarios', '适用场景（可选）', lines(item.scenarios), {
              type: 'textarea',
              wide: true,
              rows: 2,
              placeholder: '每行一条',
              help: '备用字段，当前前台详情页不直接展示',
            })}
            ${productField('detailCtaLabel', '首页「查看详情」文案', item.detailCtaLabel || '查看产品详情', {
              help: '智能硬件首页卡片按钮文字',
            })}
            ${productField('solutionLabel', '方案链接文案', item.solutionLabel || '')}
            ${productField('solutionHref', '方案链接地址', item.solutionHref || '', { wide: true, placeholder: '/solutions/' })}
          </div>
          <div class="admin-product-links">
            <p class="admin-form-section__hint">关联静态硬件目录：勾选后，硬件首页对应产品会跳到本详情页。</p>
            ${HARDWARE_PRODUCTS.map((product) => `
              <label>
                <input type="checkbox" data-product-link="${esc(product.id)}"${linked.has(product.id) ? ' checked' : ''} />
                <span><b>${esc(product.name)}</b><small>${esc(product.id)}</small></span>
              </label>`).join('')}
          </div>
        </details>
      </div>
    </details>`
}

function renderProductCompose(item) {
  const body = document.querySelector('[data-products-compose-body]')
  if (!body) return
  const product = previewProduct(item)
  const line = getLine(product.productLine)
  const story = item.story || emptyProduct().story
  const activeTab =
    body.querySelector('[data-hpi-tab].is-active')?.dataset.hpiTab ||
    body.querySelector('[data-hpi-panel].is-active')?.dataset.hpiPanel ||
    'overview'
  body.innerHTML = `
    <div class="admin-vedit">
      ${renderBasicsBar(item)}
      <div class="admin-vedit-hint">详情页正文请在下方预览里直接改（点文字/图片即可）。上方基础设置只管名称、分类和列表封面。</div>
      <div class="admin-vedit-canvas" data-product-visual>
        ${renderProductStory(product, story, line, { editable: true, activeTab })}
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
                <option value="#hpi-detail">产品详情信息</option>
                <option value="#hpi-cases">实际案例</option>
                <option value="#hpi-specs">产品参数</option>
                <option value="#hpi-album">产品图拍</option>
                <option value="#hpi-videos">使用视频</option>
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
      <div class="admin-link-modal" data-image-modal hidden>
        <div class="admin-link-modal__backdrop" data-image-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-image-modal-title">
          <header>
            <h3 id="admin-image-modal-title">更换图片</h3>
            <button type="button" data-image-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <div class="admin-image-modal__size" data-image-modal-size>
              <strong data-image-modal-size-label>建议尺寸</strong>
              <em data-image-modal-size-value>1200×800</em>
              <span data-image-modal-size-tip>上传前请按建议尺寸准备素材</span>
            </div>
            <div class="admin-image-modal__preview">
              <img data-image-modal-preview src="" alt="" hidden />
              <span data-image-modal-empty>暂无预览</span>
            </div>
            <label class="admin-news-field is-wide">
              <span>图片链接</span>
              <input type="text" data-image-modal-url placeholder="/images/... 或 https://..." />
            </label>
            <div class="admin-image-modal__or">或</div>
            <label class="admin-image-modal__upload">
              上传本地图片
              <input type="file" accept="image/jpeg,image/png,image/webp" data-image-modal-file />
            </label>
            <p class="admin-form-section__hint" style="margin:0">可填链接、上传本地，或留空不显示图片。</p>
          </div>
          <footer>
            <button type="button" data-image-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-image-modal-save>确定</button>
          </footer>
        </div>
      </div>
      <div class="admin-link-modal" data-product-cats-modal hidden>
        <div class="admin-link-modal__backdrop" data-product-cats-modal-close></div>
        <div class="admin-link-modal__panel admin-product-cats-modal" role="dialog" aria-modal="true" aria-labelledby="admin-product-cats-title">
          <header>
            <h3 id="admin-product-cats-title">管理商品分类</h3>
            <button type="button" data-product-cats-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body" data-product-cats-modal-body></div>
          <footer>
            <button type="button" data-product-cats-modal-close>完成</button>
          </footer>
        </div>
      </div>
    </div>`
  bindProductStoryTabs(body)
  bindGalleryThumbReorder(body)
}

function reorderGallerySlots(gallery, fromIndex, toIndex) {
  const next = (Array.isArray(gallery) ? gallery : []).slice(0, 5).map((entry) => ({
    url: String(typeof entry === 'string' ? entry : entry?.url || '').trim(),
    caption: String(typeof entry === 'string' ? '' : entry?.caption || '').trim(),
  }))
  while (next.length < 5) next.push({ url: '', caption: '' })
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= next.length || toIndex >= next.length || fromIndex === toIndex) {
    return next
  }
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

function bindGalleryThumbReorder(root) {
  const thumbsHost = root.querySelector('.hpi--editable [data-hpi-gallery] .hpi-gallery__thumbs')
  if (!thumbsHost || thumbsHost.dataset.reorderBound === '1') return
  thumbsHost.dataset.reorderBound = '1'

  let dragIndex = -1
  let didReorderDrag = false

  const clearDropState = () => {
    thumbsHost.querySelectorAll('.hpi-gallery__thumb.is-drop-target, .hpi-gallery__thumb.is-dragging').forEach((el) => {
      el.classList.remove('is-drop-target', 'is-dragging')
    })
  }

  thumbsHost.addEventListener('dragstart', (event) => {
    const thumb = event.target.closest('[data-hpi-gallery-thumb]')
    if (!thumb || !thumbsHost.contains(thumb)) return
    dragIndex = Number(thumb.dataset.hpiGalleryThumb)
    if (Number.isNaN(dragIndex)) {
      dragIndex = -1
      return
    }
    didReorderDrag = false
    thumb.classList.add('is-dragging')
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(dragIndex))
    try {
      event.dataTransfer.setDragImage(thumb, 28, 28)
    } catch {
      /* ignore */
    }
  })

  thumbsHost.addEventListener('dragend', () => {
    clearDropState()
    dragIndex = -1
    // 避免拖拽结束后误触发「更换图片」点击
    if (didReorderDrag) {
      window.setTimeout(() => {
        didReorderDrag = false
      }, 0)
    }
  })

  thumbsHost.addEventListener('dragover', (event) => {
    const thumb = event.target.closest('[data-hpi-gallery-thumb]')
    if (!thumb || !thumbsHost.contains(thumb) || dragIndex < 0) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    thumbsHost.querySelectorAll('.hpi-gallery__thumb.is-drop-target').forEach((el) => {
      if (el !== thumb) el.classList.remove('is-drop-target')
    })
    thumb.classList.add('is-drop-target')
  })

  thumbsHost.addEventListener('dragleave', (event) => {
    const thumb = event.target.closest('[data-hpi-gallery-thumb]')
    if (!thumb) return
    if (event.relatedTarget && thumb.contains(event.relatedTarget)) return
    thumb.classList.remove('is-drop-target')
  })

  thumbsHost.addEventListener('drop', (event) => {
    event.preventDefault()
    const thumb = event.target.closest('[data-hpi-gallery-thumb]')
    clearDropState()
    if (!thumb || !thumbsHost.contains(thumb) || dragIndex < 0) return
    const toIndex = Number(thumb.dataset.hpiGalleryThumb)
    if (Number.isNaN(toIndex) || toIndex === dragIndex) return
    didReorderDrag = true
    const article = collectProductFromCompose()
    if (!article.story) article.story = emptyProduct().story
    if (!article.story.showcase || typeof article.story.showcase !== 'object') {
      article.story.showcase = { title: '产品亮点', subtitle: '', mediaType: 'image', image: '', gallery: [], points: [] }
    }
    const gallery = reorderGallerySlots(article.story.showcase.gallery, dragIndex, toIndex)
    article.story.showcase.gallery = gallery
    article.story.showcase.image = gallery.find((item) => item.url)?.url || ''
    renderProductCompose(article)
    ctx.toast('图片顺序已更新')
  })

  // 供点击换图逻辑查询：刚完成拖拽则忽略本次 click
  thumbsHost._galleryJustReordered = () => didReorderDrag
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
  // 单行字段去掉 contenteditable 残留换行，避免卖点标题/说明被拆到两行
  return (el.innerText || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeSingleLineEditable(el) {
  if (!el || el.dataset.editMultiline === 'true') return
  const text = readEditableText(el)
  if (el.innerText.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() === text && !el.querySelector('br, div, p')) {
    return
  }
  el.textContent = text
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

function normalizeAlbumItems(item) {
  if (!item.story) item.story = {}
  const album = item.story.album && typeof item.story.album === 'object' ? item.story.album : {}
  const raw = album.items
  let items = []
  if (Array.isArray(raw)) {
    items = raw
  } else if (raw && typeof raw === 'object') {
    items = Object.keys(raw)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => raw[key] || {})
  }
  item.story.album = {
    title: album.title || '产品图拍',
    items: items.slice(0, 12).map((entry) => ({
      url: String(entry?.url || '').trim(),
      caption: String(entry?.caption || '').trim(),
    })),
  }
}

function normalizeDetailImages(item) {
  if (!item.story) item.story = {}
  const block = item.story.detailImages && typeof item.story.detailImages === 'object' ? item.story.detailImages : {}
  const raw = block.items
  let items = []
  if (Array.isArray(raw)) {
    items = raw
  } else if (raw && typeof raw === 'object') {
    items = Object.keys(raw)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => raw[key] || {})
  }
  item.story.detailImages = {
    title: block.title || '细节图',
    subtitle: String(block.subtitle || '').trim(),
    items: items.slice(0, 12).map((entry) => ({
      url: String(entry?.url || '').trim(),
      caption: String(entry?.caption || '').trim(),
    })),
  }
}

function normalizeSpecs(item) {
  if (!item.story) item.story = {}
  const block = item.story.specs && typeof item.story.specs === 'object' ? item.story.specs : {}
  const raw = block.rows
  let rows = []
  if (Array.isArray(raw)) {
    rows = raw
  } else if (raw && typeof raw === 'object') {
    rows = Object.keys(raw)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => raw[key] || {})
  }
  item.story.specs = {
    title: block.title || '产品参数',
    rows: rows.slice(0, MAX_PRODUCT_SPEC_ROWS).map((entry) => ({
      label: String(entry?.label || '').trim(),
      value: String(entry?.value || '').trim(),
    })),
  }
}

function normalizeVideos(item) {
  if (!item.story) item.story = {}
  const block = item.story.videos && typeof item.story.videos === 'object' ? item.story.videos : {}
  const raw = block.items
  let items = []
  if (Array.isArray(raw)) {
    items = raw
  } else if (raw && typeof raw === 'object') {
    items = Object.keys(raw)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => raw[key] || {})
  }
  item.story.videos = {
    title: block.title || '使用视频',
    items: items.slice(0, 8).map((entry) => ({
      title: String(entry?.title || '').trim(),
      url: String(entry?.url || '').trim(),
      cover: String(entry?.cover || '').trim(),
      caption: String(entry?.caption || '').trim(),
    })),
  }
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
    if (!path) return
    const url = el.dataset.editImageUrl != null
      ? el.dataset.editImageUrl
      : (el.querySelector('img')?.getAttribute('src') || '')
    setNested(item, path, url || '')
  })
  item.linkedHardwareIds = [...root.querySelectorAll('[data-product-link]:checked')].map((input) => input.dataset.productLink)
  const splitLines = (value) =>
    String(value || '')
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
  item.capabilities = splitLines(item.capabilities)
  item.scenarios = splitLines(item.scenarios)

  if (item.story?.value) {
    const diagram =
      item.story.value.diagramImage ||
      item.story.value.deviceImage ||
      ''
    item.story.value = {
      title: String(item.story.value.title || '').trim() || '原理与链路',
      subtitle: String(item.story.value.subtitle || '').trim(),
      diagramImage: diagram,
    }
  }
  if (item.story?.showcase) {
    ensureArray(item.story.showcase, 'points', 4)
    ensureArray(item.story.showcase, 'gallery', 5)
    const model3d = item.story.showcase.model3d && typeof item.story.showcase.model3d === 'object'
      ? item.story.showcase.model3d
      : {}
    const gallery = (item.story.showcase.gallery || [])
      .slice(0, 5)
      .map((entry) => ({
        url: String(typeof entry === 'string' ? entry : entry?.url || '').trim(),
        caption: String(typeof entry === 'string' ? '' : entry?.caption || '').trim(),
      }))
    while (gallery.length < 5) gallery.push({ url: '', caption: '' })
    const image = String(item.story.showcase.image || '').trim() || gallery.find((g) => g.url)?.url || ''
    item.story.showcase = {
      title: String(item.story.showcase.title || '').trim() || '产品亮点',
      subtitle: String(item.story.showcase.subtitle || '').trim(),
      mediaType: 'image',
      image,
      gallery,
      model3d: {
        src: String(model3d.src || '').trim(),
        title: String(model3d.title || '').trim(),
        poster: String(model3d.poster || '').trim(),
      },
      points: (item.story.showcase.points || []).slice(0, 4).map((point) => ({
        title: String(point?.title || '').trim(),
        desc: String(point?.desc || '').trim(),
      })),
    }
  }
  if (item.story?.capabilities) {
    ensureArray(item.story.capabilities, 'items', 4)
    item.story.capabilities = {
      title: String(item.story.capabilities.title || '').trim() || '核心能力',
      items: (item.story.capabilities.items || []).slice(0, 4).map((cap, index) => ({
        icon: String(cap?.icon || ['sensors', 'cloud_upload', 'notifications_active', 'bolt'][index] || 'check_circle').trim(),
        title: String(cap?.title || '')
          .replace(/\s*\n+\s*/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
        desc: String(cap?.desc || '')
          .replace(/\s*\n+\s*/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
      })),
    }
  }
  if (item.story?.cases) ensureArray(item.story.cases, 'items', 3)
  normalizeAlbumItems(item)
  normalizeDetailImages(item)
  normalizeSpecs(item)
  normalizeVideos(item)
  if (item.story?.howItWorks) ensureArray(item.story.howItWorks, 'stages', 4)
  if (item.story?.scenarios) {
    ensureArray(item.story.scenarios, 'items', 3)
    item.story.scenarios.items = (item.story.scenarios.items || []).map((scene) => {
      const next = scene && typeof scene === 'object' ? { ...scene } : {}
      ensureArray(next, 'tags', 3)
      next.tags = (next.tags || []).map((tag) => {
        if (typeof tag === 'string') return { label: tag, icon: '', logoImage: '' }
        if (tag && typeof tag === 'object') {
          return {
            label: String(tag.label || '').trim(),
            icon: String(tag.icon || '').trim(),
            logoImage: String(tag.logoImage || '').trim(),
          }
        }
        return { label: '', icon: '', logoImage: '' }
      })
      while (next.tags.length < 3) next.tags.push({ label: '', icon: '', logoImage: '' })
      next.tags = next.tags.slice(0, 3)
      return next
    })
  }
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

const ANCHOR_IDS = new Set(['#hpi-value', '#hpi-detail', '#hpi-cases', '#hpi-album', '#hpi-specs', '#hpi-videos', '#hpi-close'])

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

function currentImageUrl(imageEl) {
  if (!imageEl) return ''
  if (imageEl.dataset.editImageUrl) return imageEl.dataset.editImageUrl
  const img = imageEl.querySelector('img')
  if (img?.getAttribute('src')) return img.getAttribute('src')
  return ''
}

function setImageModalPreview(modal, url) {
  const preview = modal.querySelector('[data-image-modal-preview]')
  const empty = modal.querySelector('[data-image-modal-empty]')
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

function applyVisualImage(composeView, path, url) {
  if (!path) return
  const canvas = composeView.querySelector('[data-product-visual]')
  const target =
    canvas?.querySelector(`[data-edit-image="${CSS.escape(path)}"]`) ||
    canvas?.querySelector(`[data-edit-image="${path}"]`)
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
        tip.textContent = '更换图片'
        tip.classList.remove('is-visible')
      }
    } else {
      if (img) img.remove()
      target.classList.add('hpi-edit-img--empty')
      let tip = target.querySelector('.hpi-edit-img__tip')
      if (!tip) {
        tip = document.createElement('span')
        tip.className = 'hpi-edit-img__tip is-visible'
        target.appendChild(tip)
      }
      if (tip) {
        tip.textContent = '添加图片'
        tip.classList.add('is-visible')
      }
    }
    const thumb = target.closest('[data-hpi-gallery-thumb]')
    if (thumb) {
      thumb.dataset.src = safeUrl
      const main = canvas?.querySelector('[data-hpi-gallery-main]')
      const mainBox = canvas?.querySelector('.hpi-gallery__main')
      if (thumb.classList.contains('is-active') || !main) {
        if (main && safeUrl) {
          main.src = safeUrl
          main.hidden = false
        } else if (mainBox && safeUrl) {
          mainBox.innerHTML = `<img data-hpi-gallery-main src="${esc(safeUrl)}" alt="" width="960" height="960" />`
        } else if (mainBox && !safeUrl) {
          mainBox.innerHTML = '<span class="hpi-gallery__main-empty">请从下方缩略图添加商品图</span>'
        }
      }
    }
  }
}

function openImageModal(composeView, imageEl) {
  const modal = composeView.querySelector('[data-image-modal]')
  if (!modal || !imageEl) return
  modal.hidden = false
  modal._targetImage = imageEl
  modal._targetPath = imageEl.dataset.editImage || ''
  const guide = resolveImageSizeGuide(modal._targetPath)
  const title = modal.querySelector('#admin-image-modal-title')
  if (title) title.textContent = `更换图片 · ${guide.label}`
  const sizeLabel = modal.querySelector('[data-image-modal-size-label]')
  const sizeValue = modal.querySelector('[data-image-modal-size-value]')
  const sizeTip = modal.querySelector('[data-image-modal-size-tip]')
  if (sizeLabel) sizeLabel.textContent = `${guide.label} · 建议尺寸`
  if (sizeValue) sizeValue.textContent = guide.size
  if (sizeTip) sizeTip.textContent = guide.tip
  const url = currentImageUrl(imageEl)
  const urlInput = modal.querySelector('[data-image-modal-url]')
  if (urlInput) urlInput.value = url
  setImageModalPreview(modal, url)
  urlInput?.focus()
}

function closeImageModal(composeView) {
  const modal = composeView.querySelector('[data-image-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetImage = null
  modal._targetPath = ''
  const fileInput = modal.querySelector('[data-image-modal-file]')
  if (fileInput) fileInput.value = ''
}

function saveImageModal(composeView) {
  const modal = composeView.querySelector('[data-image-modal]')
  if (!modal?._targetPath) return
  const url = modal.querySelector('[data-image-modal-url]')?.value.trim() || ''
  applyVisualImage(composeView, modal._targetPath, url)
  closeImageModal(composeView)
  ctx.toast(url ? '图片已更新' : '已清除图片')
}

function slugifyProductName(name) {
  const raw = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return raw.slice(0, 60) || `product-${Date.now().toString(36)}`
}

export function bindProductLibraryAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const listView = document.querySelector('[data-products-list-view]')
  const composeView = document.querySelector('[data-products-compose-view]')
  if (!listView || !composeView) return

  listView.addEventListener('submit', (event) => event.preventDefault())
  const productsEditor = document.querySelector('[data-products-editor]')
  productsEditor?.addEventListener('click', async (event) => {
    if (event.target.closest('[data-product-drag-handle]')) {
      event.preventDefault()
      return
    }
    if (event.target.closest('[data-product-cats-toggle]')) {
      event.preventDefault()
      ctx.state.productCatsOpen = !ctx.state.productCatsOpen
      renderProductList(ctx.state.productLibrary?.draftContent || { items: [], categories: [] })
      return
    }
    if (event.target.closest('[data-product-add]')) {
      event.preventDefault()
      openProductCompose(-1)
      return
    }
    if (await handleProductCategoryClick(event, productsEditor)) return
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
        await persistProductLibrary({ ...ctx.state.productLibrary?.draftContent, items }, '产品已删除并发布')
      } catch (error) {
        ctx.toast(error.message, true)
      }
    }
  })
  productsEditor?.addEventListener('change', async (event) => {
    if (await handleProductCategoryChange(event, productsEditor)) return
    const input = event.target.closest('[data-product-sort]')
    if (!input) return
    input.disabled = true
    try {
      await moveProductToRank(Number(input.dataset.productSort), input.value)
    } catch (error) {
      ctx.toast(error.message, true)
      renderProductList(ctx.state.productLibrary?.draftContent || { items: [] })
    } finally {
      input.disabled = false
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
    if (event.target.closest('[data-image-modal-close]')) {
      event.preventDefault()
      closeImageModal(composeView)
      return
    }
    if (event.target.closest('[data-image-modal-save]')) {
      event.preventDefault()
      saveImageModal(composeView)
      return
    }
    if (event.target.closest('[data-products-compose-back]')) {
      event.preventDefault()
      closeProductCompose()
      return
    }
    if (event.target.closest('[data-product-cats-open]')) {
      event.preventDefault()
      openProductCatsModal(composeView)
      return
    }
    if (event.target.closest('[data-product-cats-modal-close]')) {
      event.preventDefault()
      closeProductCatsModal(composeView)
      refreshComposeCategorySelect(composeView)
      return
    }
    if (await handleProductCategoryClick(event, composeView)) return
    if (event.target.closest('[data-album-add]')) {
      event.preventDefault()
      const article = collectProductFromCompose()
      normalizeAlbumItems(article)
      if ((article.story.album.items || []).length >= 12) {
        ctx.toast('最多上传 12 张实拍照片', true)
        return
      }
      article.story.album.items.push({ url: '', caption: '' })
      renderProductCompose(article)
      return
    }
    const albumRemove = event.target.closest('[data-album-remove]')
    if (albumRemove) {
      event.preventDefault()
      const index = Number(albumRemove.dataset.albumRemove)
      const article = collectProductFromCompose()
      normalizeAlbumItems(article)
      article.story.album.items.splice(index, 1)
      renderProductCompose(article)
      return
    }
    if (event.target.closest('[data-detail-add]')) {
      event.preventDefault()
      const article = collectProductFromCompose()
      normalizeDetailImages(article)
      if ((article.story.detailImages.items || []).length >= 12) {
        ctx.toast('最多上传 12 张详情图', true)
        return
      }
      article.story.detailImages.items.push({ url: '', caption: '' })
      renderProductCompose(article)
      return
    }
    const detailRemove = event.target.closest('[data-detail-remove]')
    if (detailRemove) {
      event.preventDefault()
      const index = Number(detailRemove.dataset.detailRemove)
      const article = collectProductFromCompose()
      normalizeDetailImages(article)
      article.story.detailImages.items.splice(index, 1)
      renderProductCompose(article)
      return
    }
    if (event.target.closest('[data-bullet-import-toggle]')) {
      event.preventDefault()
      const panel = composeView.querySelector('[data-bullet-import-panel]')
      if (!panel) return
      panel.hidden = !panel.hidden
      if (!panel.hidden) panel.querySelector('[data-bullet-import-text]')?.focus()
      return
    }
    if (event.target.closest('[data-bullet-import-cancel]')) {
      event.preventDefault()
      const panel = composeView.querySelector('[data-bullet-import-panel]')
      if (!panel) return
      panel.hidden = true
      const textarea = panel.querySelector('[data-bullet-import-text]')
      if (textarea) textarea.value = ''
      return
    }
    if (event.target.closest('[data-bullet-remove]')) {
      event.preventDefault()
      const removeBtn = event.target.closest('[data-bullet-remove]')
      const index = Number(removeBtn?.dataset?.bulletRemove)
      if (!Number.isFinite(index) || index < 0) return
      const article = collectProductFromCompose()
      if (!article.story) article.story = {}
      if (!article.story.capabilities || typeof article.story.capabilities !== 'object') {
        article.story.capabilities = { title: '核心能力', items: [] }
      }
      const items = Array.isArray(article.story.capabilities.items)
        ? article.story.capabilities.items.slice()
        : []
      if (!items.length) {
        ctx.toast('当前没有可删除的卖点', true)
        return
      }
      items.splice(index, 1)
      const icons = ['sensors', 'cloud_upload', 'notifications_active', 'bolt']
      article.story.capabilities = {
        title: String(article.story.capabilities.title || '').trim() || '核心能力',
        items: items
          .filter((item) => item && (String(item.title || '').trim() || String(item.desc || '').trim()))
          .slice(0, 4)
          .map((item, i) => ({
            icon: String(item.icon || icons[i] || 'check_circle').trim(),
            title: String(item.title || '').trim(),
            desc: String(item.desc || '').trim(),
          })),
      }
      renderProductCompose(article)
      ctx.toast('已删除该卖点')
      return
    }
    if (event.target.closest('[data-bullet-import-apply]')) {
      event.preventDefault()
      const textarea = composeView.querySelector('[data-bullet-import-text]')
      const panel = composeView.querySelector('[data-bullet-import-panel]')
      const parsed = parseProductBulletsText(textarea?.value || '', { maxRows: 4 })
      if (!parsed.length) {
        ctx.toast('未能解析出卖点，请检查粘贴内容', true)
        return
      }
      const article = collectProductFromCompose()
      if (!article.story) article.story = {}
      if (!article.story.capabilities || typeof article.story.capabilities !== 'object') {
        article.story.capabilities = { title: '核心能力', items: [] }
      }
      const icons = ['sensors', 'cloud_upload', 'notifications_active', 'bolt']
      // 粘贴解析：整表替换，避免旧卖点残留挤掉新条目
      article.story.capabilities = {
        title: String(article.story.capabilities.title || '').trim() || '核心能力',
        items: parsed.map((item, index) => ({
          icon: icons[index] || 'check_circle',
          title: item.title,
          desc: item.desc,
        })),
      }
      renderProductCompose(article)
      if (panel) panel.hidden = true
      if (textarea) textarea.value = ''
      ctx.toast(`已解析并替换为 ${parsed.length} 条卖点`)
      return
    }
    if (event.target.closest('[data-spec-import-toggle]')) {
      event.preventDefault()
      const panel = composeView.querySelector('[data-spec-import-panel]')
      if (!panel) return
      panel.hidden = !panel.hidden
      if (!panel.hidden) panel.querySelector('[data-spec-import-text]')?.focus()
      return
    }
    if (event.target.closest('[data-spec-import-cancel]')) {
      event.preventDefault()
      const panel = composeView.querySelector('[data-spec-import-panel]')
      if (!panel) return
      panel.hidden = true
      const textarea = panel.querySelector('[data-spec-import-text]')
      if (textarea) textarea.value = ''
      return
    }
    if (event.target.closest('[data-spec-import-apply]')) {
      event.preventDefault()
      const textarea = composeView.querySelector('[data-spec-import-text]')
      const raw = textarea?.value || ''
      const parsed = parseProductSpecsText(raw)
      if (!parsed.length) {
        ctx.toast('未能解析出参数，请检查粘贴内容', true)
        return
      }
      const article = collectProductFromCompose()
      normalizeSpecs(article)
      const before = article.story.specs.rows || []
      const beforeKeys = new Set(before.map((row) => String(row.label || '').replace(/\s+/g, '').toLowerCase()).filter(Boolean))
      let updated = 0
      let added = 0
      for (const row of parsed) {
        const key = String(row.label || '').replace(/\s+/g, '').toLowerCase()
        if (!key) continue
        if (beforeKeys.has(key)) updated += 1
        else added += 1
      }
      article.story.specs.rows = mergeProductSpecRows(before, parsed, {
        maxRows: MAX_PRODUCT_SPEC_ROWS,
        preferIncoming: parsed.length >= 3,
      })
      renderProductCompose(article)
      const parts = []
      if (updated) parts.push(`更新 ${updated} 条`)
      if (added) parts.push(`新增 ${added} 条`)
      ctx.toast(
        parsed.length >= 3
          ? `已整表替换为 ${parsed.length} 条参数`
          : parts.length
            ? `已解析：${parts.join('，')}（同名以最新为准）`
            : `已解析并填入 ${parsed.length} 条参数`,
      )
      return
    }
    if (event.target.closest('[data-spec-add]')) {
      event.preventDefault()
      const article = collectProductFromCompose()
      normalizeSpecs(article)
      if ((article.story.specs.rows || []).length >= MAX_PRODUCT_SPEC_ROWS) {
        ctx.toast(`最多添加 ${MAX_PRODUCT_SPEC_ROWS} 条参数`, true)
        return
      }
      article.story.specs.rows.push({ label: '', value: '' })
      renderProductCompose(article)
      return
    }
    if (event.target.closest('[data-spec-clear-all]')) {
      event.preventDefault()
      const article = collectProductFromCompose()
      normalizeSpecs(article)
      const count = (article.story.specs.rows || []).filter(
        (row) => String(row?.label || '').trim() || String(row?.value || '').trim(),
      ).length
      if (!count) {
        ctx.toast('当前没有可删除的参数', true)
        return
      }
      if (!window.confirm(`确定删除全部 ${count} 条产品参数吗？此操作不可撤销（需保存后才会同步到前台）。`)) {
        return
      }
      article.story.specs.rows = [{ label: '', value: '' }]
      renderProductCompose(article)
      ctx.toast(`已清空 ${count} 条参数`)
      return
    }
    const specRemove = event.target.closest('[data-spec-remove]')
    if (specRemove) {
      event.preventDefault()
      const index = Number(specRemove.dataset.specRemove)
      const article = collectProductFromCompose()
      normalizeSpecs(article)
      article.story.specs.rows.splice(index, 1)
      renderProductCompose(article)
      return
    }
    if (event.target.closest('[data-video-add]')) {
      event.preventDefault()
      const article = collectProductFromCompose()
      normalizeVideos(article)
      if ((article.story.videos.items || []).length >= 8) {
        ctx.toast('最多添加 8 个视频', true)
        return
      }
      article.story.videos.items.push({ title: '', url: '', cover: '', caption: '' })
      renderProductCompose(article)
      return
    }
    const videoRemove = event.target.closest('[data-video-remove]')
    if (videoRemove) {
      event.preventDefault()
      const index = Number(videoRemove.dataset.videoRemove)
      const article = collectProductFromCompose()
      normalizeVideos(article)
      article.story.videos.items.splice(index, 1)
      renderProductCompose(article)
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
        article.slug = slugifyProductName(article.name)
      }
      button.disabled = true
      try {
        const items = [...(ctx.state.productLibrary?.draftContent?.items || [])]
        const index = ctx.state.productComposeIndex
        if (!article.id) article.id = article.slug
        if (index >= 0 && items[index]) items[index] = { ...items[index], ...article }
        else items.unshift(article)
        await persistProductLibrary({ ...ctx.state.productLibrary?.draftContent, items }, '产品详情已发布')
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
      const thumbsHost = imageBtn.closest('.hpi-gallery__thumbs')
      if (thumbsHost?._galleryJustReordered?.()) {
        event.preventDefault()
        return
      }
      event.preventDefault()
      openImageModal(composeView, imageBtn)
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
    if (event.key === 'Escape') {
      if (composeView.querySelector('[data-image-modal]:not([hidden])')) {
        closeImageModal(composeView)
        return
      }
      if (composeView.querySelector('[data-link-modal]:not([hidden])')) {
        closeLinkModal(composeView)
        return
      }
      if (composeView.querySelector('[data-product-cats-modal]:not([hidden])')) {
        closeProductCatsModal(composeView)
        return
      }
    }
    const editable = event.target.closest('[data-edit-path]')
    if (!editable) return
    if (event.key === 'Enter' && !editable.dataset.editMultiline) {
      event.preventDefault()
      sanitizeSingleLineEditable(editable)
      editable.blur()
    }
  })

  composeView.addEventListener('paste', (event) => {
    const editable = event.target.closest('[data-edit-path]')
    if (!editable || editable.dataset.editMultiline === 'true') return
    event.preventDefault()
    const text = (event.clipboardData || window.clipboardData)?.getData('text/plain') || ''
    const clean = String(text).replace(/\s*\n+\s*/g, ' ').replace(/\s+/g, ' ').trim()
    document.execCommand('insertText', false, clean)
    sanitizeSingleLineEditable(editable)
  })

  composeView.addEventListener(
    'blur',
    (event) => {
      const editable = event.target.closest?.('[data-edit-path]')
      if (!editable) return
      sanitizeSingleLineEditable(editable)
    },
    true,
  )

  composeView.addEventListener('input', (event) => {
    const imageUrl = event.target.closest('[data-image-modal-url]')
    if (imageUrl) {
      const modal = composeView.querySelector('[data-image-modal]')
      if (modal) setImageModalPreview(modal, imageUrl.value.trim())
      return
    }
    const field = event.target.closest('[data-product-field]')
    if (!field) return
    const preview = composeView.querySelector(`[data-product-preview-for="${field.dataset.productField}"]`)
    if (preview) {
      preview.src = field.value.trim()
      preview.hidden = !field.value.trim()
    }
    if (field.dataset.productField === 'name') {
      const crumb = composeView.querySelector('.hpi-intro__crumb, .hpi-head__crumb')
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
    if (await handleProductCategoryChange(event, composeView)) return
    const hardwareLine = event.target.closest('[data-product-field="hardwareLine"]')
    if (hardwareLine) {
      refreshComposeCategorySelect(composeView)
      return
    }

    const mediaField = event.target.closest('[data-product-field]')
    const modalFile = event.target.closest('[data-image-modal-file]')
    if (modalFile) {
      const file = modalFile.files?.[0]
      const modal = composeView.querySelector('[data-image-modal]')
      if (!file || !modal?._targetPath) return
      modalFile.disabled = true
      try {
        const url = await uploadImageFile(file)
        const urlInput = modal.querySelector('[data-image-modal-url]')
        if (urlInput) urlInput.value = url
        setImageModalPreview(modal, url)
        applyVisualImage(composeView, modal._targetPath, url)
        ctx.toast('图片已上传，可点确定关闭，或继续改链接')
      } catch (error) {
        ctx.toast(error.message, true)
      } finally {
        modalFile.disabled = false
        modalFile.value = ''
      }
      return
    }

    const visualFile = event.target.closest('[data-product-visual-file]')
    if (visualFile) {
      const file = visualFile.files?.[0]
      const path = visualFile.dataset.targetPath
      if (!file || !path) return
      visualFile.disabled = true
      try {
        const url = await uploadImageFile(file)
        applyVisualImage(composeView, path, url)
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
