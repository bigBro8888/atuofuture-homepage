import { AGENTS_OVERVIEW } from '../data/agents-overview.js'
import { bindAgentsChannelPreview, renderAgentsChannel } from '../lib/agents-channel-render.js'

const IMAGE_SIZE_GUIDE = [
  { test: (path) => path === 'bannerUrl', label: '首屏 Banner', size: '1920×1080', tip: '横向全宽背景' },
  { test: (path) => /items\.\d+\.imageUrl/.test(path), label: '智能体场景图', size: '960×600', tip: '任务故事场景图' },
  { test: () => true, label: '图片', size: '1200×800', tip: '按前台比例裁切即可' },
]

const BASE_BY_ID = Object.fromEntries(
  AGENTS_OVERVIEW.map((agent) => [agent.id, structuredClone(agent)])
)

let ctx = { escapeHtml: (v) => String(v ?? ''), toast: () => {}, api: null, state: null }
let previewCtl = null

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

/** 把草稿写回 AGENTS_OVERVIEW，供生态图 / 任务故事同构渲染 */
function applyCmsToOverview(content) {
  const items = Array.isArray(content?.items) ? content.items : []
  for (const agent of AGENTS_OVERVIEW) {
    const base = BASE_BY_ID[agent.id]
    if (base) Object.assign(agent, structuredClone(base))
    const hit = items.find((item) => item.id === agent.id || item.group === agent.id)
    if (!hit) continue
    if (hit.title) agent.name = hit.title
    if (hit.summary) agent.blurb = hit.summary
    if (hit.imageUrl) agent.sceneImage = hit.imageUrl
  }
}

function ensureItems(content) {
  content.items = Array.isArray(content.items) ? content.items : []
  const byId = new Map(content.items.map((item) => [item.id || item.group, item]))
  content.items = Object.keys(BASE_BY_ID).map((id) => {
    const base = BASE_BY_ID[id]
    const hit = byId.get(id) || {}
    return {
      id,
      group: hit.group || id,
      title: hit.title || base.name || '',
      summary: hit.summary || base.blurb || '',
      imageUrl: hit.imageUrl || base.sceneImage || '',
    }
  })
  return content
}

function buildModel(content) {
  applyCmsToOverview(content)
  const items = Array.isArray(content.items) ? content.items : []
  const resolveItemIndex = (id) => items.findIndex((item) => item.id === id || item.group === id)
  return {
    hero: {
      title: content.title || '',
      subtitle: content.subtitle || '',
      bannerUrl: content.bannerUrl || '',
      ctaLabel: content.ctaLabel || '',
    },
    agents: AGENTS_OVERVIEW.map((agent) => ({
      id: agent.id,
      name: agent.name,
      blurb: agent.blurb,
      sceneImage: agent.sceneImage,
    })),
    resolveItemIndex,
    selectedAgent: AGENTS_OVERVIEW[0]?.id || 'space',
    selectedIndustry: 'building',
  }
}

function imageModalHtml() {
  return `
      <div class="admin-link-modal" data-agents-image-modal hidden>
        <div class="admin-link-modal__backdrop" data-agents-image-modal-close></div>
        <div class="admin-link-modal__panel" role="dialog" aria-modal="true" aria-labelledby="admin-ag-image-modal-title">
          <header>
            <h3 id="admin-ag-image-modal-title">更换图片</h3>
            <button type="button" data-agents-image-modal-close aria-label="关闭">×</button>
          </header>
          <div class="admin-link-modal__body">
            <div class="admin-image-modal__size">
              <strong data-agents-image-modal-size-label>建议尺寸</strong>
              <em data-agents-image-modal-size-value>1200×800</em>
              <span data-agents-image-modal-size-tip>上传前请按建议尺寸准备素材</span>
            </div>
            <div class="admin-image-modal__preview">
              <img data-agents-image-modal-preview src="" alt="" hidden />
              <span data-agents-image-modal-empty>暂无预览</span>
            </div>
            <label class="admin-news-field is-wide">
              <span>图片链接</span>
              <input type="text" data-agents-image-modal-url placeholder="/images/... 或 https://..." />
            </label>
            <div class="admin-image-modal__or">或</div>
            <label class="admin-image-modal__upload">
              上传本地图片
              <input type="file" accept="image/jpeg,image/png,image/webp" data-agents-image-modal-file />
            </label>
          </div>
          <footer>
            <button type="button" data-agents-image-modal-close>取消</button>
            <button type="button" class="admin-link-modal__ok" data-agents-image-modal-save>确定</button>
          </footer>
        </div>
      </div>`
}

