/** 后台协作在场：心跳轮询 + 顶部在线警示 + 全页焦点高亮 + 未保存文案实时预览 */

const COLORS = ['#0879f9', '#0f9f6e', '#d97706', '#db2777', '#7c3aed', '#0891b2']
const HEARTBEAT_MS = 1500
const DEFAULT_ROOM = '__admin__'
const LIVE_DRAFT_MAX_KEYS = 40
const LIVE_DRAFT_MAX_VALUE = 800

function draftKeyFromElement(el) {
  if (!el || !(el instanceof Element)) return ''
  if (el.dataset.editPath) return `path:${el.dataset.editPath}`
  if (el.dataset.homeField) return `field:${el.dataset.homeField}`
  if (el.dataset.aboutField) return `about-field:${el.dataset.aboutField}`
  return ''
}

function findDraftTarget(key) {
  if (!key) return null
  const active = '.admin-panel.is-active'
  const colon = key.indexOf(':')
  const kind = colon === -1 ? '' : key.slice(0, colon)
  const id = colon === -1 ? key : key.slice(colon + 1)
  try {
    if (kind === 'path') return document.querySelector(`${active} [data-edit-path="${safeEscape(id)}"]`)
    if (kind === 'field') return document.querySelector(`${active} [data-home-field="${safeEscape(id)}"]`)
    if (kind === 'about-field') return document.querySelector(`${active} [data-about-field="${safeEscape(id)}"]`)
  } catch {
    return null
  }
  return null
}

function readDraftValue(el) {
  if (!el) return ''
  if (el.matches('input, textarea, select')) return String(el.value ?? '')
  const clone = el.cloneNode(true)
  clone.querySelectorAll('[data-admin-presence-live-tag], [data-admin-presence-focus-tag]').forEach((node) => node.remove())
  return String(clone.innerText || clone.textContent || '').replace(/\u00a0/g, ' ').trim()
}

function writeDraftValue(el, value) {
  if (!el) return
  if (el.matches('input, textarea, select')) {
    if (el.value !== value) el.value = value
    return
  }
  const next = value || ''
  const current = readDraftValue(el)
  if (current !== next) el.textContent = next || '\u00a0'
}

function tagHostFor(el) {
  if (!el) return null
  if (el.isContentEditable || el.getAttribute?.('contenteditable') === 'true') return el.parentElement || el
  return el
}

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

