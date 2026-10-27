/** 后台协作在场：心跳轮询 + 顶部在线警示 + 区块焦点高亮 + 远程光标 */

const COLORS = ['#0879f9', '#0f9f6e', '#d97706', '#db2777', '#7c3aed', '#0891b2']
const HEARTBEAT_MS = 1500
const DEFAULT_ROOM = '__admin__'
const FOCUS_SELECTORS = [
  (id) => `[data-home-goto="${CSS.escape(id)}"]`,
  (id) => `[data-about-goto="${CSS.escape(id)}"]`,
  (id) => `[data-simple-goto="${CSS.escape(id)}"]`,
  (id) => `[data-aspace-home-section="${CSS.escape(id)}"]`,
  (id) => `[data-aspace-help-section="${CSS.escape(id)}"]`,
  (id) => `[data-aspace-tab="${CSS.escape(id)}"]`,
  (id) => `[data-config-goto="${CSS.escape(id)}"]`,
]

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

function findFocusTarget(focusId) {
  if (!focusId) return null
  for (const build of FOCUS_SELECTORS) {
    try {
      const el = document.querySelector(`.admin-panel.is-active ${build(focusId)}`)
      if (el) return el
    } catch {
      // ignore invalid selectors
    }
  }
  return null
}

export function createAdminPresence({ api } = {}) {
  const clientId = makeClientId()
  let room = ''
  let focus = ''
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
  const taggedEls = new Set()

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

  const clearFocusTags = () => {
    taggedEls.forEach((el) => {
      el.classList.remove('is-remote-focus')
      el.querySelectorAll('[data-admin-presence-focus-tag]').forEach((tag) => tag.remove())
    })
    taggedEls.clear()
  }

  const renderFocus = () => {
    clearFocusTags()
    if (!room || room === DEFAULT_ROOM) return

    const byFocus = new Map()
    peers.forEach((peer) => {
      if (!peer.focus) return
      const list = byFocus.get(peer.focus) || []
      list.push(peer)
      byFocus.set(peer.focus, list)
    })

    byFocus.forEach((group, focusId) => {
      const target = findFocusTarget(focusId)
      if (!target) return
      const style = getComputedStyle(target)
      if (style.position === 'static') target.style.position = 'relative'
      target.classList.add('is-remote-focus')
      const names = group.map((peer) => peer.name).join('、')
      const color = colorFor(group[0].userId || group[0].clientId)
      const tag = document.createElement('span')
      tag.className = 'admin-presence-focus-tag'
      tag.dataset.adminPresenceFocusTag = ''
      tag.style.setProperty('--presence-color', color)
      tag.textContent = names
      target.appendChild(tag)
      taggedEls.add(target)
    })
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
    layer.innerHTML = peers.filter((peer) => peer.cursor && !peer.focus).map((peer) => {
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
        body: JSON.stringify({ clientId, room, cursor, editing, focus }),
      })
      peers = Array.isArray(data?.peers) ? data.peers : []
      online = Array.isArray(data?.online) ? data.online : []
      renderAlert()
      renderWarn()
      renderFocus()
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

  const onFocusClick = (event) => {
    const home = event.target.closest('[data-home-goto]')
    if (home?.dataset.homeGoto) {
      focus = home.dataset.homeGoto
      editing = true
      void tick()
      return
    }
    const about = event.target.closest('[data-about-goto]')
    if (about?.dataset.aboutGoto) {
      focus = about.dataset.aboutGoto
      editing = true
      void tick()
      return
    }
    const simple = event.target.closest('[data-simple-goto]')
    if (simple?.dataset.simpleGoto) {
      focus = simple.dataset.simpleGoto
      editing = true
      void tick()
      return
    }
    const aspaceHome = event.target.closest('[data-aspace-home-section]')
    if (aspaceHome?.dataset.aspaceHomeSection) {
      focus = aspaceHome.dataset.aspaceHomeSection
      editing = true
      void tick()
      return
    }
    const aspaceHelp = event.target.closest('[data-aspace-help-section]')
    if (aspaceHelp?.dataset.aspaceHelpSection) {
      focus = aspaceHelp.dataset.aspaceHelpSection
      editing = true
      void tick()
      return
    }
    const aspaceTab = event.target.closest('[data-aspace-tab]')
    if (aspaceTab?.dataset.aspaceTab) {
      focus = aspaceTab.dataset.aspaceTab
      editing = true
      void tick()
    }
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
    document.addEventListener('click', onFocusClick, true)
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
      focus = ''
      peers = []
      clearFocusTags()
    }
    ensureUi()
    ensureLayer()
    renderAlert()
    renderWarn()
    renderFocus()
    renderCursors()
    if (!timer || !sameRoom) startHeartbeat()
  }

  const setFocus = (nextFocus) => {
    const value = String(nextFocus || '').trim().slice(0, 80)
    if (value === focus) return
    focus = value
    editing = Boolean(value)
    void tick()
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
    setFocus,
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
