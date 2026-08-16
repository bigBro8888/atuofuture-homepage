import { getPublishedPage } from '../services/site-settings-api.js'
import { ASPACE_SOLUTION_HREF } from '../data/hardware-catalog.js'
import {
  findHardwareProduct,
  hardwareConsumer,
  hardwareCta,
  hardwareFlow,
  hardwareHero,
  hardwareLines,
  hardwareProducts,
  hardwareRetail,
  hardwareSpace,
  setHardwareRuntime,
} from '../lib/cms-pages.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function productHref(product) {
  return `/hardware/product/?id=${encodeURIComponent(product.slug || product.id)}`
}

function overviewItems(lineId) {
  return hardwareProducts().filter((item) => item.productLine === lineId && item.showInOverview !== false)
}

function renderHero() {
  const hero = hardwareHero() || {}
  const title = hero.title || '连接空间、商品与真实业务'
  const subtitle = hero.subtitle || '安托未来以空间智能、电子纸与边缘连接能力，构建覆盖企业空间、新零售与智能终端的硬件产品体系。'
  const banner = hero.bannerUrl || '/images/hardware/hero-bg-3840.png'
  const cta = hero.ctaLabel || '获取咨询建议'
  const browse = hero.browseLabel || '浏览全部产品'
  return `
    <section class="hwc-hero">
      <div class="hwc-hero__bg" aria-hidden="true">
        <img src="${esc(banner)}" alt="" width="3840" height="1054" decoding="async" fetchpriority="high" />
      </div>
      <div class="hwc-shell hwc-hero__content">
        <div class="hwc-hero__copy">
          <h1>${esc(title)}</h1>
          <p>${esc(subtitle)}</p>
          <div class="hwc-hero__actions">
            <a class="hwc-btn hwc-btn--cyan hwc-btn--hero" href="#hwc-space">${esc(browse)}</a>
            <button type="button" class="hwc-btn hwc-btn--outline-dark" data-demo-modal-open>${esc(cta)}</button>
          </div>
        </div>
      </div>
    </section>`
}

function renderLineOverview() {
  return `
    <section class="hwc-lines" id="hwc-lines">
      <div class="hwc-shell hwc-lines__shell">
        <div class="hwc-lines__grid">
          ${hardwareLines().map((line) => {
            const items = overviewItems(line.id)
            return `
            <article class="hwc-lines__card hwc-lines__card--${esc(line.id)}">
              <a class="hwc-lines__head" href="#hwc-${esc(line.id)}">
                <span class="material-symbols-outlined hwc-lines__icon" aria-hidden="true">${esc(line.icon || 'memory')}</span>
                <strong>${esc(line.name)}</strong>
              </a>
              <div class="hwc-lines__items">
                ${items
                  .map(
                    (item) => `
                  <a class="hwc-lines__item" href="${productHref(item)}">
                    <span class="hwc-lines__thumb">
                      <img src="${esc(item.thumb || item.coverImage)}" alt="" width="72" height="72" loading="lazy" />
                    </span>
                    <span class="hwc-lines__label">${esc(item.overviewLabel || item.name)}</span>
                  </a>`
                  )
                  .join('')}
              </div>
            </article>`
          }).join('')}
        </div>
      </div>
    </section>`
}

function renderSpaceSection() {
  const copy = hardwareSpace() || {}
  const flagship = findHardwareProduct(copy.flagshipId || 'control-screen')
  const matrix = hardwareProducts().filter(
    (item) => item.productLine === 'space' && item.id !== flagship?.id && item.showInOverview !== false
  )

  return `
    <section class="hwx-space" id="hwc-space">
      <div class="hwc-shell">
        <header class="hwx-head">
          <p class="hwx-kicker">${esc(copy.kicker || '空间智能')}</p>
          <h2>${esc(copy.title || '空间智能硬件')}</h2>
          <p>${esc(copy.subtitle || '')}</p>
        </header>

        ${
          flagship
            ? `
        <article class="hwx-flagship">
          <div class="hwx-flagship__media">
            <img src="${esc(flagship.coverImage)}" alt="${esc(flagship.name)}" width="1200" height="900" loading="lazy" />
          </div>
          <div class="hwx-flagship__copy">
            <p class="hwx-flagship__tag">${esc(copy.flagshipTag || '旗舰产品')}</p>
            <h3>${esc(flagship.name)}</h3>
            <p class="hwx-flagship__lead">${esc(flagship.shortDescription)}</p>
            <p>${esc(flagship.fullDescription || '')}</p>
            <ul class="hwx-flagship__points">
              ${(flagship.capabilities || []).map((c) => `<li>${esc(c)}</li>`).join('')}
            </ul>
            <div class="hwx-flagship__actions">
              <a class="hwc-btn hwc-btn--orange" href="${productHref(flagship)}">查看产品详情</a>
              <a class="hwc-text-link" href="${ASPACE_SOLUTION_HREF}">了解 ASpace 总体方案</a>
            </div>
          </div>
        </article>`
            : ''
        }

        <div class="hwx-matrix">
          <div class="hwx-matrix__head">
            <h3>${esc(copy.matrixTitle || '空间智能配套硬件')}</h3>
            <p>${esc(copy.matrixSubtitle || '')}</p>
          </div>
          <div class="hwx-matrix__grid">
            ${matrix
              .map(
                (p) => `
              <a class="hwx-matrix__card" href="${productHref(p)}">
                <span class="hwx-matrix__media">
                  <img src="${esc(p.coverImage)}" alt="${esc(p.overviewLabel || p.name)}" width="640" height="480" loading="lazy" />
                </span>
                <span class="hwx-matrix__body">
                  <strong>${esc(p.overviewLabel || p.name)}</strong>
                  <small>${esc(p.shortDescription)}</small>
                  <span class="hwx-matrix__link">查看详情</span>
                </span>
              </a>`
              )
              .join('')}
          </div>
        </div>

        <section class="hwx-arch" aria-labelledby="hwx-arch-title">
          <div class="hwx-arch__head">
            <div>
              <h3 id="hwx-arch-title">${esc(copy.flowTitle || '空间智能硬件如何协同')}</h3>
              <p>${esc(copy.flowSubtitle || '')}</p>
            </div>
            <a class="hwc-text-link" href="${ASPACE_SOLUTION_HREF}">${esc(copy.flowLinkLabel || '了解 ASpace 总体解决方案 →')}</a>
          </div>
          <ol class="hwx-arch__flow">
            ${hardwareFlow()
              .map(
                (step, index) => `
              <li class="hwx-arch__step">
                <span class="hwx-arch__index">${String(index + 1).padStart(2, '0')}</span>
                <span class="material-symbols-outlined hwx-arch__icon" aria-hidden="true">${esc(step.icon)}</span>
                <strong>${esc(step.title)}</strong>
                <small>${esc(step.desc)}</small>
              </li>`
              )
              .join('')}
          </ol>
        </section>
      </div>
    </section>`
}

