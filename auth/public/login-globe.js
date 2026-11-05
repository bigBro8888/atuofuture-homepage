import createGlobe from './vendor/cobe.js'

const canvas = document.querySelector('[data-login-globe]')
const compact = window.matchMedia('(max-width: 860px)')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let globe = null
let raf = 0
let phi = 2.35

function stop() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

function tick() {
  phi += 0.0024
  globe.update({ phi })
  raf = requestAnimationFrame(tick)
}

function mount() {
  stop()
  globe?.destroy()
  globe = null
  if (!canvas || compact.matches) return
  const width = Math.max(canvas.clientWidth, 320)
  const height = Math.max(canvas.clientHeight, 220)
  globe = createGlobe(canvas, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    width,
    height,
    phi,
    theta: 0.18,
    dark: 1,
    diffuse: 1.4,
    mapSamples: 26000,
    mapBrightness: 7,
    mapBaseBrightness: 0.04,
    baseColor: [0.32, 0.46, 0.95],
    markerColor: [0.55, 0.95, 1],
    glowColor: [0.16, 0.3, 0.85],
    opacity: 0.95,
    scale: 1.6,
    offset: [0, Math.round(height * 0.46)],
    markers: [],
    context: { alpha: true, antialias: true },
  })
  canvas.classList.add('is-ready')
  if (!reducedMotion) raf = requestAnimationFrame(tick)
}

if (canvas) {
  mount()
  let resizeTimer = 0
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(mount, 200)
  })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else if (globe && !reducedMotion && !raf) raf = requestAnimationFrame(tick)
  })
}
