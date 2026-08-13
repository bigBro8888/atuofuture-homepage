import {
  AGENTS_OVERVIEW,
  AGENTS_PROCESS,
  AGENTS_COLLAB,
  getAgentOverview,
  resolveAgentOverviewId,
} from '../data/agents-overview.js'
import { SHOW_TOKEN_ENTRY, TOKEN_SITE_URL } from '../data/site-links.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function readAgentParam() {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = resolveAgentOverviewId(params.get('id') || params.get('agent'))
  if (fromQuery) return fromQuery
  const hash = window.location.hash.replace(/^#/, '')
  if (hash.startsWith('agent-')) return resolveAgentOverviewId(hash.slice(6))
  return resolveAgentOverviewId(hash)
}

function renderHero() {
  return `
    <section class="ag-hero">
      <div class="ag-shell ag-hero__grid">
        <div class="ag-hero__copy">
          <h1>让智能体进入空间，真正完成任务</h1>
          <p>它不只回答问题，更能感知空间状态、理解业务规则、调用系统与设备，并持续跟踪任务结果。</p>
          <div class="ag-hero__actions">
            <a class="ag-btn ag-btn--primary" href="#agent-matrix">探索八大智能体</a>
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
        <ol class="ag-process">
          ${AGENTS_PROCESS.map(
            (step) => `
            <li>
              <span class="material-symbols-outlined" aria-hidden="true">${esc(step.icon)}</span>
              <strong>${esc(step.title)}</strong>
              <small>${esc(step.desc)}</small>
            </li>`
          ).join('')}
        </ol>
      </div>
    </section>`
}

function renderNav(activeId) {
  return `
    <div class="ag-nav" role="tablist" aria-label="八大智能体" data-ag-nav>
      ${AGENTS_OVERVIEW.map((a) => {
        const on = a.id === activeId
        return `
        <button
          type="button"
          class="ag-nav__item${on ? ' is-active' : ''}"
          role="tab"
          aria-selected="${on ? 'true' : 'false'}"
          data-ag-tab="${esc(a.id)}"
          id="agent-tab-${esc(a.id)}"
        >
          <span class="material-symbols-outlined" aria-hidden="true">${esc(a.icon)}</span>
          <span class="ag-nav__text">
            <strong>${esc(a.shortName)}</strong>
            <small>${esc(a.tagline)}</small>
          </span>
          <span class="material-symbols-outlined ag-nav__arrow" aria-hidden="true">arrow_forward</span>
        </button>`
      }).join('')}
    </div>`
}

function renderPanel(a) {
  return `
    <div class="ag-panel" data-ag-panel>
      <div class="ag-panel__scene" data-ag-scene style="--ag-scene-image:url('${esc(a.image)}')">
        <div class="ag-panel__overlays" data-ag-overlays>
          ${a.overlays
            .map(
              (item) => `
            <div class="ag-panel__chip">
              <span>${esc(item.label)}</span>
              <strong>${esc(item.value)}</strong>
            </div>`
            )
            .join('')}
        </div>
      </div>
      <div class="ag-panel__body" data-ag-body>
        <h3 data-ag-name>${esc(a.name)}</h3>
        <p class="ag-panel__desc" data-ag-desc>${esc(a.description)}</p>
        <div class="ag-panel__cols">
          <article>
            <h4>解决什么</h4>
            <p data-ag-problem>${esc(a.problem)}</p>
          </article>
          <article>
            <h4>执行什么</h4>
            <p data-ag-actions>${esc(a.actions)}</p>
          </article>
          <article>
            <h4>联动什么</h4>
            <p data-ag-integrations>${esc(a.integrations)}</p>
          </article>
        </div>
        <a class="ag-btn ag-btn--solid" data-ag-detail href="${esc(a.href)}">查看智能体详情 <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
      </div>
    </div>`
}

function renderWorkflow(a) {
  return `
    <section class="ag-workflow" aria-label="执行链">
      <div class="ag-shell">
        <header class="ag-section-head">
          <h2>当前智能体执行链</h2>
          <p data-ag-workflow-title>${esc(a.name)}如何把业务变化变成可执行任务</p>
        </header>
        <ol class="ag-workflow__list" data-ag-workflow>
          ${a.workflow
            .map(
              (step, i) => `
            <li>
              <em>${String(i + 1).padStart(2, '0')}</em>
              <strong>${esc(step.title)}</strong>
              <span>${esc(step.description)}</span>
            </li>`
            )
            .join('')}
        </ol>
      </div>
    </section>`
}

function renderCollab() {
  return `
    <section class="ag-collab">
      <div class="ag-shell">
        <header class="ag-section-head ag-section-head--light">
          <h2>一个智能体独立完成任务，多个智能体协同运营空间</h2>
          <p>八类智能体既可以独立落地，也可以围绕园区、楼宇、酒店、公寓等行业场景协同组合。</p>
        </header>
        <div class="ag-collab__flow" aria-hidden="true">
          <span>业务需求</span>
          <i></i>
          <span>空间智能中枢</span>
          <i></i>
          <span>多个场景智能体协同</span>
          <i></i>
          <span>软件系统＋智能硬件＋第三方设备</span>
          <i></i>
          <span>任务结果与状态反馈</span>
        </div>
        <div class="ag-collab__examples" data-ag-collab>
          ${AGENTS_COLLAB.map(
            (item, i) => `
            <button type="button" class="ag-collab__item${i === 0 ? ' is-active' : ''}" data-ag-collab-tab="${esc(item.id)}">
              <strong>${esc(item.title)}</strong>
              <span>${esc(item.agents)}</span>
            </button>`
          ).join('')}
        </div>
      </div>
    </section>`
}

