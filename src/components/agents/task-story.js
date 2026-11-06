import { AGENTS_OVERVIEW } from '../../data/agents-overview.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 场景演示人物：走进来 → 环顾会议室 → 望向窗外 */
function actorMarkup() {
  return `
    <div class="ag-story__actor" data-ag-actor aria-hidden="true">
      <div class="ag-story__actor-figure">
        <svg class="ag-story__actor-svg" viewBox="0 0 64 120" width="64" height="120" focusable="false">
          <ellipse class="ag-story__actor-shadow" cx="32" cy="112" rx="18" ry="5" fill="rgba(7,26,51,.28)"/>
          <g class="ag-story__actor-body">
            <circle cx="32" cy="16" r="11" fill="#f0d5c0"/>
            <path d="M22 18c1.2 4 5 6.5 10 6.5s8.8-2.5 10-6.5" fill="none" stroke="#c9a48a" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>
            <path d="M21 10c3-6 19-6 22 0-2 5-6.5 8-11 8s-9-3-11-8z" fill="#2c3344"/>
            <path d="M20 28c2.5-2 8-3.5 12-3.5s9.5 1.5 12 3.5l4 22c-5 3-9 4.5-16 4.5s-11-1.5-16-4.5l4-22z" fill="#1d4f9c"/>
            <path d="M24 50.5c2.2 1.4 5.2 2.2 8 2.2s5.8-.8 8-2.2l1.2 18.5H22.8L24 50.5z" fill="#163f7d"/>
            <g class="ag-story__actor-arm ag-story__actor-arm--l">
              <path d="M20 30c-5 6-7 14-6.5 20" fill="none" stroke="#1d4f9c" stroke-width="6" stroke-linecap="round"/>
              <circle cx="14" cy="51" r="3.2" fill="#f0d5c0"/>
            </g>
            <g class="ag-story__actor-arm ag-story__actor-arm--r">
              <path d="M44 30c5 6 7 14 6.5 20" fill="none" stroke="#1d4f9c" stroke-width="6" stroke-linecap="round"/>
              <circle cx="50" cy="51" r="3.2" fill="#f0d5c0"/>
            </g>
            <g class="ag-story__actor-leg ag-story__actor-leg--l">
              <path d="M26 68v28" fill="none" stroke="#243044" stroke-width="7" stroke-linecap="round"/>
              <path d="M22 97h10" fill="none" stroke="#1a2030" stroke-width="4" stroke-linecap="round"/>
            </g>
            <g class="ag-story__actor-leg ag-story__actor-leg--r">
              <path d="M38 68v28" fill="none" stroke="#2a364c" stroke-width="7" stroke-linecap="round"/>
              <path d="M34 97h10" fill="none" stroke="#1a2030" stroke-width="4" stroke-linecap="round"/>
            </g>
          </g>
        </svg>
      </div>
    </div>`
}

function sceneNodesMarkup(nodes, activeStep = 0) {
  return (nodes || [])
    .map(
      (n) => `
    <button
      type="button"
      class="ag-story__pin${n.step === activeStep ? ' is-active' : ''}"
      style="left:${n.x}%;top:${n.y}%"
      data-ag-pin-step="${n.step}"
      ${n.cue ? `data-ag-pin-cue="${esc(n.cue)}"` : ''}
      aria-label="${esc(n.label)}"
    >${esc(n.label)}</button>`
    )
    .join('')
}

/**
 * AgentTaskStory
 * @param {{ selectedId: string }} props
 */
