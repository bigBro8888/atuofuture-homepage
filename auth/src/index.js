import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import express from 'express'
import helmet from 'helmet'
import { Provider } from 'oidc-provider'
import { authConfig, authUrl } from './config.js'
import { loadJwks } from './keys.js'
import { initOidcAdapter, JsonOidcAdapter } from './oidc-adapter.js'
import {
  accountClaims,
  addAuthAudit,
  findUser,
  initAuthStore,
  upsertFederatedUser,
} from './store.js'
import { errorPage, loginPage } from './views.js'

const dingTalkStates = new Map()

function pruneDingTalkStates() {
  const now = Date.now()
  for (const [key, value] of dingTalkStates) {
    if (value.expiresAt < now) dingTalkStates.delete(key)
  }
}

async function finishConsent(provider, request, response, details) {
  const { prompt, params, session } = details
  let { grantId } = details
  let grant = grantId ? await provider.Grant.find(grantId) : null
  if (!grant) {
    grant = new provider.Grant({ accountId: session.accountId, clientId: params.client_id })
  }
  if (prompt.details.missingOIDCScope) grant.addOIDCScope(prompt.details.missingOIDCScope.join(' '))
  if (prompt.details.missingOIDCClaims) grant.addOIDCClaims(prompt.details.missingOIDCClaims)
  grantId = await grant.save()
  await provider.interactionFinished(
    request,
    response,
    { consent: details.grantId ? {} : { grantId } },
    { mergeWithLastSubmission: true },
  )
}

async function exchangeDingTalkCode(code) {
  const tokenResponse = await fetch('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: authConfig.dingtalk.clientId,
      clientSecret: authConfig.dingtalk.clientSecret,
      code,
      grantType: 'authorization_code',
    }),
  })
  const token = await tokenResponse.json().catch(() => ({}))
  if (!tokenResponse.ok || !token.accessToken) {
    throw new Error(token.message || '钉钉授权码交换失败')
  }

  const profileResponse = await fetch('https://api.dingtalk.com/v1.0/contact/users/me', {
    headers: { 'x-acs-dingtalk-access-token': token.accessToken },
  })
  const profile = await profileResponse.json().catch(() => ({}))
  if (!profileResponse.ok) throw new Error(profile.message || '无法读取钉钉用户信息')
  const externalId = String(profile.unionId || profile.unionid || profile.openId || '')
  if (!externalId) throw new Error('钉钉未返回稳定用户标识')
  return {
    externalId,
    name: profile.nick || profile.name || '钉钉用户',
    email: profile.email || '',
    avatarUrl: profile.avatarUrl || '',
  }
}

