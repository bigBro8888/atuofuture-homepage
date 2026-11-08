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
const portalOrigins = list(process.env.AUTH_PORTAL_ORIGINS, [portalOrigin]).map((origin) => origin.replace(/\/$/, ''))
const basePath = `/${String(process.env.AUTH_BASE_PATH || 'auth').replace(/^\/+|\/+$/g, '')}`

/** 新系统通过 AUTH_EXTRA_CLIENTS_JSON 追加登记；client_id 与内置客户端相同时覆盖内置配置 */
function withExtraClients(clients) {
  const extra = json(process.env.AUTH_EXTRA_CLIENTS_JSON, [])
  if (!Array.isArray(extra)) throw new Error('AUTH_EXTRA_CLIENTS_JSON 必须是 JSON 数组')
  const merged = new Map(clients.map((client) => [client.client_id, client]))
  for (const client of extra) {
    if (!client?.client_id || !Array.isArray(client.redirect_uris) || !client.redirect_uris.length) {
      throw new Error('AUTH_EXTRA_CLIENTS_JSON 中每个客户端都需要 client_id 和 redirect_uris')
    }
    merged.set(client.client_id, {
      response_types: ['code'],
      grant_types: ['authorization_code'],
      token_endpoint_auth_method: 'none',
      ...client,
    })
  }
  return [...merged.values()]
}

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
  clients: withExtraClients(json(process.env.AUTH_CLIENTS_JSON, [{
    client_id: 'aspace-one',
    client_name: 'Aspace空间智能',
    redirect_uris: portalOrigins.map((origin) => `${origin}/aspace-one/auth/callback`),
    post_logout_redirect_uris: portalOrigins.flatMap((origin) => [`${origin}/aspace-one/`, `${origin}/`]),
    response_types: ['code'],
    grant_types: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_method: 'none',
  }, {
    client_id: 'website-admin',
    client_name: '官网后台',
    redirect_uris: portalOrigins.map((origin) => `${origin}/api/admin/oidc/callback`),
    post_logout_redirect_uris: portalOrigins.map((origin) => `${origin}/admin/`),
    response_types: ['code'],
    grant_types: ['authorization_code'],
    token_endpoint_auth_method: 'none',
  }])),
  dingtalk: {
    clientId: String(process.env.AUTH_DINGTALK_CLIENT_ID || '').trim(),
    clientSecret: String(process.env.AUTH_DINGTALK_CLIENT_SECRET || ''),
    /** 钉钉登录可选组织：[{name, corp_id}, ...]；未登记的公司不会出现在登录页 */
    loginOrgs: normalizeDingTalkLoginOrgs(
      json(process.env.AUTH_DINGTALK_LOGIN_ORGS, null),
      process.env.AUTH_DINGTALK_DEFAULT_CORP_ID,
      process.env.AUTH_DINGTALK_DEFAULT_CORP_NAME,
    ),
  },
  passwordLoginEnabled: String(process.env.AUTH_PASSWORD_LOGIN_ENABLED || 'false').toLowerCase() === 'true',
}

function normalizeDingTalkLoginOrgs(raw, legacyCorpId, legacyName) {
  const out = []
  const seen = new Set()
  const push = (name, corpId) => {
    const id = String(corpId || '').trim()
    if (!id || seen.has(id)) return
    seen.add(id)
    out.push({ name: String(name || '').trim() || id, corp_id: id })
  }
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue
      push(item.name || item.corpName, item.corp_id || item.corpId)
    }
  }
  if (!out.length) {
    push(legacyName || '默认组织', legacyCorpId)
  }
  return out
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

/** 钉钉回调固定指向 AUTH_PUBLIC_ORIGIN，其它域名下发起的登录无法接回会话。 */
export function isPublicHost(host) {
  return String(host || '').toLowerCase() === new URL(authConfig.publicOrigin).host.toLowerCase()
}

export function dingTalkAvailable(host) {
  return Boolean(authConfig.dingtalk.clientId && authConfig.dingtalk.clientSecret) && isPublicHost(host)
}

export function authUrl(pathname = '') {
  return `${authConfig.publicOrigin}${authConfig.basePath}${pathname}`
}
