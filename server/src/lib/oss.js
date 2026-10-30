import OSS from 'ali-oss'
import { randomUUID } from 'node:crypto'
import { config } from '../config.js'

const REQUIRED = ['region', 'accessKeyId', 'accessKeySecret', 'bucket']

export function isOssConfigured() {
  return REQUIRED.every((key) => Boolean(config.oss?.[key]))
}

export function normalizeOssPrefix(prefix = config.oss?.prefix) {
  let value = String(prefix || 'website/').trim().replace(/^\/+/, '')
  if (value && !value.endsWith('/')) value += '/'
  return value || 'website/'
}

export function createOssClient() {
  const missing = REQUIRED.filter((key) => !config.oss?.[key])
  if (missing.length) {
    const error = new Error(`OSS 尚未配置：${missing.join(', ')}`)
    error.status = 503
    throw error
  }
  return new OSS({
    region: config.oss.region,
    accessKeyId: config.oss.accessKeyId,
    accessKeySecret: config.oss.accessKeySecret,
    bucket: config.oss.bucket,
    endpoint: config.oss.endpoint || undefined,
    secure: config.oss.useHttps !== false,
  })
}

/** @param {string} objectKey bucket 内完整对象键（含 prefix） */
export function publicUrlForObject(objectKey) {
  const key = String(objectKey || '').replace(/^\/+/, '')
  const base = String(config.oss.publicBaseUrl || '').replace(/\/$/, '')
  if (base) return `${base}/${key}`

  const bucket = config.oss.bucket
  let regionHost = ''
  if (config.oss.endpoint) {
    regionHost = String(config.oss.endpoint).replace(/^https?:\/\//i, '').replace(/\/$/, '')
  } else {
    const region = String(config.oss.region || 'oss-cn-shanghai').replace(/^\/+|\/+$/g, '')
    regionHost = region.includes('.') ? region : `${region}.aliyuncs.com`
  }

  const host = regionHost.startsWith(`${bucket}.`) ? regionHost : `${bucket}.${regionHost}`
  const protocol = config.oss.useHttps === false ? 'http' : 'https'
  return `${protocol}://${host}/${key}`
}

/**
 * 上传公开可读对象。
 * 完整路径 = `{OSS_PREFIX}{folder}/{filename}`，例如 website/news/xxx.jpg
 */
export async function uploadPublicObject({
  buffer,
  contentType,
  folder = 'news',
  filename,
  cacheControl = 'public, max-age=31536000, immutable',
}) {
  if (!buffer?.length) {
    const error = new Error('上传内容为空')
    error.status = 400
    throw error
  }
  const client = createOssClient()
  const prefix = normalizeOssPrefix()
  const safeFolder = String(folder || 'news')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9._/-]/g, '-') || 'news'
  const safeName = String(filename || `${Date.now()}-${randomUUID()}`)
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
  const objectKey = `${prefix}${safeFolder}/${safeName}`
  await client.put(objectKey, buffer, {
    headers: {
      'Content-Type': contentType || 'application/octet-stream',
      'Cache-Control': cacheControl,
      'x-oss-object-acl': 'public-read',
    },
  })
  return {
    objectKey,
    url: publicUrlForObject(objectKey),
  }
}
