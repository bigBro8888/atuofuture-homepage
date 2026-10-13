/** 商品详情叙事页渲染（前台与后台可视化编辑共用） */

import { esc, textNode, imgNode } from './vedit-nodes.js'

function collectIntroBullets(story, product) {
  const fromCaps = (story.capabilities?.items || [])
    .filter((item) => item && (item.title || item.desc))
    .slice(0, 8)
  if (fromCaps.length) return fromCaps.map((item) => ({ title: item.title || '', desc: item.desc || '' }))
  const fromPoints = (story.showcase?.points || [])
    .filter((item) => item && (item.title || item.desc))
    .slice(0, 8)
  if (fromPoints.length) return fromPoints
  const fromProduct = (product?.capabilities || []).filter(Boolean).slice(0, 8)
  return fromProduct.map((title) => ({ title, desc: '' }))
}

export function renderProductHero(story, product, line, { editable = false } = {}) {
  const hero = story.hero || {}
  const title = hero.title || product.name || ''
  const desc = hero.description || hero.headline || product.shortDescription || ''
  const bullets = collectIntroBullets(story, product)
  const bulletNodes = (editable ? [...bullets, {}, {}, {}].slice(0, Math.max(bullets.length, 3)) : bullets)
    .map((item, index) => {
      if (!editable && !item.title && !item.desc) return ''
      return `
        <li class="hpi-intro__bullet">
          ${textNode(`story.capabilities.items.${index}.title`, item.title || '', {
            editable,
            tag: 'strong',
            className: 'hpi-intro__bullet-title',
            placeholder: '卖点标题',
          })}
          ${
            editable || item.desc
              ? textNode(`story.capabilities.items.${index}.desc`, item.desc || '', {
                  editable,
                  tag: 'span',
                  className: 'hpi-intro__bullet-desc',
                  placeholder: '卖点说明',
                })
              : ''
          }
        </li>`
    })
    .join('')

  return `
    <section class="hpi-intro" id="hpi-intro">
      <div class="hwc-shell hpi-intro__grid">
        <div class="hpi-intro__media">
          ${renderShowcaseVisual(story, product, { editable })}
        </div>
        <div class="hpi-intro__meta">
          <p class="hpi-intro__crumb"><a href="/hardware/"${editable ? ' tabindex="-1"' : ''}>智能硬件</a>${line ? ` / <a href="/hardware/?line=${esc(line.id)}#hwc-browser"${editable ? ' tabindex="-1"' : ''}>${esc(line.name)}</a>` : ''} / ${esc(product.name)}</p>
          <p class="hpi-intro__model">${esc(product.name || '')}</p>
          ${textNode('story.hero.title', title, { editable, tag: 'h1', className: 'hpi-intro__title' })}
          ${
            desc || editable
              ? textNode('story.hero.description', desc, {
                  editable,
                  tag: 'p',
                  className: 'hpi-intro__desc',
                  multiline: true,
                  placeholder: '一句话产品介绍',
                })
              : ''
          }
          ${bulletNodes ? `<ul class="hpi-intro__bullets">${bulletNodes}</ul>` : ''}
          <div class="hpi-intro__actions">
            <button type="button" class="hpi-intro__cta"${editable ? '' : ' data-demo-modal-open'}>预约方案演示</button>
            <a class="hpi-intro__link" href="#hpi-highlights"${editable ? ' tabindex="-1"' : ''}>查看产品亮点</a>
          </div>
        </div>
      </div>
    </section>`
}

function normalizeGalleryItem(item) {
  if (typeof item === 'string') return { url: item.trim(), caption: '' }
  return {
    url: String(item?.url || '').trim(),
    caption: String(item?.caption || '').trim(),
  }
}

function collectIntroGallery(story, product) {
  const showcase = story?.showcase || {}
  const pools = [
    ...(Array.isArray(showcase.gallery) ? showcase.gallery : []),
    ...(story?.album?.items || []),
    showcase.image,
    showcase.model3d?.poster,
    ...(product?.gallery || []),
    product?.coverImage,
  ]
  const seen = new Set()
  const items = []
  for (const entry of pools) {
    const item = normalizeGalleryItem(entry)
    if (!item.url || seen.has(item.url)) continue
    seen.add(item.url)
    items.push({
      url: item.url,
      caption: item.caption || (items.length === 0 ? '产品主图' : ''),
    })
    if (items.length >= 5) break
  }
  return items
}

