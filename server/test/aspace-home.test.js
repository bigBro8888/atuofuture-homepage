import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

test('admin can publish Aspace home content', async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'atuo-aspace-home-test-'))
  process.env.NODE_ENV = 'test'
  process.env.DATA_FILE = path.join(directory, 'store.json')
  process.env.UPLOAD_DIR = path.join(directory, 'uploads')
  process.env.ADMIN_EMAIL = 'admin@example.com'
  process.env.ADMIN_PASSWORD = 'TestPassword123!'
  process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters'

  const { app } = await import(`../src/index.js?aspace-home-test=${Date.now()}`)
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  context.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  })

  const initialResponse = await fetch(`${baseUrl}/api/public/aspace/home`)
  assert.equal(initialResponse.status, 200)
  const initial = (await initialResponse.json()).home
  assert.ok(initial.hero.title)
  assert.equal(initial.panorama.items.length, 5)
  assert.equal(initial.scenes.items.length, 4)
  assert.equal(initial.infra.stats.length, 4)

  const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'TestPassword123!' }),
  })
  const cookie = loginResponse.headers.get('set-cookie').split(';')[0]
  initial.hero.title = '智能空间\n一站直达'
  initial.infra.stats[0].value = '28'

  const updateResponse = await fetch(`${baseUrl}/api/admin/aspace/home`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ home: initial }),
  })
  assert.equal(updateResponse.status, 200)

  const published = (await (await fetch(`${baseUrl}/api/public/aspace/home`)).json()).home
  assert.equal(published.hero.title, '智能空间\n一站直达')
  assert.equal(published.infra.stats[0].value, '28')
})
