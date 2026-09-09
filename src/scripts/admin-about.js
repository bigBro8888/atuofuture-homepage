import { renderAboutPage } from '../lib/about-page-render.js'

const IMAGE_SIZE_GUIDE = [
  { test: (path) => path === 'hero.imageUrl', label: '首屏大图', size: '1200×900', tip: '右侧铺满图' },
  { test: (path) => path === 'story.imageUrl', label: '公司介绍配图', size: '1200×900', tip: '左侧大图' },
  { test: (path) => /partners\.items\.\d+\.logoUrl/.test(path), label: '客户 Logo', size: '240×96', tip: '透明底 PNG' },
  { test: (path) => /join\.slides\.\d+\.imageUrl/.test(path), label: '加入我们轮播图', size: '960×720', tip: '左侧轮播' },
  { test: () => true, label: '图片', size: '1200×800', tip: '按前台比例裁切即可' },
]

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
  const control = `<input data-about-field="${esc(path)}" type="text" value="${esc(value || '')}" />`
  const file = options.file
    ? `<div class="admin-home-media">
        <a class="admin-about-file" data-about-file-for="${esc(path)}" href="${esc(value || '#')}" target="_blank" rel="noopener"${value ? '' : ' hidden'}>查看已上传文件</a>
        <label class="admin-home-upload">上传 PDF / Word<input type="file" accept=".pdf,.doc,.docx,application/pdf" data-about-file-upload-for="${esc(path)}" /></label>
      </div>`
    : ''
  return `<label class="${options.wide ? 'admin-form-wide' : ''}"><span>${label}</span>${control}${file}</label>`
}

function listTools(kind, index, length, { min = 0 } = {}) {
  return `
    <button type="button" data-about-list-move="-1" data-about-list="${kind}" data-item-index="${index}" ${index === 0 ? 'disabled' : ''}>上移</button>
    <button type="button" data-about-list-move="1" data-about-list="${kind}" data-item-index="${index}" ${index === length - 1 ? 'disabled' : ''}>下移</button>
    <button type="button" data-about-list-remove="${kind}" data-item-index="${index}" ${length <= min ? 'disabled' : ''}>删除</button>`
}

