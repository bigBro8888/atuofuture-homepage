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

function renderIconCard(item, className = '') {
  return `
    <article class="${className}">
      <span class="material-symbols-outlined">${item.icon || 'auto_awesome'}</span>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.desc)}</p>
    </article>`
}

function renderReceptionDetail(a) {
  const r = a.receptionPage

  return `
    <article class="reception-page">
      <section class="reception-hero">
        <div class="reception-hero__bg" aria-hidden="true"></div>
        <div class="max-w-max-width mx-auto px-margin-desktop relative z-10">
          <nav class="agent-detail-breadcrumb">
            <a href="../">首页</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <a href="../agents/">场景化智能体</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <span>${esc(a.name)}</span>
          </nav>
          <div class="reception-hero__grid">
            <div class="reception-hero__copy">
              <span class="reception-kicker"><span class="material-symbols-outlined">sensor_occupied</span> 会务接待智能体</span>
              <h1>会务接待智能体</h1>
              <h2>让每一次来访，从预约到离场都被智能编排</h2>
              <p>面向企业总部、产业园区、展厅、会议中心等场景，统一调度访客、车位、电梯、门禁、会议室、工单与大屏，实现高规格接待流程自动化。</p>
              <div class="reception-hero__tags">
                ${r.heroTags.map((tag) => `<span>${esc(tag)}</span>`).join('')}
              </div>
              <div class="reception-hero__actions">
                <button type="button" class="site-header__btn site-header__btn--primary px-8 py-3">预约方案演示</button>
                <a href="#reception-flow" class="site-header__btn site-header__btn--ghost px-8 py-3 inline-flex items-center justify-center">查看接待流程</a>
              </div>
            </div>
            <div class="reception-map" aria-label="接待流程空间图">
              <div class="reception-map__core">
                <span class="material-symbols-outlined">hub</span>
                <strong>Reception Orchestrator</strong>
                <small>接待流程编排中枢</small>
              </div>
              <div class="reception-map__nodes">
                ${r.flowNodes
                  .map(
                    (node, i) => `
                  <div class="reception-map__node" style="--i:${i}">
                    <span>${String(i + 1).padStart(2, '0')}</span>
                    <b>${esc(node)}</b>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="reception-section reception-pain-section">
        <div class="reception-problem-burst" aria-hidden="true">
          <span>车位未预留</span>
          <span>门禁权限缺失</span>
          <span>会议室未准备</span>
          <span>派梯未同步</span>
          <span>访客信息分散</span>
          <span>服务无人响应</span>
        </div>
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <div class="reception-section__head">
            <span class="reception-kicker">Pain Points · 问题诊断</span>
            <h2>传统会务接待为什么效率低？</h2>
          </div>
          <div class="reception-pain-grid">
            ${r.painPoints.map((item) => renderIconCard(item, 'reception-pain-card')).join('')}
          </div>
        </div>
      </section>

      <section class="reception-section reception-section--blue" id="reception-flow">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <div class="reception-section__head">
            <span class="reception-kicker">Reception Flow</span>
            <h2>一次高规格接待，智能体如何自动完成？</h2>
          </div>
          <div class="reception-timeline">
            ${r.timeline
              .map(
                (item, i) => `
              <article class="reception-step">
                <span>${String(i + 1).padStart(2, '0')}</span>
                <h3>${esc(item.title)}</h3>
                <p>${esc(item.desc)}</p>
              </article>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="reception-section">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <div class="reception-section__head">
            <span class="reception-kicker">Core Capabilities</span>
            <h2>从接待流程，到空间设备的统一调度</h2>
          </div>
          <div class="reception-cap-grid">
            ${r.capabilityGrid.map((item) => renderIconCard(item, 'reception-cap-card')).join('')}
          </div>
        </div>
      </section>

      <section class="reception-section reception-architecture-section">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <div class="reception-section__head">
            <span class="reception-kicker">Agent Architecture</span>
            <h2>为什么它不是普通会务系统？</h2>
            <p>会务接待智能体通过感知、理解、编排、执行四层能力，把多个孤立系统连接成一条自动化接待链路。</p>
          </div>
          <div class="reception-architecture">
            <div class="reception-brain">
              <span class="material-symbols-outlined">psychology</span>
              <strong>AI智能体大脑</strong>
              <small>规则理解 · 任务编排 · 系统调度</small>
            </div>
            <div class="reception-architecture__layers">
              ${r.architecture
                .map(
                  (layer) => `
                <article>
                  <h3>${esc(layer.title)}</h3>
                  <p>${esc(layer.desc)}</p>
                </article>`
                )
                .join('')}
            </div>
            <div class="reception-system-cloud">
              ${r.systems.map((system) => `<span>${esc(system)}</span>`).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="reception-section">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <div class="reception-section__head">
            <span class="reception-kicker">Use Cases</span>
            <h2>适用于多种高频接待场景</h2>
          </div>
          <div class="reception-scenario-grid">
            ${r.useCases
              .map(
                (useCase) => `
              <article class="reception-scenario-card">
                <h3>${esc(useCase.title)}</h3>
                <p>${esc(useCase.fit)}</p>
                <div>${useCase.steps.map((step) => `<span>${esc(step)}</span>`).join('')}</div>
              </article>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="reception-section reception-section--compare">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <div class="reception-section__head">
            <span class="reception-kicker">Before / After</span>
            <h2>从人工协调，到智能体自动编排</h2>
          </div>
          <div class="reception-compare">
            <article class="reception-compare__panel">
              <h3>传统方式</h3>
              <ul>${r.before.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
            </article>
            <div class="reception-compare__arrow"><span class="material-symbols-outlined">arrow_forward</span></div>
            <article class="reception-compare__panel reception-compare__panel--after">
              <h3>智能体方式</h3>
              <ul>${r.after.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
            </article>
          </div>
        </div>
      </section>

      <section class="reception-section">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <div class="reception-section__head">
            <span class="reception-kicker">Customer Value</span>
            <h2>让接待更高效、更体面、更可管理</h2>
          </div>
          <div class="reception-value-grid">
            ${r.values
              .map(
                (item, i) => `
              <article>
                <span>${String(i + 1).padStart(2, '0')}</span>
                <h3>${esc(item.title)}</h3>
                <p>${esc(item.desc)}</p>
              </article>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="reception-cta">
        <div class="max-w-max-width mx-auto px-margin-desktop reception-cta__inner">
          <div>
            <span class="reception-kicker">Next Step</span>
            <h2>想让你的总部接待流程自动跑起来？</h2>
            <p>我们可以基于现有门禁、停车、电梯、会议室和工单系统，快速梳理一套会务接待智能体方案。</p>
          </div>
          <div class="reception-cta__actions">
            <button type="button" class="site-header__btn site-header__btn--primary bg-white text-primary border-white px-8 py-3">预约方案演示</button>
            <a href="../#solutions" class="site-header__btn site-header__btn--ghost bg-white/10 text-white border-white px-8 py-3 inline-flex items-center justify-center">查看智慧总部案例</a>
          </div>
        </div>
      </section>
    </article>
  `
}

export function initAgentDetail() {
  const mount = document.getElementById('agent-detail')
  if (!mount) return

  const id = getAgentId()
  const a = AGENT_DETAILS[id]
  document.title = `${a.name} | Atuo Future`

  mount.style.setProperty('--accent', a.accent)
  if (id === 'reception') {
    mount.innerHTML = renderReceptionDetail(a)
    return
  }

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
