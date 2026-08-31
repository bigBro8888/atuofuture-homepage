/** 商品详情叙事页渲染（前台与后台可视化编辑共用） */

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function textNode(path, value, { editable = false, tag = 'span', className = '', multiline = false, placeholder = '' } = {}) {
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
    placeholder ? `data-placeholder="${esc(placeholder)}"` : '',
    className ? `class="${className}"` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const body = safe || (placeholder ? '' : '&nbsp;')
  return `<${tag} ${attrs}>${body}</${tag}>`
}

function imgNode(path, src, { editable = false, width, height, alt = '', loading = '' } = {}) {
  const url = String(src || '').trim()
  if (!url && !editable) return ''
  if (!url && editable) {
    return `<button type="button" class="hpi-edit-img hpi-edit-img--empty" data-edit-image="${esc(path)}" data-edit-image-url="" title="点击添加图片"><span class="hpi-edit-img__tip is-visible">添加图片</span></button>`
  }
  const img = `<img src="${esc(url)}" alt="${esc(alt)}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}${loading ? ` loading="${loading}"` : ''} />`
  if (!editable) return img
  return `<button type="button" class="hpi-edit-img" data-edit-image="${esc(path)}" data-edit-image-url="${esc(url)}" title="点击更换图片">${img}<span class="hpi-edit-img__tip">更换图片</span></button>`
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
  const bg = String(hero.backgroundImage || '').trim()
  const bgStyle = bg ? `--hpi-hero-image:url('${esc(bg)}')` : '--hpi-hero-image:none'
  const bgEdit = editable
    ? `<button type="button" class="hpi-edit-bg" data-edit-image="story.hero.backgroundImage" data-edit-image-url="${esc(bg)}" title="更换背景图">${bg ? '更换背景图' : '添加背景图'}</button>`
    : ''
  const device = imgNode('story.hero.deviceImage', hero.deviceImage, { editable, width: 520, height: 420 })
  return `
    <section class="hpi-hero${!bg ? ' hpi-hero--no-bg' : ''}${!device && !editable ? ' hpi-hero--no-device' : ''}" style="${bgStyle}">
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
        ${
          device || editable
            ? `<div class="hpi-hero__device" aria-hidden="${editable ? 'false' : 'true'}">${device}</div>`
            : ''
        }
      </div>
    </section>`
}

