import { mountMeetingRoomRuntime } from './meeting-room-runtime.js'

const LOADER_HTML = `
  <div class="ag-story__loader" data-ag-scene-loader role="status" aria-live="polite">
    <div class="ag-story__loader-mark" aria-hidden="true">
      <div class="ag-story__loader-glyph"><span></span></div>
    </div>
    <p class="ag-story__loader-text">虚拟会议室加载中<span class="ag-story__loader-dots"></span></p>
  </div>`

function wirePersonDialog(sceneRoot, roomApi) {
  const dialog = sceneRoot?.querySelector('[data-ag-person-dialog]')
  if (!dialog || !roomApi?.onPersonDialog) return

  roomApi.onPersonDialog((open, seated) => {
    dialog.hidden = !open
    const sitBtn = dialog.querySelector('[data-person-action="sit"]')
    if (sitBtn) sitBtn.hidden = !!seated
  })

  if (dialog.dataset.bound !== '1') {
    dialog.dataset.bound = '1'
    dialog.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-person-action]')
      if (!btn || !dialog.contains(btn)) return
      roomApi.personAction?.(btn.dataset.personAction)
    })
  }

  const prevFrame = roomApi._onFrame
  roomApi._onFrame = (api) => {
    prevFrame?.(api)
    if (dialog.hidden) return
    const pos = api.projectPerson?.()
    if (!pos) {
      dialog.hidden = true
      return
    }
    dialog.style.left = `${Math.max(13, Math.min(87, pos.x))}%`
    dialog.style.top = `${Math.max(27, Math.min(76, pos.y))}%`
  }
}

/**
 * Mount the packaged meeting-room scene into the story host.
 * Waits for character GLB (and a few rendered frames) before revealing.
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
  mountRoot.style.cssText = 'position:absolute;inset:0;z-index:1;width:100%;height:100%'
  host.appendChild(mountRoot)

  const api = mountMeetingRoomRuntime(mountRoot, { cameraDistanceScale: 0.85 })
  if (!api) {
    loaderEl?.remove()
    return null
  }

  const canvas = mountRoot.querySelector('canvas')
  if (canvas) {
    canvas.classList.add('ag-story__canvas')
    canvas.style.cssText =
      'display:block;width:100%;height:100%;min-height:0;opacity:0;transition:opacity .4s ease;touch-action:none;cursor:grab'
  }

  const sceneRoot = host.closest('[data-ag-scene]') || host.parentElement
  wirePersonDialog(sceneRoot, api)

  // 人物未就绪前不要自动开进场/扫描
  api.setActive?.(false)

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

  const waitFramesAfterAssets = (needed = 3) =>
    new Promise((resolve) => {
      let frames = 0
      let done = false
      const prevFrame = api._onFrame
      api._onFrame = (roomApi) => {
        prevFrame?.(roomApi)
        if (done) return
        frames += 1
        if (frames >= needed) {
          done = true
          resolve()
        }
      }
    })

  void (async () => {
    try {
      await Promise.race([
        api.whenCharacterReady?.() ?? Promise.resolve(),
        new Promise((resolve) => window.setTimeout(resolve, 20000)),
      ])
      await waitFramesAfterAssets(3)
    } finally {
      finish()
    }
  })()

  api.ready = ready
  return api
}

export function syncStoryPinsTo3D(root, roomApi) {
  if (!roomApi || !root) return
  root.querySelectorAll('[data-ag-pin-step]').forEach((pin) => {
    pin.style.left = ''
    pin.style.top = ''
  })
}
