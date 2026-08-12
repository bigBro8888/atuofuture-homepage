import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

test('publishes download page feature cards and button labels edited in the admin panel', async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'atuo-features-test-'))
  process.env.NODE_ENV = 'test'
  process.env.DATA_FILE = path.join(directory, 'store.json')
  process.env.UPLOAD_DIR = path.join(directory, 'uploads')
  process.env.ADMIN_EMAIL = 'admin@example.com'
  process.env.ADMIN_PASSWORD = 'TestPassword123!'
  process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters'

  const { app } = await import(`../src/index.js?features-test=${Date.now()}`)
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  context.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  })

  const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'TestPassword123!' }),
  })
  const cookie = loginResponse.headers.get('set-cookie').split(';')[0]

  const { app: current } = await (await fetch(`${baseUrl}/api/admin/app`, { headers: { Cookie: cookie } })).json()
  assert.equal(current.features.items.length, 4)

  const updateResponse = await fetch(`${baseUrl}/api/admin/app`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...current,
      published: true,
      buttons: { androidLabel: '安卓版 {version}', iosLabel: '', switchToAndroid: '换到安卓版', switchToAndroidTag: '' },
      features: {
        title: '四项能力，重新定义办公',
        subtitle: '按需组合，覆盖全场景',
        items: [
          { icon: 'lightbulb', title: '灯光控制', description: '一键调节办公区照明。' },
          {},
          { icon: 'bolt', title: '能耗管理', description: '分项计量与节能策略。' },
          {},
        ],
      },
    }),
  })
  assert.equal(updateResponse.status, 200)

  const publicConfig = await (await fetch(`${baseUrl}/api/public/apps/artink`)).json()
  assert.equal(publicConfig.features.title, '四项能力，重新定义办公')
  assert.equal(publicConfig.features.items[0].icon, 'lightbulb')
  assert.equal(publicConfig.features.items[2].title, '能耗管理')
  assert.equal(publicConfig.features.items[1].title, current.features.items[1].title)
  assert.equal(publicConfig.buttons.androidLabel, '安卓版 {version}')
  assert.equal(publicConfig.buttons.switchToAndroid, '换到安卓版')
  assert.equal(publicConfig.buttons.iosLabel, current.buttons.iosLabel)
  // 角标可以被清空，而文案留空时回退到默认值。
  assert.equal(publicConfig.buttons.switchToAndroidTag, '')
  assert.equal(publicConfig.buttons.switchToIosTag, current.buttons.switchToIosTag)
})
