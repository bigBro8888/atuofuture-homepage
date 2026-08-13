import { AGENTS_OVERVIEW } from '../../data/agents-overview.js'
import { SHOW_TOKEN_ENTRY, TOKEN_SITE_URL } from '../../data/site-links.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 顶层业务目标 */
const BUSINESS_GOALS = [
  { id: 'visitor', label: '接待访客', icon: 'badge' },
  { id: 'meeting', label: '召开会议', icon: 'groups' },
  { id: 'exhibition', label: '运营展厅', icon: 'view_in_ar' },
  { id: 'energy', label: '降低能耗', icon: 'bolt' },
  { id: 'asset', label: '管理资产', icon: 'inventory_2' },
  { id: 'hospitality', label: '服务住客', icon: 'apartment' },
]

/** 八大智能体展示名（贴近设计稿） */
const AGENT_LABELS = {
  space: '空间服务',
  energy: '能源能耗',
  meeting: '会议',
  exhibition: '展厅',
  visitor: '访客接待',
  opc: '商业运营',
  hospitality: '酒店公寓',
  asset: '资产管理',
}

const HUB_STEPS = [
  { title: '读懂目标', icon: 'crisis_alert' },
  { title: '感知现场', icon: 'visibility' },
  { title: '自主判断', icon: 'psychology' },
  { title: '协调执行', icon: 'hub' },
  { title: '持续反馈', icon: 'sync' },
]

const RESOURCE_COLS = [
  {
    key: 'people',
    title: '人员与流程',
    icon: 'group',
    copy: '访客、员工、服务人员、审批与工单',
  },
  {
    key: 'systems',
    title: '业务系统',
    icon: 'dns',
    copy: '预约、访客、会议、能源、资产、运营',
  },
  {
    key: 'devices',
    title: '空间设备',
    icon: 'developer_board',
    copy: '门禁、电梯、大屏、灯光、空调、窗帘、传感器',
  },
]

const VALUE_ITEMS = [
  '任务自动完成',
  '现场状态可见',
  '设备协同运行',
  '异常及时处理',
  '运营持续优化',
]

function getAgent(selectedId) {
  return AGENTS_OVERVIEW.find((a) => a.id === selectedId) || AGENTS_OVERVIEW[0]
}

function renderHeader() {
  return `
    <header class="ag-eco__head">
      <h2>空间智能体，让业务目标在真实空间自动落地</h2>
    </header>`
}

function renderGoals(selectedId) {
  return `
    <div class="ag-eco__goals" aria-label="业务目标">
      ${BUSINESS_GOALS.map(
        (g) => `
        <button
          type="button"
          class="ag-eco__goal${g.id === selectedId ? ' is-selected' : ''}"
          data-ag-select="${esc(g.id)}"
          aria-pressed="${g.id === selectedId ? 'true' : 'false'}"
        >
          <span class="ag-eco__goal-icon" aria-hidden="true">
            <span class="material-symbols-outlined">${esc(g.icon)}</span>
          </span>
          <span class="ag-eco__goal-label">${esc(g.label)}</span>
        </button>`
      ).join('')}
    </div>`
}

function renderFlowDown() {
  return `
    <div class="ag-eco__flow-down" aria-hidden="true">
      <svg viewBox="0 0 1200 72" preserveAspectRatio="none">
        <path class="ag-eco__wave" d="M80 8 C200 58, 280 8, 400 40 C520 72, 600 20, 720 44 C840 68, 920 16, 1040 36 C1100 46, 1140 28, 1120 8" />
        <path class="ag-eco__wave ag-eco__wave--soft" d="M120 4 C240 50, 320 12, 440 36 C560 60, 640 18, 760 40 C880 62, 960 14, 1080 32" />
        <path class="ag-eco__dash" d="M600 40 v28" />
        <path class="ag-eco__dash-head" d="M594 62 l6 8 6-8" />
      </svg>
    </div>`
}

function renderAgentsPill(selectedId) {
  return `
    <div class="ag-eco__pill ag-eco__pill--agents">
      <div class="ag-eco__pill-side">八大空间智能体</div>
      <div class="ag-eco__agents" data-ag-eco>
        ${AGENTS_OVERVIEW.map((a) => {
          const on = a.id === selectedId
          return `
            <button
              type="button"
              class="ag-eco__agent${on ? ' is-selected' : ''}"
              data-ag-select="${esc(a.id)}"
              aria-pressed="${on ? 'true' : 'false'}"
            >
              <span class="ag-eco__agent-icon" aria-hidden="true">
                <span class="material-symbols-outlined">${esc(a.icon)}</span>
              </span>
              <span>${esc(AGENT_LABELS[a.id] || a.shortName)}</span>
            </button>`
        }).join('')}
      </div>
      <p class="ag-eco__pill-note">不同任务，由对应智能体全程负责</p>
    </div>`
}

