import { getPublishedPage } from '../services/site-settings-api.js'
import { resolveSolutionId } from '../data/solutions.js'
import { getProductAgent } from '../data/product-agents.js'
import {
  findSolution,
  setSolutionsRuntime,
  solutionsBase,
  solutionsCta,
  solutionsHero,
  solutionsList,
  solutionsSceneTitle,
} from '../lib/cms-pages.js'

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
  const h = solutionsHero()
  const title = h.title
  const desc = h.subtitle || h.desc
  const image = h.bannerUrl || h.image
  const cta = h.ctaLabel || '预约方案演示'
  return `
    <section class="sol-home-hero" style="--sol-hero-image:url('${esc(image)}')">
      <div class="sol-home-hero__media" aria-hidden="true"></div>
      <div class="sol-home-hero__shade" aria-hidden="true"></div>
      <div class="sol-home-shell sol-home-hero__inner">
        <div class="sol-home-hero__copy">
          <h1>${esc(title)}</h1>
          <p>${esc(desc)}</p>
          <div class="sol-home-hero__actions">
            <button type="button" class="sol-btn sol-btn--primary" data-demo-modal-open>${esc(cta)}</button>
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
      ${solutionsList().map((s) => {
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
  const base = solutionsBase()
  return `
    <section class="sol-base" id="sol-base">
      <div class="sol-home-shell">
        <header class="sol-base__head">
          <h2>${esc(base.title)}</h2>
          <p>${esc(base.subtitle)}</p>
        </header>
        <div class="sol-base__flow" data-sol-base-flow>
          ${(base.nodes || []).map(
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
              ${index < (base.nodes || []).length - 1 ? '<div class="sol-base__arrow" aria-hidden="true"><span></span></div>' : ''}
            </div>`
          ).join('')}
        </div>
      </div>
    </section>`
}

function renderCta() {
  const cta = solutionsCta()
  return `
    <section class="sol-cta">
      <div class="sol-home-shell sol-cta__inner">
        <div class="sol-cta__copy">
          <h2>${esc(cta.title)}</h2>
          <p>${esc(cta.body)}</p>
          <div class="sol-cta__actions">
            <button type="button" class="sol-btn sol-btn--primary" data-demo-modal-open>${esc(cta.primary)}</button>
            <a class="sol-btn sol-btn--ghost" href="${esc(cta.secondaryHref)}">${esc(cta.secondaryLabel)}</a>
          </div>
        </div>
        <div class="sol-cta__visual" aria-hidden="true" style="--sol-cta-image:url('${esc(cta.imageUrl)}')"></div>
      </div>
    </section>`
}

function renderList() {
  document.title = '行业解决方案 | 安托未来'
  const active = solutionsList()[0]
  return `
    ${renderHero()}
    <section class="sol-scene" id="sol-scene">
      <div class="sol-home-shell">
        <header class="sol-scene__head">
          <h2>${esc(solutionsSceneTitle())}</h2>
        </header>
        <div class="sol-scene__layout">
          ${renderNav(active.id)}
          ${renderScene(active)}
        </div>
      </div>
    </section>
    ${renderValues(active)}
    ${renderBase(active)}
    ${renderCta()}
  `
}

function buildDetailStats(s) {
  return [
    {
      figure: String(s.scenarios?.length || 6),
      suffix: '+',
      label: '关键业务场景',
      desc: `覆盖${(s.scenarios || []).slice(0, 2).join('、')}等运营环节。`,
    },
    {
      figure: String(s.agents?.length || 4),
      suffix: '',
      label: '场景智能体可组合',
      desc: '按行业灵活编排空间、访客、会议、能源等能力。',
    },
    {
      figure: String(s.journey?.length || 5),
      suffix: '步',
      label: '运营闭环路径',
      desc: '从业务发生到执行反馈形成可复制交付链路。',
    },
  ]
}

function buildDetailTabs(s) {
  return (s.coreValues || []).map((item, index) => ({
    id: `${s.id}-tab-${index}`,
    label: item.title.includes('，') ? item.title.split('，')[0] : item.title.slice(0, 6),
    title: item.title,
    body: `${item.desc} 安托未来以空间智能中枢连接场景智能体与硬件，支撑「${(s.capabilities || [])[index] || s.capabilities?.[0] || '行业场景'}」持续落地。`,
    icon: item.icon,
  }))
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
    {
      q: '如何开始评估与交付？',
      a: '从方案评估、现场勘测、设备部署、联调上线到运维优化，安托未来提供可规模复制的交付路径。可通过预约方案演示启动对接。',
    },
  ]
  return faqs
    .map(
      (item) => `
    <details class="sol-d-faq__item">
      <summary><span>${esc(item.q)}</span><i aria-hidden="true"></i></summary>
      <div class="sol-d-faq__body"><p>${esc(item.a)}</p></div>
    </details>`
    )
    .join('')
}

