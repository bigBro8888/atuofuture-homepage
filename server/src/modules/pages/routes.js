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
])

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

adminPagesRouter.post('/media/image', requireAuth('config:write'), imageUpload.single('image'), async (request, response) => {
  const extension = imageExtensions.get(request.file?.mimetype)
  if (!request.file || !extension) {
    return response.status(400).json({ error: 'invalid_image', message: '仅支持 JPG、PNG 或 WebP 图片' })
  }

  const imageDirectory = path.join(config.uploadDir, 'images')
  const filename = `home-${Date.now()}-${randomUUID()}${extension}`
  await mkdir(imageDirectory, { recursive: true })
  await writeFile(path.join(imageDirectory, filename), request.file.buffer)
  const url = `/api/public/uploads/images/${filename}`
  await addAudit(request.admin, 'home.media.upload', 'home', {
    filename,
    size: request.file.size,
    mimeType: request.file.mimetype,
  })
  response.status(201).json({ url })
})
