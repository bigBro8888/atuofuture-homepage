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
  oss: {
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    endpoint: process.env.OSS_ENDPOINT,
  },
}
