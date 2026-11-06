import { mountMeetingRoomRuntime } from './meeting-room-runtime.js'

const LOADER_HTML = `
  <div class="ag-story__loader" data-ag-scene-loader role="status" aria-live="polite">
    <div class="ag-story__loader-mark" aria-hidden="true">
      <div class="ag-story__loader-glyph"><span></span></div>
    </div>
    <p class="ag-story__loader-text">虚拟会议室加载中<span class="ag-story__loader-dots"></span></p>
  </div>`

/**
 * Mount the packaged meeting-room scene (正对门禁版) into the story host.
 * @param {HTMLElement} host
 */
export function mountMeetingRoom3D(host) {
  if (!host) return null

  host.innerHTML = ''
  const loader = document.createElement('div')
  loader.innerHTML = LOADER_HTML.trim()
  const loaderEl = loader.firstElementChild
  host.appendChild(loaderEl)

  const mountRoot = document.createElement('div')
  mountRoot.style.cssText = 'position:absolute;inset:0;z-index:1'
  host.appendChild(mountRoot)

  const api = mountMeetingRoomRuntime(mountRoot, { cameraDistanceScale: 0.85 })
  if (!api) {
    loaderEl?.remove()
    return null
  }

  const canvas = mountRoot.querySelector('canvas')
  if (canvas) {
    canvas.classList.add('ag-story__canvas')
    canvas.style.opacity = '0'
    canvas.style.transition = 'opacity .4s ease'
  }

  let settled = false
  const finish = () => {
    if (settled) return
    settled = true
    if (canvas) {
      canvas.classList.add('is-ready')
      canvas.style.opacity = '1'
    }
    loaderEl?.classList.add('is-done')
    window.setTimeout(() => loaderEl?.remove(), 480)
    resolveReady()
  }

  let resolveReady = () => {}
  const ready = new Promise((resolve) => {
    resolveReady = resolve
  })

  let frames = 0
  const prevFrame = api._onFrame
  api._onFrame = (roomApi) => {
    frames += 1
    prevFrame?.(roomApi)
    if (frames >= 3) {
      api._onFrame = prevFrame
      finish()
    }
  }
  window.setTimeout(finish, 10000)

  api.ready = ready
  return api
}

export function syncStoryPinsTo3D(root, roomApi) {
  if (!roomApi || !root) return
  const byLabel = {
    人员进入: 0,
    环境已更新: 1,
    恢复环境: 1,
    照明开启: 3,
    灯全亮: 3,
    灯全关: 3,
    空调舒适模式: '3b',
    停止送风: '3b',
    信息屏更新: '3c',
    信息屏关闭: '3c',
    执行成功: 4,
  }
  root.querySelectorAll('[data-ag-pin-step]').forEach((pin) => {
    const label = pin.textContent.trim()
    const pos = roomApi.projectPin?.(byLabel[label] ?? Number(pin.dataset.agPinStep))
    if (!pos) return
    pin.style.left = `${pos.x}%`
    pin.style.top = `${pos.y}%`
  })
}
