import { imgNode, textNode } from '../lib/vedit-nodes.js'

const IMAGE_SIZE_GUIDE = [
  { test: (path) => path === 'hero.background', label: '首屏背景', size: '1920×1080', tip: '横向全宽氛围图' },
  { test: (path) => /panorama\.items\.\d+\.image/.test(path), label: '业务全景封面', size: '640×400', tip: '卡片封面，建议横向' },
  { test: (path) => /scenes\.items\.\d+\.image/.test(path), label: '业务场景封面', size: '960×640', tip: '场景主视觉' },
  { test: () => true, label: '图片', size: '1200×800', tip: '按前台比例裁切即可' },
]

let ctx = {
  escapeHtml: (v) => String(v ?? ''),
  toast: () => {},
  api: null,
  state: null,
  getSection: () => 'hero',
  setSection: () => {},
}

function esc(value) {
  return ctx.escapeHtml(value)
}

function resolveImageSizeGuide(path = '') {
  return IMAGE_SIZE_GUIDE.find((item) => item.test(path)) || IMAGE_SIZE_GUIDE[IMAGE_SIZE_GUIDE.length - 1]
}

function setNested(target, path, value) {
  const keys = String(path || '').split('.').filter(Boolean)
  if (!keys.length) return
  let cursor = target
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value
      return
    }
    const nextKey = keys[index + 1]
    const isIndex = /^\d+$/.test(nextKey)
    if (cursor[key] == null) cursor[key] = isIndex ? [] : {}
    cursor = cursor[key]
  })
}

function readEditableText(el) {
  const raw = (el.innerText || '').replace(/\u00a0/g, ' ')
  if (el.dataset.editMultiline === 'true') {
    return raw.replace(/\r\n/g, '\n').replace(/\n+$/g, '').trimEnd()
  }
  return raw.replace(/\s+/g, ' ').trim()
}

function imageModalHtml() {
  return `
      <div class="admin-link-modal" data-aso-home-image-modal hidden>
        <div class="admin-link-modal__backdrop" data-aso-home-image-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-aso-home-image-modal-title">
          <header>
            <h3 id="admin-aso-home-image-modal-title">更换图片</h3>
            <button type="button" data-aso-home-image-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <div class="admin-image-modal__size">
              <strong data-aso-home-image-modal-size-label>建议尺寸</strong>
              <em data-aso-home-image-modal-size-value>1200×800</em>
              <span data-aso-home-image-modal-size-tip>上传前请按建议尺寸准备素材</span>
            </div>
            <div class="admin-image-modal__preview">
              <img data-aso-home-image-modal-preview src="" alt="" hidden />
              <span data-aso-home-image-modal-empty>暂无预览</span>
            </div>
            <label class="admin-news-field is-wide">
              <span>图片链接</span>
              <input type="text" data-aso-home-image-modal-url placeholder="/images/... 或 https://..." />
            </label>
            <div class="admin-image-modal__or">或</div>
            <label class="admin-image-modal__upload">
              上传本地图片
              <input type="file" accept="image/jpeg,image/png,image/webp" data-aso-home-image-modal-file />
            </label>
          </div>
          <footer>
            <button type="button" data-aso-home-image-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-aso-home-image-modal-save>确定</button>
          </footer>
        </div>
      </div>`
}

function linkModalHtml() {
  return `
      <div class="admin-link-modal" data-aso-home-link-modal hidden>
        <div class="admin-link-modal__backdrop" data-aso-home-link-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-aso-home-link-modal-title">
          <header>
            <h3 id="admin-aso-home-link-modal-title">设置封面跳转</h3>
            <button type="button" data-aso-home-link-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <p class="admin-form-section__hint" style="margin:0 0 12px">支持 https://…、站内路径 /…，或以 app:应用ID 打开应用广场对应应用。留空则点击封面进入该卡第一条能力。</p>
            <label class="admin-news-field is-wide">
              <span>跳转链接</span>
              <input type="text" data-aso-home-link-modal-url placeholder="https://… 或 /path 或 app:screen" />
            </label>
          </div>
          <footer>
            <button type="button" data-aso-home-link-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-aso-home-link-modal-save>确定</button>
          </footer>
        </div>
      </div>`
}

