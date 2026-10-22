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

function renderFlowCard(step) {
  if (step.kind === 'booking') {
    const b = step.booking
    return `
      <div class="space-ad__flow-card space-ad__flow-card--booking">
        <div class="space-ad__mini-card">
          <span class="material-symbols-outlined">calendar_month</span>
          <strong>${esc(b.title)}</strong>
          <em>${esc(b.time)}</em>
          <small>${esc(b.place)}</small>
          <small>${esc(b.people)}</small>
        </div>
      </div>`
  }
  if (step.kind === 'check') {
    return `
      <div class="space-ad__flow-card space-ad__flow-card--media">
        <img src="${esc(step.image)}" alt="" loading="lazy" />
        <div class="space-ad__flow-overlay space-ad__flow-overlay--ok">
          <span class="material-symbols-outlined">check_circle</span>
          <p>${esc(step.checkText).replace(/\n/g, '<br />')}</p>
        </div>
      </div>`
  }
  if (step.kind === 'ticket') {
    return `
      <div class="space-ad__flow-card space-ad__flow-card--media">
        <img src="${esc(step.image)}" alt="" loading="lazy" />
        <div class="space-ad__mini-card space-ad__mini-card--warn">
          <span class="material-symbols-outlined">warning</span>
          <strong>${esc(step.ticket.title)}</strong>
          <small>${esc(step.ticket.desc)}</small>
        </div>
      </div>`
  }
  if (step.kind === 'ready') {
    return `
      <div class="space-ad__flow-card space-ad__flow-card--media">
        <img src="${esc(step.image)}" alt="" loading="lazy" />
        <div class="space-ad__flow-overlay space-ad__flow-overlay--ok">
          <span class="material-symbols-outlined">check_circle</span>
          <p>${esc(step.readyText).replace(/\n/g, '<br />')}</p>
        </div>
      </div>`
  }
  return `
    <div class="space-ad__flow-card space-ad__flow-card--media">
      <img src="${esc(step.image)}" alt="" loading="lazy" />
    </div>`
}

