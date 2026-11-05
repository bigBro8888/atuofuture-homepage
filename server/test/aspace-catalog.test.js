import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

test('admin can publish Aspace categories and app assignments', async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'atuo-aspace-catalog-test-'))
  process.env.NODE_ENV = 'test'
  process.env.DATA_FILE = path.join(directory, 'store.json')
  process.env.UPLOAD_DIR = path.join(directory, 'uploads')
  process.env.ADMIN_EMAIL = 'admin@example.com'
  process.env.ADMIN_PASSWORD = 'TestPassword123!'
  process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters'

  const { app } = await import(`../src/index.js?aspace-catalog-test=${Date.now()}`)
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  context.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  })

  const initialResponse = await fetch(`${baseUrl}/api/public/aspace/catalog`)
  assert.equal(initialResponse.status, 200)
  const initial = (await initialResponse.json()).catalog
  assert.equal(initial.categories.length, 9)
  assert.equal(initial.apps.length, 22)
  assert.ok(initial.apps.every((app) => 'image' in app && 'description' in app && 'name' in app && 'url' in app))
  assert.equal(initial.apps.find((item) => item.id === 'visitor-booking').url, 'http://47.103.102.65:18181/')

  const unauthorized = await fetch(`${baseUrl}/api/admin/aspace/catalog`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ catalog: initial }),
  })
  assert.equal(unauthorized.status, 401)

  const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'TestPassword123!' }),
  })
  const cookie = loginResponse.headers.get('set-cookie').split(';')[0]
  const meeting = initial.categories.find((category) => category.id === 'meeting')
  meeting.label = '智慧会议'
  meeting.iconUrl = '/api/public/uploads/images/meeting-icon.png'
  initial.categories = [
    meeting,
    ...initial.categories.filter((category) => category.id !== 'meeting'),
  ]
  const visitor = initial.apps.find((item) => item.id === 'visitor-booking')
  visitor.category = 'meeting'
  visitor.name = '访客邀约'
  visitor.description = '一键邀约与到访通行'
  visitor.image = '/images/aspace-one/app-visitor.jpg'

  visitor.url = 'javascript:alert(1)'
  const invalidUrlResponse = await fetch(`${baseUrl}/api/admin/aspace/catalog`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ catalog: initial }),
  })
  assert.equal(invalidUrlResponse.status, 400)
  visitor.url = 'https://visitor.example.com/invite'

  const updateResponse = await fetch(`${baseUrl}/api/admin/aspace/catalog`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ catalog: initial }),
  })
  assert.equal(updateResponse.status, 200)

  const published = (await (await fetch(`${baseUrl}/api/public/aspace/catalog`)).json()).catalog
  assert.equal(published.categories[0].id, 'meeting')
  assert.equal(published.categories[0].label, '智慧会议')
  assert.equal(published.categories[0].iconUrl, '/api/public/uploads/images/meeting-icon.png')
  const publishedVisitor = published.apps.find((item) => item.id === 'visitor-booking')
  assert.equal(publishedVisitor.category, 'meeting')
  assert.equal(publishedVisitor.name, '访客邀约')
  assert.equal(publishedVisitor.description, '一键邀约与到访通行')
  assert.equal(publishedVisitor.image, '/images/aspace-one/app-visitor.jpg')
  assert.equal(publishedVisitor.url, 'https://visitor.example.com/invite')

  const putCatalog = (catalog) => fetch(`${baseUrl}/api/admin/aspace/catalog`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ catalog }),
  })
  const badIdResponse = await putCatalog({ ...published, apps: [...published.apps, { id: 'hack', name: 'x', category: 'meeting' }] })
  assert.equal(badIdResponse.status, 400)

  const customApp = { id: 'custom-abc123', name: '新应用', category: 'meeting', image: '', description: '自定义', url: '/custom-app/' }
  assert.equal((await putCatalog({ ...published, apps: [...published.apps, customApp] })).status, 200)
  const withCustom = (await (await fetch(`${baseUrl}/api/public/aspace/catalog`)).json()).catalog
  assert.equal(withCustom.apps.length, 23)
  assert.deepEqual(withCustom.apps.at(-1), customApp)

  assert.equal((await putCatalog({ ...withCustom, apps: withCustom.apps.filter((item) => item.id !== customApp.id) })).status, 200)
  const afterDelete = (await (await fetch(`${baseUrl}/api/public/aspace/catalog`)).json()).catalog
  assert.equal(afterDelete.apps.length, 22)

  const builtInRemoved = withCustom.apps.filter((item) => item.id !== 'screen')
  assert.equal((await putCatalog({ ...withCustom, apps: builtInRemoved })).status, 200)
  const builtInKept = (await (await fetch(`${baseUrl}/api/public/aspace/catalog`)).json()).catalog
  assert.ok(builtInKept.apps.some((item) => item.id === 'screen'))
})