function mountPreview() {
  previewCtl?.destroy?.()
  const canvas = document.querySelector('[data-agents-visual]')
  const channel = canvas?.querySelector('[data-ag-channel]')
  if (!channel) {
    previewCtl = null
    return
  }
  previewCtl = bindAgentsChannelPreview(channel)
}

export function renderAgentsVisualEditor(content) {
  const editor = document.querySelector('[data-simple-editor]')
  if (!editor) return
  editor.classList.add('admin-news-editor')
  const safe = ensureItems(structuredClone(content || { items: [] }))
  const model = buildModel(safe)
  editor.innerHTML = `
    <div class="admin-vedit admin-vedit--agents">
      <details class="admin-vedit-basics">
        <summary>
          <strong>编辑说明</strong>
          <span>预览与前台同结构；首屏与底部卡片可点改，详情正文在内容中心</span>
        </summary>
        <div class="admin-vedit-basics__body">
          <p class="admin-form-section__hint">上方预览与线上一致：首屏、生态图、任务故事、行业组合、底部 CTA。可改首屏文案/Banner，以及页底「八大智能体」名称、简介、场景图。生态图点选、任务故事切换可在预览里试用。</p>
        </div>
      </details>
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">点首屏文字/Banner 直接改；八大智能体字段在预览底部。详情页请到「内容中心 → 空间智能体」。</p>
        <button type="button" class="admin-vedit-fullscreen-btn" data-agents-fullscreen>
          <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
          全屏编辑
        </button>
      </div>
      <div class="admin-vedit-canvas" data-agents-visual>
        <div class="admin-vedit-fullscreen-bar" hidden>
          <strong>空间智能体 · 全屏编辑</strong>
          <button type="button" data-agents-fullscreen-exit>
            <span class="material-symbols-outlined" aria-hidden="true">fullscreen_exit</span>
            退出全屏
          </button>
        </div>
        ${renderAgentsChannel(model, { editable: true })}
      </div>
      ${imageModalHtml()}
    </div>`
  mountPreview()
}

export function collectAgentsVisualContent(baseContent) {
  const content = ensureItems(structuredClone(baseContent || { items: [] }))
  const root = document.querySelector('[data-simple-editor]')
  if (!root) return content
  root.querySelectorAll('[data-edit-path]').forEach((el) => {
    setNested(content, el.dataset.editPath, readEditableText(el))
  })
  root.querySelectorAll('[data-edit-image]').forEach((el) => {
    const path = el.dataset.editImage
    if (!path) return
    const url = el.dataset.editImageUrl != null ? el.dataset.editImageUrl : el.querySelector('img')?.getAttribute('src') || ''
    setNested(content, path, url || '')
  })
  content.items = (content.items || []).filter(Boolean).map((item) => ({
    id: item.id || '',
    group: item.group || item.id || '',
    title: item.title || '',
    summary: item.summary || '',
    imageUrl: item.imageUrl || '',
  }))
  return content
}

function currentImageUrl(imageEl) {
  if (!imageEl) return ''
  if (imageEl.dataset.editImageUrl) return imageEl.dataset.editImageUrl
  return imageEl.querySelector('img')?.getAttribute('src') || ''
}

function setImageModalPreview(modal, url) {
  const preview = modal.querySelector('[data-agents-image-modal-preview]')
  const empty = modal.querySelector('[data-agents-image-modal-empty]')
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
  const canvas = document.querySelector('[data-agents-visual]')
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
        target.textContent = '更换 Banner'
        const heroImg = canvas.querySelector('.ag-hero__bg img')
        if (heroImg) heroImg.src = safeUrl
      }
    } else if (target.matches('.hpi-edit-bg')) {
      target.textContent = '添加 Banner'
    }
  }
  if (path === 'bannerUrl') {
    const heroImg = canvas.querySelector('.ag-hero__bg img')
    if (heroImg && safeUrl) heroImg.src = safeUrl
  }
  const itemMatch = /^items\.(\d+)\.imageUrl$/.exec(path)
  if (itemMatch) {
    const index = Number(itemMatch[1])
    const content = ctx.state?.simplePage?.draftContent
    const agentId = content?.items?.[index]?.id
    if (agentId) {
      const agent = AGENTS_OVERVIEW.find((row) => row.id === agentId)
      if (agent && safeUrl) agent.sceneImage = safeUrl
      if (previewCtl?.selectedAgent === agentId) {
        const scene = canvas.querySelector('[data-ag-scene-img]')
        if (scene && safeUrl) scene.src = safeUrl
      }
    }
  }
}

