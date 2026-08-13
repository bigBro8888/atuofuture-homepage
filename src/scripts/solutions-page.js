import {
  SOLUTIONS,
  SOLUTIONS_HERO,
  SOLUTIONS_BASE_NODES,
  resolveSolutionId,
  getSolution,
} from '../data/solutions.js'
import { getProductAgent } from '../data/product-agents.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function agentLabel(id) {
  const a = getProductAgent(id)
  if (!a) return id
  return a.name.replace(/智能体$/, '')
}

function renderHero() {
  const h = SOLUTIONS_HERO
  return `
    <section class="sol-home-hero" style="--sol-hero-image:url('${esc(h.image)}')">
      <div class="sol-home-hero__media" aria-hidden="true"></div>
      <div class="sol-home-hero__shade" aria-hidden="true"></div>
      <div class="sol-home-shell sol-home-hero__inner">
        <div class="sol-home-hero__copy">
          <h1>${esc(h.title)}</h1>
          <p>${esc(h.desc)}</p>
          <div class="sol-home-hero__actions">
            <button type="button" class="sol-btn sol-btn--primary" data-demo-modal-open>预约方案演示</button>
            <a class="sol-btn sol-btn--ghost" href="#sol-base">了解整体架构</a>
          </div>
        </div>
      </div>
    </section>`
}

function renderScene(s) {
  return `
    <div class="sol-scene__stage" data-sol-scene style="--sol-scene-image:url('${esc(s.image)}')">
      <div class="sol-scene__shade" aria-hidden="true"></div>
      <div class="sol-scene__copy">
        <h3 data-sol-scene-name>${esc(s.name)}</h3>
        <p data-sol-scene-value>${esc(s.value)}</p>
        <a class="sol-scene__link" data-sol-detail-link href="./?id=${esc(s.id)}">查看完整方案 →</a>
      </div>
    </div>`
}

function renderNav(activeId) {
  return `
    <div class="sol-scene__nav" role="tablist" aria-label="行业场景">
      ${SOLUTIONS.map((s) => {
        const active = s.id === activeId
        return `
        <button
          type="button"
          class="sol-scene__nav-item${active ? ' is-active' : ''}"
          role="tab"
          aria-selected="${active ? 'true' : 'false'}"
          data-sol-tab="${esc(s.id)}"
        >
          <span class="material-symbols-outlined" aria-hidden="true">${esc(s.icon)}</span>
          <span class="sol-scene__nav-label">${esc(s.name)}</span>
          <span class="material-symbols-outlined sol-scene__nav-arrow" aria-hidden="true">arrow_forward</span>
        </button>`
      }).join('')}
    </div>`
}

function renderValues(s) {
  return `
    <section class="sol-values" data-sol-values>
      <div class="sol-home-shell sol-values__inner">
        <div class="sol-values__label">
          <strong data-sol-values-name>${esc(s.name)}</strong>
          <h3>核心价值</h3>
          <i aria-hidden="true"></i>
        </div>
        <div class="sol-values__list" data-sol-values-list>
          ${s.coreValues
            .map(
              (item) => `
            <article class="sol-values__item">
              <span class="material-symbols-outlined" aria-hidden="true">${esc(item.icon)}</span>
              <div>
                <h4>${esc(item.title)}</h4>
                <p>${esc(item.desc)}</p>
              </div>
            </article>`
            )
            .join('')}
        </div>
        <a class="sol-values__more" data-sol-detail-link href="./?id=${esc(s.id)}">查看完整方案 →</a>
      </div>
    </section>`
}

function renderBase(s) {
  return `
    <section class="sol-base" id="sol-base">
      <div class="sol-home-shell">
        <header class="sol-base__head">
          <h2>统一空间智能底座，组合不同的行业能力</h2>
          <p>不同空间面对的问题不同，但底层都需要完成感知、决策、执行与反馈。安托未来通过统一中枢，按行业组合智能体、硬件和开放接口。</p>
        </header>
        <div class="sol-base__flow" data-sol-base-flow>
          ${SOLUTIONS_BASE_NODES.map(
            (node, index) => `
            <div class="sol-base__node${node.id === 'agents' ? ' is-agents' : ''}" data-sol-node="${esc(node.id)}">
              <div class="sol-base__card">
                <span class="material-symbols-outlined" aria-hidden="true">${esc(node.icon)}</span>
                <strong>${esc(node.title)}</strong>
                <p>${esc(node.desc)}</p>
                ${
                  node.id === 'agents'
                    ? `<div class="sol-base__agents" data-sol-agents>
                        ${(s.highlightAgents || [])
                          .slice(0, 3)
                          .map((id) => `<span>${esc(agentLabel(id))}</span>`)
                          .join('')}
                      </div>`
                    : ''
                }
              </div>
              ${index < SOLUTIONS_BASE_NODES.length - 1 ? '<div class="sol-base__arrow" aria-hidden="true"><span></span></div>' : ''}
            </div>`
          ).join('')}
        </div>
      </div>
    </section>`
}

function renderCta() {
  return `
    <section class="sol-cta">
      <div class="sol-home-shell sol-cta__inner">
        <div class="sol-cta__copy">
          <h2>找到适合您的空间智能方案</h2>
          <p>告诉我们您的行业、空间规模和核心问题，安托未来将为您组合合适的智能体、硬件与系统能力。</p>
          <div class="sol-cta__actions">
            <button type="button" class="sol-btn sol-btn--primary" data-demo-modal-open>预约方案演示</button>
            <a class="sol-btn sol-btn--ghost" href="../about/#contact">联系方案顾问</a>
          </div>
        </div>
        <div class="sol-cta__visual" aria-hidden="true" style="--sol-cta-image:url('/images/solutions/cta.jpg')"></div>
      </div>
    </section>`
}