export function renderAgentTaskStory({ selectedId }) {
  const selected = AGENTS_OVERVIEW.find((a) => a.id === selectedId) || AGENTS_OVERVIEW[0]
  return `
    <section class="ag-story" id="agent-story">
      <div class="ag-shell ag-shell--1280">
        <header class="ag-section-head">
          <h2>看一次会议智能体如何完成真实任务</h2>
          <p>从现场变化开始，到系统与设备执行，再到结果回读，让智能体真正进入业务现场。</p>
        </header>

        <div class="ag-story__stage" data-ag-story-stage>
          <div class="ag-story__scene${selected.id === 'space' ? ' is-3d' : ''}" data-ag-scene>
            <img
              src="${esc(selected.sceneImage)}"
              alt="${esc(selected.name)}业务场景"
              width="960"
              height="600"
              loading="lazy"
              data-ag-scene-img
            />
            <div class="ag-story__scene-3d" data-ag-scene-3d hidden></div>
            ${actorMarkup()}
            <div class="ag-story__person-dialog" data-ag-person-dialog hidden role="dialog" aria-label="人物对话">
              <p>你好呀，有什么事情？</p>
              <div class="ag-story__person-dialog__actions">
                <button type="button" data-person-action="sit">请坐下</button>
                <button type="button" data-person-action="leave">请离开</button>
                <button type="button" data-person-action="bye">再见</button>
              </div>
            </div>
            <div class="ag-story__pins" data-ag-pins>
              ${sceneNodesMarkup(selected.sceneNodes, 0)}
            </div>
          </div>
          <div class="ag-story__aside ag-story__aside--twin" data-ag-aside>
            <p class="ag-story__kicker">数字孪生 · 实时态势</p>
            <h3>会议室孪生看板</h3>
            <p class="ag-story__value">人体感应、环境设备与现场状态同步回读</p>
            <div class="ag-twin" data-ag-twin>
              <div class="ag-minimap" data-ag-minimap aria-label="会议室雷达俯视小地图">
                <div class="ag-minimap__head">
                  <span class="ag-minimap__title">雷达俯视</span>
                  <em class="ag-minimap__status" data-minimap-radar>空闲</em>
                </div>
                <div class="ag-minimap__stage">
                  <svg class="ag-minimap__svg" viewBox="0 0 140 172" role="img" aria-hidden="true">
                    <defs>
                      <radialGradient id="ag-radar-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#00d5c7" stop-opacity=".55"/>
                        <stop offset="70%" stop-color="#00d5c7" stop-opacity=".12"/>
                        <stop offset="100%" stop-color="#00d5c7" stop-opacity="0"/>
                      </radialGradient>
                    </defs>
                    <rect class="ag-minimap__floor" x="8" y="8" width="124" height="156" rx="6"/>
                    <!-- 窗侧 -->
                    <rect class="ag-minimap__window" x="8" y="28" width="4" height="52" rx="1"/>
                    <rect class="ag-minimap__window" x="8" y="92" width="4" height="42" rx="1"/>
                    <!-- 信息屏墙 -->
                    <rect class="ag-minimap__screen" x="48" y="10" width="44" height="5" rx="1.5"/>
                    <!-- 会议桌 -->
                    <rect class="ag-minimap__table" x="42" y="38" width="56" height="88" rx="8"/>
                    <!-- 椅位示意 -->
                    <g class="ag-minimap__chairs" fill="rgba(255,255,255,.22)">
                      <rect x="34" y="48" width="7" height="9" rx="1.5"/>
                      <rect x="34" y="68" width="7" height="9" rx="1.5"/>
                      <rect x="34" y="88" width="7" height="9" rx="1.5"/>
                      <rect x="34" y="108" width="7" height="9" rx="1.5"/>
                      <rect x="99" y="48" width="7" height="9" rx="1.5"/>
                      <rect x="99" y="68" width="7" height="9" rx="1.5"/>
                      <rect x="99" y="88" width="7" height="9" rx="1.5"/>
                      <rect x="99" y="108" width="7" height="9" rx="1.5"/>
                    </g>
                    <!-- 门洞 -->
                    <path class="ag-minimap__door" d="M58 164 H82"/>
                    <text class="ag-minimap__label" x="70" y="158" text-anchor="middle">门</text>
                    <!-- 雷达覆盖 -->
                    <g class="ag-minimap__radar" data-minimap-radar-g transform="translate(108 61.5)">
                      <circle class="ag-minimap__radar-glow" r="28" fill="url(#ag-radar-glow)"/>
                      <circle class="ag-minimap__radar-ring" r="18" fill="none"/>
                      <circle class="ag-minimap__radar-ring ag-minimap__radar-ring--2" r="26" fill="none"/>
                      <circle class="ag-minimap__radar-core" r="3.2"/>
                      <path class="ag-minimap__radar-sweep" d="M0 0 L0 -26 A26 26 0 0 1 18.4 -18.4 Z"/>
                    </g>
                    <g class="ag-minimap__trail" data-minimap-trail></g>
                    <circle class="ag-minimap__dot" data-minimap-dot cx="-20" cy="-20" r="4.5" hidden/>
                  </svg>
                </div>
              </div>
              <div class="ag-twin__devices">
                <div class="ag-twin__row">
                  <span>空调状态</span>
                  <em data-twin-ac>待机</em>
                </div>
                <div class="ag-twin__row">
                  <span>窗帘</span>
                  <em data-twin-curtain>全开</em>
                </div>
                <div class="ag-twin__row">
                  <span>灯光</span>
                  <em data-twin-lights-status>全关</em>
                </div>
                <div class="ag-twin__row">
                  <span>信息屏</span>
                  <em data-twin-screen>关闭</em>
                </div>
              </div>
            </div>
            <a class="ag-btn ag-btn--solid" data-ag-detail href="${esc(selected.detailUrl)}">查看${esc(selected.shortName)}智能体详情</a>
          </div>
        </div>
      </div>
    </section>`
}

