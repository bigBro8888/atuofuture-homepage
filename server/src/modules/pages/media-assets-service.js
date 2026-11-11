import { randomUUID } from 'node:crypto'

function publicAsset(item) {
  return {
    id: item.id,
    name: item.name,
    kind: item.kind,
    mimeType: item.mimeType,
    size: item.size,
    url: item.url,
    storage: item.storage || 'local',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt || item.createdAt,
    createdBy: item.createdBy || '',
  }
}

export function listMediaAssets(db) {
  const items = Array.isArray(db.mediaAssets) ? db.mediaAssets : []
  return items
    .slice()
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .map(publicAsset)
}

export function createMediaAsset(db, payload = {}) {
  const now = new Date().toISOString()
  const item = {
    id: randomUUID(),
    name: String(payload.name || '未命名素材').trim().slice(0, 160) || '未命名素材',
    kind: payload.kind === 'audio' ? 'audio' : payload.kind === 'image' ? 'image' : 'video',
    mimeType: String(payload.mimeType || '').slice(0, 120),
    size: Number(payload.size) || 0,
    url: String(payload.url || '').trim(),
    storage: payload.storage === 'oss' ? 'oss' : 'local',
    objectKey: payload.objectKey || '',
    createdAt: now,
    updatedAt: now,
    createdBy: String(payload.createdBy || '').slice(0, 80),
  }
  if (!item.url) {
    const error = new Error('素材地址无效')
    error.status = 400
    throw error
  }
  if (!Array.isArray(db.mediaAssets)) db.mediaAssets = []
  db.mediaAssets.unshift(item)
  return publicAsset(item)
}

export function renameMediaAsset(db, id, name) {
  const item = (db.mediaAssets || []).find((row) => row.id === id)
  if (!item) {
    const error = new Error('素材不存在')
    error.status = 404
    throw error
  }
  const next = String(name || '').trim().slice(0, 160)
  if (!next) {
    const error = new Error('请填写素材名称')
    error.status = 400
    throw error
  }
  item.name = next
  item.updatedAt = new Date().toISOString()
  return publicAsset(item)
}

export function deleteMediaAsset(db, id) {
  const list = Array.isArray(db.mediaAssets) ? db.mediaAssets : []
  const index = list.findIndex((row) => row.id === id)
  if (index < 0) {
    const error = new Error('素材不存在')
    error.status = 404
    throw error
  }
  const [removed] = list.splice(index, 1)
  return publicAsset(removed)
}
