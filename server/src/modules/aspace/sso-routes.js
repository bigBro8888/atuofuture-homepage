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

function parseSetCookieHeaders(headers) {
  const raw = headers.getSetCookie?.() || []
  if (raw.length) return raw
  const single = headers.get('set-cookie')
  return single ? [single] : []
}

function toGatewayCookie(setCookieLine) {
  return String(setCookieLine)
    .split(';')
    .map((part) => part.trim())
    .filter((part) => {
      const lower = part.toLowerCase()
      if (lower.startsWith('domain=')) return false
      if (lower.startsWith('samesite=')) return false
      if (lower === 'secure') return false
      return true
    })
    .concat(['Path=/', 'SameSite=Lax'])
    .join('; ')
}

async function tryUpstreamAspaceSso(ticket) {
  const response = await fetch(`${config.aapUpstreamOrigin}/api/auth/sso/aspace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ticket }),
  }).catch(() => null)
  if (!response || response.status === 404) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return null
  return { data, cookies: parseSetCookieHeaders(response.headers) }
}

async function signInAapWithServiceAccount() {
  if (!config.aapSsoUsername || !config.aapSsoPassword) return null
  const response = await fetch(`${config.aapUpstreamOrigin}/api/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      tenantID: config.aapSsoTenantId,
      username: config.aapSsoUsername,
      password: config.aapSsoPassword,
    }),
  }).catch(() => null)
  if (!response) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data?.success || !data?.data) return null
  return { data, cookies: parseSetCookieHeaders(response.headers) }
}

function publicUserFromAap(payload, ticket) {
  const raw = payload?.data && typeof payload.data === 'object' ? payload.data : payload
  const permissions = Array.isArray(raw?.permissions)
    ? raw.permissions
    : Array.isArray(payload?.data?.permissions)
      ? payload.data.permissions
      : []
  return {
    ...raw,
    name: raw?.name || raw?.username || ticket.name,
    email: raw?.email || ticket.email,
    permissions,
    org: ticket.org,
    source: 'aspace-one',
  }
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

/** 门户签发 AAP 一次性 SSO 票据，返回网关嵌入 URL */
aspaceSsoRouter.post('/aap', (request, response) => {
  if (!config.posterSsoSecret) {
    return response.status(503).json({ error: 'sso_not_configured', message: '统一登录密钥未配置' })
  }

  const name = String(request.body?.name || '张三').trim().slice(0, 32) || '张三'
  const org = String(request.body?.org || '王力集团').trim().slice(0, 64)
  const emailRaw = String(request.body?.email || '').trim().toLowerCase()
  const email = emailRaw || `${slugifyLocalPart(name)}@aspace.atuofuture.local`

  const payload = {
    iss: 'aspace-one',
    aud: 'aap',
    email,
    name,
    org,
    nonce: randomBytes(8).toString('hex'),
    exp: Date.now() + config.posterSsoTtlMs,
  }
  const ticket = signTicket(payload)
  const embedUrl = new URL('/', config.aapAppOrigin)
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
 * AAP 网关消费票据：优先转发上游原生 SSO；否则用服务账号换会话 Cookie。
 * 由 nginx 将 /api/auth/sso/aspace 指到本接口。
 */
aspaceSsoRouter.post('/aap/exchange', async (request, response) => {
  if (!config.posterSsoSecret) {
    return response.status(503).json({ success: false, error: 'sso_not_configured', message: '统一登录密钥未配置' })
  }

  const ticket = String(request.body?.ticket || '')
  const payload = verifyPosterTicket(ticket)
  if (!payload) {
    return response.status(401).json({ success: false, error: 'invalid_ticket', message: '统一登录票据无效或已过期' })
  }

  try {
    let session = await tryUpstreamAspaceSso(ticket)
    let mode = 'upstream'
    if (!session) {
      session = await signInAapWithServiceAccount()
      mode = 'service_account'
    }
    if (!session) {
      return response.status(503).json({
        success: false,
        error: 'aap_sso_unavailable',
        message: 'AAP 统一登录未就绪：上游无 SSO 接口且未配置服务账号',
      })
    }

    for (const line of session.cookies) {
      response.append('Set-Cookie', toGatewayCookie(line))
    }

    const user = publicUserFromAap(session.data, payload)
    return response.json({
      success: true,
      mode,
      user,
      token: session.data?.token || session.data?.data?.token || '',
      tokenKey: 'Authorization',
      tenantID: config.aapSsoTenantId,
      source: 'aspace-one',
    })
  } catch (error) {
    console.error('[aspace-sso/aap]', error)
    return response.status(500).json({
      success: false,
      error: 'exchange_failed',
      message: error instanceof Error ? error.message : '统一登录失败',
    })
  }
})
