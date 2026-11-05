const TOKEN_KEY = 'aspace-one-oidc-tokens'
const PENDING_KEY = 'aspace-one-oidc-pending'
/** 钉钉回调只认这个域名；从 IP 或其它端口发起的登录先切过来，否则统一登录页不会出现钉钉入口 */
const CANONICAL_ORIGIN = 'https://ai.atuofuture.com'
const LOGIN_HANDOFF_PARAM = 'site_login'

/** 发起统一登录应使用的站点地址：线上的 IP 或其它端口统一换成主域名 */
export function loginOrigin() {
  const { origin, hostname } = window.location
  if (hostname === 'ai.atuofuture.com' || hostname === '47.103.102.65') return CANONICAL_ORIGIN
  return origin
}

/** 需要切到主域名登录时返回同一页面的主域名地址，否则返回空字符串 */
export function canonicalLoginUrl() {
  const { origin, pathname, search, hash } = window.location
  if (loginOrigin() === origin) return ''
  const target = new URL(`${pathname}${search}${hash}`, CANONICAL_ORIGIN)
  target.searchParams.set(LOGIN_HANDOFF_PARAM, '1')
  return target.toString()
}

/** 读取并清掉地址栏里的登录交接标记，返回是否需要自动发起登录 */
export function consumeLoginHandoff() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has(LOGIN_HANDOFF_PARAM)) return false
  url.searchParams.delete(LOGIN_HANDOFF_PARAM)
  window.history.replaceState(window.history.state, '', url.toString())
  return true
}

/** 读写登录 token：优先 session，并同步 local，避免新标签/部分跳转丢登录态 */
export function readPortalTokens() {
  for (const store of [sessionStorage, localStorage]) {
    try {
      const tokens = JSON.parse(store.getItem(TOKEN_KEY) || 'null')
      if (tokens?.access_token) return tokens
    } catch {
      /* ignore */
    }
  }
  return null
}

export function writePortalTokens(tokens) {
  const raw = JSON.stringify(tokens || null)
  try {
    sessionStorage.setItem(TOKEN_KEY, raw)
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(TOKEN_KEY, raw)
  } catch {
    /* ignore */
  }
}

export function clearPortalTokens() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

function base64Url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function sha256Fallback(value) {
  const rightRotate = (number, amount) => (number >>> amount) | (number << (32 - amount))
  const maxWord = 2 ** 32
  const words = []
  const hash = []
  const constants = []
  const byteLength = value.length
  const bitLength = byteLength * 8
  const composite = {}
  let primeCounter = 0
  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (composite[candidate]) continue
    for (let multiple = candidate * candidate; multiple < 313; multiple += candidate) composite[multiple] = true
    if (primeCounter < 8) hash[primeCounter] = (Math.sqrt(candidate) * maxWord) | 0
    constants[primeCounter] = (candidate ** (1 / 3) * maxWord) | 0
    primeCounter += 1
  }
  const bytes = [...new TextEncoder().encode(value), 0x80]
  while ((bytes.length % 64) !== 56) bytes.push(0)
  for (let index = 7; index >= 0; index -= 1) bytes.push(index < 4 ? (bitLength >>> (index * 8)) & 255 : 0)
  for (let index = 0; index < bytes.length; index += 4) {
    words.push((bytes[index] << 24) | (bytes[index + 1] << 16) | (bytes[index + 2] << 8) | bytes[index + 3])
  }
  for (let block = 0; block < words.length; block += 16) {
    const schedule = words.slice(block, block + 16)
    const oldHash = hash.slice()
    for (let index = 0; index < 64; index += 1) {
      const w15 = schedule[index - 15]
      const w2 = schedule[index - 2]
      const a = hash[0]
      const e = hash[4]
      const temp1 = (
        hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ (~e & hash[6]))
        + constants[index]
        + (schedule[index] = index < 16 ? schedule[index] : (
          schedule[index - 16]
          + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
          + schedule[index - 7]
          + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0)
      ) | 0
      const temp2 = (
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]))
      ) | 0
      hash.pop()
      hash.unshift((temp1 + temp2) | 0)
      hash[4] = (hash[4] + temp1) | 0
    }
    hash.forEach((valueAtIndex, index) => {
      hash[index] = (valueAtIndex + oldHash[index]) | 0
    })
  }
  return Uint8Array.from(hash.flatMap((word) => [
    (word >>> 24) & 255,
    (word >>> 16) & 255,
    (word >>> 8) & 255,
    word & 255,
  ]))
}

async function sha256(value) {
  if (crypto.subtle) {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))
  }
  return sha256Fallback(value)
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[char]))
}

export function siteAccountName(user) {
  return String(user?.name || user?.displayName || user?.email || '已登录用户')
}

