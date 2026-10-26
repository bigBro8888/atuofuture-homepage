import { AGENT_DETAILS } from '../data/agents-detail.js'
import { SPACE_AGENT_PAGE } from '../data/space-agent-page.js'
import { renderAgentDetail } from '../lib/agent-detail-render.js'
import { isHttpVideoUrl, mountOnlineVideo, mountOnlineVideosIn } from '../lib/online-video.js'

const CONTENT_KINDS = [
  { id: 'news', label: '新闻', desc: '新闻稿件' },
  { id: 'solutions', label: '行业解决方案', desc: '方案详情页' },
  { id: 'agents', label: '空间智能体', desc: '智能体详情页' },
  { id: 'products', label: '商品详情', desc: '硬件商品详情页' },
]

const AGENT_IMAGE_SIZE_GUIDE = [
  { test: (path) => path === 'archCoreImage', label: '接入区中心图', size: '400×400', tip: '中间蓝块整图替换' },
  { test: (path) => path === 'sceneImage', label: '场景图', size: '1200×800', tip: '详情页场景配图' },
  { test: (path) => path === 'spacePage.heroImage' || path === 'spacePage.heroVideo', label: '首屏媒体', size: '1200×760', tip: '支持在线视频链接（含云点播 CDN）或本地上传 mp4' },
  { test: (path) => path === 'spacePage.contrastImage', label: '对比区配图', size: '1200×600', tip: '斜切媒体图' },
  { test: (path) => /spacePage\.scenarios\.\d+\.image/.test(path), label: '场景区配图', size: '960×640', tip: '中间斜切图' },
  { test: (path) => /spacePage\.flowSteps\.\d+\.image/.test(path), label: '流程步骤图', size: '400×400', tip: '步骤下方小方块图，圆角框内裁切' },
  { test: () => true, label: '图片', size: '1200×800', tip: '按前台比例裁切即可' },
]

function resolveAgentImageGuide(path = '') {
  return AGENT_IMAGE_SIZE_GUIDE.find((item) => item.test(path)) || AGENT_IMAGE_SIZE_GUIDE[AGENT_IMAGE_SIZE_GUIDE.length - 1]
}

function readEditableText(el) {
  return (el.innerText || '').replace(/\u00a0/g, ' ').trim()
}

/** 去掉粘贴带来的富文本字号/标签，只保留纯文本 */
function sanitizeAgentEditable(el) {
  if (!el) return
  const multiline = el.dataset.editMultiline === 'true'
  let text = (el.innerText || '').replace(/\u00a0/g, ' ')
  if (multiline) {
    text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim()
  } else {
    text = text.replace(/\s*\n+\s*/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const hasMarkup = Boolean(el.querySelector('*')) || /style\s*=|font-size|<\/?[a-z]/i.test(el.innerHTML || '')
  if (!hasMarkup) {
    if (!multiline && (el.innerText || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() !== text) {
      el.textContent = text
    }
    return
  }
  if (!multiline) {
    el.textContent = text
    return
  }
  el.replaceChildren()
  const lines = text.split('\n')
  lines.forEach((line, index) => {
    el.appendChild(document.createTextNode(line))
    if (index < lines.length - 1) el.appendChild(document.createElement('br'))
  })
}

const KIND_HASH = {
  news: 'content-news',
  solutions: 'content-solutions',
  agents: 'content-agents',
  products: 'content-products',
}

let ctx = {
  api: null,
  toast: () => {},
  escapeHtml: (value) => String(value ?? ''),
  dateTime: () => '--',
  state: null,
  loadNewsFeed: async () => {},
  closeNewsCompose: () => {},
  loadProductLibrary: async () => {},
  closeProductCompose: () => {},
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

function field(kind, path, label, value, options = {}) {
  const type = options.type || 'text'
  const attr = `${kind}-field`
  let input
  if (type === 'textarea') {
    input = `<textarea data-${attr}="${path}" rows="${options.rows || 3}"${options.placeholder ? ` placeholder="${esc(options.placeholder)}"` : ''}>${esc(value ?? '')}</textarea>`
  } else if (type === 'checkbox') {
    input = `<input data-${attr}="${path}" type="checkbox"${value ? ' checked' : ''} />`
  } else {
    input = `<input data-${attr}="${path}" type="text" value="${esc(value ?? '')}"${options.placeholder ? ` placeholder="${esc(options.placeholder)}"` : ''} />`
  }
  const media = options.image
    ? `<div class="admin-home-media">
        <img data-${kind}-preview-for="${path}" src="${esc(value ?? '')}" alt="" ${value ? '' : 'hidden'} />
        <label class="admin-home-upload">上传图片<input type="file" accept="image/jpeg,image/png,image/webp" data-${kind}-upload-for="${path}" /></label>
      </div>`
    : ''
  return `<label class="admin-news-field${options.wide ? ' is-wide' : ''}"><span>${label}</span>${input}${media}${fieldHint(options)}</label>`
}

function lines(value) {
  return Array.isArray(value) ? value.join('\n') : String(value || '')
}

function asList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item ?? ''))
  return value ? [String(value)] : ['']
}

const SOL_OUTLINE = [
  { id: 'basics', no: '01', title: '基础信息', desc: '名称、封面、价值' },
  { id: 'ppt', no: '02', title: '方案介绍 PPT', desc: '16:9 讲解页' },
  { id: 'scenarios', no: '03', title: '运营场景', desc: '图 + 标题卡片' },
  { id: 'journey', no: '04', title: '客户旅程', desc: '文字步骤' },
  { id: 'stack', no: '05', title: '智能体与硬件', desc: '标题 + 说明' },
  { id: 'related', no: '06', title: '其他行业方案', desc: '自动取其他方案' },
  { id: 'faq', no: '07', title: '常见问题', desc: '问答卡片' },
  { id: 'values', no: '08', title: '列表页价值', desc: '方案列表三卡' },
]

function showSolutionSection(id) {
  const next = SOL_OUTLINE.some((entry) => entry.id === id) ? id : 'basics'
  ctx.state.solutionSection = next
  document.querySelectorAll('[data-sol-goto]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.solGoto === next)
  })
  document.querySelectorAll('[data-sol-section]').forEach((section) => {
    section.hidden = section.dataset.solSection !== next
  })
}

function asCards(value, normalize) {
  const list = Array.isArray(value) ? value.map(normalize) : []
  return list.length ? list : [normalize({})]
}

function asScene(item) {
  if (typeof item === 'string') return { title: item, imageUrl: '' }
  return { title: item?.title || '', imageUrl: item?.imageUrl || item?.image || '' }
}

function asHardwareCard(item) {
  if (typeof item === 'string') return { title: item, desc: '' }
  return { title: item?.title || '', desc: item?.desc || '' }
}

function asFaq(item) {
  return { q: item?.q || '', a: item?.a || '' }
}

const EMPTY_CARD = {
  scenarios: { title: '', imageUrl: '' },
  hardware: { title: '', desc: '' },
  faqs: { q: '', a: '' },
}

