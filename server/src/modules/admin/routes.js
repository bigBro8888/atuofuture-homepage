import { Router } from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { config } from '../../config.js'
import { addAudit, db, normalizeAppButtons, normalizeAppFeatures, publicUser, save } from '../../lib/store.js'
import { getLatestAndroidVersion } from '../apps/version-service.js'
import { publishRelease, rollbackRelease } from '../apps/release-service.js'
import { createSession, requireAuth, sessionCookieOptions } from './auth.js'

export const adminRouter = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 300 * 1024 * 1024, files: 1 } })
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024, files: 1 } })
const loginAttempts = new Map()
const validRoles = new Set(['super_admin', 'editor', 'publisher', 'analyst'])
const imageExtensions = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
])

function cleanUrl(value, { allowEmpty = true } = {}) {
  const url = String(value || '').trim()
  if (!url && allowEmpty) return ''
  if (url.startsWith('/') && !url.startsWith('//')) return url
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:') throw new Error('链接必须使用 HTTPS')
  return parsed.toString()
}

adminRouter.post('/login', async (request, response) => {
  const key = request.ip || 'unknown'
  const attempts = loginAttempts.get(key) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 }
  if (attempts.resetAt < Date.now()) {
    attempts.count = 0
    attempts.resetAt = Date.now() + 15 * 60 * 1000
  }
  if (attempts.count >= 8) return response.status(429).json({ error: 'too_many_attempts' })

  const account = String(request.body?.account || request.body?.email || '').trim().toLowerCase()
  const user = db().adminUsers.find((item) => item.email === account && item.enabled)
  if (!user || !(await bcrypt.compare(String(request.body?.password || ''), user.passwordHash))) {
    attempts.count += 1
    loginAttempts.set(key, attempts)
    return response.status(401).json({ error: 'invalid_credentials' })
  }

  loginAttempts.delete(key)
  response.cookie('atuo_admin_session', createSession(user), sessionCookieOptions())
  await addAudit(publicUser(user), 'auth.login', 'admin')
  response.json({ user: publicUser(user) })
})

adminRouter.post('/logout', requireAuth(), async (request, response) => {
  await addAudit(request.admin, 'auth.logout', 'admin')
  response.clearCookie('atuo_admin_session', { path: '/' }).status(204).end()
})

adminRouter.get('/me', requireAuth(), (request, response) => response.json({ user: request.admin }))

adminRouter.get('/app', requireAuth(), async (request, response) => {
  let currentVersion = null
  try {
    currentVersion = await getLatestAndroidVersion()
  } catch {
    currentVersion = null
  }
  const app = db().apps.find((item) => item.id === 'artink')
  response.json({
    app: { ...app, features: normalizeAppFeatures(app.features), buttons: normalizeAppButtons(app.buttons) },
    currentVersion,
    sourceHealth: db().sourceHealth,
  })
})

adminRouter.put('/app', requireAuth('config:write'), async (request, response) => {
  const app = db().apps.find((item) => item.id === 'artink')
  try {
    app.name = String(request.body.name || 'Artink').trim().slice(0, 80)
    app.description = String(request.body.description || '').trim().slice(0, 500)
    app.iconUrl = cleanUrl(request.body.iconUrl)
    app.heroImageUrl = cleanUrl(request.body.heroImageUrl)
    app.desktopBannerUrl = cleanUrl(request.body.desktopBannerUrl)
    app.downloadTitle = String(request.body.downloadTitle || '').trim().slice(0, 120)
    app.downloadSubtitle = String(request.body.downloadSubtitle || '').trim().slice(0, 240)
    app.downloadDescription = String(request.body.downloadDescription || '').trim().slice(0, 500)
    app.features = normalizeAppFeatures(request.body.features)
    app.buttons = normalizeAppButtons(request.body.buttons)
    app.iosStoreUrl = cleanUrl(request.body.iosStoreUrl)
    app.androidDownloadUrl = cleanUrl(request.body.androidDownloadUrl)
    app.privacyUrl = cleanUrl(request.body.privacyUrl)
    app.termsUrl = cleanUrl(request.body.termsUrl)
    app.published = Boolean(request.body.published)
    app.updatedAt = new Date().toISOString()
    await save()
    await addAudit(request.admin, 'app.config.update', 'artink', { fields: Object.keys(request.body) })
    response.json({ app })
  } catch (error) {
    response.status(400).json({ error: 'invalid_config', message: error.message })
  }
})