export async function loadSiteAccount() {
  try {
    const tokens = readPortalTokens()
    if (!tokens?.access_token) return null
    const response = await fetch('/auth/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: 'no-store',
    })
    if (!response.ok) throw new Error('expired')
    const user = await response.json()
    // 回写一份到两边，保证后续同站跳转都能读到
    writePortalTokens(tokens)
    window.ASPACE_CURRENT_USER = { id: user.sub, ...user }
    return window.ASPACE_CURRENT_USER
  } catch {
    clearPortalTokens()
    window.ASPACE_CURRENT_USER = null
    return null
  }
}

export async function startSiteLogin({ forceLogin = true } = {}) {
  const handoffUrl = canonicalLoginUrl()
  if (handoffUrl) {
    window.location.href = handoffUrl
    return
  }
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = base64Url(await sha256(verifier))
  const state = base64Url(crypto.getRandomValues(new Uint8Array(24)))
  const nonce = base64Url(crypto.getRandomValues(new Uint8Array(24)))
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ verifier, state, nonce, returnTo }))
  const params = {
    client_id: 'aspace-one',
    redirect_uri: `${window.location.origin}/aspace-one/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }
  // 主动登录时强制出现登录页，避免沿用统一认证侧已有会话直接静默回跳
  if (forceLogin) params.prompt = 'login'
  const authorizeUrl = new URL('/auth/auth', window.location.origin)
  authorizeUrl.search = new URLSearchParams(params).toString()
  window.location.href = authorizeUrl.toString()
}

export function logoutSiteAccount(redirectPath = '/') {
  const idToken = String(readPortalTokens()?.id_token || '')
  clearPortalTokens()
  try {
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    /* ignore */
  }
  window.ASPACE_CURRENT_USER = null
  if (!idToken) {
    window.location.replace(redirectPath)
    return
  }
  const endUrl = new URL('/auth/session/end', window.location.origin)
  endUrl.searchParams.set('id_token_hint', idToken)
  endUrl.searchParams.set('client_id', 'aspace-one')
  endUrl.searchParams.set('post_logout_redirect_uri', `${window.location.origin}${redirectPath}`)
  window.location.replace(endUrl.toString())
}

export function renderSiteAccount(user) {
  if (user?.id) {
    const name = siteAccountName(user)
    return `
      <div class="site-account-menu" data-site-account>
        <button type="button" class="site-header__account is-logged-in" aria-haspopup="true" aria-expanded="false" data-site-account-toggle>
          <span class="site-header__account-avatar">${escapeHtml(name.slice(0, 1))}</span>
          <span data-site-account-label>${escapeHtml(name)}</span>
          <span class="material-symbols-outlined site-account-menu__chevron" aria-hidden="true">expand_more</span>
        </button>
        <div class="site-account-menu__panel" role="menu">
          <a class="site-account-menu__item" href="/aspace-one/" role="menuitem">
            <span class="material-symbols-outlined" aria-hidden="true">apps</span>进入 Aspace 平台
          </a>
          <button type="button" class="site-account-menu__item" role="menuitem" data-site-logout>
            <span class="material-symbols-outlined" aria-hidden="true">logout</span>退出登录
          </button>
        </div>
      </div>`
  }
  return `
    <button type="button" class="site-header__account" data-site-account>
      <span class="material-symbols-outlined" aria-hidden="true">person</span>
      <span data-site-account-label>登录</span>
    </button>`
}

export function bindSiteAccount(header) {
  if (!header || header.dataset.accountBound === '1') return
  header.dataset.accountBound = '1'
  const closeMenus = (except) => {
    header.querySelectorAll('.site-account-menu.is-open').forEach((menu) => {
      if (menu === except) return
      menu.classList.remove('is-open')
      menu.querySelector('[data-site-account-toggle]')?.setAttribute('aria-expanded', 'false')
    })
  }
  header.addEventListener('click', (event) => {
    if (event.target.closest('[data-site-logout]')) {
      event.preventDefault()
      logoutSiteAccount('/')
      return
    }
    const toggle = event.target.closest('[data-site-account-toggle]')
    if (toggle) {
      event.preventDefault()
      const menu = toggle.closest('.site-account-menu')
      const open = !menu.classList.contains('is-open')
      closeMenus(menu)
      menu.classList.toggle('is-open', open)
      toggle.setAttribute('aria-expanded', String(open))
      return
    }
    const trigger = event.target.closest('button[data-site-account]')
    if (!trigger) return
    event.preventDefault()
    void startSiteLogin()
  })
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-account-menu')) closeMenus()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenus()
  })
  const loginHandoff = consumeLoginHandoff()
  void loadSiteAccount().then((user) => {
    if (loginHandoff && !user) {
      void startSiteLogin()
      return
    }
    header.querySelectorAll('[data-site-account]').forEach((node) => {
      const wrap = document.createElement('div')
      wrap.innerHTML = renderSiteAccount(user).trim()
      const next = wrap.firstElementChild
      if (next) node.replaceWith(next)
    })
  })
}