export async function createAuthService() {
  await Promise.all([initAuthStore(), initOidcAdapter()])
  const jwks = await loadJwks()
  const provider = new Provider(authConfig.issuer, {
    adapter: JsonOidcAdapter,
    clients: authConfig.clients,
    cookies: { keys: authConfig.cookieKeys },
    claims: {
      email: ['email', 'email_verified'],
      profile: ['name', 'picture'],
    },
    features: {
      devInteractions: { enabled: false },
      revocation: { enabled: true },
      rpInitiatedLogout: { enabled: true },
    },
    findAccount: async (_context, id) => {
      const user = findUser(id)
      if (!user) return undefined
      return {
        accountId: user.id,
        claims: async () => accountClaims(user),
      }
    },
    interactions: {
      url: (_context, interaction) => `${authConfig.basePath}/interaction/${interaction.uid}`,
    },
    jwks,
    pkce: { required: () => true },
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    ttl: { Interaction: 10 * 60 },
  })
  provider.proxy = authConfig.trustProxy

  const app = express()
  app.set('trust proxy', authConfig.trustProxy ? 1 : false)
  app.disable('x-powered-by')
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        formAction: ["'self'", 'https://login.dingtalk.com'],
        baseUri: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    hsts: false,
  }))

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', service: 'atuofuture-unified-auth', issuer: authConfig.issuer })
  })
  app.get(`${authConfig.basePath}/health`, (_request, response) => {
    response.json({ status: 'ok', service: 'atuofuture-unified-auth', issuer: authConfig.issuer })
  })
  app.get(`${authConfig.basePath}/`, (_request, response) => {
    response.json({
      service: '安托未来统一身份认证',
      issuer: authConfig.issuer,
      discovery: `${authConfig.issuer}/.well-known/openid-configuration`,
      loginMethods: {
        dingtalk: Boolean(authConfig.dingtalk.clientId && authConfig.dingtalk.clientSecret),
        wechat: false,
        oa: false,
        sms: false,
        passwordMfa: false,
      },
    })
  })
  app.use(`${authConfig.basePath}/assets`, express.static(fileURLToPath(new URL('../public', import.meta.url)), {
    fallthrough: false,
    maxAge: '1h',
  }))

  app.get(`${authConfig.basePath}/interaction/:uid`, async (request, response, next) => {
    try {
      const details = await provider.interactionDetails(request, response)
      if (details.prompt.name === 'consent') {
        await finishConsent(provider, request, response, details)
        return
      }
      if (details.prompt.name !== 'login') throw new Error(`不支持的交互类型：${details.prompt.name}`)
      const client = await provider.Client.find(details.params.client_id)
      response.setHeader('Cache-Control', 'no-store')
      response.type('html').send(loginPage({
        uid: details.uid,
        clientName: client?.clientName || client?.clientId || '内部系统',
        dingTalkEnabled: Boolean(authConfig.dingtalk.clientId && authConfig.dingtalk.clientSecret),
        error: String(request.query.error || ''),
      }))
    } catch (error) {
      next(error)
    }
  })

  app.get(`${authConfig.basePath}/interaction/:uid/dingtalk`, async (request, response, next) => {
    try {
      if (!authConfig.dingtalk.clientId || !authConfig.dingtalk.clientSecret) {
        return response.status(503).type('html').send(errorPage('钉钉企业应用参数尚未配置。'))
      }
      const details = await provider.interactionDetails(request, response)
      if (details.prompt.name !== 'login') throw new Error('当前授权流程不需要重新登录')
      pruneDingTalkStates()
      const state = randomUUID()
      dingTalkStates.set(state, { uid: details.uid, expiresAt: Date.now() + 5 * 60 * 1000 })
      const authorizeUrl = new URL('https://login.dingtalk.com/oauth2/auth')
      authorizeUrl.searchParams.set('redirect_uri', authUrl('/callback/dingtalk'))
      authorizeUrl.searchParams.set('response_type', 'code')
      authorizeUrl.searchParams.set('client_id', authConfig.dingtalk.clientId)
      authorizeUrl.searchParams.set('scope', 'openid')
      authorizeUrl.searchParams.set('prompt', 'consent')
      authorizeUrl.searchParams.set('state', state)
      response.redirect(authorizeUrl.toString())
    } catch (error) {
      next(error)
    }
  })

  app.get(`${authConfig.basePath}/callback/dingtalk`, async (request, response, next) => {
    try {
      pruneDingTalkStates()
      const state = dingTalkStates.get(String(request.query.state || ''))
      dingTalkStates.delete(String(request.query.state || ''))
      if (!state || state.expiresAt < Date.now()) throw new Error('钉钉登录状态已过期，请重新发起登录')
      if (request.query.error) throw new Error(String(request.query.error_description || request.query.error))
      const interaction = await provider.interactionDetails(request, response)
      if (interaction.uid !== state.uid) throw new Error('钉钉登录状态与当前授权请求不匹配')
      const code = String(request.query.authCode || request.query.code || '')
      if (!code) throw new Error('钉钉未返回授权码')
      const profile = await exchangeDingTalkCode(code)
      const user = await upsertFederatedUser('dingtalk', profile.externalId, profile)
      await addAuthAudit('auth.login.dingtalk', { userId: user.id })
      await provider.interactionFinished(
        request,
        response,
        { login: { accountId: user.id, amr: ['dingtalk'] } },
        { mergeWithLastSubmission: false },
      )
    } catch (error) {
      next(error)
    }
  })

  app.use(authConfig.basePath, provider.callback())
  app.use((error, _request, response, _next) => {
    console.error(error)
    response.status(Number(error.statusCode || error.status || 500)).type('html').send(errorPage(
      error instanceof Error ? error.message : '统一登录服务暂时不可用',
    ))
  })
  return { app, provider }
}

if (process.env.NODE_ENV !== 'test') {
  const { app } = await createAuthService()
  app.listen(authConfig.port, authConfig.host, () => {
    console.log(`Unified Auth listening on ${authConfig.host}:${authConfig.port} (${authConfig.issuer})`)
  })
}
