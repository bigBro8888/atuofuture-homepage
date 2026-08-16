import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { config } from '../../config.js'
import { addAudit, save } from '../../lib/store.js'
import { requireAuth } from '../admin/auth.js'
import { getHomePageConfig, validateHomeContent } from './home-service.js'
import { getAboutPageConfig, validateAboutContent } from './about-service.js'
import { getSiteSettingsPage, validateSiteSettings } from './site-settings-service.js'
import { SIMPLE_PAGE_KEYS, getSimplePageConfig, validateSimplePage } from './simple-page-service.js'
import { getNewsFeedConfig, syncHomeNewsFromFeed, validateNewsFeedContent } from './news-feed-service.js'
import { getAgentsPageConfig, validateAgentsContent } from './agents-landing-service.js'
import { getSolutionsPageConfig, validateSolutionsContent } from './solutions-landing-service.js'
import { getHardwarePageConfig, validateHardwareContent } from './hardware-landing-service.js'

export const publicPagesRouter = Router()
export const adminPagesRouter = Router()

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
})
const imageExtensions = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
])

function sniffImageMime(buffer, mimeType) {
  const type = String(mimeType || '').split(';')[0].trim().toLowerCase()
  if (imageExtensions.has(type)) return type
  if (!buffer?.length) return ''
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg'
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png'
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif'
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[8] === 0x57) return 'image/webp'
  return ''
}

async function saveImageBuffer(buffer, mimeType, admin, extra = {}) {
  const type = sniffImageMime(buffer, mimeType)
  const extension = imageExtensions.get(type)
  if (!buffer?.length || !extension) {
    const error = new Error('仅支持 JPG、PNG、WebP 或 GIF 图片')
    error.status = 400
    throw error
  }
  const imageDirectory = path.join(config.uploadDir, 'images')
  const filename = `home-${Date.now()}-${randomUUID()}${extension}`
  await mkdir(imageDirectory, { recursive: true })
  await writeFile(path.join(imageDirectory, filename), buffer)
  const url = `/api/public/uploads/images/${filename}`
  await addAudit(admin, 'home.media.upload', 'home', {
    filename,
    size: buffer.length,
    mimeType: type,
    ...extra,
  })
  return url
}

function assertPublicImageUrl(raw) {
  const parsed = new URL(String(raw || ''))
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('只支持 http(s) 图片地址')
  const host = parsed.hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.localhost') || host === '0.0.0.0' || host === '::1') {
    throw new Error('不允许抓取内网图片')
  }
  if (/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) {
    throw new Error('不允许抓取内网图片')
  }
  return parsed.toString()
}

publicPagesRouter.get('/home', (request, response) => {
  const page = getHomePageConfig()
  if (page.status !== 'published' || !page.publishedContent) {
    return response.status(404).json({ error: 'page_not_published' })
  }
  response.set('Cache-Control', 'no-cache')
  response.json({
    pageKey: page.pageKey,
    locale: page.locale,
    content: page.publishedContent,
    publishedAt: page.publishedAt,
  })
})

adminPagesRouter.get('/home', requireAuth(), (request, response) => {
  const page = getHomePageConfig()
  response.json({ page })
})

adminPagesRouter.put('/home/draft', requireAuth('config:write'), async (request, response) => {
  try {
    const page = getHomePageConfig()
    page.draftContent = validateHomeContent(request.body?.content)
    page.updatedAt = new Date().toISOString()
    await save()
    await addAudit(request.admin, 'home.content.update', 'home', { sections: Object.keys(page.draftContent) })
    response.json({ page })
  } catch (error) {
    response.status(400).json({ error: 'invalid_home_content', message: error.message })
  }
})

adminPagesRouter.post('/home/publish', requireAuth('config:write'), async (request, response) => {
  const page = getHomePageConfig()
  page.publishedContent = structuredClone(page.draftContent)
  page.status = 'published'
  page.publishedAt = new Date().toISOString()
  page.updatedAt = page.publishedAt
  await save()
  await addAudit(request.admin, 'home.content.publish', 'home', { publishedAt: page.publishedAt })
  response.json({ page })
})

publicPagesRouter.get('/about', (request, response) => {
  const page = getAboutPageConfig()
  if (page.status !== 'published' || !page.publishedContent) {
    return response.status(404).json({ error: 'page_not_published' })
  }
  response.set('Cache-Control', 'no-cache')
  response.json({
    pageKey: page.pageKey,
    locale: page.locale,
    content: page.publishedContent,
    publishedAt: page.publishedAt,
  })
})

