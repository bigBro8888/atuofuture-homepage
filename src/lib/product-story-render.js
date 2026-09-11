/** 商品详情叙事页渲染（前台与后台可视化编辑共用） */

import { esc, textNode, imgNode, linkNode } from './vedit-nodes.js'

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
  return ''
}

function sceneLogoNode(path, logoImage, iconFallback, { editable = false, size = 'lg' } = {}) {
  const url = String(logoImage || '').trim()
  const symbol = esc(iconFallback || 'category')
  if (!editable) {
    if (url) {
      return `<div class="hpi-scenes__logo hpi-scenes__logo--${size}"><img src="${esc(url)}" alt="" width="${size === 'lg' ? 88 : 56}" height="${size === 'lg' ? 88 : 56}" /></div>`
    }
    return `<div class="hpi-scenes__logo hpi-scenes__logo--${size} hpi-scenes__logo--symbol" aria-hidden="true"><span class="material-symbols-outlined">${symbol}</span></div>`
  }
  if (url) {
    return `<div class="hpi-scenes__logo hpi-scenes__logo--${size}"><button type="button" class="hpi-edit-img" data-edit-image="${esc(path)}" data-edit-image-url="${esc(url)}" title="更换图标"><img src="${esc(url)}" alt="" /><span class="hpi-edit-img__tip">更换</span></button></div>`
  }
  return `<div class="hpi-scenes__logo hpi-scenes__logo--${size} hpi-scenes__logo--empty"><button type="button" class="hpi-edit-img hpi-edit-img--empty" data-edit-image="${esc(path)}" data-edit-image-url="" title="上传图标"><span class="material-symbols-outlined">${symbol}</span><span class="hpi-edit-img__tip is-visible">更换</span></button></div>`
}

function normalizeSceneTags(rawTags = [], fallbackTags = []) {
  return Array.from({ length: 3 }, (_, index) => {
    const raw = Array.isArray(rawTags) ? rawTags[index] : undefined
    const fb = Array.isArray(fallbackTags) ? fallbackTags[index] : undefined
    if (typeof raw === 'string') {
      return {
        label: raw,
        icon: (typeof fb === 'object' && fb?.icon) || '',
        logoImage: '',
      }
    }
    if (raw && typeof raw === 'object') {
      return {
        label: raw.label || '',
        icon: raw.icon || (typeof fb === 'object' && fb?.icon) || '',
        logoImage: raw.logoImage || '',
      }
    }
    if (typeof fb === 'string') return { label: fb, icon: '', logoImage: '' }
    if (fb && typeof fb === 'object') {
      return { label: fb.label || '', icon: fb.icon || '', logoImage: fb.logoImage || '' }
    }
    return { label: '', icon: '', logoImage: '' }
  })
}

export function renderProductScenarios(story, { editable = false } = {}) {
  return ''
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

export function renderProductAlbum(story, { editable = false } = {}) {
  const block = story.album || {}
  const items = Array.isArray(block.items) ? block.items.slice(0, 12) : []
  const visible = items.filter((item) => item && item.url)
  if (!visible.length && !editable) return ''
  const list = editable ? items : visible
  return `
    <section class="hpi-album" id="hpi-album">
      <div class="hwc-shell">
        ${textNode('story.album.title', block.title || (editable ? '产品相册' : ''), { editable, tag: 'h2', className: 'hpi-album__title' })}
        <div class="hpi-album__grid">
          ${list
            .map(
              (item, index) => `
            <figure class="hpi-album__item" data-album-index="${index}">
              ${
                editable
                  ? `<button type="button" class="hpi-album__remove" data-album-remove="${index}" title="删除这张照片" aria-label="删除这张照片">×</button>`
                  : ''
              }
              <div class="hpi-album__media">
                ${imgNode(`story.album.items.${index}.url`, item.url || '', {
                  editable,
                  width: 800,
                  height: 600,
                  alt: item.caption || '产品实拍',
                  loading: 'lazy',
                })}
              </div>
              ${
                editable
                  ? `<div class="hpi-album__field">
                <span class="hpi-album__field-label">图片说明（可选）</span>
                ${textNode(`story.album.items.${index}.caption`, item.caption || '', {
                  editable,
                  tag: 'figcaption',
                  className: 'hpi-album__caption',
                  placeholder: '例如：正面实拍 / 安装现场',
                })}
              </div>`
                  : item.caption
                    ? `<figcaption class="hpi-album__caption">${esc(item.caption)}</figcaption>`
                    : ''
              }
            </figure>`
            )
            .join('')}
          ${
            editable
              ? `<button type="button" class="hpi-album__add" data-album-add${list.length >= 12 ? ' disabled' : ''}>
            <span class="material-symbols-outlined" aria-hidden="true">add_photo_alternate</span>
            <strong>添加实拍照片</strong>
            <small>最多 12 张 · 建议 1200×900</small>
          </button>`
              : ''
          }
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

export function renderProductDetailImages(story, { editable = false } = {}) {
  const block = story.detailImages || {}
  const items = Array.isArray(block.items) ? block.items.slice(0, 12) : []
  const visible = items.filter((item) => item && item.url)
  if (!visible.length && !editable) return ''
  const list = editable ? items : visible
  return `
    <section class="hpi-detail" id="hpi-detail">
      <div class="hwc-shell">
        <div class="hpi-detail__head">
          ${textNode('story.detailImages.title', block.title || (editable ? '商品详情' : ''), {
            editable,
            tag: 'h2',
            className: 'hpi-detail__title',
            placeholder: '板块标题',
          })}
          ${textNode('story.detailImages.subtitle', block.subtitle || '', {
            editable,
            tag: 'p',
            className: 'hpi-detail__subtitle',
            multiline: true,
            placeholder: '一句话说明（可选）',
          })}
        </div>
        <div class="hpi-detail__list">
          ${list
            .map(
              (item, index) => `
            <figure class="hpi-detail__item" data-detail-index="${index}">
              ${
                editable
                  ? `<button type="button" class="hpi-detail__remove" data-detail-remove="${index}" title="删除这张图" aria-label="删除这张图">×</button>`
                  : ''
              }
              <div class="hpi-detail__media">
                ${imgNode(`story.detailImages.items.${index}.url`, item.url || '', {
                  editable,
                  width: 1600,
                  height: 1000,
                  alt: item.caption || '商品详情图',
                  loading: 'lazy',
                })}
              </div>
              ${
                editable
                  ? `<div class="hpi-detail__field">
                <span class="hpi-detail__field-label">图片说明（可选）</span>
                ${textNode(`story.detailImages.items.${index}.caption`, item.caption || '', {
                  editable,
                  tag: 'figcaption',
                  className: 'hpi-detail__caption',
                  placeholder: '例如：产品细节 / 接口特写',
                })}
              </div>`
                  : item.caption
                    ? `<figcaption class="hpi-detail__caption">${esc(item.caption)}</figcaption>`
                    : ''
              }
            </figure>`
            )
            .join('')}
          ${
            editable
              ? `<button type="button" class="hpi-detail__add" data-detail-add${list.length >= 12 ? ' disabled' : ''}>
            <span class="material-symbols-outlined" aria-hidden="true">add_photo_alternate</span>
            <strong>添加详情图</strong>
            <small>最多 12 张 · 建议 1600×1000</small>
          </button>`
              : ''
          }
        </div>
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
      ${renderProductDetailImages(resolved, opts)}
      ${renderProductCases(resolved, opts)}
      ${renderProductAlbum(resolved, opts)}
      ${renderProductClosing(resolved, opts)}
    </article>`
}
