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

  const controls = root.querySelector('.sm-hero__controls')
  const slides = [...root.querySelectorAll('[data-sm-hero-slide]')]
  const dotsWrap = root.querySelector('[data-sm-hero-dots]')
  const prev = root.querySelector('[data-sm-hero-prev]')
  const next = root.querySelector('[data-sm-hero-next]')
  const pauseBtn = root.querySelector('[data-sm-hero-pause]')
  if (!slides.length || !dotsWrap) return

  const INTERVAL = 5000
  let index = 0
  let paused = false
  let raf = 0
  let startedAt = 0

  slides.forEach((_, i) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'sm-hero__dot'
    btn.setAttribute('aria-label', `第 ${i + 1} 页`)
    btn.addEventListener('click', () => go(i))
    dotsWrap.appendChild(btn)
  })

  const dots = [...dotsWrap.querySelectorAll('.sm-hero__dot')]

  function setProgress(value) {
    const v = Math.max(0, Math.min(1, value))
    root.style.setProperty('--sm-hero-autoplay-progress', String(v))
    controls?.style.setProperty('--sm-hero-autoplay-progress', String(v))
  }

  function stopProgress() {
    cancelAnimationFrame(raf)
    raf = 0
  }

  function tickProgress(now) {
    if (paused) return
    const elapsed = now - startedAt
    setProgress(elapsed / INTERVAL)
    if (elapsed >= INTERVAL) {
      go(index + 1)
      return
    }
    raf = requestAnimationFrame(tickProgress)
  }

  function startProgress() {
    stopProgress()
    if (paused) {
      setProgress(0)
      return
    }
    startedAt = performance.now()
    setProgress(0)
    raf = requestAnimationFrame(tickProgress)
  }

  function go(i) {
    index = (i + slides.length) % slides.length
    slides.forEach((s, n) => s.classList.toggle('is-active', n === index))
    dots.forEach((d, n) => {
      d.classList.toggle('is-active', n === index)
      d.toggleAttribute('aria-current', n === index)
    })
    startProgress()
  }

  function setPaused(nextPaused) {
    paused = nextPaused
    pauseBtn?.classList.toggle('is-paused', paused)
    pauseBtn?.setAttribute('aria-pressed', paused ? 'true' : 'false')
    pauseBtn?.setAttribute('aria-label', paused ? '播放自动轮播' : '暂停自动轮播')
    if (paused) stopProgress()
    else startProgress()
  }

  prev?.addEventListener('click', () => {
    go(index - 1)
  })
  next?.addEventListener('click', () => {
    go(index + 1)
  })
  pauseBtn?.addEventListener('click', () => setPaused(!paused))

  go(0)
}

