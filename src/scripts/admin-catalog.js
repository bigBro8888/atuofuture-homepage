export function catalogField(path, label, value, options = {}) {
  const type = options.type || 'text'
  let field
  if (type === 'textarea') {
    field = `<textarea data-catalog-field="${path}" rows="${options.rows || 3}">${escape(value ?? '')}</textarea>`
  } else if (type === 'select') {
    const opts = (options.options || []).map(([key, text]) => `<option value="${escape(key)}"${String(value) === String(key) ? ' selected' : ''}>${escape(text)}</option>`).join('')
    field = `<select data-catalog-field="${path}">${opts}</select>`
  } else {
    field = `<input data-catalog-field="${path}" type="${type}" value="${escape(value ?? '')}" />`
  }
  const media = options.image
    ? `<div class="admin-home-media">
        <img data-catalog-preview-for="${path}" src="${escape(value ?? '')}" alt="" ${value ? '' : 'hidden'} />
        <label class="admin-home-upload">上传图片<input type="file" accept="image/jpeg,image/png,image/webp" data-catalog-upload-for="${path}" /></label>
      </div>`
    : ''
  return `<label class="${options.wide ? 'admin-form-wide' : ''}"><span>${label}</span>${field}${options.help ? `<small>${options.help}</small>` : ''}${media}</label>`
}

function escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[character]))
}

function row(title, subtitle, action) {
  return `<div class="admin-item-row">
    <div><strong>${escape(title)}</strong>${subtitle ? `<small>${escape(subtitle)}</small>` : ''}</div>
    <span class="admin-slide-tools">${action}</span>
  </div>`
}

export function renderAgentsCatalog(content) {
  return `
    <aside class="admin-home-outline">
      <p>对照 /agents/ 从上到下，点编辑改这一项</p>
    </aside>
    <div class="admin-home-stage">
      <fieldset>
        <legend>01 首屏</legend>
        <div class="admin-form-grid">
          ${catalogField('hero.title', '主标题', content.hero.title, { wide: true })}
          ${catalogField('hero.subtitle', '副标题', content.hero.subtitle, { type: 'textarea', wide: true })}
          ${catalogField('hero.bannerUrl', 'Banner 图', content.hero.bannerUrl, { image: true, wide: true })}
          ${catalogField('hero.ctaLabel', '预约按钮', content.hero.ctaLabel)}
          ${catalogField('hero.exploreLabel', '探索按钮', content.hero.exploreLabel)}
        </div>
      </fieldset>
      <fieldset>
        <legend>02 能力链</legend>
        <div class="admin-home-list">${(content.chain || []).map((item, index) => row(item.title, item.icon, `<button type="button" data-catalog-edit="chain" data-item-index="${index}">编辑</button>`)).join('')}</div>
      </fieldset>
      <fieldset>
        <legend>03 中枢图层</legend>
        <div class="admin-form-grid">
          ${catalogField('hub.software.title', '软件系统标题', content.hub.software.title)}
          ${catalogField('hub.software.items', '软件系统条目', (content.hub.software.items || []).join('、'), { wide: true, help: '顿号分隔' })}
          ${catalogField('hub.hardware.title', '智能硬件标题', content.hub.hardware.title)}
          ${catalogField('hub.hardware.items', '智能硬件条目', (content.hub.hardware.items || []).join('、'), { wide: true, help: '顿号分隔' })}
          ${catalogField('hub.ecosystem.title', '第三方生态标题', content.hub.ecosystem.title)}
          ${catalogField('hub.ecosystem.items', '第三方生态条目', (content.hub.ecosystem.items || []).join('、'), { wide: true, help: '顿号分隔' })}
        </div>
      </fieldset>
      <fieldset>
        <legend>04 八大智能体</legend>
        <p class="admin-form-section__hint">每个智能体的名称、介绍、任务流程和场景图都可以改。</p>
        <div class="admin-form-grid">${catalogField('ecoTitle', '区块标题', content.ecoTitle, { wide: true })}</div>
        <div class="admin-home-list">${(content.agents || []).map((item, index) => row(item.name, item.blurb, `<button type="button" data-catalog-edit="agent" data-item-index="${index}">编辑</button>`)).join('')}</div>
      </fieldset>
      <fieldset>
        <legend>05 任务故事区</legend>
        <div class="admin-form-grid">
          ${catalogField('story.title', '标题', content.story.title, { wide: true })}
          ${catalogField('story.subtitle', '说明', content.story.subtitle, { type: 'textarea', wide: true })}
        </div>
      </fieldset>
      <fieldset>
        <legend>06 行业组合</legend>
        <div class="admin-home-list">${(content.industries || []).map((item, index) => row(item.title, item.navDesc, `<button type="button" data-catalog-edit="industry" data-item-index="${index}">编辑</button>`)).join('')}</div>
      </fieldset>
      <fieldset>
        <legend>07 底部行动</legend>
        <div class="admin-form-grid">
          ${catalogField('cta.title', '标题', content.cta.title, { wide: true })}
          ${catalogField('cta.body', '说明', content.cta.body, { type: 'textarea', wide: true })}
          ${catalogField('cta.primary', '主按钮', content.cta.primary)}
          ${catalogField('cta.secondaryLabel', '次按钮', content.cta.secondaryLabel)}
          ${catalogField('cta.secondaryHref', '次按钮链接', content.cta.secondaryHref, { wide: true })}
        </div>
      </fieldset>
    </div>`
}

