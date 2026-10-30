import { AGENTS_ORBIT_DEFAULT_IDS, AGENTS_OVERVIEW } from '../../data/agents-overview.js'
import { textNode } from '../../lib/vedit-nodes.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function agentHref(a) {
  const raw = String(a?.detailUrl || '').trim()
  if (raw) return raw
  return `/agent-detail/?id=${encodeURIComponent(a?.id || '')}`
}

function resolveOrbitColumns(orderIds) {
  const preferred = (
    Array.isArray(orderIds) && orderIds.length
      ? orderIds
      : AGENTS_OVERVIEW.map((agent) => agent.id)
  )
    .map((id) => String(id || '').trim())
    .filter(Boolean)
  const seen = new Set()
  const ordered = []
  for (const id of [...preferred, ...AGENTS_ORBIT_DEFAULT_IDS]) {
    if (seen.has(id)) continue
    const agent = AGENTS_OVERVIEW.find((row) => row.id === id)
    if (!agent) continue
    seen.add(id)
    ordered.push(agent)
  }
  return {
    left: ordered.slice(0, 4),
    right: ordered.slice(4, 8),
  }
}

const HUB_STEPS = [
  { title: '读懂目标', icon: 'track_changes' },
  { title: '感知现场', icon: 'visibility' },
  { title: '自主判断', icon: 'psychology' },
  { title: '协调执行', icon: 'hub' },
  { title: '持续反馈', icon: 'sync' },
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

function renderAgentButton(a, selectedId, { editable = false, itemIndex = -1 } = {}) {
  const on = a.id === selectedId
  const href = agentHref(a)
  const copy =
    editable && itemIndex >= 0
      ? `<span class="ag-eco__agent-copy">
        ${textNode(`items.${itemIndex}.title`, a.name || '', { editable: true, tag: 'strong', placeholder: '智能体名称' })}
        ${textNode(`items.${itemIndex}.summary`, a.blurb || '', {
          editable: true,
          tag: 'small',
          multiline: true,
          placeholder: '简介',
        })}
        <button type="button" class="ag-eco__agent-link-edit" data-edit-link data-edit-href-path="items.${itemIndex}.href" data-edit-href="${esc(href)}" title="设置跳转链接">
          <span class="material-symbols-outlined" aria-hidden="true">link</span>
          <em data-edit-link-label>${esc(href || '设置链接')}</em>
        </button>
      </span>`
      : `<span class="ag-eco__agent-copy">
        <strong>${esc(a.name || '')}</strong>
        <small>${esc(a.blurb || '')}</small>
      </span>`

  if (editable) {
    return `
    <div
      class="ag-eco__agent ag-eco__agent--editable${on ? ' is-selected' : ''}"
      data-ag-select="${esc(a.id)}"
      role="button"
      tabindex="0"
      aria-pressed="${on ? 'true' : 'false'}"
    >
      <button type="button" class="ag-eco__agent-drag" data-ag-drag-handle draggable="true" title="拖拽排序" aria-label="拖拽排序">
        <span class="material-symbols-outlined" aria-hidden="true">drag_indicator</span>
      </button>
      <span class="ag-eco__agent-icon" aria-hidden="true">
        <span class="material-symbols-outlined">${esc(a.icon)}</span>
      </span>
      ${copy}
    </div>`
  }

  return `
    <a
      class="ag-eco__agent${on ? ' is-selected' : ''}"
      href="${esc(href)}"
      data-ag-select="${esc(a.id)}"
      aria-pressed="${on ? 'true' : 'false'}"
    >
      <span class="ag-eco__agent-icon" aria-hidden="true">
        <span class="material-symbols-outlined">${esc(a.icon)}</span>
      </span>
      ${copy}
    </a>`
}

function renderOrbitSlot(a, selectedId, side, row, options = {}) {
  return `
    <div class="ag-eco__orbit-slot ag-eco__orbit-slot--${side}" style="--orbit-row:${row}" data-ag-orbit-slot data-ag-orbit-side="${side}" data-ag-orbit-id="${esc(a.id)}">
      ${renderAgentButton(a, selectedId, options)}
    </div>`
}

function renderAgentsOrbit(selectedId, { editable = false, resolveItemIndex = () => -1, orderIds } = {}) {
  const { left, right } = resolveOrbitColumns(orderIds)
  const linkIds = [...left, ...right].map((a) => a.id)
  const slotOpts = (a) => ({
    editable,
    itemIndex: typeof resolveItemIndex === 'function' ? resolveItemIndex(a.id) : -1,
  })

  return `
    <div class="ag-eco__orbit" data-ag-eco${editable ? ' data-ag-orbit-sortable' : ''}>
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
      ${left.map((a, i) => renderOrbitSlot(a, selectedId, 'left', i + 1, slotOpts(a))).join('')}
      <div class="ag-eco__orbit-core" aria-hidden="true">
        <span>八大空间智能体</span>
      </div>
      ${right.map((a, i) => renderOrbitSlot(a, selectedId, 'right', i + 1, slotOpts(a))).join('')}
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

/**
 * AgentEcosystemMap — 业务目标 → 八大智能体 → 自主执行
 * @param {{ selectedId: string, editable?: boolean, resolveItemIndex?: (id: string) => number, orderIds?: string[] }} props
 */
export function renderAgentEcosystemMap({ selectedId, editable = false, resolveItemIndex, orderIds } = {}) {
  const selected = getAgent(selectedId)

  return `
    <section class="ag-eco" id="agent-ecosystem">
      <div class="ag-eco__shell">
        ${renderHeader()}
        ${renderAgentsOrbit(selected.id, { editable, resolveItemIndex, orderIds })}
        ${renderHubPill()}
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
