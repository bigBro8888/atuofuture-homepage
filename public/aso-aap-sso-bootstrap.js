/**
 * 注入到 AAP 网关页：消费门户 aso_sso 票据，写入会话后进入系统。
 * 由 nginx sub_filter 挂到 /aso-aap/ 反代入口。
 */
;(function () {
  var BASE = location.pathname.indexOf('/aso-aap') === 0 ? '/aso-aap' : ''
  var PARAM = 'aso_sso'

  // 网关前缀下始终改写绝对 /api /assets，避免打到门户自身
  if (BASE) {
    var patchUrl = function (value) {
      if (typeof value !== 'string') return value
      if (value.indexOf('/aso-aap/') === 0) return value
      if (value.indexOf('/api/') === 0 || value === '/api') return BASE + value
      if (value.indexOf('/assets/') === 0) return BASE + value
      if (value.indexOf('/logo') === 0 || value.indexOf('/favicon') === 0) return BASE + value
      return value
    }
    var rawFetch = window.fetch
    window.fetch = function (input, init) {
      if (typeof input === 'string') input = patchUrl(input)
      else if (input && typeof Request !== 'undefined' && input instanceof Request) {
        input = new Request(patchUrl(input.url), input)
      }
      return rawFetch.call(this, input, init)
    }
    var open = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function () {
      var args = Array.prototype.slice.call(arguments)
      if (typeof args[1] === 'string') args[1] = patchUrl(args[1])
      return open.apply(this, args)
    }
  }

  var url = new URL(window.location.href)
  var ticket = url.searchParams.get(PARAM)
  if (!ticket) {
    var hash = window.location.hash || ''
    var q = hash.indexOf('?')
    if (q >= 0) {
      var hp = new URLSearchParams(hash.slice(q + 1))
      ticket = hp.get(PARAM)
      if (ticket) {
        hp.delete(PARAM)
        hp.delete('embed')
        var baseHash = hash.slice(0, q)
        var next = hp.toString()
        window.history.replaceState({}, '', window.location.pathname + window.location.search + baseHash + (next ? '?' + next : ''))
      }
    }
  }
  if (!ticket) return

  url.searchParams.delete(PARAM)
  url.searchParams.delete('embed')
  window.history.replaceState({}, '', url.pathname + url.search + url.hash)
  document.documentElement.classList.add('aso-embed')
  document.body && document.body.classList.add('aso-embed')

  var overlay = document.createElement('div')
  overlay.id = 'aso-aap-sso-overlay'
  overlay.setAttribute('style', [
    'position:fixed',
    'inset:0',
    'z-index:2147483646',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'flex-direction:column',
    'gap:12px',
    'background:#f0f2f5',
    'font:14px/1.5 system-ui,sans-serif',
    'color:#303133',
  ].join(';'))
  overlay.innerHTML = '<div style="width:36px;height:36px;border:3px solid #2d8cf0;border-bottom-color:transparent;border-radius:50%;animation:aso-spin 0.8s linear infinite"></div><p>正在通过统一身份进入 AAP…</p>'
  var style = document.createElement('style')
  style.textContent = '@keyframes aso-spin{to{transform:rotate(360deg)}}'
  document.documentElement.appendChild(style)
  document.documentElement.appendChild(overlay)

  // 关键：本脚本是 <head> 里的同步脚本，先于应用的 module 脚本执行。
  // 若用异步 fetch 写 localStorage，应用启动时状态仓库已创建（此刻仓库为空），
  // 路由守卫会把我们踢回登录页，之后再写 localStorage 也不会重新水合。
  // 因此这里用同步请求（同源，cookie 会自动带上/写入）在应用启动前把登录态写好。
  var ok = false
  var data = null
  try {
    var xhr = new XMLHttpRequest()
    xhr.open('POST', BASE + '/api/auth/sso/aspace', false) // 同步
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({ ticket: ticket }))
    if (xhr.status >= 200 && xhr.status < 300) {
      data = JSON.parse(xhr.responseText)
      ok = !!(data && data.success)
    }
  } catch (e) {
    console.error('[aso-aap-sso]', e)
  }

  var removeOverlay = function () {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }

  if (ok && data && data.user) {
    try {
      var prev = {}
      try {
        prev = JSON.parse(localStorage.getItem('user') || '{}') || {}
      } catch (e) {}
      var next = Object.assign({}, prev, {
        userInfo: data.user,
        token: data.token || prev.token || '',
        tokenKey: data.tokenKey || prev.tokenKey || 'Authorization',
        rememberMe: true,
      })
      localStorage.setItem('user', JSON.stringify(next))
      if (Array.isArray(data.user.permissions)) {
        localStorage.setItem('permission', JSON.stringify(data.user.permissions))
      }
      if (data.tenantID) {
        localStorage.setItem('dingtalk_tenant_id', String(data.tenantID))
      }
    } catch (e) {}
    try {
      window.parent.postMessage({ type: 'aso-aap-sso', ok: true }, '*')
    } catch (e) {}
    // localStorage 已写好，应用启动即为已登录，会直接进入工作台。
    // 待应用渲染出来后移除遮罩（此时不再需要刷新或改 hash）。
    if (document.readyState === 'complete') {
      window.setTimeout(removeOverlay, 300)
    } else {
      window.addEventListener('load', function () {
        window.setTimeout(removeOverlay, 300)
      })
    }
    window.setTimeout(removeOverlay, 4000)
  } else {
    try {
      window.parent.postMessage({
        type: 'aso-aap-sso',
        ok: false,
        message: (data && (data.message || data.error)) || '统一登录失败',
      }, '*')
    } catch (e) {}
    removeOverlay()
  }
})()
