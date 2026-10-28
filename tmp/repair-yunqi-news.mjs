import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { sanitizeNewsHtml, plainTextFromHtml } from '../src/lib/sanitize-news-html.js'

const storePath = process.argv[2] || './server/data/store.json'
const htmlPath = process.argv[3] || './scripts/yunqi-body.html'
const newsId = process.argv[4] || 'n-mvjdpvar4l4w'

const rawHtml = readFileSync(htmlPath, 'utf8')
const bodyHtml = sanitizeNewsHtml(rawHtml)
const body = plainTextFromHtml(bodyHtml)

if (!/border-top:8px solid #17385f/.test(bodyHtml) || !/<section style=/.test(bodyHtml)) {
  console.error('sanitize failed to keep layout styles')
  console.error(bodyHtml.slice(0, 400))
  process.exit(1)
}

copyFileSync(storePath, `${storePath}.bak.yunqi-${Date.now()}`)
const store = JSON.parse(readFileSync(storePath, 'utf8'))

const targets = []
function walk(node) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    node.forEach((item) => {
      if (item && typeof item === 'object' && item.id === newsId) targets.push(item)
      walk(item)
    })
    return
  }
  Object.values(node).forEach(walk)
}
walk(store)

if (!targets.length) {
  console.error('news id not found')
  process.exit(1)
}

for (const item of targets) {
  item.bodyHtml = bodyHtml
  item.body = body
}

writeFileSync(storePath, JSON.stringify(store))
console.log(JSON.stringify({
  ok: true,
  touched: targets.length,
  hasSection: /<section style=/.test(bodyHtml),
  hasBorder: /border-top:8px solid #17385f/.test(bodyHtml),
  hasLeadBg: /background:#f1f5fa/.test(bodyHtml),
  htmlLength: bodyHtml.length,
}))
