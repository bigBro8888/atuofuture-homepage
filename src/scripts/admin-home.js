import { renderHomePage } from '../lib/home-page-render.js'

const HOME_SECTIONS = [
  { id: 'hero', label: '首屏轮播' },
  { id: 'agents', label: '产品与方案总览' },
  { id: 'solutions', label: '产品与方案' },
  { id: 'news', label: '新闻动态' },
  { id: 'pitch', label: '探索安托未来' },
]

const IMAGE_SIZE_GUIDE = [
  { test: (path) => /heroSlides\.\d+\.background/.test(path), label: '首屏背景', size: '1920×1080', tip: '全幅横图，左侧留暗部给文字' },
  { test: (path) => /agents\.software\.\d+\.imageUrl/.test(path), label: '系统软件截图', size: '640×480', tip: '4:3 界面预览' },
  { test: (path) => /agents\.hardware\.\d+\.imageUrl/.test(path), label: '智能硬件产品图', size: '640×480', tip: '4:3 产品图' },
  { test: (path) => /agents\.platform\.\d+\.imageUrl/.test(path), label: '平台能力配图', size: '640×360', tip: '16:9 小图' },
  { test: (path) => /solutions\.items\.\d+\.imageUrl/.test(path), label: '方案封面', size: '880×420', tip: '卡片封面' },
  { test: (path) => /news\.items\.\d+\.imageUrl/.test(path), label: '新闻封面', size: '1280×720', tip: '16:9 封面' },
  { test: (path) => /pitch\.items\.\d+\.imageUrl/.test(path), label: '宫格图片', size: '800×1000', tip: '竖图更合适' },
  { test: () => true, label: '图片', size: '1200×800', tip: '按前台比例裁切即可' },
]

let ctx = { escapeHtml: (v) => String(v ?? ''), toast: () => {}, api: null, state: null, onSectionChange: null }

function resolveImageSizeGuide(path = '') {
  return IMAGE_SIZE_GUIDE.find((item) => item.test(path)) || IMAGE_SIZE_GUIDE[IMAGE_SIZE_GUIDE.length - 1]
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
  return (el.innerText || '').replace(/\u00a0/g, ' ').trim()
}

function imageModalHtml() {
  return `
      <div class="admin-link-modal" data-home-image-modal hidden>
        <div class="admin-link-modal__backdrop" data-home-image-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-home-image-modal-title">
          <header>
            <h3 id="admin-home-image-modal-title">更换图片</h3>
            <button type="button" data-home-image-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <div class="admin-image-modal__size">
              <strong data-home-image-modal-size-label>建议尺寸</strong>
              <em data-home-image-modal-size-value>1920×1080</em>
              <span data-home-image-modal-size-tip>上传前请按建议尺寸准备素材</span>
            </div>
            <div class="admin-image-modal__preview">
              <img data-home-image-modal-preview src="" alt="" hidden />
              <span data-home-image-modal-empty>暂无预览</span>
            </div>
            <label class="admin-news-field is-wide">
              <span>图片链接</span>
              <input type="text" data-home-image-modal-url placeholder="/images/... 或 https://..." />
            </label>
            <div class="admin-image-modal__or">或</div>
            <label class="admin-image-modal__upload">
              上传本地图片
              <input type="file" accept="image/jpeg,image/png,image/webp" data-home-image-modal-file />
            </label>
          </div>
          <footer>
            <button type="button" data-home-image-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-home-image-modal-save>确定</button>
          </footer>
        </div>
      </div>`
}

function defaultItem(kind) {
  if (kind === 'hero') {
    return {
      label: '',
      title: '新首屏标题',
      description: '补充说明文案',
      actionLabel: '了解更多',
      actionHref: '/',
      background: '/images/home-advantages/advantage-ai-agent.webp',
    }
  }
  if (kind === 'solutions') {
    return {
      chip: '方案',
      title: '新方案标题',
      description: '一句话说明',
      tags: [],
      imageUrl: '/images/home-agents/meeting.jpg',
      linkUrl: '/solutions/',
    }
  }
  if (kind === 'news') {
    return {
      category: '公司动态',
      title: '新闻标题',
      description: '摘要',
      imageUrl: '/images/home-advantages/advantage-ai-agent.webp',
      linkUrl: '/news/',
    }
  }
  return {
    variant: 'photo',
    kicker: '探索',
    title: '宫格标题',
    moreLabel: '阅读更多信息',
    href: '/',
    imageUrl: '/images/home-advantages/advantage-open-interface.webp',
    openDemo: false,
  }
}

