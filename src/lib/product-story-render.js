/** 商品详情叙事页渲染（前台与后台可视化编辑共用） */

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function textNode(path, value, { editable = false, tag = 'span', className = '', multiline = false } = {}) {
  const safe = esc(value || '')
  if (!editable) {
    if (tag === 'span' && !className) return safe
    return `<${tag}${className ? ` class="${className}"` : ''}>${safe}</${tag}>`
  }
  const attrs = [
    `contenteditable="true"`,
    `data-edit-path="${esc(path)}"`,
    `spellcheck="false"`,
    multiline ? `data-edit-multiline="true"` : '',
    className ? `class="${className}"` : '',
  ]
    .filter(Boolean)
    .join(' ')
  return `<${tag} ${attrs}>${safe || '&nbsp;'}</${tag}>`
}

function imgNode(path, src, { editable = false, width, height, alt = '', loading = '' } = {}) {
  const img = `<img src="${esc(src || '')}" alt="${esc(alt)}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}${loading ? ` loading="${loading}"` : ''} />`
  if (!editable) return img
  return `<button type="button" class="hpi-edit-img" data-edit-image="${esc(path)}" title="点击更换图片">${img}<span class="hpi-edit-img__tip">更换图片</span></button>`
}

function lineList(path, items, { editable = false, tag = 'p', empty = 3 } = {}) {
  const list = Array.isArray(items) && items.length ? items : Array.from({ length: empty }, () => '')
  return list
    .map((item, index) => textNode(`${path}.${index}`, item, { editable, tag }))
    .join('')
}

function chipList(path, items, { editable = false, empty = 3 } = {}) {
  const list = Array.isArray(items) && items.length ? items : Array.from({ length: empty }, () => '')
  return list
    .map((item, index) => textNode(`${path}.${index}`, item, { editable, tag: 'span' }))
    .join('')
}

/** 可配置跳转/锚点的链接（可视化编辑时点开弹窗） */
function linkNode({ className = '', href = '', label = '', labelPath, hrefPath, editable = false, arrow = true } = {}) {
  const safeHref = esc(href || '#')
  const safeLabel = esc(label || '')
  if (!editable) {
    return `<a class="${className}" href="${safeHref}">${safeLabel}${arrow ? ' →' : ''}</a>`
  }
  return `<button type="button" class="${className} hpi-edit-link" data-edit-link data-edit-label-path="${esc(labelPath)}" data-edit-href-path="${esc(hrefPath)}" data-edit-href="${safeHref}" title="点击设置文案与跳转"><span data-edit-link-label>${safeLabel || '链接文案'}</span>${arrow ? ' →' : ''}</button>`
}

export function renderProductHero(story, product, line, { editable = false } = {}) {
  const hero = story.hero || {}
  const bgStyle = `--hpi-hero-image:url('${esc(hero.backgroundImage || '')}')`
  const bgEdit = editable
    ? `<button type="button" class="hpi-edit-bg" data-edit-image="story.hero.backgroundImage" title="更换背景图">更换背景图</button>`
    : ''
  return `
    <section class="hpi-hero" style="${bgStyle}">
      <div class="hpi-hero__overlay" aria-hidden="true"></div>
      ${bgEdit}
      <div class="hwc-shell hpi-hero__grid">
        <div class="hpi-hero__copy">
          <p class="hpi-hero__crumb"><a href="/hardware/"${editable ? ' tabindex="-1"' : ''}>智能硬件</a>${line ? ` / <a href="/hardware/?line=${esc(line.id)}#hwc-browser"${editable ? ' tabindex="-1"' : ''}>${esc(line.name)}</a>` : ''} / ${esc(product.name)}</p>
          ${textNode('story.hero.title', hero.title, { editable, tag: 'h1' })}
          ${textNode('story.hero.headline', hero.headline, { editable, tag: 'p', className: 'hpi-hero__headline' })}
          ${textNode('story.hero.description', hero.description, { editable, tag: 'p', className: 'hpi-hero__desc', multiline: true })}
          ${linkNode({
            className: 'hpi-hero__link',
            href: hero.ctaHref || '#hpi-how',
            label: hero.ctaLabel || '查看它如何工作',
            labelPath: 'story.hero.ctaLabel',
            hrefPath: 'story.hero.ctaHref',
            editable,
          })}
        </div>
        <div class="hpi-hero__device" aria-hidden="${editable ? 'false' : 'true'}">
          ${imgNode('story.hero.deviceImage', hero.deviceImage, { editable, width: 520, height: 420 })}
        </div>
      </div>
    </section>`
}

