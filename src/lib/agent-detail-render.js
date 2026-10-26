/** 智能体详情页渲染（前台与后台可视化编辑共用） */

import { SPACE_AGENT_PAGE } from '../data/space-agent-page.js'
import { esc, textNode, imgNode } from './vedit-nodes.js'

function deepMerge(base, patch) {
  if (!patch || typeof patch !== 'object') return structuredClone(base)
  if (Array.isArray(base)) {
    if (!Array.isArray(patch)) return structuredClone(base)
    return patch.map((item, index) => {
      const prev = base[index]
      if (item && typeof item === 'object' && !Array.isArray(item) && prev && typeof prev === 'object') {
        return deepMerge(prev, item)
      }
      return item ?? structuredClone(prev)
    })
  }
  const out = { ...base }
  for (const [key, value] of Object.entries(patch)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      out[key] = deepMerge(Array.isArray(base?.[key]) ? base[key] : [], value)
    } else if (typeof value === 'object') {
      out[key] = deepMerge(base?.[key] && typeof base[key] === 'object' ? base[key] : {}, value)
    } else {
      out[key] = value
    }
  }
  return out
}

export function resolveSpacePage(agent = {}) {
  return deepMerge(SPACE_AGENT_PAGE, agent.spacePage || {})
}

/** 每个步骤下方仅一张可换小方块图，不再做预约卡/叠层等细碎组件 */
function renderFlowCard(step, index, { editable = false } = {}) {
  const image = String(step.image || '').trim()
  const imgPath = `spacePage.flowSteps.${index}.image`
  if (editable) {
    return `
      <div class="space-ad__flow-card space-ad__flow-card--image">
        ${imgNode(imgPath, image, { editable, loading: 'lazy', alt: step.title || '' })}
      </div>`
  }
  if (!image) return `<div class="space-ad__flow-card space-ad__flow-card--image space-ad__flow-card--empty" aria-hidden="true"></div>`
  return `
    <div class="space-ad__flow-card space-ad__flow-card--image">
      <img src="${esc(image)}" alt="" loading="lazy" />
    </div>`
}

function renderHeroMedia(p, { editable = false } = {}) {
  const image = String(p.heroImage || '').trim()
  const video = String(p.heroVideo || '').trim()
  if (editable) {
    const hasMedia = Boolean(video || image)
    const preview = video
      ? `<video class="space-ad__hero-media" data-online-video="${esc(video)}"${image ? ` poster="${esc(image)}"` : ''} muted loop playsinline></video>`
      : image
        ? `<img class="space-ad__hero-media" src="${esc(image)}" alt="" width="900" height="560" />`
        : ''
    // 不用 <button> 包 <video>：HTML 禁止 button 内嵌交互/媒体，浏览器会不显示视频
    return `
      <div class="hpi-edit-img${hasMedia ? '' : ' hpi-edit-img--empty'} space-ad__hero-edit-media"
        role="button"
        tabindex="0"
        data-edit-hero-media
        data-edit-image="spacePage.heroImage"
        data-edit-image-url="${esc(image)}"
        data-edit-video="spacePage.heroVideo"
        data-edit-video-url="${esc(video)}"
        title="更换图片或视频">
        ${preview}
        <span class="hpi-edit-img__tip${hasMedia ? '' : ' is-visible'}">${hasMedia ? '更换媒体' : '添加图片或视频'}</span>
      </div>`
  }
  if (video) {
    return `<video class="space-ad__hero-media" data-online-video="${esc(video)}"${image ? ` poster="${esc(image)}"` : ''} autoplay muted loop playsinline></video>`
  }
  if (!image) return ''
  return `<img class="space-ad__hero-media" src="${esc(image)}" alt="" width="900" height="560" fetchpriority="high" />`
}

function renderArchWires(dir) {
  const ys = [48, 144, 240, 336, 432]
  const mid = 240
  const paths =
    dir === 'in'
      ? ys
          .map((y, i) => {
            const c1 = 36 + Math.abs(i - 2) * 4
            return `<path d="M0 ${y} C ${c1} ${y}, 72 ${mid}, 112 ${mid}" />`
          })
          .join('')
      : ys
          .map((y, i) => {
            const c1 = 76 - Math.abs(i - 2) * 4
            return `<path d="M8 ${mid} C 40 ${mid}, ${c1} ${y}, 120 ${y}" />`
          })
          .join('')
  const marker =
    dir === 'in'
      ? `<polygon class="space-ad__arch-arrow" points="112,232 124,240 112,248" />`
      : `<polygon class="space-ad__arch-arrow" points="0,232 12,240 0,248" />`
  return `
    <svg class="space-ad__arch-wires space-ad__arch-wires--${dir}" viewBox="0 0 124 480" preserveAspectRatio="none" aria-hidden="true">
      ${paths}
      ${marker}
    </svg>`
}

