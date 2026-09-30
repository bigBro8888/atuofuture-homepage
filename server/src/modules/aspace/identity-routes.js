import { Router } from 'express'
import bcrypt from 'bcryptjs'
import {
  createPortalSession,
  portalSessionCookieName,
  portalSessionCookieOptions,
  publicPortalUser,
  requirePortalAuth,
} from './auth.js'
import { addAudit, db, save } from '../../lib/store.js'

export const aspaceIdentityRouter = Router()
const loginAttempts = new Map()

function loginAttempt(request) {
  const key = request.ip || 'unknown'
  let attempt = loginAttempts.get(key)
  if (!attempt || attempt.resetAt < Date.now()) {
    attempt = { count: 0, resetAt: Date.now() + 15 * 60 * 1000 }
    loginAttempts.set(key, attempt)
  }
  return [key, attempt]
}

aspaceIdentityRouter.post('/login', async (request, response) => {
  const [key, attempt] = loginAttempt(request)
  if (attempt.count >= 8) return response.status(429).json({ error: 'too_many_attempts', message: '登录尝试过多，请稍后再试。' })

  const account = String(request.body?.account || '').trim().toLowerCase()
  const user = db().aspaceUsers.find((item) => (
    item.enabled && (item.account === account || item.email === account)
  ))
  if (!user || !(await bcrypt.compare(String(request.body?.password || ''), user.passwordHash))) {
    attempt.count += 1
    return response.status(401).json({ error: 'invalid_credentials', message: '账号或密码错误。' })
  }

  loginAttempts.delete(key)
  user.lastLoginAt = new Date().toISOString()
  await save()
  response.cookie(portalSessionCookieName, createPortalSession(user), portalSessionCookieOptions())
  await addAudit(publicPortalUser(user), 'aspace.auth.login', 'aspace-one')
  response.json({ user: publicPortalUser(user) })
})

aspaceIdentityRouter.post('/logout', requirePortalAuth, async (request, response) => {
  await addAudit(request.portalUser, 'aspace.auth.logout', 'aspace-one')
  response.clearCookie(portalSessionCookieName, { path: '/' }).status(204).end()
})

aspaceIdentityRouter.get('/me', requirePortalAuth, (request, response) => {
  response.setHeader('Cache-Control', 'no-store')
  response.json({ user: request.portalUser })
})

aspaceIdentityRouter.put('/profile', requirePortalAuth, async (request, response) => {
  const name = String(request.body?.name || '').trim().slice(0, 40)
  const email = String(request.body?.email || '').trim().toLowerCase().slice(0, 120)
  if (!name) return response.status(400).json({ error: 'invalid_profile', message: '姓名不能为空。' })
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: 'invalid_profile', message: '邮箱格式不正确。' })
  }
  if (email && db().aspaceUsers.some((item) => item.id !== request.portalUserRecord.id && item.email === email)) {
    return response.status(409).json({ error: 'email_exists', message: '该邮箱已被其他账号使用。' })
  }
  request.portalUserRecord.name = name
  request.portalUserRecord.email = email
  request.portalUserRecord.updatedAt = new Date().toISOString()
  await save()
  await addAudit(request.portalUser, 'aspace.profile.update', request.portalUserRecord.id)
  response.json({ user: publicPortalUser(request.portalUserRecord) })
})

aspaceIdentityRouter.put('/password', requirePortalAuth, async (request, response) => {
  const currentPassword = String(request.body?.currentPassword || '')
  const newPassword = String(request.body?.newPassword || '')
  if (!(await bcrypt.compare(currentPassword, request.portalUserRecord.passwordHash))) {
    return response.status(400).json({ error: 'invalid_password', message: '当前密码不正确。' })
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    return response.status(400).json({ error: 'invalid_password', message: '新密码须为 8–128 个字符。' })
  }
  request.portalUserRecord.passwordHash = await bcrypt.hash(newPassword, 12)
  request.portalUserRecord.updatedAt = new Date().toISOString()
  await save()
  await addAudit(request.portalUser, 'aspace.password.update', request.portalUserRecord.id)
  response.clearCookie(portalSessionCookieName, { path: '/' }).status(204).end()
})

aspaceIdentityRouter.put('/organization', requirePortalAuth, async (request, response) => {
  const organizationId = String(request.body?.organizationId || '')
  if (!request.portalUserRecord.organizationIds.includes(organizationId)) {
    return response.status(403).json({ error: 'organization_forbidden', message: '你无权访问该组织。' })
  }
  request.portalUserRecord.activeOrganizationId = organizationId
  request.portalUserRecord.updatedAt = new Date().toISOString()
  await save()
  await addAudit(request.portalUser, 'aspace.organization.switch', organizationId)
  response.json({ user: publicPortalUser(request.portalUserRecord) })
})