function renderRetailSection() {
  const copy = hardwareRetail() || {}
  const cards = hardwareProducts().filter((item) => item.productLine === 'retail')
  return `
    <section class="hwx-retail" id="hwc-retail">
      <div class="hwc-shell">
        <header class="hwx-head hwx-head--light">
          <p class="hwx-kicker">${esc(copy.kicker || '新零售与行业电子纸')}</p>
          <h2>${esc(copy.title || '以电子纸连接商品、资产与行业数据')}</h2>
          <p>${esc(copy.subtitle || '')}</p>
        </header>
        <div class="hwx-retail__grid">
          ${cards
            .map(
              (p) => `
            <article class="hwx-retail__card">
              <div class="hwx-retail__media">
                <img src="${esc(p.coverImage)}" alt="${esc(p.name)}" width="1200" height="900" loading="lazy" />
              </div>
              <div class="hwx-retail__body">
                <h3>${esc(p.name)}</h3>
                <p class="hwx-retail__use">${esc(p.useBlurb || p.shortDescription)}</p>
                <div class="hwx-retail__meta">
                  <div>
                    <span>核心特性</span>
                    <p>${esc((p.capabilities || []).join(' · '))}</p>
                  </div>
                  <div>
                    <span>适用场景</span>
                    <p>${esc((p.scenarios || []).join(' · '))}</p>
                  </div>
                </div>
                <a class="hwc-text-link" href="${productHref(p)}">查看产品详情 →</a>
              </div>
            </article>`
            )
            .join('')}
        </div>
      </div>
    </section>`
}

function renderConsumerSection() {
  const copy = hardwareConsumer() || {}
  const cards = hardwareProducts().filter((item) => item.productLine === 'consumer')
  return `
    <section class="hwx-consumer" id="hwc-consumer">
      <div class="hwc-shell">
        <header class="hwx-head">
          <p class="hwx-kicker">${esc(copy.kicker || '3C 数码')}</p>
          <h2>${esc(copy.title || '电子纸进入个人设备与数字生活')}</h2>
          <p>${esc(copy.subtitle || '')}</p>
        </header>
        <div class="hwx-consumer__grid">
          ${cards
            .map(
              (p) => `
            <a class="hwx-scene" href="${productHref(p)}">
              <img src="${esc(p.sceneImage || p.coverImage)}" alt="${esc(p.name)}" width="1536" height="1024" loading="lazy" />
              <span class="hwx-scene__shade" aria-hidden="true"></span>
              <span class="hwx-scene__copy">
                <strong>${esc(p.name)}</strong>
                <small>${esc(p.useBlurb || p.shortDescription)}</small>
                <em>查看详情</em>
              </span>
            </a>`
            )
            .join('')}
        </div>
      </div>
    </section>`
}

function renderCta() {
  const cta = hardwareCta() || {}
  return `
    <section class="hwc-cta">
      <div class="hwc-shell hwc-cta__inner">
        <div>
          <h2>${esc(cta.title || '获取适合项目的硬件选型建议')}</h2>
          <p>${esc(cta.body || '')}</p>
        </div>
        <div class="hwc-cta__actions">
          <button type="button" class="hwc-btn hwc-btn--cyan" data-demo-modal-open>${esc(cta.primary || '获取选型建议')}</button>
          <button type="button" class="hwc-text-link hwc-cta__link" data-demo-modal-open>${esc(cta.secondary || '预约方案演示')}</button>
        </div>
      </div>
    </section>`
}

export async function initHardwareStore() {
  const root = document.getElementById('hardware-root')
  if (!root) return
  const cms = await getPublishedPage('/api/public/pages/hardware')
  if (cms) setHardwareRuntime(cms)

  root.innerHTML = `
    <div class="hwc-first">
      ${renderHero()}
      ${renderLineOverview()}
    </div>
    ${renderSpaceSection()}
    ${renderRetailSection()}
    ${renderConsumerSection()}
    ${renderCta()}
  `

  const hash = window.location.hash.replace(/^#/, '')
  const legacyMap = {
    'hwc-browser': 'hwc-space',
    terminal: 'hwc-space',
    sensor: 'hwc-space',
    gateway: 'hwc-space',
    av: 'hwc-space',
  }
  const targetId = legacyMap[hash] || (hash.startsWith('hwc-') ? hash : '')
  if (targetId) {
    window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }
}
