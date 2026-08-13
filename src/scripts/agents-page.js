import {
  AGENTS_OVERVIEW,
  AGENTS_CAPABILITY_CHAIN,
  AGENTS_HUB_LAYERS,
  AGENTS_INDUSTRY,
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

function renderHero() {
  return `
    <section class="ag-hero">
      <div class="ag-shell ag-hero__grid">
        <div class="ag-hero__copy">
          <h1>让空间智能体感知现场、调用设备、完成任务</h1>
          <p>不只是回答问题，而是连接软件系统、智能硬件与业务流程，让空间能够自主感知、判断、执行并持续反馈。</p>
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

function renderMatrixCard(a, selectedId) {
  const on = a.id === selectedId
  return `
    <article
      class="ag-card${on ? ' is-selected' : ''}"
      style="--ag-accent:${esc(a.accent || '#00BFC1')}"
    >
      <button
        type="button"
        class="ag-card__hit"
        data-ag-select="${esc(a.id)}"
        aria-pressed="${on ? 'true' : 'false'}"
      >
        <span class="ag-card__bar" aria-hidden="true"></span>
        <span class="ag-card__top">
          <span class="ag-card__icon" aria-hidden="true">
            <span class="material-symbols-outlined">${esc(a.icon)}</span>
          </span>
          <span class="ag-card__go" aria-hidden="true">
            <span class="material-symbols-outlined">arrow_outward</span>
          </span>
        </span>
        <span class="ag-card__title">
          <strong>${esc(a.name)}</strong>
          ${a.abbr ? `<small class="ag-card__abbr">${esc(a.abbr)}</small>` : ''}
        </span>
        <span class="ag-card__value">${esc(a.value)}</span>
        <span class="ag-card__tasks">${esc(a.tasks.join(' · '))}</span>
      </button>
      <a class="ag-card__detail" href="${esc(a.detailUrl)}">查看详情</a>
    </article>`
}

function renderMatrix(selectedId) {
  return `
    <section class="ag-matrix" id="agent-matrix">
      <div class="ag-shell ag-shell--1280">
        <header class="ag-section-head">
          <h2>八大空间智能体，覆盖空间运营的核心业务</h2>
          <p>每个智能体都可以独立落地，也可以根据行业、空间和业务需求协同组合。</p>
        </header>
        <div class="ag-matrix__grid" role="list">
          ${AGENTS_OVERVIEW.map((a) => renderMatrixCard(a, selectedId)).join('')}
        </div>
      </div>
    </section>`
}

function renderStage(a) {
  return `
    <section class="ag-stage" id="agent-stage" aria-live="polite">
      <div class="ag-shell ag-shell--1280">
        <header class="ag-section-head">
          <h2>看一次智能体如何完成真实任务</h2>
          <p>从业务或环境变化开始，到系统与设备执行，再到结果回读，形成完整闭环。</p>
        </header>
        <div class="ag-stage__layout" data-ag-stage>
          <div class="ag-stage__media" data-ag-scene>
            <img
              src="${esc(a.image)}"
              alt="${esc(a.name)}业务场景"
              width="960"
              height="600"
              loading="lazy"
              data-ag-scene-img
            />
            <div class="ag-stage__flow" data-ag-mini-flow aria-hidden="true">
              ${a.workflow
                .map((step, i) => `<span>${esc(step)}${i < a.workflow.length - 1 ? ' → ' : ''}</span>`)
                .join('')}
            </div>
          </div>
          <div class="ag-stage__body" data-ag-body>
            <p class="ag-stage__kicker" data-ag-short>${esc(a.shortName)}</p>
            <h3 data-ag-name>${esc(a.name)}</h3>
            <p class="ag-stage__value" data-ag-value>${esc(a.value)}</p>
            <ol class="ag-loop">
              <li>
                <span class="ag-loop__index">01</span>
                <div>
                  <strong>何时触发</strong>
                  <p data-ag-trigger>${esc(a.trigger)}</p>
                </div>
              </li>
              <li>
                <span class="ag-loop__index">02</span>
                <div>
                  <strong>自动执行</strong>
                  <p data-ag-actions>${esc(a.actions)}</p>
                </div>
              </li>
              <li>
                <span class="ag-loop__index">03</span>
                <div>
                  <strong>结果回读</strong>
                  <p data-ag-result>${esc(a.result)}</p>
                </div>
              </li>
            </ol>
            <a class="ag-btn ag-btn--solid" data-ag-detail href="${esc(a.detailUrl)}">查看智能体详情</a>
          </div>
        </div>
      </div>
    </section>`
}

function renderHub() {
  const agents = AGENTS_OVERVIEW.map(
    (a, i) => `
    <button
      type="button"
      class="ag-hub__agent"
      style="--i:${i}"
      data-ag-hub-node="${esc(a.id)}"
      aria-label="${esc(a.name)}"
    >
      <span class="material-symbols-outlined" aria-hidden="true">${esc(a.icon)}</span>
      <strong>${esc(a.shortName)}</strong>
    </button>`
  ).join('')

  const group = (key, layer) => `
    <div class="ag-hub__group ag-hub__group--${esc(key)}" data-ag-hub-group="${esc(key)}">
      <h4>${esc(layer.title)}</h4>
      <ul>
        ${layer.items.map((item) => `<li>${esc(item)}</li>`).join('')}
      </ul>
    </div>`

  return `
    <section class="ag-hub">
      <div class="ag-shell ag-shell--1280">
        <header class="ag-section-head ag-section-head--light">
          <h2>一个智能体完成任务，多个智能体协同运营空间</h2>
          <p>八大智能体共享空间智能中枢，并与软件系统、智能硬件及第三方平台持续交换状态和任务。</p>
        </header>
        <div class="ag-hub__diagram" data-ag-hub>
          <div class="ag-hub__orbit" aria-hidden="true"></div>
          <div class="ag-hub__core">
            <span class="material-symbols-outlined">hub</span>
            <strong>空间智能中枢</strong>
            <small>状态进入 → 调度智能体 → 调用系统与设备 → 结果回读</small>
          </div>
          <div class="ag-hub__agents">${agents}</div>
          <div class="ag-hub__outer">
            ${group('software', AGENTS_HUB_LAYERS.software)}
            ${group('hardware', AGENTS_HUB_LAYERS.hardware)}
            ${group('ecosystem', AGENTS_HUB_LAYERS.ecosystem)}
          </div>
        </div>
        <div class="ag-hub__open">
          <span>开放接口：API · MCP · AI Token · 第三方协议</span>
          ${
            SHOW_TOKEN_ENTRY
              ? `<a href="${esc(TOKEN_SITE_URL)}" target="_blank" rel="noopener noreferrer" data-token-link>了解 AI Token</a>`
              : ''
          }
        </div>
      </div>
    </section>`
}

function renderIndustry() {
  return `
    <section class="ag-industry">
      <div class="ag-shell ag-shell--1280">
        <header class="ag-section-head">
          <h2>按业务场景自由组合智能体</h2>
          <p>从楼宇、园区到酒店公寓，按行业需求组合智能体能力，快速形成可落地的协同方案。</p>
        </header>
        <div class="ag-industry__grid">
          ${AGENTS_INDUSTRY.map(
            (item) => `
            <article class="ag-industry__card">
              <div class="ag-industry__icon" aria-hidden="true">
                <span class="material-symbols-outlined">${esc(item.icon)}</span>
              </div>
              <div class="ag-industry__body">
                <h3>${esc(item.title)}</h3>
                <p>${esc(item.desc)}</p>
                <div class="ag-industry__tags">
                  ${item.combo.map((tag) => `<span>${esc(tag)}</span>`).join('')}
                </div>
                <a class="ag-text-link" href="${esc(item.href)}">查看行业方案 →</a>
              </div>
            </article>`
          ).join('')}
        </div>
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

function renderPage(activeId) {
  const active = getAgentOverview(activeId) || AGENTS_OVERVIEW[0]
  return `
    ${renderHero()}
    ${renderMatrix(active.id)}
    ${renderStage(active)}
    ${renderHub()}
    ${renderIndustry()}
    ${renderCta()}
  `
}

function applyAgent(root, id) {
  const a = getAgentOverview(id)
  if (!a) return false

  root.querySelectorAll('[data-ag-select]').forEach((btn) => {
    const on = btn.dataset.agSelect === a.id
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
    btn.closest('.ag-card')?.classList.toggle('is-selected', on)
  })

  const stage = root.querySelector('[data-ag-stage]')
  const body = root.querySelector('[data-ag-body]')
  const scene = root.querySelector('[data-ag-scene]')
  const img = root.querySelector('[data-ag-scene-img]')
  const mini = root.querySelector('[data-ag-mini-flow]')

  ;[stage, body, scene].forEach((el) => {
    if (!el) return
    el.classList.remove('is-animating')
    void el.offsetWidth
    el.classList.add('is-animating')
  })

  if (img) {
    img.src = a.image
    img.alt = `${a.name}业务场景`
  }
  if (mini) {
    mini.innerHTML = a.workflow
      .map((step, i) => `<span>${esc(step)}${i < a.workflow.length - 1 ? ' → ' : ''}</span>`)
      .join('')
  }

  const setText = (sel, value) => {
    const el = root.querySelector(sel)
    if (el) el.textContent = value
  }
  setText('[data-ag-short]', a.shortName)
  setText('[data-ag-name]', a.name)
  setText('[data-ag-value]', a.value)
  setText('[data-ag-trigger]', a.trigger)
  setText('[data-ag-actions]', a.actions)
  setText('[data-ag-result]', a.result)

  const detail = root.querySelector('[data-ag-detail]')
  if (detail) detail.setAttribute('href', a.detailUrl)

  const url = new URL(window.location.href)
  url.searchParams.set('agent', a.id)
  url.hash = 'agent-matrix'
  window.history.replaceState({}, '', `${url.pathname}?agent=${encodeURIComponent(a.id)}#agent-matrix`)
  return true
}

function initInteractions(root, initialId) {
  let activeId = initialId
  const cards = [...root.querySelectorAll('[data-ag-select]')]

  const selectByIndex = (index) => {
    const next = AGENTS_OVERVIEW[(index + AGENTS_OVERVIEW.length) % AGENTS_OVERVIEW.length]
    activeId = next.id
    applyAgent(root, activeId)
    cards[index]?.focus()
    document.getElementById('agent-stage')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  cards.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.agSelect
      if (!id || id === activeId) {
        document.getElementById('agent-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      activeId = id
      applyAgent(root, id)
    })
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        selectByIndex(index + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        selectByIndex(index - 1)
      }
    })
  })

  root.querySelectorAll('[data-ag-hub-node]').forEach((node) => {
    node.addEventListener('mouseenter', () => {
      root.querySelector('[data-ag-hub]')?.classList.add('is-hot')
      node.classList.add('is-hot')
    })
    node.addEventListener('mouseleave', () => {
      root.querySelector('[data-ag-hub]')?.classList.remove('is-hot')
      node.classList.remove('is-hot')
    })
    node.addEventListener('focus', () => {
      root.querySelector('[data-ag-hub]')?.classList.add('is-hot')
      node.classList.add('is-hot')
    })
    node.addEventListener('blur', () => {
      root.querySelector('[data-ag-hub]')?.classList.remove('is-hot')
      node.classList.remove('is-hot')
    })
    node.addEventListener('click', () => {
      const id = node.dataset.agHubNode
      if (!id) return
      activeId = id
      applyAgent(root, id)
      document.getElementById('agent-matrix')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
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

  const activeId = resolved || AGENTS_OVERVIEW[0].id
  root.innerHTML = renderPage(activeId)
  initInteractions(root, activeId)

  if (window.location.hash === '#agent-matrix' || window.location.hash === '#agent-stage') {
    window.setTimeout(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }
}
