import '../styles/app-download.css'
import { detectPlatform, getAppConfig, getDownloadLinks } from '../services/app-download-api.js'

function modalTemplate(root) {
  return `
    <div class="app-download-modal" id="app-download-modal" aria-hidden="true">
      <button type="button" class="app-download-modal__backdrop" data-app-download-close aria-label="关闭下载弹窗"></button>
      <div class="app-download-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="app-download-modal-title">
        <button type="button" class="app-download-modal__close" data-app-download-close aria-label="关闭">
          <span class="material-symbols-outlined">close</span>
        </button>
        <div class="app-download-modal__visual">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAovsQl2O1v56gdWntwhN-nNMZIckeZpdP-d9k4zWgk4SM9C-Efn2fSRgc9SxBWGnB8jM_L6mx5AKAKhsS_t4WKqVb7AKyCMah6eM5plLImvMPS4_T40ms7UQWbhoctxI6f-ZxNp7XMSlPbAPq1ts6_jqPQflJCXn5PBZ-o6hwbvGbYA6IPwTzqeXBWyscZzqpW90oxAcqw9iek_5YLww2RSWOBDc8mE0Ty-HG5xXBzXWIoUe9qNLJb" alt="安托未来 App 界面" />
        </div>
        <div class="app-download-modal__content">
          <h2 id="app-download-modal-title" data-modal-app-name>安托未来 App</h2>
          <p data-modal-device-message>随时随地管理智能空间</p>
          <div class="app-download-modal__actions">
            <a href="#" data-modal-android-download><span class="material-symbols-outlined">android</span><span data-modal-android-label>Android 下载</span></a>
            <a href="#" data-modal-ios-download><span class="material-symbols-outlined">download</span>App Store</a>
          </div>
          <div class="app-download-modal__qr">
            <img data-modal-android-qr alt="Android 下载二维码" />
            <small>扫描二维码即刻体验</small>
          </div>
          <a class="app-download-modal__detail" href="${root}app-download/">查看完整介绍与安装帮助 <span class="material-symbols-outlined">arrow_forward</span></a>
        </div>
      </div>
    </div>
  `
}

export function initAppDownloadModal() {
  const openers = document.querySelectorAll('[data-app-download-open]')
  if (!openers.length) return

  const depth = Number(document.body.dataset.navDepth || 0)
  const root = depth > 0 ? '../'.repeat(depth) : './'
  document.body.insertAdjacentHTML('beforeend', modalTemplate(root))

  const modal = document.getElementById('app-download-modal')
  const dialog = modal.querySelector('.app-download-modal__dialog')
  const platform = detectPlatform()
  let loaded = false
  let previousFocus = null

  const close = () => {
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('app-download-modal-open')
    previousFocus?.focus()
  }

  const load = async () => {
    if (loaded) return
    try {
      const config = await getAppConfig()
      const links = getDownloadLinks(config)
      const android = modal.querySelector('[data-modal-android-download]')
      const ios = modal.querySelector('[data-modal-ios-download]')
      if (config.name) modal.querySelector('[data-modal-app-name]').textContent = config.name
      android.href = links.android
      ios.href = links.ios
      ios.setAttribute('aria-disabled', String(links.ios === '#'))
      modal.querySelector('[data-modal-android-label]').textContent = config.platforms.android.version
        ? `Android 下载 V${config.platforms.android.version}`
        : 'Android 下载'
      modal.querySelector('[data-modal-android-qr]').src = links.androidQr
      if (platform.isAndroid) modal.querySelector('[data-modal-device-message]').textContent = '已识别 Android 设备，为您推荐最新版 APK'
      if (platform.isIOS) modal.querySelector('[data-modal-device-message]').textContent = '已识别 Apple 设备，为您推荐 App Store'
      loaded = true
    } catch {
      modal.querySelector('[data-modal-device-message]').textContent = '版本服务暂不可用，请稍后再试'
    }
  }

  const open = (event) => {
    // 手机端直接进入整合后的自适应页面，避免在小屏继续套一层弹窗。
    if (matchMedia('(max-width: 760px)').matches) {
      window.location.href = `${root}app-download/`
      return
    }
    previousFocus = event.currentTarget
    modal.classList.add('is-open')
    modal.setAttribute('aria-hidden', 'false')
    document.body.classList.add('app-download-modal-open')
    load()
    window.setTimeout(() => modal.querySelector('[data-app-download-close]')?.focus(), 50)
  }

  openers.forEach((button) => button.addEventListener('click', open))
  modal.querySelectorAll('[data-app-download-close]').forEach((button) => button.addEventListener('click', close))
  modal.querySelector('[data-modal-android-download]').addEventListener('click', (event) => {
    if (!platform.isWechat) return
    event.preventDefault()
    window.location.href = `${root}app-download/`
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) close()
    if (event.key !== 'Tab' || !modal.classList.contains('is-open')) return
    const focusable = [...dialog.querySelectorAll('button, a[href]')].filter((element) => element.getAttribute('aria-disabled') !== 'true')
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })
}