function renderSpaceAgentDetail(agent, { editable = false } = {}) {
  const a = agent
  const p = resolveSpacePage(a)
  const tab = editable ? ' tabindex="-1"' : ''
  const coreImage = a.archCoreImage || p.archCoreImage || ''
  return `
    <article class="space-ad${editable ? ' space-ad--editable' : ''}">
      <section class="space-ad__hero">
        <div class="space-ad__wrap">
          <nav class="agent-detail-breadcrumb">
            <a href="../"${tab}>首页</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <a href="../agents/"${tab}>空间智能体</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <span>${esc(a.name)}</span>
          </nav>
          <div class="space-ad__hero-grid">
            <div class="space-ad__hero-copy">
              ${textNode('spacePage.heroTitle', p.heroTitle || '', { editable, tag: 'h1', placeholder: '首屏标题' })}
              ${textNode('spacePage.heroDesc', p.heroDesc || '', {
                editable,
                tag: 'p',
                multiline: true,
                placeholder: '首屏说明',
              })}
              <div class="space-ad__btns">
                <button type="button" class="space-ad__btn space-ad__btn--primary"${editable ? '' : ' data-demo-modal-open'}>
                  ${textNode('spacePage.heroSecondary.label', p.heroSecondary?.label || '', { editable, tag: 'span', placeholder: '预约场景演示' })}
                </button>
              </div>
              <ul class="space-ad__venues">
                ${(p.venues || [])
                  .map(
                    (v, i) => `
                  <li>
                    <span class="material-symbols-outlined">${v.icon}</span>
                    ${textNode(`spacePage.venues.${i}.label`, v.label || '', { editable, tag: 'span', placeholder: '场所' })}
                  </li>`
                  )
                  .join('')}
              </ul>
            </div>
            <div class="space-ad__hero-visual">
              ${renderHeroMedia(p, { editable })}
            </div>
          </div>
        </div>
      </section>

      <section class="space-ad__block">
        <div class="space-ad__wrap">
          <header class="space-ad__head space-ad__head--center">
            ${textNode('spacePage.flowTitle', p.flowTitle || '', { editable, tag: 'h2', placeholder: '流程标题' })}
            ${textNode('spacePage.flowDesc', p.flowDesc || '', {
              editable,
              tag: 'p',
              multiline: true,
              placeholder: '流程说明',
            })}
          </header>
          <div class="space-ad__flow-row">
            ${
              editable
                ? `<button type="button" class="space-ad__flow-paste-entry" data-agents-flow-paste-open title="批量粘贴解析流程六步">
              <span class="material-symbols-outlined" aria-hidden="true">content_paste</span>
              <em>批量粘贴</em>
            </button>`
                : ''
            }
            <ol class="space-ad__flow">
              ${(p.flowSteps || [])
                .map(
                  (step, i) => `
                <li>
                  <div class="space-ad__flow-dot">${String(i + 1).padStart(2, '0')}</div>
                  ${textNode(`spacePage.flowSteps.${i}.title`, step.title || '', { editable, tag: 'h3', placeholder: '步骤标题' })}
                  ${textNode(`spacePage.flowSteps.${i}.desc`, step.desc || '', { editable, tag: 'p', placeholder: '步骤说明' })}
                  ${renderFlowCard(step, i, { editable })}
                </li>`
                )
                .join('')}
            </ol>
          </div>
        </div>
      </section>

      <section class="space-ad__contrast">
        <div class="space-ad__wrap space-ad__contrast-inner">
          <figure class="space-ad__contrast-media">
            ${
              editable
                ? imgNode('spacePage.contrastImage', p.contrastImage, { editable, loading: 'lazy' })
                : `<img class="space-ad__contrast-media-el" src="${esc(p.contrastImage || '')}" alt="" loading="lazy" />`
            }
          </figure>
          <div class="space-ad__contrast-copy">
            ${textNode('spacePage.contrastTitle', p.contrastTitle || '', {
              editable,
              tag: 'h2',
              multiline: true,
              placeholder: '对比标题',
            })}
            ${textNode('spacePage.contrastDesc', p.contrastDesc || '', {
              editable,
              tag: 'p',
              multiline: true,
              placeholder: '对比说明',
            })}
          </div>
        </div>
      </section>

      <section class="space-ad__block">
        <div class="space-ad__wrap space-ad__scenarios">
          ${(p.scenarios || [])
            .map((s, i) => {
              const checks = editable
                ? [...(s.checks || []), '', '', '', ''].slice(0, Math.max(4, s.checks?.length || 0))
                : s.checks || []
              const actions = editable
                ? [...(s.actions || []), {}, {}, {}, {}].slice(0, Math.max(4, s.actions?.length || 0))
                : s.actions || []
              const pasteCopy = editable
                ? `<button type="button" class="space-ad__scenario-paste-entry" data-agents-scenario-paste-open data-scenario-index="${i}" data-scenario-mode="copy" title="批量粘贴左侧标题与打勾项">
                    <span class="material-symbols-outlined" aria-hidden="true">content_paste</span>
                    <em>粘贴</em>
                  </button>`
                : ''
              const pasteActions = editable
                ? `<button type="button" class="space-ad__scenario-paste-entry" data-agents-scenario-paste-open data-scenario-index="${i}" data-scenario-mode="actions" title="批量粘贴右侧动作列表">
                    <span class="material-symbols-outlined" aria-hidden="true">content_paste</span>
                    <em>粘贴</em>
                  </button>`
                : ''
              return `
            <article class="space-ad__scenario" data-scenario-index="${i}">
              <div class="space-ad__scenario-col space-ad__scenario-col--copy">
                ${pasteCopy}
                <div class="space-ad__scenario-copy">
                  <span class="space-ad__scenario-icon material-symbols-outlined${s.tone === 'warn' ? ' space-ad__scenario-icon--warn' : ''}">${s.icon}</span>
                  ${textNode(`spacePage.scenarios.${i}.title`, s.title || '', { editable, tag: 'h3', placeholder: '场景标题' })}
                  ${textNode(`spacePage.scenarios.${i}.desc`, s.desc || '', { editable, tag: 'p', placeholder: '场景说明' })}
                  <ul>
                    ${checks
                      .map(
                        (c, ci) => `
                      <li><span class="material-symbols-outlined">check_circle</span>${textNode(
                        `spacePage.scenarios.${i}.checks.${ci}`,
                        typeof c === 'string' ? c : '',
                        { editable, tag: 'span', placeholder: '能力点' }
                      )}</li>`
                      )
                      .join('')}
                  </ul>
                </div>
              </div>
              <figure class="space-ad__scenario-media">
                ${
                  editable
                    ? imgNode(`spacePage.scenarios.${i}.image`, s.image, { editable, loading: 'lazy' })
                    : `<img class="space-ad__scenario-media-el" src="${esc(s.image || '')}" alt="" loading="lazy" />`
                }
                ${
                  s.badge || editable
                    ? `<span class="space-ad__scenario-badge">${textNode(
                        `spacePage.scenarios.${i}.badge`,
                        s.badge || '',
                        { editable, tag: 'span', placeholder: '角标文案' }
                      )}</span>`
                    : ''
                }
              </figure>
              <div class="space-ad__scenario-col space-ad__scenario-col--actions">
                ${pasteActions}
                <ul class="space-ad__scenario-actions">
                  ${actions
                    .map(
                      (act, ai) => `
                    <li>
                      <span class="material-symbols-outlined">${act?.icon || 'chevron_right'}</span>
                      ${textNode(`spacePage.scenarios.${i}.actions.${ai}.label`, act?.label || '', {
                        editable,
                        tag: 'span',
                        placeholder: '动作',
                      })}
                    </li>`
                    )
                    .join('')}
                </ul>
              </div>
            </article>`
            })
            .join('')}
        </div>
      </section>

      <section class="space-ad__block space-ad__block--soft">
        <div class="space-ad__wrap">
          <header class="space-ad__head space-ad__head--center">
            ${textNode('spacePage.archTitle', p.archTitle || '', { editable, tag: 'h2', placeholder: '接入标题' })}
            ${textNode('spacePage.archDesc', p.archDesc || '', {
              editable,
              tag: 'p',
              multiline: true,
              placeholder: '接入说明',
            })}
          </header>
          <div class="space-ad__arch">
            <div class="space-ad__arch-col">
              ${(p.archLeft || [])
                .map(
                  (item, i) => `
                <div class="space-ad__arch-item">
                  <span class="material-symbols-outlined">${item.icon}</span>
                  ${textNode(`spacePage.archLeft.${i}.label`, item.label || '', { editable, tag: 'span', placeholder: '系统' })}
                </div>`
                )
                .join('')}
            </div>
            ${renderArchWires('in')}
            ${
              editable
                ? `<div class="space-ad__arch-core space-ad__arch-core--image">
              ${imgNode('archCoreImage', coreImage, { editable, loading: 'lazy', alt: a.name || '' })}
            </div>`
                : coreImage
                  ? `<div class="space-ad__arch-core space-ad__arch-core--image">
              <img src="${esc(coreImage)}" alt="${esc(a.name || '')}" loading="lazy" />
            </div>`
                  : `<div class="space-ad__arch-core">
              <div class="space-ad__arch-core-badge">
                <span class="material-symbols-outlined">${a.icon}</span>
              </div>
              <strong>${esc(a.name)}</strong>
            </div>`
            }
            ${renderArchWires('out')}
            <div class="space-ad__arch-col space-ad__arch-col--right">
              ${(p.archRight || [])
                .map(
                  (item, i) => `
                <div class="space-ad__arch-item">
                  ${textNode(`spacePage.archRight.${i}.label`, item.label || '', { editable, tag: 'span', placeholder: '执行项' })}
                  <span class="material-symbols-outlined">${item.icon}</span>
                </div>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="space-ad__block">
        <div class="space-ad__wrap">
          <header class="space-ad__head space-ad__head--center">
            ${textNode('spacePage.outcomesTitle', p.outcomesTitle || '', { editable, tag: 'h2', placeholder: '成效标题' })}
          </header>
          <div class="space-ad__outcomes">
            ${(p.outcomes || [])
              .map(
                (item, i) => `
              <article class="space-ad__outcome">
                <span class="space-ad__outcome-icon space-ad__outcome-icon--${item.tone} material-symbols-outlined">${item.icon}</span>
                <div>
                  ${textNode(`spacePage.outcomes.${i}.title`, item.title || '', { editable, tag: 'h3', placeholder: '成效标题' })}
                  ${textNode(`spacePage.outcomes.${i}.desc`, item.desc || '', { editable, tag: 'p', placeholder: '成效说明' })}
                </div>
              </article>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="space-ad__cta" style="--cta-img:url('${esc(p.ctaImage || '')}')">
        <div class="space-ad__wrap space-ad__cta-inner">
          <div>
            ${textNode('spacePage.ctaTitle', p.ctaTitle || '', { editable, tag: 'h2', placeholder: '收尾标题' })}
            ${textNode('spacePage.ctaDesc', p.ctaDesc || '', {
              editable,
              tag: 'p',
              multiline: true,
              placeholder: '收尾说明',
            })}
          </div>
          <div class="space-ad__btns">
            <button type="button" class="space-ad__btn space-ad__btn--light"${editable ? '' : ' data-demo-modal-open'}>预约场景演示</button>
          </div>
        </div>
      </section>
    </article>`
}

function renderGenericAgentDetail(agent, { editable = false } = {}) {
  const a = agent
  const caps = editable ? [...(a.capabilities || []), {}, {}, {}, {}].slice(0, Math.max(4, a.capabilities?.length || 0)) : a.capabilities || []
  const steps = editable ? [...(a.workflow || []), {}, {}, {}, {}].slice(0, Math.max(4, a.workflow?.length || 0)) : a.workflow || []
  const metrics = editable ? [...(a.metrics || []), {}, {}, {}].slice(0, Math.max(3, a.metrics?.length || 0)) : a.metrics || []
  const scenarios = editable
    ? [...(a.scenarios || []), '', '', '', ''].slice(0, Math.max(4, a.scenarios?.length || 0))
    : a.scenarios || []
  const tab = editable ? ' tabindex="-1"' : ''
  return `
    <div class="agent-detail-vedit${editable ? ' agent-detail-vedit--editable' : ''}">
      <section class="agent-detail-hero">
        <div class="agent-detail-hero__bg" aria-hidden="true"></div>
        <div class="max-w-max-width mx-auto px-margin-desktop relative z-10">
          <nav class="agent-detail-breadcrumb">
            <a href="../"${tab}>首页</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <a href="../agents/"${tab}>空间智能体</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <span>${esc(a.name || '')}</span>
          </nav>
          <div class="agent-detail-hero__grid">
            <div>
              <span class="agent-detail-eyebrow" aria-hidden="true">
                <span class="material-symbols-outlined">${a.icon || 'smart_toy'}</span>
              </span>
              ${textNode('name', a.name || '', { editable, tag: 'h1', className: 'agent-detail-title', placeholder: '智能体名称' })}
              ${textNode('tagline', a.tagline || '', {
                editable,
                tag: 'p',
                className: 'agent-detail-tagline',
                multiline: true,
                placeholder: '详情副标题',
              })}
              <div class="agent-detail-hero__actions">
                <button type="button" class="site-header__btn site-header__btn--primary px-8 py-3"${editable ? '' : ' data-demo-modal-open'}>预约方案演示</button>
                <a href="../agents/#agent-matrix" class="site-header__btn site-header__btn--ghost px-8 py-3 inline-flex items-center justify-center"${tab}>返回矩阵</a>
              </div>
            </div>
            <div class="agent-detail-hero__icon" aria-hidden="true">
              ${
                editable || a.sceneImage
                  ? imgNode('sceneImage', a.sceneImage || '', { editable, className: 'agent-detail-hero__scene' })
                  : `<span class="material-symbols-outlined">${a.icon || 'smart_toy'}</span>`
              }
            </div>
          </div>
          <div class="agent-detail-metrics">
            ${metrics
              .map(
                (m, i) => `
              <div>
                ${textNode(`metrics.${i}.value`, m.value || '', { editable, tag: 'strong', placeholder: '指标' })}
                ${textNode(`metrics.${i}.label`, m.label || '', { editable, tag: 'span', placeholder: '说明' })}
              </div>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="py-20 bg-white">
        <div class="max-w-max-width mx-auto px-margin-desktop agent-detail-overview">
          <span class="agent-detail-section-kicker">能力概述</span>
          ${textNode('overview', a.overview || '', {
            editable,
            tag: 'p',
            multiline: true,
            placeholder: '详情概述',
          })}
        </div>
      </section>

      <section class="py-20 bg-surface-container-low">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <div class="agent-detail-section-head">
            <span class="agent-detail-section-kicker">Core Capabilities</span>
            <h2>核心能力</h2>
          </div>
          <div class="agent-detail-cap-grid">
            ${caps
              .map(
                (c, i) => `
              <article class="agent-detail-cap-card">
                <span class="material-symbols-outlined">${c.icon || 'check_circle'}</span>
                ${textNode(`capabilities.${i}.title`, c.title || '', { editable, tag: 'h3', placeholder: '能力标题' })}
                ${textNode(`capabilities.${i}.desc`, c.desc || '', {
                  editable,
                  tag: 'p',
                  multiline: true,
                  placeholder: '能力说明',
                })}
              </article>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="py-20 bg-white">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <div class="agent-detail-section-head">
            <span class="agent-detail-section-kicker">How It Works</span>
            <h2>运行机制</h2>
          </div>
          <div class="agent-detail-flow">
            ${steps
              .map(
                (w, i) => `
              <div class="agent-detail-flow__step">
                <div class="agent-detail-flow__index">${String(i + 1).padStart(2, '0')}</div>
                ${textNode(`workflow.${i}.title`, w.title || '', { editable, tag: 'h4', placeholder: '步骤' })}
                ${textNode(`workflow.${i}.desc`, w.desc || '', {
                  editable,
                  tag: 'p',
                  multiline: true,
                  placeholder: '说明',
                })}
              </div>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="py-20 bg-surface-container-low">
        <div class="max-w-max-width mx-auto px-margin-desktop">
          <div class="agent-detail-section-head">
            <span class="agent-detail-section-kicker">Scenarios</span>
            <h2>适用场景</h2>
          </div>
          <div class="agent-detail-scenarios">
            ${scenarios
              .map((s, i) =>
                textNode(`scenarios.${i}`, typeof s === 'string' ? s : '', {
                  editable,
                  tag: 'span',
                  className: 'agent-detail-scenario',
                  placeholder: '场景',
                })
              )
              .join('')}
          </div>
        </div>
      </section>
    </div>`
}

/** @param {object} agent @param {{ editable?: boolean }} [options] */
export function renderAgentDetail(agent, { editable = false } = {}) {
  if (!agent) return ''
  // 全部智能体统一使用空间服务详情页布局与后台可视化编辑
  return renderSpaceAgentDetail(agent, { editable })
}
