import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
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

  const { createAuthService } = await import(`../../auth/src/index.js?test=${Date.now()}`)
  const { app } = await createAuthService()
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`

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
  authorization.searchParams.set('code_challenge', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
  authorization.searchParams.set('code_challenge_method', 'S256')

  const authorizationResponse = await fetch(authorization, { redirect: 'manual' })
  assert.equal(authorizationResponse.status, 303)
  const interactionPath = authorizationResponse.headers.get('location')
  assert.match(interactionPath, /^\/auth\/interaction\//)
  const cookie = authorizationResponse.headers.getSetCookie().map((item) => item.split(';')[0]).join('; ')

  const interactionResponse = await fetch(`${baseUrl}${interactionPath}`, { headers: { Cookie: cookie } })
  assert.equal(interactionResponse.status, 200)
  const html = await interactionResponse.text()
  assert.match(html, /登录到 Aspace One/)
  assert.match(html, /等待配置企业应用参数/)
  assert.doesNotMatch(html, /name="password"/)
})
