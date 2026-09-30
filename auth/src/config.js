import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

function list(value, fallback = []) {
  const result = String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
  return result.length ? result : fallback
}

function json(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const publicOrigin = String(process.env.AUTH_PUBLIC_ORIGIN || 'http://127.0.0.1:8788').replace(/\/$/, '')
const portalOrigin = String(process.env.AUTH_PORTAL_ORIGIN || 'http://127.0.0.1:5173').replace(/\/$/, '')
const basePath = `/${String(process.env.AUTH_BASE_PATH || 'auth').replace(/^\/+|\/+$/g, '')}`

export const authConfig = {
  port: Number(process.env.AUTH_PORT || 8788),
  host: process.env.AUTH_HOST || '127.0.0.1',
  publicOrigin,
  basePath,
  issuer: process.env.AUTH_ISSUER || `${publicOrigin}${basePath}`,
  portalOrigin,
  dataFile: process.env.AUTH_DATA_FILE || path.resolve(here, '../data/store.json'),
  oidcDataFile: process.env.AUTH_OIDC_DATA_FILE || path.resolve(here, '../data/oidc.json'),
  jwksFile: process.env.AUTH_JWKS_FILE || path.resolve(here, '../data/jwks.json'),
  cookieKeys: list(process.env.AUTH_COOKIE_KEYS, ['development-cookie-key-change-before-production']),
  trustProxy: String(process.env.AUTH_TRUST_PROXY || 'true').toLowerCase() === 'true',
  clients: json(process.env.AUTH_CLIENTS_JSON, [{
    client_id: 'aspace-one',
    client_name: 'Aspace One',
    redirect_uris: [`${portalOrigin}/aspace-one/auth/callback`],
    post_logout_redirect_uris: [`${portalOrigin}/aspace-one/`],
    response_types: ['code'],
    grant_types: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_method: 'none',
  }]),
  dingtalk: {
    clientId: String(process.env.AUTH_DINGTALK_CLIENT_ID || '').trim(),
    clientSecret: String(process.env.AUTH_DINGTALK_CLIENT_SECRET || ''),
  },
}

if (process.env.NODE_ENV === 'production' && authConfig.cookieKeys.includes('development-cookie-key-change-before-production')) {
  throw new Error('生产环境必须配置 AUTH_COOKIE_KEYS')
}
if (
  authConfig.dingtalk.clientId
  && authConfig.dingtalk.clientSecret
  && !authConfig.issuer.startsWith('https://')
) {
  throw new Error('启用钉钉登录前必须为 AUTH_ISSUER 配置 HTTPS')
}

export function authUrl(pathname = '') {
  return `${authConfig.publicOrigin}${authConfig.basePath}${pathname}`
}