export function syncAgentTaskStory(root, selectedId) {
  resetStoryEnterCue(root)
  const selected = AGENTS_OVERVIEW.find((a) => a.id === selectedId) || AGENTS_OVERVIEW[0]
  const stage = root.querySelector('[data-ag-story-stage]')
  const aside = root.querySelector('[data-ag-aside]')
  const scene = root.querySelector('[data-ag-scene]')
  const use3d = selected.id === 'space'

  ;[stage, aside, scene].forEach((el) => {
    if (!el) return
    el.classList.remove('is-animating')
    void el.offsetWidth
    el.classList.add('is-animating')
  })

  scene?.classList.toggle('is-3d', use3d)

  const img = root.querySelector('[data-ag-scene-img]')
  if (img) {
    img.src = selected.sceneImage
    img.alt = `${selected.name}业务场景`
    img.hidden = use3d
  }
  const host3d = root.querySelector('[data-ag-scene-3d]')
  if (host3d) host3d.hidden = !use3d
  const actor = root.querySelector('[data-ag-actor]')
  if (actor) actor.hidden = use3d

  const pins = root.querySelector('[data-ag-pins]')
  if (pins) pins.innerHTML = sceneNodesMarkup(selected.sceneNodes, 0)

  const detail = root.querySelector('[data-ag-detail]')
  if (detail) {
    detail.setAttribute('href', selected.detailUrl)
    detail.textContent = `查看${selected.shortName}智能体详情`
  }
}

/** 与 3D 场景 ot={w:7,d:8.6} 对齐的俯视投影 */
const MINIMAP_ROOM = { w: 7, d: 8.6, padX: 8, padY: 8, mapW: 124, mapH: 156 }
const minimapTrail = new WeakMap()

function worldToMinimap(x, z) {
  const { w, d, padX, padY, mapW, mapH } = MINIMAP_ROOM
  const u = padX + ((x + w / 2) / w) * mapW
  const v = padY + ((z + d / 2) / d) * mapH
  return {
    x: Math.max(padX + 2, Math.min(padX + mapW - 2, u)),
    y: Math.max(padY + 2, Math.min(padY + mapH - 2, v)),
  }
}

export function syncTwinMinimap(root, roomApi, stats) {
  const map = root?.querySelector('[data-ag-minimap]')
  if (!map) return

  const sensing = Number(stats?.people) > 0 || Boolean(roomApi?.getPersonFloor?.()?.visible)
  const radarText = stats?.radar ?? (sensing ? '感应中' : '空闲')
  const statusEl = map.querySelector('[data-minimap-radar]')
  if (statusEl) {
    statusEl.textContent = radarText
    statusEl.classList.toggle('is-active', sensing)
  }
  map.classList.toggle('is-sensing', sensing)

  const dot = map.querySelector('[data-minimap-dot]')
  const trailEl = map.querySelector('[data-minimap-trail]')
  const floor = roomApi?.getPersonFloor?.()
  if (!dot) return

  if (!floor?.visible) {
    dot.setAttribute('hidden', '')
    if (trailEl) trailEl.innerHTML = ''
    minimapTrail.delete(map)
    return
  }

  const pos = worldToMinimap(floor.x, floor.z)
  dot.removeAttribute('hidden')
  dot.setAttribute('cx', String(pos.x.toFixed(1)))
  dot.setAttribute('cy', String(pos.y.toFixed(1)))

  let trail = minimapTrail.get(map)
  if (!trail) {
    trail = []
    minimapTrail.set(map, trail)
  }
  const last = trail[trail.length - 1]
  if (!last || Math.hypot(last.x - pos.x, last.y - pos.y) > 1.6) {
    trail.push({ x: pos.x, y: pos.y })
    if (trail.length > 18) trail.shift()
  }
  if (trailEl) {
    trailEl.innerHTML = trail
      .map((p, i) => {
        const t = (i + 1) / trail.length
        return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(1.2 + t * 1.6).toFixed(1)}" fill="rgba(255,72,72,${(0.12 + t * 0.35).toFixed(2)})"/>`
      })
      .join('')
  }
}

