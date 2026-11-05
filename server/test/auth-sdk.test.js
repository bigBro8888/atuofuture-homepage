import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import express from 'express'

async function freePort() {
  const server = net.createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  await new Promise((resolve) => server.close(resolve))
  return port
}

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

/** 按 origin 分开保存 Cookie 的极简浏览器 */
function createBrowser() {
  const jars = new Map()
  const jar = (origin) => {
    if (!jars.has(origin)) jars.set(origin, new Map())
    return jars.get(origin)
  }
  async function request(url, init = {}) {
    const target = new URL(url)
    const cookies = [...jar(target.origin)].map(([name, value]) => `${name}=${value}`).join('; ')
    const response = await fetch(target, {
      ...init,
      redirect: 'manual',
      headers: { ...(init.headers || {}), ...(cookies ? { Cookie: cookies } : {}) },
    })
    for (const item of response.headers.getSetCookie()) {
      const [pair, ...attributes] = item.split(';')
      const index = pair.indexOf('=')
      const name = pair.slice(0, index).trim()
      const value = pair.slice(index + 1).trim()
      const expired = attributes.some((attribute) => /expires=Thu, 01 Jan 1970/i.test(attribute)) || value === ''
      if (expired) jar(target.origin).delete(name)
      else jar(target.origin).set(name, value)
    }
    return response
  }
  /** 一路跟随跳转，直到地址满足 stop 或不再跳转 */
  async function follow(url, stop, init) {
    let current = new URL(url)
    let response = await request(current, init)
    for (let index = 0; index < 12; index += 1) {
      if (response.status < 300 || response.status >= 400) return { url: current, response }
      current = new URL(response.headers.get('location'), current)
      if (stop?.(current)) return { url: current, response }
      response = await request(current)
    }
    throw new Error(`跳转次数过多：${current}`)
  }
  return { request, follow }
}