function renderList() {
  document.title = '行业解决方案 | 安托未来'
  const active = SOLUTIONS[0]
  return `
    ${renderHero()}
    <section class="sol-scene" id="sol-scene">
      <div class="sol-home-shell">
        <header class="sol-scene__head">
          <h2>选择您的行业场景</h2>
        </header>
        <div class="sol-scene__layout">
          ${renderScene(active)}
          ${renderNav(active.id)}
        </div>
      </div>
    </section>
    ${renderValues(active)}
    ${renderBase(active)}
    ${renderCta()}
  `
}

function renderDetail(id) {
  const s = getSolution(id)
  if (!s) return renderList()
  document.title = `${s.name} | 安托未来`
  return `
    <section class="pb-12 sol-detail-wrap">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <nav class="agent-detail-breadcrumb mb-8">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="./">行业解决方案</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>${esc(s.name)}</span>
        </nav>

        <div class="sx-sol-list__media mb-8" style="height:280px;background-image:url('${esc(s.image)}')" role="img" aria-label="${esc(s.name)}"></div>

        <div class="sx-section-head">
          <h1>${esc(s.name)}</h1>
          <p>${esc(s.summary)}</p>
        </div>

        <div class="sx-sol-detail" style="margin-bottom:28px">
          <div class="sx-sol-detail__panel">
            <h2>行业定位与主要问题</h2>
            <p>${esc(s.value)}</p>
            <ul>${(s.pains || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </div>
          <div class="sx-sol-detail__panel">
            <h2>安托未来解决思路</h2>
            <p>${esc(s.approach)}</p>
          </div>
        </div>

        <div class="sx-sol-detail" style="margin-bottom:28px">
          <div class="sx-sol-detail__panel">
            <h2>典型业务场景</h2>
            <ul>${s.scenarios.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </div>
          <div class="sx-sol-detail__panel">
            <h2>客户旅程</h2>
            <ul>${(s.journey || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="sx-sol-detail" style="margin-bottom:28px">
          <div class="sx-sol-detail__panel">
            <h2>调用的场景智能体</h2>
            <ul>
              ${s.agents
                .map((aid) => {
                  const a = getProductAgent(aid)
                  if (!a) return ''
                  return `<li><a class="sx-text-link" href="../agent-detail/?id=${a.id}">${esc(a.name)}</a></li>`
                })
                .join('')}
            </ul>
          </div>
          <div class="sx-sol-detail__panel">
            <h2>连接的硬件与系统</h2>
            <ul>${(s.hardware || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
            <p class="mt-4">支持开放接口与分层自治：上层协同、边缘与终端可本地闭环。</p>
          </div>
        </div>

        <div class="sx-sol-detail__panel">
          <h2>项目实施与下一步</h2>
          <p>从方案评估、现场勘测、设备部署、联调上线到运维优化，安托未来提供可规模复制的交付路径。真实案例数据将在确认后补充展示。</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <button type="button" class="site-header__btn site-header__btn--primary" data-demo-modal-open>预约方案演示</button>
            <a class="site-header__btn site-header__btn--ghost" href="./">返回方案列表</a>
          </div>
        </div>
      </div>
    </section>`
}

function applySolution(root, id) {
  const s = getSolution(id) || SOLUTIONS[0]
  const scene = root.querySelector('[data-sol-scene]')
  if (scene) {
    scene.style.setProperty('--sol-scene-image', `url('${s.image}')`)
    const name = scene.querySelector('[data-sol-scene-name]')
    const value = scene.querySelector('[data-sol-scene-value]')
    if (name) name.textContent = s.name
    if (value) value.textContent = s.value
  }

  root.querySelectorAll('[data-sol-detail-link]').forEach((link) => {
    link.setAttribute('href', `./?id=${s.id}`)
  })

  root.querySelectorAll('[data-sol-tab]').forEach((btn) => {
    const on = btn.dataset.solTab === s.id
    btn.classList.toggle('is-active', on)
    btn.setAttribute('aria-selected', on ? 'true' : 'false')
  })

  const valuesName = root.querySelector('[data-sol-values-name]')
  if (valuesName) valuesName.textContent = s.name

  const valuesList = root.querySelector('[data-sol-values-list]')
  if (valuesList) {
    valuesList.innerHTML = s.coreValues
      .map(
        (item) => `
      <article class="sol-values__item">
        <span class="material-symbols-outlined" aria-hidden="true">${esc(item.icon)}</span>
        <div>
          <h4>${esc(item.title)}</h4>
          <p>${esc(item.desc)}</p>
        </div>
      </article>`
      )
      .join('')
  }

  const agents = root.querySelector('[data-sol-agents]')
  if (agents) {
    agents.innerHTML = (s.highlightAgents || [])
      .slice(0, 3)
      .map((aid) => `<span>${esc(agentLabel(aid))}</span>`)
      .join('')
  }
}

function initHomeInteractions(root) {
  let activeId = SOLUTIONS[0].id
  root.querySelectorAll('[data-sol-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.solTab
      if (!id || id === activeId) return
      activeId = id
      applySolution(root, id)
    })
  })
}

export function initSolutionsPage() {
  const root = document.getElementById('solutions-root')
  if (!root) return
  const raw = new URLSearchParams(window.location.search).get('id')
  const id = resolveSolutionId(raw)
  root.innerHTML = id ? renderDetail(id) : renderList()
  if (!id) initHomeInteractions(root)
}
