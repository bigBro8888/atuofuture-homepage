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
          <h2>看一次智能体如何完成真实任务</h2>
          <p>从现场变化开始，到系统与设备执行，再到结果回读，让智能体真正进入业务现场。</p>
        </header>

        <div class="ag-story__nav" role="tablist" aria-label="智能体切换">
          ${AGENTS_OVERVIEW.map((a) => {
            const on = a.id === selected.id
            return `
            <button
              type="button"
              class="ag-story__tab${on ? ' is-selected' : ''}"
              role="tab"
              aria-selected="${on ? 'true' : 'false'}"
              data-ag-select="${esc(a.id)}"
            >
              <span class="material-symbols-outlined" aria-hidden="true">${esc(a.icon)}</span>
              <span>${esc(a.shortName)}</span>
            </button>`
          }).join('')}
        </div>

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
            <div class="ag-story__pins" data-ag-pins>
              ${sceneNodesMarkup(selected.sceneNodes, 0)}
            </div>
          </div>
          <div class="ag-story__aside" data-ag-aside>
            <p class="ag-story__kicker" data-ag-short>${esc(selected.shortName)}</p>
            <h3 data-ag-name>${esc(selected.name)}</h3>
            <p class="ag-story__value" data-ag-value>${esc(selected.value)}</p>
            <ol class="ag-story__loop">
              <li>
                <span class="ag-story__num">01</span>
                <div>
                  <strong>触发条件</strong>
                  <p data-ag-trigger>${esc(selected.trigger)}</p>
                </div>
              </li>
              <li>
                <span class="ag-story__num">02</span>
                <div>
                  <strong>自动执行</strong>
                  <p data-ag-action>${esc(selected.action)}</p>
                </div>
              </li>
              <li>
                <span class="ag-story__num">03</span>
                <div>
                  <strong>结果回读</strong>
                  <p data-ag-result>${esc(selected.result)}</p>
                </div>
              </li>
            </ol>
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

  root.querySelectorAll('.ag-story__tab').forEach((btn) => {
    const on = btn.dataset.agSelect === selected.id
    btn.classList.toggle('is-selected', on)
    btn.setAttribute('aria-selected', on ? 'true' : 'false')
  })

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

  const setText = (sel, value) => {
    const el = root.querySelector(sel)
    if (el) el.textContent = value
  }
  setText('[data-ag-short]', selected.shortName)
  setText('[data-ag-name]', selected.name)
  setText('[data-ag-value]', selected.value)
  setText('[data-ag-trigger]', selected.trigger)
  setText('[data-ag-action]', selected.action)
  setText('[data-ag-result]', selected.result)

  const detail = root.querySelector('[data-ag-detail]')
  if (detail) {
    detail.setAttribute('href', selected.detailUrl)
    detail.textContent = `查看${selected.shortName}智能体详情`
  }
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