function renderHero(home) {
  const hero = home.hero || {}
  const titleLines = String(hero.title || '').replace(/\r\n/g, '\n')
  return `
    <section class="admin-aso-home__hero" data-aspace-home-anchor="hero">
      <div class="admin-aso-home__hero-bg">
        ${imgNode('hero.background', hero.background, { editable: true, className: 'admin-aso-home__hero-img', alt: '' })}
      </div>
      <div class="admin-aso-home__hero-shade" aria-hidden="true"></div>
      <div class="admin-aso-home__hero-copy">
        ${textNode('hero.title', titleLines, {
          editable: true,
          tag: 'h1',
          className: 'admin-aso-home__edit admin-aso-home__edit--multiline',
          multiline: true,
          placeholder: '主标题，可用换行',
          title: '点击编辑主标题',
        })}
        <div class="admin-aso-home__hero-cta">
          ${textNode('hero.primaryCta', hero.primaryCta, { editable: true, tag: 'span', className: 'admin-aso-home__btn admin-aso-home__btn--primary admin-aso-home__edit', title: '主按钮文案' })}
          ${textNode('hero.secondaryCta', hero.secondaryCta, { editable: true, tag: 'span', className: 'admin-aso-home__btn admin-aso-home__btn--ghost admin-aso-home__edit', title: '次按钮文案' })}
        </div>
      </div>
    </section>`
}

function renderPanorama(home) {
  const panorama = home.panorama || {}
  const items = Array.isArray(panorama.items) ? panorama.items : []
  return `
    <section class="admin-aso-home__panorama" data-aspace-home-anchor="panorama">
      <header class="admin-aso-home__section-head">
        <div>
          ${textNode('panorama.title', panorama.title, { editable: true, tag: 'h2', className: 'admin-aso-home__edit', title: '区块标题' })}
          ${textNode('panorama.lead', panorama.lead, { editable: true, tag: 'p', className: 'admin-aso-home__edit', title: '区块说明' })}
        </div>
        ${textNode('panorama.moreLabel', panorama.moreLabel, { editable: true, tag: 'span', className: 'admin-aso-home__more admin-aso-home__edit', title: '右侧按钮文案' })}
      </header>
      <div class="admin-aso-home__panorama-flow">
        ${items.map((item, index) => {
          const href = String(item.href || '').trim()
          const links = Array.isArray(item.items) ? item.items : []
          return `
          <article class="admin-aso-home__panorama-card" data-home-panorama="${esc(item.id)}">
            <figure class="admin-aso-home__panorama-media">
              ${imgNode(`panorama.items.${index}.image`, item.image, { editable: true, className: 'admin-aso-home__cover-img', alt: '' })}
              <button type="button" class="admin-aso-home__link-chip${href ? ' is-set' : ''}" data-edit-panorama-href="panorama.items.${index}.href" data-edit-href="${esc(href)}" title="设置封面跳转链接">
                <span class="material-symbols-outlined" aria-hidden="true">link</span>
                ${href ? '已设跳转' : '设置跳转'}
              </button>
              <header>
                ${textNode(`panorama.items.${index}.step`, item.step, { editable: true, tag: 'em', className: 'admin-aso-home__edit', title: '序号' })}
                ${textNode(`panorama.items.${index}.stage`, item.stage, { editable: true, tag: 'b', className: 'admin-aso-home__edit', title: '阶段名' })}
              </header>
            </figure>
            <div class="admin-aso-home__panorama-body">
              ${textNode(`panorama.items.${index}.title`, item.title, { editable: true, tag: 'h3', className: 'admin-aso-home__edit', title: '卡片标题' })}
              ${textNode(`panorama.items.${index}.desc`, item.desc, { editable: true, tag: 'p', className: 'admin-aso-home__edit', title: '卡片简介' })}
              <ul>
                ${links.map((link, linkIndex) => `
                <li>${textNode(`panorama.items.${index}.items.${linkIndex}.label`, link.label, { editable: true, tag: 'span', className: 'admin-aso-home__edit', title: `能力 ${linkIndex + 1}` })}</li>`).join('')}
              </ul>
            </div>
          </article>`
        }).join('')}
      </div>
    </section>`
}