export function renderHardwareCatalog(content) {
  const products = content.products || []
  const byLine = (lineId) => products.filter((item) => item.productLine === lineId)
  return `
    <aside class="admin-home-outline">
      <p>对照 /hardware/ 从上到下：三大产品线图标、每个产品面板、空间/零售/3C 区块都可以改。</p>
    </aside>
    <div class="admin-home-stage">
      <fieldset>
        <legend>01 首屏</legend>
        <div class="admin-form-grid">
          ${catalogField('hero.title', '主标题', content.hero.title, { wide: true })}
          ${catalogField('hero.subtitle', '副标题', content.hero.subtitle, { type: 'textarea', wide: true })}
          ${catalogField('hero.bannerUrl', 'Banner 图', content.hero.bannerUrl, { image: true, wide: true })}
          ${catalogField('hero.browseLabel', '浏览按钮', content.hero.browseLabel)}
          ${catalogField('hero.ctaLabel', '咨询按钮', content.hero.ctaLabel)}
        </div>
      </fieldset>
      <fieldset>
        <legend>02 三大产品线</legend>
        <p class="admin-form-section__hint">这里对应页面中部三列：空间智能 / 新零售电子纸 / 3C 数码。点编辑改名称和图标。</p>
        <div class="admin-home-list">${(content.lines || []).map((item, index) => row(item.name, item.description, `<button type="button" data-catalog-edit="hwLine" data-item-index="${index}">编辑</button>`)).join('')}</div>
      </fieldset>
      <fieldset>
        <legend>03 产品图标与面板</legend>
        <p class="admin-form-section__hint">每个产品都能改名称、简介、宫格图标、封面图、能力与场景。勾选「显示在产品线宫格」后会出现在对应分类图标区。</p>
        <button type="button" class="admin-add-slide" data-catalog-add="hwProduct">+ 新增产品</button>
        ${(content.lines || []).map((line) => `
          <h4 style="margin:16px 0 8px">${line.name}</h4>
          <div class="admin-home-list">${byLine(line.id).map((item) => {
            const index = products.indexOf(item)
            return row(item.overviewLabel || item.name, item.shortDescription, `<button type="button" data-catalog-edit="hwProduct" data-item-index="${index}">编辑</button>`)
          }).join('') || '<p class="admin-form-section__hint">这一类还没有产品。</p>'}</div>`).join('')}
      </fieldset>
      <fieldset>
        <legend>04 空间智能区块</legend>
        <div class="admin-form-grid">
          ${catalogField('space.kicker', '小标题', content.space.kicker)}
          ${catalogField('space.title', '区块标题', content.space.title, { wide: true })}
          ${catalogField('space.subtitle', '说明', content.space.subtitle, { type: 'textarea', wide: true })}
          ${catalogField('space.flagshipId', '旗舰产品 ID', content.space.flagshipId, { help: '例如 control-screen' })}
          ${catalogField('space.flagshipTag', '旗舰标签', content.space.flagshipTag)}
          ${catalogField('space.matrixTitle', '配套硬件标题', content.space.matrixTitle, { wide: true })}
          ${catalogField('space.matrixSubtitle', '配套硬件说明', content.space.matrixSubtitle, { type: 'textarea', wide: true })}
          ${catalogField('space.flowTitle', '协同流程标题', content.space.flowTitle, { wide: true })}
          ${catalogField('space.flowSubtitle', '协同流程说明', content.space.flowSubtitle, { type: 'textarea', wide: true })}
          ${catalogField('space.flowLinkLabel', '方案链接文字', content.space.flowLinkLabel, { wide: true })}
        </div>
        <div class="admin-home-list">${(content.flow || []).map((item, index) => row(item.title, item.desc, `<button type="button" data-catalog-edit="hwFlow" data-item-index="${index}">编辑</button>`)).join('')}</div>
      </fieldset>
      <fieldset>
        <legend>05 新零售区块</legend>
        <div class="admin-form-grid">
          ${catalogField('retail.kicker', '小标题', content.retail.kicker)}
          ${catalogField('retail.title', '区块标题', content.retail.title, { wide: true })}
          ${catalogField('retail.subtitle', '说明', content.retail.subtitle, { type: 'textarea', wide: true })}
        </div>
      </fieldset>
      <fieldset>
        <legend>06 3C 数码区块</legend>
        <div class="admin-form-grid">
          ${catalogField('consumer.kicker', '小标题', content.consumer.kicker)}
          ${catalogField('consumer.title', '区块标题', content.consumer.title, { wide: true })}
          ${catalogField('consumer.subtitle', '说明', content.consumer.subtitle, { type: 'textarea', wide: true })}
        </div>
      </fieldset>
      <fieldset>
        <legend>07 底部行动</legend>
        <div class="admin-form-grid">
          ${catalogField('cta.title', '标题', content.cta.title, { wide: true })}
          ${catalogField('cta.body', '说明', content.cta.body, { type: 'textarea', wide: true })}
          ${catalogField('cta.primary', '主按钮', content.cta.primary)}
          ${catalogField('cta.secondary', '次按钮', content.cta.secondary)}
        </div>
      </fieldset>
    </div>`
}

