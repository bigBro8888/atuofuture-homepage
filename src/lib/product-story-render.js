/** 商品详情叙事页渲染（前台与后台可视化编辑共用） */

import { esc, textNode, imgNode } from './vedit-nodes.js'

export function renderProductHero(story, product, line, { editable = false } = {}) {
  const hero = story.hero || {}
  const title = hero.title || product.name || ''
  const desc = hero.description || hero.headline || ''
  return `
    <header class="hpi-head">
      <div class="hwc-shell hpi-head__inner">
        <p class="hpi-head__crumb"><a href="/hardware/"${editable ? ' tabindex="-1"' : ''}>智能硬件</a>${line ? ` / <a href="/hardware/?line=${esc(line.id)}#hwc-browser"${editable ? ' tabindex="-1"' : ''}>${esc(line.name)}</a>` : ''} / ${esc(product.name)}</p>
        ${textNode('story.hero.title', title, { editable, tag: 'h1', className: 'hpi-head__title' })}
        ${
          desc || editable
            ? textNode('story.hero.description', desc, {
                editable,
                tag: 'p',
                className: 'hpi-head__desc',
                multiline: true,
                placeholder: '一句话产品介绍',
              })
            : ''
        }
      </div>
    </header>`
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
    ['overview', '商品首页'],
    ['specs', '产品参数'],
    ['photos', '产品图拍'],
    ['videos', '使用视频'],
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

function renderPhotosPanel(story, opts) {
  const album = renderProductAlbum(story, opts)
  const details = renderProductDetailImages(story, opts)
  if (album || details) return `${album}${details}`
  return `
    <section class="hpi-album" id="hpi-album">
      <div class="hwc-shell">
        <div class="hpi-empty">
          <span class="material-symbols-outlined" aria-hidden="true">photo_camera</span>
          <b>暂无产品图拍</b>
          <p>实拍与细节图完善后将在此展示。</p>
        </div>
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
          ${renderProductValue(resolved, opts)}
          ${renderProductCases(resolved, opts)}
          ${renderProductClosing(resolved, opts)}
        </div>
        <div class="hpi-panel" data-hpi-panel="specs" hidden>
          ${renderProductSpecs(resolved, opts)}
        </div>
        <div class="hpi-panel" data-hpi-panel="photos" hidden>
          ${renderPhotosPanel(resolved, opts)}
        </div>
        <div class="hpi-panel" data-hpi-panel="videos" hidden>
          ${renderProductVideos(resolved, opts)}
        </div>
      </div>
    </article>`
}

export function bindProductStoryTabs(root = document) {
  const host = root.querySelector?.('[data-hpi-root]') || root
  if (!host?.querySelector) return
  const tabs = [...host.querySelectorAll('[data-hpi-tab]')]
  const panels = [...host.querySelectorAll('[data-hpi-panel]')]
  if (!tabs.length || !panels.length) return

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
  activate(['overview', 'specs', 'photos', 'videos'].includes(hash) ? hash : 'overview')
}
