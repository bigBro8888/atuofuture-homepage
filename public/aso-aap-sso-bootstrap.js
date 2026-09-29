/**
 * 注入到 AAP 网关页（由 nginx sub_filter 挂到 /aso-aap/ 反代入口）。
 *
 * 职责：
 * 1) 把 AAP 运行时对根路径 /api、/assets 等的请求改写到 /aso-aap 前缀下，否则会打到门户自身而失败。
 * 2) 从门户进入时（URL 带 embed=1）强制清掉浏览器里残留的 AAP 登录态，保证每次都先显示登录页，
 *    不复用上一次的会话（AAP 前端靠 localStorage.user 判断是否已登录）。不做任何自动登录——
 *    用户在嵌入页里用自己的 AAP 账号登录。
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

  // 从门户进入：清掉残留登录态，强制回到登录页（AAP 前端靠 localStorage.user 判断是否已登录）
  var params = new URLSearchParams(window.location.search)
  if (params.get('embed') === '1') {
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('permission')
      localStorage.removeItem('token')
    } catch (e) {}
    // 去掉 embed 标记，避免后续刷新反复清理
    params.delete('embed')
    var next = params.toString()
    var clean = window.location.pathname + (next ? '?' + next : '') + window.location.hash
    window.history.replaceState({}, '', clean)
  }
})()
