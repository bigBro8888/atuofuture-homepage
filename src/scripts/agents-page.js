import { loadAgentsLibraryContent, loadSimplePageContent } from '../services/site-settings-api.js'
import {
  AGENTS_CAPABILITY_CHAIN,
  AGENTS_OVERVIEW,
  applyAgentsOverviewCms,
  reorderAgentsOverview,
  resolveAgentOverviewId,
} from '../data/agents-overview.js'
import { applyAgentsLibraryCms } from '../data/agents-detail.js'
import { applyProductAgentsCms } from '../data/product-agents.js'
import {
  renderAgentEcosystemMap,
  syncAgentEcosystemMap,
  layoutAgentOrbitLinks,
} from '../components/agents/ecosystem-map.js'
import {
  renderAgentTaskStory,
  syncAgentTaskStory,
  syncStoryFlowStep,
  bindStoryPins,
  playStoryEnterCue,
  resetStoryEnterCue,
  applyStorySceneMode,
  syncTwinStats,
} from '../components/agents/task-story.js'
function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function clampBannerOverlay(value, fallback = 100) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(100, Math.round(n)))
}

function renderHero() {
  const title = cmsHero?.title || '让空间智能体感知现场、调用设备、完成任务'
  const subtitle = cmsHero?.subtitle || '不只是回答问题，而是连接软件系统、智能硬件与业务流程，让空间能够自主感知、判断、执行并持续反馈。'
  const banner = cmsHero?.bannerUrl || '/images/agents/hero-bleed.jpg'
  const cta = cmsHero?.ctaLabel || '预约方案演示'
  const overlay = clampBannerOverlay(cmsHero?.bannerOverlay, 100)
  return `
    <section class="ag-hero" style="--ag-hero-overlay:${(overlay / 100).toFixed(2)}">
      <div class="ag-hero__bg" aria-hidden="true">
        <img src="${esc(banner)}" alt="" width="1920" height="1080" decoding="async" fetchpriority="high" />
      </div>
      <div class="ag-shell ag-hero__content">
        <div class="ag-hero__copy">
          <h1>${esc(title)}</h1>
          <p>${esc(subtitle)}</p>
          <div class="ag-hero__actions">
            <a class="ag-btn ag-btn--primary" href="#agent-ecosystem">探索八大智能体</a>
            <button type="button" class="ag-btn ag-btn--ghost" data-demo-modal-open>${esc(cta)}</button>
          </div>
        </div>
        <ol class="ag-chain" aria-label="能力链">
          ${AGENTS_CAPABILITY_CHAIN.map(
            (step, i) => `
            <li>
              <span class="ag-chain__dot" aria-hidden="true">
                <span class="material-symbols-outlined">${esc(step.icon)}</span>
              </span>
              <strong>${esc(step.title)}</strong>
              ${i < AGENTS_CAPABILITY_CHAIN.length - 1 ? '<i class="ag-chain__line" aria-hidden="true"></i>' : ''}
            </li>`
          ).join('')}
        </ol>
      </div>
    </section>`
}

function renderCta() {
  return `
    <section class="ag-cta">
      <div class="ag-shell ag-cta__inner">
        <div>
          <h2>让空间智能体进入您的业务现场</h2>
          <p>从一个场景开始，连接现有系统和设备，逐步构建可感知、可执行、可持续运营的空间智能体系。</p>
        </div>
        <div class="ag-cta__actions">
          <button type="button" class="ag-btn ag-btn--primary" data-demo-modal-open>预约方案演示</button>
          <a class="ag-btn ag-btn--ghost" href="../solutions/">查看行业解决方案</a>
        </div>
      </div>
    </section>`
}

function renderNotFound(rawId) {
  return `
    <section class="ag-notfound">
      <div class="ag-shell">
        <h1>未找到该智能体</h1>
        <p>参数「${esc(rawId || '')}」无效或已下线。请从八大智能体中重新选择。</p>
        <a class="ag-btn ag-btn--solid" href="./">返回空间智能体</a>
      </div>
    </section>`
}

