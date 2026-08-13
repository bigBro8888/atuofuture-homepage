import { AGENTS_OVERVIEW } from '../../data/agents-overview.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 八大智能体展示文案（对齐设计稿） */
const AGENT_COPY = {
  space: {
    title: '空间服务智能体',
    desc: '空调照明、工单与信息发布统一调度',
  },
  energy: {
    title: '能源能耗智能体',
    desc: '分项计量与有无人节能分析',
  },
  meeting: {
    title: '会议智能体',
    desc: '预约签到、中控与音视频联动',
  },
  exhibition: {
    title: '展厅智能体',
    desc: '大屏、孪生、讲解与展项状态',
  },
  visitor: {
    title: '访客接待智能体',
    desc: '邀约登记、通行与接待编排',
  },
  opc: {
    title: '商业空间运营智能体',
    desc: '空间发布、带看、签约与运营协同',
  },
  hospitality: {
    title: '酒店公寓智能体',
    desc: '分房、门锁、客房与费用管理',
  },
  asset: {
    title: '资产管理智能体',
    desc: '盘点、领用借还与生命周期',
  },
}

/** 左右环绕中心的智能体顺序 */
const AGENT_LEFT_IDS = ['space', 'meeting', 'visitor', 'hospitality']
const AGENT_RIGHT_IDS = ['energy', 'exhibition', 'opc', 'asset']

const HUB_STEPS = [
  { title: '读懂目标', icon: 'track_changes' },
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

function renderAgentButton(a, selectedId) {
  const on = a.id === selectedId
  const copy = AGENT_COPY[a.id] || { title: a.name, desc: a.blurb }
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
      <span class="ag-eco__agent-copy">
        <strong>${esc(copy.title)}</strong>
        <small>${esc(copy.desc)}</small>
      </span>
    </button>`
}

function renderOrbitSlot(a, selectedId, side, row) {
  return `
    <div class="ag-eco__orbit-slot ag-eco__orbit-slot--${side}" style="--orbit-row:${row}">
      ${renderAgentButton(a, selectedId)}
    </div>`
}

function renderAgentsOrbit(selectedId) {
  const left = AGENT_LEFT_IDS.map((id) => AGENTS_OVERVIEW.find((a) => a.id === id)).filter(Boolean)
  const right = AGENT_RIGHT_IDS.map((id) => AGENTS_OVERVIEW.find((a) => a.id === id)).filter(Boolean)
  const linkIds = [...left, ...right].map((a) => a.id)

  return `
    <div class="ag-eco__orbit" data-ag-eco>
      <svg class="ag-eco__orbit-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        ${linkIds
          .map(
            (id) => `
          <path
            class="ag-eco__orbit-link${id === selectedId ? ' is-active' : ''}"
            data-ag-link="${esc(id)}"
            d=""
            fill="none"
          />`
          )
          .join('')}
      </svg>
      ${left.map((a, i) => renderOrbitSlot(a, selectedId, 'left', i + 1)).join('')}
      <div class="ag-eco__orbit-core" aria-hidden="true">
        <span>八大空间智能体</span>
      </div>
      ${right.map((a, i) => renderOrbitSlot(a, selectedId, 'right', i + 1)).join('')}
    </div>`
}

/** 按实际节点位置绘制中心圆到各智能体的连线 */
export function layoutAgentOrbitLinks(root) {
  const orbit = root.querySelector('.ag-eco__orbit')
  const svg = orbit?.querySelector('.ag-eco__orbit-svg')
  const core = orbit?.querySelector('.ag-eco__orbit-core')
  if (!orbit || !svg || !core) return
  if (getComputedStyle(svg).display === 'none') return

  const ob = orbit.getBoundingClientRect()
  if (ob.width < 8 || ob.height < 8) return

  const cb = core.getBoundingClientRect()
  const cx = (cb.left + cb.right) / 2 - ob.left
  const cy = (cb.top + cb.bottom) / 2 - ob.top
  const cr = Math.min(cb.width, cb.height) / 2 - 1

  svg.setAttribute('viewBox', `0 0 ${ob.width} ${ob.height}`)
  svg.setAttribute('width', String(ob.width))
  svg.setAttribute('height', String(ob.height))

  orbit.querySelectorAll('[data-ag-select]').forEach((btn) => {
    const path = svg.querySelector(`[data-ag-link="${CSS.escape(btn.dataset.agSelect)}"]`)
    if (!path) return
    const bb = btn.getBoundingClientRect()
    const midY = (bb.top + bb.bottom) / 2 - ob.top
    const towardRight = (bb.left + bb.right) / 2 - ob.left < cx
    const ex = towardRight ? bb.right - ob.left + 2 : bb.left - ob.left - 2
    const ey = midY
    const dx = ex - cx
    const dy = ey - cy
    const len = Math.hypot(dx, dy) || 1
    const sx = cx + (dx / len) * cr
    const sy = cy + (dy / len) * cr
    const mx = sx + (ex - sx) * 0.55
    const my = sy + (ey - sy) * 0.55
    path.setAttribute(
      'd',
      `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`
    )
  })
}

function renderHubPill() {
  return `
    <div class="ag-eco__flow-mid" aria-hidden="true">
      <svg viewBox="0 0 40 40" width="20" height="40">
        <path class="ag-eco__dash" d="M20 2 v28" />
        <path class="ag-eco__dash-head" d="M14 24 l6 8 6-8" />
      </svg>
    </div>
    <div class="ag-eco__hub-capsule">
      <div class="ag-eco__hub-title">智能体自主完成任务</div>
      <div class="ag-eco__hub-divider" aria-hidden="true"></div>
      <div class="ag-eco__hub-main">
        <ol class="ag-eco__steps">
          ${HUB_STEPS.map(
            (s, i) => `
            <li>
              <span class="ag-eco__step-icon" aria-hidden="true">
                <span class="material-symbols-outlined">${esc(s.icon)}</span>
              </span>
              <strong>${esc(s.title)}</strong>
              ${
                i < HUB_STEPS.length - 1
                  ? `<span class="ag-eco__step-arrow" aria-hidden="true">
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5h10.5M8.5 1.5 12.5 5 8.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>`
                  : ''
              }
            </li>`
          ).join('')}
        </ol>
        <p class="ag-eco__hub-desc">根据现场变化，自动决定下一步做什么，并持续跟进直至任务完成</p>
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
        ${renderAgentsOrbit(selected.id)}
        ${renderHubPill()}
        ${renderResources()}
        ${renderValueBar()}
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

  root.querySelectorAll('[data-ag-link]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.agLink === selected.id)
  })

  layoutAgentOrbitLinks(root)
}
