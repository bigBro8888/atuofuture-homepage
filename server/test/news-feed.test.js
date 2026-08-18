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

test('strips pasted bold and keeps only editor text color', () => {
  const html = sanitizeNewsHtml('<p><strong>粗体</strong><span style="color:#ff0000;font-size:48px">红字</span></p>')
  assert.doesNotMatch(html, /strong|b>/i)
  assert.match(html, /style="color:#ff0000"/)
  assert.doesNotMatch(html, /font-size/)
  const pasted = sanitizeNewsHtml('<p><b>粗</b><span style="color:#ff0000">红</span></p>', { keepColor: false })
  assert.doesNotMatch(pasted, /style=/)
})

test('keeps in-article video embeds and file players', () => {
  const html = sanitizeNewsHtml('<p>看</p><figure class="sx-news-video"><iframe src="https://www.youtube.com/watch?v=dQw4w9wgxcQ"></iframe></figure>')
  assert.match(html, /youtube.com\/embed\/dQw4w9wgxcQ/)
  const file = sanitizeNewsHtml('<video src="/api/public/uploads/videos/demo.mp4" controls></video>')
  assert.match(file, /\/api\/public\/uploads\/videos\/demo.mp4/)
  assert.match(file, /\scontrols(?:\s|>)/)
})

test('keeps wezhan mp4 query urls and hoists video out of paragraphs', () => {
  const src = 'https://video.2020.wezhan.cn/a06b3ba6a58971f081af6632b68f0102/clip-sd.mp4?auth_key=abc-0-def'
  const html = sanitizeNewsHtml(`<p><span><figure class="sx-news-video" data-news-video="1"><video src="${src}" preload="metadata"></video></figure><p><br></p></span></p>`)
  assert.match(html, /auth_key=abc-0-def/)
  assert.match(html, /<figure class="sx-news-video"/)
  assert.match(html, /\scontrols(?:\s|>)/)
  assert.match(html, /playsinline/)
  assert.doesNotMatch(html, /<p><span><figure/)
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
  draftContent.items.unshift({
    type: 'video',
    title: '测试视频新闻',
    category: '公司动态',
    cover: '/assets/hero/capability-ai.jpg',
    videoUrl: '/api/public/uploads/videos/demo.mp4',
  })

  const draftResponse = await fetch(`${baseUrl}/api/admin/pages/news-feed/draft`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: draftContent }),
  })
  assert.equal(draftResponse.status, 200)

  const beforePublish = await fetch(`${baseUrl}/api/public/pages/news-feed`)
  const before = await beforePublish.json()
  assert.equal(before.content.items[0].title !== '测试视频新闻', true)

  const publishResponse = await fetch(`${baseUrl}/api/admin/pages/news-feed/publish`, {
    method: 'POST',
    headers: { Cookie: cookie },
  })
  assert.equal(publishResponse.status, 200)

  const afterPublish = await fetch(`${baseUrl}/api/public/pages/news-feed`)
  const after = await afterPublish.json()
  assert.equal(after.content.items[0].type, 'video')
  assert.equal(after.content.items[0].title, '测试视频新闻')
  assert.equal(after.content.items[0].videoUrl, '/api/public/uploads/videos/demo.mp4')
  assert.equal(after.content.items[1].title, '测试新闻标题')
  assert.equal(after.content.items[1].sections[0].heading, '一、导语')
})
