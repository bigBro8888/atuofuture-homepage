import { Router } from 'express'
import QRCode from 'qrcode'
import { config } from '../../config.js'
import { addRecord, db, normalizeAppButtons, normalizeAppFeatures } from '../../lib/store.js'
import { getLatestAndroidVersion } from './version-service.js'

export const publicAppsRouter = Router()

function appConfig() {
  return db().apps.find((app) => app.id === 'artink')
}

function clientInfo(request, platform) {
  const ua = String(request.get('user-agent') || '').slice(0, 260)
  const source = String(request.query.source || request.get('referer') || 'direct').slice(0, 300)
  const browser = /micromessenger/i.test(ua) ? 'wechat'
    : /edg/i.test(ua) ? 'edge'
      : /chrome/i.test(ua) ? 'chrome'
        : /safari/i.test(ua) ? 'safari'
          : 'other'
  return { appId: 'artink', event: 'download_click', platform, browser, source }
}

publicAppsRouter.get('/artink', async (request, response, next) => {
  try {
    const app = appConfig()
    if (!app?.published) return response.status(404).json({ error: 'app_not_available' })
    const android = await getLatestAndroidVersion()
    response.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
    response.json({
      id: app.id,
      name: app.name,
      description: app.description,
      iconUrl: app.iconUrl,
      heroImageUrl: app.heroImageUrl || '',
      desktopBannerUrl: app.desktopBannerUrl || '',
      downloadTitle: app.downloadTitle || app.name,
      downloadSubtitle: app.downloadSubtitle || '随时随地，连接并管理智能空间',
      downloadDescription: app.downloadDescription || app.description,
      features: normalizeAppFeatures(app.features),
      buttons: normalizeAppButtons(app.buttons),
      privacyUrl: app.privacyUrl,
      termsUrl: app.termsUrl,
      platforms: {
        android: {
          version: android.version,
          updatedAt: android.updatedAt,
          downloadUrl: android.apkUrl,
          trackingUrl: '/api/public/apps/artink/android/event',
          available: true,
          source: android.source,
        },
        ios: {
          storeUrl: app.iosStoreUrl || '',
          downloadUrl: app.iosStoreUrl || '',
          trackingUrl: app.iosStoreUrl ? '/api/public/apps/artink/ios/event' : '',
          available: Boolean(app.iosStoreUrl),
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

publicAppsRouter.post('/artink/android/event', async (request, response) => {
  await addRecord('downloadEvents', clientInfo(request, 'android'))
  response.status(204).end()
})

publicAppsRouter.get('/artink/android/download', async (request, response, next) => {
  try {
    const android = await getLatestAndroidVersion()
    await addRecord('downloadEvents', clientInfo(request, 'android'))
    response.set('Cache-Control', 'no-store')
    response.redirect(302, android.apkUrl)
  } catch (error) {
    next(error)
  }
})

publicAppsRouter.get('/artink/ios/download', async (request, response) => {
  const storeUrl = appConfig()?.iosStoreUrl
  if (!storeUrl) return response.status(404).json({ error: 'ios_not_configured' })
  await addRecord('downloadEvents', clientInfo(request, 'ios'))
  response.set('Cache-Control', 'no-store')
  response.redirect(302, storeUrl)
})

publicAppsRouter.post('/artink/ios/event', async (request, response) => {
  await addRecord('downloadEvents', clientInfo(request, 'ios'))
  response.status(204).end()
})

publicAppsRouter.get('/artink/qr', async (request, response, next) => {
  try {
    const platform = request.query.platform === 'ios' ? 'ios' : 'android'
    const app = appConfig()
    if (platform === 'ios' && !app?.iosStoreUrl) return response.status(404).end()
    const target = platform === 'android'
      ? `${config.publicBaseUrl}/api/public/apps/artink/android/download?source=qr`
      : `${config.publicBaseUrl}/api/public/apps/artink/ios/download?source=qr`
    const svg = await QRCode.toString(target, {
      type: 'svg',
      margin: 1,
      color: { dark: '#102247', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
    response.type('image/svg+xml').set('Cache-Control', 'public, max-age=300').send(svg)
  } catch (error) {
    next(error)
  }
})
