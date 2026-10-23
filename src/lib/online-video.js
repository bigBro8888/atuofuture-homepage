/** 在线视频挂载：直链 mp4 / CDN / HLS(m3u8) */

const HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js'

let hlsLoader = null

function loadHlsScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.Hls) return Promise.resolve(window.Hls)
  if (hlsLoader) return hlsLoader
  hlsLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-hls-js]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Hls))
      existing.addEventListener('error', () => reject(new Error('hls load failed')))
      return
    }
    const script = document.createElement('script')
    script.src = HLS_CDN
    script.async = true
    script.dataset.hlsJs = '1'
    script.onload = () => resolve(window.Hls)
    script.onerror = () => reject(new Error('hls load failed'))
    document.head.appendChild(script)
  })
  return hlsLoader
}

export function isHlsUrl(url = '') {
  return /\.m3u8(\?|#|$)/i.test(String(url)) || /[?&](format|type)=m3u8\b/i.test(String(url))
}

export function isHttpVideoUrl(url = '') {
  const value = String(url || '').trim()
  if (!value) return false
  if (/^(\/|blob:|data:)/i.test(value)) return true
  return /^https?:\/\//i.test(value)
}

function destroyHls(videoEl) {
  if (videoEl?._hls) {
    try {
      videoEl._hls.destroy()
    } catch {
      /* ignore */
    }
    videoEl._hls = null
  }
}

/**
 * 把任意在线地址挂到 video 元素上（支持 mp4 CDN、淘宝云点播直链、m3u8）
 * @returns {Promise<boolean>} 是否已成功设置源
 */
export async function mountOnlineVideo(videoEl, src, { autoplay = false } = {}) {
  if (!videoEl || !src) return false
  const url = String(src).trim()
  if (!isHttpVideoUrl(url)) return false

  destroyHls(videoEl)
  videoEl.removeAttribute('src')
  while (videoEl.firstChild) videoEl.removeChild(videoEl.firstChild)

  try {
    if (isHlsUrl(url)) {
      const canNative = Boolean(videoEl.canPlayType('application/vnd.apple.mpegurl'))
      if (canNative) {
        videoEl.src = url
      } else {
        const Hls = await loadHlsScript()
        if (Hls?.isSupported?.()) {
          const hls = new Hls({ enableWorker: true })
          hls.loadSource(url)
          hls.attachMedia(videoEl)
          videoEl._hls = hls
        } else {
          videoEl.src = url
        }
      }
    } else {
      videoEl.src = url
    }
    videoEl.load?.()
    if (autoplay) {
      try {
        await videoEl.play()
      } catch {
        /* 自动播放可能被策略拦截，忽略 */
      }
    }
    return true
  } catch {
    videoEl.src = url
    videoEl.load?.()
    return true
  }
}

/** 扫描容器内带 data-online-video 的 video 并挂载 */
export function mountOnlineVideosIn(root = document) {
  if (!root?.querySelectorAll) return
  root.querySelectorAll('video[data-online-video]').forEach((video) => {
    const src = video.getAttribute('data-online-video') || video.getAttribute('src') || ''
    const autoplay = video.hasAttribute('autoplay')
    void mountOnlineVideo(video, src, { autoplay })
  })
}