function listRef(content, kind) {
  if (kind === 'hero') {
    content.heroSlides = Array.isArray(content.heroSlides) ? content.heroSlides : []
    return content.heroSlides
  }
  if (kind === 'solutions') {
    content.solutions = content.solutions || {}
    content.solutions.items = Array.isArray(content.solutions.items) ? content.solutions.items : []
    return content.solutions.items
  }
  if (kind === 'news') {
    content.news = content.news || {}
    content.news.items = Array.isArray(content.news.items) ? content.news.items : []
    return content.news.items
  }
  content.pitch = content.pitch || {}
  content.pitch.items = Array.isArray(content.pitch.items) ? content.pitch.items : []
  return content.pitch.items
}

export function collectHomeVisualContent(baseContent) {
  const content = structuredClone(baseContent || {})
  const root = document.querySelector('[data-home-editor]')
  if (!root) return content

  root.querySelectorAll('[data-edit-path]').forEach((el) => {
    const path = el.dataset.editPath
    if (!path) return
    let value = readEditableText(el)
    if (/\.tags$/.test(path)) value = value.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean)
    setNested(content, path, value)
  })

  root.querySelectorAll('[data-edit-image]').forEach((el) => {
    const path = el.dataset.editImage
    if (!path) return
    const url = el.dataset.editImageUrl != null ? el.dataset.editImageUrl : el.querySelector('img')?.getAttribute('src') || ''
    setNested(content, path, url || '')
  })

  root.querySelectorAll('[data-home-field]').forEach((field) => {
    const path = field.dataset.homeField
    if (!path) return
    let value
    if (field.dataset.homeType === 'checkbox') value = field.checked
    else value = field.value
    setNested(content, path, value)
  })

  return content
}

