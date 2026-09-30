import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import { config } from '../../config.js'
import { requirePortalAuth } from './auth.js'

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function signTicket(payload) {
  const body = b64url(JSON.stringify(payload))
  const sig = createHmac('sha256', config.posterSsoSecret).update(body).digest('base64url')
  return `${body}.${sig}`
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function verifyPosterTicket(ticket) {
  const [body, sig] = String(ticket || '').split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', config.posterSsoSecret).update(body).digest('base64url')
  if (!safeEqual(sig, expected)) return null
  try {
    const json = Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    const payload = JSON.parse(json)
    if (payload?.iss !== 'aspace-one') return null
    if (!payload.exp || Date.now() > Number(payload.exp)) return null
    if (!payload.email || !payload.name) return null
    return payload
  } catch {
    return null
  }
}

function slugifyLocalPart(name) {
  const ascii = String(name || 'user')
    .normalize('NFKD')
    .replace(/[^\w]+/g, '')
    .slice(0, 18)
  return ascii || `user${randomBytes(2).toString('hex')}`
}

export const aspaceSsoRouter = Router()

function requireApp(appId) {
  return (request, response, next) => {
    if (!request.portalUser.activeOrganization?.appIds?.includes(appId)) {
      return response.status(403).json({ error: 'app_forbidden', message: '当前组织未开通该应用。' })
    }
    next()
  }
}

/** 门户签发 AI 画报一次性 SSO 票据，返回可嵌入 URL */
aspaceSsoRouter.post('/poster', requirePortalAuth, requireApp('poster'), (request, response) => {
  if (!config.posterSsoSecret) {
    return response.status(503).json({ error: 'sso_not_configured', message: '统一登录密钥未配置' })
  }

  const name = request.portalUser.name
  const org = request.portalUser.activeOrganization?.name || ''
  const emailRaw = request.portalUser.email
  const email = emailRaw || `${slugifyLocalPart(name)}@aspace.atuofuture.local`

  const payload = {
    iss: 'aspace-one',
    email,
    name,
    org,
    nonce: randomBytes(8).toString('hex'),
    exp: Date.now() + config.posterSsoTtlMs,
  }
  const ticket = signTicket(payload)
  const embedUrl = new URL('/c/atuofuture/', config.posterAppOrigin)
  embedUrl.searchParams.set('aso_sso', ticket)
  embedUrl.searchParams.set('embed', '1')

  response.json({
    ticket,
    embedUrl: embedUrl.toString(),
    expiresAt: new Date(payload.exp).toISOString(),
    user: { email, name, org },
  })
})

/**
 * AAP 资产管理系统没有原生 SSO，也不允许共用账号自动登录。
 * 这里只返回网关嵌入 URL（不带票据），用户在嵌入页用自己的 AAP 账号登录。
 */
aspaceSsoRouter.post('/embed/aap', requirePortalAuth, requireApp('resource'), (_request, response) => {
  response.json({ embedUrl: `${config.aapAppOrigin}/?embed=1` })
})
