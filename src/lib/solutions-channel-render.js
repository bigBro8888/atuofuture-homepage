/** 行业解决方案频道页渲染（列表；详情仍由 solutions-page.js 负责） */

import { esc, textNode, imgNode } from './vedit-nodes.js'
import { SOLUTIONS_BASE_NODES } from '../data/solutions.js'

function itemPath(index, field) {
  return `items.${index}.${field}`
}

function renderHero(hero, { editable }) {
  const banner = hero.bannerUrl || '/images/solutions/hero.jpg'
  const bgEdit = editable
    ? `<button type="button" class="hpi-edit-bg" data-edit-image="bannerUrl" data-edit-image-url="${esc(banner)}" title="更换 Banner">${banner ? '更换 Banner' : '添加 Banner'}</button>`
    : ''
  return `
    <section class="sol-home-hero" style="--sol-hero-image:url('${esc(banner)}')">
      <div class="sol-home-hero__media" aria-hidden="true"></div>
      <div class="sol-home-hero__shade" aria-hidden="true"></div>
      ${bgEdit}
      <div class="sol-home-shell sol-home-hero__inner">
        <div class="sol-home-hero__copy">
          ${textNode('title', hero.title || '', { editable, tag: 'h1', placeholder: '首屏标题' })}
          ${textNode('subtitle', hero.subtitle || '', { editable, tag: 'p', multiline: true, placeholder: '首屏说明' })}
          <div class="sol-home-hero__actions">
            <button type="button" class="sol-btn sol-btn--primary"${editable ? '' : ' data-demo-modal-open'}>
              ${textNode('ctaLabel', hero.ctaLabel || '预约方案演示', { editable, tag: 'span', placeholder: '主按钮' })}
            </button>
            <a class="sol-btn sol-btn--ghost" href="${editable ? '#' : '#sol-base'}"${editable ? ' tabindex="-1"' : ''}>了解整体架构</a>
          </div>
        </div>
      </div>
    </section>`
}

function renderEditableCards(solutions, resolveItemIndex) {
  return `
    <section class="sol-scene sol-scene--edit" id="sol-scene">
      <div class="sol-home-shell">
        <header class="sol-scene__head">
          <h2>选择您的行业场景</h2>
          <p class="sol-scene__edit-hint">以下卡片对应频道列表文案与封面；完整详情请到「内容中心 → 行业解决方案」编辑。</p>
        </header>
        <div class="sol-edit-grid">
          ${solutions
            .map((s) => {
              const itemIndex = resolveItemIndex(s.id)
              const canEdit = itemIndex >= 0
              return `
            <article class="sol-edit-card">
              <div class="sol-edit-card__media">
                ${
                  canEdit
                    ? imgNode(itemPath(itemIndex, 'imageUrl'), s.image || '', {
                        editable: true,
                        width: 1200,
                        height: 800,
                        alt: s.name,
                        loading: 'lazy',
                      })
                    : `<img src="${esc(s.image || '')}" alt="${esc(s.name)}" width="1200" height="800" loading="lazy" />`
                }
              </div>
              <div class="sol-edit-card__body">
                ${canEdit ? textNode(itemPath(itemIndex, 'title'), s.name || '', { editable: true, tag: 'h3', placeholder: '方案名称' }) : `<h3>${esc(s.name)}</h3>`}
                ${
                  canEdit
                    ? textNode(itemPath(itemIndex, 'summary'), s.value || s.summary || '', {
                        editable: true,
                        tag: 'p',
                        multiline: true,
                        placeholder: '一句话价值',
                      })
                    : `<p>${esc(s.value || s.summary || '')}</p>`
                }
                <span class="sol-scene__link">查看完整方案 →</span>
              </div>
            </article>`
            })
            .join('')}
        </div>
      </div>
    </section>`
}

