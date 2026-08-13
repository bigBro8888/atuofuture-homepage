import {
  getCategory,
  getLine,
  getProductBySlug,
  getPublishedProducts,
} from '../data/hardware-catalog.js'
import { buildDetailExtras } from '../data/hardware-product-details.js'

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

function productHref(slug) {
  return `/hardware/product/?id=${encodeURIComponent(slug)}`
}

function specValue(value) {
  if (value === undefined || value === null || String(value).trim() === '') return '—'
  return String(value)
}

function renderNotFound(raw) {
  return `
    <section class="hpd">
      <div class="hwc-shell hpd-pad">
        <nav class="hpd-crumb">
          <a href="/hardware/">智能硬件</a><span>/</span><span>未找到</span>
        </nav>
        <h1 class="hpd-title">未找到该产品</h1>
        <p class="hpd-text">参数「${esc(raw || '')}」无效或未发布。</p>
        <p><a class="hwc-btn hwc-btn--cyan" href="/hardware/">返回产品中心</a></p>
      </div>
    </section>`
}

function renderBreadcrumb(product, line, category) {
  return `
    <nav class="hpd-crumb" aria-label="面包屑">
      <a href="/hardware/">智能硬件</a><span>/</span>
      ${line ? `<a href="/hardware/?line=${esc(line.id)}#hwc-browser">${esc(line.name)}</a><span>/</span>` : ''}
      ${category ? `<span>${esc(category.name)}</span><span>/</span>` : ''}
      <strong>${esc(product.name)}</strong>
    </nav>`
}

function renderHero(product, detail) {
  const gallery = detail.gallery || []
  const main = gallery[0]
  return `
    <section class="hpd-hero">
      <div class="hpd-hero__media">
        <div class="hpd-hero__stage">
          <img src="${esc(main?.src || product.coverImage)}" alt="${esc(product.name)}" width="720" height="540" data-hpd-main />
        </div>
        ${
          gallery.length > 1
            ? `<div class="hpd-thumbs" role="tablist" aria-label="产品图切换">
                ${gallery
                  .map(
                    (item, i) => `
                  <button type="button" class="hpd-thumb${i === 0 ? ' is-active' : ''}" data-hpd-thumb="${esc(item.src)}" aria-selected="${i === 0 ? 'true' : 'false'}">
                    <img src="${esc(item.src)}" alt="" />
                    <span>${esc(item.label || '')}</span>
                  </button>`
                  )
                  .join('')}
              </div>`
            : ''
        }
      </div>
      <div class="hpd-hero__info">
        <h1 class="hpd-hero__name">${esc(product.name)}</h1>
        <p class="hpd-hero__pos">${esc(product.shortDescription)}</p>
        ${detail.fullDescription ? `<p class="hpd-hero__desc">${esc(detail.fullDescription)}</p>` : ''}
        <div class="hpd-hero__actions">
          <button type="button" class="hwc-btn hpd-btn-primary" data-demo-modal-open>获取产品资料</button>
          <button type="button" class="hwc-btn hwc-btn--outline-dark" data-demo-modal-open>获取选型建议</button>
        </div>
        ${
          detail.quickInfo?.length
            ? `<dl class="hpd-quick">
                ${detail.quickInfo
                  .map(
                    (row) => `
                  <div class="hpd-quick__row">
                    <dt>${esc(row.label)}</dt>
                    <dd>${esc(row.value)}</dd>
                  </div>`
                  )
                  .join('')}
              </dl>`
            : ''
        }
      </div>
    </section>`
}

function buildAnchors(detail) {
  const items = []
  if (detail.overviewTitle || detail.capabilityItems?.length || detail.applicationImage) {
    items.push({ id: 'hpd-overview', label: '产品概览' })
  }
  if (detail.capabilityItems?.length) items.push({ id: 'hpd-capabilities', label: '核心能力' })
  if (detail.sceneCards?.length) items.push({ id: 'hpd-scenes', label: '应用场景' })
  if (detail.specGroups?.length) items.push({ id: 'hpd-specs', label: '技术参数' })
  if (detail.downloads?.length) items.push({ id: 'hpd-downloads', label: '资料下载' })
  return items
}

function renderAnchorNav(anchors) {
  if (!anchors.length) return ''
  return `
    <div class="hpd-anchor-wrap" data-hpd-anchor-wrap>
      <nav class="hpd-anchor" aria-label="页面章节">
        ${anchors
          .map(
            (a, i) =>
              `<a class="hpd-anchor__link${i === 0 ? ' is-active' : ''}" href="#${esc(a.id)}" data-hpd-anchor="${esc(a.id)}">${esc(a.label)}</a>`
          )
          .join('')}
      </nav>
    </div>`
}

