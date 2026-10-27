/** 后台协作在场：心跳轮询 + 顶部在线警示 + 远程光标 + 编辑冲突提示 */

const COLORS = ['#0879f9', '#0f9f6e', '#d97706', '#db2777', '#7c3aed', '#0891b2']
const HEARTBEAT_MS = 1500
const DEFAULT_ROOM = '__admin__'

function makeClientId() {
  try {
    const key = 'atuo-admin-presence-client'
    let id = sessionStorage.getItem(key)
    if (!id) {
      id = globalThis.crypto?.randomUUID?.() || `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
      sessionStorage.setItem(key, id)
    }
    return id
  } catch {
    return `c-${Date.now().toString(36)}`
  }
}

function colorFor(id = '') {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return COLORS[hash % COLORS.length]
}

export function createAdminPresence({ api } = {}) {
  const clientId = makeClientId()
  let room = ''
  let editing = false
  let cursor = null
  let peers = []
  let online = []
  let timer = 0
  let bound = false
  let canvasEl = null
  let layerEl = null
  let alertEl = null
  let warnEl = null

  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[ch]))

  const ensureUi = () => {
    const main = document.querySelector('.admin-main')
    if (!alertEl) {
      alertEl = document.createElement('div')
      alertEl.className = 'admin-presence-alert'
      alertEl.hidden = true
      alertEl.dataset.adminPresenceAlert = ''
      alertEl.setAttribute('role', 'status')
      alertEl.setAttribute('aria-live', 'polite')
      main?.prepend(alertEl)
    }
    if (!warnEl) {
      warnEl = document.createElement('div')
      warnEl.className = 'admin-presence-warn'
      warnEl.hidden = true
      warnEl.dataset.adminPresenceWarn = ''
      const top = document.querySelector('.admin-topbar')
      if (top) top.insertAdjacentElement('afterend', warnEl)
      else main?.appendChild(warnEl)
    }
  }

  const ensureLayer = () => {
    if (!room || room === DEFAULT_ROOM) {
      layerEl?.remove()
      layerEl = null
      canvasEl = null
      return null
    }
    const host = document.querySelector('.admin-panel.is-active .admin-home-editor, .admin-panel.is-active .admin-aspace-editor, .admin-panel.is-active [data-aspace-help-visual], .admin-panel.is-active .admin-vedit-canvas')
      || document.querySelector('.admin-panel.is-active .admin-card')
    if (!host) {
      layerEl?.remove()
      layerEl = null
      canvasEl = null
      return null
    }
    if (canvasEl !== host) {
      layerEl?.remove()
      canvasEl = host
      const style = getComputedStyle(host)
      if (style.position === 'static') host.style.position = 'relative'
      layerEl = document.createElement('div')
      layerEl.className = 'admin-presence-cursors'
      layerEl.dataset.adminPresenceCursors = ''
      host.appendChild(layerEl)
    }
    return layerEl
  }

  const renderAlert = () => {
    ensureUi()
    if (!alertEl) return
    if (!online.length) {
      alertEl.hidden = true
      alertEl.innerHTML = ''
      return
    }
    const names = online.map((user) => escape(user.name)).join('、')
    const editingHere = peers.filter((peer) => peer.editing)
    const editingNote = editingHere.length
      ? `；其中 ${editingHere.map((peer) => escape(peer.name)).join('、')} 正在编辑本页，请避免同时发布`
      : ''
    alertEl.hidden = false
    alertEl.innerHTML = `
      <span class="material-symbols-outlined admin-presence-alert__icon" aria-hidden="true">warning</span>
      <div class="admin-presence-alert__text">
        <strong>当前还有他人在线</strong>
        <span>${names}${editingNote}</span>
      </div>`
  }

  const renderWarn = () => {
    ensureUi()
    const editingPeers = peers.filter((peer) => peer.editing)
    if (!warnEl) return
    // 顶部红色条已覆盖在线提示；同页编辑补充条仅在有人编辑且顶部已显示时弱化重复——直接隐藏，统一用顶部红条
    warnEl.hidden = true
    warnEl.innerHTML = ''
    document.querySelectorAll('[data-simple-publish], [data-home-publish], [data-about-publish], [data-site-publish]').forEach((button) => {
      button.classList.toggle('is-presence-blocked', editingPeers.length > 0)
      if (editingPeers.length) button.title = '有人正在编辑，发布前请确认'
      else button.removeAttribute('title')
    })
  }

  const renderCursors = () => {
    const layer = ensureLayer()
    if (!layer || !canvasEl) return
    const rect = canvasEl.getBoundingClientRect()
    layer.innerHTML = peers.filter((peer) => peer.cursor).map((peer) => {
      const left = peer.cursor.x * rect.width
      const top = peer.cursor.y * rect.height
      const color = colorFor(peer.userId || peer.clientId)
      return `<div class="admin-presence-cursor" style="left:${left}px;top:${top}px;--presence-color:${color}">
        <span class="admin-presence-cursor__dot"></span>
        <span class="admin-presence-cursor__name">${escape(peer.name)}</span>
      </div>`
    }).join('')
  }

  const tick = async () => {
    if (!room || typeof api !== 'function') return
    try {
      const data = await api('/presence', {
        method: 'PUT',
        body: JSON.stringify({ clientId, room, cursor, editing }),
      })
      peers = Array.isArray(data?.peers) ? data.peers : []
      online = Array.isArray(data?.online) ? data.online : []
      renderAlert()
      renderWarn()
      renderCursors()
    } catch {
      // 心跳失败不打断编辑
    }
  }

  const onPointerMove = (event) => {
    if (!canvasEl || !room || room === DEFAULT_ROOM) return
    if (!canvasEl.contains(event.target) && event.target !== canvasEl) return
    const rect = canvasEl.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    cursor = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    }
  }

  const onActivity = () => {
    editing = true
  }

  const leave = () => {
    if (!clientId) return
    const body = JSON.stringify({ clientId })
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' })
        navigator.sendBeacon('/api/admin/presence/leave', blob)
      }
    } catch {
      // ignore
    }
    if (typeof api === 'function') {
      void api('/presence/leave', { method: 'POST', body }).catch(() => {})
    }
  }

  const bindListeners = () => {
    if (bound) return
    bound = true
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('input', onActivity, true)
    document.addEventListener('change', onActivity, true)
    window.addEventListener('beforeunload', leave)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        clearInterval(timer)
        timer = 0
        leave()
      } else if (room) {
        void tick()
        clearInterval(timer)
        timer = window.setInterval(() => { void tick() }, HEARTBEAT_MS)
      }
    })
  }

  const startHeartbeat = () => {
    bindListeners()
    clearInterval(timer)
    timer = 0
    if (!room) return
    void tick()
    timer = window.setInterval(() => { void tick() }, HEARTBEAT_MS)
  }

  const setRoom = (nextRoom) => {
    const value = String(nextRoom || '').trim() || DEFAULT_ROOM
    const sameRoom = value === room
    if (!sameRoom) {
      room = value
      editing = false
      cursor = null
      peers = []
    }
    ensureUi()
    ensureLayer()
    renderAlert()
    renderWarn()
    renderCursors()
    if (!timer || !sameRoom) startHeartbeat()
  }

  const hasOtherEditors = () => peers.some((peer) => peer.editing)

  const confirmIfPeersEditing = (actionLabel = '发布') => {
    if (!hasOtherEditors()) return true
    const names = peers.filter((peer) => peer.editing).map((peer) => peer.name).join('、')
    return window.confirm(`${names} 正在编辑此页。确定仍要${actionLabel}吗？可能导致互相覆盖。`)
  }

  return {
    clientId,
    setRoom,
    start: () => setRoom(room || DEFAULT_ROOM),
    markEditing: () => { editing = true },
    getPeers: () => peers.slice(),
    getOnline: () => online.slice(),
    hasOtherEditors,
    confirmIfPeersEditing,
    leave,
    refresh: () => { ensureLayer(); void tick() },
  }
}