adminPagesRouter.get('/about', requireAuth(), (request, response) => {
  const page = getAboutPageConfig()
  response.json({ page })
})

adminPagesRouter.put('/about/draft', requireAuth('config:write'), async (request, response) => {
  try {
    const page = getAboutPageConfig()
    page.draftContent = validateAboutContent(request.body?.content)
    page.updatedAt = new Date().toISOString()
    await save()
    await addAudit(request.admin, 'about.content.update', 'about', { sections: Object.keys(page.draftContent) })
    response.json({ page })
  } catch (error) {
    response.status(400).json({ error: 'invalid_about_content', message: error.message })
  }
})

adminPagesRouter.post('/about/publish', requireAuth('config:write'), async (request, response) => {
  const page = getAboutPageConfig()
  page.publishedContent = structuredClone(page.draftContent)
  page.status = 'published'
  page.publishedAt = new Date().toISOString()
  page.updatedAt = page.publishedAt
  await save()
  await addAudit(request.admin, 'about.content.publish', 'about', { publishedAt: page.publishedAt })
  response.json({ page })
})

publicPagesRouter.get('/site', (request, response) => {
  const page = getSiteSettingsPage()
  response.set('Cache-Control', 'no-cache')
  response.json({
    pageKey: 'site',
    content: page.status === 'published' ? page.publishedContent : page.draftContent,
    publishedAt: page.publishedAt,
  })
})

adminPagesRouter.get('/site', requireAuth(), (request, response) => {
  response.json({ page: getSiteSettingsPage() })
})

adminPagesRouter.put('/site/draft', requireAuth('config:write'), async (request, response) => {
  try {
    const page = getSiteSettingsPage()
    page.draftContent = validateSiteSettings(request.body?.content)
    page.updatedAt = new Date().toISOString()
    await save()
    await addAudit(request.admin, 'site.settings.update', 'site', {})
    response.json({ page })
  } catch (error) {
    response.status(400).json({ error: 'invalid_site_settings', message: error.message })
  }
})

adminPagesRouter.post('/site/publish', requireAuth('config:write'), async (request, response) => {
  const page = getSiteSettingsPage()
  page.publishedContent = structuredClone(page.draftContent)
  page.status = 'published'
  page.publishedAt = new Date().toISOString()
  page.updatedAt = page.publishedAt
  await save()
  await addAudit(request.admin, 'site.settings.publish', 'site', { publishedAt: page.publishedAt })
  response.json({ page })
})

publicPagesRouter.get('/news-feed', (request, response) => {
  const page = getNewsFeedConfig()
  if (page.status !== 'published' || !page.publishedContent) {
    return response.status(404).json({ error: 'page_not_published' })
  }
  response.set('Cache-Control', 'no-cache')
  response.json({
    pageKey: page.pageKey,
    content: page.publishedContent,
    publishedAt: page.publishedAt,
  })
})

adminPagesRouter.get('/news-feed', requireAuth(), (request, response) => {
  response.json({ page: getNewsFeedConfig() })
})

adminPagesRouter.put('/news-feed/draft', requireAuth('config:write'), async (request, response) => {
  try {
    const page = getNewsFeedConfig()
    page.draftContent = validateNewsFeedContent(request.body?.content)
    page.updatedAt = new Date().toISOString()
    await save()
    await addAudit(request.admin, 'news.feed.update', 'news-feed', { count: page.draftContent.items.length })
    response.json({ page })
  } catch (error) {
    response.status(400).json({ error: 'invalid_news_feed', message: error.message })
  }
})

adminPagesRouter.post('/news-feed/publish', requireAuth('config:write'), async (request, response) => {
  const page = getNewsFeedConfig()
  page.publishedContent = structuredClone(page.draftContent)
  page.status = 'published'
  page.publishedAt = new Date().toISOString()
  page.updatedAt = page.publishedAt
  const homeCount = syncHomeNewsFromFeed(page.publishedContent.items || [])
  await save()
  await addAudit(request.admin, 'news.feed.publish', 'news-feed', { publishedAt: page.publishedAt, homeCount })
  response.json({ page, homeCount })
})

