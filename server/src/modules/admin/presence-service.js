/** 后台协作在场：单机内存会话，心跳超时即离开 */

const TTL_MS = 8000
const DEFAULT_ROOM = '__admin__'
const sessions = new Map()

function prune(now = Date.now()) {
  for (const [id, session] of sessions) {
    if (now - session.lastSeen > TTL_MS) sessions.delete(id)
  }
}

function cleanRoom(room) {
  const value = String(room || '').trim().slice(0, 80)
  return value || DEFAULT_ROOM
}

function cleanClientId(value) {
  return String(value || '').trim().slice(0, 64)
}

function cleanCursor(cursor) {
  if (!cursor || typeof cursor !== 'object') return null
  const x = Number(cursor.x)
  const y = Number(cursor.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
  }
}

function presentSession(item) {
  return {
    clientId: item.clientId,
    userId: item.userId,
    name: item.name,
    room: item.room,
    editing: item.editing,
    cursor: item.cursor,
    lastSeen: item.lastSeen,
  }
}

export function heartbeatPresence({ clientId, user, room, cursor, editing }) {
  prune()
  const id = cleanClientId(clientId)
  const nextRoom = cleanRoom(room)
  if (!id || !user?.id) {
    const error = new Error('在场参数无效')
    error.status = 400
    error.code = 'invalid_presence'
    throw error
  }
  const session = {
    clientId: id,
    userId: String(user.id),
    name: String(user.name || user.email || '编辑者').trim().slice(0, 40) || '编辑者',
    email: String(user.email || '').trim().slice(0, 80),
    room: nextRoom,
    cursor: cleanCursor(cursor),
    editing: Boolean(editing),
    lastSeen: Date.now(),
  }
  sessions.set(id, session)
  return {
    peers: listPresence(nextRoom, id),
    online: listOnlineUsers(id, session.userId),
  }
}

export function leavePresence(clientId) {
  const id = cleanClientId(clientId)
  if (id) sessions.delete(id)
  prune()
  return { ok: true }
}

export function listPresence(room, excludeClientId = '') {
  prune()
  const nextRoom = cleanRoom(room)
  const exclude = cleanClientId(excludeClientId)
  return [...sessions.values()]
    .filter((item) => item.room === nextRoom && item.clientId !== exclude)
    .map(presentSession)
}

/** 后台全局在线：按用户去重，排除自己 */
export function listOnlineUsers(excludeClientId = '', excludeUserId = '') {
  prune()
  const exclude = cleanClientId(excludeClientId)
  const excludeUser = String(excludeUserId || '').trim()
  const byUser = new Map()
  for (const item of sessions.values()) {
    if (item.clientId === exclude) continue
    if (excludeUser && item.userId === excludeUser) continue
    const prev = byUser.get(item.userId)
    if (!prev || item.lastSeen > prev.lastSeen) {
      byUser.set(item.userId, {
        userId: item.userId,
        name: item.name,
        room: item.room,
        editing: item.editing,
        lastSeen: item.lastSeen,
      })
    } else if (item.editing) {
      prev.editing = true
    }
  }
  return [...byUser.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
}

export function roomHasOtherEditors(room, excludeClientId = '', excludeUserId = '') {
  const peers = listPresence(room, excludeClientId)
  return peers.some((item) => {
    if (excludeUserId && item.userId === String(excludeUserId)) return false
    return item.editing
  })
}