test('browser and express SDKs complete unified login, SSO and logout', async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'atuo-auth-sdk-'))
  const authPort = await freePort()
  const appPort = await freePort()
  const issuer = `http://127.0.0.1:${authPort}/auth`
  const spaOrigin = 'http://127.0.0.1:5199'
  const appOrigin = `http://127.0.0.1:${appPort}`

  process.env.NODE_ENV = 'test'
  process.env.AUTH_PUBLIC_ORIGIN = `http://127.0.0.1:${authPort}`
  process.env.AUTH_PORTAL_ORIGIN = 'http://127.0.0.1:5173'
  process.env.AUTH_ISSUER = issuer
  process.env.AUTH_COOKIE_KEYS = 'test-cookie-key-one-32-characters,test-cookie-key-two-32-characters'
  process.env.AUTH_DATA_FILE = path.join(directory, 'users.json')
  process.env.AUTH_OIDC_DATA_FILE = path.join(directory, 'oidc.json')
  process.env.AUTH_JWKS_FILE = path.join(directory, 'jwks.json')
  process.env.AUTH_PASSWORD_LOGIN_ENABLED = 'true'
  process.env.AUTH_EXTRA_CLIENTS_JSON = JSON.stringify([
    {
      client_id: 'test-spa',
      client_name: '测试前端系统',
      redirect_uris: [`${spaOrigin}/auth/callback`],
      post_logout_redirect_uris: [`${spaOrigin}/`],
    },
    {
      client_id: 'test-backend',
      client_name: '测试后端系统',
      redirect_uris: [`${appOrigin}/auth/callback`],
      post_logout_redirect_uris: [`${appOrigin}/`],
    },
  ])

  const { createAuthService } = await import(`../../auth/src/index.js?sdk=${Date.now()}`)
  const { app: authApp } = await createAuthService()
  const authServer = authApp.listen(authPort, '127.0.0.1')
  await new Promise((resolve) => authServer.once('listening', resolve))

  const { createAtuoAuth: createExpressAuth } = await import('../../auth/sdk/atuo-auth-express.js')
  const backendAuth = createExpressAuth({
    clientId: 'test-backend',
    appOrigin,
    issuer,
    sessionSecret: 'test-session-secret-with-at-least-32-chars',
    onLogin: (claims) => ({ id: claims.sub, name: claims.name, idp: claims.idp }),
  })
  const backendApp = express()
  backendApp.use(backendAuth.router)
  backendApp.get('/private', backendAuth.requireLogin, (request, response) => response.json(request.atuoUser))
  backendApp.get('/api/data', backendAuth.requireUser, (request, response) => response.json({ ok: true, user: request.atuoUser.id }))
  const backendServer = backendApp.listen(appPort, '127.0.0.1')
  await new Promise((resolve) => backendServer.once('listening', resolve))

  context.after(async () => {
    await new Promise((resolve) => authServer.close(resolve))
    await new Promise((resolve) => backendServer.close(resolve))
    await rm(directory, { recursive: true, force: true })
  })

  const browser = createBrowser()

  // ---- 浏览器端 SDK：首次登录（注册普通账号） ----
  const location = {
    href: `${spaOrigin}/dashboard?tab=1`,
    get origin() { return new URL(this.href).origin },
    get pathname() { return new URL(this.href).pathname },
    get search() { return new URL(this.href).search },
    get hash() { return new URL(this.href).hash },
    assign(url) { this.assigned = url },
  }
  globalThis.window = { location }
  Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage(), configurable: true })
  Object.defineProperty(globalThis, 'sessionStorage', { value: memoryStorage(), configurable: true })

  const { createAtuoAuth: createBrowserAuth } = await import('../../auth/sdk/atuo-auth-browser.js')
  const spaAuth = createBrowserAuth({ clientId: 'test-spa', issuer })
  assert.equal(await spaAuth.getUser(), null)

  await spaAuth.login({ prompt: 'login' })
  const authorize = new URL(location.assigned)
  assert.equal(authorize.origin + authorize.pathname, `${issuer}/auth`)
  assert.equal(authorize.searchParams.get('redirect_uri'), `${spaOrigin}/auth/callback`)

  const interaction = await browser.follow(authorize, (url) => url.pathname.startsWith('/auth/interaction/'))
  assert.match(interaction.url.pathname, /^\/auth\/interaction\//)
  const loginPage = await browser.request(interaction.url)
  assert.match(await loginPage.text(), /登录 安墨客/)

  const spaCallback = await browser.follow(`${interaction.url}/password`, (url) => url.origin === spaOrigin, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ action: 'register', name: 'SDK 测试', account: 'sdk-user', password: 'sdk-password-123' }),
  })
  assert.equal(spaCallback.url.origin + spaCallback.url.pathname, `${spaOrigin}/auth/callback`)

  location.href = spaCallback.url.toString()
  assert.ok(spaAuth.isRedirectCallback())
  const result = await spaAuth.handleRedirectCallback()
  assert.equal(result.user.name, 'SDK 测试')
  assert.equal(result.user.idp, 'password')
  assert.equal(result.returnTo, '/dashboard?tab=1')
  assert.ok(spaAuth.getAccessToken())
  assert.equal((await spaAuth.getUser()).sub, result.user.sub)

  // ---- 后端 SDK：同一浏览器已登录统一 Auth，进入另一个系统无需再输密码 ----
  const unauthorized = await browser.request(`${appOrigin}/api/data`)
  assert.equal(unauthorized.status, 401)

  const backendLogin = await browser.follow(`${appOrigin}/private`, (url) => url.origin === appOrigin && url.pathname === '/private')
  assert.equal(backendLogin.url.pathname, '/private')
  const privatePage = await browser.request(backendLogin.url)
  assert.equal(privatePage.status, 200)
  const backendUser = await privatePage.json()
  assert.equal(backendUser.id, result.user.sub)
  assert.equal(backendUser.name, 'SDK 测试')

  const apiData = await browser.request(`${appOrigin}/api/data`)
  assert.deepEqual(await apiData.json(), { ok: true, user: result.user.sub })
  const me = await browser.request(`${appOrigin}/auth/me`)
  assert.equal((await me.json()).id, result.user.sub)

  // ---- 退出 ----
  const backendLogout = await browser.request(`${appOrigin}/auth/logout`)
  assert.equal(backendLogout.status, 302)
  const endSession = new URL(backendLogout.headers.get('location'))
  assert.equal(endSession.origin + endSession.pathname, `${issuer}/session/end`)
  assert.ok(endSession.searchParams.get('id_token_hint'))
  assert.equal((await browser.request(endSession)).status, 200)
  assert.equal((await browser.request(`${appOrigin}/api/data`)).status, 401)

  spaAuth.logout()
  const spaEndSession = new URL(location.assigned)
  assert.equal(spaEndSession.origin + spaEndSession.pathname, `${issuer}/session/end`)
  assert.equal(spaEndSession.searchParams.get('post_logout_redirect_uri'), `${spaOrigin}/`)
  assert.equal((await browser.request(spaEndSession)).status, 200)
  assert.equal(await spaAuth.getUser(), null)
})