function openImageModal(imageEl) {
  const modal = document.querySelector('[data-agents-image-modal]')
  if (!modal || !imageEl) return
  modal.hidden = false
  modal._targetPath = imageEl.dataset.editImage || ''
  const guide = resolveImageSizeGuide(modal._targetPath)
  modal.querySelector('#admin-ag-image-modal-title').textContent = `更换图片 · ${guide.label}`
  modal.querySelector('[data-agents-image-modal-size-label]').textContent = `${guide.label} · 建议尺寸`
  modal.querySelector('[data-agents-image-modal-size-value]').textContent = guide.size
  modal.querySelector('[data-agents-image-modal-size-tip]').textContent = guide.tip
  const url = currentImageUrl(imageEl)
  const urlInput = modal.querySelector('[data-agents-image-modal-url]')
  if (urlInput) urlInput.value = url
  setImageModalPreview(modal, url)
}

function closeImageModal() {
  const modal = document.querySelector('[data-agents-image-modal]')
  if (!modal) return
  modal.hidden = true
  modal._targetPath = ''
}

function saveImageModal() {
  const modal = document.querySelector('[data-agents-image-modal]')
  if (!modal?._targetPath) return
  const url = modal.querySelector('[data-agents-image-modal-url]')?.value.trim() || ''
  applyVisualImage(modal._targetPath, url)
  closeImageModal()
  ctx.toast(url ? '图片已更新' : '已清除图片')
}

function setFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--agents')
  const canvas = document.querySelector('[data-agents-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-agents-fullscreen', on)
  if (bar) bar.hidden = !on
  requestAnimationFrame(() => {
    const channel = canvas.querySelector('[data-ag-channel]')
    if (channel) {
      import('../components/agents/ecosystem-map.js').then(({ layoutAgentOrbitLinks }) => {
        layoutAgentOrbitLinks(channel)
      })
    }
  })
}

export function bindAgentsVisualAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const editor = document.querySelector('[data-simple-editor]')
  if (!editor) return

  editor.addEventListener('click', async (event) => {
    if (ctx.state?.simpleKey !== 'agents') return
    if (event.target.closest('[data-agents-fullscreen]')) {
      event.preventDefault()
      setFullscreen(true)
      return
    }
    if (event.target.closest('[data-agents-fullscreen-exit]')) {
      event.preventDefault()
      setFullscreen(false)
      return
    }
    if (event.target.closest('[data-agents-image-modal-close]')) {
      event.preventDefault()
      closeImageModal()
      return
    }
    if (event.target.closest('[data-agents-image-modal-save]')) {
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
    // 允许生态图 / 任务故事 / 行业切换；拦截其它跳转
    if (
      event.target.closest('[data-ag-select], [data-ag-industry], [data-ag-jump-story], [data-edit-path], [data-edit-image]')
    ) {
      return
    }
    if (event.target.closest('[data-agents-visual] a, [data-agents-visual] button')) {
      event.preventDefault()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!document.body.classList.contains('admin-agents-fullscreen')) return
    setFullscreen(false)
  })

  editor.addEventListener('change', async (event) => {
    if (ctx.state?.simpleKey !== 'agents') return
    const fileInput = event.target.closest('[data-agents-image-modal-file]')
    if (!fileInput?.files?.[0] || !ctx.api) return
    const modal = document.querySelector('[data-agents-image-modal]')
    fileInput.disabled = true
    try {
      const body = new FormData()
      body.append('image', fileInput.files[0])
      const result = await ctx.api('/pages/media/image', { method: 'POST', body })
      const url = result.url || ''
      const urlInput = modal.querySelector('[data-agents-image-modal-url]')
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
}
