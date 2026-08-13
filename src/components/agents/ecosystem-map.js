import { AGENTS_OVERVIEW, AGENTS_HUB_LAYERS } from '../../data/agents-overview.js'
import { SHOW_TOKEN_ENTRY, TOKEN_SITE_URL } from '../../data/site-links.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** EcosystemHeader */
function renderEcosystemHeader() {
  return `
    <header class="ag-eco__head">
      <h2>八大空间智能体，共同运营一个真实空间</h2>
      <p>每个智能体都能独立完成业务任务，也能共享空间状态、设备能力与业务数据，协同形成完整的空间运营闭环。</p>
    </header>`
}

/** AgentNode */
function renderAgentNode(a, selectedId) {
  const on = a.id === selectedId
  return `
    <button
      type="button"
      class="ag-eco__node${on ? ' is-selected' : ' is-dim'}"
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

/** IntelligenceHub */
function renderIntelligenceHub() {
  return `
    <div class="ag-eco__hub is-lit" data-ag-hub>
      <svg class="ag-eco__orbits" viewBox="0 0 280 280" aria-hidden="true">
        <circle class="ag-eco__orbit ag-eco__orbit--1" cx="140" cy="140" r="98" pathLength="100" />
        <circle class="ag-eco__orbit ag-eco__orbit--2" cx="140" cy="140" r="118" pathLength="100" />
        <circle class="ag-eco__orbit ag-eco__orbit--3" cx="140" cy="140" r="136" pathLength="100" />
      </svg>
      <div class="ag-eco__hub-core">
        <span class="material-symbols-outlined" aria-hidden="true">hub</span>
        <strong>空间智能中枢</strong>
        <small>统一接收状态、调度智能体、调用系统与设备、回读任务结果</small>
      </div>
      <span class="ag-eco__hub-tag ag-eco__hub-tag--a">状态接入</span>
      <span class="ag-eco__hub-tag ag-eco__hub-tag--b">任务调度</span>
      <span class="ag-eco__hub-tag ag-eco__hub-tag--c">结果回读</span>
    </div>`
}

/** EcosystemConnections */
function renderEcosystemConnections(selectedId) {
  const left = AGENTS_OVERVIEW.filter((a) => a.side === 'left')
  const right = AGENTS_OVERVIEW.filter((a) => a.side === 'right')
  const ys = [48, 128, 208, 288]
  const leftPaths = ys.map((y) => `M 248 ${y} C 320 ${y}, 390 180, 500 180`)
  const rightPaths = ys.map((y) => `M 752 ${y} C 680 ${y}, 610 180, 500 180`)
  const paths = [
    ...left.map((a, i) => ({ id: a.id, d: leftPaths[i] })),
    ...right.map((a, i) => ({ id: a.id, d: rightPaths[i] })),
  ]
  return `
    <svg class="ag-eco__svg" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">
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
      <line class="ag-eco__spine-line" x1="500" y1="252" x2="500" y2="360" />
    </svg>`
}

const LAYER_ICONS = {
  software: 'dns',
  hardware: 'developer_board',
  ecosystem: 'hub',
}

/** CapabilityAccessLayer */
function renderCapabilityAccessLayer() {
  return `
    <div class="ag-eco__access">
      ${Object.entries(AGENTS_HUB_LAYERS)
        .map(
          ([key, layer]) => `
        <div class="ag-eco__layer" data-layer="${esc(key)}">
          <span class="material-symbols-outlined" aria-hidden="true">${LAYER_ICONS[key] || 'widgets'}</span>
          <div>
            <h3>${esc(layer.title)}</h3>
            <p>${esc(layer.items.join(' · '))}</p>
          </div>
        </div>`
        )
        .join('')}
    </div>`
}

/** AgentTaskLink */
function renderAgentTaskLink(selected) {
  return `
    <div class="ag-eco__foot">
      <div class="ag-eco__open">
        <span>开放能力：API · MCP · AI Token · 第三方协议</span>
        ${
          SHOW_TOKEN_ENTRY
            ? `<a href="${esc(TOKEN_SITE_URL)}" target="_blank" rel="noopener noreferrer" data-token-link>了解 AI Token
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>
              </a>`
            : ''
        }
      </div>
      <button type="button" class="ag-eco__jump" data-ag-jump-story>
        <span data-ag-jump-label>查看「${esc(selected.name)}」如何完成任务</span>
        <svg class="ag-eco__jump-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
        </svg>
      </button>
    </div>`
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
        ${renderEcosystemHeader()}
        <div class="ag-eco__board" data-ag-eco>
          <div class="ag-eco__board-top">
            <div>
              <h3>空间智能体运行全景</h3>
              <p>状态统一接入 · 任务智能调度 · 系统设备执行 · 结果持续回读</p>
            </div>
            <span class="ag-eco__live" aria-hidden="true"><i></i>协同运行中</span>
          </div>

          <div class="ag-eco__stage">
            ${renderEcosystemConnections(selected.id)}
            <div class="ag-eco__col ag-eco__col--left">
              ${left.map((a) => renderAgentNode(a, selected.id)).join('')}
            </div>
            ${renderIntelligenceHub()}
            <div class="ag-eco__col ag-eco__col--right">
              ${right.map((a) => renderAgentNode(a, selected.id)).join('')}
            </div>
          </div>

          <div class="ag-eco__bridge" aria-hidden="true"></div>
          ${renderCapabilityAccessLayer()}
          ${renderAgentTaskLink(selected)}
        </div>
      </div>
    </section>`
}

export function syncAgentEcosystemMap(root, selectedId) {
  const selected = AGENTS_OVERVIEW.find((a) => a.id === selectedId) || AGENTS_OVERVIEW[0]
  const board = root.querySelector('[data-ag-eco]')
  board?.classList.toggle('has-selection', Boolean(selected))

  root.querySelectorAll('[data-ag-select]').forEach((btn) => {
    const on = btn.dataset.agSelect === selected.id
    btn.classList.toggle('is-selected', on)
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
    btn.classList.toggle('is-dim', !on)
  })

  root.querySelectorAll('[data-ag-link]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.agLink === selected.id)
  })

  root.querySelector('[data-ag-hub]')?.classList.add('is-lit')

  const label = root.querySelector('[data-ag-jump-label]')
  if (label) label.textContent = `查看「${selected.name}」如何完成任务`
}
