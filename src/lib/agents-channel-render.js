/** 空间智能体频道页 · 与前台同构预览（生态图 / 任务故事 / CTA） */

import { AGENTS_CAPABILITY_CHAIN } from '../data/agents-overview.js'
import { esc, textNode } from './vedit-nodes.js'
import {
  renderAgentEcosystemMap,
  layoutAgentOrbitLinks,
  syncAgentEcosystemMap,
} from '../components/agents/ecosystem-map.js'
import {
  renderAgentTaskStory,
  syncAgentTaskStory,
} from '../components/agents/task-story.js'

function clampOverlay(value, fallback = 100) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(100, Math.round(n)))
}

function renderHero(hero, { editable }) {
  const banner = hero.bannerUrl || '/images/agents/hero-bleed.jpg'
  const overlay = clampOverlay(hero.bannerOverlay, 100)
  const overlayCss = (overlay / 100).toFixed(2)
  const bgEdit = editable
    ? `<button type="button" class="hpi-edit-bg" data-edit-image="bannerUrl" data-edit-image-url="${esc(banner)}" title="更换 Banner">${banner ? '更换 Banner' : '添加 Banner'}</button>`
    : ''
  const overlayCtrl = editable
    ? `<label class="ag-hero__overlay-ctrl" title="调整 Banner 蒙版透明度">
        <span>蒙版</span>
        <input type="range" min="0" max="100" step="1" value="${overlay}" data-agents-banner-overlay />
        <em data-agents-banner-overlay-value>${overlay}%</em>
      </label>`
    : ''
  return `
    <section class="ag-hero" style="--ag-hero-overlay:${overlayCss}" data-banner-overlay="${overlay}">
      <div class="ag-hero__bg" aria-hidden="true">
        <img src="${esc(banner)}" alt="" width="1920" height="1080" decoding="async"${editable ? '' : ' fetchpriority="high"'} />
      </div>
      ${bgEdit}
      ${overlayCtrl}
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
        <ol class="ag-chain" aria-label="能力链">
          ${AGENTS_CAPABILITY_CHAIN.map(
            (step, i) => `
            <li>
              <span class="ag-chain__dot" aria-hidden="true">
                <span class="material-symbols-outlined">${esc(step.icon)}</span>
              </span>
              <strong>${esc(step.title)}</strong>
              ${i < AGENTS_CAPABILITY_CHAIN.length - 1 ? '<i class="ag-chain__line" aria-hidden="true"></i>' : ''}
            </li>`
          ).join('')}
        </ol>
      </div>
    </section>`
}

function renderCta({ editable }) {
  return `
    <section class="ag-cta">
      <div class="ag-shell ag-cta__inner">
        <div>
          <h2>让空间智能体进入您的业务现场</h2>
          <p>从一个场景开始，连接现有系统和设备，逐步构建可感知、可执行、可持续运营的空间智能体系。</p>
        </div>
        <div class="ag-cta__actions">
          <button type="button" class="ag-btn ag-btn--primary"${editable ? '' : ' data-demo-modal-open'}>预约方案演示</button>
          <a class="ag-btn ag-btn--ghost" href="${editable ? '#' : '../solutions/'}"${editable ? ' tabindex="-1"' : ''}>查看行业解决方案</a>
        </div>
      </div>
    </section>`
}

function renderEditableAgentStrip(agents, resolveItemIndex) {
  return `
    <section class="ag-edit-strip">
      <div class="ag-shell">
        <header class="ag-section-head">
          <h2>任务故事 · 场景图</h2>
          <p>生态图八块的名称、简介、跳转请在上方卡片直接改；此处只换任务故事场景图。详情正文请到「内容中心 → 空间智能体」。</p>
        </header>
        <div class="ag-edit-grid">
          ${agents
            .map((agent) => {
              const itemIndex = resolveItemIndex(agent.id)
              if (itemIndex < 0) return ''
              return `
            <div class="ag-edit-card" data-ag-edit-card="${esc(agent.id)}">
              <span class="ag-edit-card__media">
                <button type="button" class="hpi-edit-img" data-edit-image="items.${itemIndex}.imageUrl" data-edit-image-url="${esc(agent.sceneImage || '')}" title="更换场景图">
                  ${agent.sceneImage ? `<img src="${esc(agent.sceneImage)}" alt="${esc(agent.name)}" width="960" height="600" loading="lazy" />` : '<span class="hpi-edit-img__tip is-visible">添加图片</span>'}
                  <span class="hpi-edit-img__tip">更换图片</span>
                </button>
              </span>
              <span class="ag-edit-card__body">
                <strong>${esc(agent.name || '')}</strong>
                <small>${esc(agent.blurb || '')}</small>
              </span>
            </div>`
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
 *   selectedAgent?: string,
 * }} model
 * @param {{ editable?: boolean }} options
 */
export function renderAgentsChannel(model, { editable = false } = {}) {
  const {
    hero = {},
    agents = [],
    resolveItemIndex = () => -1,
    orderIds = agents.map((agent) => agent.id).filter(Boolean),
    selectedAgent = agents[0]?.id || 'space',
  } = model

  return `
<div class="ag-channel${editable ? ' ag-channel--editable hpi--editable' : ''}" data-ag-channel>
  ${renderHero(hero, { editable })}
  ${renderAgentEcosystemMap({ selectedId: selectedAgent, editable, resolveItemIndex, orderIds })}
  ${renderAgentTaskStory({ selectedId: selectedAgent })}
  ${renderCta({ editable })}
  ${editable ? renderEditableAgentStrip(agents, resolveItemIndex) : ''}
</div>`
}

/** 预览画布挂载后：排线 + 点选切换（与前台一致） */
export function bindAgentsChannelPreview(root, { selectedAgent } = {}) {
  if (!root) return { selectedAgent }

  const state = {
    selectedAgent: selectedAgent || root.querySelector('[data-ag-select].is-selected')?.dataset.agSelect || 'space',
  }

  layoutAgentOrbitLinks(root)

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-edit-link], [data-edit-path], [data-edit-image]')) return
    const agentBtn = event.target.closest('[data-ag-select]')
    if (agentBtn && root.contains(agentBtn)) {
      event.preventDefault()
      const id = agentBtn.dataset.agSelect
      if (!id || id === state.selectedAgent) return
      state.selectedAgent = id
      syncAgentEcosystemMap(root, id)
      syncAgentTaskStory(root, id)
      return
    }

    if (event.target.closest('[data-ag-jump-story]')) {
      event.preventDefault()
      root.querySelector('#agent-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })

  const onResize = () => layoutAgentOrbitLinks(root)
  window.addEventListener('resize', onResize)

  return {
    get selectedAgent() {
      return state.selectedAgent
    },
    destroy() {
      window.removeEventListener('resize', onResize)
    },
  }
}
