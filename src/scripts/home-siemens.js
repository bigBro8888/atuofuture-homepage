/** 首页西门子式模块交互：Hero 轮播、智能体故事、方案横滑 */

import { mountHomeAdvantages } from '../components/home-advantages/index.js'
import { HOME_ADVANTAGES_INTERVAL_MS } from '../data/home-advantages.js'
import { AGENTS_OVERVIEW } from '../data/agents-overview.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function initSiemensHome() {
  mountHomeAgentStories()
  initHeroCarousel()
  initCapabilityTabs()
  initSolutionsCarousel()
  bindDemoAnchors()
}

/** 首页长图：后续直接替换 public/images/home-agents/{id}.jpg */
const HOME_AGENT_BANNERS = {
  space: { title: '人员进入', caption: '灯光、空调和信息屏自动准备', image: '/images/home-agents/space.jpg' },
  energy: { title: '空间空闲', caption: '照明和空调按占用自动降载', image: '/images/home-agents/energy.jpg' },
  meeting: { title: '会前十分钟', caption: '门禁、投影和空调已经准备好', image: '/images/home-agents/meeting.jpg' },
  exhibition: { title: '参观走到哪', caption: '讲解、灯光和大屏跟着切换', image: '/images/home-agents/exhibition.jpg' },
  visitor: { title: '客户到访', caption: '门禁、派梯和接待人已安排', image: '/images/home-agents/visitor.jpg' },
  opc: { title: '房源上架', caption: '从带看到签约，招商不断档', image: '/images/home-agents/opc.jpg' },
  hospitality: { title: '办理入住', caption: '分房完成，门锁和客房已经准备好', image: '/images/home-agents/hospitality.jpg' },
  asset: { title: '现场盘点', caption: '设备在哪、谁借走了，当场能查到', image: '/images/home-agents/asset.jpg' },
}

function mountHomeAgentStories() {
  const root = document.querySelector('[data-home-agent-stories]')
  if (!root) return

  const total = AGENTS_OVERVIEW.length
  root.className = 'sm-agent-stage'
  root.innerHTML = `
    <div class="sm-agent-stage__frame">
      <div class="sm-agent-film" data-agent-film>
        ${AGENTS_OVERVIEW.map((a, i) => {
          const banner = HOME_AGENT_BANNERS[a.id] || {
            title: a.shortName,
            caption: a.blurb,
            image: a.sceneImage,
          }
          return `
          <article class="sm-agent-slide${i === 0 ? ' is-active' : ''}" data-agent-slide="${esc(a.id)}" aria-hidden="${i === 0 ? 'false' : 'true'}">
            <figure class="sm-agent-banner">
              <img src="${esc(banner.image)}" alt="${esc(a.name)}" />
              <figcaption>
                <strong>${esc(banner.title)}</strong>
                <span>${esc(banner.caption)}</span>
              </figcaption>
            </figure>
          </article>`
        }).join('')}
      </div>
    </div>
    <div class="sm-agent-scroll" data-agent-scroll>
      <button type="button" class="sm-agent-scroll__track" data-agent-scroll-track aria-label="切换智能体场景">
        <span class="sm-agent-scroll__thumb" data-agent-scroll-thumb style="width:${100 / total}%"></span>
      </button>
      <div class="sm-agent-scroll__marks" aria-hidden="true">
        ${AGENTS_OVERVIEW.map(() => '<span></span>').join('')}
      </div>
    </div>
    <div class="sm-agent-names" role="tablist" aria-label="空间智能体">
      <span class="sm-agent-names__ink" data-agent-ink aria-hidden="true"></span>
      ${AGENTS_OVERVIEW.map(
        (a, i) => `
        <button
          type="button"
          class="sm-agent-name${i === 0 ? ' is-active' : ''}"
          role="tab"
          aria-selected="${i === 0 ? 'true' : 'false'}"
          data-agent-tab="${esc(a.id)}"
        >${esc(a.name)}</button>`
      ).join('')}
    </div>
  `

  bindHomeAgentStage(root)
}

