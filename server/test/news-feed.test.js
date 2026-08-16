import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { formatNewsBody } from '../../src/lib/format-news-body.js'
import { sanitizeNewsHtml } from '../../src/lib/sanitize-news-html.js'

test('formats pasted news body into headings and paragraphs', () => {
  const sections = formatNewsBody('一、标题\n\n第一段内容。\n\n短标题\n\n第二段。')
  assert.equal(sections[0].heading, '一、标题')
  assert.equal(sections[0].paragraphs[0], '第一段内容。')
  assert.equal(sections[0].showCover, true)
  assert.equal(sections[1].heading, '短标题')
})

test('keeps tables and images but strips scripts from news html', () => {
  const html = sanitizeNewsHtml('<p>正文</p><table><tr><td>08</td></tr></table><img src="https://example.com/a.jpg" onerror="alert(1)"><script>alert(1)</script>')
  assert.match(html, /<table>/)
  assert.match(html, /<img src="https:\/\/example.com\/a.jpg">/)
  assert.doesNotMatch(html, /script/i)
  assert.doesNotMatch(html, /onerror/)
})

test('publishes news feed articles to the public API', async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'atuo-news-test-'))
  process.env.NODE_ENV = 'test'
  process.env.DATA_FILE = path.join(directory, 'store.json')
  process.env.UPLOAD_DIR = path.join(directory, 'uploads')
  process.env.ADMIN_EMAIL = 'admin@example.com'
  process.env.ADMIN_PASSWORD = 'TestPassword123!'
  process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters'

  const { app } = await import(`../src/index.js?news-test=${Date.now()}`)
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

  const adminResponse = await fetch(`${baseUrl}/api/admin/pages/news-feed`, { headers: { Cookie: cookie } })
  const { page } = await adminResponse.json()
  const draftContent = structuredClone(page.draftContent)
  draftContent.items.unshift({
    title: '测试新闻标题',
    summary: '简介',
    date: '2026-08-15',
    author: '编辑',
    category: '产品更新',
    cover: '/assets/hero/capability-ai.jpg',
    tags: ['测试'],
    body: '一、导语\n\n这是正文第一段。',
  })

  const draftResponse = await fetch(`${baseUrl}/api/admin/pages/news-feed/draft`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: draftContent }),
  })
  assert.equal(draftResponse.status, 200)

  const beforePublish = await fetch(`${baseUrl}/api/public/pages/news-feed`)
  const before = await beforePublish.json()
  assert.equal(before.content.items[0].title !== '测试新闻标题', true)

  const publishResponse = await fetch(`${baseUrl}/api/admin/pages/news-feed/publish`, {
    method: 'POST',
    headers: { Cookie: cookie },
  })
  assert.equal(publishResponse.status, 200)

  const afterPublish = await fetch(`${baseUrl}/api/public/pages/news-feed`)
  const after = await afterPublish.json()
  assert.equal(after.content.items[0].title, '测试新闻标题')
  assert.equal(after.content.items[0].sections[0].heading, '一、导语')
})