function renderInteractiveScene(solutions, active) {
  return `
    <section class="sol-scene" id="sol-scene">
      <div class="sol-home-shell">
        <header class="sol-scene__head">
          <h2>选择您的行业场景</h2>
        </header>
        <div class="sol-scene__layout">
          <div class="sol-scene__nav" role="tablist" aria-label="行业场景">
            ${solutions
              .map((s) => {
                const on = s.id === active.id
                return `
              <button type="button" class="sol-scene__nav-item${on ? ' is-active' : ''}" role="tab" aria-selected="${on ? 'true' : 'false'}" data-sol-tab="${esc(s.id)}">
                <span class="material-symbols-outlined" aria-hidden="true">${esc(s.icon || 'apartment')}</span>
                <span class="sol-scene__nav-label">${esc(s.name)}</span>
                <span class="material-symbols-outlined sol-scene__nav-arrow" aria-hidden="true">arrow_forward</span>
              </button>`
              })
              .join('')}
          </div>
          <div class="sol-scene__stage" data-sol-scene style="--sol-scene-image:url('${esc(active.image || '')}')">
            <div class="sol-scene__shade" aria-hidden="true"></div>
            <div class="sol-scene__copy">
              <h3 data-sol-scene-name>${esc(active.name)}</h3>
              <p data-sol-scene-value>${esc(active.value || active.summary || '')}</p>
              <a class="sol-scene__link" data-sol-detail-link href="./?id=${esc(active.id)}">查看完整方案 →</a>
            </div>
          </div>
        </div>
      </div>
    </section>`
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
          ${(s.coreValues || [])
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

function renderBase(s, agentLabel) {
  return `
    <section class="sol-base" id="sol-base">
      <div class="sol-home-shell">
        <header class="sol-base__head">
          <h2>统一空间智能底座，组合不同的行业能力</h2>
          <p>不同空间面对的问题不同，但底层都需要完成感知、决策、执行与反馈。安托未来通过统一中枢，按行业组合智能体、硬件和开放接口。</p>
        </header>
        <div class="sol-base__flow" data-sol-base-flow>
          ${SOLUTIONS_BASE_NODES.map(
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
              ${index < SOLUTIONS_BASE_NODES.length - 1 ? '<div class="sol-base__arrow" aria-hidden="true"><span></span></div>' : ''}
            </div>`
          ).join('')}
        </div>
      </div>
    </section>`
}

function renderCta() {
  return `
    <section class="sol-cta">
      <div class="sol-home-shell sol-cta__inner">
        <div class="sol-cta__copy">
          <h2>找到适合您的空间智能方案</h2>
          <p>告诉我们您的行业、空间规模和核心问题，安托未来将为您组合合适的智能体、硬件与系统能力。</p>
          <div class="sol-cta__actions">
            <button type="button" class="sol-btn sol-btn--primary" data-demo-modal-open>预约方案演示</button>
            <a class="sol-btn sol-btn--ghost" href="../about/#contact">联系方案顾问</a>
          </div>
        </div>
        <div class="sol-cta__visual" aria-hidden="true" style="--sol-cta-image:url('/images/solutions/cta.jpg')"></div>
      </div>
    </section>`
}

/**
 * @param {{
 *   hero: object,
 *   solutions: object[],
 *   resolveItemIndex: (id: string) => number,
 *   agentLabel?: (id: string) => string,
 * }} model
 * @param {{ editable?: boolean }} options
 */
export function renderSolutionsChannel(model, { editable = false } = {}) {
  const {
    hero = {},
    solutions = [],
    resolveItemIndex = () => -1,
    agentLabel = (id) => id,
  } = model
  const active = solutions[0] || { id: '', name: '', value: '', image: '', coreValues: [], highlightAgents: [] }

  return `
<div class="sol-channel${editable ? ' sol-channel--editable hpi--editable' : ''}">
  ${renderHero(hero, { editable })}
  ${editable ? renderEditableCards(solutions, resolveItemIndex) : renderInteractiveScene(solutions, active)}
  ${editable ? '' : renderValues(active)}
  ${editable ? '' : renderBase(active, agentLabel)}
  ${editable ? '' : renderCta()}
</div>`
}
