import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { config } from '../../config.js'
import { addAudit, db, defaultAspaceCatalog, defaultAspaceHome, defaultAspaceQuickActions, save } from '../../lib/store.js'
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

function normalizeCatalog(value = {}) {
  const defaultCategories = new Map(defaultAspaceCatalog.categories.map((item) => [item.id, item]))
  const categorySource = Array.isArray(value.categories) ? value.categories : []
  const sourceById = new Map(categorySource.map((item) => [String(item?.id || ''), item]))
  const orderedIds = categorySource.map((item) => String(item?.id || '')).filter((id) => defaultCategories.has(id))
  defaultAspaceCatalog.categories.forEach((item) => {
    if (!orderedIds.includes(item.id)) orderedIds.push(item.id)
  })
  const categories = orderedIds.map((id) => {
    const fallback = defaultCategories.get(id)
    const item = sourceById.get(id) || {}
    const label = String(item.label ?? fallback.label).trim().slice(0, 40)
    if (!label) throw new Error('栏目标题不能为空')
    const icon = String(item.icon ?? fallback.icon).trim().slice(0, 40)
    if (!/^[a-z0-9_]+$/.test(icon)) throw new Error(`栏目“${label}”图标格式无效`)
    const iconUrl = String(item.iconUrl || '').trim().slice(0, 500)
    if (iconUrl && !/^(?:https?:\/\/|\/(?:api\/public\/uploads\/images|images)\/)/i.test(iconUrl)) {
      throw new Error(`栏目“${label}”自定义图标地址无效`)
    }
    return {
      id,
      icon,
      iconUrl,
      label,
      description: String(item.description ?? fallback.description).trim().slice(0, 160),
    }
  })
  const categoryIds = new Set(categories.map((item) => item.id))
  const appSource = new Map((Array.isArray(value.apps) ? value.apps : []).map((item) => [String(item?.id || ''), item]))
  const apps = defaultAspaceCatalog.apps.map((fallback) => {
    const item = appSource.get(fallback.id) || {}
    const category = String(item.category || fallback.category)
    const name = String(item.name ?? fallback.name).trim().slice(0, 40) || fallback.name
    const description = String(item.description ?? fallback.description ?? '').trim().slice(0, 160)
    const image = String(item.image ?? fallback.image ?? '').trim().slice(0, 500)
    if (image && !/^(?:https?:\/\/|\/(?:api\/public\/uploads\/images|images)\/)/i.test(image)) {
      throw new Error(`应用“${name}”封面图地址无效`)
    }
    return {
      id: fallback.id,
      name,
      category: categoryIds.has(category) ? category : fallback.category,
      image,
      description,
    }
  })
  return { categories, apps }
}

function currentCatalog() {
  try {
    return normalizeCatalog(db().aspaceCatalog)
  } catch {
    return structuredClone(defaultAspaceCatalog)
  }
}

function cleanMediaUrl(value, label) {
  const url = String(value || '').trim().slice(0, 500)
  if (!url) return ''
  if (!/^(?:https?:\/\/|\/(?:api\/public\/uploads\/images|images)\/)/i.test(url)) {
    throw new Error(`${label}地址无效`)
  }
  return url
}

