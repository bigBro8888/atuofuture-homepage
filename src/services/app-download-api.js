const APP_API = '/api/public/apps/artink'

export function detectPlatform(userAgent = globalThis.navigator?.userAgent || '', navigatorLike = globalThis.navigator || {}) {
  const ua = userAgent.toLowerCase()
  const isWechat = /micromessenger|wxwork/.test(ua)
  const isDingTalk = /dingtalk|aliapp\(dingtalk/i.test(ua)
  const isAndroid = /android|harmonyos/.test(ua)
  const isIOS = /iphone|ipad|ipod/.test(ua) || (navigatorLike.platform === 'MacIntel' && navigatorLike.maxTouchPoints > 1)

  return {
    name: isAndroid ? 'android' : isIOS ? 'ios' : 'desktop',
    isWechat,
    isDingTalk,
    isAndroid,
    isIOS,
  }
}

export async function getAppConfig(signal) {
  const response = await fetch(APP_API, {
    signal,
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  })
  if (!response.ok) throw new Error(`版本服务暂不可用（${response.status}）`)
  return response.json()
}

export function getDownloadLinks(config) {
  const iosReady = Boolean(config?.platforms?.ios?.available && (config.platforms.ios.downloadUrl || config.platforms.ios.storeUrl))
  return {
    android: `${APP_API}/android/download`,
    ios: iosReady ? `${APP_API}/ios/download` : '#',
    androidQr: `${APP_API}/qr?platform=android`,
    iosQr: `${APP_API}/qr?platform=ios`,
  }
}