function listEditor(kind, path, items = [], { placeholder = '', addLabel = '添加一条', max = 12 } = {}) {
  const rows = asList(items)
  if (!rows.length) rows.push('')
  return `
    <div class="admin-sol-list">
      ${rows
        .map(
          (value, index) => `
        <label class="admin-sol-list__row">
          <b>${String(index + 1).padStart(2, '0')}</b>
          <input data-${kind}-field="${path}.${index}" type="text" value="${esc(value)}" placeholder="${esc(placeholder)}" />
          <button type="button" data-sol-list-remove="${path}" data-sol-list-index="${index}" ${rows.length <= 1 ? 'disabled' : ''} aria-label="删除">×</button>
        </label>`
        )
        .join('')}
      ${rows.length < max ? `<button type="button" class="admin-sol-list__add" data-sol-list-add="${path}">+ ${addLabel}</button>` : ''}
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
    if (!cursor[key]) cursor[key] = /^\d+$/.test(nextKey) ? [] : {}
    cursor = cursor[key]
  })
}

/**
 * 解析流程六步粘贴文案。只取「序号+标题」与「描述：」；忽略「配图内容：」。
 * 例：
 * 01 建立空间档案
 * 描述：统一面积、价格…
 * 配图内容：…（忽略）
 */
function parseFlowStepsPaste(raw = '') {
  const text = String(raw || '').replace(/\r\n/g, '\n').trim()
  if (!text) return []
  const chunks = text.split(/(?=^\s*0?[1-6][\s.、．]+)/m).map((s) => s.trim()).filter(Boolean)
  const steps = []
  for (const chunk of chunks) {
    const head = chunk.match(/^\s*0?([1-6])[\s.、．]+(.+?)(?:\n|$)/)
    if (!head) continue
    const index = Number(head[1]) - 1
    const title = String(head[2] || '')
      .replace(/^描述[：:].*$/u, '')
      .replace(/^配图内容[：:].*$/u, '')
      .trim()
    // 描述行在 chunk 末尾时无尾随换行；不要强制 \n 再匹配结束
    const descMatch =
      chunk.match(/(?:^|\n)\s*描述[：:]\s*([^\n]+)/u) ||
      chunk.match(/(?:^|\n)\s*描述[：:]\s*(.+?)(?=\n\s*配图内容[：:]|$)/su)
    const desc = descMatch
      ? String(descMatch[1] || '')
          .replace(/\s+/g, ' ')
          .replace(/[。．.]+$/g, '')
          .trim()
      : ''
    if (!title && !desc) continue
    steps[index] = { title, desc }
  }
  return steps
}

function applyFlowStepsPasteToCanvas(compose, steps) {
  const canvas = compose?.querySelector('[data-agents-detail-visual]')
  if (!canvas || !Array.isArray(steps)) return 0
  let filled = 0
  for (let i = 0; i < 6; i += 1) {
    const step = steps[i]
    if (!step) continue
    const titleEl = canvas.querySelector(`[data-edit-path="spacePage.flowSteps.${i}.title"]`)
    const descEl = canvas.querySelector(`[data-edit-path="spacePage.flowSteps.${i}.desc"]`)
    if (titleEl && step.title) {
      titleEl.textContent = step.title
      filled += 1
    }
    if (descEl && step.desc) {
      descEl.textContent = step.desc
      filled += 1
    }
  }
  return filled
}

/** 左侧：标题 + 打勾项（忽略「核心能力」标题行） */
function parseScenarioCopyPaste(raw = '') {
  const lines = String(raw || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (!lines.length) return null
  const title = lines[0]
  const checks = lines
    .slice(1)
    .filter((line) => !/^核心能力/.test(line) && !/^打勾项/.test(line))
    .map((line) => line.replace(/^[·•\-、．.\d]+[\s.]*/, '').trim())
    .filter(Boolean)
    .slice(0, 4)
  return { title, checks }
}

/** 右侧：每行一条动作文案 */
function parseScenarioActionsPaste(raw = '') {
  return String(raw || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[·•\-、．.\d]+[\s.]*/, '').trim())
    .filter(Boolean)
    .slice(0, 4)
}

function applyScenarioCopyPasteToCanvas(compose, index, parsed) {
  const canvas = compose?.querySelector('[data-agents-detail-visual]')
  if (!canvas || !parsed) return 0
  let filled = 0
  const titleEl = canvas.querySelector(`[data-edit-path="spacePage.scenarios.${index}.title"]`)
  if (titleEl && parsed.title) {
    titleEl.textContent = parsed.title
    filled += 1
  }
  for (let ci = 0; ci < 4; ci += 1) {
    const el = canvas.querySelector(`[data-edit-path="spacePage.scenarios.${index}.checks.${ci}"]`)
    if (!el) continue
    const value = parsed.checks?.[ci] || ''
    el.textContent = value
    if (value) filled += 1
  }
  return filled
}

function applyScenarioActionsPasteToCanvas(compose, index, labels) {
  const canvas = compose?.querySelector('[data-agents-detail-visual]')
  if (!canvas || !Array.isArray(labels)) return 0
  let filled = 0
  for (let ai = 0; ai < 4; ai += 1) {
    const el = canvas.querySelector(`[data-edit-path="spacePage.scenarios.${index}.actions.${ai}.label"]`)
    if (!el) continue
    const value = labels[ai] || ''
    el.textContent = value
    if (value) filled += 1
  }
  return filled
}

/** 接入区：顿号/逗号分隔 → 左右列表文案 */
function parseArchLabelsPaste(raw = '') {
  return String(raw || '')
    .replace(/\r\n/g, '\n')
    .split(/[、，,；;|\n]+/)
    .map((item) => item.trim().replace(/[。．.]+$/g, '').trim())
    .filter(Boolean)
    .slice(0, 5)
}

function applyArchLabelsPasteToCanvas(compose, side, labels) {
  const canvas = compose?.querySelector('[data-agents-detail-visual]')
  const key = side === 'right' ? 'archRight' : 'archLeft'
  if (!canvas || !Array.isArray(labels)) return 0
  let filled = 0
  for (let i = 0; i < 5; i += 1) {
    const el = canvas.querySelector(`[data-edit-path="spacePage.${key}.${i}.label"]`)
    if (!el) continue
    const value = labels[i] || ''
    el.textContent = value
    if (value) filled += 1
  }
  return filled
}

/** 成效区：每行「标题：说明」→ 最多 4 条 */
function parseOutcomesPaste(raw = '') {
  return String(raw || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)[：:]\s*(.*)$/u)
      if (!match) return null
      const title = String(match[1] || '').trim()
      const desc = String(match[2] || '')
        .replace(/[。．.]+$/g, '')
        .trim()
      if (!title && !desc) return null
      return { title, desc }
    })
    .filter(Boolean)
    .slice(0, 4)
}

function applyOutcomesPasteToCanvas(compose, items) {
  const canvas = compose?.querySelector('[data-agents-detail-visual]')
  if (!canvas || !Array.isArray(items)) return 0
  let filled = 0
  for (let i = 0; i < 4; i += 1) {
    const item = items[i]
    if (!item) continue
    const titleEl = canvas.querySelector(`[data-edit-path="spacePage.outcomes.${i}.title"]`)
    const descEl = canvas.querySelector(`[data-edit-path="spacePage.outcomes.${i}.desc"]`)
    if (titleEl && item.title) {
      titleEl.textContent = item.title
      filled += 1
    }
    if (descEl && item.desc) {
      descEl.textContent = item.desc
      filled += 1
    }
  }
  return filled
}

function collectFields(root, kind) {
  const item = {}
  root.querySelectorAll(`[data-${kind}-field]`).forEach((el) => {
    const path = el.getAttribute(`data-${kind}-field`)
    setNested(item, path, el.type === 'checkbox' ? el.checked : el.value)
  })
  return item
}

function emptySolution() {
  return {
    id: '',
    name: '',
    icon: 'domain',
    image: '',
    summary: '',
    value: '',
    capabilities: [],
    coreValues: [{}, {}, {}],
    highlightAgents: [],
    scenarios: [{ title: '', imageUrl: '' }],
    pains: [],
    approach: '',
    journey: [],
    agents: [],
    hardware: [{ title: '', desc: '' }],
    faqs: [{ q: '', a: '' }],
    canDo: [],
    slides: [{ imageUrl: '' }],
    published: true,
  }
}

function emptyAgent() {
  return {
    id: '',
    name: '',
    shortName: '',
    icon: 'smart_toy',
    accent: '0, 82, 209',
    eyebrow: '',
    tagline: '',
    overview: '',
    blurb: '',
    value: '',
    trigger: '',
    action: '',
    result: '',
    sceneImage: '',
    archCoreImage: '',
    collabCoreImage: '',
    spacePage: structuredClone(SPACE_AGENT_PAGE),
    capabilities: [{}, {}, {}, {}],
    workflow: [{}, {}, {}, {}],
    metrics: [{}, {}, {}],
    scenarios: [],
    published: true,
  }
}

function hydrateAgentItem(item = {}) {
  const base = item.id && AGENT_DETAILS[item.id] ? structuredClone(AGENT_DETAILS[item.id]) : {}
  return {
    ...emptyAgent(),
    ...base,
    ...item,
    id: item.id || base.id || '',
    capabilities: item.capabilities?.length ? item.capabilities : base.capabilities || [],
    workflow: item.workflow?.length ? item.workflow : base.workflow || [],
    metrics: item.metrics?.length ? item.metrics : base.metrics || [],
    scenarios: item.scenarios?.length ? item.scenarios : base.scenarios || [],
    spacePage:
      item.spacePage && typeof item.spacePage === 'object'
        ? item.spacePage
        : base.spacePage && typeof base.spacePage === 'object'
          ? structuredClone(base.spacePage)
          : structuredClone(SPACE_AGENT_PAGE),
  }
}

function renderKindList(kind, items, previewBase) {
  const editor = document.querySelector(`[data-${kind}-editor]`)
  if (!editor) return
  editor.classList.add('admin-news-editor')
  const addLabel = kind === 'solutions' ? '新建方案' : '新建智能体'
  editor.innerHTML = `
    <div class="admin-news-toolbar">
      <p class="admin-form-section__hint" style="margin:0">${kind === 'agents' ? '点「编辑」进入可视化详情页：上方基础设置，下方预览里直接点改文字和图片。' : '这里编辑详情页内容。对应频道页只负责首屏和列表关联。'}</p>
      <div class="admin-news-toolbar__actions">
        <button type="button" class="admin-add-slide" data-${kind}-add>+ ${addLabel}</button>
      </div>
    </div>
    <div class="admin-home-list">${(items || []).map((item, index) => `
      <div class="admin-item-row">
        ${item.image || item.sceneImage ? `<img class="admin-simple-item__thumb" src="${esc(item.image || item.sceneImage)}" alt="" />` : '<span class="admin-simple-item__thumb is-empty"></span>'}
        <div>
          <strong>${esc(item.name || '未命名')}</strong>
          <small>${esc(item.id || '')}${item.published === false ? ' · 未发布' : ''}</small>
        </div>
        <span class="admin-slide-tools">
          <a href="${previewBase}${encodeURIComponent(item.id)}" target="_blank">预览</a>
          <button type="button" data-${kind}-edit="${index}">编辑</button>
          <button type="button" data-${kind}-remove="${index}">删除</button>
        </span>
      </div>`).join('') || `<p class="admin-form-section__hint">还没有内容，先点上面的新建。</p>`}</div>`
}

function renderSolutionCompose(item) {
  const body = document.querySelector('[data-solutions-compose-body]')
  const values = [...(item.coreValues || []), {}, {}, {}].slice(0, 3)
  const slides = [...(item.slides || [])]
  if (!slides.length) slides.push({ imageUrl: item.image || '' })
  const scenes = asCards(item.scenarios, asScene)
  const hardwares = asCards(item.hardware, asHardwareCard)
  const faqs = asCards(item.faqs, asFaq)
  const active = ctx.state.solutionSection || 'basics'
  body.innerHTML = `
    <div class="admin-home-editor admin-sol-compose">
      <aside class="admin-home-outline">
        <p>点左侧一项，右侧只编辑这一块</p>
        ${SOL_OUTLINE.map((entry) => `
          <button type="button" class="admin-home-outline__item${entry.id === active ? ' is-active' : ''}" data-sol-goto="${entry.id}">
            <em>${entry.no}</em>
            <span><b>${entry.title}</b><small>${entry.desc}</small></span>
          </button>`).join('')}
      </aside>
      <div class="admin-home-stage">
        <input type="hidden" data-solutions-field="id" value="${esc(item.id || '')}" />
        <fieldset data-sol-section="basics">
          <legend>基础信息</legend>
          <p class="admin-form-section__hint">出现在详情页顶部大图。</p>
          <div class="admin-form-grid">
            ${field('solutions', 'name', '方案名称', item.name, { wide: true, placeholder: '例如 智慧园区' })}
            ${field('solutions', 'id', '详情页标识', item.id, { help: '出现在 /solutions/?id= 后面，如 campus' })}
            ${field('solutions', 'icon', '图标名', item.icon, { help: 'Material 图标英文名，如 domain' })}
            ${field('solutions', 'image', '封面图', item.image, { image: true, wide: true, size: '1600×900' })}
            ${field('solutions', 'value', '一句话价值', item.value, { type: 'textarea', rows: 3, placeholder: '详情页主标题下方的那句核心价值' })}
            ${field('solutions', 'summary', '补充简介', item.summary, { type: 'textarea', rows: 3, placeholder: '详情页主标题下的第二段说明' })}
            <label class="admin-news-pin admin-form-wide">
              <input data-solutions-field="published" type="checkbox"${item.published !== false ? ' checked' : ''} />
              <span><b>发布后前台可见</b><small>取消勾选则详情页不对外展示。</small></span>
            </label>
          </div>
        </fieldset>
        <fieldset data-sol-section="ppt">
          <legend>方案介绍 PPT</legend>
          <p class="admin-form-section__hint">按讲解顺序排页，建议 1920×1080。点预览上传，也可粘贴图片地址。</p>
          <div class="admin-sol-deck__grid">
            ${slides.map((slide, index) => {
              const url = slide.imageUrl || ''
              const path = `slides.${index}.imageUrl`
              return `
            <article class="admin-sol-tile" data-solutions-slide="${index}">
              <div class="admin-sol-tile__head">
                <strong>第 ${index + 1} 页</strong>
                <button type="button" data-solutions-slide-remove="${index}" ${slides.length <= 1 ? 'disabled' : ''}>删除</button>
              </div>
              <div class="admin-sol-tile__frame">
                <img data-solutions-preview-for="${path}" src="${esc(url)}" alt="" ${url ? '' : 'hidden'} />
                <label class="admin-sol-tile__upload">
                  <span>${url ? '更换' : '上传图片'}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" data-solutions-upload-for="${path}" />
                </label>
              </div>
              <input class="admin-sol-tile__url" data-solutions-field="${path}" type="text" value="${esc(url)}" placeholder="或粘贴图片地址" />
            </article>`
            }).join('')}
            <button type="button" class="admin-sol-tile admin-sol-tile--add" data-solutions-slide-add>
              <span>+ 添加一页</span>
            </button>
          </div>
        </fieldset>
        <fieldset data-sol-section="scenarios">
          <legend>运营场景</legend>
          <p class="admin-form-section__hint">对应前台 APPLICATIONS：每张卡片一张图 + 一个标题，建议 1200×680。</p>
          <div class="admin-sol-deck__grid">
            ${scenes.map((scene, index) => {
              const path = `scenarios.${index}.imageUrl`
              const url = scene.imageUrl || ''
              return `
            <article class="admin-sol-tile">
              <div class="admin-sol-tile__head">
                <strong>${String(index + 1).padStart(2, '0')}</strong>
                <button type="button" data-sol-cards-remove="scenarios" data-sol-list-index="${index}" ${scenes.length <= 1 ? 'disabled' : ''}>删除</button>
              </div>
              <div class="admin-sol-tile__frame">
                <img data-solutions-preview-for="${path}" src="${esc(url)}" alt="" ${url ? '' : 'hidden'} />
                <label class="admin-sol-tile__upload">
                  <span>${url ? '更换' : '上传图片'}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" data-solutions-upload-for="${path}" />
                </label>
              </div>
              <input class="admin-sol-tile__url" data-solutions-field="scenarios.${index}.title" type="text" value="${esc(scene.title)}" placeholder="场景标题" />
              <input class="admin-sol-tile__url" data-solutions-field="${path}" type="text" value="${esc(url)}" placeholder="或粘贴图片地址" />
            </article>`
            }).join('')}
            <button type="button" class="admin-sol-tile admin-sol-tile--add" data-sol-cards-add="scenarios">
              <span>+ 添加场景</span>
            </button>
          </div>
        </fieldset>
        <fieldset data-sol-section="journey">
          <legend>客户旅程</legend>
          <p class="admin-form-section__hint">对应前台 JOURNEY：一行文字步骤，无需配图。</p>
          ${listEditor('solutions', 'journey', item.journey, { placeholder: '例如 园区到访', addLabel: '添加步骤', max: 8 })}
        </fieldset>
        <fieldset data-sol-section="stack">
          <legend>智能体与硬件</legend>
          <p class="admin-form-section__hint">对应前台 SOLUTION STACK。智能体填详情页标识，名称和说明自动取智能体库；硬件在这里写标题和说明。</p>
          <div class="admin-sol-stack">
            <div>
              <h4 class="admin-sol-label">关联智能体</h4>
              ${listEditor('solutions', 'agents', item.agents, { placeholder: '如 space', addLabel: '添加智能体', max: 12 })}
            </div>
            <div>
              <h4 class="admin-sol-label">列表页重点智能体</h4>
              <p class="admin-form-section__hint">方案列表页最多高亮 3 个</p>
              ${listEditor('solutions', 'highlightAgents', item.highlightAgents, { placeholder: '如 visitor', addLabel: '添加重点', max: 3 })}
            </div>
          </div>
          <h4 class="admin-sol-label" style="margin-top:18px">关联硬件 / 系统</h4>
          <div class="admin-sol-hw">
            ${hardwares.map((row, index) => `
              <article class="admin-sol-hw__card">
                <div class="admin-sol-tile__head">
                  <strong>${String(index + 1).padStart(2, '0')}</strong>
                  <button type="button" data-sol-cards-remove="hardware" data-sol-list-index="${index}" ${hardwares.length <= 1 ? 'disabled' : ''}>删除</button>
                </div>
                ${field('solutions', `hardware.${index}.title`, '标题', row.title, { placeholder: '例如 中控屏' })}
                ${field('solutions', `hardware.${index}.desc`, '说明', row.desc, { type: 'textarea', rows: 3, placeholder: '前台清单里标题下方的灰色说明' })}
              </article>`).join('')}
            <button type="button" class="admin-sol-hw__add" data-sol-cards-add="hardware">+ 添加硬件</button>
          </div>
        </fieldset>
        <fieldset data-sol-section="related">
          <legend>其他行业方案</legend>
          <p class="admin-form-section__hint">对应前台 MORE INDUSTRIES。卡片会自动取其他已发布方案的封面图、名称和一句话价值，这里不用单独维护。</p>
          <div class="admin-sol-related">
            ${(ctx.state.solutionsLibrary?.draftContent?.items || [])
              .filter((row) => row.id && row.id !== item.id && row.published !== false)
              .map((row) => `
                <article class="admin-sol-related__card">
                  <div class="admin-sol-related__media" style="background-image:url('${esc(row.image || '')}')"></div>
                  <strong>${esc(row.name || '未命名')}</strong>
                  <p>${esc(row.value || row.summary || '')}</p>
                </article>`).join('') || '<p class="admin-form-section__hint">发布其他方案后，这里会自动出现对应卡片。</p>'}
          </div>
        </fieldset>
        <fieldset data-sol-section="faq">
          <legend>常见问题</legend>
          <p class="admin-form-section__hint">对应前台 FAQ。每条是一个问题和一段回答。</p>
          <div class="admin-sol-faq">
            ${faqs.map((row, index) => `
              <article class="admin-sol-faq__card">
                <div class="admin-sol-tile__head">
                  <strong>问题 ${String(index + 1).padStart(2, '0')}</strong>
                  <button type="button" data-sol-cards-remove="faqs" data-sol-list-index="${index}" ${faqs.length <= 1 ? 'disabled' : ''}>删除</button>
                </div>
                ${field('solutions', `faqs.${index}.q`, '问题', row.q, { placeholder: '例如 方案主要解决什么问题？' })}
                ${field('solutions', `faqs.${index}.a`, '回答', row.a, { type: 'textarea', rows: 3 })}
              </article>`).join('')}
            <button type="button" class="admin-sol-list__add" data-sol-cards-add="faqs">+ 添加问题</button>
          </div>
        </fieldset>
        <fieldset data-sol-section="values">
          <legend>列表页核心价值</legend>
          <p class="admin-form-section__hint">出现在 /solutions/ 方案列表，不是详情页。固定 3 条。</p>
          <div class="admin-sol-values">
            ${values.map((row, index) => `
              <article class="admin-sol-value">
                <h4>价值 ${index + 1}</h4>
                ${field('solutions', `coreValues.${index}.title`, '标题', row.title || '')}
                ${field('solutions', `coreValues.${index}.icon`, '图标名', row.icon || '', { help: '如 verified、bolt' })}
                ${field('solutions', `coreValues.${index}.desc`, '说明', row.desc || '', { type: 'textarea', rows: 3 })}
              </article>`).join('')}
          </div>
        </fieldset>
      </div>
    </div>`
  showSolutionSection(active)
}

function renderAgentCompose(rawItem) {
  const body = document.querySelector('[data-agents-compose-body]')
  if (!body) return
  const item = hydrateAgentItem(rawItem)
  const previewAgent = {
    ...item,
    id: item.id || 'space',
  }
  const title = document.querySelector('[data-agents-compose-title]')
  if (title) title.textContent = item.name ? `可视化编辑 · ${item.name}` : '可视化编辑 · 新建智能体'
  body.innerHTML = `
    <div class="admin-vedit admin-vedit--agent-detail">
      <details class="admin-vedit-basics" open>
        <summary>
          <strong>基础设置</strong>
          <span>名称、标识、列表简介；详情正文在下方预览里直接点改</span>
        </summary>
        <div class="admin-vedit-basics__body">
          <div class="admin-form-grid">
            <input type="hidden" data-agents-field="id" value="${esc(item.id || '')}" />
            <input type="hidden" data-agents-field="icon" value="${esc(item.icon || '')}" />
            ${field('agents', 'name', '智能体名称', item.name, { wide: true, placeholder: '例如 空间服务智能体' })}
            ${field('agents', 'shortName', '短名', item.shortName)}
            ${field('agents', 'accent', '强调色 RGB', item.accent, { help: '如 0, 82, 209' })}
            ${field('agents', 'blurb', '列表简介', item.blurb, { type: 'textarea', rows: 2, wide: true })}
            ${field('agents', 'eyebrow', '英文眉题', item.eyebrow)}
            ${field('agents', 'sceneImage', '列表/场景图', item.sceneImage, {
              image: true,
              wide: true,
              size: '1200×800',
              help: '频道列表用；详情页配图请在下方预览里直接点换',
            })}
            <label class="admin-news-pin admin-form-wide">
              <input data-agents-field="published" type="checkbox"${item.published !== false ? ' checked' : ''} />
              <span><b>发布后前台可见</b></span>
            </label>
          </div>
          <details class="admin-vedit-advanced">
            <summary>高级设置（一般不用改）</summary>
            <div class="admin-form-grid" style="margin-top:12px">
              ${field('agents', 'value', '价值', item.value, { type: 'textarea', rows: 2, wide: true })}
              ${field('agents', 'trigger', '触发', item.trigger, { type: 'textarea', rows: 2 })}
              ${field('agents', 'action', '动作', item.action, { type: 'textarea', rows: 2 })}
              ${field('agents', 'result', '结果', item.result, { type: 'textarea', rows: 2 })}
            </div>
          </details>
        </div>
      </details>
      <div class="admin-vedit-hint">详情页正文请在下方预览里直接改（点文字/图片即可）。上方基础设置只管名称、标识和列表信息。</div>
      <div class="admin-vedit-canvas" data-agents-detail-visual style="--accent: ${esc(item.accent || '0, 82, 209')}">
        ${renderAgentDetail(previewAgent, { editable: true })}
      </div>
      <div class="admin-link-modal" data-agents-flow-paste-modal hidden>
        <div class="admin-link-modal__backdrop" data-agents-flow-paste-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="agents-flow-paste-title">
          <header>
            <h3 id="agents-flow-paste-title">流程六步 · 批量粘贴</h3>
            <button type="button" data-agents-flow-paste-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <p class="admin-vedit-flow-paste__hint">粘贴「01 标题 + 描述：…」自动填入六步；「配图内容」行会忽略，小方块图请点图更换。</p>
            <textarea data-agents-flow-paste rows="14" placeholder="01 建立空间档案

描述：统一面积、价格、平面图、配套与可租状态

02 多渠道发布

描述：自动生成空间介绍，同步官网、小程序与招商渠道"></textarea>
            <small data-agents-flow-paste-tip>只更新标题与描述</small>
          </div>
          <footer>
            <button type="button" data-agents-flow-paste-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-agents-flow-paste-apply>解析并填入</button>
          </footer>
        </div>
      </div>
      <div class="admin-link-modal" data-agents-scenario-paste-modal hidden>
        <div class="admin-link-modal__backdrop" data-agents-scenario-paste-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="agents-scenario-paste-title">
          <header>
            <h3 id="agents-scenario-paste-title" data-agents-scenario-paste-heading>场景 · 批量粘贴</h3>
            <button type="button" data-agents-scenario-paste-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <p class="admin-vedit-flow-paste__hint" data-agents-scenario-paste-hint>粘贴后自动填入当前场景对应字段。</p>
            <textarea data-agents-scenario-paste rows="12" placeholder=""></textarea>
            <small data-agents-scenario-paste-tip></small>
          </div>
          <footer>
            <button type="button" data-agents-scenario-paste-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-agents-scenario-paste-apply>解析并填入</button>
          </footer>
        </div>
      </div>
      <div class="admin-link-modal" data-agents-arch-paste-modal hidden>
        <div class="admin-link-modal__backdrop" data-agents-arch-paste-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="agents-arch-paste-title">
          <header>
            <h3 id="agents-arch-paste-title" data-agents-arch-paste-heading>接入区 · 批量粘贴</h3>
            <button type="button" data-agents-arch-paste-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <p class="admin-vedit-flow-paste__hint">用顿号「、」或逗号分隔多项，按顺序填入最多 5 条；图标保持原样。</p>
            <textarea data-agents-arch-paste rows="6" placeholder="PMS与预订渠道、住客与协议管理、智能门锁与门禁、客房控制与物联、财务账单与工单。"></textarea>
            <small data-agents-arch-paste-tip>只更新文案标签</small>
          </div>
          <footer>
            <button type="button" data-agents-arch-paste-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-agents-arch-paste-apply>解析并填入</button>
          </footer>
        </div>
      </div>
      <div class="admin-link-modal" data-agents-outcomes-paste-modal hidden>
        <div class="admin-link-modal__backdrop" data-agents-outcomes-paste-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="agents-outcomes-paste-title">
          <header>
            <h3 id="agents-outcomes-paste-title">业务成效 · 批量粘贴</h3>
            <button type="button" data-agents-outcomes-paste-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <p class="admin-vedit-flow-paste__hint">每行一条「标题：说明」，按顺序填入最多 4 条；图标保持原样。</p>
            <textarea data-agents-outcomes-paste rows="10" placeholder="分房调度更高效：自动匹配最优房间，减少人工沟通，提升入住效率。

入住通行更顺畅：住客自助办理，手机开门，缩短前台排队时间。

客房能耗更可控：接入住状态联动设备，降低空置能耗。

费用记录更清晰：房费、押金与服务费用统一管理，对账更高效"></textarea>
            <small data-agents-outcomes-paste-tip>只更新标题与说明</small>
          </div>
          <footer>
            <button type="button" data-agents-outcomes-paste-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-agents-outcomes-paste-apply>解析并填入</button>
          </footer>
        </div>
      </div>
      <input type="file" accept="image/jpeg,image/png,image/webp" hidden data-agents-detail-visual-file />
      <div class="admin-link-modal" data-agents-detail-image-modal hidden>
        <div class="admin-link-modal__backdrop" data-agents-detail-image-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="agents-detail-image-title">
          <header>
            <h3 id="agents-detail-image-title" data-agents-detail-media-title>更换图片</h3>
            <button type="button" data-agents-detail-image-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <div class="admin-image-modal__size">
              <strong data-agents-detail-image-size-label>建议尺寸</strong>
              <em data-agents-detail-image-size-value>1200×800</em>
              <span data-agents-detail-image-size-tip>上传前请按建议尺寸准备素材</span>
            </div>
            <fieldset class="admin-link-modal__type" data-agents-detail-media-type-wrap hidden>
              <legend>媒体类型</legend>
              <div class="admin-link-modal__type-list">
                <label><input type="radio" name="agents-detail-media-type" value="image" data-agents-detail-media-type checked /><em>图片</em></label>
                <label><input type="radio" name="agents-detail-media-type" value="video" data-agents-detail-media-type /><em>视频</em></label>
              </div>
            </fieldset>
            <div class="admin-image-modal__preview">
              <img data-agents-detail-image-preview src="" alt="" hidden />
              <video data-agents-detail-video-preview src="" muted playsinline controls hidden></video>
              <span data-agents-detail-image-empty>暂无预览</span>
            </div>
            <label class="admin-news-field is-wide" data-agents-detail-image-url-wrap>
              <span data-agents-detail-url-label>图片链接</span>
              <input type="text" data-agents-detail-image-url placeholder="/images/... 或 https://..." />
              <small data-agents-detail-url-hint>支持在线视频链接（云点播 CDN、https 直链、m3u8）或本地上传。粘贴后点确定即可；后台预览若黑屏多半是跨域，发布后以前台为准。</small>
            </label>
            <label class="admin-news-field is-wide" data-agents-detail-poster-wrap hidden>
              <span>视频封面图（可选）</span>
              <input type="text" data-agents-detail-poster-url placeholder="/images/... 封面图地址" />
            </label>
            <div class="admin-image-modal__or">或</div>
            <label class="admin-image-modal__upload" data-agents-detail-image-upload-wrap>
              <span data-agents-detail-upload-label>上传本地图片</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" data-agents-detail-image-file />
            </label>
            <label class="admin-image-modal__upload" data-agents-detail-video-upload-wrap hidden>
              上传本地视频
              <input type="file" accept="video/mp4,video/webm,video/quicktime" data-agents-detail-video-file />
            </label>
          </div>
          <footer>
            <button type="button" data-agents-detail-image-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-agents-detail-image-modal-save>确定</button>
          </footer>
        </div>
      </div>
    </div>`
  mountOnlineVideosIn(body)
}

function collectAgentArticle(compose) {
  const article = collectFields(compose, 'agents')
  const canvas = compose.querySelector('[data-agents-detail-visual]')
  if (!canvas) return article
  canvas.querySelectorAll('[data-edit-path]').forEach((el) => {
    const path = el.dataset.editPath
    if (!path) return
    let value = readEditableText(el)
    if (el.dataset.editMultiline === 'true') value = value.replace(/\n{3,}/g, '\n\n')
    setNested(article, path, value)
  })
  canvas.querySelectorAll('[data-edit-image]').forEach((el) => {
    const path = el.dataset.editImage
    if (!path) return
    const url = el.dataset.editImageUrl != null ? el.dataset.editImageUrl : el.querySelector('img')?.getAttribute('src') || ''
    setNested(article, path, String(url || '').trim())
  })
  canvas.querySelectorAll('[data-edit-video]').forEach((el) => {
    const path = el.dataset.editVideo
    if (!path) return
    const url = el.dataset.editVideoUrl != null ? el.dataset.editVideoUrl : el.querySelector('video')?.getAttribute('src') || ''
    setNested(article, path, String(url || '').trim())
  })
  if (Array.isArray(article.scenarios)) {
    article.scenarios = article.scenarios.map((s) => String(s || '').trim()).filter(Boolean)
  } else if (typeof article.scenarios === 'string') {
    article.scenarios = article.scenarios
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  if (Array.isArray(article.capabilities)) {
    article.capabilities = article.capabilities.filter((row) => row && (row.title || row.desc || row.icon))
  }
  if (Array.isArray(article.workflow)) {
    article.workflow = article.workflow.filter((row) => row && (row.title || row.desc))
  }
  if (Array.isArray(article.metrics)) {
    article.metrics = article.metrics.filter((row) => row && (row.value || row.label))
  }
  return article
}

function setAgentsDetailMediaType(modal, type) {
  const next = type === 'video' ? 'video' : 'image'
  modal.dataset.mediaType = next
  modal.querySelectorAll('[data-agents-detail-media-type]').forEach((input) => {
    input.checked = input.value === next
  })
  const posterWrap = modal.querySelector('[data-agents-detail-poster-wrap]')
  const videoUpload = modal.querySelector('[data-agents-detail-video-upload-wrap]')
  const imageUpload = modal.querySelector('[data-agents-detail-image-upload-wrap]')
  const urlLabel = modal.querySelector('[data-agents-detail-url-label]')
  const uploadLabel = modal.querySelector('[data-agents-detail-upload-label]')
  const urlInput = modal.querySelector('[data-agents-detail-image-url]')
  if (posterWrap) posterWrap.hidden = next !== 'video'
  if (videoUpload) videoUpload.hidden = next !== 'video'
  if (imageUpload) imageUpload.hidden = false
  if (urlLabel) urlLabel.textContent = next === 'video' ? '视频链接' : '图片链接'
  if (uploadLabel) uploadLabel.textContent = next === 'video' ? '上传封面图（可选）' : '上传本地图片'
  const urlHint = modal.querySelector('[data-agents-detail-url-hint]')
  if (urlHint) urlHint.hidden = next !== 'video'
  if (urlInput) {
    urlInput.placeholder =
      next === 'video' ? 'https://cloud.video.taobao.com/... 或 https://....mp4' : '/images/... 或 https://...'
  }
}

function setAgentsDetailImagePreview(modal, url, type = 'image') {
  const preview = modal.querySelector('[data-agents-detail-image-preview]')
  const videoPreview = modal.querySelector('[data-agents-detail-video-preview]')
  const empty = modal.querySelector('[data-agents-detail-image-empty]')
  const safeUrl = String(url || '').trim()
  if (preview) {
    preview.hidden = true
    preview.removeAttribute('src')
  }
  if (videoPreview) {
    videoPreview.onerror = null
    videoPreview.hidden = true
    videoPreview.removeAttribute('src')
    videoPreview.removeAttribute('data-online-video')
    videoPreview.load?.()
  }
  if (!safeUrl) {
    if (empty) {
      empty.hidden = false
      empty.textContent = '暂无预览'
    }
    return
  }
  if (empty) empty.hidden = true
  if (type === 'video' && videoPreview) {
    if (!isHttpVideoUrl(safeUrl)) {
      if (empty) {
        empty.hidden = false
        empty.textContent = '请填写 http(s) 在线视频地址，或上传本地视频'
      }
      return
    }
    videoPreview.onerror = () => {
      if (empty) {
        empty.hidden = false
        empty.textContent = '后台预览可能因跨域无法播放，仍可点确定保存；发布后以前台为准'
      }
    }
    videoPreview.hidden = false
    videoPreview.setAttribute('data-online-video', safeUrl)
    void mountOnlineVideo(videoPreview, safeUrl)
    return
  }
  if (preview) {
    preview.src = safeUrl
    preview.hidden = false
  }
  if (empty) empty.textContent = '暂无预览'
}

function applyAgentsDetailHeroMedia(compose, { imageUrl = '', videoUrl = '' } = {}) {
  const canvas = compose.querySelector('[data-agents-detail-visual]')
  const target = canvas?.querySelector('[data-edit-hero-media]')
  if (!target) return
  const safeImage = String(imageUrl || '').trim()
  const safeVideo = String(videoUrl || '').trim()
  target.dataset.editImageUrl = safeImage
  target.dataset.editVideoUrl = safeVideo
  target.querySelectorAll('img, video').forEach((el) => el.remove())
  let tip = target.querySelector('.hpi-edit-img__tip')
  if (!tip) {
    tip = document.createElement('span')
    tip.className = 'hpi-edit-img__tip'
    target.appendChild(tip)
  }
  if (safeVideo || safeImage) {
    target.classList.remove('hpi-edit-img--empty')
    if (safeVideo) {
      const video = document.createElement('video')
      video.className = 'space-ad__hero-media'
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.setAttribute('playsinline', '')
      video.setAttribute('data-online-video', safeVideo)
      if (safeImage) video.poster = safeImage
      target.insertBefore(video, tip)
      void mountOnlineVideo(video, safeVideo, { autoplay: true }).then((ok) => {
        if (!ok) return
        // 部分 CDN 首帧黑屏，强制再 load 一次
        try {
          video.load()
          video.play?.().catch(() => {})
        } catch {
          /* ignore */
        }
      })
    } else {
      const img = document.createElement('img')
      img.className = 'space-ad__hero-media'
      img.alt = ''
      img.src = safeImage
      target.insertBefore(img, tip)
    }
    tip.textContent = '更换媒体'
    tip.classList.remove('is-visible')
  } else {
    target.classList.add('hpi-edit-img--empty')
    tip.textContent = '添加图片或视频'
    tip.classList.add('is-visible')
  }
}

function applyAgentsDetailImage(compose, path, url) {
  const canvas = compose.querySelector('[data-agents-detail-visual]')
  if (!canvas || !path) return
  if (path === 'spacePage.heroImage' || path === 'spacePage.heroVideo') {
    const hero = canvas.querySelector('[data-edit-hero-media]')
    if (hero) {
      applyAgentsDetailHeroMedia(compose, {
        imageUrl: path === 'spacePage.heroImage' ? url : hero.dataset.editImageUrl || '',
        videoUrl: path === 'spacePage.heroVideo' ? url : hero.dataset.editVideoUrl || '',
      })
      return
    }
  }
  const target =
    canvas.querySelector(`[data-edit-image="${CSS.escape(path)}"]`) || canvas.querySelector(`[data-edit-image="${path}"]`)
  const safeUrl = String(url || '').trim()
  if (!target) return
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
    target.classList.add('hpi-edit-img--empty')
    if (img) img.remove()
    let tip = target.querySelector('.hpi-edit-img__tip')
    if (!tip) {
      tip = document.createElement('span')
      tip.className = 'hpi-edit-img__tip is-visible'
      target.appendChild(tip)
    }
    tip.textContent = '添加图片'
    tip.classList.add('is-visible')
  }
}

function updateStatus(kind, page) {
  const draft = document.querySelector(`[data-${kind}-draft-time]`)
  const status = document.querySelector(`[data-${kind}-publish-status]`)
  if (draft) draft.textContent = `草稿 ${ctx.dateTime(page.updatedAt)}`
  if (status) status.textContent = page.publishedAt ? `已发布 ${ctx.dateTime(page.publishedAt)}` : '尚未发布'
}

async function persistKind(kind, items, message) {
  const path = kind === 'solutions' ? '/pages/solutions-library' : '/pages/agents-library'
  const { page } = await ctx.api(`${path}/draft`, { method: 'PUT', body: JSON.stringify({ content: { items } }) })
  const published = await ctx.api(`${path}/publish`, { method: 'POST' })
  const next = published.page || page
  if (kind === 'solutions') ctx.state.solutionsLibrary = next
  else ctx.state.agentsLibrary = next
  renderKindList(kind, next.draftContent.items, kind === 'solutions' ? '/solutions/?id=' : '/agent-detail/?id=')
  updateStatus(kind, next)
  if (message) ctx.toast(message)
  return next
}

function openCompose(kind, index) {
  const page = kind === 'solutions' ? ctx.state.solutionsLibrary : ctx.state.agentsLibrary
  const items = page?.draftContent?.items || []
  const item =
    index >= 0
      ? kind === 'agents'
        ? hydrateAgentItem(items[index])
        : items[index]
      : kind === 'solutions'
        ? emptySolution()
        : emptyAgent()
  ctx.state[`${kind}ComposeIndex`] = index
  if (kind === 'solutions') ctx.state.solutionSection = 'basics'
  document.querySelector(`[data-${kind}-list-view]`).hidden = true
  const compose = document.querySelector(`[data-${kind}-compose-view]`)
  compose.hidden = false
  if (kind === 'solutions') renderSolutionCompose(item)
  else renderAgentCompose(item)
  window.scrollTo({ top: 0 })
}

function closeCompose(kind) {
  const list = document.querySelector(`[data-${kind}-list-view]`)
  const compose = document.querySelector(`[data-${kind}-compose-view]`)
  if (list) list.hidden = false
  if (compose) compose.hidden = true
  ctx.state[`${kind}ComposeIndex`] = -1
}

export function closeSolutionsCompose() { closeCompose('solutions') }
export function closeAgentsCompose() { closeCompose('agents') }

export async function loadSolutionsLibrary() {
  const { page } = await ctx.api('/pages/solutions-library')
  ctx.state.solutionsLibrary = page
  renderKindList('solutions', page.draftContent.items, '/solutions/?id=')
  updateStatus('solutions', page)
}

export async function loadAgentsLibrary() {
  const { page } = await ctx.api('/pages/agents-library')
  ctx.state.agentsLibrary = page
  renderKindList('agents', page.draftContent.items, '/agent-detail/?id=')
  updateStatus('agents', page)
}

export function showContentKind(kind) {
  const next = CONTENT_KINDS.some((item) => item.id === kind) ? kind : 'news'
  ctx.state.contentKind = next
  document.querySelectorAll('[data-content-kind]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.contentKind === next)
  })
  document.querySelectorAll('[data-content-pane]').forEach((pane) => {
    pane.hidden = pane.dataset.contentPane !== next
  })
  ctx.closeNewsCompose()
  ctx.closeProductCompose()
  closeCompose('solutions')
  closeCompose('agents')
  const hash = KIND_HASH[next]
  if (location.hash !== `#${hash}`) history.replaceState(null, '', `#${hash}`)
  if (next === 'news') ctx.loadNewsFeed()
  if (next === 'products') ctx.loadProductLibrary()
  if (next === 'solutions') loadSolutionsLibrary().catch((error) => ctx.toast(error.message, true))
  if (next === 'agents') loadAgentsLibrary().catch((error) => ctx.toast(error.message, true))
}