export function renderProductValue(story, { editable = false } = {}) {
  const v = story.value
  if (!v && !editable) return ''
  const value = v || {}
  return `
    <section class="hpi-value" id="hpi-value">
      <div class="hwc-shell">
        ${textNode('story.value.title', value.title, { editable, tag: 'h2', className: 'hpi-value__title' })}
        <div class="hpi-value__map">
          <div class="hpi-value__side hpi-value__side--left">
            ${lineList('story.value.left', value.left, { editable, empty: Math.max(3, (value.left || []).length || 3) })}
          </div>
          <div class="hpi-value__core">
            ${imgNode('story.value.deviceImage', value.deviceImage, { editable, width: 360, height: 280 })}
            <span class="hpi-value__ring" aria-hidden="true"></span>
          </div>
          <div class="hpi-value__side hpi-value__side--right">
            ${lineList('story.value.right', value.right, { editable, empty: Math.max(3, (value.right || []).length || 3) })}
          </div>
        </div>
        ${textNode('story.value.footer', value.footer, { editable, tag: 'p', className: 'hpi-value__footer', multiline: true })}
      </div>
    </section>`
}

export function renderProductHow(story, { editable = false } = {}) {
  const how = story.howItWorks
  if (!how?.stages?.length && !editable) return ''
  const stages = [...(how?.stages || []), {}, {}, {}, {}].slice(0, 4)
  return `
    <section class="hpi-how" id="hpi-how">
      <div class="hwc-shell">
        ${textNode('story.howItWorks.title', how?.title || '', { editable, tag: 'h2', className: 'hpi-how__title' })}
        <ol class="hpi-how__stages">
          ${stages
            .map(
              (stage, i) => `
            <li>
              <figure>
                ${imgNode(`story.howItWorks.stages.${i}.image`, stage.image, { editable, width: 280, height: 180, alt: stage.title || '', loading: 'lazy' })}
                <figcaption>
                  <strong>${i + 1}. ${textNode(`story.howItWorks.stages.${i}.title`, stage.title || '', { editable, tag: 'span' })}</strong>
                  ${textNode(`story.howItWorks.stages.${i}.caption`, stage.caption || '', { editable, tag: 'span' })}
                </figcaption>
              </figure>
            </li>`
            )
            .join('')}
        </ol>
      </div>
    </section>`
}

export function renderProductScenarios(story, { editable = false } = {}) {
  const block = story.scenarios
  if (!block?.items?.length && !editable) return ''
  const items = [...(block?.items || []), {}, {}, {}].slice(0, 3)
  return `
    <section class="hpi-scenes" id="hpi-scenes">
      <div class="hwc-shell">
        ${textNode('story.scenarios.title', block?.title || '', { editable, tag: 'h2', className: 'hpi-scenes__title' })}
        <div class="hpi-scenes__list">
          ${items
            .map(
              (item, index) => `
            <article class="hpi-scenes__row">
              <div class="hpi-scenes__photo">
                ${imgNode(`story.scenarios.items.${index}.sceneImage`, item.sceneImage, { editable, width: 720, height: 420, alt: item.title || '', loading: 'lazy' })}
                <div class="hpi-scenes__copy">
                  ${textNode(`story.scenarios.items.${index}.title`, item.title || '', { editable, tag: 'h3' })}
                  ${textNode(`story.scenarios.items.${index}.desc`, item.desc || '', { editable, tag: 'p', multiline: true })}
                </div>
              </div>
              <div class="hpi-scenes__device">
                ${imgNode(`story.scenarios.items.${index}.deviceImage`, item.deviceImage, { editable, width: 320, height: 240, loading: 'lazy' })}
              </div>
            </article>`
            )
            .join('')}
        </div>
      </div>
    </section>`
}

