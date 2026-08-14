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

const HOME_AGENT_CASES = {
  space: {
    scene: '总部办公',
    title: '人一进办公室，灯和空调自己开了',
    story: '行政不用再逐间开关。有人来就准备好环境，人走了自动降载，设备异常直接派工单。',
  },
  energy: {
    scene: '楼宇节能',
    title: '没人的会议室，不再空转一整晚',
    story: '能耗不再只看总表。空着就降载，异常用电及时告警，月底能说清电花在哪。',
  },
  meeting: {
    scene: '会议室',
    title: '开会前十分钟，投影和空调已经准备好',
    story: '预约确认后，签到、开门、开灯、接通云视频按顺序完成。开完会，房间自动复位。',
  },
  exhibition: {
    scene: '企业展厅',
    title: '参观走到哪，大屏和讲解跟到哪',
    story: '讲解不用靠人临时切内容。灯光、孪生和大屏按动线切换，参观体验每次都一样稳。',
  },
  visitor: {
    scene: '大堂接待',
    title: '访客到门口，通行和接待已经安排好',
    story: '邀约发出后，登记、门禁、停车和接待人通知一次完成。客人走了，权限自动收回。',
  },
  opc: {
    scene: '商业招商',
    title: '一套房源，从带看到签约不断档',
    story: '可租空间统一上架，客户线上看、预约带看、签约回传，招商不用在多个系统里来回搬。',
  },
  hospitality: {
    scene: '酒店公寓',
    title: '办完入住，门锁和房间已经准备好',
    story: '分房、授权、客房设备和水电计费连在一条链上。退房后权限回收，房态自动复位。',
  },
  asset: {
    scene: '资产盘点',
    title: '设备在哪、谁借走了，当场能查到',
    story: '盘点、领用、借还不再靠表格对。位置和状态留痕，找设备和审计都更快。',
  },
}

function mountHomeAgentStories() {
  const root = document.querySelector('[data-home-agent-stories]')
  if (!root) return

  root.innerHTML = `
    <div class="sm-tabs__nav" role="tablist" aria-orientation="vertical" aria-label="空间场景">
      <span class="sm-tabs__indicator" aria-hidden="true"></span>
      ${AGENTS_OVERVIEW.map(
        (a, i) => `
        <button
          type="button"
          class="sm-tabs__tab${i === 0 ? ' is-active' : ''}"
          role="tab"
          aria-selected="${i === 0 ? 'true' : 'false'}"
          data-sm-tab="${esc(a.id)}"
        >${esc(a.shortName)}</button>`
      ).join('')}
    </div>
    <div class="sm-tabs__panels">
      ${AGENTS_OVERVIEW.map((a, i) => {
        const c = HOME_AGENT_CASES[a.id] || { scene: a.shortName, title: a.value, story: a.blurb }
        return `
        <div class="sm-tabs__panel${i === 0 ? ' is-active' : ''}" data-sm-panel="${esc(a.id)}" role="tabpanel"${i ? ' hidden' : ''}>
          <article class="sm-story">
            <div class="sm-story__media" style="background-image:url('${esc(a.sceneImage)}')">
              <div class="sm-story__caption">
                <span>场景故事 · ${esc(c.scene)}</span>
                <strong>${esc(c.title)}</strong>
              </div>
            </div>
            <div class="sm-story__copy">
              <p class="sm-story__lead">${esc(c.story)}</p>
              <ol class="sm-story__flow">
                <li>
                  <span>当时</span>
                  <p>${esc(a.trigger)}</p>
                </li>
                <li>
                  <span>系统做了</span>
                  <p>${esc(a.action)}</p>
                </li>
                <li>
                  <span>结果</span>
                  <p>${esc(a.result)}</p>
                </li>
              </ol>
              <a class="sm-text-link" href="agent-detail/?id=${encodeURIComponent(a.id)}">
                看这个场景怎么落地
                <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </a>
            </div>
          </article>
        </div>`
      }).join('')}
    </div>
  `
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

  root.classList.add('ha-hero')
  const track = root.querySelector('[data-sm-hero-track]')
  if (track) mountHomeAdvantages(track)

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

  prev?.addEventListener('click', () => go(index - 1))
  next?.addEventListener('click', () => go(index + 1))
  pauseBtn?.addEventListener('click', () => setUserPaused(!userPaused))

  root.addEventListener(
    'touchstart',
    (e) => {
      const t = e.changedTouches[0]
      if (!t) return
      touchActive = true
      touchStartX = t.clientX
      touchStartY = t.clientY
    },
    { passive: true }
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
    { passive: true }
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
  })

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
  }

  if (reduceMotion) setUserPaused(true)
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
