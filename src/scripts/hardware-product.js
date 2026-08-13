import { getLine, getProductBySlug, getPublishedProducts } from '../data/hardware-catalog.js'

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
  // hardware / space-intelligence / control-screen
  if (parts[0] === 'hardware' && parts.length >= 3 && parts[1] !== 'product') {
    return parts[parts.length - 1]
  }
  return null
}

function renderNotFound(raw) {
  return `
    <section class="hwc-detail">
      <div class="hwc-shell">
        <nav class="hwc-crumb"><a href="/hardware/">智能硬件产品中心</a><span>/</span><span>未找到</span></nav>
        <h1>未找到该产品</h1>
        <p>参数「${esc(raw || '')}」无效或未发布。</p>
        <p><a class="hwc-btn hwc-btn--cyan" href="/hardware/">返回产品中心</a></p>
      </div>
    </section>`
}

function renderDetail(product) {
  const line = getLine(product.productLine)
  const gallery = (product.gallery && product.gallery.length ? product.gallery : [product.coverImage]).filter(Boolean)
  const related = getPublishedProducts()
    .filter((p) => p.productLine === product.productLine && p.id !== product.id)
    .slice(0, 4)

  return `
    <article class="hwc-detail">
      <div class="hwc-shell">
        <nav class="hwc-crumb">
          <a href="/hardware/">智能硬件产品中心</a><span>/</span>
          ${line ? `<span>${esc(line.name)}</span><span>/</span>` : ''}
          <span>${esc(product.name)}</span>
        </nav>

        <section class="hwc-detail__hero">
          <div class="hwc-detail__copy">
            <p class="hwc-detail__eyebrow">${esc(line?.name || '智能硬件')}</p>
            <h1>${esc(product.name)}</h1>
            <p class="hwc-detail__lead">${esc(product.shortDescription)}</p>
            <div class="hwc-feature__actions">
              ${
                product.documentUrl
                  ? `<a class="hwc-btn hwc-btn--orange" href="${esc(product.documentUrl)}" target="_blank" rel="noopener noreferrer">获取产品资料</a>`
                  : `<button type="button" class="hwc-btn hwc-btn--orange" data-demo-modal-open>获取产品资料</button>`
              }
              <button type="button" class="hwc-btn hwc-btn--outline-dark" data-demo-modal-open>获取选型建议</button>
              <button type="button" class="hwc-btn hwc-btn--cyan" data-demo-modal-open>预约方案演示</button>
            </div>
          </div>
          <div class="hwc-detail__gallery">
            <img src="${esc(gallery[0])}" alt="${esc(product.name)}" width="640" height="480" data-hwc-main-img />
            ${
              gallery.length > 1
                ? `<div class="hwc-detail__thumbs">${gallery
                    .map(
                      (src, i) =>
                        `<button type="button" class="hwc-detail__thumb${i === 0 ? ' is-active' : ''}" data-hwc-thumb="${esc(src)}"><img src="${esc(src)}" alt="" /></button>`
                    )
                    .join('')}</div>`
                : ''
            }
          </div>
        </section>

        ${
          product.capabilities?.length
            ? `<section class="hwc-detail__block">
                <h2>核心能力</h2>
                <ul class="hwc-detail__list">${product.capabilities.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
              </section>`
            : ''
        }

        ${
          product.scenarios?.length
            ? `<section class="hwc-detail__block">
                <h2>适用场景</h2>
                <ul class="hwc-detail__list">${product.scenarios.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
              </section>`
            : ''
        }

        ${
          product.specifications?.length
            ? `<section class="hwc-detail__block">
                <h2>产品规格参数</h2>
                <dl class="hwc-detail__specs">${product.specifications
                  .map((item) => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`)
                  .join('')}</dl>
              </section>`
            : ''
        }

        ${
          product.interfaces?.length
            ? `<section class="hwc-detail__block">
                <h2>接口或接入方式</h2>
                <ul class="hwc-detail__list">${product.interfaces.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
              </section>`
            : ''
        }

        ${
          product.relatedSolutions?.length
            ? `<section class="hwc-detail__block">
                <h2>可关联的解决方案</h2>
                <div class="hwc-detail__links">${product.relatedSolutions
                  .map((item) => `<a href="${esc(item.href)}">${esc(item.label)} →</a>`)
                  .join('')}</div>
              </section>`
            : ''
        }

        ${
          related.length
            ? `<section class="hwc-detail__block">
                <h2>同产品线其他硬件</h2>
                <div class="hwc-related__grid">
                  ${related
                    .map(
                      (p) => `
                    <a class="hwc-related__card" href="/hardware/product/?id=${encodeURIComponent(p.slug)}">
                      <img src="${esc(p.coverImage)}" alt="${esc(p.name)}" width="220" height="160" />
                      <strong>${esc(p.name)}</strong>
                    </a>`
                    )
                    .join('')}
                </div>
              </section>`
            : ''
        }

        <section class="hwc-cta hwc-cta--detail">
          <div class="hwc-cta__inner">
            <div>
              <h2>需要该产品的选型与资料？</h2>
              <p>可预约方案演示，或由顾问协助确认部署方式与联调路径。</p>
            </div>
            <div class="hwc-cta__actions">
              <button type="button" class="hwc-btn hwc-btn--cyan" data-demo-modal-open>预约方案演示</button>
              <a class="hwc-btn hwc-btn--ghost" href="/hardware/">返回产品中心</a>
            </div>
          </div>
        </section>
      </div>
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
  document.title = `${product.name} | 智能硬件产品中心 | 安托未来`
  root.innerHTML = renderDetail(product)

  root.querySelectorAll('[data-hwc-thumb]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.hwcThumb
      const main = root.querySelector('[data-hwc-main-img]')
      if (main && src) {
        main.src = src
        root.querySelectorAll('[data-hwc-thumb]').forEach((el) => el.classList.toggle('is-active', el === btn))
      }
    })
  })
}
