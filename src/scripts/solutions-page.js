import { applyProductAgentsCms, getProductAgent } from '../data/product-agents.js'
import { applyAgentsLibraryCms } from '../data/agents-detail.js'
import { loadAgentsLibraryContent, loadSimplePageContent, loadSolutionsLibraryContent } from '../services/site-settings-api.js'
import {
  SOLUTIONS,
  SOLUTIONS_HERO,
  resolveSolutionId,
  getSolution,
  getPublishedSolutions,
  applySolutionsLibraryCms,
} from '../data/solutions.js'
import { renderSolutionsChannel } from '../lib/solutions-channel-render.js'

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

function renderList() {
  document.title = '行业解决方案 | 安托未来'
  const published = getPublishedSolutions()
  return renderSolutionsChannel(
    {
      hero: {
        title: cmsHero?.title || SOLUTIONS_HERO.title,
        subtitle: cmsHero?.subtitle || SOLUTIONS_HERO.desc,
        bannerUrl: cmsHero?.bannerUrl || SOLUTIONS_HERO.image,
        ctaLabel: cmsHero?.ctaLabel || '预约方案演示',
      },
      solutions: published.length ? published : SOLUTIONS,
      resolveItemIndex: () => -1,
      agentLabel,
    },
    { editable: false }
  )
}

function solutionSlides(s) {
  const slides = (s.slides || [])
    .map((item) => (typeof item === 'string' ? item : item?.imageUrl || ''))
    .map((url) => String(url || '').trim())
    .filter(Boolean)
  if (slides.length) return slides
  return s.image ? [s.image] : []
}

function renderDeck(s) {
  const slides = solutionSlides(s)
  if (!slides.length) return ''
  return `
    <section class="sol-d-deck" id="sol-d-deck">
      <div class="sol-home-shell">
        <div class="sol-d-deck__stage" data-sol-deck>
          <div class="sol-d-deck__viewport">
            <div class="sol-d-deck__track" data-sol-deck-track>
              ${slides
                .map(
                  (url, i) => `
                <figure class="sol-d-deck__slide">
                  <img src="${esc(url)}" alt="${esc(s.name)} 方案介绍 ${i + 1}" width="1920" height="1080" ${i === 0 ? '' : 'loading="lazy"'} />
                </figure>`
                )
                .join('')}
            </div>
            <button type="button" class="sol-d-deck__side sol-d-deck__side--prev" data-sol-deck-prev aria-label="上一页">
              <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
            </button>
            <button type="button" class="sol-d-deck__side sol-d-deck__side--next" data-sol-deck-next aria-label="下一页">
              <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
          </div>
          <div class="sol-d-deck__bar">
            <button type="button" class="sol-d-deck__nav" data-sol-deck-prev aria-label="上一页">
              <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
            </button>
            <p class="sol-d-deck__index"><span data-sol-deck-current>1</span> / ${slides.length}</p>
            <button type="button" class="sol-d-deck__nav" data-sol-deck-next aria-label="下一页">
              <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
            <button type="button" class="sol-d-deck__full" data-sol-deck-full>
              <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
              全屏浏览
            </button>
          </div>
        </div>
      </div>
      <div class="sol-d-deck-fs" data-sol-deck-fs hidden>
        <button type="button" class="sol-d-deck-fs__close" data-sol-deck-close aria-label="退出全屏">
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
        <button type="button" class="sol-d-deck-fs__nav sol-d-deck-fs__nav--prev" data-sol-deck-prev aria-label="上一页">
          <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
        </button>
        <figure class="sol-d-deck-fs__frame">
          <img data-sol-deck-fs-image src="${esc(slides[0])}" alt="${esc(s.name)} 方案介绍" width="1920" height="1080" />
        </figure>
        <button type="button" class="sol-d-deck-fs__nav sol-d-deck-fs__nav--next" data-sol-deck-next aria-label="下一页">
          <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        </button>
        <p class="sol-d-deck-fs__index"><span data-sol-deck-fs-current>1</span> / ${slides.length}</p>
      </div>
    </section>`
}

function sceneTitle(item) {
  return typeof item === 'string' ? item : item?.title || ''
}

function sceneImage(item, fallback = '') {
  if (typeof item === 'string') return fallback
  return item?.imageUrl || item?.image || fallback
}

function hardwareTitle(item) {
  return typeof item === 'string' ? item : item?.title || ''
}

function hardwareDesc(item) {
  if (typeof item === 'string') return '可接入空间智能中枢的硬件与系统能力'
  return item?.desc || '可接入空间智能中枢的硬件与系统能力'
}

