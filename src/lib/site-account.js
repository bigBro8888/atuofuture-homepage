const TOKEN_KEY = 'aspace-one-oidc-tokens'
const PENDING_KEY = 'aspace-one-oidc-pending'

function base64Url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

async function sha256(value) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))
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

export async function startSiteLogin() {
  if (!crypto.subtle) {
    window.location.href = '/aspace-one/'
    return
  }
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = base64Url(await sha256(verifier))
  const state = base64Url(crypto.getRandomValues(new Uint8Array(24)))
  const nonce = base64Url(crypto.getRandomValues(new Uint8Array(24)))
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ verifier, state, nonce }))
  const authorizeUrl = new URL('/auth/auth', window.location.origin)
  authorizeUrl.search = new URLSearchParams({
    client_id: 'aspace-one',
    redirect_uri: `${window.location.origin}/aspace-one/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString()
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