export function renderProductValue(story, { editable = false } = {}) {
  const v = story.value
  if (!v && !editable) return ''
  const value = v || {}
  const diagram = value.diagramImage || value.deviceImage || ''
  if (!diagram && !editable) return ''
  return `
    <section class="hpi-value" id="hpi-value">
      <div class="hwc-shell hpi-value__shell">
        ${imgNode('story.value.diagramImage', diagram, {
          editable,
          width: 1760,
          height: 900,
          alt: value.title || '功能架构图',
          loading: 'lazy',
        })}
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
  const defaultIcons = ['groups', 'apartment', 'diamond']
  return `
    <section class="hpi-scenes" id="hpi-scenes">
      <div class="hwc-shell">
        ${textNode('story.scenarios.title', block?.title || (editable ? '场景介绍' : ''), {
          editable,
          tag: 'h2',
          className: 'hpi-scenes__title',
          placeholder: '场景区标题',
        })}
        <div class="hpi-scenes__list">
          ${items
            .map((item, index) => {
              const tags = [...(item.tags || []), '', '', ''].slice(0, 3)
              const icon = item.icon || defaultIcons[index] || 'category'
              const tagNodes = tags
                .map((tag, ti) => {
                  if (!editable && !tag) return ''
                  return `<li>${textNode(`story.scenarios.items.${index}.tags.${ti}`, tag || '', {
                    editable,
                    tag: 'span',
                    className: 'hpi-scenes__tag',
                    placeholder: '能力标签',
                  })}</li>`
                })
                .join('')
              return `
            <article class="hpi-scenes__card">
              <div class="hpi-scenes__media">
                ${imgNode(`story.scenarios.items.${index}.sceneImage`, item.sceneImage, {
                  editable,
                  width: 800,
                  height: 560,
                  alt: item.title || '',
                  loading: 'lazy',
                })}
              </div>
              <div class="hpi-scenes__body">
                <div class="hpi-scenes__icon" aria-hidden="true">
                  <span class="material-symbols-outlined">${esc(icon)}</span>
                </div>
                ${
                  editable
                    ? `<div class="hpi-scenes__fields">
                  <div class="hpi-scenes__field">
                    <span class="hpi-scenes__field-label">场景标题</span>
                    ${textNode(`story.scenarios.items.${index}.title`, item.title || '', {
                      editable,
                      tag: 'h3',
                      className: 'hpi-scenes__name',
                      placeholder: '填写场景标题',
                    })}
                  </div>
                  <div class="hpi-scenes__field">
                    <span class="hpi-scenes__field-label">副标题</span>
                    ${textNode(`story.scenarios.items.${index}.subtitle`, item.subtitle || '', {
                      editable,
                      tag: 'p',
                      className: 'hpi-scenes__subtitle',
                      placeholder: '填写副标题',
                    })}
                  </div>
                  <div class="hpi-scenes__field">
                    <span class="hpi-scenes__field-label">场景介绍</span>
                    ${textNode(`story.scenarios.items.${index}.desc`, item.desc || '', {
                      editable,
                      tag: 'p',
                      className: 'hpi-scenes__desc',
                      multiline: true,
                      placeholder: '填写场景介绍',
                    })}
                  </div>
                  <div class="hpi-scenes__field">
                    <span class="hpi-scenes__field-label">能力标签（3个）</span>
                    <ul class="hpi-scenes__tags">${tagNodes}</ul>
                  </div>
                </div>`
                    : `${textNode(`story.scenarios.items.${index}.title`, item.title || '', {
                        editable,
                        tag: 'h3',
                        className: 'hpi-scenes__name',
                      })}
                ${textNode(`story.scenarios.items.${index}.subtitle`, item.subtitle || '', {
                  editable,
                  tag: 'p',
                  className: 'hpi-scenes__subtitle',
                })}
                ${textNode(`story.scenarios.items.${index}.desc`, item.desc || '', {
                  editable,
                  tag: 'p',
                  className: 'hpi-scenes__desc',
                  multiline: true,
                })}
                ${tagNodes ? `<ul class="hpi-scenes__tags">${tagNodes}</ul>` : ''}`
                }
              </div>
            </article>`
            })
            .join('')}
        </div>
      </div>
    </section>`
}

export function renderProductCases(story, { editable = false } = {}) {
  const block = story.cases
  if (!block && !editable) return ''
  const cases = block || {}
  const items = [...(cases.items || []), {}, {}, {}].slice(0, 3)
  const hasContent = items.some((item) => item.image || item.title || item.desc)
  if (!hasContent && !editable) return ''
  return `
    <section class="hpi-cases" id="hpi-cases">
      <div class="hwc-shell">
        ${textNode('story.cases.title', cases.title || (editable ? '实际案例' : ''), { editable, tag: 'h2', className: 'hpi-cases__title' })}
        <div class="hpi-cases__list">
          ${items
            .map((item, index) => `
            <article class="hpi-cases__item">
              <figure class="hpi-cases__media">
                ${imgNode(`story.cases.items.${index}.image`, item.image, {
                  editable,
                  width: 560,
                  height: 360,
                  alt: item.title || '实际案例',
                  loading: 'lazy',
                })}
              </figure>
              <div class="hpi-cases__copy">
                ${
                  editable
                    ? `<div class="hpi-cases__field">
                  <span class="hpi-cases__field-label">案例标题</span>
                  ${textNode(`story.cases.items.${index}.title`, item.title || '', {
                    editable,
                    tag: 'h3',
                    className: 'hpi-cases__name',
                    placeholder: '填写案例标题',
                  })}
                </div>
                <div class="hpi-cases__field">
                  <span class="hpi-cases__field-label">案例介绍</span>
                  ${textNode(`story.cases.items.${index}.desc`, item.desc || '', {
                    editable,
                    tag: 'p',
                    className: 'hpi-cases__desc',
                    multiline: true,
                    placeholder: '填写案例介绍',
                  })}
                </div>`
                    : `${textNode(`story.cases.items.${index}.title`, item.title || '', { editable, tag: 'h3', className: 'hpi-cases__name' })}
                ${textNode(`story.cases.items.${index}.desc`, item.desc || '', { editable, tag: 'p', className: 'hpi-cases__desc', multiline: true })}`
                }
              </div>
            </article>`)
            .join('')}
        </div>
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
      ${renderProductCases(resolved, opts)}
      ${renderProductClosing(resolved, opts)}
    </article>`
}
