const HOME_CONTENT_API = '/api/public/pages/home'

export async function getHomeContent(signal) {
  const controller = signal ? null : new AbortController()
  const timeout = controller ? window.setTimeout(() => controller.abort(), 800) : null
  try {
    const response = await fetch(HOME_CONTENT_API, {
      signal: signal || controller.signal,
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    })
    if (!response.ok) throw new Error(`首页内容服务暂不可用（${response.status}）`)
    return response.json()
  } finally {
    if (timeout) window.clearTimeout(timeout)
  }
}
