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

  fetch(BASE + '/api/auth/sso/aspace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ticket: ticket }),
  })
    .then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, data: data }
      })
    })
    .then(function (result) {
      if (!result.ok || !result.data || !result.data.success) {
        throw new Error((result.data && (result.data.message || result.data.error)) || '统一登录失败')
      }
      try {
        if (result.data.user) {
          var prev = {}
          try {
            prev = JSON.parse(localStorage.getItem('user') || '{}') || {}
          } catch (e) {}
          var next = Object.assign({}, prev, {
            userInfo: result.data.user,
            token: result.data.token || prev.token || '',
            tokenKey: result.data.tokenKey || prev.tokenKey || 'Authorization',
            rememberMe: true,
          })
          localStorage.setItem('user', JSON.stringify(next))
          if (Array.isArray(result.data.user.permissions)) {
            localStorage.setItem('permission', JSON.stringify(result.data.user.permissions))
          }
          if (result.data.tenantID) {
            localStorage.setItem('dingtalk_tenant_id', String(result.data.tenantID))
          }
        }
      } catch (e) {}
      try {
        window.parent.postMessage({ type: 'aso-aap-sso', ok: true }, '*')
      } catch (e) {}
      window.location.replace((BASE || '') + '/#/')
    })
    .catch(function (error) {
      console.error('[aso-aap-sso]', error)
      try {
        window.parent.postMessage({
          type: 'aso-aap-sso',
          ok: false,
          message: error && error.message ? error.message : '统一登录失败',
        }, '*')
      } catch (e) {}
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
      window.location.replace((BASE || '') + '/#/login')
    })
})()