function initCapabilityTabs() {
  const root = document.querySelector('[data-sm-tabs]')
  if (!root) return

  const nav = root.querySelector('.sm-tabs__nav')
  const tabs = [...root.querySelectorAll('[data-sm-tab]')]
  const panels = [...root.querySelectorAll('[data-sm-panel]')]
  let indicator = root.querySelector('.sm-tabs__indicator')
  let activeId = tabs.find((tab) => tab.classList.contains('is-active'))?.dataset.smTab || tabs[0]?.dataset.smTab
  let leaveTimer = 0

  if (nav && !indicator) {
    indicator = document.createElement('span')
    indicator.className = 'sm-tabs__indicator'
    indicator.setAttribute('aria-hidden', 'true')
    nav.prepend(indicator)
  }

  function moveIndicator(tab, instant = false) {
    if (!indicator || !nav || !tab) return
    const navRect = nav.getBoundingClientRect()
    const tabRect = tab.getBoundingClientRect()
    const horizontal = window.getComputedStyle(nav).flexDirection === 'row'

    if (instant) indicator.style.transition = 'none'
    if (horizontal) {
      indicator.style.width = `${tabRect.width}px`
      indicator.style.height = '3px'
      indicator.style.transform = `translate3d(${tabRect.left - navRect.left}px, ${tabRect.bottom - navRect.top - 3}px, 0)`
    } else {
      indicator.style.width = '3px'
      indicator.style.height = `${tabRect.height}px`
      indicator.style.transform = `translate3d(0, ${tabRect.top - navRect.top}px, 0)`
    }
    if (instant) {
      indicator.offsetHeight
      indicator.style.transition = ''
    }
  }

  function activate(id, { instant = false } = {}) {
    if (!id || (id === activeId && !instant)) return
    const nextTab = tabs.find((tab) => tab.dataset.smTab === id)
    const nextPanel = panels.find((panel) => panel.dataset.smPanel === id)
    const prevPanel = panels.find((panel) => panel.classList.contains('is-active'))
    if (!nextTab || !nextPanel) return

    activeId = id
    clearTimeout(leaveTimer)

    tabs.forEach((tab) => {
      const on = tab === nextTab
      tab.classList.toggle('is-active', on)
      tab.setAttribute('aria-selected', on ? 'true' : 'false')
    })
    moveIndicator(nextTab, instant)

    if (prevPanel && prevPanel !== nextPanel) {
      prevPanel.classList.remove('is-active')
      prevPanel.classList.add('is-leaving')
      leaveTimer = window.setTimeout(() => {
        prevPanel.classList.remove('is-leaving')
        prevPanel.hidden = true
      }, 280)
    }

    panels.forEach((panel) => {
      if (panel === nextPanel || panel === prevPanel) return
      panel.classList.remove('is-active', 'is-leaving')
      panel.hidden = true
    })

    nextPanel.hidden = false
    nextPanel.classList.remove('is-leaving')
    if (instant) {
      nextPanel.classList.add('is-active')
      return
    }
    nextPanel.classList.remove('is-active')
    nextPanel.offsetHeight
    requestAnimationFrame(() => nextPanel.classList.add('is-active'))
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.dataset.smTab))
  })

  activate(activeId, { instant: true })
  window.addEventListener('resize', () => {
    const current = tabs.find((tab) => tab.dataset.smTab === activeId)
    moveIndicator(current, true)
  })
}

function initSolutionsCarousel() {
  const root = document.querySelector('[data-sm-sol-carousel]')
  if (!root) return

  const track = root.querySelector('[data-sm-sol-track]')
  const dotsWrap = root.querySelector('[data-sm-sol-dots]')
  const prev = root.querySelector('[data-sm-sol-prev]')
  const next = root.querySelector('[data-sm-sol-next]')
  const cards = [...root.querySelectorAll('.sm-sol-card')]
  if (!track || !dotsWrap || !cards.length) return

  let page = 0

  function perPage() {
    if (window.innerWidth <= 720) return 1
    if (window.innerWidth <= 1100) return 2
    return 3
  }

  function pageCount() {
    return Math.max(1, Math.ceil(cards.length / perPage()))
  }

  function renderDots() {
    const count = pageCount()
    dotsWrap.innerHTML = ''
    for (let i = 0; i < count; i += 1) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'sm-sol-pager__dot'
      btn.setAttribute('aria-label', `第 ${i + 1} 组`)
      btn.addEventListener('click', () => go(i))
      dotsWrap.appendChild(btn)
    }
  }

  function go(i) {
    const count = pageCount()
    page = Math.max(0, Math.min(i, count - 1))
    const first = cards[page * perPage()]
    const offset = first ? first.offsetLeft : 0
    track.style.transform = `translateX(-${offset}px)`
    dotsWrap.querySelectorAll('.sm-sol-pager__dot').forEach((dot, n) => {
      dot.classList.toggle('is-active', n === page)
    })
    if (prev) prev.disabled = page === 0
    if (next) next.disabled = page >= count - 1
  }

  prev?.addEventListener('click', () => go(page - 1))
  next?.addEventListener('click', () => go(page + 1))
  window.addEventListener('resize', () => {
    renderDots()
    go(Math.min(page, pageCount() - 1))
  })

  renderDots()
  go(0)
}
