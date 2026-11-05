/**
 * 安托未来统一登录 · Node.js / Express 后端接入
 *
 * 服务端完成授权码 + PKCE 换码，登录态保存在本系统自己的签名 HttpOnly Cookie 里，
 * 浏览器拿不到 token。只依赖 Node 18+ 内置的 fetch 与 crypto，不需要 cookie-parser。
 * 复制本文件到项目中使用，接入步骤见 docs/统一Auth接入说明.md。
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'

const DEFAULT_ISSUER = 'https://ai.atuofuture.com/auth'

const base64Url = (buffer) => Buffer.from(buffer).toString('base64url')

function parseCookies(header) {
  const cookies = {}
  for (const part of String(header || '').split(';')) {
    const index = part.indexOf('=')
    if (index < 0) continue
    const name = part.slice(0, index).trim()
    if (name) cookies[name] = decodeURIComponent(part.slice(index + 1).trim())
  }
  return cookies
}

function safeReturnPath(value) {
  const path = String(value || '')
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '/'
  return path
}

function decodeJwtPayload(token) {
  const part = String(token || '').split('.')[1]
  if (!part) throw new Error('id_token 缺失')
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
}

/**
 * @param {object} options
 * @param {string} options.clientId 在统一 Auth 登记的 client_id
 * @param {string} options.appOrigin 本系统对外地址，如 https://asset.atuofuture.com
 * @param {string} options.sessionSecret 至少 32 位随机字符串，用于签名 Cookie
 * @param {string} [options.issuer] 默认 https://ai.atuofuture.com/auth
 * @param {string} [options.internalUrl] 与 Auth 同机部署时填 http://127.0.0.1:18089/auth，服务端直连不绕公网
 * @param {string} [options.basePath] 登录相关路由前缀，默认 /auth（提供 /login /callback /logout /me）
 * @param {string} [options.scope] 默认 'openid profile email'
 * @param {string} [options.cookieName] 会话 Cookie 名，默认 atuo_{clientId}_session
 * @param {number} [options.sessionTtlSeconds] 会话有效期，默认 8 小时
 * @param {boolean} [options.secureCookie] 默认 appOrigin 为 https 时开启
 * @param {(claims: object) => Promise<object|null>|object|null} [options.onLogin]
 *   登录成功后把统一身份映射成本系统用户；返回 null 表示拒绝进入（如未授权）。默认直接使用 claims。
 * @param {string} [options.afterLoginPath] 默认 '/'
 * @param {string} [options.deniedPath] onLogin 返回 null 时跳转的页面，默认 '/?login_error=denied'
 */
