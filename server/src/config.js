import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

export const config = {
  port: Number(process.env.PORT || 8787),
  host: process.env.HOST || '127.0.0.1',
  nodeEnv: process.env.NODE_ENV || 'development',
  cookieSecure: String(process.env.COOKIE_SECURE || '').toLowerCase() === 'true',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-before-production',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@atuofuture.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  dataFile: process.env.DATA_FILE || path.resolve(here, '../data/store.json'),
  uploadDir: process.env.UPLOAD_DIR || path.resolve(here, '../uploads'),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'https://www.atuofuture.com',
  versionSourceUrl: process.env.VERSION_SOURCE_URL || 'https://file.atuofuture.com/release/version',
  releaseBaseUrl: process.env.RELEASE_BASE_URL || 'https://file.atuofuture.com/release',
  versionCacheMs: Number(process.env.VERSION_CACHE_MS || 120000),
  /** Aspace One → AI 画报统一登录：与画报服务 ASO_SSO_SECRET 保持一致 */
  posterSsoSecret: process.env.ASO_POSTER_SSO_SECRET || process.env.ASO_SSO_SECRET || '',
  posterAppOrigin: (process.env.POSTER_APP_ORIGIN || 'http://47.103.102.65:5173').replace(/\/$/, ''),
  posterSsoTtlMs: Number(process.env.POSTER_SSO_TTL_MS || 120000),
  /** Aspace One → AAP：默认同域嵌入 asset；若已放行反代网关端口可改为 http://IP:18181 */
  aapAppOrigin: (process.env.AAP_APP_ORIGIN || 'https://asset.atuofuture.com').replace(/\/$/, ''),
  aapUpstreamOrigin: (process.env.AAP_UPSTREAM_ORIGIN || 'https://asset.atuofuture.com').replace(/\/$/, ''),
  aapSsoTenantId: String(process.env.AAP_SSO_TENANT_ID || 'bkws').trim(),
  aapSsoUsername: String(process.env.AAP_SSO_USERNAME || '').trim(),
  aapSsoPassword: String(process.env.AAP_SSO_PASSWORD || ''),
  /** 可选：直接复用已登录会话 Cookie（name=value; 可多条逗号分隔），用于暂无上游 SSO 时静默进入 */
  aapSsoSessionCookie: String(process.env.AAP_SSO_SESSION_COOKIE || '').trim(),
  oss: {
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    endpoint: process.env.OSS_ENDPOINT,
  },
}
