import { initAgentChat } from '../components/agent-chat.js'
import { initSiteNav } from '../components/site-nav.js'
import { initHardwareStore } from './hardware-store.js'
import { initAgentDetail } from './agent-detail.js'
import { initAiTokenStore } from './ai-token-store.js'
import { initOrder } from './order.js'

/** 共享交互脚本：导航滚动、移动端菜单、入场动画 */

export function initNavScroll(selector = 'header, nav') {
  const header = document.querySelector(selector)
  if (!header) return

  // 滚动时仅增强阴影，不改变导航栏高度，避免文字布局跳动
  window.addEventListener('scroll', () => {
    header.classList.toggle('nav-scrolled', window.scrollY > 10)
  })
}

export function initMobileDrawer() {
  const menuToggle = document.getElementById('menu-toggle')
  const menuClose = document.getElementById('menu-close')
  const drawer = document.getElementById('mobile-drawer')
  if (!menuToggle || !drawer) return

  menuToggle.addEventListener('click', () => {
    drawer.classList.remove('translate-x-full')
    document.body.style.overflow = 'hidden'
  })

  menuClose?.addEventListener('click', () => {
    drawer.classList.add('translate-x-full')
    document.body.style.overflow = ''
  })
}

export function initSectionFadeIn(selector = 'section') {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0')
          entry.target.classList.remove('opacity-0', 'translate-y-10')
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll(selector).forEach((section) => {
    section.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10')
    observer.observe(section)
  })
}

export function initAgentCardHover() {
  document.querySelectorAll('[data-agent-card]').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px)'
    })
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)'
    })
  })
}

export function initStatCounters(selector = '.stat-num') {
  const nums = document.querySelectorAll(selector)
  if (!nums.length) return

  const animate = (el) => {
    const target = Number(el.dataset.target || 0)
    const duration = 1600
    const start = performance.now()

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = Math.round(target * eased).toLocaleString()
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target)
          obs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.4 }
  )

  nums.forEach((n) => observer.observe(n))
}

export function initButtonHover() {
  document.querySelectorAll('button:not(#agent-chat-root button)').forEach((button) => {
    button.addEventListener('mouseenter', () => button.classList.add('scale-[1.02]'))
    button.addEventListener('mouseleave', () => button.classList.remove('scale-[1.02]'))
  })
}

/** 首屏视频声音：每次刷新首轮尝试有声播放，首轮结束后静音循环 */
export function initHeroVideoSound() {
  const video = document.querySelector('[data-hero-video]')
  const toggle = document.querySelector('[data-hero-sound-toggle]')
  if (!video || !toggle) return

  const icon = toggle.querySelector('.material-symbols-outlined')
  let initialCycleHandled = false
  let firstLoopSoundEnabled = false
  let firstLoopSoundAttempted = false
  let userOverride = false

  const syncUI = () => {
    const isMuted = video.muted
    toggle.classList.toggle('is-muted', isMuted)
    const label = isMuted ? '打开视频声音' : '关闭视频声音'
    toggle.setAttribute('aria-label', label)
    toggle.setAttribute('title', label)
    toggle.setAttribute('aria-pressed', String(!isMuted))
    if (icon) icon.textContent = isMuted ? 'volume_off' : 'volume_up'
  }

  const muteAfterInitialCycle = () => {
    if (!firstLoopSoundEnabled || initialCycleHandled || userOverride) return
    initialCycleHandled = true
    firstLoopSoundEnabled = false
    video.muted = true
    syncUI()
  }

  /** 保证画面始终在播放（静音兜底），返回是否正在播放 */
  const keepPlaying = async () => {
    if (!video.paused) return true
    try {
      await video.play()
      return true
    } catch {
      video.muted = true
      syncUI()
      try {
        await video.play()
        return true
      } catch {
        return false
      }
    }
  }

  /** 开启本轮声音（成功时进入“首轮有声”状态），返回是否成功 */
  const enableSound = async () => {
    if (initialCycleHandled || userOverride) return false
    video.volume = 1
    video.muted = false
    syncUI()

    // 浏览器拦截时会异步暂停视频，稍等再确认结果
    await new Promise((r) => setTimeout(r, 150))

    if (video.paused || video.muted) {
      video.muted = true
      syncUI()
      await keepPlaying()
      return false
    }

    firstLoopSoundEnabled = true
    return true
  }

  /**
   * 首轮尝试有声播放。浏览器会拦截“无交互有声播放”，
   * 拦截后监听能授予播放权限的用户交互（按下鼠标/按键/触摸），
   * 每次交互都重试开声，直到成功或首轮已结束。
   */
  const tryEnableFirstLoopSound = async () => {
    if (firstLoopSoundAttempted || initialCycleHandled) return
    firstLoopSoundAttempted = true

    if (await enableSound()) return

    // 注意：mousemove/wheel 不授予媒体播放权限，不能用
    const gestureEvents = ['pointerdown', 'keydown', 'touchend', 'click']
    let retrying = false

    const onGesture = async (e) => {
      // 声音按钮自身的点击交给按钮处理，避免两个监听器互相打架
      if (e.target instanceof Element && e.target.closest('[data-hero-sound-toggle]')) return
      if (retrying) return
      retrying = true
      const done = initialCycleHandled || userOverride || (await enableSound())
      retrying = false
      if (done) {
        gestureEvents.forEach((evt) => window.removeEventListener(evt, onGesture))
      }
    }

    gestureEvents.forEach((evt) => window.addEventListener(evt, onGesture, { passive: true }))
  }

  const startMutedAutoplay = async () => {
    video.muted = true
    video.volume = 1
    syncUI()
    await keepPlaying()
    tryEnableFirstLoopSound()
  }

  video.addEventListener('timeupdate', () => {
    if (!firstLoopSoundEnabled || initialCycleHandled) return
    const duration = video.duration
    if (!duration || !Number.isFinite(duration)) return
    if (video.currentTime >= duration - 0.4) {
      muteAfterInitialCycle()
    }
  })

  toggle.addEventListener('click', async (e) => {
    e.stopPropagation()
    // 用户手动操作后，首轮自动静音逻辑不再介入
    userOverride = true
    firstLoopSoundEnabled = false
    if (video.muted) {
      video.muted = false
      syncUI()
      if (video.paused) await keepPlaying()
    } else {
      video.muted = true
      syncUI()
    }
  })

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    startMutedAutoplay()
  } else {
    video.addEventListener('canplay', startMutedAutoplay, { once: true })
  }
}