function renderBasics(content) {
  const hero = content.hero || {}
  const join = content.join || {}
  const contact = content.contact || {}
  const partners = content.partners?.items || []
  const slides = join.slides || []
  const points = join.items || []
  const jobs = join.jobs || []

  return `
    <details class="admin-vedit-basics">
      <summary>
        <strong>基础设置</strong>
        <span>按钮链接 · Logo / 轮播 / 职位增删 · 招聘文件</span>
      </summary>
      <div class="admin-vedit-basics__body">
        <div class="admin-form-grid">
          ${field('hero.primaryHref', '首屏主按钮链接', hero.primaryHref || '#contact')}
          ${field('hero.secondaryHref', '首屏次按钮链接', hero.secondaryHref || '#story')}
          ${field('join.ctaHref', '投递简历链接', join.ctaHref || '')}
          ${field('join.briefUrl', '招聘需求文件链接', join.briefUrl || '', { file: true, wide: true })}
          ${field('contact.phone', '电话拨号号码', contact.phone || '', { wide: true })}
          ${jobs
            .map(
              (job, index) =>
                field(`join.jobs.${index}.applyHref`, `职位「${job.title || index + 1}」投递链接`, job.applyHref || '', {
                  wide: true,
                })
            )
            .join('')}
        </div>

        <div class="admin-about-lists">
          <div class="admin-about-list-block">
            <div class="admin-about-list-block__head">
              <strong>客户 Logo</strong>
              <button type="button" class="admin-add-slide" data-about-partner-add>+ 新增</button>
            </div>
            <div class="admin-home-list">
              ${partners
                .map(
                  (item, index) => `
                <div class="admin-home-list__row">
                  <span>${esc(item.name || `客户 ${index + 1}`)}</span>
                  <span class="admin-slide-tools">${listTools('partners', index, partners.length, { min: 4 })}</span>
                </div>`
                )
                .join('') || '<p class="admin-form-section__hint">暂无客户。</p>'}
            </div>
          </div>

          <div class="admin-about-list-block">
            <div class="admin-about-list-block__head">
              <strong>加入我们 · 轮播图</strong>
              <button type="button" class="admin-add-slide" data-about-list-add="joinSlides">+ 新增</button>
            </div>
            <div class="admin-home-list">
              ${slides
                .map(
                  (item, index) => `
                <div class="admin-home-list__row">
                  <span>${esc(item.caption || `轮播 ${index + 1}`)}</span>
                  <span class="admin-slide-tools">${listTools('joinSlides', index, slides.length, { min: 1 })}</span>
                </div>`
                )
                .join('') || '<p class="admin-form-section__hint">暂无轮播图。</p>'}
            </div>
          </div>

          <div class="admin-about-list-block">
            <div class="admin-about-list-block__head">
              <strong>招揽要点</strong>
              <button type="button" class="admin-add-slide" data-about-list-add="join">+ 新增</button>
            </div>
            <div class="admin-home-list">
              ${points
                .map(
                  (item, index) => `
                <div class="admin-home-list__row">
                  <span>${esc(item.title || `要点 ${index + 1}`)}</span>
                  <span class="admin-slide-tools">${listTools('join', index, points.length, { min: 3 })}</span>
                </div>`
                )
                .join('') || '<p class="admin-form-section__hint">暂无要点。</p>'}
            </div>
          </div>

          <div class="admin-about-list-block">
            <div class="admin-about-list-block__head">
              <strong>在招职位</strong>
              <button type="button" class="admin-add-slide" data-about-list-add="joinJobs">+ 新增</button>
            </div>
            <div class="admin-home-list">
              ${jobs
                .map(
                  (item, index) => `
                <div class="admin-home-list__row">
                  <span>${esc(item.title || `职位 ${index + 1}`)}</span>
                  <span class="admin-slide-tools">${listTools('joinJobs', index, jobs.length, { min: 0 })}</span>
                </div>`
                )
                .join('') || '<p class="admin-form-section__hint">暂无职位。</p>'}
            </div>
          </div>
        </div>
      </div>
    </details>`
}

function imageModalHtml() {
  return `
      <div class="admin-link-modal" data-about-image-modal hidden>
        <div class="admin-link-modal__backdrop" data-about-image-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-about-image-modal-title">
          <header>
            <h3 id="admin-about-image-modal-title">更换图片</h3>
            <button type="button" data-about-image-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <div class="admin-image-modal__size">
              <strong data-about-image-modal-size-label>建议尺寸</strong>
              <em data-about-image-modal-size-value>1200×800</em>
              <span data-about-image-modal-size-tip>上传前请按建议尺寸准备素材</span>
            </div>
            <div class="admin-image-modal__preview">
              <img data-about-image-modal-preview src="" alt="" hidden />
              <span data-about-image-modal-empty>暂无预览</span>
            </div>
            <label class="admin-news-field is-wide">
              <span>图片链接</span>
              <input type="text" data-about-image-modal-url placeholder="/images/... 或 https://..." />
            </label>
            <div class="admin-image-modal__or">或</div>
            <label class="admin-image-modal__upload">
              上传本地图片
              <input type="file" accept="image/jpeg,image/png,image/webp" data-about-image-modal-file />
            </label>
          </div>
          <footer>
            <button type="button" data-about-image-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-about-image-modal-save>确定</button>
          </footer>
        </div>
      </div>`
}