export function createAtuoAuth(options) {
  if (!options?.clientId || !options?.appOrigin || !options?.sessionSecret) {
    throw new Error('createAtuoAuth 需要 clientId、appOrigin、sessionSecret')
  }
  if (String(options.sessionSecret).length < 32) throw new Error('sessionSecret 至少 32 位')
  const issuer = String(options.issuer || DEFAULT_ISSUER).replace(/\/$/, '')
  const internalUrl = String(options.internalUrl || issuer).replace(/\/$/, '')
  const appOrigin = String(options.appOrigin).replace(/\/$/, '')
  const basePath = `/${String(options.basePath || '/auth').replace(/^\/+|\/+$/g, '')}`
  const callbackUrl = `${appOrigin}${basePath}/callback`
  const scope = options.scope || 'openid profile email'
  const cookieName = options.cookieName || `atuo_${options.clientId.replace(/\W/g, '_')}_session`
  const stateCookieName = `${cookieName}_oidc`
  const sessionTtl = Number(options.sessionTtlSeconds || 8 * 3600)
  const secure = options.secureCookie ?? appOrigin.startsWith('https://')
  const onLogin = options.onLogin || ((claims) => claims)
  const afterLoginPath = options.afterLoginPath || '/'
  const deniedPath = options.deniedPath || '/?login_error=denied'

  const sign = (payload, ttlSeconds) => {
    const body = base64Url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }))
    return `${body}.${base64Url(createHmac('sha256', options.sessionSecret).update(body).digest())}`
  }
  const verify = (value) => {
    const [body, signature] = String(value || '').split('.')
    if (!body || !signature) return null
    const expected = createHmac('sha256', options.sessionSecret).update(body).digest()
    const actual = Buffer.from(signature, 'base64url')
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    return payload.exp > Date.now() / 1000 ? payload : null
  }
  const cookieOptions = (maxAgeSeconds) => ({
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds * 1000,
  })

  /** 与 Auth 同机直连时补上对外地址，让 Auth 按 HTTPS 公网地址签发与校验 */
  const authHeaders = (extra = {}) => {
    if (internalUrl === issuer) return extra
    const url = new URL(issuer)
    return { ...extra, 'X-Forwarded-Proto': url.protocol.replace(':', ''), 'X-Forwarded-Host': url.host }
  }

  /** 读取请求里的登录用户，未登录返回 null */
  function getUser(request) {
    const session = verify(parseCookies(request.headers.cookie)[cookieName])
    return session?.user || null
  }

  /** 保护接口：未登录返回 401 JSON */
  function requireUser(request, response, next) {
    const user = getUser(request)
    if (!user) return response.status(401).json({ error: 'unauthorized', loginUrl: `${basePath}/login` })
    request.atuoUser = user
    next()
  }

  /** 保护页面：未登录直接跳统一登录，回来后回到当前页 */
  function requireLogin(request, response, next) {
    const user = getUser(request)
    if (!user) return response.redirect(302, `${basePath}/login?returnTo=${encodeURIComponent(request.originalUrl)}`)
    request.atuoUser = user
    next()
  }

  const router = Router()

  router.get(`${basePath}/login`, (request, response) => {
    const verifier = base64Url(randomBytes(32))
    const state = base64Url(randomBytes(24))
    const nonce = base64Url(randomBytes(24))
    const returnTo = safeReturnPath(request.query.returnTo || afterLoginPath)
    response.cookie(stateCookieName, sign({ verifier, state, nonce, returnTo }, 10 * 60), cookieOptions(10 * 60))
    const url = new URL(`${issuer}/auth`)
    url.search = new URLSearchParams({
      client_id: options.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope,
      state,
      nonce,
      code_challenge: base64Url(createHash('sha256').update(verifier).digest()),
      code_challenge_method: 'S256',
      ...(request.query.prompt === 'login' || request.query.prompt === 'none' ? { prompt: request.query.prompt } : {}),
    }).toString()
    response.redirect(302, url.toString())
  })

  router.get(`${basePath}/callback`, async (request, response) => {
    const pending = verify(parseCookies(request.headers.cookie)[stateCookieName])
    response.clearCookie(stateCookieName, { path: '/' })
    if (!pending || request.query.state !== pending.state) return response.redirect(303, `${basePath}/login`)
    if (request.query.error || !request.query.code) {
      return response.redirect(303, `${safeReturnPath(pending.returnTo)}${pending.returnTo.includes('?') ? '&' : '?'}login_error=${encodeURIComponent(String(request.query.error || 'failed'))}`)
    }
    try {
      const tokenResponse = await fetch(`${internalUrl}/token`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: options.clientId,
          code: String(request.query.code),
          redirect_uri: callbackUrl,
          code_verifier: pending.verifier,
        }),
      })
      const tokens = await tokenResponse.json()
      if (!tokenResponse.ok || !tokens.access_token) throw new Error(tokens.error_description || tokens.error || 'token_failed')

      // id_token 由服务端经 TLS 直接从 Auth 取得，按 OIDC 规范校验 iss / aud / nonce / exp 即可
      const idToken = decodeJwtPayload(tokens.id_token)
      const audience = Array.isArray(idToken.aud) ? idToken.aud : [idToken.aud]
      if (idToken.iss !== issuer || !audience.includes(options.clientId) || idToken.nonce !== pending.nonce
        || idToken.exp < Date.now() / 1000) {
        throw new Error('id_token 校验失败')
      }

      const userinfoResponse = await fetch(`${internalUrl}/me`, {
        headers: authHeaders({ Authorization: `Bearer ${tokens.access_token}` }),
      })
      const claims = await userinfoResponse.json()
      if (!userinfoResponse.ok || claims.sub !== idToken.sub) throw new Error('userinfo 获取失败')

      const user = await onLogin(claims)
      if (!user) return response.redirect(303, deniedPath)
      response.cookie(cookieName, sign({ user, idToken: tokens.id_token }, sessionTtl), cookieOptions(sessionTtl))
      response.redirect(303, safeReturnPath(pending.returnTo))
    } catch (error) {
      console.error('[atuo-auth] callback failed:', error?.message || error)
      response.redirect(303, `${afterLoginPath}${afterLoginPath.includes('?') ? '&' : '?'}login_error=failed`)
    }
  })

  router.get(`${basePath}/logout`, (request, response) => {
    const session = verify(parseCookies(request.headers.cookie)[cookieName])
    response.clearCookie(cookieName, { path: '/' })
    const url = new URL(`${issuer}/session/end`)
    url.searchParams.set('client_id', options.clientId)
    url.searchParams.set('post_logout_redirect_uri', `${appOrigin}/`)
    if (session?.idToken) url.searchParams.set('id_token_hint', session.idToken)
    response.redirect(302, url.toString())
  })

  router.get(`${basePath}/me`, (request, response) => {
    const user = getUser(request)
    if (!user) return response.status(401).json({ error: 'unauthorized', loginUrl: `${basePath}/login` })
    response.json(user)
  })

  return { router, getUser, requireUser, requireLogin }
}