function renderHubPill() {
  return `
    <div class="ag-eco__flow-mid" aria-hidden="true">
      <svg viewBox="0 0 40 40" width="20" height="40">
        <path class="ag-eco__dash" d="M20 2 v28" />
        <path class="ag-eco__dash-head" d="M14 24 l6 8 6-8" />
      </svg>
    </div>
    <div class="ag-eco__pill ag-eco__pill--hub">
      <div class="ag-eco__pill-side ag-eco__pill-side--light">智能体自主完成任务</div>
      <div class="ag-eco__hub-body">
        <ol class="ag-eco__steps">
          ${HUB_STEPS.map(
            (s, i) => `
            <li>
              <span class="ag-eco__step-icon" aria-hidden="true">
                <span class="material-symbols-outlined">${esc(s.icon)}</span>
              </span>
              <strong>${esc(s.title)}</strong>
              ${i < HUB_STEPS.length - 1 ? '<i class="ag-eco__step-arrow" aria-hidden="true"></i>' : ''}
            </li>`
          ).join('')}
        </ol>
        <p>根据现场变化，自动决定下一步做什么，并持续跟进直至任务完成</p>
      </div>
    </div>`
}

function renderResources() {
  return `
    <div class="ag-eco__resources">
      <div class="ag-eco__res-flow" aria-hidden="true">
        <svg viewBox="0 0 1200 56" preserveAspectRatio="none">
          <path class="ag-eco__dash" d="M220 4 v40" />
          <path class="ag-eco__dash" d="M600 4 v40" />
          <path class="ag-eco__dash" d="M980 4 v40" />
        </svg>
      </div>
      <div class="ag-eco__res-grid">
        ${RESOURCE_COLS.map(
          (col) => `
          <div class="ag-eco__res" data-layer="${esc(col.key)}">
            <span class="ag-eco__res-icon" aria-hidden="true">
              <span class="material-symbols-outlined">${esc(col.icon)}</span>
            </span>
            <h3>${esc(col.title)}</h3>
            <p>${esc(col.copy)}</p>
          </div>`
        ).join('')}
      </div>
      <div class="ag-eco__feedback" aria-hidden="true">
        <svg viewBox="0 0 220 120" fill="none">
          <path d="M40 20 C40 70, 160 70, 160 20" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 5"/>
          <path d="M152 28 l8-10 4 10" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <span>执行结果持续反馈，智能体自动调整</span>
      </div>
    </div>`
}

function renderValueBar() {
  return `
    <div class="ag-eco__value-stage">
      <div class="ag-eco__value-trap" aria-hidden="true">
        <svg viewBox="0 0 1200 140" preserveAspectRatio="none">
          <defs>
            <linearGradient id="agEcoTrapFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#F2F9FF" stop-opacity="0.98"/>
              <stop offset="45%" stop-color="#D2EBFF" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#A9D2F8" stop-opacity="0.85"/>
            </linearGradient>
            <linearGradient id="agEcoTrapEdge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#7EB4E8" stop-opacity="0.6"/>
            </linearGradient>
          </defs>
          <path
            d="M70 10 H1130 L1200 130 H0 Z"
            fill="url(#agEcoTrapFill)"
            stroke="url(#agEcoTrapEdge)"
            stroke-width="2"
          />
          <path
            d="M100 20 H1100"
            stroke="rgba(255,255,255,.8)"
            stroke-width="3"
            stroke-linecap="round"
            opacity=".85"
          />
        </svg>
      </div>
      <div class="ag-eco__value">
        <div class="ag-eco__value-cell ag-eco__value-cell--title">客户最终获得</div>
        <div class="ag-eco__value-cell ag-eco__value-cell--list">
          <ul class="ag-eco__value-list">
            ${VALUE_ITEMS.map(
              (item) => `
              <li>
                <span class="ag-eco__check" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.4" stroke="currentColor" stroke-width="1.15"/>
                    <path d="M5 8.15 7.05 10.1 11 5.8" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span>${esc(item)}</span>
              </li>`
            ).join('')}
          </ul>
        </div>
        <div class="ag-eco__value-cell ag-eco__value-cell--tag">少操作，更高效，更可靠</div>
      </div>
    </div>`
}

function renderFoot(selected) {
  return `
    <div class="ag-eco__foot">
      ${
        SHOW_TOKEN_ENTRY
          ? `<a class="ag-eco__token" href="${esc(TOKEN_SITE_URL)}" target="_blank" rel="noopener noreferrer" data-token-link>了解 AI Token</a>`
          : '<span></span>'
      }
      <button type="button" class="ag-eco__jump" data-ag-jump-story>
        <span data-ag-jump-label>查看「${esc(selected.name)}」如何完成一项真实任务</span>
        <svg class="ag-eco__jump-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
          <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
        </svg>
      </button>
    </div>`
}

/**
 * AgentEcosystemMap — 业务目标 → 八大智能体 → 自主执行 → 人/系统/设备 → 客户价值
 * @param {{ selectedId: string }} props
 */
export function renderAgentEcosystemMap({ selectedId }) {
  const selected = getAgent(selectedId)

  return `
    <section class="ag-eco" id="agent-ecosystem">
      <div class="ag-eco__shell">
        ${renderHeader()}
        ${renderGoals(selected.id)}
        ${renderFlowDown()}
        ${renderAgentsPill(selected.id)}
        ${renderHubPill()}
        ${renderResources()}
        ${renderValueBar()}
        ${renderFoot(selected)}
      </div>
    </section>`
}

export function syncAgentEcosystemMap(root, selectedId) {
  const selected = getAgent(selectedId)

  root.querySelectorAll('[data-ag-select]').forEach((btn) => {
    const on = btn.dataset.agSelect === selected.id
    btn.classList.toggle('is-selected', on)
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
  })

  const label = root.querySelector('[data-ag-jump-label]')
  if (label) label.textContent = `查看「${selected.name}」如何完成一项真实任务`
}