export function renderSolutionsCatalog(content) {
  return `
    <aside class="admin-home-outline">
      <p>对照 /solutions/ 从上到下，点编辑改这一项</p>
    </aside>
    <div class="admin-home-stage">
      <fieldset>
        <legend>01 首屏</legend>
        <div class="admin-form-grid">
          ${catalogField('hero.title', '主标题', content.hero.title, { wide: true })}
          ${catalogField('hero.subtitle', '副标题', content.hero.subtitle, { type: 'textarea', wide: true })}
          ${catalogField('hero.bannerUrl', 'Banner 图', content.hero.bannerUrl, { image: true, wide: true })}
          ${catalogField('hero.ctaLabel', '按钮文字', content.hero.ctaLabel)}
        </div>
      </fieldset>
      <fieldset>
        <legend>02 行业场景</legend>
        <div class="admin-form-grid">${catalogField('sceneTitle', '区块标题', content.sceneTitle, { wide: true })}</div>
        <p class="admin-form-section__hint">每个行业的图片、价值点和方案详情都可以改。</p>
        <div class="admin-home-list">${(content.items || []).map((item, index) => row(item.name, item.summary, `<button type="button" data-catalog-edit="solution" data-item-index="${index}">编辑</button>`)).join('')}</div>
      </fieldset>
      <fieldset>
        <legend>03 智能底座</legend>
        <div class="admin-form-grid">
          ${catalogField('base.title', '标题', content.base.title, { wide: true })}
          ${catalogField('base.subtitle', '说明', content.base.subtitle, { type: 'textarea', wide: true })}
        </div>
        <div class="admin-home-list">${(content.base.nodes || []).map((item, index) => row(item.title, item.desc, `<button type="button" data-catalog-edit="baseNode" data-item-index="${index}">编辑</button>`)).join('')}</div>
      </fieldset>
      <fieldset>
        <legend>04 底部行动</legend>
        <div class="admin-form-grid">
          ${catalogField('cta.title', '标题', content.cta.title, { wide: true })}
          ${catalogField('cta.body', '说明', content.cta.body, { type: 'textarea', wide: true })}
          ${catalogField('cta.primary', '主按钮', content.cta.primary)}
          ${catalogField('cta.secondaryLabel', '次按钮', content.cta.secondaryLabel)}
          ${catalogField('cta.secondaryHref', '次按钮链接', content.cta.secondaryHref)}
          ${catalogField('cta.imageUrl', '右侧配图', content.cta.imageUrl, { image: true, wide: true })}
        </div>
      </fieldset>
    </div>`
}