adminRouter.post('/app/hero-image', requireAuth('config:write'), imageUpload.single('image'), async (request, response) => {
  const extension = imageExtensions.get(request.file?.mimetype)
  if (!request.file || !extension) {
    return response.status(400).json({ error: 'invalid_image', message: '仅支持 JPG、PNG 或 WebP 图片' })
  }

  const imageDirectory = path.join(config.uploadDir, 'images')
  const filename = `hero-${Date.now()}-${randomUUID()}${extension}`
  await mkdir(imageDirectory, { recursive: true })
  await writeFile(path.join(imageDirectory, filename), request.file.buffer)
  const url = `/api/public/uploads/images/${filename}`
  await addAudit(request.admin, 'app.hero_image.upload', 'artink', {
    filename,
    size: request.file.size,
    mimeType: request.file.mimetype,
  })
  response.status(201).json({ url })
})

adminRouter.get('/releases', requireAuth(), (request, response) => {
  const releases = [...db().releases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  response.json({ releases })
})

adminRouter.post('/releases', requireAuth('release:write'), upload.single('apk'), async (request, response, next) => {
  try {
    const release = await publishRelease({
      version: request.body.version,
      notes: request.body.notes,
      file: request.file,
      user: request.admin,
    })
    response.status(201).json({ release })
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/releases/:releaseId/rollback', requireAuth('release:write'), async (request, response, next) => {
  try {
    const release = await rollbackRelease({ releaseId: request.params.releaseId, user: request.admin })
    response.json({ release })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/stats', requireAuth('stats:read'), (request, response) => {
  const days = Math.min(90, Math.max(7, Number(request.query.days || 30)))
  const since = Date.now() - days * 86400000
  const events = db().downloadEvents.filter((event) => new Date(event.createdAt).getTime() >= since)
  const byDay = {}
  const byPlatform = { android: 0, ios: 0 }
  const byBrowser = {}
  events.forEach((event) => {
    const day = event.createdAt.slice(0, 10)
    byDay[day] = (byDay[day] || 0) + 1
    byPlatform[event.platform] = (byPlatform[event.platform] || 0) + 1
    byBrowser[event.browser] = (byBrowser[event.browser] || 0) + 1
  })
  response.json({ total: events.length, byDay, byPlatform, byBrowser, days })
})

adminRouter.get('/users', requireAuth('users:write'), (request, response) => {
  response.json({ users: db().adminUsers.map(publicUser) })
})

adminRouter.post('/users', requireAuth('users:write'), async (request, response) => {
  const account = String(request.body.account || request.body.email || '').trim().toLowerCase()
  const password = String(request.body.password || '')
  const role = String(request.body.role || 'editor')
  if (!account || /\s/.test(account) || account.length < 2 || account.length > 40) {
    return response.status(400).json({ error: 'invalid_user', message: '账号 2–40 个字符，不能有空格' })
  }
  if (password.length < 6 || password.length > 128) {
    return response.status(400).json({ error: 'invalid_user', message: '密码至少 6 位即可，格式不限' })
  }
  if (!validRoles.has(role)) {
    return response.status(400).json({ error: 'invalid_user', message: '请选择角色' })
  }
  if (db().adminUsers.some((user) => user.email === account)) {
    return response.status(409).json({ error: 'account_exists', message: '该账号已存在' })
  }
  const user = {
    id: randomUUID(),
    email: account,
    name: String(request.body.name || account).trim().slice(0, 80) || account,
    passwordHash: await bcrypt.hash(password, 12),
    role,
    enabled: true,
    createdAt: new Date().toISOString(),
  }
  db().adminUsers.push(user)
  await save()
  await addAudit(request.admin, 'admin_user.create', user.id, { account, role })
  response.status(201).json({ user: publicUser(user) })
})

adminRouter.get('/audit-logs', requireAuth('audit:read'), (request, response) => {
  const limit = Math.min(200, Math.max(20, Number(request.query.limit || 100)))
  response.json({ logs: [...db().auditLogs].reverse().slice(0, limit) })
})
