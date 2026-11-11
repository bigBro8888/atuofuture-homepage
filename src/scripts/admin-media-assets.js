let ctx = {
  api: null,
  toast: () => {},
  escapeHtml: (value) => String(value ?? ''),
  dateTime: () => '--',
}

let items = []
let uploading = false

function esc(value) {
  return ctx.escapeHtml(value)
}

function formatSize(bytes) {
  const n = Number(bytes) || 0
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function absoluteUrl(url) {
  const text = String(url || '').trim()
  if (!text) return ''
  if (/^https?:\/\//i.test(text)) return text
  if (text.startsWith('//')) return `${window.location.protocol}${text}`
  return `${window.location.origin}${text.startsWith('/') ? text : `/${text}`}`
}

function kindLabel(kind) {
  if (kind === 'audio') return '音频'
  if (kind === 'image') return '图片'
  return '视频'
}

function renderList() {
  const host = document.querySelector('[data-assets-list]')
  const empty = document.querySelector('[data-assets-empty]')
  if (!host) return
  if (!items.length) {
    host.innerHTML = ''
    if (empty) empty.hidden = false
    return
  }
  if (empty) empty.hidden = true
  host.innerHTML = items.map((item) => {
    const link = absoluteUrl(item.url)
    return `<div class="admin-item-row admin-asset-row" data-asset-id="${esc(item.id)}">
      <div class="admin-asset-row__main">
        <strong>${esc(item.name)}</strong>
        <small>${kindLabel(item.kind)} · ${esc(item.mimeType || '--')} · ${formatSize(item.size)} · ${ctx.dateTime(item.createdAt)}</small>
        <code class="admin-asset-row__url" title="${esc(link)}">${esc(link)}</code>
      </div>
      <div class="admin-item-row__actions">
        <button type="button" data-asset-copy="${esc(item.id)}">复制链接</button>
        <button type="button" data-asset-rename="${esc(item.id)}">重命名</button>
        <button type="button" data-asset-delete="${esc(item.id)}">删除</button>
      </div>
    </div>`
  }).join('')
}

export async function loadMediaAssets() {
  const status = document.querySelector('[data-assets-status]')
  if (status) status.textContent = '加载中…'
  try {
    const payload = await ctx.api('/pages/media-assets')
    items = Array.isArray(payload?.items) ? payload.items : []
    renderList()
    if (status) status.textContent = `共 ${items.length} 个素材`
  } catch (error) {
    if (status) status.textContent = '加载失败'
    ctx.toast(error.message || '素材列表加载失败', true)
  }
}

async function uploadFiles(fileList) {
  const files = [...(fileList || [])]
  if (!files.length || uploading) return
  uploading = true
  const progress = document.querySelector('[data-assets-progress]')
  if (progress) {
    progress.hidden = false
    progress.textContent = `正在上传 0/${files.length}…`
  }
  let ok = 0
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]
    if (progress) progress.textContent = `正在上传 ${index + 1}/${files.length}：${file.name}`
    const body = new FormData()
    body.append('file', file)
    body.append('name', file.name.replace(/\.[^.]+$/, ''))
    try {
      await ctx.api('/pages/media-assets', { method: 'POST', body })
      ok += 1
    } catch (error) {
      ctx.toast(`${file.name} 上传失败：${error.message || '未知错误'}`, true)
    }
  }
  uploading = false
  if (progress) {
    progress.textContent = ok ? `已上传 ${ok} 个文件` : ''
    if (ok) window.setTimeout(() => { if (progress) progress.hidden = true }, 1600)
    else progress.hidden = true
  }
  await loadMediaAssets()
  if (ok) ctx.toast(`成功上传 ${ok} 个素材`)
}

async function copyLink(id) {
  const item = items.find((row) => row.id === id)
  if (!item) return
  const link = absoluteUrl(item.url)
  try {
    await navigator.clipboard.writeText(link)
    ctx.toast('链接已复制')
  } catch {
    window.prompt('复制下面的链接', link)
  }
}

async function renameAsset(id) {
  const item = items.find((row) => row.id === id)
  if (!item) return
  const next = window.prompt('素材名称', item.name)
  if (next == null) return
  const name = String(next).trim()
  if (!name) {
    ctx.toast('名称不能为空', true)
    return
  }
  try {
    await ctx.api(`/pages/media-assets/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })
    ctx.toast('已重命名')
    await loadMediaAssets()
  } catch (error) {
    ctx.toast(error.message || '重命名失败', true)
  }
}

async function removeAsset(id) {
  const item = items.find((row) => row.id === id)
  if (!item) return
  if (!window.confirm(`确定删除「${item.name}」？删除后链接可能失效。`)) return
  try {
    await ctx.api(`/pages/media-assets/${encodeURIComponent(id)}`, { method: 'DELETE' })
    ctx.toast('已删除')
    await loadMediaAssets()
  } catch (error) {
    ctx.toast(error.message || '删除失败', true)
  }
}

export function bindMediaAssetsAdmin(helpers) {
  ctx = { ...ctx, ...helpers }
  const pane = document.querySelector('[data-content-pane="assets"]')
  if (!pane || pane.dataset.bound === '1') return
  pane.dataset.bound = '1'

  pane.querySelector('[data-assets-upload]')?.addEventListener('change', async (event) => {
    const input = event.target
    await uploadFiles(input.files)
    input.value = ''
  })

  pane.querySelector('[data-assets-refresh]')?.addEventListener('click', () => {
    loadMediaAssets().catch(() => {})
  })

  pane.addEventListener('click', (event) => {
    const copy = event.target.closest('[data-asset-copy]')
    if (copy) {
      event.preventDefault()
      copyLink(copy.getAttribute('data-asset-copy'))
      return
    }
    const rename = event.target.closest('[data-asset-rename]')
    if (rename) {
      event.preventDefault()
      renameAsset(rename.getAttribute('data-asset-rename'))
      return
    }
    const remove = event.target.closest('[data-asset-delete]')
    if (remove) {
      event.preventDefault()
      removeAsset(remove.getAttribute('data-asset-delete'))
    }
  })
}