function safeEscape(value) {
  try {
    return CSS.escape(String(value || ''))
  } catch {
    return String(value || '').replace(/["\\]/g, '\\$&')
  }
}

/** 从 DOM 元素解析焦点键：kind:id */
function encodeFocusFromElement(el) {
  if (!el || !(el instanceof Element)) return ''
  if (el.dataset.homeGoto) return `home:${el.dataset.homeGoto}`
  if (el.dataset.aboutGoto) return `about:${el.dataset.aboutGoto}`
  if (el.dataset.simpleGoto) return `simple:${el.dataset.simpleGoto}`
  if (el.dataset.aspaceHomeSection) return `aspace-home:${el.dataset.aspaceHomeSection}`
  if (el.dataset.aspaceHelpSection) return `aspace-help:${el.dataset.aspaceHelpSection}`
  if (el.dataset.aspaceHelpPageGroup) return `aspace-help-group:${el.dataset.aspaceHelpPageGroup}`
  if (el.dataset.aspaceTab) return `aspace-tab:${el.dataset.aspaceTab}`
  if (el.dataset.configGoto) return `config:${el.dataset.configGoto}`
  if (el.dataset.editPath) return `path:${el.dataset.editPath}`
  if (el.dataset.editImage) return `image:${el.dataset.editImage}`
  if (el.dataset.homeField) {
    const section = el.closest('[data-home-section]')
    if (section?.dataset.homeSection) return `home:${section.dataset.homeSection}`
  }
  if (el.dataset.aboutField) {
    const section = el.closest('[data-about-section], section[id]')
    if (section?.dataset.aboutSection) return `about:${section.dataset.aboutSection}`
    if (section?.id) return `dom-id:${section.id}`
  }
  const homeSection = el.closest('[data-home-section]')
  if (homeSection?.dataset.homeSection) return `home:${homeSection.dataset.homeSection}`
  const simpleSection = el.closest('[data-simple-section]')
  if (simpleSection?.dataset.simpleSection) return `simple:${simpleSection.dataset.simpleSection}`
  const aboutSection = el.closest('[data-about-section]')
  if (aboutSection?.dataset.aboutSection) return `about:${aboutSection.dataset.aboutSection}`
  const visualSection = el.closest('[data-about-visual] section[id], [data-agents-visual] section[id], [data-solutions-visual] section[id], [data-hardware-visual] section[id], [data-aspace-home-visual] section[id]')
  if (visualSection?.id) return `dom-id:${visualSection.id}`
  const card = el.closest('[data-ag-select], [data-aso-app], [data-aspace-profile], [data-aspace-category]')
  if (card?.dataset.agSelect) return `agent:${card.dataset.agSelect}`
  if (card?.dataset.asoApp) return `aso-app:${card.dataset.asoApp}`
  if (card?.dataset.aspaceProfile) return `aspace-profile:${card.dataset.aspaceProfile}`
  if (card?.dataset.aspaceCategory) return `aspace-category:${card.dataset.aspaceCategory}`
  return ''
}

function findFocusTarget(focusId) {
  if (!focusId) return null
  const active = '.admin-panel.is-active'
  const colon = focusId.indexOf(':')
  const kind = colon === -1 ? '' : focusId.slice(0, colon)
  const id = colon === -1 ? focusId : focusId.slice(colon + 1)
  if (!id && kind) return null

  const query = (selector) => {
    try {
      return document.querySelector(`${active} ${selector}`)
    } catch {
      return null
    }
  }

  if (!kind) {
    return query(`[data-home-goto="${safeEscape(id)}"]`)
      || query(`[data-about-goto="${safeEscape(id)}"]`)
      || query(`[data-simple-goto="${safeEscape(id)}"]`)
      || query(`[data-aspace-home-section="${safeEscape(id)}"]`)
      || query(`[data-aspace-help-section="${safeEscape(id)}"]`)
      || query(`[data-aspace-tab="${safeEscape(id)}"]`)
      || query(`[data-config-goto="${safeEscape(id)}"]`)
  }

  switch (kind) {
    case 'home':
      return query(`[data-home-goto="${safeEscape(id)}"]`) || query(`[data-home-section="${safeEscape(id)}"]`)
    case 'about':
      return query(`[data-about-goto="${safeEscape(id)}"]`) || query(`[data-about-section="${safeEscape(id)}"]`)
    case 'simple':
      return query(`[data-simple-goto="${safeEscape(id)}"]`) || query(`[data-simple-section="${safeEscape(id)}"]`)
    case 'aspace-home':
      return query(`[data-aspace-home-section="${safeEscape(id)}"]`)
    case 'aspace-help':
      return query(`[data-aspace-help-section="${safeEscape(id)}"]`)
    case 'aspace-help-group':
      return query(`[data-aspace-help-page-group="${safeEscape(id)}"]`)
    case 'aspace-tab':
      return query(`[data-aspace-tab="${safeEscape(id)}"]`)
    case 'config':
      return query(`[data-config-goto="${safeEscape(id)}"]`)
    case 'path':
      return query(`[data-edit-path="${safeEscape(id)}"]`)
    case 'image':
      return query(`[data-edit-image="${safeEscape(id)}"]`)
    case 'dom-id':
      return query(`#${safeEscape(id)}`)
    case 'agent':
      return query(`[data-ag-select="${safeEscape(id)}"]`)
    case 'aso-app':
      return query(`[data-aso-app="${safeEscape(id)}"]`)
    case 'aspace-profile':
      return query(`[data-aspace-profile="${safeEscape(id)}"]`)
    case 'aspace-category':
      return query(`[data-aspace-category="${safeEscape(id)}"]`)
    default:
      return null
  }
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
  const liveDraft = {}
  /** @type {Map<string, { original: string, peerName: string }>} */
  const remoteApplied = new Map()

  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[ch]))

  const isLocallyFocused = (el) => {
    const active = document.activeElement
    return Boolean(el && active && (el === active || el.contains(active)))
  }

  const trimLiveDraft = () => {
    const keys = Object.keys(liveDraft)
    if (keys.length <= LIVE_DRAFT_MAX_KEYS) return
    keys.slice(0, keys.length - LIVE_DRAFT_MAX_KEYS).forEach((key) => { delete liveDraft[key] })
  }

  const recordLocalDraft = (el) => {
    const key = draftKeyFromElement(el)
    if (!key) return
    liveDraft[key] = readDraftValue(el).slice(0, LIVE_DRAFT_MAX_VALUE)
    trimLiveDraft()
    editing = true
    // 本地开始改这个字段时，不再跟对方的实时预览
    if (remoteApplied.has(key)) {
      remoteApplied.delete(key)
      el.classList.remove('is-remote-editing')
    }
  }

  const clearRemoteLiveMarks = (el) => {
    if (!el) return
    el.classList.remove('is-remote-editing')
  }

  const applyRemoteLiveDrafts = () => {
    if (!room || room === DEFAULT_ROOM) {
      remoteApplied.forEach((_, key) => {
        const el = findDraftTarget(key)
        if (el && !isLocallyFocused(el)) {
          const saved = remoteApplied.get(key)
          if (saved) writeDraftValue(el, saved.original)
          clearRemoteLiveMarks(el)
        }
      })
      remoteApplied.clear()
      return
    }

    // 合并同房间对方文案：后写入的 peer 覆盖同字段
    const merged = new Map()
    peers.forEach((peer) => {
      const draft = peer.liveDraft && typeof peer.liveDraft === 'object' ? peer.liveDraft : {}
      Object.entries(draft).forEach(([key, value]) => {
        merged.set(key, { value: String(value ?? ''), peer })
      })
    })

    // 恢复对方已不再广播的字段
    Array.from(remoteApplied.keys()).forEach((key) => {
      if (merged.has(key)) return
      const el = findDraftTarget(key)
      const saved = remoteApplied.get(key)
      if (el && saved && !isLocallyFocused(el)) writeDraftValue(el, saved.original)
      clearRemoteLiveMarks(el)
      remoteApplied.delete(key)
    })

    merged.forEach(({ value, peer }, key) => {
      // 自己正在改的字段不覆盖
      if (Object.prototype.hasOwnProperty.call(liveDraft, key) && isLocallyFocused(findDraftTarget(key))) return
      const el = findDraftTarget(key)
      if (!el || isLocallyFocused(el)) return
      if (!remoteApplied.has(key)) {
        remoteApplied.set(key, { original: readDraftValue(el), peerName: peer.name })
      } else {
        remoteApplied.get(key).peerName = peer.name
      }
      writeDraftValue(el, value)
      el.classList.add('is-remote-editing')
    })
  }

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
      el.querySelectorAll('[data-admin-presence-focus-tag], [data-admin-presence-live-tag]').forEach((tag) => tag.remove())
    })
    document.querySelectorAll('.admin-panel.is-active [data-admin-presence-focus-tag], .admin-panel.is-active [data-admin-presence-live-tag]').forEach((tag) => tag.remove())
    taggedEls.clear()
  }

  /** 每个目标只挂一个标签：仅在场显示名字，有文案改动则「名字 · 编辑中」 */
  const renderFocus = () => {
    clearFocusTags()
    if (!room || room === DEFAULT_ROOM) return

    /** @type {Map<Element, { names: string[], editing: boolean, color: string }>} */
    const byTarget = new Map()

    const addPeerToTarget = (el, peer, editing) => {
      if (!el) return
      const prev = byTarget.get(el) || { names: [], editing: false, color: colorFor(peer.userId || peer.clientId) }
      if (!prev.names.includes(peer.name)) prev.names.push(peer.name)
      prev.editing = prev.editing || editing
      byTarget.set(el, prev)
    }

    peers.forEach((peer) => {
      const draft = peer.liveDraft && typeof peer.liveDraft === 'object' ? peer.liveDraft : {}
      const draftKeys = Object.keys(draft)
      const isEditingCopy = Boolean(peer.editing && draftKeys.length) || draftKeys.length > 0

      if (peer.focus) addPeerToTarget(findFocusTarget(peer.focus), peer, isEditingCopy)

      draftKeys.forEach((key) => {
        addPeerToTarget(findDraftTarget(key), peer, true)
      })
    })

    byTarget.forEach((info, target) => {
      const host = tagHostFor(target)
      if (!host) return
      const style = getComputedStyle(host)
      if (style.position === 'static') host.style.position = 'relative'
      target.classList.add('is-remote-focus')
      if (info.editing) target.classList.add('is-remote-editing')
      const names = info.names.join('、')
      const tag = document.createElement('span')
      tag.className = 'admin-presence-focus-tag'
      tag.dataset.adminPresenceFocusTag = ''
      tag.contentEditable = 'false'
      tag.style.setProperty('--presence-color', info.color)
      tag.textContent = info.editing ? `${names} · 编辑中` : names
      host.appendChild(tag)
      taggedEls.add(target)
      taggedEls.add(host)
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
    // 已有区块/字段焦点时，优先显示红框，不再叠一层光标点
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
        body: JSON.stringify({ clientId, room, cursor, editing, focus, liveDraft }),
      })
      peers = Array.isArray(data?.peers) ? data.peers : []
      online = Array.isArray(data?.online) ? data.online : []
      renderAlert()
      renderWarn()
      applyRemoteLiveDrafts()
      renderFocus()
      renderCursors()
    } catch {
      // 心跳失败不打断编辑
    }
  }

  const applyLocalFocus = (nextFocus, { markEdit = true } = {}) => {
    const value = String(nextFocus || '').trim().slice(0, 80)
    if (!value || value === focus) return
    focus = value
    if (markEdit) editing = true
    void tick()
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

  const onActivity = (event) => {
    editing = true
    const draftEl = event.target?.closest?.('[data-edit-path], [data-home-field], [data-about-field]')
    if (draftEl && (event.type === 'input' || event.type === 'change')) recordLocalDraft(draftEl)
    const hit = event.target?.closest?.('[data-edit-path], [data-edit-image], [data-home-field], [data-about-field], [data-home-goto], [data-about-goto], [data-simple-goto], [data-aspace-home-section], [data-aspace-help-section], [data-aspace-tab], [data-home-section], [data-simple-section], [data-ag-select], [data-aso-app], [data-aspace-profile], [data-aspace-category], section[id]')
    const next = encodeFocusFromElement(hit)
    if (next) applyLocalFocus(next)
  }

  const onFocusClick = (event) => {
    const hit = event.target.closest('[data-home-goto], [data-about-goto], [data-simple-goto], [data-aspace-home-section], [data-aspace-help-section], [data-aspace-help-page-group], [data-aspace-tab], [data-config-goto], [data-edit-path], [data-edit-image], [data-home-field], [data-about-field], [data-ag-select], [data-aso-app], [data-aspace-profile], [data-aspace-category], [data-home-section], [data-simple-section], section[id]')
    const next = encodeFocusFromElement(hit)
    if (next) applyLocalFocus(next)
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
    document.addEventListener('focusin', onActivity, true)
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
      Object.keys(liveDraft).forEach((key) => { delete liveDraft[key] })
      applyRemoteLiveDrafts()
      clearFocusTags()
    }
    ensureUi()
    ensureLayer()
    renderAlert()
    renderWarn()
    applyRemoteLiveDrafts()
    renderFocus()
    renderCursors()
    if (!timer || !sameRoom) startHeartbeat()
  }

  const setFocus = (nextFocus) => {
    applyLocalFocus(nextFocus, { markEdit: Boolean(nextFocus) })
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