function renderScenes(home) {
  const scenes = home.scenes || {}
  const items = Array.isArray(scenes.items) ? scenes.items : []
  return `
    <section class="admin-aso-home__scenes" data-aspace-home-anchor="scenes">
      <header class="admin-aso-home__section-head">
        <div>
          ${textNode('scenes.title', scenes.title, { editable: true, tag: 'h2', className: 'admin-aso-home__edit', title: '区块标题' })}
          ${textNode('scenes.lead', scenes.lead, { editable: true, tag: 'p', className: 'admin-aso-home__edit', title: '区块说明' })}
        </div>
      </header>
      <div class="admin-aso-home__scenes-list">
        ${items.map((scene, index) => {
          const apps = Array.isArray(scene.apps) ? scene.apps : []
          return `
          <article class="admin-aso-home__scene-card" data-home-scene="${esc(scene.id)}">
            <figure class="admin-aso-home__scene-media">
              ${imgNode(`scenes.items.${index}.image`, scene.image, { editable: true, className: 'admin-aso-home__cover-img', alt: '' })}
            </figure>
            <div class="admin-aso-home__scene-body">
              ${textNode(`scenes.items.${index}.label`, scene.label, { editable: true, tag: 'p', className: 'admin-aso-home__scene-label admin-aso-home__edit', title: '场景名' })}
              ${textNode(`scenes.items.${index}.title`, scene.title, { editable: true, tag: 'h3', className: 'admin-aso-home__edit', title: '场景标题' })}
              ${textNode(`scenes.items.${index}.lead`, scene.lead, { editable: true, tag: 'p', className: 'admin-aso-home__edit', title: '场景简介' })}
              <ul>
                ${apps.map((app, appIndex) => `
                <li>${textNode(`scenes.items.${index}.apps.${appIndex}.label`, app.label, { editable: true, tag: 'span', className: 'admin-aso-home__edit', title: `应用 ${appIndex + 1}` })}</li>`).join('')}
              </ul>
            </div>
          </article>`
        }).join('')}
      </div>
    </section>`
}

function renderInfra(home) {
  const infra = home.infra || {}
  const stats = Array.isArray(infra.stats) ? infra.stats : []
  return `
    <section class="admin-aso-home__infra" data-aspace-home-anchor="infra">
      ${textNode('infra.title', infra.title, { editable: true, tag: 'h2', className: 'admin-aso-home__edit', title: '区块标题' })}
      <ul class="admin-aso-home__stats">
        ${stats.map((stat, index) => `
        <li data-home-stat="${index}">
          <strong>
            ${textNode(`infra.stats.${index}.value`, stat.value, { editable: true, tag: 'em', className: 'admin-aso-home__edit', title: '数值' })}
            ${textNode(`infra.stats.${index}.unit`, stat.unit || '', { editable: true, tag: 'span', className: 'admin-aso-home__edit', placeholder: '+', title: '单位' })}
          </strong>
          ${textNode(`infra.stats.${index}.label`, stat.label, { editable: true, tag: 'p', className: 'admin-aso-home__edit', title: '说明' })}
        </li>`).join('')}
      </ul>
      ${textNode('infra.cta', infra.cta, { editable: true, tag: 'span', className: 'admin-aso-home__btn admin-aso-home__btn--primary admin-aso-home__edit', title: '按钮文案' })}
    </section>`
}

export function renderAspaceHomeVisualMarkup(home, { section = 'hero' } = {}) {
  const data = home || {}
  const active = ['hero', 'panorama', 'scenes', 'infra'].includes(section) ? section : 'hero'
  return `
    <div class="admin-vedit admin-vedit--aspace-home">
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">点文字直接改；点图片换图；业务全景封面上的「设置跳转」可配置点击链接。保存后前台立即生效。</p>
        <button type="button" class="admin-vedit-fullscreen-btn" data-aso-home-fullscreen>
          <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
          全屏编辑
        </button>
      </div>
      <div class="admin-vedit-canvas admin-aso-home" data-aspace-home-visual>
        <div class="admin-vedit-fullscreen-bar" hidden>
          <strong>Aspace 首页 · 全屏编辑</strong>
          <button type="button" data-aso-home-fullscreen-exit>
            <span class="material-symbols-outlined" aria-hidden="true">fullscreen_exit</span>
            退出全屏
          </button>
        </div>
        <nav class="admin-aspace-home-nav admin-aso-home__nav" aria-label="首页区块">
          <button type="button" data-aspace-home-section="hero"${active === 'hero' ? ' class="is-active"' : ''}>首屏</button>
          <button type="button" data-aspace-home-section="panorama"${active === 'panorama' ? ' class="is-active"' : ''}>业务全景</button>
          <button type="button" data-aspace-home-section="scenes"${active === 'scenes' ? ' class="is-active"' : ''}>业务场景</button>
          <button type="button" data-aspace-home-section="infra"${active === 'infra' ? ' class="is-active"' : ''}>能力指标</button>
        </nav>
        ${renderHero(data)}
        ${renderPanorama(data)}
        ${renderScenes(data)}
        ${renderInfra(data)}
      </div>
      ${imageModalHtml()}
      ${linkModalHtml()}
    </div>`
}

