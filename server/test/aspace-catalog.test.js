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
  assert.ok(initial.apps.every((app) => 'image' in app && 'description' in app && 'name' in app))

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
})