function normalizeHome(value = {}) {
  const fallback = defaultAspaceHome
  const heroSource = value.hero || {}
  const panoramaSource = value.panorama || {}
  const scenesSource = value.scenes || {}
  const infraSource = value.infra || {}
  const panoramaItemsSource = new Map((Array.isArray(panoramaSource.items) ? panoramaSource.items : []).map((item) => [String(item?.id || ''), item]))
  const sceneItemsSource = new Map((Array.isArray(scenesSource.items) ? scenesSource.items : []).map((item) => [String(item?.id || ''), item]))
  const statsSource = Array.isArray(infraSource.stats) ? infraSource.stats : []

  const hero = {
    background: cleanMediaUrl(heroSource.background ?? fallback.hero.background, '首页背景图') || fallback.hero.background,
    title: String(heroSource.title ?? fallback.hero.title).trim().slice(0, 120) || fallback.hero.title,
    primaryCta: String(heroSource.primaryCta ?? fallback.hero.primaryCta).trim().slice(0, 40) || fallback.hero.primaryCta,
    secondaryCta: String(heroSource.secondaryCta ?? fallback.hero.secondaryCta).trim().slice(0, 40) || fallback.hero.secondaryCta,
  }

  const panorama = {
    title: String(panoramaSource.title ?? fallback.panorama.title).trim().slice(0, 60) || fallback.panorama.title,
    lead: String(panoramaSource.lead ?? fallback.panorama.lead).trim().slice(0, 160) || fallback.panorama.lead,
    moreLabel: String(panoramaSource.moreLabel ?? fallback.panorama.moreLabel).trim().slice(0, 40) || fallback.panorama.moreLabel,
    items: fallback.panorama.items.map((itemFallback) => {
      const item = panoramaItemsSource.get(itemFallback.id) || {}
      const linkSource = Array.isArray(item.items) ? item.items : []
      return {
        id: itemFallback.id,
        step: String(item.step ?? itemFallback.step).trim().slice(0, 8) || itemFallback.step,
        stage: String(item.stage ?? itemFallback.stage).trim().slice(0, 20) || itemFallback.stage,
        image: cleanMediaUrl(item.image ?? itemFallback.image, `业务全景「${itemFallback.title}」封面`) || itemFallback.image,
        title: String(item.title ?? itemFallback.title).trim().slice(0, 40) || itemFallback.title,
        desc: String(item.desc ?? itemFallback.desc).trim().slice(0, 80) || itemFallback.desc,
        items: itemFallback.items.map((linkFallback, index) => {
          const link = linkSource[index] || {}
          return {
            category: linkFallback.category,
            label: String(link.label ?? linkFallback.label).trim().slice(0, 30) || linkFallback.label,
          }
        }),
      }
    }),
  }

  const scenes = {
    title: String(scenesSource.title ?? fallback.scenes.title).trim().slice(0, 60) || fallback.scenes.title,
    lead: String(scenesSource.lead ?? fallback.scenes.lead).trim().slice(0, 160) || fallback.scenes.lead,
    items: fallback.scenes.items.map((itemFallback) => {
      const item = sceneItemsSource.get(itemFallback.id) || {}
      const appsSource = Array.isArray(item.apps) ? item.apps : []
      return {
        id: itemFallback.id,
        label: String(item.label ?? itemFallback.label).trim().slice(0, 30) || itemFallback.label,
        title: String(item.title ?? itemFallback.title).trim().slice(0, 60) || itemFallback.title,
        lead: String(item.lead ?? itemFallback.lead).trim().slice(0, 160) || itemFallback.lead,
        image: cleanMediaUrl(item.image ?? itemFallback.image, `业务场景「${itemFallback.label}」封面`) || itemFallback.image,
        apps: itemFallback.apps.map((appFallback, index) => {
          const app = appsSource[index] || {}
          return {
            id: appFallback.id,
            label: String(app.label ?? appFallback.label).trim().slice(0, 30) || appFallback.label,
            icon: appFallback.icon,
          }
        }),
      }
    }),
  }

  const infra = {
    title: String(infraSource.title ?? fallback.infra.title).trim().slice(0, 80) || fallback.infra.title,
    cta: String(infraSource.cta ?? fallback.infra.cta).trim().slice(0, 40) || fallback.infra.cta,
    stats: fallback.infra.stats.map((statFallback, index) => {
      const stat = statsSource[index] || {}
      return {
        value: String(stat.value ?? statFallback.value).trim().slice(0, 16) || statFallback.value,
        unit: String(stat.unit ?? statFallback.unit).trim().slice(0, 8),
        label: String(stat.label ?? statFallback.label).trim().slice(0, 40) || statFallback.label,
      }
    }),
  }

  return { hero, panorama, scenes, infra }
}

function currentHome() {
  try {
    return normalizeHome(db().aspaceHome)
  } catch {
    return structuredClone(defaultAspaceHome)
  }
}

publicAspaceRouter.get('/quick-actions', (_request, response) => {
  response.json({ actions: currentQuickActions() })
})

publicAspaceRouter.get('/catalog', (_request, response) => {
  response.setHeader('Cache-Control', 'no-store')
  response.json({ catalog: currentCatalog() })
})

publicAspaceRouter.get('/home', (_request, response) => {
  response.setHeader('Cache-Control', 'no-store')
  response.json({ home: currentHome() })
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

adminAspaceRouter.get('/catalog', requireAuth(), (_request, response) => {
  response.json({ catalog: currentCatalog() })
})

adminAspaceRouter.put('/catalog', requireAuth('config:write'), async (request, response) => {
  try {
    const catalog = normalizeCatalog(request.body?.catalog)
    db().aspaceCatalog = catalog
    await save()
    await addAudit(request.admin, 'aspace.catalog.update', 'aspace-one', {
      categories: catalog.categories.map(({ id, label }) => ({ id, label })),
      apps: catalog.apps.map(({ id, category, name }) => ({ id, category, name })),
    })
    response.json({ catalog })
  } catch (error) {
    response.status(400).json({
      error: 'invalid_aspace_catalog',
      message: error instanceof Error ? error.message : '栏目配置无效',
    })
  }
})

adminAspaceRouter.get('/home', requireAuth(), (_request, response) => {
  response.json({ home: currentHome() })
})

adminAspaceRouter.put('/home', requireAuth('config:write'), async (request, response) => {
  try {
    const home = normalizeHome(request.body?.home)
    db().aspaceHome = home
    await save()
    await addAudit(request.admin, 'aspace.home.update', 'aspace-one', {
      heroTitle: home.hero.title,
      panoramaTitle: home.panorama.title,
      scenesTitle: home.scenes.title,
    })
    response.json({ home })
  } catch (error) {
    response.status(400).json({
      error: 'invalid_aspace_home',
      message: error instanceof Error ? error.message : '首页配置无效',
    })
  }
})
