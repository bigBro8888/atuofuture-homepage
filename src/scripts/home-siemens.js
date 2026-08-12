/** 首页西门子式模块交互：Hero 轮播、Tab、方案横滑 */

export function initSiemensHome() {
  initHeroCarousel()
  initCapabilityTabs()
  initSolutionsCarousel()
  bindDemoAnchors()
}

function bindDemoAnchors() {
  document.querySelectorAll('a[data-demo-modal-open]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (el.getAttribute('href') === '#') e.preventDefault()
    })
  })
}

function initHeroCarousel() {
  const root = document.querySelector('[data-sm-hero]')
  if (!root) return

  const slides = [...root.querySelectorAll('[data-sm-hero-slide]')]
  const dotsWrap = root.querySelector('[data-sm-hero-dots]')
  const prev = root.querySelector('[data-sm-hero-prev]')
  const next = root.querySelector('[data-sm-hero-next]')
  if (!slides.length || !dotsWrap) return

  let index = 0
  let timer = null

  slides.forEach((_, i) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'sm-hero__dot'
    btn.setAttribute('aria-label', `第 ${i + 1} 页`)
    btn.addEventListener('click', () => go(i))
    dotsWrap.appendChild(btn)
  })

  const dots = [...dotsWrap.querySelectorAll('.sm-hero__dot')]

  function go(i) {
    index = (i + slides.length) % slides.length
    slides.forEach((s, n) => s.classList.toggle('is-active', n === index))
    dots.forEach((d, n) => d.classList.toggle('is-active', n === index))
    restart()
  }

  function restart() {
    clearInterval(timer)
    timer = setInterval(() => go(index + 1), 7000)
  }

  prev?.addEventListener('click', () => go(index - 1))
  next?.addEventListener('click', () => go(index + 1))
  root.addEventListener('mouseenter', () => clearInterval(timer))
  root.addEventListener('mouseleave', restart)

  go(0)
}

function initCapabilityTabs() {
  const root = document.querySelector('[data-sm-tabs]')
  if (!root) return

  const tabs = [...root.querySelectorAll('[data-sm-tab]')]
  const panels = [...root.querySelectorAll('[data-sm-panel]')]

  function activate(id) {
    tabs.forEach((tab) => {
      const on = tab.dataset.smTab === id
      tab.classList.toggle('is-active', on)
      tab.setAttribute('aria-selected', on ? 'true' : 'false')
    })
    panels.forEach((panel) => {
      const on = panel.dataset.smPanel === id
      panel.classList.toggle('is-active', on)
      panel.hidden = !on
    })
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.dataset.smTab))
  })
}

function initSolutionsCarousel() {
  const root = document.querySelector('[data-sm-sol-carousel]')
  if (!root) return

  const track = root.querySelector('[data-sm-sol-track]')
  const prev = root.querySelector('[data-sm-sol-prev]')
  const next = root.querySelector('[data-sm-sol-next]')
  if (!track) return

  const step = () => {
    const card = track.querySelector('.sm-sol-card')
    return card ? card.getBoundingClientRect().width + 24 : 360
  }

  prev?.addEventListener('click', () => {
    track.scrollBy({ left: -step(), behavior: 'smooth' })
  })
  next?.addEventListener('click', () => {
    track.scrollBy({ left: step(), behavior: 'smooth' })
  })
}
