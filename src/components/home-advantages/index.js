import { ADVANTAGE_SLIDES } from '../../data/home-advantages.js'
import { renderCompanyOverviewVisual } from './visuals/overview.js'
import { renderOpenInterfaceVisual } from './visuals/open-interface.js'
import { renderAiAgentVisual } from './visuals/ai-agent.js'
import { renderWirelessAccessVisual } from './visuals/wireless-access.js'
import { renderLayeredLoopVisual } from './visuals/layered-loop.js'
import { renderHardwareArchitectureVisual } from './visuals/hardware-system.js'
import '../../styles/home-advantages.css'

const VISUAL_RENDERERS = {
  overview: renderCompanyOverviewVisual,
  'open-interface': renderOpenInterfaceVisual,
  'ai-agent': renderAiAgentVisual,
  'wireless-access': renderWirelessAccessVisual,
  'layered-loop': renderLayeredLoopVisual,
  'hardware-system': renderHardwareArchitectureVisual,
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderAction(action, variant) {
  const className = variant === 'primary' ? 'sm-btn sm-btn--primary' : 'sm-btn sm-btn--outline'
  const label = escapeHtml(action.label)
  if (action.action === 'demo') {
    return `<button type="button" class="${className}" data-demo-modal-open>${label}</button>`
  }
  return `<a href="${escapeHtml(action.href)}" class="${className}">${label}</a>`
}

function renderKicker(slide) {
  if (slide.eyebrowEn || slide.eyebrowZh) {
    return `
      <strong class="sm-hero__kicker ha-kicker ha-kicker--overview">
        <span class="ha-kicker__en">${escapeHtml(slide.eyebrowEn || '')}</span>
        ${slide.eyebrowZh ? `<span class="ha-kicker__zh">${escapeHtml(slide.eyebrowZh)}</span>` : ''}
      </strong>`
  }
  const match = /^能力\s*0?(\d+)$/.exec(String(slide.label || '').trim())
  if (!match) return `<strong class="sm-hero__kicker ha-kicker">${escapeHtml(slide.label)}</strong>`
  return `<strong class="sm-hero__kicker ha-kicker">能力 <span class="ha-kicker__num">${match[1].padStart(2, '0')}</span></strong>`
}

function renderSlide(slide, index) {
  const isFirst = index === 0
  const titleTag = isFirst ? 'h1' : 'h2'
  const visualFn = VISUAL_RENDERERS[slide.visual]
  const visualHtml = visualFn ? visualFn() : ''
  const loading = isFirst ? 'eager' : 'lazy'
  const fetchPriority = isFirst ? 'high' : 'low'
  const dwell = slide.dwellMs || ''

  return `
<article
  class="sm-hero__slide ha-slide ha-slide--${escapeHtml(slide.themeClass)}${isFirst ? ' is-active' : ''}"
  data-sm-hero-slide
  data-ha-theme="${escapeHtml(slide.themeClass)}"
  ${dwell ? `data-ha-dwell="${dwell}"` : ''}
  aria-hidden="${isFirst ? 'false' : 'true'}"
  aria-label="${escapeHtml(slide.label)}：${escapeHtml(slide.title)}"
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
      ${slide.valueProp ? `<p class="ha-value">${escapeHtml(slide.valueProp)}</p>` : ''}
      <div class="sm-hero__actions ha-actions">
        ${renderAction(slide.primaryAction, 'primary')}
        ${renderAction(slide.secondaryAction, 'secondary')}
      </div>
    </div>
    <div class="ha-visual" aria-hidden="true">
      ${visualHtml}
    </div>
  </div>
</article>`
}

/** 将公司总览 + 五大优势轮播渲染到 track 容器 */
export function mountHomeAdvantages(trackEl) {
  if (!trackEl) return
  trackEl.innerHTML = ADVANTAGE_SLIDES.map(renderSlide).join('')
}

export { ADVANTAGE_SLIDES }
