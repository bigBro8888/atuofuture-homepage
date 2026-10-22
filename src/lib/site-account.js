const TOKEN_KEY = 'aspace-one-oidc-tokens'
const PENDING_KEY = 'aspace-one-oidc-pending'

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
    const tokens = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null')
    if (!tokens?.access_token) return null
    const response = await fetch('/auth/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: 'no-store',
    })
    if (!response.ok) throw new Error('expired')
    const user = await response.json()
    window.ASPACE_CURRENT_USER = { id: user.sub, ...user }
    return window.ASPACE_CURRENT_USER
  } catch {
    sessionStorage.removeItem(TOKEN_KEY)
    window.ASPACE_CURRENT_USER = null
    return null
  }
}

export async function startSiteLogin({ forceLogin = true } = {}) {
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = base64Url(await sha256(verifier))
  const state = base64Url(crypto.getRandomValues(new Uint8Array(24)))
  const nonce = base64Url(crypto.getRandomValues(new Uint8Array(24)))
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ verifier, state, nonce }))
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

export function renderSiteAccount(user) {
  if (user?.id) {
    const name = siteAccountName(user)
    return `
      <a class="site-header__account is-logged-in" href="/aspace-one/" data-site-account>
        <span class="site-header__account-avatar">${escapeHtml(name.slice(0, 1))}</span>
        <span data-site-account-label>${escapeHtml(name)}</span>
      </a>`
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
  header.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-site-account]')
    if (!trigger || trigger.matches('a')) return
    event.preventDefault()
    void startSiteLogin()
  })
  void loadSiteAccount().then((user) => {
    header.querySelectorAll('[data-site-account]').forEach((node) => {
      const wrap = document.createElement('div')
      wrap.innerHTML = renderSiteAccount(user).trim()
      const next = wrap.firstElementChild
      if (next) node.replaceWith(next)
    })
  })
}