function bindKind(kind) {
  const list = document.querySelector(`[data-${kind}-editor]`)
  const compose = document.querySelector(`[data-${kind}-compose-view]`)
  if (!list || !compose) return
  list.addEventListener('click', async (event) => {
    if (event.target.closest(`[data-${kind}-add]`)) {
      event.preventDefault()
      openCompose(kind, -1)
      return
    }
    const edit = event.target.closest(`[data-${kind}-edit]`)
    if (edit) {
      event.preventDefault()
      openCompose(kind, Number(edit.getAttribute(`data-${kind}-edit`)))
      return
    }
    const remove = event.target.closest(`[data-${kind}-remove]`)
    if (remove) {
      event.preventDefault()
      if (!window.confirm('删除后前台将不再展示，确定吗？')) return
      const index = Number(remove.getAttribute(`data-${kind}-remove`))
      const page = kind === 'solutions' ? ctx.state.solutionsLibrary : ctx.state.agentsLibrary
      const items = [...(page?.draftContent?.items || [])]
      items.splice(index, 1)
      try { await persistKind(kind, items, '已删除并发布') } catch (error) { ctx.toast(error.message, true) }
    }
  })
  if (kind === 'agents') {
    compose.addEventListener('click', (event) => {
      const openFlow = event.target.closest('[data-agents-flow-paste-open]')
      if (openFlow) {
        event.preventDefault()
        event.stopPropagation()
        const modal = compose.querySelector('[data-agents-flow-paste-modal]')
        if (modal) modal.hidden = false
        compose.querySelector('[data-agents-flow-paste]')?.focus()
        return
      }
      if (event.target.closest('[data-agents-flow-paste-modal-close]')) {
        event.preventDefault()
        const modal = compose.querySelector('[data-agents-flow-paste-modal]')
        if (modal) modal.hidden = true
        return
      }
      const applyFlow = event.target.closest('[data-agents-flow-paste-apply]')
      if (applyFlow) {
        event.preventDefault()
        const modal = compose.querySelector('[data-agents-flow-paste-modal]')
        const textarea = compose.querySelector('[data-agents-flow-paste]')
        const tip = compose.querySelector('[data-agents-flow-paste-tip]')
        const steps = parseFlowStepsPaste(textarea?.value || '')
        const count = steps.filter(Boolean).length
        if (!count) {
          if (tip) tip.textContent = '没识别到步骤，请确认格式为「01 标题」+「描述：…」'
          ctx.toast('未识别到流程步骤', true)
          return
        }
        applyFlowStepsPasteToCanvas(compose, steps)
        if (tip) tip.textContent = `已填入 ${count} 步标题/描述（配图内容已忽略）`
        if (modal) modal.hidden = true
        ctx.toast(`已解析并填入 ${count} 个步骤`)
        return
      }

      const openScenario = event.target.closest('[data-agents-scenario-paste-open]')
      if (openScenario) {
        event.preventDefault()
        event.stopPropagation()
        const modal = compose.querySelector('[data-agents-scenario-paste-modal]')
        if (!modal) return
        const mode = openScenario.dataset.scenarioMode === 'actions' ? 'actions' : 'copy'
        const index = Number(openScenario.dataset.scenarioIndex || 0)
        modal.dataset.scenarioMode = mode
        modal.dataset.scenarioIndex = String(Number.isFinite(index) ? index : 0)
        const heading = modal.querySelector('[data-agents-scenario-paste-heading]')
        const hint = modal.querySelector('[data-agents-scenario-paste-hint]')
        const tip = modal.querySelector('[data-agents-scenario-paste-tip]')
        const textarea = modal.querySelector('[data-agents-scenario-paste]')
        if (mode === 'actions') {
          if (heading) heading.textContent = `场景 ${index + 1} · 右侧动作批量粘贴`
          if (hint) hint.textContent = '每行一条动作文案，按顺序填入右侧列表。'
          if (textarea) {
            textarea.value = ''
            textarea.placeholder = '统一空间档案与租赁信息\n\n自动整理展示素材与卖点\n\n多渠道发布与信息同步\n\n可租、锁定、签约状态联动'
          }
          if (tip) tip.textContent = '只更新动作文案，图标保持原样'
        } else {
          if (heading) heading.textContent = `场景 ${index + 1} · 左侧标题与打勾项`
          if (hint) hint.textContent = '第一行是标题；「核心能力（打勾项）：」可有可无；其后每行一条打勾能力。'
          if (textarea) {
            textarea.value = ''
            textarea.placeholder =
              '智能分房，让房间与住客需求自动匹配\n核心能力（打勾项）：\n\n综合房型、日期、楼层与住客偏好\n\n实时检查空间、清洁、维修和锁房状态\n\n团队入住支持连续房、同楼层与批量分配'
          }
          if (tip) tip.textContent = '只更新标题与打勾项；场景说明请在预览里单独改'
        }
        modal.hidden = false
        textarea?.focus()
        return
      }
      if (event.target.closest('[data-agents-scenario-paste-modal-close]')) {
        event.preventDefault()
        const modal = compose.querySelector('[data-agents-scenario-paste-modal]')
        if (modal) modal.hidden = true
        return
      }
      const applyScenario = event.target.closest('[data-agents-scenario-paste-apply]')
      if (applyScenario) {
        event.preventDefault()
        const modal = compose.querySelector('[data-agents-scenario-paste-modal]')
        const mode = modal?.dataset.scenarioMode === 'actions' ? 'actions' : 'copy'
        const index = Number(modal?.dataset.scenarioIndex || 0)
        const textarea = compose.querySelector('[data-agents-scenario-paste]')
        const tip = compose.querySelector('[data-agents-scenario-paste-tip]')
        const raw = textarea?.value || ''
        if (mode === 'actions') {
          const labels = parseScenarioActionsPaste(raw)
          if (!labels.length) {
            if (tip) tip.textContent = '没识别到动作行，请每行一条文案'
            ctx.toast('未识别到动作文案', true)
            return
          }
          const filled = applyScenarioActionsPasteToCanvas(compose, index, labels)
          if (tip) tip.textContent = `已填入 ${filled} 条动作`
          if (modal) modal.hidden = true
          ctx.toast(`场景 ${index + 1} 右侧已更新 ${filled} 条`)
          return
        }
        const parsed = parseScenarioCopyPaste(raw)
        if (!parsed?.title && !parsed?.checks?.length) {
          if (tip) tip.textContent = '没识别到标题或打勾项'
          ctx.toast('未识别到场景文案', true)
          return
        }
        const filled = applyScenarioCopyPasteToCanvas(compose, index, parsed)
        if (tip) tip.textContent = `已填入标题与 ${parsed.checks?.length || 0} 条打勾项`
        if (modal) modal.hidden = true
        ctx.toast(`场景 ${index + 1} 左侧已更新（${filled} 项）`)
        return
      }

      const openArch = event.target.closest('[data-agents-arch-paste-open]')
      if (openArch) {
        event.preventDefault()
        event.stopPropagation()
        const modal = compose.querySelector('[data-agents-arch-paste-modal]')
        if (!modal) return
        const side = openArch.dataset.archSide === 'right' ? 'right' : 'left'
        modal.dataset.archSide = side
        const heading = modal.querySelector('[data-agents-arch-paste-heading]')
        const tip = modal.querySelector('[data-agents-arch-paste-tip]')
        const textarea = modal.querySelector('[data-agents-arch-paste]')
        if (heading) heading.textContent = side === 'right' ? '接入区 · 右侧批量粘贴' : '接入区 · 左侧批量粘贴'
        if (tip) tip.textContent = side === 'right' ? '填入右侧执行项文案' : '填入左侧系统文案'
        if (textarea) {
          textarea.value = ''
          textarea.placeholder = 'PMS与预订渠道、住客与协议管理、智能门锁与门禁、客房控制与物联、财务账单与工单。'
        }
        modal.hidden = false
        textarea?.focus()
        return
      }
      if (event.target.closest('[data-agents-arch-paste-modal-close]')) {
        event.preventDefault()
        const modal = compose.querySelector('[data-agents-arch-paste-modal]')
        if (modal) modal.hidden = true
        return
      }
      const applyArch = event.target.closest('[data-agents-arch-paste-apply]')
      if (applyArch) {
        event.preventDefault()
        const modal = compose.querySelector('[data-agents-arch-paste-modal]')
        const side = modal?.dataset.archSide === 'right' ? 'right' : 'left'
        const textarea = compose.querySelector('[data-agents-arch-paste]')
        const tip = compose.querySelector('[data-agents-arch-paste-tip]')
        const labels = parseArchLabelsPaste(textarea?.value || '')
        if (!labels.length) {
          if (tip) tip.textContent = '没识别到条目，请用顿号「、」分隔'
          ctx.toast('未识别到接入项', true)
          return
        }
        const filled = applyArchLabelsPasteToCanvas(compose, side, labels)
        if (tip) tip.textContent = `已填入 ${filled} 条`
        if (modal) modal.hidden = true
        ctx.toast(`接入区${side === 'right' ? '右侧' : '左侧'}已更新 ${filled} 条`)
        return
      }

      const openOutcomes = event.target.closest('[data-agents-outcomes-paste-open]')
      if (openOutcomes) {
        event.preventDefault()
        event.stopPropagation()
        const modal = compose.querySelector('[data-agents-outcomes-paste-modal]')
        if (!modal) return
        const textarea = modal.querySelector('[data-agents-outcomes-paste]')
        if (textarea) textarea.value = ''
        modal.hidden = false
        textarea?.focus()
        return
      }
      if (event.target.closest('[data-agents-outcomes-paste-modal-close]')) {
        event.preventDefault()
        const modal = compose.querySelector('[data-agents-outcomes-paste-modal]')
        if (modal) modal.hidden = true
        return
      }
      const applyOutcomes = event.target.closest('[data-agents-outcomes-paste-apply]')
      if (applyOutcomes) {
        event.preventDefault()
        const modal = compose.querySelector('[data-agents-outcomes-paste-modal]')
        const textarea = compose.querySelector('[data-agents-outcomes-paste]')
        const tip = compose.querySelector('[data-agents-outcomes-paste-tip]')
        const items = parseOutcomesPaste(textarea?.value || '')
        if (!items.length) {
          if (tip) tip.textContent = '没识别到成效，请每行「标题：说明」'
          ctx.toast('未识别到业务成效', true)
          return
        }
        const filled = applyOutcomesPasteToCanvas(compose, items)
        if (tip) tip.textContent = `已填入 ${items.length} 条成效`
        if (modal) modal.hidden = true
        ctx.toast(`业务成效已更新 ${items.length} 条（${filled} 项字段）`)
        return
      }
    })
    compose.addEventListener('paste', (event) => {
      if (event.target.closest('[data-agents-flow-paste], [data-agents-scenario-paste], [data-agents-arch-paste], [data-agents-outcomes-paste]')) return
      const editable = event.target.closest('[data-edit-path]')
      if (!editable) return
      event.preventDefault()
      const raw = (event.clipboardData || window.clipboardData)?.getData('text/plain') || ''
      const multiline = editable.dataset.editMultiline === 'true'
      const clean = multiline
        ? String(raw).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
        : String(raw).replace(/\s*\n+\s*/g, ' ').replace(/\s+/g, ' ').trim()
      document.execCommand('insertText', false, clean)
      sanitizeAgentEditable(editable)
    })
    compose.addEventListener(
      'blur',
      (event) => {
        const editable = event.target.closest?.('[data-edit-path]')
        if (editable) sanitizeAgentEditable(editable)
      },
      true,
    )
    compose.addEventListener('keydown', (event) => {
      const editable = event.target.closest('[data-edit-path]')
      if (!editable) return
      if (event.key === 'Enter' && editable.dataset.editMultiline !== 'true') {
        event.preventDefault()
        sanitizeAgentEditable(editable)
        editable.blur()
      }
    })
  }

  compose.addEventListener('click', async (event) => {
    if (kind === 'agents') {
      const canvasLink = event.target.closest('[data-agents-detail-visual] a')
      if (canvasLink) {
        event.preventDefault()
      }
      const heroBtn = event.target.closest('[data-agents-detail-visual] [data-edit-hero-media]')
      const imageBtn = heroBtn || event.target.closest('[data-agents-detail-visual] [data-edit-image]')
      if (imageBtn) {
        event.preventDefault()
        event.stopPropagation()
        const isHero = Boolean(imageBtn.matches?.('[data-edit-hero-media]') || imageBtn.hasAttribute?.('data-edit-hero-media'))
        const path = imageBtn.dataset.editImage || ''
        const modal = compose.querySelector('[data-agents-detail-image-modal]')
        if (!modal || (!path && !isHero)) return
        const guide = resolveAgentImageGuide(isHero ? 'spacePage.heroImage' : path)
        modal.dataset.imagePath = path
        modal.dataset.heroMode = isHero ? '1' : ''
        const typeWrap = modal.querySelector('[data-agents-detail-media-type-wrap]')
        const title = modal.querySelector('[data-agents-detail-media-title]')
        if (typeWrap) typeWrap.hidden = !isHero
        if (title) title.textContent = isHero ? '更换图片或视频' : '更换图片'
        const label = modal.querySelector('[data-agents-detail-image-size-label]')
        const value = modal.querySelector('[data-agents-detail-image-size-value]')
        const tip = modal.querySelector('[data-agents-detail-image-size-tip]')
        if (label) label.textContent = guide.label
        if (value) value.textContent = guide.size
        if (tip) tip.textContent = guide.tip
        const imageUrl =
          imageBtn.dataset.editImageUrl != null
            ? imageBtn.dataset.editImageUrl
            : imageBtn.querySelector('img')?.getAttribute('src') || ''
        const videoUrl = imageBtn.dataset.editVideoUrl || imageBtn.querySelector('video')?.getAttribute('src') || ''
        const mediaType = isHero && videoUrl ? 'video' : 'image'
        setAgentsDetailMediaType(modal, mediaType)
        const urlInput = modal.querySelector('[data-agents-detail-image-url]')
        const posterInput = modal.querySelector('[data-agents-detail-poster-url]')
        if (urlInput) urlInput.value = mediaType === 'video' ? videoUrl : imageUrl
        if (posterInput) posterInput.value = imageUrl
        setAgentsDetailImagePreview(modal, mediaType === 'video' ? videoUrl : imageUrl, mediaType)
        modal.hidden = false
        return
      }
      const mediaType = event.target.closest('[data-agents-detail-media-type]')
      if (mediaType) {
        const modal = compose.querySelector('[data-agents-detail-image-modal]')
        if (!modal) return
        setAgentsDetailMediaType(modal, mediaType.value)
        const urlInput = modal.querySelector('[data-agents-detail-image-url]')
        const posterInput = modal.querySelector('[data-agents-detail-poster-url]')
        if (mediaType.value === 'video') {
          setAgentsDetailImagePreview(modal, urlInput?.value.trim() || '', 'video')
        } else {
          setAgentsDetailImagePreview(modal, urlInput?.value.trim() || posterInput?.value.trim() || '', 'image')
        }
        return
      }
      if (event.target.closest('[data-agents-detail-image-modal-close]')) {
        event.preventDefault()
        const modal = compose.querySelector('[data-agents-detail-image-modal]')
        if (modal) modal.hidden = true
        return
      }
      if (event.target.closest('[data-agents-detail-image-modal-save]')) {
        event.preventDefault()
        const modal = compose.querySelector('[data-agents-detail-image-modal]')
        const path = modal?.dataset.imagePath || ''
        const isHero = modal?.dataset.heroMode === '1'
        const mediaType = modal?.dataset.mediaType || 'image'
        const url = modal?.querySelector('[data-agents-detail-image-url]')?.value.trim() || ''
        const poster = modal?.querySelector('[data-agents-detail-poster-url]')?.value.trim() || ''
        if (isHero) {
          if (mediaType === 'video') {
            if (url && !isHttpVideoUrl(url)) {
              ctx.toast('请填写有效的在线视频地址（http/https），或上传本地视频', true)
              return
            }
            applyAgentsDetailHeroMedia(compose, { imageUrl: poster, videoUrl: url })
            if (url) ctx.toast('已应用在线视频，记得点「发布上线」')
          } else {
            applyAgentsDetailHeroMedia(compose, { imageUrl: url, videoUrl: '' })
          }
        } else {
          applyAgentsDetailImage(compose, path, url)
        }
        if (modal) modal.hidden = true
        return
      }
    }
    const jump = kind === 'solutions' ? event.target.closest('[data-sol-goto]') : null
    if (jump) {
      event.preventDefault()
      showSolutionSection(jump.dataset.solGoto)
      return
    }
    const addCard = kind === 'solutions' ? event.target.closest('[data-sol-cards-add]') : null
    if (addCard) {
      event.preventDefault()
      const path = addCard.getAttribute('data-sol-cards-add')
      const article = collectFields(compose, kind)
      const normalize = path === 'scenarios' ? asScene : path === 'hardware' ? asHardwareCard : asFaq
      const blank = path === 'scenarios' ? { title: '', imageUrl: article.image || '' } : { ...EMPTY_CARD[path] }
      article[path] = [...asCards(article[path], normalize), blank]
      renderSolutionCompose(article)
      return
    }
    const removeCard = kind === 'solutions' ? event.target.closest('[data-sol-cards-remove]') : null
    if (removeCard) {
      event.preventDefault()
      const path = removeCard.getAttribute('data-sol-cards-remove')
      const index = Number(removeCard.getAttribute('data-sol-list-index'))
      const article = collectFields(compose, kind)
      const normalize = path === 'scenarios' ? asScene : path === 'hardware' ? asHardwareCard : asFaq
      const rows = asCards(article[path], normalize)
      if (rows.length <= 1) return
      rows.splice(index, 1)
      article[path] = rows
      renderSolutionCompose(article)
      return
    }
    if (kind === 'solutions' && event.target.closest('[data-sol-list-add]')) {
      event.preventDefault()
      const path = event.target.closest('[data-sol-list-add]').getAttribute('data-sol-list-add')
      const article = collectFields(compose, kind)
      article[path] = [...asList(article[path]), '']
      renderSolutionCompose(article)
      return
    }
    const removeList = kind === 'solutions' ? event.target.closest('[data-sol-list-remove]') : null
    if (removeList) {
      event.preventDefault()
      const path = removeList.getAttribute('data-sol-list-remove')
      const index = Number(removeList.getAttribute('data-sol-list-index'))
      const article = collectFields(compose, kind)
      const rows = asList(article[path])
      if (rows.length <= 1) return
      rows.splice(index, 1)
      article[path] = rows
      renderSolutionCompose(article)
      return
    }
    if (kind === 'solutions' && event.target.closest('[data-solutions-slide-add]')) {
      event.preventDefault()
      const article = collectFields(compose, kind)
      article.slides = [...(article.slides || []), { imageUrl: '' }]
      renderSolutionCompose(article)
      return
    }
    const removeSlide = kind === 'solutions' ? event.target.closest('[data-solutions-slide-remove]') : null
    if (removeSlide) {
      event.preventDefault()
      const article = collectFields(compose, kind)
      const index = Number(removeSlide.dataset.solutionsSlideRemove)
      const slides = [...(article.slides || [])]
      if (slides.length <= 1) return
      slides.splice(index, 1)
      article.slides = slides
      renderSolutionCompose(article)
      return
    }
    if (event.target.closest(`[data-${kind}-compose-back]`)) {
      event.preventDefault()
      closeCompose(kind)
      return
    }
    if (event.target.closest(`[data-${kind}-compose-publish]`)) {
      event.preventDefault()
      const button = event.target.closest(`[data-${kind}-compose-publish]`)
      const article = kind === 'agents' ? collectAgentArticle(compose) : collectFields(compose, kind)
      if (!article.name?.trim()) {
        ctx.toast('请填写名称', true)
        return
      }
      button.disabled = true
      try {
        const page = kind === 'solutions' ? ctx.state.solutionsLibrary : ctx.state.agentsLibrary
        const items = [...(page?.draftContent?.items || [])]
        const index = ctx.state[`${kind}ComposeIndex`]
        if (index >= 0 && items[index]) items[index] = { ...items[index], ...article }
        else items.unshift(article)
        await persistKind(kind, items, '详情已发布')
        closeCompose(kind)
      } catch (error) {
        ctx.toast(error.message, true)
      } finally {
        button.disabled = false
      }
    }
  })
  compose.addEventListener('input', (event) => {
    if (kind === 'agents') {
      const modal = compose.querySelector('[data-agents-detail-image-modal]')
      const urlInput = event.target.closest('[data-agents-detail-image-url]')
      if (modal && !modal.hidden && urlInput) {
        const mediaType = modal.dataset.mediaType || 'image'
        setAgentsDetailImagePreview(modal, urlInput.value.trim(), mediaType)
        return
      }
    }
    const el = event.target.closest(`[data-${kind}-field]`)
    if (!el) return
    const path = el.getAttribute(`data-${kind}-field`)
    const preview = compose.querySelector(`[data-${kind}-preview-for="${path}"]`)
    if (preview) {
      preview.src = el.value.trim()
      preview.hidden = !el.value.trim()
    }
    if (kind === 'agents' && path === 'name') {
      const title = document.querySelector('[data-agents-compose-title]')
      if (title) title.textContent = `可视化编辑 · ${el.value.trim() || '未命名智能体'}`
    }
  })
  compose.addEventListener('change', async (event) => {
    if (kind === 'agents') {
      const modal = compose.querySelector('[data-agents-detail-image-modal]')
      const videoFile = event.target.closest('[data-agents-detail-video-file]')
      if (videoFile?.files?.[0]) {
        const file = videoFile.files[0]
        videoFile.disabled = true
        try {
          const formData = new FormData()
          formData.append('video', file)
          const { url } = await ctx.api('/pages/media/video', { method: 'POST', body: formData })
          setAgentsDetailMediaType(modal, 'video')
          const urlInput = modal?.querySelector('[data-agents-detail-image-url]')
          if (urlInput) urlInput.value = url
          setAgentsDetailImagePreview(modal, url, 'video')
          ctx.toast('视频已上传，点确定应用')
        } catch (error) {
          ctx.toast(error.message, true)
        } finally {
          videoFile.disabled = false
          videoFile.value = ''
        }
        return
      }
      const modalFile = event.target.closest('[data-agents-detail-image-file]')
      if (modalFile?.files?.[0]) {
        const file = modalFile.files[0]
        modalFile.disabled = true
        try {
          const formData = new FormData()
          formData.append('image', file)
          const { url } = await ctx.api('/pages/media/image', { method: 'POST', body: formData })
          const mediaType = modal?.dataset.mediaType || 'image'
          if (mediaType === 'video') {
            const posterInput = modal?.querySelector('[data-agents-detail-poster-url]')
            if (posterInput) posterInput.value = url
            setAgentsDetailImagePreview(modal, modal.querySelector('[data-agents-detail-image-url]')?.value.trim() || '', 'video')
            ctx.toast('封面图已上传，点确定应用')
          } else {
            const urlInput = modal?.querySelector('[data-agents-detail-image-url]')
            if (urlInput) urlInput.value = url
            setAgentsDetailImagePreview(modal, url, 'image')
            ctx.toast('图片已上传，点确定应用')
          }
        } catch (error) {
          ctx.toast(error.message, true)
        } finally {
          modalFile.disabled = false
          modalFile.value = ''
        }
        return
      }
    }
    const upload = event.target.closest(`[data-${kind}-upload-for]`)
    const file = upload?.files?.[0]
    if (!upload || !file) return
    upload.disabled = true
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { url } = await ctx.api('/pages/media/image', { method: 'POST', body: formData })
      const path = upload.getAttribute(`data-${kind}-upload-for`)
      const input = compose.querySelector(`[data-${kind}-field="${path}"]`)
      if (input) {
        input.value = url
        input.dispatchEvent(new Event('input', { bubbles: true }))
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

export function bindContentCenter(helpers) {
  ctx = { ...ctx, ...helpers }
  document.querySelector('[data-content-switch]')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-content-kind]')
    if (!button) return
    event.preventDefault()
    showContentKind(button.dataset.contentKind)
    const title = document.querySelector('[data-page-title]')
    const subtitle = document.querySelector('[data-page-subtitle]')
    const map = {
      news: ['内容中心 · 新闻', '路径 /news/ · 编辑新闻稿件'],
      solutions: ['内容中心 · 行业解决方案', '路径 /solutions/?id= · 编辑方案详情'],
      agents: ['内容中心 · 空间智能体', '路径 /agent-detail/?id= · 可视化编辑智能体详情'],
      products: ['内容中心 · 商品详情', '路径 /hardware/product/ · 编辑硬件商品详情'],
    }
    const pair = map[button.dataset.contentKind]
    if (title && pair) title.textContent = pair[0]
    if (subtitle && pair) subtitle.textContent = pair[1]
    document.querySelectorAll('[data-tab]').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === 'content'))
  })
  document.querySelector('[data-solutions-form]')?.addEventListener('submit', (event) => event.preventDefault())
  document.querySelector('[data-agents-form]')?.addEventListener('submit', (event) => event.preventDefault())
  bindKind('solutions')
  bindKind('agents')
}

export function contentKindFromHash(name) {
  if (name === 'page-news' || name === 'content' || name === 'content-news') return 'news'
  if (name === 'page-products' || name === 'content-products') return 'products'
  if (name === 'content-solutions') return 'solutions'
  if (name === 'content-agents') return 'agents'
  return null
}