/** 任务演示区固定为空间服务 3D 会议室，不随生态图切换换成静态图 */
const STORY_AGENT_ID = 'space'

async function ensureMeetingRoom3D(root, state) {
  const host = root.querySelector('[data-ag-scene-3d]')
  if (!host) return null
  const syncPinLabel = (cue, onText, offText, isOn) => {
    const el = root.querySelector(`[data-ag-pin-cue="${cue}"]`)
    if (!el) return
    el.textContent = isOn ? onText : offText
    el.setAttribute('aria-label', el.textContent)
  }
  const syncDevicePins = (api) => {
    if (!api) return
    syncPinLabel('lights', '灯全关', '灯全亮', api.isLightsOn?.())
    syncPinLabel('screen', '信息屏关闭', '信息屏更新', api.isScreenOn?.())
    syncPinLabel('ac', '停止送风', '空调舒适模式', api.isAcOn?.())
    syncPinLabel('env', '窗帘关闭', '窗帘打开', api.isEnvOn?.())
  }
  if (!state.room3d) {
    const { mountMeetingRoom3D, syncStoryPinsTo3D } = await import('../components/agents/meeting-room-3d.js')
    state.room3d = mountMeetingRoom3D(host)
    if (state.room3d) {
      state.room3d.onStats?.((stats) => syncTwinStats(root, stats))
      state.room3d._onFrame = (api) => {
        syncStoryPinsTo3D(root, api)
        syncDevicePins(api)
      }
    }
  }
  state.room3d?.setActive(true)
  applyStorySceneMode(root, STORY_AGENT_ID)
  syncDevicePins(state.room3d)
  return state.room3d
}

