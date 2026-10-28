import { readFileSync } from 'node:fs'

const store = JSON.parse(readFileSync('/var/www/mydoc/atuofuture/server/data/store.json', 'utf8'))
console.log('topKeys', Object.keys(store))
if (store.pages) console.log('pageKeys', Object.keys(store.pages))
const raw = JSON.stringify(store)
console.log('hasNewsId', raw.includes('n-mvjdpvar4l4w'))
const match = raw.match(/"pageKey"\s*:\s*"news-feed"/)
console.log('hasPageKeyNewsFeed', Boolean(match))
// try common shapes
const candidates = []
function walk(node, path = '') {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    if (node.some((item) => item && item.id === 'n-mvjdpvar4l4w')) candidates.push(path)
    node.forEach((item, index) => walk(item, `${path}[${index}]`))
    return
  }
  for (const [key, value] of Object.entries(node)) {
    walk(value, path ? `${path}.${key}` : key)
  }
}
walk(store)
console.log('paths', candidates.slice(0, 20))
