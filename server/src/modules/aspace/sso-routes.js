import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import { config } from '../../config.js'

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

/** 门户签发 AI 画报一次性 SSO 票据，返回可嵌入 URL */
aspaceSsoRouter.post('/poster', (request, response) => {
  if (!config.posterSsoSecret) {
    return response.status(503).json({ error: 'sso_not_configured', message: '统一登录密钥未配置' })
  }

  const name = String(request.body?.name || '张三').trim().slice(0, 32) || '张三'
  const org = String(request.body?.org || '王力集团').trim().slice(0, 64)
  const emailRaw = String(request.body?.email || '').trim().toLowerCase()
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