function scrollHomeSection(id) {
  const target = document.querySelector(`[data-home-visual] [data-home-section="${CSS.escape(id)}"]`)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function clampHeroIndex(content, index = 0) {
  const total = Array.isArray(content?.heroSlides) ? content.heroSlides.length : 0
  if (total <= 0) return 0
  return Math.min(Math.max(0, Number(index) || 0), total - 1)
}

function activateHeroSlide(index) {
  const section = document.querySelector('#home-visual-hero')
  if (!section) return
  const target = Number(index) || 0
  section.querySelectorAll('[data-home-hero-slide]').forEach((el) => {
    const on = Number(el.dataset.homeHeroSlide) === target
    el.classList.toggle('is-editing', on)
    el.hidden = !on
  })
  section.querySelectorAll('[data-home-hero-pick]').forEach((btn) => {
    const on = Number(btn.dataset.homeHeroPick) === target
    btn.classList.toggle('is-active', on)
    btn.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  if (ctx.state) ctx.state.homeHeroIndex = target
}

export function renderHomeVisualEditor(content, { section = 'hero', heroIndex } = {}) {
  const editor = document.querySelector('[data-home-editor]')
  if (!editor) return
  editor.classList.add('admin-news-editor')
  const active = HOME_SECTIONS.some((item) => item.id === section) ? section : 'hero'
  const resolvedHeroIndex = clampHeroIndex(content, heroIndex ?? ctx.state?.homeHeroIndex ?? 0)
  if (ctx.state) ctx.state.homeHeroIndex = resolvedHeroIndex
  editor.innerHTML = `
    <div class="admin-vedit admin-vedit--home">
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">按官网首页通栏预览编辑：点文字改文案，点图换图；增删在区块顶栏。首屏轮播用顶部分页切换，只显示当前一屏。</p>
        <nav class="admin-home-jump" aria-label="跳转区块">
          ${HOME_SECTIONS.map((item) => `
            <button type="button" data-home-goto="${item.id}" class="${item.id === active ? 'is-active' : ''}">${item.label}</button>
          `).join('')}
        </nav>
        <button type="button" class="admin-vedit-fullscreen-btn" data-home-fullscreen>
          <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
          全屏编辑
        </button>
      </div>
      <div class="admin-vedit-canvas" data-home-visual>
        <div class="admin-vedit-fullscreen-bar" hidden>
          <strong>官网首页 · 全屏编辑</strong>
          <button type="button" data-home-fullscreen-exit>
            <span class="material-symbols-outlined" aria-hidden="true">fullscreen_exit</span>
            退出全屏
          </button>
        </div>
        ${renderHomePage(content || {}, { editable: true, heroIndex: resolvedHeroIndex })}
      </div>
      ${imageModalHtml()}
    </div>`
  window.requestAnimationFrame(() => scrollHomeSection(active))
}

function currentImageUrl(imageEl) {
  if (!imageEl) return ''
  if (imageEl.dataset.editImageUrl) return imageEl.dataset.editImageUrl
  return imageEl.querySelector('img')?.getAttribute('src') || ''
}

function setImageModalPreview(modal, url) {
  const preview = modal.querySelector('[data-home-image-modal-preview]')
  const empty = modal.querySelector('[data-home-image-modal-empty]')
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
  const canvas = document.querySelector('[data-home-visual]')
  if (!canvas || !path) return
  const target = canvas.querySelector(`[data-edit-image="${CSS.escape(path)}"]`) || canvas.querySelector(`[data-edit-image="${path}"]`)
  const safeUrl = String(url || '').trim()
  if (target) {
    target.dataset.editImageUrl = safeUrl
    let img = target.querySelector('img')
    if (safeUrl) {
      target.classList.remove('hpi-edit-img--empty')
      if (!img && !target.matches('.hpi-edit-bg')) {
        img = document.createElement('img')
        img.alt = ''
        target.prepend(img)
      }
      if (img) img.src = safeUrl
      if (target.matches('.hpi-edit-bg')) {
        const media = target.parentElement
        if (media) media.style.backgroundImage = `url("${safeUrl}")`
        target.textContent = target.title?.includes('背景') ? '更换背景' : target.title?.includes('封面') ? '更换封面' : '更换配图'
      }
    }
  }
  if (target?.matches('.hpi-edit-bg') && safeUrl) {
    const mediaHost = target.parentElement
    if (mediaHost) mediaHost.style.backgroundImage = `url("${safeUrl}")`
  }
}

function openImageModal(imageEl) {
  const modal = document.querySelector('[data-home-image-modal]')
  if (!modal || !imageEl) return
  modal.hidden = false
  modal._targetPath = imageEl.dataset.editImage || ''
  const guide = resolveImageSizeGuide(modal._targetPath)
  const title = modal.querySelector('#admin-home-image-modal-title')
  if (title) title.textContent = `更换图片 · ${guide.label}`
  modal.querySelector('[data-home-image-modal-size-label]').textContent = `${guide.label} · 建议尺寸`
  modal.querySelector('[data-home-image-modal-size-value]').textContent = guide.size
  modal.querySelector('[data-home-image-modal-size-tip]').textContent = guide.tip
  const url = currentImageUrl(imageEl)
  const urlInput = modal.querySelector('[data-home-image-modal-url]')
  if (urlInput) urlInput.value = url
  setImageModalPreview(modal, url)
}

function closeImageModal() {
  const modal = document.querySelector('[data-home-image-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetPath = ''
  const fileInput = modal.querySelector('[data-home-image-modal-file]')
  if (fileInput) fileInput.value = ''
}

function saveImageModal() {
  const modal = document.querySelector('[data-home-image-modal]')
  if (!modal?._targetPath) return
  const url = modal.querySelector('[data-home-image-modal-url]')?.value.trim() || ''
  applyVisualImage(modal._targetPath, url)
  closeImageModal()
  ctx.toast(url ? '图片已更新' : '已清除图片')
}

function setFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--home')
  const canvas = document.querySelector('[data-home-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-home-fullscreen', on)
  if (bar) bar.hidden = !on
}

function rerenderFromDom(activeSection) {
  if (!ctx.state?.homePage) return
  const content = collectHomeVisualContent(ctx.state.homePage.draftContent)
  ctx.state.homePage.draftContent = content
  renderHomeVisualEditor(content, {
    section: activeSection || ctx.state.homeSection || 'hero',
    heroIndex: ctx.state.homeHeroIndex,
  })
  if (typeof ctx.onSectionChange === 'function') ctx.onSectionChange(activeSection || ctx.state.homeSection || 'hero')
}

export function bindHomeVisualAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const editor = document.querySelector('[data-home-editor]')
  if (!editor) return

  editor.addEventListener('click', async (event) => {
    if (!document.querySelector('[data-home-visual]')) return

    const jump = event.target.closest('[data-home-goto]')
    if (jump) {
      event.preventDefault()
      const id = jump.dataset.homeGoto
      editor.querySelectorAll('[data-home-goto]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.homeGoto === id)
      })
      if (ctx.state) ctx.state.homeSection = id
      scrollHomeSection(id)
      if (typeof ctx.onSectionChange === 'function') ctx.onSectionChange(id)
      return
    }

    if (event.target.closest('[data-home-fullscreen]')) {
      event.preventDefault()
      setFullscreen(true)
      return
    }
    if (event.target.closest('[data-home-fullscreen-exit]')) {
      event.preventDefault()
      setFullscreen(false)
      return
    }
    if (event.target.closest('[data-home-image-modal-close]')) {
      event.preventDefault()
      closeImageModal()
      return
    }
    if (event.target.closest('[data-home-image-modal-save]')) {
      event.preventDefault()
      saveImageModal()
      return
    }

    const heroPick = event.target.closest('[data-home-hero-pick]')
    if (heroPick) {
      event.preventDefault()
      activateHeroSlide(Number(heroPick.dataset.homeHeroPick))
      return
    }

    const imageEl = event.target.closest('[data-edit-image]')
    if (imageEl && editor.contains(imageEl)) {
      event.preventDefault()
      openImageModal(imageEl)
      return
    }

    const add = event.target.closest('[data-home-visual-add]')
    if (add) {
      event.preventDefault()
      const kind = add.dataset.homeVisualAdd
      const content = collectHomeVisualContent(ctx.state.homePage.draftContent)
      listRef(content, kind).push(defaultItem(kind))
      ctx.state.homePage.draftContent = content
      const heroIndex = kind === 'hero' ? listRef(content, kind).length - 1 : ctx.state.homeHeroIndex
      if (kind === 'hero') ctx.state.homeHeroIndex = heroIndex
      renderHomeVisualEditor(content, { section: kind, heroIndex })
      if (ctx.state) ctx.state.homeSection = kind
      if (typeof ctx.onSectionChange === 'function') ctx.onSectionChange(kind)
      ctx.toast('已新增，记得保存草稿')
      return
    }

    const move = event.target.closest('[data-home-visual-move]')
    if (move) {
      event.preventDefault()
      const kind = move.dataset.homeVisualKind
      const index = Number(move.dataset.homeVisualIndex)
      const delta = Number(move.dataset.homeVisualMove)
      const content = collectHomeVisualContent(ctx.state.homePage.draftContent)
      const list = listRef(content, kind)
      const next = index + delta
      if (next < 0 || next >= list.length) return
      const [item] = list.splice(index, 1)
      list.splice(next, 0, item)
      ctx.state.homePage.draftContent = content
      const heroIndex = kind === 'hero' ? next : ctx.state.homeHeroIndex
      if (kind === 'hero') ctx.state.homeHeroIndex = heroIndex
      renderHomeVisualEditor(content, { section: kind, heroIndex })
      if (typeof ctx.onSectionChange === 'function') ctx.onSectionChange(kind)
      return
    }

    const remove = event.target.closest('[data-home-visual-remove]')
    if (remove) {
      event.preventDefault()
      const kind = remove.dataset.homeVisualKind
      const index = Number(remove.dataset.homeVisualIndex)
      const content = collectHomeVisualContent(ctx.state.homePage.draftContent)
      const list = listRef(content, kind)
      if (list.length <= 1) return
      list.splice(index, 1)
      ctx.state.homePage.draftContent = content
      const heroIndex = kind === 'hero' ? Math.min(index, list.length - 1) : ctx.state.homeHeroIndex
      if (kind === 'hero') ctx.state.homeHeroIndex = heroIndex
      renderHomeVisualEditor(content, { section: kind, heroIndex })
      if (typeof ctx.onSectionChange === 'function') ctx.onSectionChange(kind)
      ctx.toast('已删除条目，记得保存草稿')
      return
    }

    if (event.target.closest('[data-home-visual] a, [data-home-visual] .sm-btn') && !event.target.closest('[data-edit-image], [contenteditable="true"]')) {
      event.preventDefault()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!document.body.classList.contains('admin-home-fullscreen')) return
    setFullscreen(false)
  })

  editor.addEventListener('change', async (event) => {
    if (!document.querySelector('[data-home-visual]')) return
    if (event.target.closest('[data-home-field="pitch.items"]') || event.target.matches('[data-home-field]')) {
      // variant / checkbox 即时反映样式：整段重渲更稳
      if (event.target.closest('[data-home-field]')?.dataset.homeField?.includes('pitch.items')) {
        const section = ctx.state?.homeSection || 'pitch'
        rerenderFromDom(section)
      }
    }
    const fileInput = event.target.closest('[data-home-image-modal-file]')
    if (!fileInput?.files?.[0] || !ctx.api) return
    const modal = document.querySelector('[data-home-image-modal]')
    fileInput.disabled = true
    try {
      const { uploadAdminImage } = await import('../lib/admin-image-upload.js')
      const url = await uploadAdminImage(ctx.api, fileInput.files[0], 'home')
      const urlInput = modal.querySelector('[data-home-image-modal-url]')
      if (urlInput) urlInput.value = url
      setImageModalPreview(modal, url)
      ctx.toast('图片已上传到 OSS，点确定应用')
    } catch (error) {
      ctx.toast(error.message, true)
    } finally {
      fileInput.disabled = false
      fileInput.value = ''
    }
  })
}