/** 首屏字幕：进入页面 5 秒后逐个元素“绘制”出现 */
export function initHeroCaptionReveal(delay = 5000) {
  const caption = document.querySelector('.hero-video-caption')
  if (!caption) return

  caption.classList.add('hero-anim')
  window.setTimeout(() => {
    caption.classList.add('is-revealed')
  }, delay)
}

/** 一键回顶部：右下角悬浮按钮，滚动一定距离后出现 */
export function initBackToTop() {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'back-to-top'
  btn.setAttribute('aria-label', '回到顶部')
  btn.setAttribute('title', '回到顶部')
  btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">arrow_upward</span>'
  document.body.appendChild(btn)

  const toggle = () => {
    btn.classList.toggle('is-visible', window.scrollY > 400)
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  window.addEventListener('scroll', toggle, { passive: true })
  toggle()
}

/** 空间智能诊断板块的流动粒子网络背景 */
export function initPainParticles() {
  const canvas = document.querySelector('.pain-ai [data-particles]')
  if (!canvas) return
  const section = canvas.closest('.pain-ai')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let width = 0
  let height = 0
  let dpr = Math.min(window.devicePixelRatio || 1, 2)
  let particles = []
  let raf = null
  let running = false
  const mouse = { x: 0, y: 0, active: false }

  const COLORS = ['56,189,248', '139,124,246', '96,165,250', '52,211,153']

  const resize = () => {
    width = section.clientWidth
    height = section.clientHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const count = Math.min(320, Math.max(160, Math.round((width * height) / 5200)))
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      ix: 0,
      iy: 0,
      r: Math.random() * 2 + 1,
      c: COLORS[(Math.random() * COLORS.length) | 0],
    }))
  }

  const draw = () => {
    ctx.clearRect(0, 0, width, height)
    const R = 200

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      // 鼠标吸附跟随
      if (mouse.active) {
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const d2 = dx * dx + dy * dy
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1
          const force = (1 - d / R) * 0.9
          p.ix += (dx / d) * force
          p.iy += (dy / d) * force
        }
      }
      p.ix *= 0.9
      p.iy *= 0.9

      p.x += p.vx + p.ix
      p.y += p.vy + p.iy

      // 环绕流动，形成不断流动的粒子流
      if (p.x < -4) p.x = width + 4
      else if (p.x > width + 4) p.x = -4
      if (p.y < -4) p.y = height + 4
      else if (p.y > height + 4) p.y = -4

      // 光晕
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * 2.6, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.c}, 0.12)`
      ctx.fill()
      // 核心
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.c}, 0.95)`
      ctx.fill()
    }
    raf = requestAnimationFrame(draw)
  }

  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect()
    mouse.x = e.clientX - rect.left
    mouse.y = e.clientY - rect.top
    mouse.active = true
  }
  const onLeave = () => {
    mouse.active = false
  }
  section.addEventListener('pointermove', onMove)
  section.addEventListener('pointerleave', onLeave)

  const start = () => {
    if (running || reduce) return
    running = true
    draw()
  }
  const stop = () => {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = null
  }

  resize()
  window.addEventListener('resize', () => {
    resize()
  })

  if (reduce) {
    draw()
    stop()
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? start() : stop()))
    },
    { threshold: 0 }
  )
  io.observe(section)
}