function renderOverview(detail) {
  if (!detail.overviewTitle && !detail.capabilityItems?.length) return ''
  return `
    <section class="hpd-section" id="hpd-overview">
      ${detail.overviewTitle ? `<h2 class="hpd-section__title">${esc(detail.overviewTitle)}</h2>` : ''}
      <div class="hpd-overview" id="hpd-capabilities">
        ${
          detail.applicationImage
            ? `<div class="hpd-overview__visual"><img src="${esc(detail.applicationImage)}" alt="" width="760" height="480" /></div>`
            : ''
        }
        ${
          detail.capabilityItems?.length
            ? `<ul class="hpd-caps">
                ${detail.capabilityItems
                  .map(
                    (item) => `
                  <li class="hpd-caps__item">
                    <span class="material-symbols-outlined" aria-hidden="true">${esc(item.icon || 'check')}</span>
                    <div>
                      <strong>${esc(item.title)}</strong>
                      ${item.desc ? `<p>${esc(item.desc)}</p>` : ''}
                    </div>
                  </li>`
                  )
                  .join('')}
              </ul>`
            : ''
        }
      </div>
    </section>`
}

function renderWorkflow(detail) {
  if (!detail.workflow?.steps?.length) return ''
  return `
    <section class="hpd-flow">
      <div class="hwc-shell">
        <h2 class="hpd-flow__title">${esc(detail.workflow.title || '')}</h2>
        <ol class="hpd-flow__list">
          ${detail.workflow.steps
            .map(
              (step) => `
            <li>
              <span class="material-symbols-outlined" aria-hidden="true">${esc(step.icon || 'circle')}</span>
              <strong>${esc(step.title)}</strong>
            </li>`
            )
            .join('')}
        </ol>
      </div>
    </section>`
}

function renderScenes(detail) {
  if (!detail.sceneCards?.length) return ''
  return `
    <section class="hpd-section" id="hpd-scenes">
      <h2 class="hpd-section__title">应用场景</h2>
      <div class="hpd-scenes">
        ${detail.sceneCards
          .map((card) => {
            const inner = `
              <div class="hpd-scenes__media">${card.image ? `<img src="${esc(card.image)}" alt="${esc(card.title)}" />` : ''}</div>
              <div class="hpd-scenes__copy">
                <strong>${esc(card.title)}${card.href ? ' <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>' : ''}</strong>
                ${card.desc ? `<p>${esc(card.desc)}</p>` : ''}
              </div>`
            return card.href
              ? `<a class="hpd-scenes__card" href="${esc(card.href)}">${inner}</a>`
              : `<article class="hpd-scenes__card">${inner}</article>`
          })
          .join('')}
      </div>
    </section>`
}

function renderSpecs(detail) {
  if (!detail.specGroups?.length) return ''
  const groups = detail.specGroups
  return `
    <section class="hpd-section hpd-specs-section" id="hpd-specs">
      <div class="hpd-specs-layout">
        <div class="hpd-specs">
          <h2 class="hpd-section__title">技术参数</h2>
          <div class="hpd-specs__tabs" role="tablist">
            ${groups
              .map(
                (g, i) =>
                  `<button type="button" class="hpd-specs__tab${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" data-hpd-spec-tab="${esc(g.id)}">${esc(g.label)}</button>`
              )
              .join('')}
          </div>
          ${groups
            .map(
              (g, i) => `
            <div class="hpd-specs__panel${i === 0 ? ' is-active' : ''}" data-hpd-spec-panel="${esc(g.id)}" role="tabpanel">
              <dl class="hpd-specs__grid">
                ${g.rows
                  .map(
                    (row) => `
                  <div>
                    <dt>${esc(row.label)}</dt>
                    <dd>${esc(specValue(row.value))}</dd>
                  </div>`
                  )
                  .join('')}
              </dl>
              <p class="hpd-specs__note">具体参数以正式产品资料为准。</p>
            </div>`
            )
            .join('')}
        </div>
        ${renderDownloads(detail, true)}
      </div>
    </section>`
}

function renderDownloads(detail, nested = false) {
  if (!detail.downloads?.length) return ''
  const body = `
    <h2 class="hpd-section__title">${nested ? '资料下载' : '资料下载'}</h2>
    <ul class="hpd-docs">
      ${detail.downloads
        .map((doc) => {
          const action = doc.url && !doc.applyRequired
            ? `<a class="hpd-docs__action" href="${esc(doc.url)}" target="_blank" rel="noopener noreferrer">立即下载</a>`
            : `<button type="button" class="hpd-docs__action" data-demo-modal-open>申请获取</button>`
          return `
            <li>
              <span class="material-symbols-outlined hpd-docs__icon" aria-hidden="true">${esc(doc.icon || 'description')}</span>
              <div>
                <strong>${esc(doc.name)}</strong>
                <small>${esc(doc.format || 'PDF')}</small>
              </div>
              ${action}
            </li>`
        })
        .join('')}
    </ul>`
  if (nested) return `<aside class="hpd-docs-aside" id="hpd-downloads">${body}</aside>`
  return `<section class="hpd-section" id="hpd-downloads">${body}</section>`
}