export function catalogItemFields(kind, item, index) {
  if (kind === 'chain') {
    return `${catalogField(`chain.${index}.title`, '步骤名称', item.title)}${catalogField(`chain.${index}.icon`, '图标名', item.icon, { help: 'Material Symbols 名称，如 sensors' })}`
  }
  if (kind === 'agent') {
    return `
      ${catalogField(`agents.${index}.name`, '名称', item.name, { wide: true })}
      ${catalogField(`agents.${index}.shortName`, '短名称', item.shortName)}
      ${catalogField(`agents.${index}.blurb`, '一句话介绍', item.blurb, { wide: true })}
      ${catalogField(`agents.${index}.value`, '价值主张', item.value, { wide: true })}
      ${catalogField(`agents.${index}.trigger`, '触发', item.trigger, { type: 'textarea', wide: true })}
      ${catalogField(`agents.${index}.action`, '动作', item.action, { type: 'textarea', wide: true })}
      ${catalogField(`agents.${index}.result`, '结果', item.result, { type: 'textarea', wide: true })}
      ${catalogField(`agents.${index}.workflow`, '任务步骤', (item.workflow || []).join('\n'), { type: 'textarea', wide: true, rows: 5, help: '一行一步' })}
      ${catalogField(`agents.${index}.icon`, '图标', item.icon)}
      ${catalogField(`agents.${index}.sceneImage`, '场景图', item.sceneImage, { image: true, wide: true })}`
  }
  if (kind === 'industry') {
    return `
      ${catalogField(`industries.${index}.title`, '行业名称', item.title)}
      ${catalogField(`industries.${index}.navDesc`, '导航说明', item.navDesc, { wide: true })}
      ${catalogField(`industries.${index}.desc`, '介绍', item.desc, { type: 'textarea', wide: true })}
      ${catalogField(`industries.${index}.chain`, '协同步骤', (item.chain || []).join('\n'), { type: 'textarea', wide: true, help: '一行一步' })}
      ${catalogField(`industries.${index}.image`, '场景图', item.image, { image: true, wide: true })}
      ${catalogField(`industries.${index}.href`, '跳转链接', item.href, { wide: true })}`
  }
  if (kind === 'solution') {
    const values = item.coreValues || []
    return `
      ${catalogField(`items.${index}.name`, '行业名称', item.name)}
      ${catalogField(`items.${index}.icon`, '图标', item.icon)}
      ${catalogField(`items.${index}.summary`, '摘要', item.summary, { type: 'textarea', wide: true })}
      ${catalogField(`items.${index}.value`, '价值一句话', item.value, { type: 'textarea', wide: true })}
      ${catalogField(`items.${index}.image`, '场景图', item.image, { image: true, wide: true })}
      ${catalogField(`items.${index}.capabilities`, '能力标签', (item.capabilities || []).join('、'), { wide: true, help: '顿号分隔' })}
      ${catalogField(`items.${index}.coreValues.0.title`, '价值点 1 标题', values[0]?.title || '')}
      ${catalogField(`items.${index}.coreValues.0.desc`, '价值点 1 说明', values[0]?.desc || '', { type: 'textarea', wide: true })}
      ${catalogField(`items.${index}.coreValues.1.title`, '价值点 2 标题', values[1]?.title || '')}
      ${catalogField(`items.${index}.coreValues.1.desc`, '价值点 2 说明', values[1]?.desc || '', { type: 'textarea', wide: true })}
      ${catalogField(`items.${index}.coreValues.2.title`, '价值点 3 标题', values[2]?.title || '')}
      ${catalogField(`items.${index}.coreValues.2.desc`, '价值点 3 说明', values[2]?.desc || '', { type: 'textarea', wide: true })}
      ${catalogField(`items.${index}.pains`, '痛点', (item.pains || []).join('\n'), { type: 'textarea', wide: true, help: '一行一条' })}
      ${catalogField(`items.${index}.approach`, '方案思路', item.approach, { type: 'textarea', wide: true })}
      ${catalogField(`items.${index}.journey`, '闭环路径', (item.journey || []).join('\n'), { type: 'textarea', wide: true })}
      ${catalogField(`items.${index}.hardware`, '硬件', (item.hardware || []).join('、'), { wide: true })}`
  }
  if (kind === 'baseNode') {
    return `
      ${catalogField(`base.nodes.${index}.title`, '名称', item.title)}
      ${catalogField(`base.nodes.${index}.desc`, '说明', item.desc, { type: 'textarea', wide: true })}
      ${catalogField(`base.nodes.${index}.icon`, '图标', item.icon)}`
  }
  if (kind === 'hwLine') {
    return `
      ${catalogField(`lines.${index}.name`, '产品线名称', item.name, { wide: true })}
      ${catalogField(`lines.${index}.description`, '说明', item.description, { type: 'textarea', wide: true })}
      ${catalogField(`lines.${index}.icon`, '图标名', item.icon, { help: 'Material Symbols 名称，如 apartment、shopping_bag' })}`
  }
  if (kind === 'hwProduct') {
    return `
      ${catalogField(`products.${index}.name`, '产品名称', item.name, { wide: true })}
      ${catalogField(`products.${index}.overviewLabel`, '宫格短名称', item.overviewLabel || item.name, { help: '出现在三列图标区的文字，可短于正式名称' })}
      ${catalogField(`products.${index}.productLine`, '所属产品线', item.productLine, { type: 'select', options: [['space', '空间智能'], ['retail', '新零售与行业电子纸'], ['consumer', '3C 数码']] })}
      ${catalogField(`products.${index}.showInOverview`, '显示在产品线宫格', String(item.showInOverview !== false), { type: 'select', options: [['true', '显示'], ['false', '不显示']] })}
      ${catalogField(`products.${index}.shortDescription`, '一句话介绍', item.shortDescription, { type: 'textarea', wide: true })}
      ${catalogField(`products.${index}.fullDescription`, '详细介绍', item.fullDescription || '', { type: 'textarea', wide: true, rows: 4 })}
      ${catalogField(`products.${index}.useBlurb`, '面板说明', item.useBlurb || '', { type: 'textarea', wide: true, help: '零售/3C 产品卡上的用途说明' })}
      ${catalogField(`products.${index}.thumb`, '宫格图标/缩略图', item.thumb || '', { image: true, wide: true })}
      ${catalogField(`products.${index}.coverImage`, '封面图', item.coverImage, { image: true, wide: true })}
      ${catalogField(`products.${index}.sceneImage`, '场景大图', item.sceneImage || '', { image: true, wide: true, help: '3C 场景卡使用，可空' })}
      ${catalogField(`products.${index}.icon`, '图标名', item.icon || '')}
      ${catalogField(`products.${index}.capabilities`, '核心特性', (item.capabilities || []).join('、'), { wide: true, help: '顿号分隔' })}
      ${catalogField(`products.${index}.scenarios`, '适用场景', (item.scenarios || []).join('、'), { wide: true, help: '顿号分隔' })}`
  }
  if (kind === 'hwFlow') {
    return `
      ${catalogField(`flow.${index}.title`, '步骤名称', item.title)}
      ${catalogField(`flow.${index}.desc`, '说明', item.desc, { type: 'textarea', wide: true })}
      ${catalogField(`flow.${index}.icon`, '图标名', item.icon)}`
  }
  return ''
}

export function applyCatalogFields(content, root = document) {
  const next = structuredClone(content)
  root.querySelectorAll('[data-catalog-field]').forEach((field) => {
    const path = field.dataset.catalogField
    const parts = path.split('.')
    let cursor = next
    for (let i = 0; i < parts.length - 1; i += 1) {
      const key = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i]
      const nextIsIndex = /^\d+$/.test(parts[i + 1])
      if (cursor[key] == null) cursor[key] = nextIsIndex ? [] : {}
      cursor = cursor[key]
    }
    const last = /^\d+$/.test(parts.at(-1)) ? Number(parts.at(-1)) : parts.at(-1)
    let value = field.value
    if (/(^|\.)(items|workflow|chain|capabilities|pains|journey|hardware|scenarios|canDo|highlightAgents|agents)$/.test(path) && !path.includes('coreValues')) {
      value = value.split(/\n|、|,|，/).map((item) => item.trim()).filter(Boolean)
    }
    if (path.endsWith('showInOverview') || path.endsWith('.published')) {
      value = value === true || value === 'true'
    }
    cursor[last] = value
  })
  return next
}