function renderDetail(id) {
  const s = findSolution(id)
  if (!s) return renderList()
  document.title = `${s.name} | 安托未来`
  const related = solutionsList().filter((item) => item.id !== s.id)
  const stats = buildDetailStats(s)
  const tabs = buildDetailTabs(s)
  const highlightAgents = (s.highlightAgents || s.agents || []).slice(0, 4)

  return `
    <article class="sol-d">
      <section class="sol-d-hero" style="--sol-d-hero-image:url('${esc(s.image)}')">
        <div class="sol-d-hero__media" aria-hidden="true"></div>
        <div class="sol-home-shell sol-d-hero__inner">
          <div class="sol-d-hero__copy">
            <p class="sol-d-eyebrow">行业解决方案</p>
            <h1>${esc(s.name)}</h1>
            <p class="sol-d-hero__lead">${esc(s.value)}</p>
            <p class="sol-d-hero__desc">${esc(s.summary)}</p>
            <div class="sol-d-hero__actions">
              <button type="button" class="sol-btn sol-btn--primary" data-demo-modal-open>预约方案演示</button>
              <a class="sol-btn sol-btn--ghost" href="#sol-d-capabilities">了解能力组合</a>
            </div>
          </div>
        </div>
      </section>

      <div class="sol-d-subnav">
        <div class="sol-home-shell sol-d-subnav__inner">
          <nav class="sol-d-crumb" aria-label="面包屑">
            <a href="../">首页</a><span>/</span>
            <a href="./">行业解决方案</a><span>/</span>
            <span>${esc(s.name)}</span>
          </nav>
          <button type="button" class="sol-btn sol-btn--primary sol-btn--compact" data-demo-modal-open>预约演示</button>
        </div>
      </div>

      <section class="sol-d-trust">
        <div class="sol-home-shell sol-d-trust__inner">
          <div class="sol-d-trust__copy">
            <span class="material-symbols-outlined" aria-hidden="true">verified</span>
            <p>以空间智能中枢组合场景智能体、智能硬件与开放接口，为${esc(s.name)}构建可感知、可协同、可执行的运营方案。</p>
          </div>
          <button type="button" class="sol-btn sol-btn--primary sol-btn--compact" data-demo-modal-open>联系我们</button>
        </div>
      </section>

      <section class="sol-d-overview">
        <div class="sol-home-shell sol-d-overview__grid">
          <div class="sol-d-overview__copy">
            <h2>加快${esc(s.name)}智能化落地</h2>
            <p>${esc(s.approach)}</p>
            <ul>
              ${(s.pains || []).slice(0, 4).map((item) => `<li>${esc(item)}</li>`).join('')}
            </ul>
          </div>
          <aside class="sol-d-overview__panel" aria-label="能力概览">
            <div class="sol-d-overview__panel-bg" style="background-image:url('${esc(s.image)}')" aria-hidden="true"></div>
            <div class="sol-d-overview__panel-content">
              <p>核心能力组合</p>
              <div class="sol-d-overview__chips">
                ${highlightAgents
                  .map((aid) => {
                    const a = getProductAgent(aid)
                    if (!a) return ''
                    return `<span><i class="material-symbols-outlined" aria-hidden="true">${esc(a.icon)}</i>${esc(agentLabel(aid))}</span>`
                  })
                  .join('')}
              </div>
              <div class="sol-d-overview__hw">
                ${(s.hardware || [])
                  .slice(0, 4)
                  .map((item) => `<em>${esc(item)}</em>`)
                  .join('')}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section class="sol-d-stats">
        <div class="sol-home-shell sol-d-stats__grid">
          ${stats
            .map(
              (item) => `
            <article>
              <strong><b>${esc(item.figure)}</b>${esc(item.suffix || '')}</strong>
              <h3>${esc(item.label)}</h3>
              <p>${esc(item.desc)}</p>
            </article>`
            )
            .join('')}
        </div>
      </section>

      <section class="sol-d-tabs" id="sol-d-capabilities">
        <div class="sol-home-shell">
          <header class="sol-d-tabs__head">
            <p class="sol-d-eyebrow sol-d-eyebrow--light">CAPABILITY</p>
            <h2>交付下一代空间运营能力</h2>
          </header>
          <div class="sol-d-tabs__nav" role="tablist" aria-label="核心能力">
            ${tabs
              .map(
                (tab, i) => `
              <button type="button" class="sol-d-tabs__btn${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" data-sol-d-tab="${esc(tab.id)}">${esc(tab.label)}</button>`
              )
              .join('')}
          </div>
          <div class="sol-d-tabs__panels">
            ${tabs
              .map(
                (tab, i) => `
              <div class="sol-d-tabs__panel${i === 0 ? ' is-active' : ''}" data-sol-d-panel="${esc(tab.id)}" ${i === 0 ? '' : 'hidden'}>
                <div class="sol-d-tabs__panel-icon"><span class="material-symbols-outlined" aria-hidden="true">${esc(tab.icon)}</span></div>
                <div>
                  <h3>${esc(tab.title)}</h3>
                  <p>${esc(tab.body)}</p>
                  <a href="#sol-d-stack">查看智能体与硬件组合 →</a>
                </div>
              </div>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="sol-d-apps">
        <div class="sol-home-shell">
          <header class="sol-d-section-head sol-d-section-head--center">
            <p class="sol-d-eyebrow">APPLICATIONS</p>
            <h2>覆盖${esc(s.name)}关键运营场景</h2>
            <p>把行业问题拆成可落地场景，再由智能体、硬件与开放接口组合交付。</p>
          </header>
          <div class="sol-d-apps__grid">
            ${s.scenarios
              .map(
                (item, i) => `
              <article class="sol-d-apps__card">
                <div class="sol-d-apps__media" style="background-image:url('${esc(s.image)}');background-position:${12 + (i % 3) * 35}% ${(i * 17) % 80}%"></div>
                <div class="sol-d-apps__body">
                  <span>${String(i + 1).padStart(2, '0')}</span>
                  <h3>${esc(item)}</h3>
                </div>
              </article>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="sol-d-journey">
        <div class="sol-home-shell">
          <header class="sol-d-section-head sol-d-section-head--center">
            <p class="sol-d-eyebrow">JOURNEY</p>
            <h2>端到端客户旅程</h2>
          </header>
          <ol class="sol-d-journey__track">
            ${(s.journey || [])
              .map(
                (step, i) => `
              <li>
                <span>${String(i + 1).padStart(2, '0')}</span>
                <strong>${esc(step)}</strong>
              </li>`
              )
              .join('')}
          </ol>
        </div>
      </section>

      <section class="sol-d-stack" id="sol-d-stack">
        <div class="sol-home-shell">
          <header class="sol-d-section-head sol-d-section-head--center">
            <p class="sol-d-eyebrow">SOLUTION STACK</p>
            <h2>智能体与硬件组合清单</h2>
          </header>
          <div class="sol-d-index">
            ${s.agents
              .map((aid) => {
                const a = getProductAgent(aid)
                if (!a) return ''
                return `
                <a class="sol-d-index__item" href="../agent-detail/?id=${esc(a.id)}">
                  <span class="material-symbols-outlined" aria-hidden="true">keyboard_double_arrow_right</span>
                  <div>
                    <strong>${esc(a.name)}</strong>
                    <p>${esc(a.summary)}</p>
                  </div>
                </a>`
              })
              .join('')}
            ${(s.hardware || [])
              .map(
                (item) => `
              <div class="sol-d-index__item sol-d-index__item--static">
                <span class="material-symbols-outlined" aria-hidden="true">keyboard_double_arrow_right</span>
                <div>
                  <strong>${esc(item)}</strong>
                  <p>可接入空间智能中枢的硬件与系统能力</p>
                </div>
              </div>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="sol-d-related">
        <div class="sol-home-shell">
          <header class="sol-d-section-head sol-d-section-head--center">
            <p class="sol-d-eyebrow">MORE INDUSTRIES</p>
            <h2>探索其他行业方案</h2>
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
                </div>
              </a>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="sol-d-faq">
        <div class="sol-home-shell sol-d-faq__wrap">
          <header class="sol-d-section-head sol-d-section-head--center">
            <p class="sol-d-eyebrow">FAQ</p>
            <h2>常见问题</h2>
          </header>
          <div class="sol-d-faq__list">${renderDetailFaqs(s)}</div>
        </div>
      </section>

      <section class="sol-d-contact">
        <div class="sol-home-shell">
          <div class="sol-d-contact__grid">
            <article>
              <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
              <h3>预约方案演示</h3>
              <p>了解${esc(s.name)}如何组合智能体与硬件落地。</p>
              <button type="button" data-demo-modal-open>立即预约</button>
            </article>
            <article>
              <span class="material-symbols-outlined" aria-hidden="true">support_agent</span>
              <h3>联系方案顾问</h3>
              <p>告诉我们行业、空间规模与核心问题。</p>
              <a href="../about/#contact">前往联系</a>
            </article>
            <article>
              <span class="material-symbols-outlined" aria-hidden="true">hub</span>
              <h3>查看空间智能体</h3>
              <p>进一步了解可组合的场景智能体能力。</p>
              <a href="../agents/">进入矩阵</a>
            </article>
          </div>
          <div class="sol-d-cta-band">
            <div>
              <h2>准备好落地${esc(s.name)}了吗？</h2>
              <p>安托未来将为您组合合适的智能体、硬件与系统能力。</p>
            </div>
            <button type="button" class="sol-btn sol-btn--primary" data-demo-modal-open>预约方案演示</button>
          </div>
        </div>
      </section>
    </article>`
}

function initDetailTabs(root) {
  const buttons = [...root.querySelectorAll('[data-sol-d-tab]')]
  const panels = [...root.querySelectorAll('[data-sol-d-panel]')]
  if (!buttons.length) return
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.solDTab
      buttons.forEach((b) => {
        const on = b === btn
        b.classList.toggle('is-active', on)
        b.setAttribute('aria-selected', on ? 'true' : 'false')
      })
      panels.forEach((panel) => {
        const on = panel.dataset.solDPanel === id
        panel.classList.toggle('is-active', on)
        panel.toggleAttribute('hidden', !on)
      })
    })
  })
}

function applySolution(root, id) {
  const s = findSolution(id)
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
  let activeId = solutionsList()[0].id
  root.querySelectorAll('[data-sol-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.solTab
      if (!id || id === activeId) return
      activeId = id
      applySolution(root, id)
    })
  })
}

export async function initSolutionsPage() {
  const root = document.getElementById('solutions-root')
  if (!root) return
  const cms = await getPublishedPage('/api/public/pages/solutions')
  if (cms) setSolutionsRuntime(cms)
  const raw = new URLSearchParams(window.location.search).get('id')
  const id = resolveSolutionId(raw) || (raw && solutionsList().some((item) => item.id === raw) ? raw : null)
  root.innerHTML = id ? renderDetail(id) : renderList()
  if (!id) initHomeInteractions(root)
  else initDetailTabs(root)
}