function bindHomeAgentStage(root) {
  const tabs = [...root.querySelectorAll('[data-agent-tab]')]
  const slides = [...root.querySelectorAll('[data-agent-slide]')]
  const film = root.querySelector('[data-agent-film]')
  const names = root.querySelector('.sm-agent-names')
  const ink = root.querySelector('[data-agent-ink]')
  const thumb = root.querySelector('[data-agent-scroll-thumb]')
  const trackBtn = root.querySelector('[data-agent-scroll-track]')
  if (!tabs.length || !slides.length || !film) return

  let index = 0
  let dragging = false
  let didDrag = false

  function moveInk(instant = false) {
    const tab = tabs[index]
    if (!ink || !names || !tab) return
    const navRect = names.getBoundingClientRect()
    const tabRect = tab.getBoundingClientRect()
    if (instant) ink.style.transition = 'none'
    ink.style.width = `${tabRect.width}px`
    ink.style.transform = `translate3d(${tabRect.left - navRect.left}px, 0, 0)`
    if (instant) {
      ink.offsetHeight
      ink.style.transition = ''
    }
  }

  function goTo(next, { instant = false } = {}) {
    const total = tabs.length
    const wrapped = ((next % total) + total) % total
    if (wrapped === index && !instant) return
    const prev = index
    index = wrapped

    tabs.forEach((tab, i) => {
      const on = i === index
      tab.classList.toggle('is-active', on)
      tab.setAttribute('aria-selected', on ? 'true' : 'false')
    })
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index)
      slide.classList.toggle('is-prev', i === prev && i !== index)
      slide.setAttribute('aria-hidden', i === index ? 'false' : 'true')
    })
    if (thumb) {
      thumb.style.width = `${100 / total}%`
      thumb.style.transform = `translate3d(${index * 100}%, 0, 0)`
    }
    moveInk(instant)
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => goTo(i))
  })

  trackBtn?.addEventListener('click', (e) => {
    if (didDrag) {
      didDrag = false
      return
    }
    const rect = trackBtn.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    goTo(Math.min(tabs.length - 1, Math.floor(ratio * tabs.length)))
  })

  trackBtn?.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return
    dragging = true
    didDrag = false
    trackBtn.setPointerCapture(e.pointerId)
  })
  trackBtn?.addEventListener('pointermove', (e) => {
    if (!dragging) return
    didDrag = true
    const rect = trackBtn.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    goTo(Math.round(ratio * (tabs.length - 1)))
  })
  trackBtn?.addEventListener('pointerup', () => {
    dragging = false
  })

  let touchX = 0
  film.addEventListener('touchstart', (e) => {
    touchX = e.changedTouches[0].clientX
  }, { passive: true })
  film.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 48) goTo(index + (dx < 0 ? 1 : -1))
  }, { passive: true })

  window.addEventListener('resize', () => moveInk(true))
  requestAnimationFrame(() => goTo(0, { instant: true }))
}

function bindDemoAnchors() {
  document.querySelectorAll('a[data-demo-modal-open]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (el.getAttribute('href') === '#') e.preventDefault()
    })
  })
}