function renderSpaceAgentDetail(a) {
  const p = SPACE_AGENT_PAGE
  return `
    <article class="space-ad">
      <section class="space-ad__hero">
        <div class="space-ad__wrap">
          <nav class="agent-detail-breadcrumb">
            <a href="../">首页</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <a href="../agents/">空间智能体</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <span>${esc(a.name)}</span>
          </nav>
          <div class="space-ad__hero-grid">
            <div class="space-ad__hero-copy">
              <h1>${esc(p.heroTitle)}</h1>
              <p>${esc(p.heroDesc)}</p>
              <div class="space-ad__btns">
                <a class="space-ad__btn space-ad__btn--primary" href="${esc(p.heroPrimary.href)}">
                  ${esc(p.heroPrimary.label)}
                  <span class="material-symbols-outlined">play_circle</span>
                </a>
                <button type="button" class="space-ad__btn space-ad__btn--ghost" data-demo-modal-open>${esc(p.heroSecondary.label)}</button>
              </div>
              <ul class="space-ad__venues">
                ${p.venues
                  .map(
                    (v) => `
                  <li>
                    <span class="material-symbols-outlined">${v.icon}</span>
                    ${esc(v.label)}
                  </li>`
                  )
                  .join('')}
              </ul>
            </div>
            <div class="space-ad__hero-visual">
              ${
                p.heroVideo
                  ? `<video class="space-ad__hero-media" src="${esc(p.heroVideo)}" poster="${esc(p.heroImage || '')}" autoplay muted loop playsinline></video>`
                  : `<img class="space-ad__hero-media" src="${esc(p.heroImage)}" alt="" width="900" height="560" fetchpriority="high" />`
              }
              <div class="space-ad__chips">
                ${p.heroChips
                  .map(
                    (c, i) => `
                  <span class="space-ad__chip space-ad__chip--${c.tone}" style="--i:${i}">
                    <i class="material-symbols-outlined">${c.icon}</i>
                    ${esc(c.text)}
                  </span>`
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="space-ad__block">
        <div class="space-ad__wrap">
          <header class="space-ad__head space-ad__head--center">
            <h2>${esc(p.flowTitle)}</h2>
            <p>${esc(p.flowDesc)}</p>
          </header>
          <ol class="space-ad__flow">
            ${p.flowSteps
              .map(
                (step, i) => `
              <li>
                <div class="space-ad__flow-dot">${String(i + 1).padStart(2, '0')}</div>
                <h3>${esc(step.title)}</h3>
                <p>${esc(step.desc)}</p>
                ${renderFlowCard(step)}
              </li>`
              )
              .join('')}
          </ol>
        </div>
      </section>

      <section class="space-ad__contrast">
        <div class="space-ad__wrap space-ad__contrast-inner">
          <figure class="space-ad__contrast-media">
            ${
              p.contrastVideo
                ? `<video class="space-ad__contrast-media-el" src="${esc(p.contrastVideo)}" poster="${esc(p.contrastImage || '')}" autoplay muted loop playsinline></video>`
                : `<img class="space-ad__contrast-media-el" src="${esc(p.contrastImage)}" alt="" loading="lazy" />`
            }
            <div class="space-ad__mini-card space-ad__mini-card--warn space-ad__contrast-badge">
              <span class="material-symbols-outlined">warning</span>
              <div>
                <strong>${esc(p.contrastBadge.title)}</strong>
                <small>${esc(p.contrastBadge.desc)}</small>
                <em>${esc(p.contrastBadge.time)}</em>
              </div>
            </div>
          </figure>
          <div class="space-ad__contrast-copy">
            <h2>${esc(p.contrastTitle)}</h2>
            <p>${esc(p.contrastDesc)}</p>
          </div>
        </div>
      </section>

      <section class="space-ad__block">
        <div class="space-ad__wrap space-ad__scenarios">
          ${p.scenarios
            .map(
              (s) => `
            <article class="space-ad__scenario">
              <div class="space-ad__scenario-copy">
                <span class="space-ad__scenario-icon material-symbols-outlined${s.tone === 'warn' ? ' space-ad__scenario-icon--warn' : ''}">${s.icon}</span>
                <h3>${esc(s.title)}</h3>
                <p>${esc(s.desc)}</p>
                <ul>
                  ${s.checks
                    .map(
                      (c) => `
                    <li><span class="material-symbols-outlined">check_circle</span>${esc(c)}</li>`
                    )
                    .join('')}
                </ul>
              </div>
              <figure class="space-ad__scenario-media">
                <img class="space-ad__scenario-media-el" src="${esc(s.image)}" alt="" loading="lazy" />
                ${s.badge ? `<span class="space-ad__scenario-badge">${esc(s.badge)}</span>` : ''}
              </figure>
              <ul class="space-ad__scenario-actions">
                ${s.actions
                  .map(
                    (act) => `
                  <li>
                    <span class="material-symbols-outlined">${act.icon}</span>
                    ${esc(act.label)}
                  </li>`
                  )
                  .join('')}
              </ul>
            </article>`
            )
            .join('')}
        </div>
      </section>

      <section class="space-ad__block space-ad__block--soft">
        <div class="space-ad__wrap">
          <header class="space-ad__head space-ad__head--center">
            <h2>${esc(p.archTitle)}</h2>
            <p>${esc(p.archDesc)}</p>
          </header>
          <div class="space-ad__arch">
            <div class="space-ad__arch-col">
              <h4>现有系统</h4>
              ${p.archLeft
                .map(
                  (item) => `
                <div class="space-ad__arch-item">
                  <span class="material-symbols-outlined">${item.icon}</span>
                  ${esc(item.label)}
                </div>`
                )
                .join('')}
            </div>
            <div class="space-ad__arch-core">
              <span class="material-symbols-outlined">${a.icon}</span>
              <strong>${esc(a.name)}</strong>
            </div>
            <div class="space-ad__arch-col space-ad__arch-col--right">
              <h4>执行与联动</h4>
              ${p.archRight
                .map(
                  (item) => `
                <div class="space-ad__arch-item">
                  <span class="material-symbols-outlined">${item.icon}</span>
                  ${esc(item.label)}
                </div>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="space-ad__block">
        <div class="space-ad__wrap">
          <header class="space-ad__head space-ad__head--center">
            <h2>${esc(p.outcomesTitle)}</h2>
          </header>
          <div class="space-ad__outcomes">
            ${p.outcomes
              .map(
                (item) => `
              <article class="space-ad__outcome">
                <span class="space-ad__outcome-icon space-ad__outcome-icon--${item.tone} material-symbols-outlined">${item.icon}</span>
                <div>
                  <h3>${esc(item.title)}</h3>
                  <p>${esc(item.desc)}</p>
                </div>
              </article>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="space-ad__block space-ad__block--soft">
        <div class="space-ad__wrap">
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
                <a class="space-ad__peer" href="./?id=${peer.id}">
                  <span class="space-ad__peer-icon space-ad__peer-icon--${peer.tone} material-symbols-outlined">${peer.icon}</span>
                  <span>
                    <strong>${esc(peer.name)}</strong>
                    <small>${esc(peer.desc)}</small>
                  </span>
                </a>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="space-ad__cta" style="--cta-img:url('${esc(p.ctaImage)}')">
        <div class="space-ad__wrap space-ad__cta-inner">
          <div>
            <h2>${esc(p.ctaTitle)}</h2>
            <p>${esc(p.ctaDesc)}</p>
          </div>
          <div class="space-ad__btns">
            <a class="space-ad__btn space-ad__btn--primary" href="../agents/#agent-story">观看一次自动运行</a>
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