function renderDetailFaqs(s) {
  const faqs = (s.faqs || []).filter((item) => item?.q && item?.a)
  const list = faqs.length
    ? faqs
    : [
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
            .join('、')}；并连接 ${(s.hardware || []).map(hardwareTitle).filter(Boolean).join('、')} 等设备与系统。`,
        },
        {
          q: '如何开始评估与交付？',
          a: '从方案评估、现场勘测、设备部署、联调上线到运维优化，安托未来提供可规模复制的交付路径。可通过预约方案演示启动对接。',
        },
      ]
  return list
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
  const s = getSolution(id)
  if (!s) return renderList()
  document.title = `${s.name} | 安托未来`
  const related = getPublishedSolutions().filter((item) => item.id !== s.id)

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
              <a class="sol-btn sol-btn--ghost" href="#sol-d-deck">浏览方案介绍</a>
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
        </div>
      </div>

      ${renderDeck(s)}

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
                <div class="sol-d-apps__media" style="background-image:url('${esc(sceneImage(item, s.image))}')"></div>
                <div class="sol-d-apps__body">
                  <span>${String(i + 1).padStart(2, '0')}</span>
                  <h3>${esc(sceneTitle(item))}</h3>
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
                  <strong>${esc(hardwareTitle(item))}</strong>
                  <p>${esc(hardwareDesc(item))}</p>
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

function initDetailDeck(root) {
  const stage = root.querySelector('[data-sol-deck]')
  if (!stage) return
  const track = stage.querySelector('[data-sol-deck-track]')
  const slides = [...stage.querySelectorAll('.sol-d-deck__slide')]
  const currentEl = stage.querySelector('[data-sol-deck-current]')
  const fs = root.querySelector('[data-sol-deck-fs]')
  const fsImage = fs?.querySelector('[data-sol-deck-fs-image]')
  const fsCurrent = fs?.querySelector('[data-sol-deck-fs-current]')
  const total = slides.length
  if (!total || !track) return
  let index = 0
  let fullscreen = false

  const paint = () => {
    track.style.transform = `translateX(-${index * 100}%)`
    if (currentEl) currentEl.textContent = String(index + 1)
    const src = slides[index]?.querySelector('img')?.src || ''
    if (fsImage && src) fsImage.src = src
    if (fsCurrent) fsCurrent.textContent = String(index + 1)
  }

  const go = (next) => {
    index = (next + total) % total
    paint()
  }

  const setFullscreen = (on) => {
    fullscreen = on
    if (!fs) return
    fs.hidden = !on
    document.body.style.overflow = on ? 'hidden' : ''
    if (on) fs.focus?.()
  }

  root.querySelectorAll('[data-sol-deck-prev]').forEach((btn) => {
    btn.addEventListener('click', () => go(index - 1))
  })
  root.querySelectorAll('[data-sol-deck-next]').forEach((btn) => {
    btn.addEventListener('click', () => go(index + 1))
  })
  stage.querySelector('[data-sol-deck-full]')?.addEventListener('click', () => setFullscreen(true))
  fs?.querySelector('[data-sol-deck-close]')?.addEventListener('click', () => setFullscreen(false))
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      index = i
      paint()
      setFullscreen(true)
    })
  })

  window.addEventListener('keydown', (event) => {
    const tag = String(event.target?.tagName || '').toLowerCase()
    if (['input', 'textarea', 'select'].includes(tag) || event.target?.isContentEditable) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(index - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(index + 1)
    }
    if (event.key === 'Escape' && fullscreen) setFullscreen(false)
  })

  paint()
}

function applySolution(root, id) {
  const s = getSolution(id) || getPublishedSolutions()[0] || SOLUTIONS[0]
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
  let activeId = (getPublishedSolutions()[0] || SOLUTIONS[0]).id
  root.querySelectorAll('[data-sol-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.solTab
      if (!id || id === activeId) return
      activeId = id
      applySolution(root, id)
    })
  })
}

let cmsHero = null

export async function initSolutionsPage() {
  const root = document.getElementById('solutions-root')
  if (!root) return
  cmsHero = await loadSimplePageContent('solutions')
  for (const solution of SOLUTIONS) {
    const hit = (cmsHero?.items || []).find((item) => item.id === solution.id)
    if (!hit) continue
    if (hit.title) solution.name = hit.title
    if (hit.summary) {
      solution.summary = hit.summary
      solution.value = hit.summary
    }
    if (hit.imageUrl) solution.image = hit.imageUrl
  }
  const [solutionsLibrary, agentsLibrary] = await Promise.all([loadSolutionsLibraryContent(), loadAgentsLibraryContent()])
  applySolutionsLibraryCms(solutionsLibrary)
  applyAgentsLibraryCms(agentsLibrary)
  applyProductAgentsCms(agentsLibrary)
  const raw = new URLSearchParams(window.location.search).get('id')
  const id = resolveSolutionId(raw)
  root.innerHTML = id ? renderDetail(id) : renderList()
  if (!id) initHomeInteractions(root)
  else initDetailDeck(root)
}