function renderCollaboration(detail, product) {
  if (!detail.collaboration) return ''
  const ids = detail.collaboration.productIds || []
  const nodes = ids
    .map((id) => getProductBySlug(id))
    .filter(Boolean)
  if (!nodes.length) return ''
  return `
    <section class="hpd-collab">
      <div class="hpd-collab__intro">
        <h2>${esc(detail.collaboration.title)}</h2>
        <p>${esc(detail.collaboration.desc)}</p>
        ${
          detail.collaboration.aspaceHref
            ? `<a class="hpd-collab__link" href="${esc(detail.collaboration.aspaceHref)}">${esc(detail.collaboration.aspaceLabel || '了解 ASpace 总体解决方案')} →</a>`
            : ''
        }
      </div>
      <div class="hpd-collab__chain" aria-label="关联产品">
        ${nodes
          .map(
            (p) => `
          <a class="hpd-collab__node" href="${productHref(p.slug)}">
            <img src="${esc(p.coverImage)}" alt="${esc(p.name)}" />
            <span>${esc(p.name)}</span>
          </a>`
          )
          .join('')}
        <a class="hpd-collab__node hpd-collab__node--aspace" href="${esc(detail.collaboration.aspaceHref || '/solutions/')}">
          <span class="material-symbols-outlined" aria-hidden="true">hub</span>
          <span>ASpace</span>
        </a>
      </div>
    </section>`
}

function renderCta() {
  return `
    <section class="hpd-cta">
      <div class="hwc-shell hpd-cta__inner">
        <div>
          <h2>需要根据项目进行产品选型？</h2>
          <p>告诉我们项目场景、空间规模与接入需求，获取适合的产品组合建议。</p>
        </div>
        <div class="hpd-cta__actions">
          <button type="button" class="hwc-btn hpd-btn-primary" data-demo-modal-open>获取选型建议</button>
          <button type="button" class="hwc-btn hwc-btn--ghost" data-demo-modal-open>预约方案演示</button>
        </div>
      </div>
    </section>`
}

function renderDetail(product) {
  const line = getLine(product.productLine)
  const category = getCategory(product.category)
  const detail = buildDetailExtras(product)
  const anchors = buildAnchors(detail)
  const hasNestedDownloads = Boolean(detail.specGroups?.length && detail.downloads?.length)

  return `
    <article class="hpd">
      <div class="hwc-shell hpd-pad">
        ${renderBreadcrumb(product, line, category)}
        ${renderHero(product, detail)}
      </div>
      ${renderAnchorNav(anchors)}
      <div class="hwc-shell hpd-pad">
        ${renderOverview(detail)}
      </div>
      ${renderWorkflow(detail)}
      <div class="hwc-shell hpd-pad">
        ${renderScenes(detail)}
        ${renderSpecs(detail)}
        ${hasNestedDownloads ? '' : renderDownloads(detail, false)}
        ${renderCollaboration(detail, product)}
      </div>
      ${renderCta()}
    </article>`
}

function bindGallery(root) {
  const main = root.querySelector('[data-hpd-main]')
  root.querySelectorAll('[data-hpd-thumb]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.hpdThumb
      if (!main || !src) return
      main.classList.remove('is-fade')
      void main.offsetWidth
      main.src = src
      main.classList.add('is-fade')
      root.querySelectorAll('[data-hpd-thumb]').forEach((el) => {
        const on = el === btn
        el.classList.toggle('is-active', on)
        el.setAttribute('aria-selected', on ? 'true' : 'false')
      })
    })
  })
}

function bindSpecTabs(root) {
  const tabs = root.querySelectorAll('[data-hpd-spec-tab]')
  const panels = root.querySelectorAll('[data-hpd-spec-panel]')
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.hpdSpecTab
      tabs.forEach((t) => {
        const on = t === tab
        t.classList.toggle('is-active', on)
        t.setAttribute('aria-selected', on ? 'true' : 'false')
      })
      panels.forEach((p) => p.classList.toggle('is-active', p.dataset.hpdSpecPanel === id))
    })
  })
}

function bindAnchors(root) {
  const links = [...root.querySelectorAll('[data-hpd-anchor]')]
  if (!links.length) return

  const headerOffset = () => {
    const header = document.querySelector('.site-header')
    const wrap = root.querySelector('[data-hpd-anchor-wrap]')
    return (header?.offsetHeight || 64) + (wrap?.offsetHeight || 64) + 8
  }

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.dataset.hpdAnchor
      const target = document.getElementById(id)
      if (!target) return
      e.preventDefault()
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset()
      window.scrollTo({ top, behavior: 'smooth' })
    })
  })

  const sections = links
    .map((link) => document.getElementById(link.dataset.hpdAnchor))
    .filter(Boolean)

  const sync = () => {
    const y = window.scrollY + headerOffset() + 24
    let current = sections[0]?.id
    sections.forEach((sec) => {
      if (sec.offsetTop <= y) current = sec.id
    })
    links.forEach((link) => link.classList.toggle('is-active', link.dataset.hpdAnchor === current))
  }

  window.addEventListener('scroll', sync, { passive: true })
  sync()
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
  bindGallery(root)
  bindSpecTabs(root)
  bindAnchors(root)
}