function renderShowcaseVisual(story, product, { editable = false } = {}) {
  const collected = collectIntroGallery(story, product)
  const slots = editable
    ? [...collected, ...Array.from({ length: 5 }, () => ({ url: '', caption: '' }))].slice(0, 5)
    : collected.length
      ? collected
      : [{ url: '', caption: '' }]
  const visible = editable ? slots : slots.filter((item) => item.url)
  const first = visible.find((item) => item.url) || visible[0] || { url: '', caption: '' }
  const productName = product?.name || '产品'
  const slideCount = visible.filter((item) => item.url).length
  const canSwitch = slideCount > 1

  // 淘宝式：左侧竖排缩略图 + 右侧大图，悬停切换，大图左右箭头
  const thumbs = visible
    .map((item, index) => {
      if (!editable && !item.url) return ''
      const active = index === 0 ? ' is-active' : ''
      const attrs = `class="hpi-gallery__thumb${active}" data-hpi-gallery-thumb="${index}" data-src="${esc(item.url)}" data-caption="${esc(item.caption || '')}" aria-label="商品图 ${index + 1}"`
      if (editable) {
        return `
          <div ${attrs}>
            ${imgNode(`story.showcase.gallery.${index}.url`, item.url, {
              editable: true,
              width: 64,
              height: 64,
              alt: item.caption || `${productName} 图${index + 1}`,
              loading: index === 0 ? 'eager' : 'lazy',
              className: 'hpi-gallery__thumb-img',
            })}
          </div>`
      }
      return `
        <button type="button" ${attrs}>
          <img src="${esc(item.url)}" alt="${esc(item.caption || `${productName} 图${index + 1}`)}" width="64" height="64" loading="${index === 0 ? 'eager' : 'lazy'}" />
        </button>`
    })
    .join('')

  const mainInner = first.url
    ? `<img data-hpi-gallery-main src="${esc(first.url)}" alt="${esc(first.caption || productName)}" width="960" height="960" draggable="false" />`
    : editable
      ? `<span class="hpi-gallery__main-empty">请从左侧缩略图添加</span>`
      : `<span class="hpi-gallery__main-empty">暂无商品图</span>`

  return `
    <div class="hpi-gallery${canSwitch ? ' hpi-gallery--switchable' : ''}" data-hpi-gallery tabindex="0" aria-roledescription="carousel" aria-label="${esc(productName)} 商品图">
      <div class="hpi-gallery__inner">
        <div class="hpi-gallery__thumbs" role="tablist" aria-label="商品缩略图">${thumbs}</div>
        <div class="hpi-gallery__stage">
          <div class="hpi-gallery__main">${mainInner}</div>
          <button type="button" class="hpi-gallery__nav hpi-gallery__nav--prev" data-hpi-gallery-prev aria-label="上一张"${canSwitch || editable ? '' : ' hidden disabled'}${editable ? ' tabindex="-1"' : ''}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" class="hpi-gallery__nav hpi-gallery__nav--next" data-hpi-gallery-next aria-label="下一张"${canSwitch || editable ? '' : ' hidden disabled'}${editable ? ' tabindex="-1"' : ''}>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
      ${editable ? `<p class="hpi-gallery__tip">淘宝式图集：左侧最多 5 张缩略图，悬停切换；点缩略图可换图。</p>` : ''}
    </div>`
}

export function renderProductShowcase(story, product, { editable = false } = {}) {
  // 3D / 主图已并入顶部 intro，保留函数供兼容调用
  return ''
}

export function renderHighlightMasthead(story, product, { editable = false } = {}) {
  const caps = story.capabilities || {}
  const items = (caps.items || []).filter((item) => item && item.title).slice(0, 12)
  const chips = items
    .map((item) => `<li class="hpi-hl__chip"><span>${esc(item.title)}</span></li>`)
    .join('')
  const title = caps.title || `${product?.name || '产品'}核心能力`
  return `
    <section class="hpi-hl" id="hpi-highlights">
      <div class="hwc-shell hpi-hl__inner">
        ${textNode('story.capabilities.title', title, {
          editable,
          tag: 'h2',
          className: 'hpi-hl__title',
          placeholder: '亮点区主标题',
        })}
        <p class="hpi-hl__sub">${esc(product?.name || '')}</p>
        ${chips ? `<ul class="hpi-hl__chips">${chips}</ul>` : ''}
      </div>
    </section>`
}

