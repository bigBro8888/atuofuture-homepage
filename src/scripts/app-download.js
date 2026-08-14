import { detectPlatform, getAppConfig, getDownloadLinks } from '../services/app-download-api.js'

const detected = detectPlatform()
const body = document.body
const primary = document.querySelector('[data-primary-download]')
const deviceMessage = document.querySelector('[data-device-message]')
const guideTitle = document.querySelector('[data-guide-title]')
const switchButton = document.querySelector('[data-platform-switch]')
const browserGuide = document.querySelector('[data-browser-guide]')
const browserGuideMessage = document.querySelector('[data-browser-guide-message]')
const externalBrowserButton = document.querySelector('[data-open-external]')
const wechatMask = document.querySelector('[data-wechat-mask]')
const wechatMaskTitle = document.querySelector('[data-wechat-mask-title]')
const wechatMaskText = document.querySelector('[data-wechat-mask-text]')
const wechatCopyButton = document.querySelector('[data-wechat-copy]')
let activePlatform = detected.isIOS ? 'ios' : detected.isAndroid ? 'android' : 'desktop'
let links = {
  android: '/api/public/apps/artink/android/download',
  ios: '/api/public/apps/artink/ios/download',
  androidQr: '/api/public/apps/artink/qr?platform=android',
}
let androidTrackingUrl = ''
let iosTrackingUrl = ''
let buttons = {
  androidLabel: '立即下载 {version}',
  iosLabel: '前往 App Store',
  switchToAndroid: '需要 Android 版本？',
  switchToIos: '需要 iPhone 版本？',
  switchToAndroidTag: 'Android',
  switchToIosTag: 'iOS',
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => { element.textContent = value })
}

// 展示图完全依赖后台配置，未配置时隐藏整块占位，避免留下空白卡片。
function hideHeroVisual() {
  const visual = document.querySelector('.download-hero__visual')
  if (visual) visual.style.display = 'none'
}

function setSwitchTag(value) {
  document.querySelectorAll('[data-switch-icon]').forEach((element) => {
    element.textContent = value
    element.hidden = !value
  })
}

function setHref(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.href = value || '#'
    element.setAttribute('aria-disabled', String(!value || value === '#'))
  })
}

