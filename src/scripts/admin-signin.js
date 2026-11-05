import createGlobe from 'cobe'

const METHOD_KEY = 'atuo:admin-signin-method'
const NOTICES = {
  pending: { text: '已收到你的钉钉账号，请联系超级管理员在「账号权限」中授权后再登录。' },
  disabled: { text: '该钉钉账号已被停用，请联系超级管理员。', error: true },
  expired: { text: '登录已过期，请重新登录。', error: true },
  denied: { text: '已取消钉钉授权。', error: true },
  failed: { text: '钉钉登录失败，请稍后重试。', error: true },
}

let globe = null
let raf = 0
let phi = 2.35

function renderStars(svg) {
  if (!svg || svg.childElementCount) return
  let seed = 20261105
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  const colors = ['#ffffff', '#dce8ff', '#c8dcff', '#ffe6cf']
  svg.innerHTML = Array.from({ length: 70 }, (_, index) => {
    const twinkle = index % 9 === 0 ? ' class="is-twinkle"' : ''
    return `<circle${twinkle} cx="${(random() * 600).toFixed(1)}" cy="${(random() * 900).toFixed(1)}" r="${(0.35 + random() * 1.2).toFixed(2)}" fill="${colors[Math.floor(random() * colors.length)]}" opacity="${(0.2 + random() * 0.6).toFixed(2)}"/>`
  }).join('')
}

function stopGlobe() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  globe?.destroy()
  globe = null
}

function startGlobe(canvas) {
  stopGlobe()
  if (!canvas || window.matchMedia('(max-width: 860px)').matches) return
  const width = Math.max(canvas.clientWidth, 320)
  const height = Math.max(canvas.clientHeight, 220)
  globe = createGlobe(canvas, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    width,
    height,
    phi,
    theta: 0.18,
    dark: 1,
    diffuse: 1.4,
    mapSamples: 26000,
    mapBrightness: 7,
    mapBaseBrightness: 0.04,
    baseColor: [0.32, 0.46, 0.95],
    markerColor: [0.55, 0.95, 1],
    glowColor: [0.16, 0.3, 0.85],
    opacity: 0.95,
    scale: 1.6,
    offset: [0, Math.round(height * 0.46)],
    markers: [],
    context: { alpha: true, antialias: true },
  })
  canvas.classList.add('is-ready')
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const tick = () => {
    phi += 0.0024
    globe?.update({ phi })
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

function showNotice(view) {
  const params = new URLSearchParams(window.location.search)
  const reason = params.get('login_error')
  if (!reason) return
  const notice = view.querySelector('[data-login-notice]')
  const item = NOTICES[reason] || NOTICES.failed
  if (notice) {
    notice.textContent = item.text
    notice.classList.toggle('is-error', Boolean(item.error))
    notice.hidden = false
  }
  params.delete('login_error')
  const query = params.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
}

export function mountAdminSignin() {
  const view = document.querySelector('[data-login-view]')
  if (!view) return
  renderStars(view.querySelector('[data-login-stars]'))
  showNotice(view)

  const saved = localStorage.getItem(METHOD_KEY)
  const radio = view.querySelector(`input[name="admin-signin-tab"][value="${saved === 'password' ? 'password' : 'dingtalk'}"]`)
  if (radio) radio.checked = true

  const link = view.querySelector('[data-dingtalk-login]')
  if (link) link.href = `/api/admin/oidc/start?origin=${encodeURIComponent(window.location.origin)}`

  requestAnimationFrame(() => startGlobe(view.querySelector('[data-login-globe]')))
}

export function unmountAdminSignin() {
  stopGlobe()
}

export function bindAdminSignin() {
  const view = document.querySelector('[data-login-view]')
  if (!view) return
  view.addEventListener('change', (event) => {
    if (event.target.name === 'admin-signin-tab') localStorage.setItem(METHOD_KEY, event.target.value)
  })
  let resizeTimer = 0
  window.addEventListener('resize', () => {
    if (view.hidden) return
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => startGlobe(view.querySelector('[data-login-globe]')), 200)
  })
  document.addEventListener('visibilitychange', () => {
    if (view.hidden) return
    if (document.hidden) stopGlobe()
    else startGlobe(view.querySelector('[data-login-globe]'))
  })
}
