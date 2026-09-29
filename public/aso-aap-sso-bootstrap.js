/**
 * 注入到 AAP 网关页（由 nginx sub_filter 挂到 /aso-aap/ 反代入口）。
 *
 * 作用只有一个：把 AAP 运行时对根路径 /api、/assets 等的请求，改写到 /aso-aap 前缀下，
 * 否则这些请求会打到门户自身而失败。这里不做任何自动登录——用户在嵌入页里用自己的
 * AAP 账号登录（AAP 没有原生 SSO，且不允许共用账号）。
 */
;(function () {
  var BASE = location.pathname.indexOf('/aso-aap') === 0 ? '/aso-aap' : ''
  if (!BASE) return

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
})()