function androidBrowserIntent() {
  const url = new URL(window.location.href)
  const scheme = url.protocol.replace(':', '')
  return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${scheme};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`
}

function openExternalBrowser() {
  if (!detected.isAndroid) return
  window.location.href = androidBrowserIntent()
}

function isApiDownload(url = '') {
  return /\/api\/public\/apps\/artink\/(android|ios)\/download/.test(url)
}

function trackIfNeeded(url, trackingUrl) {
  if (!trackingUrl || isApiDownload(url) || !navigator.sendBeacon) return
  navigator.sendBeacon(trackingUrl)
}

function openIOSStore() {
  if (links.ios === '#') return
  trackIfNeeded(links.ios, iosTrackingUrl)
  window.location.assign(links.ios)
}

function openExternalTarget() {
  if (detected.isIOS) openIOSStore()
  else openExternalBrowser()
}

function showWechatGuide() {
  if (!wechatMask) return
  const iosFlow = activePlatform === 'ios'
  wechatMaskTitle.textContent = iosFlow ? '请在 Safari 中打开' : '请在浏览器中打开'
  wechatMaskText.textContent = iosFlow
    ? '微信无法直接跳转 App Store，请点击右上角「…」，选择“在 Safari 中打开”，即可前往下载。'
    : '微信内无法直接安装安装包，请点击右上角「…」，选择“在浏览器打开”，即可继续下载。'
  wechatMask.classList.add('is-open')
  wechatMask.setAttribute('aria-hidden', 'false')
}

function hideWechatGuide() {
  wechatMask?.classList.remove('is-open')
  wechatMask?.setAttribute('aria-hidden', 'true')
}

async function copyPageLink() {
  const link = window.location.href
  try {
    await navigator.clipboard.writeText(link)
  } catch {
    const holder = document.createElement('textarea')
    holder.value = link
    holder.setAttribute('readonly', '')
    holder.style.position = 'fixed'
    holder.style.opacity = '0'
    document.body.append(holder)
    holder.select()
    document.execCommand('copy')
    holder.remove()
  }
  wechatCopyButton.textContent = '链接已复制，去浏览器粘贴打开'
  window.setTimeout(() => { wechatCopyButton.textContent = '复制页面链接' }, 2600)
}

function renderPlatform() {
  body.dataset.platform = activePlatform
  const isIOS = activePlatform === 'ios'
  const isAndroid = activePlatform === 'android'

  const version = document.querySelector('[data-android-version]')?.textContent || ''

  if (isIOS) {
    deviceMessage.textContent = '已为您识别 iPhone / iPad'
    guideTitle.textContent = '安装指南'
    primary.href = links.ios
    primary.querySelector('[data-primary-icon]').textContent = '↗'
    primary.querySelector('[data-primary-label]').textContent = links.ios === '#' ? 'App Store 暂未配置' : buttons.iosLabel
    primary.setAttribute('aria-disabled', String(links.ios === '#'))
    setText('[data-switch-label]', buttons.switchToAndroid)
    setSwitchTag(buttons.switchToAndroidTag)
  } else {
    deviceMessage.textContent = isAndroid ? '已为您识别 Android 设备' : '请选择适合您设备的版本'
    guideTitle.textContent = isAndroid ? 'Android 安装说明' : '简单三步，开启未来办公'
    primary.href = links.android
    primary.querySelector('[data-primary-icon]').textContent = '↓'
    primary.querySelector('[data-primary-label]').textContent = buttons.androidLabel.replace('{version}', version).trim()
    primary.setAttribute('aria-disabled', String(links.android === '#'))
    setText('[data-switch-label]', buttons.switchToIos)
    setSwitchTag(buttons.switchToIosTag)
  }
}

function guardAndroidDownload(event) {
  if (!detected.isWechat && !detected.isDingTalk) return false
  event.preventDefault()
  if (detected.isWechat) {
    showWechatGuide()
    return true
  }
  browserGuide?.classList.add('is-open')
  browserGuide?.setAttribute('aria-hidden', 'false')
  openExternalBrowser()
  return true
}

function startAndroidDownload(event) {
  if (guardAndroidDownload(event)) return
  const target = event.currentTarget
  const href = target?.href
  if (!href || href.endsWith('#') || target.getAttribute('aria-disabled') === 'true') return

  event.preventDefault()
  trackIfNeeded(href, androidTrackingUrl)
  deviceMessage.textContent = '正在启动下载，真实进度请在系统通知栏中查看'
  primary.classList.add('is-starting')
  primary.querySelector('[data-primary-icon]').textContent = '↓'
  primary.querySelector('[data-primary-label]').textContent = '正在启动下载…'

  window.setTimeout(() => {
    window.location.assign(href)
    window.setTimeout(() => {
      primary.classList.remove('is-starting')
      renderPlatform()
    }, 3500)
  }, 120)
}

function startIOSDownload(event) {
  const href = event.currentTarget?.href
  if (!href || href.endsWith('#') || event.currentTarget.getAttribute('aria-disabled') === 'true') return
  event.preventDefault()
  if (detected.isWechat) {
    showWechatGuide()
    return
  }
  openIOSStore()
}

function bindInteractions() {
  document.querySelectorAll('[data-android-download]').forEach((element) => element.addEventListener('click', startAndroidDownload))
  document.querySelectorAll('[data-ios-download]').forEach((element) => element.addEventListener('click', startIOSDownload))
  primary.addEventListener('click', (event) => {
    if (activePlatform === 'android') startAndroidDownload(event)
    if (activePlatform === 'ios') startIOSDownload(event)
  })

  switchButton?.addEventListener('click', () => {
    activePlatform = activePlatform === 'ios' ? 'android' : 'ios'
    renderPlatform()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  document.querySelector('[data-guide-close]')?.addEventListener('click', () => {
    browserGuide.classList.remove('is-open')
    browserGuide.setAttribute('aria-hidden', 'true')
  })
  externalBrowserButton?.addEventListener('click', openExternalTarget)
  wechatCopyButton?.addEventListener('click', copyPageLink)
  document.querySelector('[data-wechat-mask-close]')?.addEventListener('click', hideWechatGuide)
  wechatMask?.addEventListener('click', (event) => {
    if (event.target === wechatMask) hideWechatGuide()
  })
}

async function init() {
  body.dataset.platform = activePlatform
  if (detected.isDingTalk && detected.isAndroid) {
    browserGuide?.classList.add('is-open')
    browserGuide?.setAttribute('aria-hidden', 'false')
    browserGuideMessage.textContent = '正在尝试打开系统浏览器，如未跳转请点击右侧按钮'
    externalBrowserButton.hidden = false
    const attemptKey = `dingtalk-external:${window.location.pathname}`
    try {
      if (!sessionStorage.getItem(attemptKey)) {
        sessionStorage.setItem(attemptKey, '1')
        window.setTimeout(openExternalBrowser, 350)
      }
    } catch {
      window.setTimeout(openExternalBrowser, 350)
    }
  }

  try {
    const config = await getAppConfig()
    links = getDownloadLinks(config)
    androidTrackingUrl = config.platforms.android.trackingUrl || ''
    iosTrackingUrl = config.platforms.ios.trackingUrl || ''
    if (config.buttons) buttons = { ...buttons, ...config.buttons }
    const version = config.platforms.android.version ? `V${config.platforms.android.version}` : '--'

    setText('[data-android-version]', version)
    setText('[data-android-button-label]', `安卓下载 ${version}`)
    setHref('[data-android-download]', links.android)
    setHref('[data-ios-download]', links.ios)
    setHref('[data-privacy-link]', config.privacyUrl)
    setHref('[data-terms-link]', config.termsUrl)
    if (config.name) {
      setText('[data-app-name]', config.name)
      document.title = `${config.name}下载`
    }
    setText('[data-download-title]', config.downloadTitle || config.name)
    setText('[data-download-subtitle]', config.downloadSubtitle || '随时随地，连接并管理智能空间')
    setText('[data-download-description]', config.downloadDescription || config.description)
    if (config.desktopBannerUrl) {
      document.querySelector('.download-hero')?.style.setProperty('--download-desktop-banner', `url("${config.desktopBannerUrl}")`)
    }
    if (config.iconUrl) {
      const icon = document.querySelector('[data-app-icon]')
      const fallback = document.querySelector('[data-app-icon-fallback]')
      icon.src = config.iconUrl
      icon.alt = `${config.name || 'App'} 图标`
      icon.hidden = false
      fallback.hidden = true
      icon.addEventListener('error', () => {
        icon.hidden = true
        fallback.hidden = false
      }, { once: true })
    }
    if (config.description) setText('[data-app-description]', config.description)
    if (config.heroImageUrl) {
      document.querySelectorAll('[data-hero-image]').forEach((image) => {
        image.src = config.heroImageUrl
      })
    } else {
      hideHeroVisual()
    }
    document.querySelectorAll('[data-android-qr]').forEach((image) => { image.src = links.androidQr })
    if (config.features) {
      if (config.features.title) setText('[data-features-title]', config.features.title)
      if (config.features.subtitle) setText('[data-features-subtitle]', config.features.subtitle)
      document.querySelectorAll('[data-feature-item]').forEach((card, index) => {
        const item = config.features.items?.[index]
        if (!item) return
        card.querySelector('.material-symbols-outlined').textContent = item.icon
        card.querySelector('h3').textContent = item.title
        card.querySelector('p').textContent = item.description
      })
    }
  } catch (error) {
    deviceMessage.textContent = error.message || '下载服务暂不可用，请稍后重试'
    hideHeroVisual()
  }

  renderPlatform()
  bindInteractions()
}

init()
