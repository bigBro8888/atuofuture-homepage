/** 空间智能体频道页 · 可视化预览（首屏 + 八卡；生态图交互仍由前台 agents-page 负责） */

import { esc, textNode, imgNode } from './vedit-nodes.js'

function itemPath(index, field) {
  return `items.${index}.${field}`
}

function renderHero(hero, { editable }) {
  const banner = hero.bannerUrl || '/images/agents/hero-bleed.jpg'
  const bgEdit = editable
    ? `<button type="button" class="hpi-edit-bg" data-edit-image="bannerUrl" data-edit-image-url="${esc(banner)}" title="更换 Banner">${banner ? '更换 Banner' : '添加 Banner'}</button>`
    : ''
  return `
    <section class="ag-hero">
      <div class="ag-hero__bg" aria-hidden="true">
        <img src="${esc(banner)}" alt="" width="1920" height="1080" decoding="async"${editable ? '' : ' fetchpriority="high"'} />
      </div>
      ${bgEdit}
      <div class="ag-shell ag-hero__content">
        <div class="ag-hero__copy">
          ${textNode('title', hero.title || '', { editable, tag: 'h1', placeholder: '首屏标题' })}
          ${textNode('subtitle', hero.subtitle || '', { editable, tag: 'p', multiline: true, placeholder: '首屏说明' })}
          <div class="ag-hero__actions">
            <a class="ag-btn ag-btn--primary" href="${editable ? '#' : '#agent-ecosystem'}"${editable ? ' tabindex="-1"' : ''}>探索八大智能体</a>
            <button type="button" class="ag-btn ag-btn--ghost"${editable ? '' : ' data-demo-modal-open'}>
              ${textNode('ctaLabel', hero.ctaLabel || '预约方案演示', { editable, tag: 'span', placeholder: '主按钮' })}
            </button>
          </div>
        </div>
      </div>
    </section>`
}

function renderAgentCards(agents, resolveItemIndex, { editable }) {
  return `
    <section class="ag-edit-matrix" id="agent-ecosystem">
      <div class="ag-shell">
        <header class="ag-section-head">
          <h2>八大空间智能体</h2>
          <p>${editable ? '点名称、简介与图片直接改；详情页正文请到「内容中心 → 空间智能体」编辑。' : '从生态图进入各智能体详情。'}</p>
        </header>
        <div class="ag-edit-grid">
          ${agents
            .map((agent) => {
              const itemIndex = resolveItemIndex(agent.id)
              const canEdit = editable && itemIndex >= 0
              const href = editable ? '#' : `../agent-detail/?id=${encodeURIComponent(agent.id)}`
              return `
            <a class="ag-edit-card" href="${esc(href)}"${editable ? ' tabindex="-1"' : ''}>
              <span class="ag-edit-card__media">
                ${
                  canEdit
                    ? imgNode(itemPath(itemIndex, 'imageUrl'), agent.sceneImage || '', {
                        editable: true,
                        width: 960,
                        height: 600,
                        alt: agent.name,
                        loading: 'lazy',
                      })
                    : `<img src="${esc(agent.sceneImage || '')}" alt="${esc(agent.name)}" width="960" height="600" loading="lazy" />`
                }
              </span>
              <span class="ag-edit-card__body">
                ${canEdit ? textNode(itemPath(itemIndex, 'title'), agent.name || '', { editable: true, tag: 'strong', placeholder: '智能体名称' }) : `<strong>${esc(agent.name)}</strong>`}
                ${
                  canEdit
                    ? textNode(itemPath(itemIndex, 'summary'), agent.blurb || '', {
                        editable: true,
                        tag: 'small',
                        multiline: true,
                        placeholder: '简介',
                      })
                    : `<small>${esc(agent.blurb || '')}</small>`
                }
                <em>查看详情</em>
              </span>
            </a>`
            })
            .join('')}
        </div>
      </div>
    </section>`
}

/**
 * @param {{
 *   hero: object,
 *   agents: object[],
 *   resolveItemIndex: (id: string) => number,
 * }} model
 * @param {{ editable?: boolean }} options
 */
export function renderAgentsChannel(model, { editable = false } = {}) {
  const { hero = {}, agents = [], resolveItemIndex = () => -1 } = model
  return `
<div class="ag-channel${editable ? ' ag-channel--editable hpi--editable' : ''}">
  ${renderHero(hero, { editable })}
  ${renderAgentCards(agents, resolveItemIndex, { editable })}
</div>`
}
