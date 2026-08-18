const CONTENT_KINDS = [
  { id: 'news', label: '新闻', desc: '新闻稿件' },
  { id: 'solutions', label: '行业解决方案', desc: '方案详情页' },
  { id: 'agents', label: '空间智能体', desc: '智能体详情页' },
  { id: 'products', label: '商品详情', desc: '硬件商品详情页' },
]

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
  { id: 'scenarios', no: '03', title: '运营场景', desc: '详情页场景卡片' },
  { id: 'journey', no: '04', title: '客户旅程', desc: '端到端步骤' },
  { id: 'stack', no: '05', title: '智能体与硬件', desc: '组合清单' },
  { id: 'faq', no: '06', title: '常见问题', desc: '痛点与做法' },
  { id: 'values', no: '07', title: '列表页价值', desc: '方案列表三卡' },
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
    scenarios: [],
    pains: [],
    approach: '',
    journey: [],
    agents: [],
    hardware: [],
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
    capabilities: [{}, {}, {}, {}],
    workflow: [{}, {}, {}, {}],
    metrics: [{}, {}, {}],
    scenarios: [],
    published: true,
  }
}

function renderKindList(kind, items, previewBase) {
  const editor = document.querySelector(`[data-${kind}-editor]`)
  if (!editor) return
  editor.classList.add('admin-news-editor')
  const addLabel = kind === 'solutions' ? '新建方案' : '新建智能体'
  editor.innerHTML = `
    <div class="admin-news-toolbar">
      <p class="admin-form-section__hint" style="margin:0">这里编辑详情页内容。对应频道页只负责首屏和列表关联。</p>
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
          <p class="admin-form-section__hint">详情页 PPT 下方「覆盖关键运营场景」，每条一个短标题。</p>
          ${listEditor('solutions', 'scenarios', item.scenarios, { placeholder: '例如 多楼栋统一运营', addLabel: '添加场景', max: 12 })}
        </fieldset>
        <fieldset data-sol-section="journey">
          <legend>客户旅程</legend>
          <p class="admin-form-section__hint">详情页「端到端客户旅程」步骤。</p>
          ${listEditor('solutions', 'journey', item.journey, { placeholder: '例如 到访接待', addLabel: '添加步骤', max: 8 })}
        </fieldset>
        <fieldset data-sol-section="stack">
          <legend>智能体与硬件</legend>
          <p class="admin-form-section__hint">详情页组合清单。智能体填详情页标识，如 space、visitor。</p>
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
            <div class="admin-sol-stack__wide">
              <h4 class="admin-sol-label">关联硬件 / 系统</h4>
              ${listEditor('solutions', 'hardware', item.hardware, { placeholder: '例如 门禁闸机', addLabel: '添加硬件', max: 12 })}
            </div>
          </div>
        </fieldset>
        <fieldset data-sol-section="faq">
          <legend>常见问题</legend>
          <p class="admin-form-section__hint">不单独成段，会拼进详情页 FAQ。</p>
          <h4 class="admin-sol-label">行业痛点</h4>
          ${listEditor('solutions', 'pains', item.pains, { placeholder: '例如 多楼栋系统割裂', addLabel: '添加痛点', max: 8 })}
          ${field('solutions', 'approach', '方案做法', item.approach, { type: 'textarea', wide: true, rows: 5, placeholder: '用一两段话说明怎么组合智能体与硬件落地' })}
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

function renderAgentCompose(item) {
  const body = document.querySelector('[data-agents-compose-body]')
  const caps = [...(item.capabilities || []), {}, {}, {}, {}].slice(0, 4)
  const steps = [...(item.workflow || []), {}, {}, {}, {}].slice(0, 4)
  const metrics = [...(item.metrics || []), {}, {}, {}].slice(0, 3)
  body.innerHTML = `
    <div class="admin-form-grid">
      <input type="hidden" data-agents-field="id" value="${esc(item.id || '')}" />
      ${field('agents', 'name', '智能体名称', item.name, { wide: true, placeholder: '例如 空间服务智能体' })}
      ${field('agents', 'id', '详情页标识', item.id, { help: '出现在 /agent-detail/?id= 后面' })}
      ${field('agents', 'shortName', '短名', item.shortName)}
      ${field('agents', 'icon', '图标', item.icon)}
      ${field('agents', 'eyebrow', '英文眉题', item.eyebrow)}
      ${field('agents', 'accent', '强调色 RGB', item.accent, { help: '如 0, 82, 209' })}
      ${field('agents', 'blurb', '列表简介', item.blurb, { type: 'textarea', rows: 2, wide: true })}
      ${field('agents', 'tagline', '详情副标题', item.tagline, { type: 'textarea', rows: 2, wide: true })}
      ${field('agents', 'overview', '详情概述', item.overview, { type: 'textarea', rows: 4, wide: true })}
      ${field('agents', 'value', '价值', item.value, { type: 'textarea', rows: 2, wide: true })}
      ${field('agents', 'trigger', '触发', item.trigger, { type: 'textarea', rows: 2 })}
      ${field('agents', 'action', '动作', item.action, { type: 'textarea', rows: 2 })}
      ${field('agents', 'result', '结果', item.result, { type: 'textarea', rows: 2 })}
      ${field('agents', 'sceneImage', '场景图', item.sceneImage, { image: true, wide: true, size: '1200×800' })}
      ${field('agents', 'scenarios', '适用场景', lines(item.scenarios), { type: 'textarea', rows: 3, wide: true, help: '每行一条' })}
      ${caps.map((row, index) => `
        <div class="admin-product-card admin-form-wide">
          <h4>能力 ${index + 1}</h4>
          <div class="admin-form-grid">
            ${field('agents', `capabilities.${index}.title`, '标题', row.title || '')}
            ${field('agents', `capabilities.${index}.icon`, '图标', row.icon || '')}
            ${field('agents', `capabilities.${index}.desc`, '说明', row.desc || '', { type: 'textarea', rows: 2, wide: true })}
          </div>
        </div>`).join('')}
      ${steps.map((row, index) => `
        <div class="admin-product-card admin-form-wide">
          <h4>运行机制 ${index + 1}</h4>
          <div class="admin-form-grid">
            ${field('agents', `workflow.${index}.title`, '步骤', row.title || '')}
            ${field('agents', `workflow.${index}.desc`, '说明', row.desc || '', { type: 'textarea', rows: 2, wide: true })}
          </div>
        </div>`).join('')}
      ${metrics.map((row, index) => `
        <div class="admin-product-card">
          <h4>指标 ${index + 1}</h4>
          ${field('agents', `metrics.${index}.value`, '数值/标签', row.value || '')}
          ${field('agents', `metrics.${index}.label`, '说明', row.label || '')}
        </div>`).join('')}
      <label class="admin-news-pin admin-form-wide">
        <input data-agents-field="published" type="checkbox"${item.published !== false ? ' checked' : ''} />
        <span><b>发布后前台可见</b></span>
      </label>
    </div>`
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
  const item = index >= 0 ? items[index] : (kind === 'solutions' ? emptySolution() : emptyAgent())
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
  compose.addEventListener('click', async (event) => {
    const jump = kind === 'solutions' ? event.target.closest('[data-sol-goto]') : null
    if (jump) {
      event.preventDefault()
      showSolutionSection(jump.dataset.solGoto)
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
      const article = collectFields(compose, kind)
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
    const el = event.target.closest(`[data-${kind}-field]`)
    if (!el) return
    const path = el.getAttribute(`data-${kind}-field`)
    const preview = compose.querySelector(`[data-${kind}-preview-for="${path}"]`)
    if (preview) {
      preview.src = el.value.trim()
      preview.hidden = !el.value.trim()
    }
  })
  compose.addEventListener('change', async (event) => {
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
      agents: ['内容中心 · 空间智能体', '路径 /agent-detail/?id= · 编辑智能体详情'],
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
