import { renderHomePage } from '../lib/home-page-render.js'

const IMAGE_SIZE_GUIDE = [
  { test: (path) => /heroSlides\.\d+\.background/.test(path), label: '首屏轮播背景', size: '1920×600', tip: '横向全幅大图' },
  { test: (path) => path === 'banner.imageUrl', label: '推广条配图', size: '480×360', tip: '左侧小图' },
  { test: (path) => /agents\.items\.\d+\.imageUrl/.test(path), label: '智能体场景图', size: '2100×900', tip: '21:9，左下留暗部给文字' },
  { test: (path) => /solutions\.items\.\d+\.imageUrl/.test(path), label: '方案封面', size: '880×420', tip: '卡片封面横图' },
  { test: (path) => /news\.items\.\d+\.imageUrl/.test(path), label: '新闻封面', size: '1280×720', tip: '16:9 封面' },
  { test: (path) => /pitch\.items\.\d+\.imageUrl/.test(path), label: '宫格背景图', size: '1200×800', tip: '仅图片卡使用' },
  { test: () => true, label: '图片', size: '1200×800', tip: '按前台比例裁切即可' },
]

const EMPTY_HERO_SLIDE = {
  label: '',
  title: '新一屏标题',
  description: '',
  actionLabel: '了解更多',
  actionHref: '#upgrade',
  background: '/images/home-advantages/advantage-ai-agent.webp',
}
const EMPTY_HOME_AGENT = {
  id: '',
  name: '新智能体',
  sceneTitle: '',
  sceneCaption: '',
  imageUrl: '/images/home-agents/space.jpg',
}
const EMPTY_HOME_LIST = {
  solutions: { chip: '智能体 + 硬件', title: '新方案', description: '', tags: [], imageUrl: '', linkUrl: '/solutions/' },
  news: { category: '公司动态', title: '新闻标题', description: '', imageUrl: '', linkUrl: '/news/' },
  pitch: {
    variant: 'photo',
    kicker: '新入口',
    title: '填写导语',
    href: '/',
    moreLabel: '阅读更多信息',
    imageUrl: '',
    openDemo: false,
  },
}

let ctx = {
  escapeHtml: (v) => String(v ?? ''),
  toast: () => {},
  api: null,
  state: null,
}

function esc(value) {
  return ctx.escapeHtml(value)
}

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

function packArray(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  return Object.keys(value)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key])
}

function field(path, label, value, options = {}) {
  const control =
    options.type === 'textarea'
      ? `<textarea data-home-field="${esc(path)}" rows="${options.rows || 2}">${esc(value || '')}</textarea>`
      : options.type === 'select'
        ? `<select data-home-field="${esc(path)}">${(options.options || [])
            .map(([v, text]) => `<option value="${esc(v)}"${String(value) === String(v) ? ' selected' : ''}>${esc(text)}</option>`)
            .join('')}</select>`
        : options.type === 'checkbox'
          ? `<input data-home-field="${esc(path)}" data-home-type="checkbox" type="checkbox"${value ? ' checked' : ''} />`
          : `<input data-home-field="${esc(path)}" type="text" value="${esc(value || '')}" />`
  return `<label class="${options.wide ? 'admin-form-wide' : ''}"><span>${label}</span>${control}${
    options.help ? `<small>${esc(options.help)}</small>` : ''
  }</label>`
}

function listTools(kind, index, length, { min = 1 } = {}) {
  return `
    <button type="button" data-home-list-move="-1" data-home-list="${kind}" data-item-index="${index}" ${index === 0 ? 'disabled' : ''}>上移</button>
    <button type="button" data-home-list-move="1" data-home-list="${kind}" data-item-index="${index}" ${index === length - 1 ? 'disabled' : ''}>下移</button>
    <button type="button" data-home-list-remove="${kind}" data-item-index="${index}" ${length <= min ? 'disabled' : ''}>删除</button>`
}

