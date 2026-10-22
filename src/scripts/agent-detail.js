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

function renderSpaceAgentDetail(a) {
  const p = SPACE_AGENT_PAGE
  return `
    <article class="space-ad">
      <section class="space-ad__hero">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <nav class="agent-detail-breadcrumb">
            <a href="../">首页</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <a href="../agents/">空间智能体</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <span>${esc(a.name)}</span>
          </nav>
          <div class="space-ad__hero-grid">
            <div class="space-ad__hero-copy">
              <p class="space-ad__eyebrow">${esc(a.name)}</p>
              <h1>${esc(p.heroTitle)}</h1>
              <p class="space-ad__lead">${esc(p.heroDesc)}</p>
              <div class="space-ad__actions">
                <a class="space-ad__btn space-ad__btn--primary" href="${esc(p.heroPrimary.href)}">
                  <span class="material-symbols-outlined">play_circle</span>
                  ${esc(p.heroPrimary.label)}
                </a>
                <button type="button" class="space-ad__btn space-ad__btn--ghost" data-demo-modal-open>${esc(p.heroSecondary.label)}</button>
              </div>
              <ul class="space-ad__venues">
                ${p.venues
                  .map(
                    (v) => `
                  <li>
                    <span class="material-symbols-outlined">${v.icon}</span>
                    <span>${esc(v.label)}</span>
                  </li>`
                  )
                  .join('')}
              </ul>
            </div>
            <div class="space-ad__hero-visual" aria-hidden="true">
              <img src="${esc(p.heroImage)}" alt="" width="960" height="720" loading="eager" />
              <div class="space-ad__chips">
                ${p.heroChips
                  .map((chip, i) => `<span class="space-ad__chip space-ad__chip--${chip.tone}" style="--i:${i}">${esc(chip.text)}</span>`)
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="space-ad__section" id="space-flow">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <header class="space-ad__head">
            <h2>${esc(p.flowTitle)}</h2>
            <p>${esc(p.flowDesc)}</p>
          </header>
          <ol class="space-ad__flow">
            ${p.flowSteps
              .map(
                (step, i) => `
              <li>
                <div class="space-ad__flow-index">${String(i + 1).padStart(2, '0')}</div>
                <h3>${esc(step.title)}</h3>
                <p>${esc(step.desc)}</p>
                <figure>
                  <img src="${esc(step.image)}" alt="" width="320" height="200" loading="lazy" />
                  <figcaption>${esc(step.caption)}</figcaption>
                </figure>
              </li>`
              )
              .join('')}
          </ol>
        </div>
      </section>

      <section class="space-ad__contrast">
        <div class="max-w-max-width mx-auto px-margin-desktop space-ad__contrast-grid">
          <figure class="space-ad__contrast-media">
            <img src="${esc(p.contrastImage)}" alt="" width="720" height="480" loading="lazy" />
            <span class="space-ad__contrast-badge">${esc(p.contrastBadge)}</span>
          </figure>
          <div class="space-ad__contrast-copy">
            <h2>${esc(p.contrastTitle)}</h2>
            <p>${esc(p.contrastDesc)}</p>
          </div>
        </div>
      </section>

      <section class="space-ad__section space-ad__section--soft">
        <div class="max-w-max-width mx-auto px-margin-desktop space-ad__scenarios">
          ${p.scenarios
            .map(
              (s) => `
            <article class="space-ad__scenario${s.reverse ? ' is-reverse' : ''}">
              <div class="space-ad__scenario-copy">
                <span class="space-ad__scenario-icon material-symbols-outlined">${s.icon}</span>
                <h3>${esc(s.title)}</h3>
                <p>${esc(s.desc)}</p>
                <ul>
                  ${s.checks.map((c) => `<li><span class="material-symbols-outlined">check_circle</span>${esc(c)}</li>`).join('')}
                </ul>
              </div>
              <figure class="space-ad__scenario-media">
                <img src="${esc(s.image)}" alt="" width="640" height="420" loading="lazy" />
                ${s.badge ? `<span class="space-ad__scenario-badge">${esc(s.badge)}</span>` : ''}
              </figure>
              <ol class="space-ad__scenario-actions">
                ${s.actions
                  .map(
                    (act, i) => `
                  <li>
                    <span>${String(i + 1).padStart(2, '0')}</span>
                    <em>${esc(act)}</em>
                  </li>`
                  )
                  .join('')}
              </ol>
            </article>`
            )
            .join('')}
        </div>
      </section>

      <section class="space-ad__section">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <header class="space-ad__head space-ad__head--center">
            <h2>${esc(p.archTitle)}</h2>
            <p>${esc(p.archDesc)}</p>
          </header>
          <div class="space-ad__arch">
            <ul class="space-ad__arch-side">
              <li class="space-ad__arch-label">现有系统</li>
              ${p.archLeft
                .map(
                  (item) => `
                <li>
                  <span class="material-symbols-outlined">${item.icon}</span>
                  <span>${esc(item.label)}</span>
                </li>`
                )
                .join('')}
            </ul>
            <div class="space-ad__arch-core">
              <span class="material-symbols-outlined">${a.icon}</span>
              <strong>${esc(a.name)}</strong>
            </div>
            <ul class="space-ad__arch-side space-ad__arch-side--right">
              <li class="space-ad__arch-label">执行与联动</li>
              ${p.archRight
                .map(
                  (item) => `
                <li>
                  <span class="material-symbols-outlined">${item.icon}</span>
                  <span>${esc(item.label)}</span>
                </li>`
                )
                .join('')}
            </ul>
          </div>
        </div>
      </section>

      <section class="space-ad__section space-ad__section--soft">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <header class="space-ad__head space-ad__head--center">
            <h2>${esc(p.outcomesTitle)}</h2>
          </header>
          <div class="space-ad__outcomes">
            ${p.outcomes
              .map(
                (item) => `
              <article class="space-ad__outcome space-ad__outcome--${item.tone}">
                <span class="material-symbols-outlined">${item.icon}</span>
                <h3>${esc(item.title)}</h3>
                <p>${esc(item.desc)}</p>
              </article>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="space-ad__section">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <header class="space-ad__head space-ad__head--center">
            <h2>${esc(p.collabTitle)}</h2>
            <p>${esc(p.collabDesc)}</p>
          </header>
          <div class="space-ad__collab">
            <div class="space-ad__collab-core">
              <span class="material-symbols-outlined">${a.icon}</span>
              <strong>${esc(a.name)}</strong>
            </div>
            <div class="space-ad__collab-peers">
              ${p.collabPeers
                .map(
                  (peer) => `
                <a class="space-ad__collab-peer" href="./?id=${peer.id}">
                  <span class="material-symbols-outlined">${peer.icon}</span>
                  <strong>${esc(peer.name)}</strong>
                  <small>${esc(peer.desc)}</small>
                </a>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="space-ad__cta">
        <div class="max-w-max-width mx-auto px-margin-desktop space-ad__cta-inner">
          <div>
            <h2>${esc(p.ctaTitle)}</h2>
            <p>${esc(p.ctaDesc)}</p>
          </div>
          <div class="space-ad__actions">
            <a class="space-ad__btn space-ad__btn--primary" href="../agents/#agent-story">观看自动运行</a>
            <button type="button" class="space-ad__btn space-ad__btn--light" data-demo-modal-open>预约场景演示</button>
          </div>
        </div>
      </section>
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
