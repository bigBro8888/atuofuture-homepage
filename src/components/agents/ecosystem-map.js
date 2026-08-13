import { AGENTS_OVERVIEW } from '../../data/agents-overview.js'
import { SHOW_TOKEN_ENTRY, TOKEN_SITE_URL } from '../../data/site-links.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 每个智能体对应的自然语言意图示例 */
const AGENT_INTENTS = {
  space: ['明天有重要客户来访，提前把空间准备好。', '会议室准备好。', '下班后自动进入节能模式。'],
  energy: ['今天能耗偏高，找出空耗并降下来。', '空闲区域自动进入节能。', '下班后自动进入节能模式。'],
  meeting: ['下午三点开董事会，会议室提前就绪。', '会议室准备好。', '会后自动关闭设备并释放房间。'],
  exhibition: ['有参观团到展厅，按脚本讲解。', '切换大屏内容和灯光氛围。', '参观结束后自动复位展项。'],
  visitor: ['明天下午接待一批重要客户。', '访客到访后自动通行并通知接待人。', '离场后回收临时权限。'],
  opc: ['有客户预约带看这间可招商空间。', '把展示、带看和签约串起来。', '线索转化进度持续跟进。'],
  hospitality: ['办理入住并下发门锁权限。', '客房设备按入住场景准备好。', '退房后自动计费并复位房态。'],
  asset: ['这批资产今天要完成盘点。', '查清资产当前位置。', '借还调拨全程可追溯。'],
}

/** 结果侧状态标签 */
const AGENT_OUTCOMES = {
  space: ['环境已按场景调节', '设备联动完成', '异常已转工单', '任务完成后自动收尾'],
  energy: ['空耗已识别', '节能策略已下发', '末端执行已回读', '任务完成后自动收尾'],
  meeting: ['会议室提前就绪', '中控音视频已启动', '权限与桌牌已同步', '会后自动收尾'],
  exhibition: ['讲解脚本已启动', '大屏内容已切换', '灯光展项已联动', '任务完成后自动收尾'],
  visitor: ['访客顺利通行', '接待人已通知', '会面空间已准备', '离场后权限失效'],
  opc: ['资源已上架', '带看已安排', '签约流程已推进', '运营状态持续回读'],
  hospitality: ['房间已分配', '门锁权限已下发', '客房场景已就绪', '退房后自动复位'],
  asset: ['台账已更新', '位置已确认', '流转已记录', '异常已闭环处理'],
}

const AGENT_SECONDARY_IMAGE = {
  space: '/images/agents/meeting.jpg',
  energy: '/images/agents/space.jpg',
  meeting: '/images/agents/visitor.jpg',
  exhibition: '/images/agents/meeting.jpg',
  visitor: '/images/agents/meeting.jpg',
  opc: '/images/solutions/commercial.jpg',
  hospitality: '/images/solutions/hotel.jpg',
  asset: '/images/agents/space.jpg',
}

const HUB_STEPS = ['看懂需求', '判断现场', '协调资源', '处理变化']

function getAgent(selectedId) {
  return AGENTS_OVERVIEW.find((a) => a.id === selectedId) || AGENTS_OVERVIEW[0]
}

function renderHeader() {
  return `
    <header class="ag-eco__head">
      <h2>告诉它想完成什么，空间智能体就会替你做完</h2>
      <p>不必先搞懂系统架构。你提出业务目标，智能体理解意图、结合现场状态，自动协调系统与设备，把事情准备好。</p>
    </header>`
}

function renderIntentColumn(agent) {
  const intents = AGENT_INTENTS[agent.id] || AGENT_INTENTS.space
  return `
    <div class="ag-eco__col ag-eco__col--intent">
      <div class="ag-eco__person" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="14" r="7" stroke="#071A33" stroke-width="1.6"/>
          <path d="M8 34c2.2-7 7-10.5 12-10.5S29.8 27 32 34" stroke="#071A33" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </div>
      <h3>告诉它，你想完成什么</h3>
      <ul class="ag-eco__intents" data-ag-intents>
        ${intents.map((line) => `<li>「${esc(line)}」</li>`).join('')}
      </ul>
    </div>`
}

function renderHubColumn() {
  return `
    <div class="ag-eco__col ag-eco__col--hub">
      <div class="ag-eco__hub">
        <h3>空间智能体</h3>
        <p class="ag-eco__hub-lead">理解目标，结合现场状态，自主安排整个执行过程</p>
        <ul class="ag-eco__steps" aria-label="智能体如何处理">
          ${HUB_STEPS.map((s) => `<li>${esc(s)}</li>`).join('')}
        </ul>
        <p class="ag-eco__hub-foot">自动协调访客、门禁、电梯、会议室、大屏、灯光与空调</p>
      </div>
    </div>`
}