export function collectAspaceHomeVisual(baseHome) {
  const home = structuredClone(baseHome || {})
  if (!home.hero) return null
  const root = document.querySelector('[data-aspace-home-visual]')
  if (!root) return home

  root.querySelectorAll('[data-edit-path]').forEach((el) => {
    const path = el.dataset.editPath
    if (!path) return
    setNested(home, path, readEditableText(el))
  })
  root.querySelectorAll('[data-edit-image]').forEach((el) => {
    const path = el.dataset.editImage
    if (!path) return
    const url = el.dataset.editImageUrl != null
      ? el.dataset.editImageUrl
      : el.querySelector('img')?.getAttribute('src') || ''
    setNested(home, path, String(url || '').trim())
  })
  root.querySelectorAll('[data-edit-panorama-href]').forEach((el) => {
    const path = el.dataset.editPanoramaHref
    if (!path) return
    setNested(home, path, String(el.dataset.editHref || '').trim())
  })

  // Preserve ids / category / appId that are not visually editable
  const base = baseHome || {}
  home.panorama.items = (base.panorama?.items || []).map((item, index) => {
    const next = home.panorama?.items?.[index] || {}
    return {
      ...item,
      ...next,
      id: item.id,
      items: (item.items || []).map((link, linkIndex) => ({
        ...link,
        label: next.items?.[linkIndex]?.label ?? link.label,
      })),
    }
  })
  home.scenes.items = (base.scenes?.items || []).map((item, index) => {
    const next = home.scenes?.items?.[index] || {}
    return {
      ...item,
      ...next,
      id: item.id,
      apps: (item.apps || []).map((app, appIndex) => ({
        ...app,
        label: next.apps?.[appIndex]?.label ?? app.label,
      })),
    }
  })
  home.infra.stats = (base.infra?.stats || []).map((stat, index) => ({
    ...stat,
    ...(home.infra?.stats?.[index] || {}),
  }))
  return home
}

function currentImageUrl(imageEl) {
  if (!imageEl) return ''
  if (imageEl.dataset.editImageUrl) return imageEl.dataset.editImageUrl
  return imageEl.querySelector('img')?.getAttribute('src') || ''
}