function renderBasics(content) {
  const slides = content.heroSlides || []
  const banner = content.banner || {}
  const agents = content.agents?.items || []
  const solutions = content.solutions?.items || []
  const news = content.news?.items || []
  const pitch = content.pitch?.items || []

  return `
    <details class="admin-vedit-basics">
      <summary>
        <strong>基础设置</strong>
        <span>按钮链接 · 标签 · 增删排序 · 宫格样式</span>
      </summary>
      <div class="admin-vedit-basics__body">
        <div class="admin-form-grid">
          ${field('banner.ctaUrl', '推广条跳转链接', banner.ctaUrl || '', {
            wide: true,
            help: '普通路径如 /agents/；填 #demo 则打开预约演示弹窗',
          })}
          ${field('solutions.moreUrl', '方案「更多」链接', content.solutions?.moreUrl || '')}
          ${field('news.moreUrl', '新闻「更多」链接', content.news?.moreUrl || '')}
          ${slides
            .map(
              (slide, index) =>
                field(`heroSlides.${index}.actionHref`, `第 ${index + 1} 屏按钮链接`, slide.actionHref || '', {
                  wide: true,
                })
            )
            .join('')}
          ${solutions
            .map(
              (item, index) => `
              ${field(`solutions.items.${index}.linkUrl`, `方案「${item.title || index + 1}」详情链接`, item.linkUrl || '')}
              ${field(`solutions.items.${index}.tags`, `方案「${item.title || index + 1}」标签（逗号分隔）`, (item.tags || []).join('，'), {
                wide: true,
              })}`
            )
            .join('')}
          ${news
            .map(
              (item, index) =>
                field(`news.items.${index}.linkUrl`, `新闻「${item.title || index + 1}」详情链接`, item.linkUrl || '', {
                  wide: true,
                })
            )
            .join('')}
          ${agents
            .map(
              (item, index) =>
                field(`agents.items.${index}.id`, `智能体「${item.name || index + 1}」内部编号`, item.id || '', {
                  help: '一般不用改，用于切换定位',
                })
            )
            .join('')}
          ${pitch
            .map(
              (item, index) => `
              ${field(`pitch.items.${index}.href`, `宫格「${item.kicker || index + 1}」跳转链接`, item.href || '', {
                help: '普通路径；或填 #demo（也可勾选下方开关）',
              })}
              ${field(`pitch.items.${index}.variant`, `宫格「${item.kicker || index + 1}」样式`, item.variant || 'photo', {
                type: 'select',
                options: [
                  ['photo', '图片卡'],
                  ['wave', '深蓝波纹'],
                  ['mint', '绿色纯色'],
                ],
              })}
              ${field(`pitch.items.${index}.openDemo`, `宫格「${item.kicker || index + 1}」打开预约演示`, item.openDemo, {
                type: 'checkbox',
              })}`
            )
            .join('')}
        </div>

        <p class="admin-form-section__hint" style="margin-top:12px">新闻三卡也可在「内容中心 → 新闻」勾选「推送到首页」。</p>

        <div class="admin-about-lists">
          <div class="admin-about-list-block">
            <div class="admin-about-list-block__head">
              <strong>首屏轮播</strong>
              <button type="button" class="admin-add-slide" data-home-list-add="hero">+ 新增</button>
            </div>
            <div class="admin-home-list">
              ${slides
                .map(
                  (item, index) => `
                <div class="admin-home-list__row">
                  <span>第 ${index + 1} 屏：${esc(item.title || '未填写')}</span>
                  <span class="admin-slide-tools">${listTools('hero', index, slides.length, { min: 1 })}</span>
                </div>`
                )
                .join('') || '<p class="admin-form-section__hint">暂无轮播屏。</p>'}
            </div>
          </div>

          <div class="admin-about-list-block">
            <div class="admin-about-list-block__head">
              <strong>空间智能体</strong>
              <button type="button" class="admin-add-slide" data-home-list-add="agents">+ 新增</button>
            </div>
            <div class="admin-home-list">
              ${agents
                .map(
                  (item, index) => `
                <div class="admin-home-list__row">
                  <span>${esc(item.name || `智能体 ${index + 1}`)}</span>
                  <span class="admin-slide-tools">${listTools('agents', index, agents.length, { min: 1 })}</span>
                </div>`
                )
                .join('') || '<p class="admin-form-section__hint">暂无智能体。</p>'}
            </div>
          </div>

          <div class="admin-about-list-block">
            <div class="admin-about-list-block__head">
              <strong>产品与方案</strong>
              <button type="button" class="admin-add-slide" data-home-list-add="solutions">+ 新增</button>
            </div>
            <div class="admin-home-list">
              ${solutions
                .map(
                  (item, index) => `
                <div class="admin-home-list__row">
                  <span>${esc(item.title || `方案 ${index + 1}`)}</span>
                  <span class="admin-slide-tools">${listTools('solutions', index, solutions.length, { min: 1 })}</span>
                </div>`
                )
                .join('') || '<p class="admin-form-section__hint">暂无方案卡。</p>'}
            </div>
          </div>

          <div class="admin-about-list-block">
            <div class="admin-about-list-block__head">
              <strong>新闻动态</strong>
              <button type="button" class="admin-add-slide" data-home-list-add="news">+ 新增</button>
            </div>
            <div class="admin-home-list">
              ${news
                .map(
                  (item, index) => `
                <div class="admin-home-list__row">
                  <span>${esc(item.title || `新闻 ${index + 1}`)}</span>
                  <span class="admin-slide-tools">${listTools('news', index, news.length, { min: 1 })}</span>
                </div>`
                )
                .join('') || '<p class="admin-form-section__hint">暂无新闻卡。</p>'}
            </div>
          </div>

          <div class="admin-about-list-block">
            <div class="admin-about-list-block__head">
              <strong>探索宫格</strong>
              <button type="button" class="admin-add-slide" data-home-list-add="pitch">+ 新增</button>
            </div>
            <div class="admin-home-list">
              ${pitch
                .map(
                  (item, index) => `
                <div class="admin-home-list__row">
                  <span>${esc(item.kicker || item.title || `宫格 ${index + 1}`)}</span>
                  <span class="admin-slide-tools">${listTools('pitch', index, pitch.length, { min: 1 })}</span>
                </div>`
                )
                .join('') || '<p class="admin-form-section__hint">暂无宫格。</p>'}
            </div>
          </div>
        </div>
      </div>
    </details>`
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
              <em data-home-image-modal-size-value>1200×800</em>
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

export function renderHomeVisualEditor(content) {
  const editor = document.querySelector('[data-home-editor]')
  if (!editor) return
  editor.classList.add('admin-news-editor')
  editor.innerHTML = `
    <div class="admin-vedit admin-vedit--home">
      ${renderBasics(content)}
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">点文字直接改，点图片换图。链接、增删排序在上方基础设置。</p>
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
        ${renderHomePage(content, { editable: true })}
      </div>
      ${imageModalHtml()}
    </div>`
}

function normalizeLists(content) {
  content.heroSlides = packArray(content.heroSlides).map((item) => ({
    label: item?.label || '',
    title: item?.title || '',
    description: item?.description || '',
    actionLabel: item?.actionLabel || '了解更多',
    actionHref: item?.actionHref || '#upgrade',
    background: item?.background || '',
  }))
  content.banner = {
    title: content.banner?.title || '',
    subtitle: content.banner?.subtitle || '',
    ctaLabel: content.banner?.ctaLabel || '',
    ctaUrl: content.banner?.ctaUrl || '',
    imageUrl: content.banner?.imageUrl || '',
  }
  content.agents = content.agents || {}
  content.agents.items = packArray(content.agents.items).map((item, index) => ({
    id: item?.id || `agent-${index + 1}`,
    name: item?.name || '',
    sceneTitle: item?.sceneTitle || '',
    sceneCaption: item?.sceneCaption || '',
    imageUrl: item?.imageUrl || '',
  }))
  content.solutions = content.solutions || {}
  content.solutions.items = packArray(content.solutions.items).map((item) => ({
    chip: item?.chip || '',
    title: item?.title || '',
    description: item?.description || '',
    tags: Array.isArray(item?.tags)
      ? item.tags
      : String(item?.tags || '')
          .split(/[，,]/)
          .map((tag) => tag.trim())
          .filter(Boolean),
    imageUrl: item?.imageUrl || '',
    linkUrl: item?.linkUrl || '',
  }))
  content.news = content.news || {}
  content.news.items = packArray(content.news.items).map((item) => ({
    category: item?.category || '',
    title: item?.title || '',
    description: item?.description || '',
    imageUrl: item?.imageUrl || '',
    linkUrl: item?.linkUrl || '',
  }))
  content.pitch = content.pitch || {}
  content.pitch.items = packArray(content.pitch.items).map((item) => ({
    variant: item?.variant === 'wave' || item?.variant === 'mint' ? item.variant : 'photo',
    kicker: item?.kicker || '',
    title: item?.title || '',
    href: item?.href || '',
    moreLabel: item?.moreLabel || '阅读更多信息',
    imageUrl: item?.imageUrl || '',
    openDemo: Boolean(item?.openDemo),
  }))
  return content
}

function homeListRef(content, kind) {
  if (kind === 'hero') {
    content.heroSlides = content.heroSlides || []
    return content.heroSlides
  }
  if (kind === 'agents') {
    content.agents = content.agents || {}
    content.agents.items = content.agents.items || []
    return content.agents.items
  }
  if (kind === 'solutions') {
    content.solutions = content.solutions || {}
    content.solutions.items = content.solutions.items || []
    return content.solutions.items
  }
  if (kind === 'news') {
    content.news = content.news || {}
    content.news.items = content.news.items || []
    return content.news.items
  }
  content.pitch = content.pitch || {}
  content.pitch.items = content.pitch.items || []
  return content.pitch.items
}

export function collectHomeVisualContent(baseContent) {
  const content = structuredClone(baseContent || {})
  const root = document.querySelector('[data-home-editor]')
  if (!root) return normalizeLists(content)

  root.querySelectorAll('[data-home-field]').forEach((field) => {
    let value
    if (field.dataset.homeType === 'checkbox') value = field.checked
    else value = field.value.trim()
    if (field.dataset.homeField.endsWith('.tags')) {
      value = String(field.value || '')
        .split(/[，,]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    }
    setNested(content, field.dataset.homeField, value)
  })
  root.querySelectorAll('[data-edit-path]').forEach((el) => {
    setNested(content, el.dataset.editPath, readEditableText(el))
  })
  root.querySelectorAll('[data-edit-image]').forEach((el) => {
    const path = el.dataset.editImage
    if (!path) return
    const url = el.dataset.editImageUrl != null ? el.dataset.editImageUrl : el.querySelector('img')?.getAttribute('src') || ''
    setNested(content, path, url || '')
  })

  return normalizeLists(content)
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
  const target =
    canvas.querySelector(`[data-edit-image="${CSS.escape(path)}"]`) || canvas.querySelector(`[data-edit-image="${path}"]`)
  const safeUrl = String(url || '').trim()
  if (!target) return

  target.dataset.editImageUrl = safeUrl
  let img = target.querySelector('img')
  const mediaParent = target.closest('.sm-hero__media, .sm-mini-banner__media, .sm-sol-card__media, .sm-news-card__media, .sm-pitch__tile')

  if (target.matches('.hpi-edit-bg')) {
    target.textContent = safeUrl ? target.title || '更换图片' : '添加图片'
    if (mediaParent) {
      if (safeUrl) mediaParent.style.backgroundImage = `url("${safeUrl}")`
      else mediaParent.style.backgroundImage = ''
      const mediaImg = mediaParent.querySelector('img.ha-media__img')
      if (mediaImg) {
        if (safeUrl) mediaImg.src = safeUrl
        else mediaImg.remove()
      } else if (safeUrl && mediaParent.classList.contains('sm-hero__media')) {
        const next = document.createElement('img')
        next.className = 'ha-media__img'
        next.alt = ''
        next.src = safeUrl
        mediaParent.prepend(next)
      }
    }
    return
  }

  if (safeUrl) {
    target.classList.remove('hpi-edit-img--empty')
    if (!img) {
      img = document.createElement('img')
      img.alt = ''
      target.prepend(img)
    }
    img.src = safeUrl
  } else {
    if (img) img.remove()
    target.classList.add('hpi-edit-img--empty')
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
  urlInput?.focus()
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

function setHomeFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--home')
  const canvas = document.querySelector('[data-home-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-home-fullscreen', on)
  if (bar) bar.hidden = !on
}

function refreshEditorFromState() {
  const content = ctx.state?.homePage?.draftContent
  if (!content) return
  renderHomeVisualEditor(content)
}

function pushEmptyItem(kind, list) {
  if (kind === 'hero') list.push({ ...EMPTY_HERO_SLIDE })
  else if (kind === 'agents') list.push({ ...EMPTY_HOME_AGENT, id: `agent-${list.length + 1}` })
  else list.push({ ...EMPTY_HOME_LIST[kind] })
}

export function bindHomeVisualAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const form = document.querySelector('[data-home-form]')
  const editor = document.querySelector('[data-home-editor]')
  if (!form || !editor) return

  form.addEventListener('click', (event) => {
    if (event.target.closest('[data-home-fullscreen]')) {
      event.preventDefault()
      setHomeFullscreen(true)
      return
    }
    if (event.target.closest('[data-home-fullscreen-exit]')) {
      event.preventDefault()
      setHomeFullscreen(false)
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

    const imageEl = event.target.closest('[data-edit-image]')
    if (imageEl && editor.contains(imageEl)) {
      event.preventDefault()
      openImageModal(imageEl)
      return
    }

    const listAdd = event.target.closest('[data-home-list-add]')
    if (listAdd) {
      event.preventDefault()
      const kind = listAdd.dataset.homeListAdd
      const content = collectHomeVisualContent(ctx.state.homePage.draftContent)
      const list = homeListRef(content, kind)
      if (list.length >= 12) {
        ctx.toast('最多 12 条', true)
        return
      }
      pushEmptyItem(kind, list)
      ctx.state.homePage.draftContent = content
      refreshEditorFromState()
      return
    }

    const listRemove = event.target.closest('[data-home-list-remove]')
    if (listRemove) {
      event.preventDefault()
      const kind = listRemove.dataset.homeListRemove
      const index = Number(listRemove.dataset.itemIndex)
      const content = collectHomeVisualContent(ctx.state.homePage.draftContent)
      const list = homeListRef(content, kind)
      if (list.length <= 1) {
        ctx.toast('至少保留一条', true)
        return
      }
      list.splice(index, 1)
      ctx.state.homePage.draftContent = content
      refreshEditorFromState()
      return
    }

    const listMove = event.target.closest('[data-home-list-move]')
    if (listMove) {
      event.preventDefault()
      const kind = listMove.dataset.homeList
      const index = Number(listMove.dataset.itemIndex)
      const offset = Number(listMove.dataset.homeListMove)
      const content = collectHomeVisualContent(ctx.state.homePage.draftContent)
      const list = homeListRef(content, kind)
      const next = index + offset
      if (!list[index] || next < 0 || next >= list.length) return
      const [item] = list.splice(index, 1)
      list.splice(next, 0, item)
      ctx.state.homePage.draftContent = content
      refreshEditorFromState()
      return
    }

    const canvas = event.target.closest('[data-home-visual]')
    if (canvas && event.target.closest('a') && !event.target.closest('[data-edit-image]')) {
      event.preventDefault()
    }
  })

  form.addEventListener('change', (event) => {
    const variant = event.target.closest('[data-home-field]')
    if (!variant || !variant.dataset.homeField?.includes('.variant')) return
    const content = collectHomeVisualContent(ctx.state.homePage.draftContent)
    ctx.state.homePage.draftContent = content
    refreshEditorFromState()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!document.body.classList.contains('admin-home-fullscreen')) return
    setHomeFullscreen(false)
  })

  editor.addEventListener('change', async (event) => {
    const modalFile = event.target.closest('[data-home-image-modal-file]')
    if (modalFile?.files?.[0] && ctx.api) {
      const modal = document.querySelector('[data-home-image-modal]')
      modalFile.disabled = true
      try {
        const body = new FormData()
        body.append('image', modalFile.files[0])
        const result = await ctx.api('/pages/media/image', { method: 'POST', body })
        const url = result.url || ''
        const urlInput = modal.querySelector('[data-home-image-modal-url]')
        if (urlInput) urlInput.value = url
        setImageModalPreview(modal, url)
        ctx.toast('图片已上传，点确定应用')
      } catch (error) {
        ctx.toast(error.message, true)
      } finally {
        modalFile.disabled = false
        modalFile.value = ''
      }
    }
  })
}