/** 物理 AI 架构：中枢入场、智能体展开、闭环节点轮播、悬停高亮联动 */
export function initArchNetwork() {
  const orbit = document.getElementById('pai-orbit')
  if (!orbit) return
  const core = orbit.querySelector('.pai-core')
  const nodes = document.querySelectorAll('.pai-loop .pai-node')
  let loopTimer = null

  const startLoop = () => {
    if (loopTimer || !nodes.length) return
    let i = 0
    const tick = () => {
      nodes.forEach((n, idx) => n.classList.toggle('is-lit', idx === i))
      i = (i + 1) % nodes.length
    }
    tick()
    loopTimer = setInterval(tick, 1400)
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          orbit.classList.add('is-active')
          startLoop()
          io.disconnect()
        }
      })
    },
    { threshold: 0.25 }
  )
  io.observe(orbit)

  const flowLines = orbit.querySelectorAll('.pai-lines-flow line')
  orbit.querySelectorAll('.pai-agent').forEach((card) => {
    const key = card.dataset.line
    const line = orbit.querySelector(`.pai-lines-flow line[data-line="${key}"]`)
    card.addEventListener('mouseenter', () => {
      flowLines.forEach((l) => l.classList.remove('is-hot'))
      if (line) line.classList.add('is-hot')
      if (core) core.classList.add('is-pulse')
    })
    card.addEventListener('mouseleave', () => {
      if (line) line.classList.remove('is-hot')
      if (core) core.classList.remove('is-pulse')
    })
  })

  if (core) {
    core.addEventListener('animationend', () => core.classList.remove('is-pulse'))
  }
}

/** AI Token Runtime 控制台：hover 场景请求时点亮整条调度流水线与编排引擎 */
export function initTokenRuntime() {
  const panel = document.getElementById('tokrt')
  if (!panel) return
  const links = panel.querySelectorAll('.tokrt-link')
  const requests = panel.querySelectorAll('[data-req]')

  const setHot = (on) => {
    links.forEach((l) => l.classList.toggle('is-hot', on))
    panel.classList.toggle('is-hot', on)
  }

  requests.forEach((req) => {
    req.addEventListener('mouseenter', () => {
      setHot(true)
      req.style.borderColor = 'rgba(150, 180, 255, 0.7)'
    })
    req.addEventListener('mouseleave', () => {
      setHot(false)
      req.style.borderColor = ''
    })
  })
}

/** 行业解决方案：IMAX 曲面巨幕式 3D 轨道 */
export function initSolutionsImax() {
  const stage = document.querySelector('[data-sol-imax]')
  if (!stage) return
  const orbit = stage.querySelector('[data-sol-orbit]')
  const cards = [...stage.querySelectorAll('[data-sol-card]')]
  if (!orbit || cards.length === 0) return

  const slots = [
    { x: 0, y: -6, z: 230, scale: 1.18, ry: 0, rz: 0, opacity: 1, blur: 0, w: 430, h: 240, order: 8 },
    { x: 500, y: 18, z: 92, scale: 0.98, ry: -21, rz: 1.3, opacity: 0.92, blur: 0, w: 365, h: 206, order: 6 },
    { x: 900, y: 46, z: -160, scale: 0.75, ry: -43, rz: 2.1, opacity: 0.42, blur: 0.9, w: 300, h: 168, order: 3 },
    { x: 0, y: 82, z: -300, scale: 0.6, ry: 0, rz: 0, opacity: 0.16, blur: 1.7, w: 260, h: 146, order: 1 },
    { x: -900, y: 46, z: -160, scale: 0.75, ry: 43, rz: -2.1, opacity: 0.42, blur: 0.9, w: 300, h: 168, order: 3 },
    { x: -500, y: 18, z: 92, scale: 0.98, ry: 21, rz: -1.3, opacity: 0.92, blur: 0, w: 365, h: 206, order: 6 },
  ]

  let active = 0
  let timer = null
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const render = () => {
    cards.forEach((card, index) => {
      const slotIndex = (index - active + cards.length) % cards.length
      const slot = slots[slotIndex] || slots[3]
      card.classList.toggle('is-focus', slotIndex === 0)
      card.style.setProperty('--x', `${slot.x}px`)
      card.style.setProperty('--y', `${slot.y}px`)
      card.style.setProperty('--z', `${slot.z}px`)
      card.style.setProperty('--scale', slot.scale)
      card.style.setProperty('--ry', `${slot.ry}deg`)
      card.style.setProperty('--rz', `${slot.rz}deg`)
      card.style.setProperty('--opacity', slot.opacity)
      card.style.setProperty('--blur', `${slot.blur}px`)
      card.style.setProperty('--card-w', `${slot.w}px`)
      card.style.setProperty('--card-h', `${slot.h}px`)
      card.style.setProperty('--z-order', slot.order)
    })
  }

  const start = () => {
    if (reduceMotion || timer) return
    timer = window.setInterval(() => {
      active = (active + 1) % cards.length
      render()
    }, 3200)
  }

  const stop = () => {
    if (!timer) return
    window.clearInterval(timer)
    timer = null
  }

  cards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      orbit.classList.add('is-paused')
      stop()
    })
    card.addEventListener('mouseleave', () => {
      orbit.classList.remove('is-paused')
      start()
    })
    card.addEventListener('click', () => {
      active = index
      render()
      stop()
      if (!orbit.matches(':hover')) start()
    })
  })

  render()
  start()
}

