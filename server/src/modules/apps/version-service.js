import { config } from '../../config.js'
import { db, save } from '../../lib/store.js'

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/
let cache = { value: null, expiresAt: 0 }

export function validateVersion(value) {
  const version = String(value || '').trim()
  if (!VERSION_PATTERN.test(version) || version.length > 64) {
    throw new Error('版本文件内容不是有效的语义化版本号')
  }
  return version
}

export function apkUrlFor(version) {
  return `${config.releaseBaseUrl}/artink-${encodeURIComponent(validateVersion(version))}.apk`
}

function fallbackRelease() {
  return [...db().releases]
    .filter((release) => release.appId === 'artink' && release.status === 'published')
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))[0]
}

export async function getLatestAndroidVersion({ force = false } = {}) {
  if (!force && cache.value && cache.expiresAt > Date.now()) return cache.value

  try {
    const response = await fetch(config.versionSourceUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: 'text/plain' },
    })
    if (!response.ok) throw new Error(`版本源返回 HTTP ${response.status}`)

    const version = validateVersion(await response.text())
    const value = {
      version,
      apkUrl: apkUrlFor(version),
      updatedAt: response.headers.get('last-modified') || new Date().toISOString(),
      source: 'remote',
    }
    cache = { value, expiresAt: Date.now() + config.versionCacheMs }
    db().sourceHealth = { status: 'healthy', checkedAt: new Date().toISOString(), message: `当前版本 ${version}` }
    await save()
    return value
  } catch (error) {
    const release = fallbackRelease()
    db().sourceHealth = { status: 'degraded', checkedAt: new Date().toISOString(), message: error.message }
    await save()

    if (cache.value) return { ...cache.value, source: 'stale-cache', warning: error.message }
    if (release) {
      return {
        version: release.version,
        apkUrl: release.apkUrl || apkUrlFor(release.version),
        updatedAt: release.publishedAt || release.createdAt,
        source: 'database-fallback',
        warning: error.message,
      }
    }
    throw error
  }
}

export function clearVersionCache() {
  cache = { value: null, expiresAt: 0 }
}