function registerLandingPage(key, getPage, validate) {
  publicPagesRouter.get(`/${key}`, (request, response) => {
    const page = getPage()
    if (page.status !== 'published' || !page.publishedContent) {
      return response.status(404).json({ error: 'page_not_published' })
    }
    response.set('Cache-Control', 'no-cache')
    response.json({
      pageKey: page.pageKey,
      content: page.publishedContent,
      publishedAt: page.publishedAt,
    })
  })
  adminPagesRouter.get(`/${key}`, requireAuth(), (request, response) => {
    response.json({ page: getPage() })
  })
  adminPagesRouter.put(`/${key}/draft`, requireAuth('config:write'), async (request, response) => {
    try {
      const page = getPage()
      page.draftContent = validate(request.body?.content)
      page.updatedAt = new Date().toISOString()
      await save()
      await addAudit(request.admin, `${key}.content.update`, key, {})
      response.json({ page })
    } catch (error) {
      response.status(400).json({ error: `invalid_${key}_content`, message: error.message })
    }
  })
  adminPagesRouter.post(`/${key}/publish`, requireAuth('config:write'), async (request, response) => {
    const page = getPage()
    page.publishedContent = structuredClone(page.draftContent)
    page.status = 'published'
    page.publishedAt = new Date().toISOString()
    page.updatedAt = page.publishedAt
    await save()
    await addAudit(request.admin, `${key}.content.publish`, key, { publishedAt: page.publishedAt })
    response.json({ page })
  })
}

registerLandingPage('agents', getAgentsPageConfig, validateAgentsContent)
registerLandingPage('solutions', getSolutionsPageConfig, validateSolutionsContent)
registerLandingPage('hardware', getHardwarePageConfig, validateHardwareContent)

publicPagesRouter.get('/simple/:key', (request, response) => {
  const page = getSimplePageConfig(request.params.key)
  if (!page || page.status !== 'published' || !page.publishedContent) {
    return response.status(404).json({ error: 'page_not_published' })
  }
  response.set('Cache-Control', 'no-cache')
  response.json({
    pageKey: page.pageKey,
    content: page.publishedContent,
    publishedAt: page.publishedAt,
  })
})

adminPagesRouter.get('/simple/:key', requireAuth(), (request, response) => {
  if (!SIMPLE_PAGE_KEYS.includes(request.params.key)) return response.status(404).json({ error: 'unknown_page' })
  response.json({ page: getSimplePageConfig(request.params.key) })
})

adminPagesRouter.put('/simple/:key/draft', requireAuth('config:write'), async (request, response) => {
  try {
    const page = getSimplePageConfig(request.params.key)
    if (!page) return response.status(404).json({ error: 'unknown_page' })
    page.draftContent = validateSimplePage(request.params.key, request.body?.content)
    page.updatedAt = new Date().toISOString()
    await save()
    await addAudit(request.admin, 'simple.page.update', request.params.key, {})
    response.json({ page })
  } catch (error) {
    response.status(400).json({ error: 'invalid_page_content', message: error.message })
  }
})

adminPagesRouter.post('/simple/:key/publish', requireAuth('config:write'), async (request, response) => {
  const page = getSimplePageConfig(request.params.key)
  if (!page) return response.status(404).json({ error: 'unknown_page' })
  page.publishedContent = structuredClone(page.draftContent)
  page.status = 'published'
  page.publishedAt = new Date().toISOString()
  page.updatedAt = page.publishedAt
  await save()
  await addAudit(request.admin, 'simple.page.publish', request.params.key, { publishedAt: page.publishedAt })
  response.json({ page })
})

adminPagesRouter.post('/media/image', requireAuth('config:write'), imageUpload.single('image'), async (request, response) => {
  try {
    const url = await saveImageBuffer(request.file?.buffer, request.file?.mimetype, request.admin)
    response.status(201).json({ url })
  } catch (error) {
    response.status(error.status || 400).json({ error: 'invalid_image', message: error.message })
  }
})

adminPagesRouter.post('/media/image-from-url', requireAuth('config:write'), async (request, response) => {
  try {
    const remoteUrl = assertPublicImageUrl(request.body?.url)
    const remote = await fetch(remoteUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
      headers: { Accept: 'image/*,*/*;q=0.8', 'User-Agent': 'AtuoFutureCMS/1.0' },
    })
    if (!remote.ok) throw new Error('远程图片无法下载')
    const mimeType = remote.headers.get('content-type') || ''
    const buffer = Buffer.from(await remote.arrayBuffer())
    if (buffer.length > 20 * 1024 * 1024) throw new Error('图片超过 20MB')
    const url = await saveImageBuffer(buffer, mimeType, request.admin, { source: remoteUrl })
    response.status(201).json({ url })
  } catch (error) {
    response.status(400).json({ error: 'invalid_remote_image', message: error.message || '远程图片导入失败' })
  }
})
