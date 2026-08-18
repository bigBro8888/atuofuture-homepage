import { loadSimplePageContent } from '../services/site-settings-api.js'
import {
  HARDWARE_SPACE_FLOW,
  ASPACE_SOLUTION_HREF,
  applyHardwareSimpleCms,
  getProductBySlug,
  getProductsByLine,
  resolveHardwareMegaGroups,
} from '../data/hardware-catalog.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function productHref(product) {
  return `/hardware/product/?id=${encodeURIComponent(product.slug)}`
}

function renderHero() {
  const title = cmsHero?.title || '连接空间、商品与真实业务'
  const subtitle = cmsHero?.subtitle || '安托未来以空间智能、电子纸与边缘连接能力，构建覆盖企业空间、新零售与智能终端的硬件产品体系。'
  const banner = cmsHero?.bannerUrl || '/images/hardware/hero-bg-3840.png'
  const cta = cmsHero?.ctaLabel || '获取选型建议'
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
            <a class="hwc-btn hwc-btn--cyan hwc-btn--hero" href="#hwc-space">浏览全部产品</a>
            <button type="button" class="hwc-btn hwc-btn--outline-dark" data-demo-modal-open>${esc(cta)}</button>
          </div>
        </div>
      </div>
    </section>`
}

function renderLineOverview() {
  const groups = resolveHardwareMegaGroups()
  const anchors = { space: '#hwc-space', retail: '#hwc-retail', consumer: '#hwc-consumer' }
  return `
    <section class="hwc-lines" id="hwc-lines">
      <div class="hwc-shell hwc-lines__shell">
        <div class="hwc-lines__grid">
          ${groups
            .map((group) => `
            <article class="hwc-lines__card hwc-lines__card--${esc(group.id)}">
              <a class="hwc-lines__head" href="${esc(anchors[group.id] || `#hwc-${group.id}`)}">
                <span class="material-symbols-outlined hwc-lines__icon" aria-hidden="true">${esc(group.icon)}</span>
                <strong>${esc(group.title)}</strong>
              </a>
              <div class="hwc-lines__items">
                ${group.products
                  .map(
                    (item) => `
                  <a class="hwc-lines__item" href="${esc(item.href)}">
                    <span class="hwc-lines__thumb">
                      <img src="${esc(item.coverImage)}" alt="" width="72" height="72" loading="lazy" />
                    </span>
                    <span class="hwc-lines__label">${esc(item.name)}</span>
                  </a>`
                  )
                  .join('')}
              </div>
            </article>`
            )
            .join('')}
        </div>
      </div>
    </section>`
}

function renderSpaceSection() {
  const flagship = getProductBySlug('control-screen')
  const matrixIds = [
    { id: 'e-table-sign', label: '电子桌牌' },
    { id: 'desk-screen', label: '工位屏' },
    { id: 'smart-lighting', label: '照明与空调' },
    { id: 'sensor', label: '传感器' },
    { id: 'gateway', label: '网关' },
  ]
  const matrix = matrixIds
    .map((item) => {
      const p = getProductBySlug(item.id)
      return p ? { ...p, displayName: item.label } : null
    })
    .filter(Boolean)

  return `
    <section class="hwx-space" id="hwc-space">
      <div class="hwc-shell">
        <header class="hwx-head">
          <p class="hwx-kicker">空间智能</p>
          <h2>空间智能硬件</h2>
          <p>以中控屏为交互入口，连接感知、边缘、控制与信息终端，形成可部署的空间智能闭环。</p>
        </header>

        ${
          flagship
            ? `
        <article class="hwx-flagship">
          <div class="hwx-flagship__media">
            <img src="${esc(flagship.coverImage)}" alt="${esc(flagship.name)}" width="1200" height="900" loading="lazy" />
          </div>
          <div class="hwx-flagship__copy">
            <p class="hwx-flagship__tag">旗舰产品</p>
            <h3>${esc(flagship.name)}</h3>
            <p class="hwx-flagship__lead">${esc(flagship.shortDescription)}</p>
            <p>${esc(flagship.fullDescription || '')}</p>
            <ul class="hwx-flagship__points">
              ${(flagship.capabilities || [])
                .map((c) => `<li>${esc(c)}</li>`)
                .join('')}
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
            <h3>空间智能配套硬件</h3>
            <p>围绕交互、环境、感知与边缘接入，覆盖会议室、办公与楼宇场景。</p>
          </div>
          <div class="hwx-matrix__grid">
            ${matrix
              .map(
                (p) => `
              <a class="hwx-matrix__card" href="${productHref(p)}">
                <span class="hwx-matrix__media">
                  <img src="${esc(p.coverImage)}" alt="${esc(p.displayName)}" width="640" height="480" loading="lazy" />
                </span>
                <span class="hwx-matrix__body">
                  <strong>${esc(p.displayName)}</strong>
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
              <h3 id="hwx-arch-title">空间智能硬件如何协同</h3>
              <p>从数据采集到终端交互的横向能力链路。</p>
            </div>
            <a class="hwc-text-link" href="${ASPACE_SOLUTION_HREF}">了解 ASpace 总体解决方案 →</a>
          </div>
          <ol class="hwx-arch__flow">
            ${HARDWARE_SPACE_FLOW.map(
              (step, index) => `
              <li class="hwx-arch__step">
                <span class="hwx-arch__index">${String(index + 1).padStart(2, '0')}</span>
                <span class="material-symbols-outlined hwx-arch__icon" aria-hidden="true">${esc(step.icon)}</span>
                <strong>${esc(step.title)}</strong>
                <small>${esc(step.desc)}</small>
              </li>`
            ).join('')}
          </ol>
        </section>
      </div>
    </section>`
}

function renderRetailSection() {
  const cards = [
    {
      id: 'eink-price-tag',
      use: '低功耗电子纸价签，服务门店货架信息的远程更新与统一管理。',
    },
    {
      id: 'lcd-price-tag',
      use: '彩色 LCD 价签，适合高对比、促销与品牌专柜展示场景。',
    },
    {
      id: 'cold-tag',
      use: '面向冷链与低温货架的标签方案，适配生鲜与仓储环境。',
    },
    {
      id: 'aap',
      use: '资产盘点与标签管理硬件能力，支撑盘点、巡检与台账闭环。',
    },
  ]
    .map((item) => {
      const p = getProductBySlug(item.id)
      return p ? { ...p, use: item.use } : null
    })
    .filter(Boolean)

  return `
    <section class="hwx-retail" id="hwc-retail">
      <div class="hwc-shell">
        <header class="hwx-head hwx-head--light">
          <p class="hwx-kicker">新零售与行业电子纸</p>
          <h2>以电子纸连接商品、资产与行业数据</h2>
          <p>覆盖门店价签、冷链标签与资产盘点，帮助业务侧更快完成信息同步与现场执行。</p>
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
                <p class="hwx-retail__use">${esc(p.use)}</p>
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
  const cards = [
    {
      id: 'eink-phone-case',
      scene: '/images/hardware/scene-eink-phone-case.jpg',
      use: '把可刷新的电子纸带入个人设备，让通知、图文与个性表达常显可见。',
    },
    {
      id: 'eink-frame',
      scene: '/images/hardware/scene-eink-frame.jpg',
      use: '以低功耗电子纸呈现画作与影像，进入家居与办公的数字陈列场景。',
    },
  ]
    .map((item) => {
      const p = getProductBySlug(item.id)
      return p ? { ...p, scene: item.scene, use: item.use } : null
    })
    .filter(Boolean)

  return `
    <section class="hwx-consumer" id="hwc-consumer">
      <div class="hwc-shell">
        <header class="hwx-head">
          <p class="hwx-kicker">3C 数码</p>
          <h2>电子纸进入个人设备与数字生活</h2>
          <p>面向消费与陈列场景，以大幅场景卡呈现产品形态与使用氛围。</p>
        </header>
        <div class="hwx-consumer__grid">
          ${cards
            .map(
              (p) => `
            <a class="hwx-scene" href="${productHref(p)}">
              <img src="${esc(p.scene)}" alt="${esc(p.name)}" width="1536" height="1024" loading="lazy" />
              <span class="hwx-scene__shade" aria-hidden="true"></span>
              <span class="hwx-scene__copy">
                <strong>${esc(p.name)}</strong>
                <small>${esc(p.use)}</small>
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
  return `
    <section class="hwc-cta">
      <div class="hwc-shell hwc-cta__inner">
        <div>
          <h2>获取适合项目的硬件选型建议</h2>
          <p>告诉我们空间类型、部署规模与接入需求，安托未来将协助完成硬件选型与联调方案。</p>
        </div>
        <div class="hwc-cta__actions">
          <button type="button" class="hwc-btn hwc-btn--cyan" data-demo-modal-open>获取选型建议</button>
          <button type="button" class="hwc-text-link hwc-cta__link" data-demo-modal-open>预约方案演示</button>
        </div>
      </div>
    </section>`
}

let cmsHero = null

export async function initHardwareStore() {
  const root = document.getElementById('hardware-root')
  if (!root) return
  cmsHero = await loadSimplePageContent('hardware')
  applyHardwareSimpleCms(cmsHero)

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

  void getProductsByLine
}
