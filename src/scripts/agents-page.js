import {
  AGENTS_OVERVIEW,
  AGENTS_CAPABILITY_CHAIN,
  resolveAgentOverviewId,
} from '../data/agents-overview.js'
import {
  renderAgentEcosystemMap,
  syncAgentEcosystemMap,
} from '../components/agents/ecosystem-map.js'
import {
  renderAgentTaskStory,
  syncAgentTaskStory,
} from '../components/agents/task-story.js'
import {
  renderIndustryAgentComposition,
  syncIndustryAgentComposition,
} from '../components/agents/industry-composition.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderHero() {
  return `
    <section class="ag-hero">
      <div class="ag-shell ag-hero__grid">
        <div class="ag-hero__copy">
          <h1>让空间智能体感知现场、调用设备、完成任务</h1>
          <p>不只是回答问题，而是连接软件系统、智能硬件与业务流程，让空间能够自主感知、判断、执行并持续反馈。</p>
          <div class="ag-hero__actions">
            <a class="ag-btn ag-btn--primary" href="#agent-ecosystem">探索八大智能体</a>
            <button type="button" class="ag-btn ag-btn--ghost" data-demo-modal-open>预约方案演示</button>
          </div>
        </div>
        <div class="ag-hero__visual" aria-hidden="true">
          <div class="ag-hero__photo" style="background-image:url('/images/agents/hero.jpg')"></div>
          <div class="ag-hero__hub">
            <span class="material-symbols-outlined">memory</span>
            <strong>空间智能中枢</strong>
          </div>
          <span class="ag-hero__node ag-hero__node--a"><i class="material-symbols-outlined">sensors</i>传感</span>
          <span class="ag-hero__node ag-hero__node--b"><i class="material-symbols-outlined">lightbulb</i>照明</span>
          <span class="ag-hero__node ag-hero__node--c"><i class="material-symbols-outlined">thermostat</i>空调</span>
          <span class="ag-hero__node ag-hero__node--d"><i class="material-symbols-outlined">tv</i>中控</span>
        </div>
      </div>
      <div class="ag-shell">
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

function setSelectedAgent(root, state, id, { scrollStory = false } = {}) {
  if (!resolveAgentOverviewId(id)) return
  state.selectedAgent = id
  syncAgentEcosystemMap(root, id)
  syncAgentTaskStory(root, id)

  const url = new URL(window.location.href)
  url.searchParams.set('agent', id)
  window.history.replaceState({}, '', `${url.pathname}?agent=${encodeURIComponent(id)}${url.hash || ''}`)

  if (scrollStory) {
    document.getElementById('agent-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function setSelectedIndustry(root, state, id) {
  state.selectedIndustry = id
  syncIndustryAgentComposition(root, id)
}

function bindInteractions(root, state) {
  root.querySelectorAll('[data-ag-select]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.agSelect
      if (!id || id === state.selectedAgent) return
      setSelectedAgent(root, state, id)
    })
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      btn.click()
    })
  })

  root.querySelector('[data-ag-jump-story]')?.addEventListener('click', () => {
    document.getElementById('agent-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })

  root.querySelectorAll('[data-ag-industry]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.agIndustry
      if (!id || id === state.selectedIndustry) return
      setSelectedIndustry(root, state, id)
    })
  })

  // subtle workflow pulse
  let step = 0
  const tick = () => {
    const items = root.querySelectorAll('[data-ag-flow-step]')
    if (!items.length) return
    items.forEach((el) => el.classList.remove('is-active'))
    items[step % items.length]?.classList.add('is-active')
    step += 1
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduce) window.setInterval(tick, 2200)
}

export function initAgentsPage() {
  const root = document.getElementById('agents-root')
  if (!root) return

  const raw =
    new URLSearchParams(window.location.search).get('id') ||
    new URLSearchParams(window.location.search).get('agent') ||
    window.location.hash.replace(/^#/, '')
  const requested = raw ? (raw.startsWith('agent-') ? raw.slice(6) : raw) : null
  const resolved = requested ? resolveAgentOverviewId(requested) : AGENTS_OVERVIEW[0].id

  if (requested && !resolved) {
    root.innerHTML = renderNotFound(requested)
    return
  }

  const state = {
    selectedAgent: resolved || AGENTS_OVERVIEW[0].id,
    selectedIndustry: 'building',
  }

  root.innerHTML = `
    ${renderHero()}
    ${renderAgentEcosystemMap({ selectedId: state.selectedAgent })}
    ${renderAgentTaskStory({ selectedId: state.selectedAgent })}
    ${renderIndustryAgentComposition({ selectedIndustryId: state.selectedIndustry })}
    ${renderCta()}
  `

  bindInteractions(root, state)

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
