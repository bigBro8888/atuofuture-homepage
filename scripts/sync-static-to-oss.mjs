#!/usr/bin/env node
/**
 * 把 dist 里的字体、内置图片同步到 OSS（website/static/...），站点 nginx 再把 /images、/assets/hero 跳转过去。
 * 只上传 OSS 上不存在或大小不同的文件；同时确保 bucket 允许跨域读取（字体需要）。
 *
 * 用法：npm run build && node scripts/sync-static-to-oss.mjs [--internal] [--dry-run]
 *   --internal  ECS 同地域内网上传，不占公网带宽
 */
import 'dotenv/config'
import OSS from 'ali-oss'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const DIRS = ['images', 'assets/hero', 'assets/fonts']
const KEY_PREFIX = 'website/static/'
const CONCURRENCY = 6

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const region = process.env.OSS_REGION || 'oss-cn-shanghai'

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
}

const client = new OSS({
  region,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  internal: args.has('--internal'),
  secure: true,
})

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await walk(full))
    else if (CONTENT_TYPES[path.extname(entry.name).toLowerCase()]) files.push(full)
  }
  return files
}

async function listRemote(prefix) {
  const sizes = new Map()
  let token
  do {
    const result = await client.listV2({ prefix, 'max-keys': 1000, 'continuation-token': token })
    for (const object of result.objects || []) sizes.set(object.name, Number(object.size))
    token = result.nextContinuationToken
  } while (token)
  return sizes
}

async function ensureCors() {
  const rule = {
    allowedOrigin: '*',
    allowedMethod: ['GET', 'HEAD'],
    allowedHeader: '*',
    exposeHeader: ['ETag', 'Content-Length'],
    maxAgeSeconds: '86400',
  }
  let rules = []
  try {
    rules = (await client.getBucketCORS(client.options.bucket)).rules || []
  } catch (error) {
    if (error.code !== 'NoSuchCORSConfiguration') throw error
  }
  const hasPublicGet = rules.some((item) => {
    const origins = [].concat(item.allowedOrigin || [])
    const methods = [].concat(item.allowedMethod || [])
    return origins.includes('*') && methods.includes('GET')
  })
  if (hasPublicGet) return 'unchanged'
  if (!dryRun) await client.putBucketCORS(client.options.bucket, [...rules, rule])
  return 'added'
}

async function main() {
  const files = (await Promise.all(DIRS.map((dir) => walk(path.join(distDir, dir))))).flat()
  if (!files.length) throw new Error('dist 中没有可同步的静态文件，请先执行 npm run build')

  const remote = await listRemote(KEY_PREFIX)
  const pending = []
  for (const file of files) {
    const rel = path.relative(distDir, file).split(path.sep).join('/')
    const key = `${KEY_PREFIX}${rel}`
    const { size } = await stat(file)
    if (remote.get(key) !== size) pending.push({ file, key, size })
  }

  console.log(`静态文件 ${files.length} 个，需上传 ${pending.length} 个${dryRun ? '（dry-run）' : ''}`)
  let done = 0
  const queue = [...pending]
  async function worker() {
    while (queue.length) {
      const item = queue.shift()
      const ext = path.extname(item.file).toLowerCase()
      if (!dryRun) {
        await client.put(item.key, item.file, {
          headers: {
            'Content-Type': CONTENT_TYPES[ext],
            'Cache-Control': ext === '.woff2' ? 'public, max-age=31536000, immutable' : 'public, max-age=604800',
            'x-oss-object-acl': 'public-read',
          },
        })
      }
      done += 1
      console.log(`  [${done}/${pending.length}] ${item.key} (${Math.round(item.size / 1024)} KB)`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  console.log(`OSS 跨域读取规则：${await ensureCors()}`)
}

main().catch((error) => {
  console.error('同步失败：', error.message || error)
  process.exit(1)
})
