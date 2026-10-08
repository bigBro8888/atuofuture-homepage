import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { config } from '../../config.js'
import { addAudit, db, defaultAspaceQuickActions, save } from '../../lib/store.js'
import { requireAuth } from '../admin/auth.js'

export const publicAspaceRouter = Router()
export const adminAspaceRouter = Router()

const defaultsById = new Map(defaultAspaceQuickActions.map((item) => [item.id, item]))
const validAppIds = new Set([
  'resource',
  'screen',
  'poster',
  'energy',
  'album',
  'aspace',
  'info-publish',
  'deskplate',
  'digital-twin',
])
const visitorCookie = 'aso_portal_visitor'

function visitorId(request, response) {
  const current = String(request.cookies?.[visitorCookie] || '')
  if (/^[0-9a-f-]{36}$/i.test(current)) return current
  const id = randomUUID()
  response.cookie(visitorCookie, id, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60 * 1000,
    path: '/',
  })
  return id
}

function cleanActivity(value = {}) {
  const appId = String(value.appId || '').trim()
  if (!validAppIds.has(appId)) throw new Error('系统标识无效')
  const feature = String(value.feature || '').trim().slice(0, 100)
  if (!feature) throw new Error('功能点不能为空')
  const deepLink = String(value.deepLink || '').trim().slice(0, 500)
  if (deepLink && !deepLink.startsWith('/') && !/^https?:\/\//i.test(deepLink)) {
    throw new Error('继续访问链接格式无效')
  }
  return {
    appId,
    appName: String(value.appName || '').trim().slice(0, 80),
    project: String(value.project || '').trim().slice(0, 100),
    feature,
    deepLink,
  }
}

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

publicAspaceRouter.get('/activities', (request, response) => {
  const id = visitorId(request, response)
  const activities = [...db().aspaceActivities]
    .reverse()
    .filter((item) => item.visitorId === id)
    .map(({ visitorId: _visitorId, ...activity }) => activity)
  response.setHeader('Cache-Control', 'no-store')
  response.json({ activities })
})

publicAspaceRouter.get('/activity/latest', (request, response) => {
  const id = visitorId(request, response)
  const activity = [...db().aspaceActivities]
    .reverse()
    .find((item) => item.visitorId === id) || null
  response.setHeader('Cache-Control', 'no-store')
  if (!activity) return response.json({ activity: null })
  const { visitorId: _visitorId, ...publicActivity } = activity
  response.json({ activity: publicActivity })
})

publicAspaceRouter.post('/activity', async (request, response) => {
  try {
    const id = visitorId(request, response)
    const activity = {
      id: randomUUID(),
      visitorId: id,
      ...cleanActivity(request.body),
      createdAt: new Date().toISOString(),
    }
    db().aspaceActivities.push(activity)
    if (db().aspaceActivities.length > 5000) db().aspaceActivities.splice(0, db().aspaceActivities.length - 5000)
    await save()
    const { visitorId: _visitorId, ...publicActivity } = activity
    response.status(201).json({ activity: publicActivity })
  } catch (error) {
    response.status(400).json({
      error: 'invalid_activity',
      message: error instanceof Error ? error.message : '操作记录无效',
    })
  }
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
