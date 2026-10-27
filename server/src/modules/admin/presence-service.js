/** 后台协作在场：单机内存会话，心跳超时即离开 */

const TTL_MS = 8000
const sessions = new Map()

function prune(now = Date.now()) {
  for (const [id, session] of sessions) {
    if (now - session.lastSeen > TTL_MS) sessions.delete(id)
  }
}

function cleanRoom(room) {
  return String(room || '').trim().slice(0, 80)
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

export function heartbeatPresence({ clientId, user, room, cursor, editing }) {
  prune()
  const id = cleanClientId(clientId)
  const nextRoom = cleanRoom(room)
  if (!id || !user?.id || !nextRoom) {
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
  return listPresence(nextRoom, id)
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
  if (!nextRoom) return []
  return [...sessions.values()]
    .filter((item) => item.room === nextRoom && item.clientId !== exclude)
    .map((item) => ({
      clientId: item.clientId,
      userId: item.userId,
      name: item.name,
      editing: item.editing,
      cursor: item.cursor,
      lastSeen: item.lastSeen,
    }))
}

export function roomHasOtherEditors(room, excludeClientId = '', excludeUserId = '') {
  const peers = listPresence(room, excludeClientId)
  return peers.some((item) => {
    if (excludeUserId && item.userId === String(excludeUserId)) return false
    return item.editing
  })
}