export function renderAboutVisualEditor(content) {
  const editor = document.querySelector('[data-about-editor]')
  if (!editor) return
  editor.classList.add('admin-news-editor')
  editor.innerHTML = `
    <div class="admin-vedit admin-vedit--about">
      ${renderBasics(content)}
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">点文字直接改，点图片换图。链接、增删 Logo / 职位等在上方基础设置。</p>
        <button type="button" class="admin-vedit-fullscreen-btn" data-about-fullscreen>
          <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
          全屏编辑
        </button>
      </div>
      <div class="admin-vedit-canvas" data-about-visual>
        <div class="admin-vedit-fullscreen-bar" hidden>
          <strong>关于我们 · 全屏编辑</strong>
          <button type="button" data-about-fullscreen-exit>
            <span class="material-symbols-outlined" aria-hidden="true">fullscreen_exit</span>
            退出全屏
          </button>
        </div>
        ${renderAboutPage(content, { editable: true })}
      </div>
      ${imageModalHtml()}
    </div>`
}

function normalizeLists(content) {
  content.partners = content.partners || {}
  content.partners.items = packArray(content.partners.items).map((item) => ({
    name: item?.name || '',
    logoUrl: item?.logoUrl || '',
  }))
  content.values = content.values || {}
  content.values.items = packArray(content.values.items)
  while (content.values.items.length < 3) content.values.items.push({ title: '', body: '', icon: '', imageUrl: '' })
  content.values.items = content.values.items.slice(0, 3).map((item) => ({
    icon: item?.icon || '',
    title: item?.title || '',
    body: item?.body || '',
    imageUrl: item?.imageUrl || '',
  }))
  content.join = content.join || {}
  content.join.slides = packArray(content.join.slides).map((item) => ({
    imageUrl: item?.imageUrl || '',
    caption: item?.caption || '',
  }))
  content.join.items = packArray(content.join.items).map((item, index) => ({
    step: item?.step || String(index + 1).padStart(2, '0'),
    title: item?.title || '',
    body: item?.body || '',
  }))
  content.join.jobs = packArray(content.join.jobs).map((item) => ({
    title: item?.title || '',
    dept: item?.dept || '',
    location: item?.location || '',
    type: item?.type || '',
    summary: item?.summary || '',
    applyHref: item?.applyHref || '',
  }))
  return content
}

