import { createHash } from 'node:crypto'
import OSS from 'ali-oss'
import { config } from '../../config.js'
import { addAudit, addRecord, db, save } from '../../lib/store.js'
import { apkUrlFor, clearVersionCache, validateVersion } from './version-service.js'

function ossClient() {
  const missing = ['region', 'accessKeyId', 'accessKeySecret', 'bucket'].filter((key) => !config.oss[key])
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
    secure: true,
  })
}

async function verifyPublicFile(url) {
  const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) })
  if (!response.ok) throw new Error(`APK 校验失败：HTTP ${response.status}`)
  return Number(response.headers.get('content-length') || 0)
}

export async function publishRelease({ version: inputVersion, notes, file, user }) {
  const version = validateVersion(inputVersion)
  if (!file?.buffer?.length) {
    const error = new Error('请选择 APK 文件')
    error.status = 400
    throw error
  }
  if (!/\.apk$/i.test(file.originalname)) {
    const error = new Error('仅支持 APK 文件')
    error.status = 400
    throw error
  }
  if (db().releases.some((release) => release.appId === 'artink' && release.version === version && release.status === 'published')) {
    const error = new Error('该版本已经发布')
    error.status = 409
    throw error
  }

  const client = ossClient()
  const apkObject = `release/artink-${version}.apk`
  const hash = createHash('sha256').update(file.buffer).digest('hex')

  // 发布顺序不可调整：APK 上传完成并可访问后，version 才能成为新的权威版本。
  await client.put(apkObject, file.buffer, {
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'x-oss-object-acl': 'public-read',
    },
  })
  const apkUrl = apkUrlFor(version)
  const remoteSize = await verifyPublicFile(apkUrl)
  if (remoteSize && remoteSize !== file.size) throw new Error('APK 上传后大小校验不一致，未更新 version')

  await client.put('release/version', Buffer.from(version, 'utf8'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, max-age=0',
      'x-oss-object-acl': 'public-read',
    },
  })

  db().releases.forEach((release) => {
    if (release.appId === 'artink' && release.status === 'published') release.status = 'superseded'
  })
  const release = await addRecord('releases', {
    appId: 'artink',
    version,
    notes: String(notes || '').slice(0, 4000),
    apkUrl,
    fileSize: file.size,
    sha256: hash,
    status: 'published',
    publishedAt: new Date().toISOString(),
    publishedBy: user.id,
  })
  clearVersionCache()
  await addAudit(user, 'release.publish', `artink@${version}`, { sha256: hash, fileSize: file.size })
  return release
}

export async function rollbackRelease({ releaseId, user }) {
  const target = db().releases.find((release) => release.id === releaseId && release.appId === 'artink')
  if (!target) {
    const error = new Error('目标版本不存在')
    error.status = 404
    throw error
  }

  await verifyPublicFile(target.apkUrl || apkUrlFor(target.version))
  const client = ossClient()
  await client.put('release/version', Buffer.from(validateVersion(target.version), 'utf8'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, max-age=0',
      'x-oss-object-acl': 'public-read',
    },
  })

  db().releases.forEach((release) => {
    if (release.appId === 'artink' && release.status === 'published') release.status = 'superseded'
  })
  target.status = 'published'
  target.publishedAt = new Date().toISOString()
  target.publishedBy = user.id
  await save()
  clearVersionCache()
  await addAudit(user, 'release.rollback', `artink@${target.version}`)
  return target
}
