import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

test('keeps home draft private until it is published', async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'atuo-home-test-'))
  process.env.NODE_ENV = 'test'
  process.env.DATA_FILE = path.join(directory, 'store.json')
  process.env.UPLOAD_DIR = path.join(directory, 'uploads')
  process.env.ADMIN_EMAIL = 'admin@example.com'
  process.env.ADMIN_PASSWORD = 'TestPassword123!'
  process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters'

  const { app } = await import(`../src/index.js?home-test=${Date.now()}`)
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}`

  context.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  })

  const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'TestPassword123!' }),
  })
  assert.equal(loginResponse.status, 200)
  const cookie = loginResponse.headers.get('set-cookie').split(';')[0]

  const adminResponse = await fetch(`${baseUrl}/api/admin/pages/home`, { headers: { Cookie: cookie } })
  const { page } = await adminResponse.json()
  const originalTitle = page.publishedContent.hero.title
  const draftContent = structuredClone(page.draftContent)
  draftContent.hero.title = '尚未发布的首页标题'

  const draftResponse = await fetch(`${baseUrl}/api/admin/pages/home/draft`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: draftContent }),
  })
  assert.equal(draftResponse.status, 200)

  const publicDraftResponse = await fetch(`${baseUrl}/api/public/pages/home`)
  const publicDraft = await publicDraftResponse.json()
  assert.equal(publicDraft.content.hero.title, originalTitle)

  const publishResponse = await fetch(`${baseUrl}/api/admin/pages/home/publish`, {
    method: 'POST',
    headers: { Cookie: cookie },
  })
  assert.equal(publishResponse.status, 200)

  const publicPublishedResponse = await fetch(`${baseUrl}/api/public/pages/home`)
  const publicPublished = await publicPublishedResponse.json()
  assert.equal(publicPublished.content.hero.title, '尚未发布的首页标题')
})