function renderTokenNote() {
  if (!SHOW_TOKEN_ENTRY) return ''
  return `
    <section class="ag-token">
      <div class="ag-shell ag-token__inner">
        <p>需要模型与工具调用能力时，可通过 AI Token 服务接入。</p>
        <a href="${esc(TOKEN_SITE_URL)}" target="_blank" rel="noopener noreferrer" data-token-link>了解 AI Token</a>
      </div>
    </section>`
}

function renderCta() {
  return `
    <section class="ag-cta">
      <div class="ag-shell ag-cta__inner">
        <div>
          <h2>让空间智能体进入您的业务现场</h2>
          <p>告诉我们您的空间类型和核心问题，安托未来将为您组合适合的智能体、硬件与系统能力。</p>
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

function renderPage(activeId) {
  const active = getAgentOverview(activeId) || AGENTS_OVERVIEW[0]
  return `
    ${renderHero()}
    <section class="ag-selector" id="agent-matrix">
      <div class="ag-shell">
        <header class="ag-section-head">
          <h2>选择一个智能体，查看它如何工作</h2>
          <p>每个智能体都可以独立落地，也可以根据行业和业务需求协同组合。</p>
        </header>
        <div class="ag-selector__layout">
          ${renderNav(active.id)}
          ${renderPanel(active)}
        </div>
      </div>
    </section>
    ${renderWorkflow(active)}
    ${renderCollab()}
    ${renderTokenNote()}
    ${renderCta()}
  `
}

function applyAgent(root, id) {
  const a = getAgentOverview(id)
  if (!a) return false

  root.querySelectorAll('[data-ag-tab]').forEach((btn) => {
    const on = btn.dataset.agTab === a.id
    btn.classList.toggle('is-active', on)
    btn.setAttribute('aria-selected', on ? 'true' : 'false')
  })

  const scene = root.querySelector('[data-ag-scene]')
  const body = root.querySelector('[data-ag-body]')
  const workflow = root.querySelector('[data-ag-workflow]')
  if (scene) {
    scene.classList.remove('is-animating')
    void scene.offsetWidth
    scene.style.setProperty('--ag-scene-image', `url('${a.image}')`)
    scene.classList.add('is-animating')
  }
  if (body) {
    body.classList.remove('is-animating')
    void body.offsetWidth
    body.classList.add('is-animating')
  }

  const overlays = root.querySelector('[data-ag-overlays]')
  if (overlays) {
    overlays.innerHTML = a.overlays
      .map(
        (item) => `
      <div class="ag-panel__chip">
        <span>${esc(item.label)}</span>
        <strong>${esc(item.value)}</strong>
      </div>`
      )
      .join('')
  }

  const setText = (sel, value) => {
    const el = root.querySelector(sel)
    if (el) el.textContent = value
  }
  setText('[data-ag-name]', a.name)
  setText('[data-ag-desc]', a.description)
  setText('[data-ag-problem]', a.problem)
  setText('[data-ag-actions]', a.actions)
  setText('[data-ag-integrations]', a.integrations)
  setText('[data-ag-workflow-title]', `${a.name}如何把业务变化变成可执行任务`)

  const detail = root.querySelector('[data-ag-detail]')
  if (detail) detail.setAttribute('href', a.href)

  if (workflow) {
    workflow.innerHTML = a.workflow
      .map(
        (step, i) => `
      <li>
        <em>${String(i + 1).padStart(2, '0')}</em>
        <strong>${esc(step.title)}</strong>
        <span>${esc(step.description)}</span>
      </li>`
      )
      .join('')
  }

  const url = new URL(window.location.href)
  url.searchParams.set('agent', a.id)
  url.hash = 'agent-matrix'
  window.history.replaceState({}, '', `${url.pathname}?agent=${encodeURIComponent(a.id)}#agent-matrix`)
  return true
}

function initInteractions(root, initialId) {
  let activeId = initialId
  const tabs = [...root.querySelectorAll('[data-ag-tab]')]

  const selectByIndex = (index) => {
    const next = AGENTS_OVERVIEW[(index + AGENTS_OVERVIEW.length) % AGENTS_OVERVIEW.length]
    activeId = next.id
    applyAgent(root, activeId)
    tabs[index]?.focus()
  }

  tabs.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.agTab
      if (!id || id === activeId) return
      activeId = id
      applyAgent(root, id)
    })
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        selectByIndex(index + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        selectByIndex(index - 1)
      }
    })
  })

  root.querySelectorAll('[data-ag-collab-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('[data-ag-collab-tab]').forEach((el) => el.classList.remove('is-active'))
      btn.classList.add('is-active')
    })
  })
}

export function initAgentsPage() {
  const root = document.getElementById('agents-root')
  if (!root) return

  const raw = new URLSearchParams(window.location.search).get('id') || new URLSearchParams(window.location.search).get('agent') || window.location.hash.replace(/^#/, '')
  const requested = raw ? (raw.startsWith('agent-') ? raw.slice(6) : raw) : null
  const resolved = requested ? resolveAgentOverviewId(requested) : AGENTS_OVERVIEW[0].id

  if (requested && !resolved) {
    root.innerHTML = renderNotFound(requested)
    return
  }

  const activeId = resolved || AGENTS_OVERVIEW[0].id
  root.innerHTML = renderPage(activeId)
  initInteractions(root, activeId)
}
