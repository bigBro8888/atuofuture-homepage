import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'

test('serves OIDC discovery and a secure unified login interaction', async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'atuo-unified-auth-'))
  process.env.NODE_ENV = 'test'
  process.env.AUTH_PUBLIC_ORIGIN = 'http://127.0.0.1:8788'
  process.env.AUTH_PORTAL_ORIGIN = 'http://127.0.0.1:5173'
  process.env.AUTH_ISSUER = 'http://127.0.0.1:8788/auth'
  process.env.AUTH_COOKIE_KEYS = 'test-cookie-key-one-32-characters,test-cookie-key-two-32-characters'
  process.env.AUTH_DATA_FILE = path.join(directory, 'users.json')
  process.env.AUTH_OIDC_DATA_FILE = path.join(directory, 'oidc.json')
  process.env.AUTH_JWKS_FILE = path.join(directory, 'jwks.json')
  process.env.AUTH_PASSWORD_LOGIN_ENABLED = 'true'

  const { createAuthService } = await import(`../../auth/src/index.js?test=${Date.now()}`)
  const { app } = await createAuthService()
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`
  const cookieJar = new Map()
  const captureCookies = (headers) => {
    headers.getSetCookie().forEach((item) => {
      const [pair] = item.split(';')
      const separator = pair.indexOf('=')
      cookieJar.set(pair.slice(0, separator), pair.slice(separator + 1))
    })
  }
  const cookieHeader = () => [...cookieJar].map(([name, value]) => `${name}=${value}`).join('; ')

  context.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  })

  const discoveryResponse = await fetch(`${baseUrl}/auth/.well-known/openid-configuration`)
  assert.equal(discoveryResponse.status, 200)
  const discovery = await discoveryResponse.json()
  assert.equal(discovery.issuer, 'http://127.0.0.1:8788/auth')
  assert.ok(discovery.code_challenge_methods_supported.includes('S256'))
  assert.equal(discovery.authorization_endpoint, `${baseUrl}/auth/auth`)

  const authorization = new URL(`${baseUrl}/auth/auth`)
  authorization.searchParams.set('client_id', 'aspace-one')
  authorization.searchParams.set('redirect_uri', 'http://127.0.0.1:5173/aspace-one/auth/callback')
  authorization.searchParams.set('response_type', 'code')
  authorization.searchParams.set('scope', 'openid profile')
  authorization.searchParams.set('state', 'state-for-test')
  authorization.searchParams.set('nonce', 'nonce-for-test')
  const verifier = 'ordinary-login-test-verifier-with-more-than-forty-three-characters'
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  authorization.searchParams.set('code_challenge', challenge)
  authorization.searchParams.set('code_challenge_method', 'S256')

  const authorizationResponse = await fetch(authorization, { redirect: 'manual' })
  assert.equal(authorizationResponse.status, 303)
  captureCookies(authorizationResponse.headers)
  const interactionPath = authorizationResponse.headers.get('location')
  assert.match(interactionPath, /^\/auth\/interaction\//)

  const interactionResponse = await fetch(`${baseUrl}${interactionPath}`, { headers: { Cookie: cookieHeader() } })
  assert.equal(interactionResponse.status, 200)
  const html = await interactionResponse.text()
  assert.match(html, /登录到 Aspace空间智能/)
  assert.doesNotMatch(html, /使用钉钉登录|使用微信登录|企业 OA|短信验证码/)
  assert.match(html, /name="password"/)
  assert.doesNotMatch(html, /name="name"/)

  const registrationPage = await fetch(`${baseUrl}${interactionPath}?mode=register`, {
    headers: { Cookie: cookieHeader() },
  })
  assert.equal(registrationPage.status, 200)
  const registrationHtml = await registrationPage.text()
  assert.match(registrationHtml, /注册普通账号/)
  assert.match(registrationHtml, /name="name"/)
  assert.doesNotMatch(registrationHtml, /使用微信登录/)

  const registerResponse = await fetch(`${baseUrl}${interactionPath}/password`, {
    method: 'POST',
    headers: {
      Cookie: cookieHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      action: 'register',
      name: '测试用户',
      account: 'test-user',
      password: 'test-password-123',
    }),
    redirect: 'manual',
  })
  assert.equal(registerResponse.status, 303)
  captureCookies(registerResponse.headers)
  let nextUrl = new URL(registerResponse.headers.get('location'), baseUrl)
  let callback
  for (let index = 0; index < 5; index += 1) {
    if (nextUrl.origin + nextUrl.pathname === 'http://127.0.0.1:5173/aspace-one/auth/callback') {
      callback = nextUrl
      break
    }
    const resumeResponse = await fetch(nextUrl, {
      headers: { Cookie: cookieHeader() },
      redirect: 'manual',
    })
    assert.equal(resumeResponse.status, 303)
    captureCookies(resumeResponse.headers)
    nextUrl = new URL(resumeResponse.headers.get('location'), baseUrl)
  }
  assert.ok(callback)
  assert.equal(callback.origin + callback.pathname, 'http://127.0.0.1:5173/aspace-one/auth/callback')
  assert.equal(callback.searchParams.get('state'), 'state-for-test')
  assert.ok(callback.searchParams.get('code'))

  const tokenResponse = await fetch(`${baseUrl}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'aspace-one',
      redirect_uri: 'http://127.0.0.1:5173/aspace-one/auth/callback',
      code: callback.searchParams.get('code'),
      code_verifier: verifier,
    }),
  })
  assert.equal(tokenResponse.status, 200)
  const tokens = await tokenResponse.json()
  assert.ok(tokens.access_token)
})