export function collectAboutVisualContent(baseContent) {
  const content = structuredClone(baseContent || {})
  const root = document.querySelector('[data-about-editor]')
  if (!root) return normalizeLists(content)

  root.querySelectorAll('[data-about-field]').forEach((field) => {
    setNested(content, field.dataset.aboutField, field.value.trim())
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

  delete content.duties
  if (content.contact) {
    delete content.contact.joinLabel
    delete content.contact.joinHref
    if (content.contact.phoneDisplay && !content.contact.phone) {
      content.contact.phone = String(content.contact.phoneDisplay).replace(/[^\d+]/g, '')
    }
  }
  return normalizeLists(content)
}

export function aboutListRef(content, kind) {
  if (kind === 'joinSlides') {
    content.join = content.join || {}
    content.join.slides = content.join.slides || []
    return content.join.slides
  }
  if (kind === 'joinJobs') {
    content.join = content.join || {}
    content.join.jobs = content.join.jobs || []
    return content.join.jobs
  }
  if (kind === 'join') {
    content.join = content.join || {}
    content.join.items = content.join.items || []
    return content.join.items
  }
  if (kind === 'partners') {
    content.partners = content.partners || {}
    content.partners.items = content.partners.items || []
    return content.partners.items
  }
  content[kind] = content[kind] || {}
  content[kind].items = content[kind].items || []
  return content[kind].items
}

function currentImageUrl(imageEl) {
  if (!imageEl) return ''
  if (imageEl.dataset.editImageUrl) return imageEl.dataset.editImageUrl
  return imageEl.querySelector('img')?.getAttribute('src') || ''
}

function setImageModalPreview(modal, url) {
  const preview = modal.querySelector('[data-about-image-modal-preview]')
  const empty = modal.querySelector('[data-about-image-modal-empty]')
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
  const canvas = document.querySelector('[data-about-visual]')
  if (!canvas || !path) return
  const target = canvas.querySelector(`[data-edit-image="${CSS.escape(path)}"]`) || canvas.querySelector(`[data-edit-image="${path}"]`)
  const safeUrl = String(url || '').trim()
  if (target) {
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
      if (target.matches('.hpi-edit-bg')) {
        target.textContent = path === 'hero.imageUrl' ? '更换首屏大图' : '更换图片'
        const visual = canvas.querySelector('.ab-hero__visual')
        if (visual) visual.style.backgroundImage = `url("${safeUrl}")`
      }
    } else {
      if (img) img.remove()
      target.classList.add('hpi-edit-img--empty')
      if (target.matches('.hpi-edit-bg')) target.textContent = '添加首屏大图'
    }
  }
  if (path === 'hero.imageUrl') {
    const visual = canvas.querySelector('.ab-hero__visual')
    if (visual && safeUrl) visual.style.backgroundImage = `url("${safeUrl}")`
  }
}

function openImageModal(imageEl) {
  const modal = document.querySelector('[data-about-image-modal]')
  if (!modal || !imageEl) return
  modal.hidden = false
  modal._targetPath = imageEl.dataset.editImage || ''
  const guide = resolveImageSizeGuide(modal._targetPath)
  const title = modal.querySelector('#admin-about-image-modal-title')
  if (title) title.textContent = `更换图片 · ${guide.label}`
  modal.querySelector('[data-about-image-modal-size-label]').textContent = `${guide.label} · 建议尺寸`
  modal.querySelector('[data-about-image-modal-size-value]').textContent = guide.size
  modal.querySelector('[data-about-image-modal-size-tip]').textContent = guide.tip
  const url = currentImageUrl(imageEl)
  const urlInput = modal.querySelector('[data-about-image-modal-url]')
  if (urlInput) urlInput.value = url
  setImageModalPreview(modal, url)
  urlInput?.focus()
}

function closeImageModal() {
  const modal = document.querySelector('[data-about-image-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetPath = ''
  const fileInput = modal.querySelector('[data-about-image-modal-file]')
  if (fileInput) fileInput.value = ''
}

function saveImageModal() {
  const modal = document.querySelector('[data-about-image-modal]')
  if (!modal?._targetPath) return
  const url = modal.querySelector('[data-about-image-modal-url]')?.value.trim() || ''
  applyVisualImage(modal._targetPath, url)
  closeImageModal()
  ctx.toast(url ? '图片已更新' : '已清除图片')
}

function setAboutFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--about')
  const canvas = document.querySelector('[data-about-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-about-fullscreen', on)
  if (bar) bar.hidden = !on
}

function refreshEditorFromState() {
  const content = ctx.state?.aboutPage?.draftContent
  if (!content) return
  renderAboutVisualEditor(content)
}

export function bindAboutVisualAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const form = document.querySelector('[data-about-form]')
  const editor = document.querySelector('[data-about-editor]')
  if (!form || !editor) return

  form.addEventListener('click', (event) => {
    if (event.target.closest('[data-about-fullscreen]')) {
      event.preventDefault()
      setAboutFullscreen(true)
      return
    }
    if (event.target.closest('[data-about-fullscreen-exit]')) {
      event.preventDefault()
      setAboutFullscreen(false)
      return
    }
    if (event.target.closest('[data-about-image-modal-close]')) {
      event.preventDefault()
      closeImageModal()
      return
    }
    if (event.target.closest('[data-about-image-modal-save]')) {
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

    const partnerAdd = event.target.closest('[data-about-partner-add]')
    if (partnerAdd) {
      event.preventDefault()
      const content = collectAboutVisualContent(ctx.state.aboutPage.draftContent)
      content.partners.items = content.partners.items || []
      if (content.partners.items.length >= 16) {
        ctx.toast('最多 16 个客户 Logo', true)
        return
      }
      content.partners.items.push({ name: '新客户', logoUrl: '' })
      ctx.state.aboutPage.draftContent = content
      refreshEditorFromState()
      return
    }

    const listAdd = event.target.closest('[data-about-list-add]')
    if (listAdd) {
      event.preventDefault()
      const kind = listAdd.dataset.aboutListAdd
      const content = collectAboutVisualContent(ctx.state.aboutPage.draftContent)
      const list = aboutListRef(content, kind)
      const limits = { joinSlides: 8, join: 8, joinJobs: 24 }
      const max = limits[kind] || 8
      if (list.length >= max) {
        const messages = { joinSlides: '最多 8 张轮播图', join: '最多 8 条招揽要点', joinJobs: '最多 24 个职位' }
        ctx.toast(messages[kind] || '数量已满', true)
        return
      }
      if (kind === 'joinSlides') list.push({ imageUrl: '', caption: '' })
      else if (kind === 'joinJobs') {
        list.push({
          title: '新职位',
          dept: '研发',
          location: '杭州',
          type: '社招',
          summary: '',
          applyHref: 'mailto:service@atuofuture.com',
        })
      } else list.push({ step: String(list.length + 1).padStart(2, '0'), title: '新要点', body: '' })
      ctx.state.aboutPage.draftContent = content
      refreshEditorFromState()
      return
    }

    const listRemove = event.target.closest('[data-about-list-remove]')
    if (listRemove) {
      event.preventDefault()
      const kind = listRemove.dataset.aboutListRemove
      const index = Number(listRemove.dataset.itemIndex)
      const content = collectAboutVisualContent(ctx.state.aboutPage.draftContent)
      const list = aboutListRef(content, kind)
      const min = kind === 'partners' ? 4 : kind === 'joinSlides' ? 1 : kind === 'join' ? 3 : 0
      if (list.length <= min) return
      list.splice(index, 1)
      ctx.state.aboutPage.draftContent = content
      refreshEditorFromState()
      return
    }

    const listMove = event.target.closest('[data-about-list-move]')
    if (listMove) {
      event.preventDefault()
      const kind = listMove.dataset.aboutList
      const index = Number(listMove.dataset.itemIndex)
      const offset = Number(listMove.dataset.aboutListMove)
      const content = collectAboutVisualContent(ctx.state.aboutPage.draftContent)
      const list = aboutListRef(content, kind)
      const next = index + offset
      if (!list[index] || next < 0 || next >= list.length) return
      const [item] = list.splice(index, 1)
      list.splice(next, 0, item)
      ctx.state.aboutPage.draftContent = content
      refreshEditorFromState()
      return
    }

    const canvas = event.target.closest('[data-about-visual]')
    if (canvas && event.target.closest('a') && !event.target.closest('[data-edit-image]')) {
      event.preventDefault()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!document.body.classList.contains('admin-about-fullscreen')) return
    setAboutFullscreen(false)
  })

  editor.addEventListener('change', async (event) => {
    const fileUpload = event.target.closest('[data-about-file-upload-for]')
    if (fileUpload) {
      const file = fileUpload.files?.[0]
      if (!file || !ctx.api) return
      const path = fileUpload.dataset.aboutFileUploadFor
      fileUpload.disabled = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        const { url } = await ctx.api('/pages/media/file', { method: 'POST', body: formData })
        const field = editor.querySelector(`[data-about-field="${path}"]`)
        if (field) {
          field.value = url
          const link = editor.querySelector(`[data-about-file-for="${path}"]`)
          if (link) {
            link.href = url
            link.hidden = false
          }
        }
        ctx.toast('招聘文件已上传，请继续保存草稿')
      } catch (error) {
        ctx.toast(error.message, true)
      } finally {
        fileUpload.disabled = false
        fileUpload.value = ''
      }
      return
    }

    const modalFile = event.target.closest('[data-about-image-modal-file]')
    if (modalFile?.files?.[0] && ctx.api) {
      const modal = document.querySelector('[data-about-image-modal]')
      modalFile.disabled = true
      try {
        const body = new FormData()
        body.append('image', modalFile.files[0])
        const result = await ctx.api('/pages/media/image', { method: 'POST', body })
        const url = result.url || ''
        const urlInput = modal.querySelector('[data-about-image-modal-url]')
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