export function renderProductSystem(story, { editable = false } = {}) {
  const sys = story.system
  if (!sys && !editable) return ''
  const system = sys || {}
  return `
    <section class="hpi-system" id="hpi-system">
      <div class="hwc-shell">
        ${textNode('story.system.title', system.title || '', { editable, tag: 'h2', className: 'hpi-system__title' })}
        <div class="hpi-system__stack">
          <div class="hpi-system__layer hpi-system__layer--upper">
            ${textNode('story.system.upperLabel', system.upperLabel || '', { editable, tag: 'p', className: 'hpi-system__label' })}
            <div class="hpi-system__chips">
              ${chipList('story.system.upperItems', system.upperItems, { editable, empty: Math.max(3, (system.upperItems || []).length || 3) })}
            </div>
          </div>
          <div class="hpi-system__layer hpi-system__layer--mid">
            ${textNode('story.system.middleLabel', system.middleLabel || '', { editable, tag: 'p', className: 'hpi-system__label' })}
            ${imgNode('story.system.middleImage', system.middleImage, { editable, width: 280, height: 200 })}
          </div>
          <div class="hpi-system__layer hpi-system__layer--lower">
            <div class="hpi-system__chips">
              ${chipList('story.system.lowerItems', system.lowerItems, { editable, empty: Math.max(3, (system.lowerItems || []).length || 3) })}
            </div>
          </div>
        </div>
        ${
          system.aspaceHref || editable
            ? `<p class="hpi-system__link">${linkNode({
                className: '',
                href: system.aspaceHref || '/solutions/',
                label: system.aspaceLabel || '了解 ASpace 总体解决方案',
                labelPath: 'story.system.aspaceLabel',
                hrefPath: 'story.system.aspaceHref',
                editable,
              })}</p>`
            : ''
        }
      </div>
    </section>`
}

export function renderProductClosing(story, { editable = false } = {}) {
  const c = story.closing
  if (!c && !editable) return ''
  const closing = c || {}
  const soft = [...(closing.softLinks || []), {}, {}].slice(0, 2)
  return `
    <section class="hpi-close" id="hpi-close">
      <div class="hpi-close__bg" aria-hidden="true"></div>
      <div class="hwc-shell hpi-close__inner">
        ${textNode('story.closing.title', closing.title || '', { editable, tag: 'h2' })}
        ${textNode('story.closing.desc', closing.desc || '', { editable, tag: 'p', multiline: true })}
        <button type="button" class="hwc-btn hpi-close__btn"${editable ? '' : ' data-demo-modal-open'}>${textNode('story.closing.primaryLabel', closing.primaryLabel || '预约方案演示', { editable, tag: 'span' })}</button>
        <p class="hpi-close__soft">
          ${soft
            .map(
              (link, i) =>
                `${i > 0 ? ' <span>/</span> ' : ''}<button type="button"${editable ? '' : ' data-demo-modal-open'}>${textNode(`story.closing.softLinks.${i}.label`, link.label || '', { editable, tag: 'span' })}</button>`
            )
            .join('')}
        </p>
      </div>
    </section>`
}

export function renderProductStory(product, story, line, { editable = false } = {}) {
  const resolved = story || {}
  const opts = { editable }
  return `
    <article class="hpi${editable ? ' hpi--editable' : ''}">
      ${renderProductHero(resolved, product, line, opts)}
      ${renderProductValue(resolved, opts)}
      ${renderProductHow(resolved, opts)}
      ${renderProductScenarios(resolved, opts)}
      ${renderProductSystem(resolved, opts)}
      ${renderProductClosing(resolved, opts)}
    </article>`
}
