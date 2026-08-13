import { AGENTS_OVERVIEW } from '../../data/agents-overview.js'
import { SHOW_TOKEN_ENTRY, TOKEN_SITE_URL } from '../../data/site-links.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 展示用短描述（按编号顺序，不改动共享数据源） */
const AGENT_LINES = {
  space: '控制环境、设备与空间服务',
  energy: '分析能耗并执行节能策略',
  meeting: '自动运行会议全流程',
  exhibition: '编排内容、讲解与空间氛围',
  visitor: '协同邀约、通行与接待',
  opc: '连接展示、带看与签约',
  hospitality: '管理入住、授权与计费',
  asset: '掌握资产位置与流转',
}

const HUB_ACTIONS = ['感知现场', '理解场景', '调度任务', '调用执行', '持续回读']

const CONNECT_LAYERS = [
  {
    key: 'software',
    title: '软件系统',
    copy: '会议、访客、工单、资产、能耗与运营系统',
  },
  {
    key: 'hardware',
    title: '智能硬件',
    copy: '传感器、中控屏、网关、开关、空调与门锁',
  },
  {
    key: 'ecosystem',
    title: '第三方生态',
    copy: '门禁、音视频、KNX、BUS及第三方业务平台',
  },
]

function renderHeader() {
  return `
    <header class="ag-eco__head">
      <h2>八大智能体，共享同一个空间智能中枢</h2>
      <p>它们不是八套孤立应用，而是共享空间状态、设备能力与业务数据，在同一中枢中协同感知、判断、执行并持续反馈。</p>
    </header>`
}

function renderAgentItem(a, index, selectedId) {
  const on = a.id === selectedId
  const num = String(index + 1).padStart(2, '0')
  const line = AGENT_LINES[a.id] || a.blurb
  return `
    <button
      type="button"
      class="ag-eco__item${on ? ' is-selected' : ''}"
      data-ag-select="${esc(a.id)}"
      aria-pressed="${on ? 'true' : 'false'}"
    >
      <span class="ag-eco__num">${num}</span>
      <span class="ag-eco__item-body">
        <strong>${esc(a.shortName)}</strong>
        <small>${esc(line)}</small>
      </span>
    </button>`
}

function renderAgentGrid(selectedId) {
  return `
    <div class="ag-eco__layer ag-eco__layer--agents">
      <h3 class="ag-eco__label">面向真实业务的八大智能体</h3>
      <div class="ag-eco__grid" data-ag-eco>
        ${AGENTS_OVERVIEW.map((a, i) => renderAgentItem(a, i, selectedId)).join('')}
      </div>
    </div>`
}

function renderHubBand() {
  return `
    <div class="ag-eco__spine" aria-hidden="true"></div>
    <div class="ag-eco__hub">
      <div class="ag-eco__hub-copy">
        <h3>空间智能中枢</h3>
        <p>统一接收空间状态，理解业务场景，调度智能体并调用系统与设备。</p>
      </div>
      <ul class="ag-eco__actions" aria-label="中枢核心动作">
        ${HUB_ACTIONS.map((label) => `<li>${esc(label)}</li>`).join('')}
      </ul>
    </div>
    <div class="ag-eco__spine" aria-hidden="true"></div>`
}

function renderConnectLayer() {
  return `
    <div class="ag-eco__layer ag-eco__layer--connect">
      <h3 class="ag-eco__label">连接并执行</h3>
      <div class="ag-eco__connect">
        ${CONNECT_LAYERS.map(
          (layer) => `
          <div class="ag-eco__connect-col" data-layer="${esc(layer.key)}">
            <h4>${esc(layer.title)}</h4>
            <p>${esc(layer.copy)}</p>
          </div>`
        ).join('')}
      </div>
      <div class="ag-eco__open">
        <span>开放能力：API · MCP · AI Token · 第三方协议</span>
        ${
          SHOW_TOKEN_ENTRY
            ? `<a href="${esc(TOKEN_SITE_URL)}" target="_blank" rel="noopener noreferrer" data-token-link>了解 AI Token</a>`
            : ''
        }
      </div>
    </div>`
}

function renderTaskLink(selected) {
  return `
    <button type="button" class="ag-eco__jump" data-ag-jump-story>
      <span data-ag-jump-label>查看「${esc(selected.name)}」如何完成一项真实任务</span>
      <svg class="ag-eco__jump-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
        <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
      </svg>
    </button>`
}

/**
 * AgentEcosystemMap — 编辑式三层结构（业务智能体 → 中枢 → 连接真实世界）
 * @param {{ selectedId: string }} props
 */
export function renderAgentEcosystemMap({ selectedId }) {
  const selected = AGENTS_OVERVIEW.find((a) => a.id === selectedId) || AGENTS_OVERVIEW[0]

  return `
    <section class="ag-eco" id="agent-ecosystem">
      <div class="ag-eco__shell">
        ${renderHeader()}
        ${renderAgentGrid(selected.id)}
        ${renderHubBand()}
        ${renderConnectLayer()}
        ${renderTaskLink(selected)}
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

  const label = root.querySelector('[data-ag-jump-label]')
  if (label) label.textContent = `查看「${selected.name}」如何完成一项真实任务`
}