function initHeroCarousel(customSlides) {
  const root = document.querySelector('[data-sm-hero]')
  if (!root) return

  if (root._heroAbort) root._heroAbort.abort()
  const abort = new AbortController()
  root._heroAbort = abort
  const { signal } = abort

  root.classList.add('ha-hero')
  const track = root.querySelector('[data-sm-hero-track]')
  if (track) mountHomeAdvantages(track, customSlides)

  const controls = root.querySelector('.sm-hero__controls')
  const slides = [...root.querySelectorAll('[data-sm-hero-slide]')]
  const dotsWrap = root.querySelector('[data-sm-hero-dots]')
  const prev = root.querySelector('[data-sm-hero-prev]')
  const next = root.querySelector('[data-sm-hero-next]')
  const pauseBtn = root.querySelector('[data-sm-hero-pause]')
  if (!slides.length || !dotsWrap) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const DEFAULT_INTERVAL = HOME_ADVANTAGES_INTERVAL_MS
  let index = 0
  let offscreenPaused = false
  let userPaused = reduceMotion
  let raf = 0
  let startedAt = 0
  /** 本段计时开始时已有的进度 0~1（离屏/手动暂停后从此续播） */
  let baseProgress = 0
  let touchStartX = 0
  let touchStartY = 0
  let touchActive = false

  function slideInterval(i) {
    const raw = Number(slides[i]?.dataset.haDwell)
    return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_INTERVAL
  }

  dotsWrap.innerHTML = ''
  slides.forEach((_, i) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'sm-hero__dot'
    btn.setAttribute('aria-label', `切换到第 ${i + 1} 页`)
    btn.addEventListener('click', () => go(i))
    dotsWrap.appendChild(btn)
  })

  const dots = [...dotsWrap.querySelectorAll('.sm-hero__dot')]

  function isAutoplayBlocked() {
    return userPaused || offscreenPaused || reduceMotion
  }

  function paintProgress(value) {
    const v = Math.max(0, Math.min(1, value))
    root.style.setProperty('--sm-hero-autoplay-progress', String(v))
    controls?.style.setProperty('--sm-hero-autoplay-progress', String(v))
    return v
  }

  function currentProgress() {
    if (!raf) return baseProgress
    return Math.min(1, baseProgress + (performance.now() - startedAt) / slideInterval(index))
  }

  function stopProgress() {
    cancelAnimationFrame(raf)
    raf = 0
  }

  function freezeProgress() {
    baseProgress = paintProgress(currentProgress())
    stopProgress()
  }

  function tickProgress(now) {
    if (isAutoplayBlocked()) return
    const next = baseProgress + (now - startedAt) / slideInterval(index)
    paintProgress(next)
    if (next >= 1) {
      go(index + 1)
      return
    }
    raf = requestAnimationFrame(tickProgress)
  }

  function startProgress({ reset = false } = {}) {
    stopProgress()
    if (reset) {
      baseProgress = 0
      paintProgress(0)
    }
    if (isAutoplayBlocked()) {
      paintProgress(baseProgress)
      return
    }
    startedAt = performance.now()
    raf = requestAnimationFrame(tickProgress)
  }

  function syncPauseUi() {
    pauseBtn?.classList.toggle('is-paused', userPaused)
    pauseBtn?.setAttribute('aria-pressed', userPaused ? 'true' : 'false')
    pauseBtn?.setAttribute('aria-label', userPaused ? '播放自动轮播' : '暂停自动轮播')
  }

  function preloadNeighbor(i) {
    const nextSlide = slides[(i + 1) % slides.length]
    const img = nextSlide?.querySelector('.ha-media__img')
    if (img?.dataset.preloaded === '1' || !img?.src) return
    const probe = new Image()
    probe.src = img.currentSrc || img.src
    img.dataset.preloaded = '1'
  }

  function go(i) {
    index = (i + slides.length) % slides.length
    slides.forEach((s, n) => {
      const on = n === index
      s.classList.toggle('is-active', on)
      s.setAttribute('aria-hidden', on ? 'false' : 'true')
    })
    dots.forEach((d, n) => {
      const on = n === index
      d.classList.toggle('is-active', on)
      if (on) d.setAttribute('aria-current', 'true')
      else d.removeAttribute('aria-current')
    })
    root.setAttribute('aria-live', 'polite')
    preloadNeighbor(index)
    syncPauseUi()
    startProgress({ reset: true })
  }

  function setUserPaused(nextPaused) {
    userPaused = nextPaused
    syncPauseUi()
    if (userPaused) freezeProgress()
    else startProgress({ reset: false })
  }

  prev?.addEventListener('click', () => go(index - 1), { signal })
  next?.addEventListener('click', () => go(index + 1), { signal })
  pauseBtn?.addEventListener('click', () => setUserPaused(!userPaused), { signal })

  root.addEventListener(
    'touchstart',
    (e) => {
      const t = e.changedTouches[0]
      if (!t) return
      touchActive = true
      touchStartX = t.clientX
      touchStartY = t.clientY
    },
    { passive: true, signal }
  )

  root.addEventListener(
    'touchend',
    (e) => {
      if (!touchActive) return
      touchActive = false
      const t = e.changedTouches[0]
      if (!t) return
      const dx = t.clientX - touchStartX
      const dy = t.clientY - touchStartY
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return
      if (dx < 0) go(index + 1)
      else go(index - 1)
    },
    { passive: true, signal }
  )

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const tag = (e.target instanceof Element ? e.target.tagName : '').toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) return
    const rect = root.getBoundingClientRect()
    const inView = rect.bottom > 80 && rect.top < window.innerHeight * 0.85
    if (!inView) return
    e.preventDefault()
    if (e.key === 'ArrowLeft') go(index - 1)
    else go(index + 1)
  }, { signal })

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        const wasOff = offscreenPaused
        offscreenPaused = !entry.isIntersecting
        root.classList.toggle('is-offscreen', offscreenPaused)
        if (offscreenPaused) freezeProgress()
        else if (wasOff && !isAutoplayBlocked()) startProgress({ reset: false })
      },
      { threshold: 0.15 }
    )
    io.observe(root)
    signal.addEventListener('abort', () => {
      io.disconnect()
      stopProgress()
    })
  }

  if (reduceMotion) setUserPaused(true)
  go(0)
}

const HERO_THEMES = ['overview', 'open-interface', 'ai-agent', 'wireless-access', 'layered-loop', 'hardware-system']

export function applyCmsHeroSlides(slides) {
  if (!Array.isArray(slides) || !slides.length) return
  initHeroCarousel(slides.map((item, index) => ({
    label: item.label || '',
    title: item.title || '',
    description: item.description || '',
    primaryAction: { label: item.actionLabel || '了解更多', href: item.actionHref || '#upgrade' },
    background: item.background || '/images/home-advantages/advantage-ai-agent.webp',
    themeClass: HERO_THEMES[index % HERO_THEMES.length],
  })))
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
