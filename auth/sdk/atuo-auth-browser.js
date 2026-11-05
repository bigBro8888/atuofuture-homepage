/**
 * 安托未来统一登录 · 浏览器端接入（单页应用 / 纯前端站点）
 *
 * 授权码 + PKCE，公共客户端，不需要 client_secret，无第三方依赖。
 * 复制本文件到项目中使用，接入步骤见 docs/统一Auth接入说明.md。
 */

const DEFAULT_ISSUER = 'https://ai.atuofuture.com/auth'

function base64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function randomString(size = 32) {
  return base64Url(crypto.getRandomValues(new Uint8Array(size)))
}

async function pkceChallenge(verifier) {
  // crypto.subtle 只在 HTTPS 或 localhost 下可用
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64Url(new Uint8Array(digest))
}

function decodeJwtPayload(token) {
  const part = String(token || '').split('.')[1]
  if (!part) return null
  const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(decodeURIComponent(Array.from(json, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')))
}

function safeReturnPath(value, fallback) {
  const path = String(value || '')
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return fallback
  return path
}

/**
 * @param {object} options
 * @param {string} options.clientId 在统一 Auth 登记的 client_id
 * @param {string} [options.issuer] 默认 https://ai.atuofuture.com/auth
 * @param {string} [options.redirectUri] 默认 {当前站点}/auth/callback，必须与登记的回调完全一致
 * @param {string} [options.postLogoutRedirectUri] 默认 {当前站点}/，必须已登记
 * @param {string} [options.scope] 默认 'openid profile email'
 * @param {string} [options.storageKey] 本地存储前缀，默认 atuo-auth:{clientId}
 * @param {string} [options.defaultReturnTo] 回调后找不到原页面时去哪里，默认 '/'
 */
export function createAtuoAuth(options) {
  if (!options?.clientId) throw new Error('createAtuoAuth 需要 clientId')
  const issuer = String(options.issuer || DEFAULT_ISSUER).replace(/\/$/, '')
  const origin = window.location.origin
  const clientId = options.clientId
  const redirectUri = options.redirectUri || `${origin}/auth/callback`
  const postLogoutRedirectUri = options.postLogoutRedirectUri || `${origin}/`
  const scope = options.scope || 'openid profile email'
  const storageKey = options.storageKey || `atuo-auth:${clientId}`
  const defaultReturnTo = options.defaultReturnTo || '/'
  const tokenKey = `${storageKey}:tokens`
  const pendingKey = `${storageKey}:pending`

  const readTokens = () => {
    try {
      const tokens = JSON.parse(localStorage.getItem(tokenKey) || 'null')
      if (!tokens?.access_token) return null
      if (tokens.expires_at && tokens.expires_at <= Date.now()) return null
      return tokens
    } catch {
      return null
    }
  }

  const clearTokens = () => {
    localStorage.removeItem(tokenKey)
  }

  /**
   * 跳转到统一登录页。
   * prompt: 'login' 强制出现登录页；'none' 静默检查是否已在别的系统登录过（没登录会带 error=login_required 回来）。
   */
  async function login({ returnTo, prompt } = {}) {
    const verifier = randomString(32)
    const state = randomString(24)
    const nonce = randomString(24)
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
    sessionStorage.setItem(pendingKey, JSON.stringify({
      verifier,
      state,
      nonce,
      returnTo: safeReturnPath(returnTo || currentPath, defaultReturnTo),
    }))
    const url = new URL(`${issuer}/auth`)
    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      state,
      nonce,
      code_challenge: await pkceChallenge(verifier),
      code_challenge_method: 'S256',
      ...(prompt ? { prompt } : {}),
    }).toString()
    window.location.assign(url.toString())
  }

  /** 当前地址是否是登录回调页 */
  function isRedirectCallback() {
    const current = new URL(window.location.href)
    const expected = new URL(redirectUri)
    return current.origin === expected.origin && current.pathname === expected.pathname
      && (current.searchParams.has('code') || current.searchParams.has('error'))
  }

  /**
   * 在回调页调用：校验 state，用授权码换 token，返回 { user, returnTo }。
   * 用户取消或静默登录未命中时返回 { error, returnTo }，不抛异常。
   */
  async function handleRedirectCallback() {
    const params = new URLSearchParams(window.location.search)
    const pending = JSON.parse(sessionStorage.getItem(pendingKey) || 'null')
    sessionStorage.removeItem(pendingKey)
    const returnTo = safeReturnPath(pending?.returnTo, defaultReturnTo)
    if (params.get('error')) return { error: params.get('error'), errorDescription: params.get('error_description') || '', returnTo }
    const code = params.get('code')
    if (!code || !pending?.verifier || params.get('state') !== pending.state) {
      throw new Error('登录回调校验失败，请重新登录')
    }
    const response = await fetch(`${issuer}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code,
        code_verifier: pending.verifier,
        redirect_uri: redirectUri,
      }),
    })
    const tokens = await response.json().catch(() => ({}))
    if (!response.ok || !tokens.access_token) throw new Error(tokens.error_description || tokens.error || '无法完成登录')
    const idToken = decodeJwtPayload(tokens.id_token)
    if (!idToken || idToken.nonce !== pending.nonce || idToken.iss !== issuer) throw new Error('登录凭证校验失败')
    localStorage.setItem(tokenKey, JSON.stringify({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      expires_at: Date.now() + Number(tokens.expires_in || 3600) * 1000,
    }))
    const user = await getUser()
    if (!user) throw new Error('无法读取登录用户')
    return { user, returnTo }
  }

  /** 读取当前用户（统一 Auth 的 userinfo），未登录或已过期返回 null */
  async function getUser() {
    const tokens = readTokens()
    if (!tokens) return null
    const response = await fetch(`${issuer}/me`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: 'no-store',
    })
    if (!response.ok) {
      clearTokens()
      return null
    }
    return response.json()
  }

  /** 给自己的后端接口带上的 access token；后端可用它调统一 Auth 的 /me 校验身份 */
  function getAccessToken() {
    return readTokens()?.access_token || ''
  }

  /** 清掉本地登录态，并结束统一 Auth 会话（其它系统也会一起退出），然后回到 postLogoutRedirectUri */
  function logout() {
    const idToken = readTokens()?.id_token || ''
    clearTokens()
    const url = new URL(`${issuer}/session/end`)
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri)
    if (idToken) url.searchParams.set('id_token_hint', idToken)
    window.location.assign(url.toString())
  }

  return { login, isRedirectCallback, handleRedirectCallback, getUser, getAccessToken, logout, clearTokens }
}