function setSelectedAgent(root, state, id, { scrollStory = false } = {}) {
  if (!resolveAgentOverviewId(id)) return
  state.selectedAgent = id
  syncAgentEcosystemMap(root, id)
  // 演示区始终锁定 3D 空间服务场景
  syncAgentTaskStory(root, STORY_AGENT_ID)
  void ensureMeetingRoom3D(root, state)

  const url = new URL(window.location.href)
  url.searchParams.set('agent', id)
  window.history.replaceState({}, '', `${url.pathname}?agent=${encodeURIComponent(id)}${url.hash || ''}`)

  if (scrollStory) {
    document.getElementById('agent-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function bindInteractions(root, state) {
  root.querySelectorAll('[data-ag-select]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const id = btn.dataset.agSelect
      const href = (btn.getAttribute('href') || '').trim()
      // 有真实跳转时交给浏览器；仅 # / 空链时仍做选中高亮
      if (href && href !== '#' && !href.startsWith('#')) return
      event.preventDefault()
      if (!id || id === state.selectedAgent) return
      setSelectedAgent(root, state, id)
    })
    btn.addEventListener('mouseenter', () => {
      const id = btn.dataset.agSelect
      if (!id || id === state.selectedAgent) return
      state.selectedAgent = id
      syncAgentEcosystemMap(root, id)
    })
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      if (btn.tagName === 'A' && btn.getAttribute('href')) return
      e.preventDefault()
      btn.click()
    })
  })

  root.querySelector('[data-ag-jump-story]')?.addEventListener('click', () => {
    document.getElementById('agent-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })

  let step = 0
  let pauseAutoUntil = 0
  const pinSteps = () => {
    const steps = [...root.querySelectorAll('[data-ag-pin-step]')].map((el) => Number(el.dataset.agPinStep))
    return [...new Set(steps)].sort((a, b) => a - b)
  }
  const tick = () => {
    if (Date.now() < pauseAutoUntil) return
    const steps = pinSteps()
    if (!steps.length) return
    syncStoryFlowStep(root, steps[step % steps.length])
    step += 1
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduce) window.setInterval(tick, 2200)

  bindStoryPins(root, {
    onPinActivate: ({ step: pinStep, cue, pin }) => {
      pauseAutoUntil = Date.now() + 5600
      step = Math.max(0, pinSteps().indexOf(pinStep))
      syncStoryFlowStep(root, pinStep)
      if (cue === 'enter') {
        void ensureMeetingRoom3D(root, state).then((room) => {
          playStoryEnterCue(root, room)
        })
        return
      }
      if (cue === 'lights' || cue === 'screen' || cue === 'ac' || cue === 'env') {
        void ensureMeetingRoom3D(root, state).then((room) => {
          if (!room) return
          if (cue === 'lights' && room.toggleLights) {
            const on = room.toggleLights()
            pin.textContent = on ? '灯全关' : '灯全亮'
          } else if (cue === 'screen' && room.toggleScreen) {
            const on = room.toggleScreen()
            pin.textContent = on ? '信息屏关闭' : '信息屏更新'
          } else if (cue === 'ac' && room.toggleAc) {
            const on = room.toggleAc()
            pin.textContent = on ? '停止送风' : '空调舒适模式'
          } else if (cue === 'env' && room.toggleEnv) {
            const on = room.toggleEnv()
            pin.textContent = on ? '窗帘关闭' : '窗帘打开'
          }
          pin.setAttribute('aria-label', pin.textContent)
        })
        return
      }
      resetStoryEnterCue(root)
      state.room3d?.resetPerson()
    },
  })
}

let cmsHero = null

export async function initAgentsPage() {
  const root = document.getElementById('agents-root')
  if (!root) return
  cmsHero = await loadSimplePageContent('agents')
  const library = await loadAgentsLibraryContent()
  applyAgentsLibraryCms(library)
  applyAgentsOverviewCms(library)
  applyProductAgentsCms(library)
  if (Array.isArray(cmsHero?.items) && cmsHero.items.length) {
    reorderAgentsOverview(cmsHero.items.map((item) => item.id).filter(Boolean))
  }
  for (const agent of AGENTS_OVERVIEW) {
    const hit = (cmsHero?.items || []).find((item) => item.id === agent.id)
    if (!hit) continue
    if (hit.title) agent.name = hit.title
    if (hit.summary) agent.blurb = hit.summary
    if (hit.imageUrl) agent.sceneImage = hit.imageUrl
    if (hit.href) agent.detailUrl = hit.href
  }

  const pageHashes = new Set(['agent-story', 'agent-ecosystem', 'agent-matrix', 'agent-stage', ''])
  const hashRaw = window.location.hash.replace(/^#/, '')
  const raw =
    new URLSearchParams(window.location.search).get('id') ||
    new URLSearchParams(window.location.search).get('agent') ||
    (hashRaw && !pageHashes.has(hashRaw) ? hashRaw : null)
  const requested = raw ? (raw.startsWith('agent-') ? raw.slice(6) : raw) : null
  const resolved = requested ? resolveAgentOverviewId(requested) : STORY_AGENT_ID

  if (requested && !resolved) {
    root.innerHTML = renderNotFound(requested)
    return
  }

  const state = {
    selectedAgent: resolved || STORY_AGENT_ID,
    room3d: null,
  }

  root.innerHTML = `
    ${renderHero()}
    ${renderAgentEcosystemMap({ selectedId: state.selectedAgent })}
    ${renderAgentTaskStory({ selectedId: STORY_AGENT_ID })}
    ${renderCta()}
  `

  applyStorySceneMode(root, STORY_AGENT_ID)
  void ensureMeetingRoom3D(root, state)
  bindInteractions(root, state)
  layoutAgentOrbitLinks(root)
  window.addEventListener('resize', () => layoutAgentOrbitLinks(root))
  window.addEventListener(
    'pagehide',
    () => {
      state.room3d?.dispose()
      state.room3d = null
    },
    { once: true }
  )

  const hash = window.location.hash.replace(/^#/, '')
  const hashMap = {
    'agent-matrix': 'agent-ecosystem',
    'agent-stage': 'agent-story',
  }
  const target = hashMap[hash] || hash
  if (target && document.getElementById(target)) {
    window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }
}