function renderResultColumn(agent) {
  const outcomes = AGENT_OUTCOMES[agent.id] || AGENT_OUTCOMES.space
  const secondary = AGENT_SECONDARY_IMAGE[agent.id] || '/images/agents/meeting.jpg'
  return `
    <div class="ag-eco__col ag-eco__col--result">
      <h3>事情已经准备好</h3>
      <div class="ag-eco__photos" data-ag-photos>
        <img data-ag-photo-a src="${esc(agent.sceneImage)}" alt="" width="640" height="400" loading="lazy" decoding="async" />
        <img data-ag-photo-b src="${esc(secondary)}" alt="" width="640" height="400" loading="lazy" decoding="async" />
      </div>
      <ul class="ag-eco__outcomes" data-ag-outcomes aria-label="执行结果">
        ${outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}
      </ul>
    </div>`
}

function renderFlowArrow(label) {
  return `
    <div class="ag-eco__arrow" aria-hidden="true">
      <span>${esc(label)}</span>
      <svg width="56" height="12" viewBox="0 0 56 12" fill="none">
        <path d="M0 6h50" stroke="#C5CED8" stroke-width="1.2"/>
        <path d="M46 1.5 54 6l-8 4.5" stroke="#C5CED8" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>
    </div>`
}

function renderFlow(agent) {
  return `
    <div class="ag-eco__flow" data-ag-eco>
      ${renderIntentColumn(agent)}
      ${renderFlowArrow('智能体接管任务')}
      ${renderHubColumn()}
      ${renderFlowArrow('系统与设备自动响应')}
      ${renderResultColumn(agent)}
      <div class="ag-eco__loop" aria-hidden="true">
        <svg class="ag-eco__loop-line" viewBox="0 0 1000 48" preserveAspectRatio="none">
          <path d="M820 8 C820 36, 500 44, 500 44 C500 44, 180 36, 180 8" fill="none" stroke="#00D5BE" stroke-width="1.4"/>
          <path d="M172 14 180 8 188 14" fill="none" stroke="#00D5BE" stroke-width="1.4" stroke-linejoin="round"/>
        </svg>
        <span>现场状态持续反馈，出现变化时自动调整</span>
      </div>
    </div>`
}

function renderClosing(selectedId) {
  return `
    <div class="ag-eco__closing">
      <p class="ag-eco__punch">智能体不是让你多操作一个系统，而是替你完成一项工作。</p>
      <div class="ag-eco__domains" aria-label="八大业务智能体">
        ${AGENTS_OVERVIEW.map(
          (a) => `
          <button
            type="button"
            class="ag-eco__domain${a.id === selectedId ? ' is-selected' : ''}"
            data-ag-select="${esc(a.id)}"
            aria-pressed="${a.id === selectedId ? 'true' : 'false'}"
          >${esc(a.shortName)}</button>`
        ).join('<span class="ag-eco__dot" aria-hidden="true">·</span>')}
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
 * AgentEcosystemMap — 意图 → 接管 → 结果就绪
 * @param {{ selectedId: string }} props
 */
export function renderAgentEcosystemMap({ selectedId }) {
  const selected = getAgent(selectedId)

  return `
    <section class="ag-eco" id="agent-ecosystem">
      <div class="ag-eco__shell">
        ${renderHeader()}
        ${renderFlow(selected)}
        ${renderClosing(selected.id)}
        ${renderTaskLink(selected)}
      </div>
    </section>`
}

export function syncAgentEcosystemMap(root, selectedId) {
  const selected = getAgent(selectedId)
  const intents = AGENT_INTENTS[selected.id] || AGENT_INTENTS.space
  const outcomes = AGENT_OUTCOMES[selected.id] || AGENT_OUTCOMES.space
  const secondary = AGENT_SECONDARY_IMAGE[selected.id] || '/images/agents/meeting.jpg'

  root.querySelectorAll('[data-ag-select]').forEach((btn) => {
    const on = btn.dataset.agSelect === selected.id
    btn.classList.toggle('is-selected', on)
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
  })

  const intentList = root.querySelector('[data-ag-intents]')
  if (intentList) {
    intentList.innerHTML = intents.map((line) => `<li>「${esc(line)}」</li>`).join('')
  }

  const outcomeList = root.querySelector('[data-ag-outcomes]')
  if (outcomeList) {
    outcomeList.innerHTML = outcomes.map((o) => `<li>${esc(o)}</li>`).join('')
  }

  const photoA = root.querySelector('[data-ag-photo-a]')
  const photoB = root.querySelector('[data-ag-photo-b]')
  if (photoA) photoA.src = selected.sceneImage
  if (photoB) photoB.src = secondary

  const label = root.querySelector('[data-ag-jump-label]')
  if (label) label.textContent = `查看「${selected.name}」如何完成一项真实任务`
}
