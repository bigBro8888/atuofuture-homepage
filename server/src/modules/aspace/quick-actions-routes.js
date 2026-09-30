import { Router } from 'express'
import { addAudit, db, defaultAspaceQuickActions, save } from '../../lib/store.js'
import { requireAuth } from '../admin/auth.js'

export const publicAspaceRouter = Router()
export const adminAspaceRouter = Router()

const defaultsById = new Map(defaultAspaceQuickActions.map((item) => [item.id, item]))

function cleanUrl(value) {
  const url = String(value || '').trim().slice(0, 500)
  if (!url) return ''
  if (url.startsWith('app:')) {
    const appId = url.slice(4)
    if (!['energy', 'poster', 'album', 'screen', 'resource'].includes(appId)) {
      throw new Error('应用链接格式无效')
    }
    return `app:${appId}`
  }
  if (url.startsWith('/') && !url.startsWith('//')) return url
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('链接仅支持 HTTP、HTTPS 或站内路径')
  return parsed.toString()
}

function normalizeQuickActions(value) {
  if (!Array.isArray(value)) throw new Error('快捷入口配置格式无效')
  const source = new Map(value.map((item) => [String(item?.id || ''), item]))
  return defaultAspaceQuickActions.map((fallback) => {
    const item = source.get(fallback.id) || {}
    const label = String(item.label ?? fallback.label).trim().slice(0, 40)
    if (!label) throw new Error('快捷入口文案不能为空')
    return {
      id: fallback.id,
      icon: defaultsById.get(fallback.id).icon,
      label,
      url: cleanUrl(item.url),
    }
  })
}

function currentQuickActions() {
  try {
    return normalizeQuickActions(db().aspaceQuickActions)
  } catch {
    return structuredClone(defaultAspaceQuickActions)
  }
}

publicAspaceRouter.get('/quick-actions', (_request, response) => {
  response.json({ actions: currentQuickActions() })
})

adminAspaceRouter.put('/quick-actions', requireAuth('config:write'), async (request, response) => {
  try {
    const actions = normalizeQuickActions(request.body?.actions)
    db().aspaceQuickActions = actions
    await save()
    await addAudit(request.admin, 'aspace.quick_actions.update', 'aspace-one', {
      actions: actions.map(({ id, label, url }) => ({ id, label, url })),
    })
    response.json({ actions })
  } catch (error) {
    response.status(400).json({
      error: 'invalid_quick_actions',
      message: error instanceof Error ? error.message : '快捷入口配置无效',
    })
  }
})