export function renderProductCapabilities(story, { editable = false } = {}) {
  const block = story.capabilities || {}
  const items = [...(block.items || []), {}, {}, {}, {}].slice(0, 4)
  const visible = items.filter((item) => item && (item.title || item.desc))
  if (!visible.length && !editable) return ''
  const list = editable ? items : visible
  return `
    <section class="hpi-features" id="hpi-caps">
      ${list
        .map((item, index) => {
          if (!editable && !item.title && !item.desc) return ''
          const flip = index % 2 === 1 ? ' hpi-features__row--flip' : ''
          return `
        <article class="hpi-features__row${flip}">
          <div class="hwc-shell hpi-features__grid">
            <div class="hpi-features__copy">
              ${textNode(`story.capabilities.items.${index}.title`, item.title || '', {
                editable,
                tag: 'h3',
                className: 'hpi-features__name',
                placeholder: '能力标题',
              })}
              ${textNode(`story.capabilities.items.${index}.desc`, item.desc || '', {
                editable,
                tag: 'p',
                className: 'hpi-features__desc',
                multiline: true,
                placeholder: '能力说明',
              })}
            </div>
            <div class="hpi-features__visual" aria-hidden="true">
              <span class="hpi-features__index">${String(index + 1).padStart(2, '0')}</span>
            </div>
          </div>
        </article>`
        })
        .join('')}
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
      <div class="hwc-shell">
        <div class="hpi-value__head">
          ${textNode('story.value.title', value.title || (editable ? '原理与链路' : ''), {
            editable,
            tag: 'h2',
            className: 'hpi-value__title',
            placeholder: '链路区标题',
          })}
          ${textNode('story.value.subtitle', value.subtitle || '', {
            editable,
            tag: 'p',
            className: 'hpi-value__subtitle',
            multiline: true,
            placeholder: '链路区说明（可选）',
          })}
        </div>
        <div class="hpi-value__shell">
          ${imgNode('story.value.diagramImage', diagram, {
            editable,
            width: 1760,
            height: 900,
            alt: value.title || '功能架构图',
            loading: 'lazy',
          })}
        </div>
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
  const block = story.scenarios
  if (!block?.items?.length && !editable) return ''
  const items = [...(block?.items || []), {}, {}, {}].slice(0, 3)
  const hasContent = items.some((item) => item.sceneImage || item.title || item.desc || item.subtitle)
  if (!hasContent && !editable) return ''
  const defaultIcons = ['groups', 'apartment', 'diamond']
  const defaultTagIcons = [
    ['touch_app', 'link', 'restart_alt'],
    ['eco', 'deployed_code', 'monitoring'],
    ['login', 'play_circle', 'desktop_windows'],
  ]
  return `
    <section class="hpi-scenes" id="hpi-scenes">
      <div class="hwc-shell">
        ${textNode('story.scenarios.title', block?.title || (editable ? '应用场景' : ''), {
          editable,
          tag: 'h2',
          className: 'hpi-scenes__title',
          placeholder: '场景区标题',
        })}
        <div class="hpi-scenes__list">
          ${items
            .map((item, index) => {
              const icon = item.icon || defaultIcons[index] || 'category'
              const tags = normalizeSceneTags(
                item.tags,
                (defaultTagIcons[index] || []).map((sym) => ({ label: '', icon: sym, logoImage: '' })),
              ).map((tag, ti) => ({
                ...tag,
                icon: tag.icon || defaultTagIcons[index]?.[ti] || 'circle',
              }))
              const tagNodes = tags
                .map((tag, ti) => {
                  if (!editable && !tag.label && !tag.logoImage) return ''
                  return `<li class="hpi-scenes__tag">
                    ${sceneLogoNode(`story.scenarios.items.${index}.tags.${ti}.logoImage`, tag.logoImage, tag.icon, {
                      editable,
                      size: 'sm',
                    })}
                    ${textNode(`story.scenarios.items.${index}.tags.${ti}.label`, tag.label || '', {
                      editable,
                      tag: 'span',
                      className: 'hpi-scenes__tag-label',
                      placeholder: '能力标签',
                    })}
                  </li>`
                })
                .join('')
              return `
            <article class="hpi-scenes__card">
              <div class="hpi-scenes__media">
                ${imgNode(`story.scenarios.items.${index}.sceneImage`, item.sceneImage, {
                  editable,
                  width: 860,
                  height: 560,
                  alt: item.title || '',
                  loading: 'lazy',
                })}
              </div>
              <div class="hpi-scenes__body">
                <div class="hpi-scenes__head">
                  ${sceneLogoNode(`story.scenarios.items.${index}.logoImage`, item.logoImage, icon, {
                    editable,
                    size: 'lg',
                  })}
                  ${textNode(`story.scenarios.items.${index}.title`, item.title || '', {
                    editable,
                    tag: 'h3',
                    className: 'hpi-scenes__name',
                    placeholder: '场景标题',
                  })}
                </div>
                ${textNode(`story.scenarios.items.${index}.subtitle`, item.subtitle || '', {
                  editable,
                  tag: 'p',
                  className: 'hpi-scenes__subtitle',
                  placeholder: '副标题',
                })}
                ${textNode(`story.scenarios.items.${index}.desc`, item.desc || '', {
                  editable,
                  tag: 'p',
                  className: 'hpi-scenes__desc',
                  multiline: true,
                  placeholder: '场景介绍',
                })}
                ${tagNodes ? `<ul class="hpi-scenes__tags">${tagNodes}</ul>` : ''}
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

export function renderProductAlbum(story, { editable = false } = {}) {
  const block = story.album || {}
  const items = Array.isArray(block.items) ? block.items.slice(0, 12) : []
  const visible = items.filter((item) => item && item.url)
  if (!visible.length && !editable) return ''
  const list = editable ? items : visible
  return `
    <section class="hpi-album" id="hpi-album">
      <div class="hwc-shell">
        ${textNode('story.album.title', block.title || (editable ? '产品图拍' : ''), { editable, tag: 'h2', className: 'hpi-album__title' })}
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
                  loading: 'eager',
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

export function renderProductSpecs(story, { editable = false } = {}) {
  const block = story.specs || {}
  const rows = Array.isArray(block.rows) ? block.rows.slice(0, 24) : []
  const visible = rows.filter((row) => row && (row.label || row.value))
  if (!visible.length && !editable) {
    return `
      <section class="hpi-specs" id="hpi-specs">
        <div class="hwc-shell">
          <div class="hpi-empty">
            <span class="material-symbols-outlined" aria-hidden="true">tune</span>
            <b>暂无产品参数</b>
            <p>参数信息完善后将在此展示。</p>
          </div>
        </div>
      </section>`
  }
  const list = editable ? (rows.length ? rows : [{ label: '', value: '' }]) : visible
  return `
    <section class="hpi-specs" id="hpi-specs">
      <div class="hwc-shell">
        ${textNode('story.specs.title', block.title || (editable ? '产品参数' : ''), { editable, tag: 'h2', className: 'hpi-specs__title' })}
        <div class="hpi-specs__table" role="table">
          ${list
            .map(
              (row, index) => `
            <div class="hpi-specs__row" role="row" data-spec-index="${index}">
              ${
                editable
                  ? `<button type="button" class="hpi-specs__remove" data-spec-remove="${index}" title="删除参数" aria-label="删除参数">×</button>`
                  : ''
              }
              ${textNode(`story.specs.rows.${index}.label`, row.label || '', {
                editable,
                tag: 'div',
                className: 'hpi-specs__label',
                placeholder: '参数名',
              })}
              ${textNode(`story.specs.rows.${index}.value`, row.value || '', {
                editable,
                tag: 'div',
                className: 'hpi-specs__value',
                placeholder: '参数值',
              })}
            </div>`
            )
            .join('')}
        </div>
        ${
          editable
            ? `<button type="button" class="hpi-specs__add" data-spec-add${list.length >= 24 ? ' disabled' : ''}>
          <span class="material-symbols-outlined" aria-hidden="true">add</span>
          <strong>添加参数行</strong>
        </button>`
            : ''
        }
      </div>
    </section>`
}

export function renderProductVideos(story, { editable = false } = {}) {
  const block = story.videos || {}
  const items = Array.isArray(block.items) ? block.items.slice(0, 8) : []
  const visible = items.filter((item) => item && (item.url || item.cover || item.title))
  if (!visible.length && !editable) {
    return `
      <section class="hpi-videos" id="hpi-videos">
        <div class="hwc-shell">
          <div class="hpi-empty">
            <span class="material-symbols-outlined" aria-hidden="true">play_circle</span>
            <b>暂无使用视频</b>
            <p>产品演示与使用说明视频完善后将在此展示。</p>
          </div>
        </div>
      </section>`
  }
  const list = editable ? (items.length ? items : [{ title: '', url: '', cover: '', caption: '' }]) : visible
  return `
    <section class="hpi-videos" id="hpi-videos">
      <div class="hwc-shell">
        ${textNode('story.videos.title', block.title || (editable ? '使用视频' : ''), { editable, tag: 'h2', className: 'hpi-videos__title' })}
        <div class="hpi-videos__grid">
          ${list
            .map((item, index) => {
              const url = String(item.url || '').trim()
              const cover = String(item.cover || '').trim()
              const isDirectVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(url)
              return `
            <article class="hpi-videos__card" data-video-index="${index}">
              ${
                editable
                  ? `<button type="button" class="hpi-videos__remove" data-video-remove="${index}" title="删除视频" aria-label="删除视频">×</button>`
                  : ''
              }
              <div class="hpi-videos__media">
                ${
                  editable
                    ? `${imgNode(`story.videos.items.${index}.cover`, cover, {
                        editable,
                        width: 960,
                        height: 540,
                        alt: item.title || '视频封面',
                        loading: 'lazy',
                      })}
                    <label class="hpi-videos__url-field"><span>视频链接</span>${textNode(`story.videos.items.${index}.url`, url, {
                      editable,
                      tag: 'span',
                      className: 'hpi-videos__url',
                      placeholder: 'https://... 或 /videos/demo.mp4',
                    })}</label>`
                    : url
                      ? isDirectVideo
                        ? `<video src="${esc(url)}" controls playsinline poster="${esc(cover)}" preload="metadata"></video>`
                        : `<a class="hpi-videos__link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">
                            ${cover ? `<img src="${esc(cover)}" alt="" loading="lazy" />` : '<span class="material-symbols-outlined">play_circle</span>'}
                            <em>观看视频</em>
                          </a>`
                      : cover
                        ? `<img src="${esc(cover)}" alt="" loading="lazy" />`
                        : '<div class="hpi-videos__placeholder"><span class="material-symbols-outlined">play_circle</span></div>'
                }
              </div>
              ${textNode(`story.videos.items.${index}.title`, item.title || '', {
                editable,
                tag: 'h3',
                className: 'hpi-videos__name',
                placeholder: '视频标题',
              })}
              ${
                editable || item.caption
                  ? textNode(`story.videos.items.${index}.caption`, item.caption || '', {
                      editable,
                      tag: 'p',
                      className: 'hpi-videos__caption',
                      placeholder: '视频说明（可选）',
                    })
                  : ''
              }
            </article>`
            })
            .join('')}
          ${
            editable
              ? `<button type="button" class="hpi-videos__add" data-video-add${list.length >= 8 ? ' disabled' : ''}>
            <span class="material-symbols-outlined" aria-hidden="true">video_library</span>
            <strong>添加使用视频</strong>
            <small>最多 8 个 · 可填外链或直链</small>
          </button>`
              : ''
          }
        </div>
      </div>
    </section>`
}

function renderProductTabs(active = 'overview') {
  const tabs = [
    ['overview', '亮点'],
    ['photos', '产品图拍'],
    ['videos', '使用视频'],
    ['specs', '规格参数'],
  ]
  return `
    <nav class="hpi-tabs" aria-label="商品详情分区" data-hpi-tabs>
      <div class="hwc-shell hpi-tabs__inner">
        ${tabs
          .map(
            ([id, label]) => `
          <button type="button" class="hpi-tabs__btn${id === active ? ' is-active' : ''}" data-hpi-tab="${id}" aria-selected="${id === active ? 'true' : 'false'}">${label}</button>`
          )
          .join('')}
      </div>
    </nav>`
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
  const rawTitle = String(block.title || '').trim()
  const title =
    !rawTitle || rawTitle === '商品详情' || rawTitle === '细节图' ? '产品详情信息' : rawTitle
  return `
    <section class="hpi-detail" id="hpi-detail">
      <div class="hwc-shell">
        <div class="hpi-detail__head">
          ${textNode('story.detailImages.title', title, {
            editable,
            tag: 'h2',
            className: 'hpi-detail__title',
            placeholder: '产品详情信息',
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
                  loading: 'eager',
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

function renderPhotosPanel(story, opts) {
  const album = renderProductAlbum(story, opts)
  if (album) return album
  return `
    <section class="hpi-album" id="hpi-album">
      <div class="hwc-shell">
        <div class="hpi-empty">
          <span class="material-symbols-outlined" aria-hidden="true">photo_camera</span>
          <b>暂无产品图拍</b>
          <p>实拍照片完善后将在此展示。</p>
        </div>
      </div>
    </section>`
}

function renderOverviewDetails(story, opts) {
  const details = renderProductDetailImages(story, opts)
  if (details) return details
  if (!opts.editable) return ''
  return `
    <section class="hpi-detail" id="hpi-detail">
      <div class="hwc-shell">
        <div class="hpi-empty">
          <span class="material-symbols-outlined" aria-hidden="true">photo_library</span>
          <b>暂无产品详情信息</b>
          <p>点击下方添加详情长图，将展示在商品首页此处。</p>
        </div>
        <button type="button" class="hpi-detail__add" data-detail-add>
          <span class="material-symbols-outlined" aria-hidden="true">add_photo_alternate</span>
          <strong>添加详情图</strong>
          <small>最多 12 张 · 建议 1600×1000</small>
        </button>
      </div>
    </section>`
}

export function renderProductStory(product, story, line, { editable = false } = {}) {
  const resolved = story || {}
  const opts = { editable }
  return `
    <article class="hpi${editable ? ' hpi--editable' : ''}" data-hpi-root>
      ${renderProductHero(resolved, product, line, opts)}
      ${renderProductTabs('overview')}
      <div class="hpi-panels">
        <div class="hpi-panel is-active" data-hpi-panel="overview">
          ${renderHighlightMasthead(resolved, product, opts)}
          ${renderProductCapabilities(resolved, opts)}
          ${renderOverviewDetails(resolved, opts)}
          ${renderProductScenarios(resolved, opts)}
          ${renderProductClosing(resolved, opts)}
        </div>
        <div class="hpi-panel" data-hpi-panel="photos" hidden>
          ${renderPhotosPanel(resolved, opts)}
        </div>
        <div class="hpi-panel" data-hpi-panel="videos" hidden>
          ${renderProductVideos(resolved, opts)}
        </div>
        <div class="hpi-panel" data-hpi-panel="specs" hidden>
          ${renderProductSpecs(resolved, opts)}
        </div>
      </div>
    </article>`
}

export function bindProductGallery(root = document) {
  const host = root.querySelector?.('[data-hpi-root]') || root
  if (!host?.querySelectorAll) return
  host.querySelectorAll('[data-hpi-gallery]').forEach((gallery) => {
    if (gallery.dataset.hpiGalleryBound === '1') return
    gallery.dataset.hpiGalleryBound = '1'
    const mainBox = gallery.querySelector('.hpi-gallery__main')
    const stage = gallery.querySelector('.hpi-gallery__stage')
    const thumbs = [...gallery.querySelectorAll('[data-hpi-gallery-thumb]')].filter((thumb) => {
      const img = thumb.querySelector('img')
      return String(thumb.dataset.src || img?.getAttribute('src') || '').trim() || thumb.querySelector('[data-edit-image]')
    })
    if (!thumbs.length) return
    let index = Math.max(
      0,
      thumbs.findIndex((thumb) => thumb.classList.contains('is-active'))
    )

    const readThumb = (thumb) => {
      const img = thumb.querySelector('img')
      return {
        src: String(thumb.dataset.src || img?.currentSrc || img?.getAttribute('src') || '').trim(),
        caption: String(thumb.dataset.caption || img?.getAttribute('alt') || '').trim(),
      }
    }

    const activate = (next, { force = false } = {}) => {
      if (!force && thumbs.length < 1) return
      if (thumbs.length < 2 && !force) {
        index = 0
      } else {
        index = ((next % thumbs.length) + thumbs.length) % thumbs.length
      }
      thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index))
      const { src, caption: tip } = readThumb(thumbs[index] || thumbs[0])
      const main = gallery.querySelector('[data-hpi-gallery-main]')
      if (src) {
        if (main) {
          main.src = src
          main.alt = tip || main.alt || ''
          main.hidden = false
        } else if (mainBox) {
          mainBox.innerHTML = `<img data-hpi-gallery-main src="${esc(src)}" alt="${esc(tip)}" width="960" height="960" draggable="false" />`
        }
      }
    }

    thumbs.forEach((thumb, i) => {
      // 淘宝：悬停缩略图即切换主图
      thumb.addEventListener('mouseenter', () => activate(i, { force: true }))
      thumb.addEventListener('focusin', () => activate(i, { force: true }))
      thumb.addEventListener('click', (event) => {
        if (event.target.closest('[data-edit-image]')) return
        activate(i, { force: true })
      })
    })
    gallery.querySelector('[data-hpi-gallery-prev]')?.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      activate(index - 1)
    })
    gallery.querySelector('[data-hpi-gallery-next]')?.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      activate(index + 1)
    })
    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        activate(index - 1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        activate(index + 1)
      }
    })

    // 主图左右半区点击切换
    stage?.addEventListener('click', (event) => {
      if (thumbs.length < 2) return
      if (event.target.closest('[data-hpi-gallery-prev], [data-hpi-gallery-next], [data-hpi-gallery-thumb]')) return
      const rect = stage.getBoundingClientRect()
      const x = event.clientX - rect.left
      activate(x < rect.width / 2 ? index - 1 : index + 1)
    })

    let touchX = null
    gallery.addEventListener(
      'touchstart',
      (event) => {
        touchX = event.changedTouches?.[0]?.clientX ?? null
      },
      { passive: true }
    )
    gallery.addEventListener(
      'touchend',
      (event) => {
        if (touchX == null || thumbs.length < 2) return
        const endX = event.changedTouches?.[0]?.clientX ?? touchX
        const delta = endX - touchX
        touchX = null
        if (Math.abs(delta) < 40) return
        activate(delta > 0 ? index - 1 : index + 1)
      },
      { passive: true }
    )

    activate(index, { force: true })
  })
}

export function bindProductStoryTabs(root = document) {
  bindProductGallery(root)
  const host = root.querySelector?.('[data-hpi-root]') || root
  if (!host?.querySelector) return
  const tabs = [...host.querySelectorAll('[data-hpi-tab]')]
  const panels = [...host.querySelectorAll('[data-hpi-panel]')]
  if (!tabs.length || !panels.length) return

  const hydratePanelMedia = (panel) => {
    if (!panel) return
    panel.querySelectorAll('img').forEach((img) => {
      if (img.loading === 'lazy') img.loading = 'eager'
      // 隐藏 Tab 内的懒加载图切过来后可能一直不请求，强制重触一次
      if (!img.complete || !img.naturalWidth) {
        const src = img.currentSrc || img.getAttribute('src') || ''
        if (!src) return
        img.setAttribute('src', src)
      }
    })
    panel.querySelectorAll('iframe[data-hpi-hydrate], iframe.hpi-showcase__frame').forEach((frame) => {
      const src = frame.getAttribute('src') || ''
      if (src && !frame.dataset.hpiHydrated) {
        frame.dataset.hpiHydrated = '1'
        frame.setAttribute('src', src)
      }
    })
  }

  const activate = (id) => {
    const next = tabs.some((tab) => tab.dataset.hpiTab === id) ? id : 'overview'
    tabs.forEach((tab) => {
      const active = tab.dataset.hpiTab === next
      tab.classList.toggle('is-active', active)
      tab.setAttribute('aria-selected', active ? 'true' : 'false')
    })
    panels.forEach((panel) => {
      const active = panel.dataset.hpiPanel === next
      panel.classList.toggle('is-active', active)
      panel.hidden = !active
      if (active) hydratePanelMedia(panel)
    })
    if (!host.closest?.('.admin-vedit-canvas')) {
      const url = new URL(window.location.href)
      if (next === 'overview') url.hash = ''
      else url.hash = next
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.dataset.hpiTab))
  })

  const hash = String(window.location.hash || '').replace(/^#/, '')
  const hashMap = { highlights: 'overview', overview: 'overview', photos: 'photos', videos: 'videos', specs: 'specs' }
  activate(hashMap[hash] || 'overview')

  host.querySelectorAll('a[href="#hpi-highlights"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      activate('overview')
      host.querySelector('#hpi-highlights')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
}