export function syncTwinStats(root, stats) {
  if (!root || !stats) return
  const set = (sel, value) => {
    const el = root.querySelector(sel)
    if (el) el.textContent = String(value)
  }
  set('[data-twin-ac]', stats.ac ?? '--')
  set('[data-twin-screen]', stats.screen ?? '--')
  set('[data-twin-curtain]', stats.curtain ?? '--')
  const lightsOn = Number(stats.lightLevel) >= 0.99 || Number(stats.lightsOn) >= Number(stats.lightsTotal || 10)
  set('[data-twin-lights-status]', lightsOn ? '全亮' : '全关')
  const active = Number(stats.people) > 0
  root.querySelector('[data-minimap-radar]')?.classList.toggle('is-active', active)
  const mapStatus = root.querySelector('[data-minimap-radar]')
  if (mapStatus && stats.radar) mapStatus.textContent = String(stats.radar)
  root.querySelector('[data-ag-minimap]')?.classList.toggle('is-sensing', active)
  root.querySelector('[data-twin-lights-status]')?.classList.toggle('is-active', lightsOn)
  root.querySelector('[data-twin-ac]')?.classList.toggle('is-active', String(stats.ac || '').includes('送风'))
  root.querySelector('[data-twin-screen]')?.classList.toggle('is-active', String(stats.screen || '').includes('会议'))
  root.querySelector('[data-twin-curtain]')?.classList.toggle('is-active', String(stats.curtain || '').includes('关闭'))
}

export function syncStoryFlowStep(root, stepIndex) {
  root.querySelectorAll('[data-ag-pin-step]').forEach((el) => {
    el.classList.toggle('is-active', Number(el.dataset.agPinStep) === stepIndex)
  })
}

const enterTimers = new WeakMap()

function clearEnterTimers(root) {
  const timers = enterTimers.get(root)
  if (!timers) return
  timers.forEach((id) => window.clearTimeout(id))
  enterTimers.delete(root)
}

export function resetStoryEnterCue(root) {
  clearEnterTimers(root)
  const actor = root.querySelector('[data-ag-actor]')
  if (!actor) return
  actor.className = 'ag-story__actor'
  actor.setAttribute('aria-hidden', 'true')
}

/**
 * 人员进入：从门口走进来 → 环顾会议室 → 望向左侧窗外
 * @param {ParentNode} root
 * @param {{ playEnter?: () => void } | null} room3d
 */
export function playStoryEnterCue(root, room3d = null) {
  if (room3d?.playEnter) {
    resetStoryEnterCue(root)
    room3d.playEnter()
    return
  }
  const actor = root.querySelector('[data-ag-actor]')
  if (!actor || actor.hidden) return
  clearEnterTimers(root)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  actor.setAttribute('aria-hidden', 'false')
  if (reduce) {
    actor.className = 'ag-story__actor is-visible is-at-window'
    return
  }

  actor.className = 'ag-story__actor'
  void actor.offsetWidth
  actor.className = 'ag-story__actor is-visible is-entering'
  const timers = [
    window.setTimeout(() => {
      actor.classList.remove('is-entering')
      actor.classList.add('is-looking-room')
    }, 1600),
    window.setTimeout(() => {
      actor.classList.remove('is-looking-room')
      actor.classList.add('is-at-window')
    }, 3200),
  ]
  enterTimers.set(root, timers)
}

export function applyStorySceneMode(root, selectedId) {
  const use3d = selectedId === 'space'
  root.querySelector('[data-ag-scene]')?.classList.toggle('is-3d', use3d)
  const img = root.querySelector('[data-ag-scene-img]')
  if (img) img.hidden = use3d
  const host3d = root.querySelector('[data-ag-scene-3d]')
  if (host3d) host3d.hidden = !use3d
  const actor = root.querySelector('[data-ag-actor]')
  if (actor) actor.hidden = use3d
}

export function bindStoryPins(root, { onPinActivate } = {}) {
  const pins = root.querySelector('[data-ag-pins]')
  if (!pins || pins.dataset.bound === '1') return
  pins.dataset.bound = '1'
  pins.addEventListener('click', (event) => {
    const pin = event.target.closest('[data-ag-pin-step]')
    if (!pin || !pins.contains(pin)) return
    const step = Number(pin.dataset.agPinStep)
    const cue = pin.dataset.agPinCue || ''
    onPinActivate?.({ step, cue, pin })
  })
}
