import { AGENTS_OVERVIEW, AGENTS_HUB_LAYERS } from '../../data/agents-overview.js'
import { SHOW_TOKEN_ENTRY, TOKEN_SITE_URL } from '../../data/site-links.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function nodeMarkup(a, selectedId) {
  const on = a.id === selectedId
  return `
    <button
      type="button"
      class="ag-eco__node${on ? ' is-selected' : ''}"
      data-ag-select="${esc(a.id)}"
      data-ag-side="${esc(a.side)}"
      aria-pressed="${on ? 'true' : 'false'}"
    >
      <span class="ag-eco__icon" aria-hidden="true">
        <span class="material-symbols-outlined">${esc(a.icon)}</span>
      </span>
      <span class="ag-eco__copy">
        <strong>${esc(a.shortName)}</strong>
        <small>${esc(a.blurb)}</small>
      </span>
    </button>`
}

function curvesMarkup(selectedId) {
  const left = AGENTS_OVERVIEW.filter((a) => a.side === 'left')
  const right = AGENTS_OVERVIEW.filter((a) => a.side === 'right')
  const leftPaths = [
    'M 70 70 C 220 70, 340 180, 500 270',
    'M 70 190 C 230 190, 350 230, 500 270',
    'M 70 330 C 230 330, 350 300, 500 270',
    'M 70 450 C 220 450, 340 360, 500 270',
  ]
  const rightPaths = [
    'M 930 70 C 780 70, 660 180, 500 270',
    'M 930 190 C 770 190, 650 230, 500 270',
    'M 930 330 C 770 330, 650 300, 500 270',
    'M 930 450 C 780 450, 660 360, 500 270',
  ]
  const paths = [
    ...left.map((a, i) => ({ id: a.id, d: leftPaths[i] })),
    ...right.map((a, i) => ({ id: a.id, d: rightPaths[i] })),
  ]
  return `
    <svg class="ag-eco__svg" viewBox="0 0 1000 540" preserveAspectRatio="none" aria-hidden="true">
      ${paths
        .map(
          (p) => `
        <path
          class="ag-eco__link${p.id === selectedId ? ' is-active' : ''}"
          data-ag-link="${esc(p.id)}"
          d="${p.d}"
          fill="none"
        />`
        )
        .join('')}
    </svg>`
}

/**
 * AgentEcosystemMap
 * @param {{ selectedId: string }} props
 */
export function renderAgentEcosystemMap({ selectedId }) {
  const selected = AGENTS_OVERVIEW.find((a) => a.id === selectedId) || AGENTS_OVERVIEW[0]
  const left = AGENTS_OVERVIEW.filter((a) => a.side === 'left')
  const right = AGENTS_OVERVIEW.filter((a) => a.side === 'right')

  return `
    <section class="ag-eco" id="agent-ecosystem">
      <div class="ag-shell ag-shell--1280">
        <header class="ag-section-head">
          <h2>八大空间智能体，共同运营一个真实空间</h2>
          <p>每个智能体都能独立完成业务任务，也能共享空间状态、设备能力与业务数据，协同形成完整的空间运营闭环。</p>
        </header>

        <div class="ag-eco__canvas" data-ag-eco>
          ${curvesMarkup(selected.id)}
          <div class="ag-eco__col ag-eco__col--left">
            ${left.map((a) => nodeMarkup(a, selected.id)).join('')}
          </div>
          <div class="ag-eco__hub" aria-hidden="true">
            <span class="ag-eco__hub-ring"></span>
            <span class="material-symbols-outlined">hub</span>
            <strong>空间智能中枢</strong>
            <small>统一接收状态、调度智能体、调用系统与设备、回读任务结果</small>
          </div>
          <div class="ag-eco__col ag-eco__col--right">
            ${right.map((a) => nodeMarkup(a, selected.id)).join('')}
          </div>
        </div>

        <div class="ag-eco__layers">
          ${Object.entries(AGENTS_HUB_LAYERS)
            .map(
              ([key, layer]) => `
            <div class="ag-eco__layer" data-layer="${esc(key)}">
              <h3>${esc(layer.title)}</h3>
              <p>${esc(layer.items.join(' · '))}</p>
            </div>`
            )
            .join('')}
        </div>

        <div class="ag-eco__open">
          <span>开放能力：API · MCP · AI Token · 第三方协议</span>
          ${
            SHOW_TOKEN_ENTRY
              ? `<a href="${esc(TOKEN_SITE_URL)}" target="_blank" rel="noopener noreferrer" data-token-link>了解 AI Token</a>`
              : ''
          }
        </div>

        <button type="button" class="ag-eco__jump" data-ag-jump-story>
          <span data-ag-jump-label>查看「${esc(selected.name)}」如何完成任务</span>
          <span class="material-symbols-outlined" aria-hidden="true">south</span>
        </button>
      </div>
    </section>`
}

export function syncAgentEcosystemMap(root, selectedId) {
  const selected = AGENTS_OVERVIEW.find((a) => a.id === selectedId) || AGENTS_OVERVIEW[0]
  root.querySelectorAll('[data-ag-select]').forEach((btn) => {
    const on = btn.dataset.agSelect === selected.id
    btn.classList.toggle('is-selected', on)
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
  })
  root.querySelectorAll('[data-ag-link]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.agLink === selected.id)
  })
  const label = root.querySelector('[data-ag-jump-label]')
  if (label) label.textContent = `查看「${selected.name}」如何完成任务`
}