function setImageModalPreview(modal, url) {
  const preview = modal.querySelector('[data-aso-home-image-modal-preview]')
  const empty = modal.querySelector('[data-aso-home-image-modal-empty]')
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

function applyVisualImage(path, url) {
  const canvas = document.querySelector('[data-aspace-home-visual]')
  if (!canvas || !path) return
  const target = canvas.querySelector(`[data-edit-image="${CSS.escape(path)}"]`) || canvas.querySelector(`[data-edit-image="${path}"]`)
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

function openImageModal(imageEl) {
  const modal = document.querySelector('[data-aso-home-image-modal]')
  if (!modal || !imageEl) return
  modal.hidden = false
  modal._targetPath = imageEl.dataset.editImage || ''
  const guide = resolveImageSizeGuide(modal._targetPath)
  modal.querySelector('#admin-aso-home-image-modal-title').textContent = `更换图片 · ${guide.label}`
  modal.querySelector('[data-aso-home-image-modal-size-label]').textContent = `${guide.label} · 建议尺寸`
  modal.querySelector('[data-aso-home-image-modal-size-value]').textContent = guide.size
  modal.querySelector('[data-aso-home-image-modal-size-tip]').textContent = guide.tip
  const url = currentImageUrl(imageEl)
  const urlInput = modal.querySelector('[data-aso-home-image-modal-url]')
  if (urlInput) urlInput.value = url
  setImageModalPreview(modal, url)
}

function closeImageModal() {
  const modal = document.querySelector('[data-aso-home-image-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetPath = ''
}

function saveImageModal() {
  const modal = document.querySelector('[data-aso-home-image-modal]')
  if (!modal?._targetPath) return
  const url = modal.querySelector('[data-aso-home-image-modal-url]')?.value.trim() || ''
  applyVisualImage(modal._targetPath, url)
  closeImageModal()
  ctx.toast(url ? '图片已更新' : '已清除图片')
}

function openLinkModal(chip) {
  const modal = document.querySelector('[data-aso-home-link-modal]')
  if (!modal || !chip) return
  modal.hidden = false
  modal._targetPath = chip.dataset.editPanoramaHref || ''
  modal._chip = chip
  const urlInput = modal.querySelector('[data-aso-home-link-modal-url]')
  if (urlInput) urlInput.value = chip.dataset.editHref || ''
}

function closeLinkModal() {
  const modal = document.querySelector('[data-aso-home-link-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetPath = ''
  modal._chip = null
}

function saveLinkModal() {
  const modal = document.querySelector('[data-aso-home-link-modal]')
  const chip = modal?._chip
  if (!modal?._targetPath || !chip) return
  const url = modal.querySelector('[data-aso-home-link-modal-url]')?.value.trim() || ''
  chip.dataset.editHref = url
  chip.classList.toggle('is-set', Boolean(url))
  chip.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">link</span>${url ? '已设跳转' : '设置跳转'}`
  closeLinkModal()
  ctx.toast(url ? '跳转链接已更新' : '已清空跳转链接')
}

function setFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--aspace-home')
  const canvas = document.querySelector('[data-aspace-home-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-aspace-home-fullscreen', on)
  if (bar) bar.hidden = !on
}

export function scrollAspaceHomeSection(section) {
  const next = ['hero', 'panorama', 'scenes', 'infra'].includes(section) ? section : 'hero'
  const host = document.querySelector('[data-aspace-editor]')
  host?.querySelectorAll('[data-aspace-home-section]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.aspaceHomeSection === next)
  })
  const canvas = document.querySelector('[data-aspace-home-visual]')
  const anchor = canvas?.querySelector(`[data-aspace-home-anchor="${CSS.escape(next)}"]`)
  if (anchor && canvas) {
    const top = canvas.scrollTop + (anchor.getBoundingClientRect().top - canvas.getBoundingClientRect().top) - 12
    canvas.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }
}

export function bindAspaceHomeVisualAdmin(helpers = {}) {
  ctx = { ...ctx, ...helpers }
  const editor = document.querySelector('[data-aspace-editor]')
  if (!editor) return

  editor.addEventListener('click', (event) => {
    if (event.target.closest('[data-aso-home-fullscreen]')) {
      event.preventDefault()
      setFullscreen(true)
      return
    }
    if (event.target.closest('[data-aso-home-fullscreen-exit]')) {
      event.preventDefault()
      setFullscreen(false)
      return
    }
    if (event.target.closest('[data-aso-home-image-modal-close]')) {
      event.preventDefault()
      closeImageModal()
      return
    }
    if (event.target.closest('[data-aso-home-image-modal-save]')) {
      event.preventDefault()
      saveImageModal()
      return
    }
    if (event.target.closest('[data-aso-home-link-modal-close]')) {
      event.preventDefault()
      closeLinkModal()
      return
    }
    if (event.target.closest('[data-aso-home-link-modal-save]')) {
      event.preventDefault()
      saveLinkModal()
      return
    }
    const linkChip = event.target.closest('[data-edit-panorama-href]')
    if (linkChip && editor.contains(linkChip)) {
      event.preventDefault()
      openLinkModal(linkChip)
      return
    }
    const imageEl = event.target.closest('[data-edit-image]')
    if (imageEl && editor.contains(imageEl)) {
      event.preventDefault()
      openImageModal(imageEl)
    }
  })

  editor.addEventListener('change', async (event) => {
    const fileInput = event.target.closest('[data-aso-home-image-modal-file]')
    if (!fileInput?.files?.[0] || !ctx.api) return
    const modal = document.querySelector('[data-aso-home-image-modal]')
    fileInput.disabled = true
    try {
      const body = new FormData()
      body.append('image', fileInput.files[0])
      const result = await ctx.api('/pages/media/image', { method: 'POST', body })
      const url = result.url || ''
      const urlInput = modal.querySelector('[data-aso-home-image-modal-url]')
      if (urlInput) urlInput.value = url
      setImageModalPreview(modal, url)
      ctx.toast('图片已上传，点确定应用')
    } catch (error) {
      ctx.toast(error.message, true)
    } finally {
      fileInput.disabled = false
      fileInput.value = ''
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (document.body.classList.contains('admin-aspace-home-fullscreen')) {
      setFullscreen(false)
      return
    }
    const linkModal = document.querySelector('[data-aso-home-link-modal]')
    if (linkModal && !linkModal.hidden) {
      closeLinkModal()
      return
    }
    const imageModal = document.querySelector('[data-aso-home-image-modal]')
    if (imageModal && !imageModal.hidden) closeImageModal()
  })
}
