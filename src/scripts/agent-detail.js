import { AGENT_DETAILS, AGENT_ORDER } from '../data/agents-detail.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function getAgentId() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  return AGENT_DETAILS[id] ? id : AGENT_ORDER[0]
}

function renderRelated(currentId) {
  return AGENT_ORDER.filter((id) => id !== currentId)
    .slice(0, 3)
    .map((id) => {
      const a = AGENT_DETAILS[id]
      return `
        <a class="agent-detail-related__card" href="./?id=${id}" style="--accent: ${a.accent}">
          <span class="material-symbols-outlined">${a.icon}</span>
          <div>
            <strong>${esc(a.name)}</strong>
            <small>${esc(a.eyebrow)}</small>
          </div>
          <span class="material-symbols-outlined agent-detail-related__arrow">arrow_forward</span>
        </a>`
    })
    .join('')
}

export function initAgentDetail() {
  const mount = document.getElementById('agent-detail')
  if (!mount) return

  const id = getAgentId()
  const a = AGENT_DETAILS[id]
  document.title = `${a.name} | Atuo Future`

  mount.style.setProperty('--accent', a.accent)
  mount.innerHTML = `
    <section class="agent-detail-hero">
      <div class="agent-detail-hero__bg" aria-hidden="true"></div>
      <div class="max-w-max-width mx-auto px-margin-desktop relative z-10">
        <nav class="agent-detail-breadcrumb">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="../agents/">场景化智能体</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>${esc(a.name)}</span>
        </nav>
        <div class="agent-detail-hero__grid">
          <div>
            <span class="agent-detail-eyebrow">
              <span class="material-symbols-outlined">${a.icon}</span>
              ${esc(a.eyebrow)}
            </span>
            <h1 class="agent-detail-title">${esc(a.name)}</h1>
            <p class="agent-detail-tagline">${esc(a.tagline)}</p>
            <div class="agent-detail-hero__actions">
              <button type="button" class="site-header__btn site-header__btn--primary px-8 py-3">预约方案演示</button>
              <a href="../agents/#agent-matrix" class="site-header__btn site-header__btn--ghost px-8 py-3 inline-flex items-center justify-center">返回矩阵</a>
            </div>
          </div>
          <div class="agent-detail-hero__icon" aria-hidden="true">
            <span class="material-symbols-outlined">${a.icon}</span>
          </div>
        </div>
        <div class="agent-detail-metrics">
          ${a.metrics
            .map(
              (m) => `
            <div>
              <strong>${esc(m.value)}</strong>
              <span>${esc(m.label)}</span>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="py-20 bg-white">
      <div class="max-w-max-width mx-auto px-margin-desktop agent-detail-overview">
        <span class="agent-detail-section-kicker">能力概述</span>
        <p>${esc(a.overview)}</p>
      </div>
    </section>

    <section class="py-20 bg-surface-container-low">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="agent-detail-section-head">
          <span class="agent-detail-section-kicker">Core Capabilities</span>
          <h2>核心能力</h2>
        </div>
        <div class="agent-detail-cap-grid">
          ${a.capabilities
            .map(
              (c) => `
            <article class="agent-detail-cap-card">
              <span class="material-symbols-outlined">${c.icon}</span>
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.desc)}</p>
            </article>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="py-20 bg-white">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="agent-detail-section-head">
          <span class="agent-detail-section-kicker">How It Works</span>
          <h2>运行机制</h2>
        </div>
        <div class="agent-detail-flow">
          ${a.workflow
            .map(
              (w, i) => `
            <div class="agent-detail-flow__step">
              <div class="agent-detail-flow__index">${String(i + 1).padStart(2, '0')}</div>
              <h4>${esc(w.title)}</h4>
              <p>${esc(w.desc)}</p>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="py-20 bg-surface-container-low">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="agent-detail-section-head">
          <span class="agent-detail-section-kicker">Scenarios</span>
          <h2>适用场景</h2>
        </div>
        <div class="agent-detail-scenarios">
          ${a.scenarios
            .map(
              (s) => `<span class="agent-detail-scenario">${esc(s)}</span>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="py-20 bg-white">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="agent-detail-section-head">
          <span class="agent-detail-section-kicker">More Agents</span>
          <h2>探索其它智能体</h2>
        </div>
        <div class="agent-detail-related">
          ${renderRelated(id)}
        </div>
      </div>
    </section>

    <section class="agent-detail-cta">
      <div class="max-w-max-width mx-auto px-margin-desktop agent-detail-cta__inner">
        <div>
          <h2>让 ${esc(a.name)} 进驻您的空间</h2>
          <p>预约专属方案演示，了解该智能体如何与您的业务场景深度融合。</p>
        </div>
        <div class="agent-detail-cta__actions">
          <button type="button" class="site-header__btn site-header__btn--primary bg-white text-primary border-white px-8 py-3">预约方案演示</button>
          <a href="../ai-token/" class="site-header__btn site-header__btn--ghost bg-white/10 text-white border-white px-8 py-3 inline-flex items-center justify-center">了解 AIToken</a>
        </div>
      </div>
    </section>
  `
}
