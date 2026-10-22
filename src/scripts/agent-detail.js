import { AGENT_DETAILS, AGENT_ORDER, applyAgentsLibraryCms, resolveAgentId } from '../data/agents-detail.js'
import { SPACE_AGENT_PAGE } from '../data/space-agent-page.js'
import { applyAgentsOverviewCms } from '../data/agents-overview.js'
import { applyProductAgentsCms } from '../data/product-agents.js'
import { loadAgentsLibraryContent } from '../services/site-settings-api.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function getAgentId() {
  const params = new URLSearchParams(window.location.search)
  return resolveAgentId(params.get('id'))
}

function renderNotFound(rawId) {
  document.title = '未找到该智能体 | 安托未来'
  return `
    <section class="pb-16 pt-8">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <nav class="agent-detail-breadcrumb mb-8">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="../agents/">空间智能体</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>未找到</span>
        </nav>
        <div class="sx-sol-detail__panel">
          <h1>未找到该智能体</h1>
          <p>链接参数${rawId ? ` “${esc(rawId)}”` : ''}无效或已下线。请返回智能体矩阵重新选择。</p>
          <p class="mt-6"><a class="sx-text-link" href="../agents/">← 返回空间智能体矩阵</a></p>
        </div>
      </div>
    </section>`
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
          </div>
          <span class="material-symbols-outlined agent-detail-related__arrow">arrow_forward</span>
        </a>`
    })
    .join('')
}

function renderSpaceHotspot(spot) {
  const style = `left:${spot.left}%;top:${spot.top}%;width:${spot.width}%;height:${spot.height}%;`
  if (spot.action === 'demo') {
    return `<button type="button" class="space-ad__hotspot" style="${style}" data-demo-modal-open aria-label="${esc(spot.label)}"></button>`
  }
  return `<a class="space-ad__hotspot" style="${style}" href="${esc(spot.href)}" aria-label="${esc(spot.label)}"></a>`
}

function renderSpaceAgentDetail(a) {
  const p = SPACE_AGENT_PAGE
  return `
    <article class="space-ad">
      <div class="space-ad__shell">
        <nav class="agent-detail-breadcrumb space-ad__crumb">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="../agents/">空间智能体</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>${esc(a.name)}</span>
        </nav>
        <div class="space-ad__canvas" style="--sad-w:${p.canvasWidth};--sad-h:${p.canvasHeight}">
          <img
            class="space-ad__canvas-img"
            src="${esc(p.canvas)}"
            alt="${esc(a.name)}产品介绍：让空间自动完成每天的运营任务"
            width="${p.canvasWidth}"
            height="${p.canvasHeight}"
            decoding="async"
            fetchpriority="high"
          />
          ${p.hotspots.map(renderSpaceHotspot).join('')}
        </div>
      </div>
    </article>
  `
}

export async function initAgentDetail() {
  const mount = document.getElementById('agent-detail')
  if (!mount) return
  const library = await loadAgentsLibraryContent()
  applyAgentsLibraryCms(library)
  applyAgentsOverviewCms(library)
  applyProductAgentsCms(library)

  const rawId = new URLSearchParams(window.location.search).get('id')
  const id = getAgentId()
  if (!id) {
    mount.innerHTML = renderNotFound(rawId)
    return
  }

  const a = AGENT_DETAILS[id]
  document.title = `${a.name} | 安托未来`

  mount.style.setProperty('--accent', a.accent)

  if (id === 'space') {
    mount.innerHTML = renderSpaceAgentDetail(a)
    return
  }

  mount.innerHTML = `
    <section class="agent-detail-hero">
      <div class="agent-detail-hero__bg" aria-hidden="true"></div>
      <div class="max-w-max-width mx-auto px-margin-desktop relative z-10">
        <nav class="agent-detail-breadcrumb">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="../agents/">空间智能体</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>${esc(a.name)}</span>
        </nav>
        <div class="agent-detail-hero__grid">
          <div>
            <span class="agent-detail-eyebrow" aria-hidden="true">
              <span class="material-symbols-outlined">${a.icon}</span>
            </span>
            <h1 class="agent-detail-title">${esc(a.name)}</h1>
            <p class="agent-detail-tagline">${esc(a.tagline)}</p>
            <div class="agent-detail-hero__actions">
              <button type="button" class="site-header__btn site-header__btn--primary px-8 py-3" data-demo-modal-open>预约方案演示</button>
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
          <button type="button" class="site-header__btn site-header__btn--primary bg-white text-primary border-white px-8 py-3" data-demo-modal-open>预约方案演示</button>
          <a href="https://token.atuofuture.com" class="site-header__btn site-header__btn--ghost bg-white/10 text-white border-white px-8 py-3 inline-flex items-center justify-center" target="_blank" rel="noopener noreferrer" data-token-link>了解 AI Token</a>
        </div>
      </div>
    </section>
  `
}
