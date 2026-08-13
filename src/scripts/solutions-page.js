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

function renderDetailFaqs(s) {
  const faqs = [
    {
      q: `${s.name}方案主要解决什么问题？`,
      a: `${s.value}${(s.pains || []).length ? ` 常见痛点包括：${s.pains.join('、')}。` : ''}`,
    },
    {
      q: '安托未来如何构建该行业方案？',
      a: s.approach,
    },
    {
      q: '落地需要哪些智能体与硬件？',
      a: `可按场景组合 ${(s.agents || [])
        .map((id) => getProductAgent(id)?.name)
        .filter(Boolean)
        .join('、')}；并连接 ${(s.hardware || []).join('、')} 等设备与系统。`,
    },
  ]
  return faqs
    .map(
      (item, i) => `
    <details class="sol-d-faq__item"${i === 0 ? ' open' : ''}>
      <summary>${esc(item.q)}</summary>
      <p>${esc(item.a)}</p>
    </details>`
    )
    .join('')
}

function renderDetail(id) {
  const s = getSolution(id)
  if (!s) return renderList()
  document.title = `${s.name} | 安托未来`
  const related = SOLUTIONS.filter((item) => item.id !== s.id).slice(0, 3)

  return `
    <article class="sol-d">
      <section class="sol-d-hero" style="--sol-d-hero-image:url('${esc(s.image)}')">
        <div class="sol-d-hero__media" aria-hidden="true"></div>
        <div class="sol-d-hero__shade" aria-hidden="true"></div>
        <div class="sol-home-shell sol-d-hero__inner">
          <nav class="sol-d-crumb" aria-label="面包屑">
            <a href="../">首页</a><span>/</span>
            <a href="./">行业解决方案</a><span>/</span>
            <span>${esc(s.name)}</span>
          </nav>
          <p class="sol-d-kicker">加速空间智能落地</p>
          <h1>${esc(s.name)}</h1>
          <p class="sol-d-hero__desc">${esc(s.summary)}</p>
          <div class="sol-d-hero__actions">
            <button type="button" class="sol-btn sol-btn--primary" data-demo-modal-open>预约方案演示</button>
            <a class="sol-btn sol-btn--ghost" href="#sol-d-scenarios">查看业务场景</a>
          </div>
        </div>
      </section>

      <section class="sol-d-intro">
        <div class="sol-home-shell sol-d-intro__grid">
          <div>
            <p class="sol-d-section-kicker">行业价值</p>
            <h2>加快${esc(s.name)}智能化落地</h2>
          </div>
          <div>
            <p>${esc(s.value)}</p>
            <p>${esc(s.approach)}</p>
          </div>
        </div>
      </section>

      <section class="sol-d-metrics">
        <div class="sol-home-shell sol-d-metrics__grid">
          ${s.coreValues
            .map(
              (item) => `
            <article class="sol-d-metrics__item">
              <span class="material-symbols-outlined" aria-hidden="true">${esc(item.icon)}</span>
              <strong>${esc(item.title)}</strong>
              <p>${esc(item.desc)}</p>
            </article>`
            )
            .join('')}
        </div>
      </section>

      <section class="sol-d-challenge">
        <div class="sol-home-shell sol-d-challenge__grid">
          <div>
            <p class="sol-d-section-kicker">重新思考行业运营</p>
            <h2>从分散系统，走向可感知、可协同、可执行的空间运营</h2>
            <p>面对空间复杂度上升与运营效率压力，${esc(s.name)}需要统一数据、策略与执行链路，而不是继续堆叠独立子系统。</p>
          </div>
          <ul class="sol-d-challenge__list">
            ${(s.pains || []).map((item) => `<li><span class="material-symbols-outlined" aria-hidden="true">warning</span><span>${esc(item)}</span></li>`).join('')}
          </ul>
        </div>
      </section>

      <section class="sol-d-scenarios" id="sol-d-scenarios">
        <div class="sol-home-shell">
          <header class="sol-d-section-head">
            <p class="sol-d-section-kicker">业务场景</p>
            <h2>覆盖${esc(s.name)}关键运营环节</h2>
            <p>把行业问题拆成可落地的场景能力，再由智能体、硬件与开放接口组合交付。</p>
          </header>
          <div class="sol-d-scenario-grid">
            ${s.scenarios
              .map(
                (item, i) => `
              <article class="sol-d-scenario-card">
                <span>${String(i + 1).padStart(2, '0')}</span>
                <h3>${esc(item)}</h3>
              </article>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="sol-d-journey">
        <div class="sol-home-shell">
          <header class="sol-d-section-head sol-d-section-head--light">
            <p class="sol-d-section-kicker">客户旅程</p>
            <h2>从到访到运营复盘的闭环路径</h2>
          </header>
          <ol class="sol-d-journey__list">
            ${(s.journey || [])
              .map(
                (step, i) => `
              <li>
                <em>${String(i + 1).padStart(2, '0')}</em>
                <strong>${esc(step)}</strong>
              </li>`
              )
              .join('')}
          </ol>
        </div>
      </section>

      <section class="sol-d-stack">
        <div class="sol-home-shell">
          <header class="sol-d-section-head">
            <p class="sol-d-section-kicker">能力组合</p>
            <h2>场景智能体与智能硬件协同</h2>
            <p>统一空间智能中枢之上，按行业组合智能体能力，并连接传感、网关、中控与既有系统。</p>
          </header>
          <div class="sol-d-stack__grid">
            <div>
              <h3>调用的场景智能体</h3>
              <div class="sol-d-agent-grid">
                ${s.agents
                  .map((aid) => {
                    const a = getProductAgent(aid)
                    if (!a) return ''
                    return `
                    <a class="sol-d-agent-card" href="../agent-detail/?id=${esc(a.id)}">
                      <span class="material-symbols-outlined" aria-hidden="true">${esc(a.icon)}</span>
                      <div>
                        <strong>${esc(a.name)}</strong>
                        <p>${esc(a.summary)}</p>
                      </div>
                      <span class="material-symbols-outlined sol-d-agent-card__arrow" aria-hidden="true">arrow_forward</span>
                    </a>`
                  })
                  .join('')}
              </div>
            </div>
            <div>
              <h3>连接的硬件与系统</h3>
              <ul class="sol-d-hw-list">
                ${(s.hardware || []).map((item) => `<li>${esc(item)}</li>`).join('')}
              </ul>
              <p class="sol-d-hw-note">支持开放接口与分层自治：上层协同，边缘与终端可本地闭环。</p>
            </div>
          </div>
        </div>
      </section>

      <section class="sol-d-related">
        <div class="sol-home-shell">
          <header class="sol-d-section-head">
            <p class="sol-d-section-kicker">更多行业</p>
            <h2>探索其他空间智能方案</h2>
          </header>
          <div class="sol-d-related__grid">
            ${related
              .map(
                (item) => `
              <a class="sol-d-related__card" href="./?id=${esc(item.id)}">
                <div class="sol-d-related__media" style="background-image:url('${esc(item.image)}')" aria-hidden="true"></div>
                <div class="sol-d-related__body">
                  <h3>${esc(item.name)}</h3>
                  <p>${esc(item.value)}</p>
                  <span>查看方案 →</span>
                </div>
              </a>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="sol-d-faq">
        <div class="sol-home-shell sol-d-faq__inner">
          <header class="sol-d-section-head">
            <p class="sol-d-section-kicker">常见问题</p>
            <h2>关于${esc(s.name)}方案</h2>
          </header>
          <div class="sol-d-faq__list">${renderDetailFaqs(s)}</div>
        </div>
      </section>

      <section class="sol-d-cta">
        <div class="sol-home-shell sol-d-cta__inner">
          <div>
            <h2>准备好落地${esc(s.name)}了吗？</h2>
            <p>告诉我们空间规模与核心问题，安托未来将为您组合合适的智能体、硬件与系统能力。</p>
          </div>
          <div class="sol-d-cta__actions">
            <button type="button" class="sol-btn sol-btn--primary" data-demo-modal-open>预约方案演示</button>
            <a class="sol-btn sol-btn--ghost" href="./">返回行业方案</a>
          </div>
        </div>
      </section>
    </article>`
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
