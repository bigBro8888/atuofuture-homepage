import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

test('authenticates Aspace users and scopes organization applications', async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'atuo-aspace-identity-'))
  process.env.NODE_ENV = 'test'
  process.env.DATA_FILE = path.join(directory, 'store.json')
  process.env.UPLOAD_DIR = path.join(directory, 'uploads')
  process.env.ADMIN_EMAIL = 'portal@example.com'
  process.env.ADMIN_PASSWORD = 'PortalPassword123!'
  process.env.ASO_PORTAL_NAME = '测试用户'
  process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters'
  process.env.ASO_POSTER_SSO_SECRET = 'poster-test-secret'

  const { app } = await import(`../src/index.js?aspace-identity=${Date.now()}`)
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  context.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  })

  const anonymousMe = await fetch(`${baseUrl}/api/public/aspace/auth/me`)
  assert.equal(anonymousMe.status, 401)

  const login = await fetch(`${baseUrl}/api/public/aspace/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'portal@example.com', password: 'PortalPassword123!' }),
  })
  assert.equal(login.status, 200)
  const cookie = login.headers.get('set-cookie').split(';')[0]
  const loginBody = await login.json()
  assert.equal(loginBody.user.name, '测试用户')
  assert.equal(loginBody.user.activeOrganization.id, 'wangli')
  assert.equal(loginBody.user.passwordHash, undefined)

  const switchOrganization = await fetch(`${baseUrl}/api/public/aspace/auth/organization`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ organizationId: 'east-showroom' }),
  })
  assert.equal(switchOrganization.status, 200)
  assert.deepEqual((await switchOrganization.json()).user.activeOrganization.appIds, ['screen', 'poster', 'album'])

  const forbiddenAap = await fetch(`${baseUrl}/api/public/aspace/sso/embed/aap`, {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: '{}',
  })
  assert.equal(forbiddenAap.status, 403)

  const poster = await fetch(`${baseUrl}/api/public/aspace/sso/poster`, {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: '{}',
  })
  assert.equal(poster.status, 200)
  assert.match((await poster.json()).embedUrl, /aso_sso=/)

  const activity = await fetch(`${baseUrl}/api/public/aspace/activity`, {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId: 'poster', appName: 'AI画报', feature: '新建画报' }),
  })
  assert.equal(activity.status, 201)

  const latest = await fetch(`${baseUrl}/api/public/aspace/activity/latest`, { headers: { Cookie: cookie } })
  assert.equal((await latest.json()).activity.feature, '新建画报')
})
