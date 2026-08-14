import { ADVANTAGE_SLIDES } from '../../data/home-advantages.js'
import '../../styles/home-advantages.css'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderAction(action) {
  const label = escapeHtml(action.label)
  if (action.action === 'demo') {
    return `<button type="button" class="sm-btn sm-btn--primary" data-demo-modal-open>${label}</button>`
  }
  return `<a href="${escapeHtml(action.href)}" class="sm-btn sm-btn--primary">${label}</a>`
}

function renderKicker(slide) {
  const label = String(slide.label || '').trim()
  if (!label) return ''
  const match = /^能力\s*0?(\d+)$/.exec(label)
  if (!match) return `<strong class="sm-hero__kicker ha-kicker">${escapeHtml(label)}</strong>`
  return `<strong class="sm-hero__kicker ha-kicker">能力 <span class="ha-kicker__num">${match[1].padStart(2, '0')}</span></strong>`
}

function renderSlide(slide, index) {
  const isFirst = index === 0
  const titleTag = isFirst ? 'h1' : 'h2'
  const loading = isFirst ? 'eager' : 'lazy'
  const fetchPriority = isFirst ? 'high' : 'low'
  const dwell = slide.dwellMs || ''
  const ariaLabel = slide.label ? `${slide.label}：${slide.title}` : slide.title

  return `
<article
  class="sm-hero__slide ha-slide ha-slide--${escapeHtml(slide.themeClass)}${isFirst ? ' is-active' : ''}"
  data-sm-hero-slide
  data-ha-theme="${escapeHtml(slide.themeClass)}"
  ${dwell ? `data-ha-dwell="${dwell}"` : ''}
  aria-hidden="${isFirst ? 'false' : 'true'}"
  aria-label="${escapeHtml(ariaLabel)}"
>
  <div class="sm-hero__media ha-media">
    <img
      class="ha-media__img"
      src="${escapeHtml(slide.background)}"
      alt=""
      width="1920"
      height="1080"
      loading="${loading}"
      decoding="async"
      fetchpriority="${fetchPriority}"
    />
  </div>
  <div class="sm-hero__gradient ha-mask" aria-hidden="true"></div>
  <div class="sm-hero__content ha-content max-w-max-width mx-auto px-margin-desktop">
    <div class="sm-hero__copy ha-copy">
      ${renderKicker(slide)}
      <${titleTag} class="ha-title">${escapeHtml(slide.title)}</${titleTag}>
      <p class="ha-desc">${escapeHtml(slide.description)}</p>
      <div class="sm-hero__actions ha-actions">
        ${renderAction(slide.primaryAction)}
      </div>
    </div>
  </div>
</article>`
}

/** 西门子式简洁首屏：左文案 + 全幅背景，无右侧架构叠加 */
export function mountHomeAdvantages(trackEl, slides = ADVANTAGE_SLIDES) {
  if (!trackEl) return
  const list = slides?.length ? slides : ADVANTAGE_SLIDES
  trackEl.innerHTML = list.map(renderSlide).join('')
}

export { ADVANTAGE_SLIDES }