/** 滚动揭示：板块进入视口时，内部内容单元逐个交错动态出现 */
export function initScrollReveal() {
  const selectors = [
    '.core-business-header',
    '.core-business-grid > *',
    '.partners-hero-card',
    '.partner-marquee',
    '.architecture-layer',
    'section h2',
    'section .text-center',
    'section .flex.justify-between.items-end',
    'section .grid > *',
    '.sol-grid > *',
    '.sol-imax',
  ]

  const seen = new Set()
  let items = []

  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (seen.has(el)) return
      if (el.closest('.hero-ai') || el.closest('#site-header') || el.closest('#agent-chat-root')) return
      seen.add(el)
      items.push(el)
    })
  })

  // 移除嵌套：只保留最外层揭示单元，避免父子重复动画
  items = items.filter((el) => !items.some((other) => other !== el && other.contains(el)))
  if (!items.length) return

  const staggerByParent = new Map()
  items.forEach((el) => {
    el.classList.add('reveal-up')
    const parent = el.parentElement
    const idx = staggerByParent.get(parent) || 0
    el.style.setProperty('--reveal-delay', `${idx * 0.1}s`)
    staggerByParent.set(parent, idx + 1)
  })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  )

  items.forEach((el) => observer.observe(el))
}

/** 预约方案演示弹窗 */
export function initDemoRequestModal() {
  const modal = document.getElementById('demo-modal')
  const form = document.getElementById('demo-request-form')
  const openers = document.querySelectorAll('[data-demo-modal-open]')
  if (!modal || !form || !openers.length) return

  const tip = document.getElementById('demo-form-tip')
  const closeButtons = modal.querySelectorAll('[data-demo-modal-close]')
  const firstField = form.querySelector('textarea, input, select')

  const open = () => {
    modal.classList.add('is-open')
    modal.setAttribute('aria-hidden', 'false')
    document.body.classList.add('demo-modal-open')
    window.setTimeout(() => firstField?.focus(), 80)
  }

  const close = () => {
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('demo-modal-open')
  }

  openers.forEach((btn) => btn.addEventListener('click', open))
  closeButtons.forEach((btn) => btn.addEventListener('click', close))

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) close()
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(form).entries())
    const requirement = String(data.requirement || '').trim()
    const name = String(data.name || '').trim()
    const contact = String(data.contact || '').trim()

    if (!requirement || !name || !contact) {
      if (tip) {
        tip.textContent = '请填写需求、联系人和联系方式后再提交。'
        tip.className = 'demo-form__tip is-error'
      }
      return
    }

    const payload = {
      ...data,
      requirement,
      name,
      contact,
      submittedAt: new Date().toISOString(),
    }

    try {
      const key = 'atuofuture-demo-requests'
      const saved = JSON.parse(localStorage.getItem(key) || '[]')
      saved.push(payload)
      localStorage.setItem(key, JSON.stringify(saved))
    } catch {
      // 本地存储不可用时不阻塞用户提交反馈。
    }

    form.reset()
    if (tip) {
      tip.textContent = '预约需求已提交，我们会尽快与您联系。'
      tip.className = 'demo-form__tip is-success'
    }
  })
}

// 根据页面 data-page 属性自动初始化
const page = document.body.dataset.page

initNavScroll('header, .site-header')
initSiteNav()
initMobileDrawer()
initAgentChat()
initDemoRequestModal()

if (page === 'agent-detail') {
  initAgentDetail()
}

if (page === 'order') {
  initOrder()
}

initScrollReveal()
initBackToTop()

if (page === 'agents') {
  initAgentCardHover()
}

if (page === 'home') {
  initButtonHover()
  initStatCounters()
  initHeroVideoSound()
  initHeroCaptionReveal()
  initPainParticles()
  initArchNetwork()
  initTokenRuntime()
  initSolutionsImax()
}

if (page === 'hardware') {
  initHardwareStore()
}

if (page === 'ai-token') {
  initAiTokenStore()
}
