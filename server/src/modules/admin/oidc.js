import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { config } from '../../config.js'
import { addAudit, db, publicUser, save } from '../../lib/store.js'
import { createSession, sessionCookieOptions } from './auth.js'

export const adminOidcRouter = Router()

const CLIENT_ID = 'website-admin'
const STATE_COOKIE = 'atuo_admin_oidc'
const STATE_COOKIE_PATH = '/api/admin/oidc'
const STATE_ISSUER = 'atuofuture-admin-oidc'

const base64Url = (buffer) => buffer.toString('base64url')

function allowedOrigin(value) {
  const origin = String(value || '').trim().replace(/\/$/, '')
  return config.unifiedAuth.portalOrigins.includes(origin) ? origin : ''
}

function backToLogin(response, origin, reason) {
  const target = new URL('/admin/', origin || config.unifiedAuth.portalOrigins[0])
  if (reason) target.searchParams.set('login_error', reason)
  response.redirect(303, target.toString())
}

/** 服务端直连 Auth 时补上代理头，使 oidc-provider 按对外 HTTPS 地址处理请求。 */
function authHeaders(extra = {}) {
  const headers = { ...extra }
  if (config.unifiedAuth.issuer) {
    const issuer = new URL(config.unifiedAuth.issuer)
    headers['X-Forwarded-Proto'] = issuer.protocol.replace(':', '')
    headers['X-Forwarded-Host'] = issuer.host
  }
  return headers
}

function decodeJwtPayload(token) {
  const part = String(token || '').split('.')[1]
  if (!part) throw new Error('id_token 缺失')
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
}

adminOidcRouter.get('/start', (request, response) => {
  const origin = allowedOrigin(request.query.origin)
  if (!origin) return response.status(400).json({ error: 'invalid_origin' })

  const verifier = base64Url(randomBytes(32))
  const state = base64Url(randomBytes(24))
  const nonce = base64Url(randomBytes(24))
  const ticket = jwt.sign({ state, nonce, verifier, origin }, config.jwtSecret, { expiresIn: '10m', issuer: STATE_ISSUER })
  response.cookie(STATE_COOKIE, ticket, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
    path: STATE_COOKIE_PATH,
  })

  const authorize = new URL('/auth/auth', origin)
  authorize.search = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: `${origin}/api/admin/oidc/callback`,
    response_type: 'code',
    scope: 'openid profile',
    state,
    nonce,
    code_challenge: base64Url(createHash('sha256').update(verifier).digest()),
    code_challenge_method: 'S256',
    prompt: 'login',
  }).toString()
  response.redirect(302, authorize.toString())
})

adminOidcRouter.get('/callback', async (request, response) => {
  let ticket
  try {
    ticket = jwt.verify(request.cookies?.[STATE_COOKIE] || '', config.jwtSecret, { issuer: STATE_ISSUER })
  } catch {
    return backToLogin(response, '', 'expired')
  }
  response.clearCookie(STATE_COOKIE, { path: STATE_COOKIE_PATH })
  const { origin } = ticket
  if (!request.query.state || request.query.state !== ticket.state) return backToLogin(response, origin, 'expired')
  if (request.query.error || !request.query.code) return backToLogin(response, origin, 'denied')

  try {
    const tokenResponse = await fetch(`${config.unifiedAuth.internalUrl}/token`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code: String(request.query.code),
        redirect_uri: `${origin}/api/admin/oidc/callback`,
        code_verifier: ticket.verifier,
      }),
    })
    const tokens = await tokenResponse.json()
    if (!tokenResponse.ok || !tokens.access_token) throw new Error(tokens.error_description || tokens.error || 'token_failed')

    const idToken = decodeJwtPayload(tokens.id_token)
    const audience = Array.isArray(idToken.aud) ? idToken.aud : [idToken.aud]
    if (idToken.nonce !== ticket.nonce || !audience.includes(CLIENT_ID)) throw new Error('id_token 校验失败')

    const userinfoResponse = await fetch(`${config.unifiedAuth.internalUrl}/me`, {
      headers: authHeaders({ Authorization: `Bearer ${tokens.access_token}` }),
    })
    const claims = await userinfoResponse.json()
    if (!userinfoResponse.ok || !claims.sub || claims.sub !== idToken.sub) throw new Error('userinfo 获取失败')

    const now = new Date().toISOString()
    const unionId = String(claims.dingtalk_unionid || '')
    let user = db().adminUsers.find((item) => item.authSub === claims.sub)
      || (unionId ? db().adminUsers.find((item) => !item.authSub && item.dingtalkUnionId === unionId) : undefined)
    if (!user) {
      user = {
        id: randomUUID(),
        email: '',
        name: String(claims.name || '钉钉用户').slice(0, 80),
        provider: claims.idp === 'password' ? 'unified' : (claims.idp || 'dingtalk'),
        authSub: claims.sub,
        dingtalkUnionId: unionId || undefined,
        avatarUrl: String(claims.picture || ''),
        role: '',
        enabled: false,
        createdAt: now,
        lastLoginAt: now,
      }
      db().adminUsers.push(user)
      await save()
      await addAudit(publicUser(user), 'admin_user.request', user.id, { provider: user.provider, name: user.name })
      return backToLogin(response, origin, 'pending')
    }

    user.authSub = claims.sub
    if (unionId) user.dingtalkUnionId = unionId
    user.name = String(claims.name || user.name).slice(0, 80)
    user.avatarUrl = String(claims.picture || user.avatarUrl || '')
    user.lastLoginAt = now
    await save()
    if (!user.enabled) return backToLogin(response, origin, user.disabledReason === 'left' ? 'left' : user.role ? 'disabled' : 'pending')

    response.cookie('atuo_admin_session', createSession(user), sessionCookieOptions())
    await addAudit(publicUser(user), 'auth.login', 'admin', { method: user.provider })
    response.redirect(303, `${origin}/admin/`)
  } catch (error) {
    console.error('admin oidc callback failed:', error?.message || error)
    backToLogin(response, origin, 'failed')
  }
})
