import { staticAssetUrl } from './static-assets.js'

const FAMILY = 'Alibaba PuHuiTi 3.0'
const CACHED_KEY = 'atuo:brand-fonts-cached'
const FACES = [
  { file: 'AlibabaPuHuiTi-3-55-Regular.woff2', weight: '400' },
  { file: 'AlibabaPuHuiTi-3-65-Medium.woff2', weight: '500' },
  { file: 'AlibabaPuHuiTi-3-85-Bold.woff2', weight: '600 900' },
]

let started = false

function readCachedFlag() {
  try {
    return localStorage.getItem(CACHED_KEY) === '1'
  } catch {
    return false
  }
}

function loadBrandFonts() {
  if (started || typeof FontFace === 'undefined' || !document.fonts) return
  started = true
  const faces = FACES.map((face) => new FontFace(
    FAMILY,
    `url('${staticAssetUrl(`assets/fonts/${face.file}`)}') format('woff2')`,
    { weight: face.weight, style: 'normal', display: 'swap' },
  ))
  // 三个字重全部就绪后一次性加入，页面只切换一次字体
  Promise.all(faces.map((face) => face.load()))
    .then((loaded) => {
      loaded.forEach((face) => document.fonts.add(face))
      try {
        localStorage.setItem(CACHED_KEY, '1')
      } catch {
        /* 隐私模式下无法写入时，下次仍按首访处理 */
      }
    })
    .catch(() => {})
}

/**
 * 首访先用系统字体，页面加载完、浏览器空闲时再后台下载品牌字体；
 * 曾经下载过的访客字体已在浏览器缓存中，立即加载以免看到切换。
 */
export function scheduleBrandFonts() {
  if (typeof window === 'undefined') return
  if (navigator.connection?.saveData) return
  if (readCachedFlag()) {
    loadBrandFonts()
    return
  }
  const start = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadBrandFonts, { timeout: 4000 })
    else window.setTimeout(loadBrandFonts, 1500)
  }
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
}
