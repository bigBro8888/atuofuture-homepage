import { getLine, getProductBySlug } from '../data/hardware-catalog.js'
import { buildProductStory } from '../data/hardware-product-details.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function resolveSlug() {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('id') || params.get('slug')
  if (fromQuery) return fromQuery
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts[0] === 'hardware' && parts.length >= 3 && parts[1] !== 'product') {
    return parts[parts.length - 1]
  }
  return null
}

function renderNotFound(raw) {
  return `
    <section class="hpi">
      <div class="hwc-shell hpi-pad">
        <p class="hpi-crumb"><a href="/hardware/">智能硬件</a> / 未找到</p>
        <h1>未找到该产品</h1>
        <p>参数「${esc(raw || '')}」无效或未发布。</p>
        <p><a class="hwc-btn hwc-btn--cyan" href="/hardware/">返回产品中心</a></p>
      </div>
    </section>`
}

function renderHero(story, product, line) {
  const hero = story.hero
  return `
    <section class="hpi-hero" style="--hpi-hero-image:url('${esc(hero.backgroundImage)}')">
      <div class="hpi-hero__overlay" aria-hidden="true"></div>
      <div class="hwc-shell hpi-hero__grid">
        <div class="hpi-hero__copy">
          <p class="hpi-hero__crumb"><a href="/hardware/">智能硬件</a>${line ? ` / <a href="/hardware/?line=${esc(line.id)}#hwc-browser">${esc(line.name)}</a>` : ''} / ${esc(product.name)}</p>
          <h1>${esc(hero.title)}</h1>
          <p class="hpi-hero__headline">${esc(hero.headline)}</p>
          <p class="hpi-hero__desc">${esc(hero.description)}</p>
          <a class="hpi-hero__link" href="${esc(hero.ctaHref || '#hpi-how')}">${esc(hero.ctaLabel || '查看它如何工作')} →</a>
        </div>
        <div class="hpi-hero__device" aria-hidden="true">
          <img src="${esc(hero.deviceImage)}" alt="" width="520" height="420" />
        </div>
      </div>
    </section>`
}

function renderValue(story) {
  const v = story.value
  if (!v) return ''
  return `
    <section class="hpi-value">
      <div class="hwc-shell">
        <h2 class="hpi-value__title">${esc(v.title)}</h2>
        <div class="hpi-value__map">
          <div class="hpi-value__side hpi-value__side--left">
            ${(v.left || []).map((t) => `<p>${esc(t)}</p>`).join('')}
          </div>
          <div class="hpi-value__core">
            <img src="${esc(v.deviceImage)}" alt="" width="360" height="280" />
            <span class="hpi-value__ring" aria-hidden="true"></span>
          </div>
          <div class="hpi-value__side hpi-value__side--right">
            ${(v.right || []).map((t) => `<p>${esc(t)}</p>`).join('')}
          </div>
        </div>
        <p class="hpi-value__footer">${esc(v.footer)}</p>
      </div>
    </section>`
}

function renderHow(story) {
  const how = story.howItWorks
  if (!how?.stages?.length) return ''
  return `
    <section class="hpi-how" id="hpi-how">
      <div class="hwc-shell">
        <h2 class="hpi-how__title">${esc(how.title)}</h2>
        <ol class="hpi-how__stages">
          ${how.stages
            .map(
              (stage, i) => `
            <li>
              <figure>
                <img src="${esc(stage.image)}" alt="${esc(stage.title)}" width="280" height="180" loading="lazy" />
                <figcaption>
                  <strong>${i + 1}. ${esc(stage.title)}</strong>
                  <span>${esc(stage.caption)}</span>
                </figcaption>
              </figure>
            </li>`
            )
            .join('')}
        </ol>
      </div>
    </section>`
}

function renderScenarios(story) {
  const block = story.scenarios
  if (!block?.items?.length) return ''
  return `
    <section class="hpi-scenes">
      <div class="hwc-shell">
        <h2 class="hpi-scenes__title">${esc(block.title)}</h2>
        <div class="hpi-scenes__list">
          ${block.items
            .map(
              (item) => `
            <article class="hpi-scenes__row">
              <div class="hpi-scenes__photo">
                <img src="${esc(item.sceneImage)}" alt="${esc(item.title)}" width="720" height="420" loading="lazy" />
                <div class="hpi-scenes__copy">
                  <h3>${esc(item.title)}</h3>
                  <p>${esc(item.desc)}</p>
                </div>
              </div>
              <div class="hpi-scenes__device">
                <img src="${esc(item.deviceImage)}" alt="" width="320" height="240" loading="lazy" />
              </div>
            </article>`
            )
            .join('')}
        </div>
      </div>
    </section>`
}

function renderSystem(story) {
  const sys = story.system
  if (!sys) return ''
  return `
    <section class="hpi-system">
      <div class="hwc-shell">
        <h2 class="hpi-system__title">${esc(sys.title)}</h2>
        <div class="hpi-system__stack">
          <div class="hpi-system__layer hpi-system__layer--upper">
            <p class="hpi-system__label">${esc(sys.upperLabel)}</p>
            <div class="hpi-system__chips">
              ${(sys.upperItems || []).map((t) => `<span>${esc(t)}</span>`).join('')}
            </div>
          </div>
          <div class="hpi-system__layer hpi-system__layer--mid">
            <p class="hpi-system__label">${esc(sys.middleLabel)}</p>
            <img src="${esc(sys.middleImage)}" alt="" width="280" height="200" />
          </div>
          <div class="hpi-system__layer hpi-system__layer--lower">
            <div class="hpi-system__chips">
              ${(sys.lowerItems || []).map((t) => `<span>${esc(t)}</span>`).join('')}
            </div>
          </div>
        </div>
        ${
          sys.aspaceHref
            ? `<p class="hpi-system__link"><a href="${esc(sys.aspaceHref)}">${esc(sys.aspaceLabel)} →</a></p>`
            : ''
        }
      </div>
    </section>`
}

function renderClosing(story) {
  const c = story.closing
  if (!c) return ''
  return `
    <section class="hpi-close">
      <div class="hpi-close__bg" aria-hidden="true"></div>
      <div class="hwc-shell hpi-close__inner">
        <h2>${esc(c.title)}</h2>
        <p>${esc(c.desc)}</p>
        <button type="button" class="hwc-btn hpi-close__btn" data-demo-modal-open>${esc(c.primaryLabel)}</button>
        <p class="hpi-close__soft">
          ${(c.softLinks || [])
            .map(
              (link, i) =>
                `${i > 0 ? ' <span>/</span> ' : ''}<button type="button" data-demo-modal-open>${esc(link.label)}</button>`
            )
            .join('')}
        </p>
      </div>
    </section>`
}

function renderStory(product) {
  const line = getLine(product.productLine)
  const story = buildProductStory(product)
  return `
    <article class="hpi">
      ${renderHero(story, product, line)}
      ${renderValue(story)}
      ${renderHow(story)}
      ${renderScenarios(story)}
      ${renderSystem(story)}
      ${renderClosing(story)}
    </article>`
}

export function initHardwareProductPage() {
  const root = document.getElementById('hardware-product-root')
  if (!root) return
  const slug = resolveSlug()
  const product = getProductBySlug(slug)
  if (!product) {
    document.title = '产品未找到 | 安托未来'
    root.innerHTML = renderNotFound(slug)
    return
  }
  document.title = `${product.name} | 智能硬件产品介绍 | 安托未来`
  root.innerHTML = renderStory(product)
}
