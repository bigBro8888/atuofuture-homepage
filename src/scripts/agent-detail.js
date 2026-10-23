import { AGENT_DETAILS, AGENT_ORDER, applyAgentsLibraryCms, resolveAgentId } from '../data/agents-detail.js'
import { applyAgentsOverviewCms } from '../data/agents-overview.js'
import { applyProductAgentsCms } from '../data/product-agents.js'
import { renderAgentDetail } from '../lib/agent-detail-render.js'
import { mountOnlineVideosIn } from '../lib/online-video.js'
import { loadAgentsLibraryContent } from '../services/site-settings-api.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function getAgentId() {
  const params = new URLSearchParams(window.location.search)
  return resolveAgentId(params.get('id'))
}

function renderNotFound(rawId) {
  document.title = '未找到该智能体 | 安托未来'
  return `
    <section class="pb-16 pt-8">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <nav class="agent-detail-breadcrumb mb-8">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="../agents/">空间智能体</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>未找到</span>
        </nav>
        <div class="sx-sol-detail__panel">
          <h1>未找到该智能体</h1>
          <p>链接参数${rawId ? ` “${esc(rawId)}”` : ''}无效或已下线。请返回智能体矩阵重新选择。</p>
          <p class="mt-6"><a class="sx-text-link" href="../agents/">← 返回空间智能体矩阵</a></p>
        </div>
      </div>
    </section>`
}

function renderRelated(currentId) {
  return AGENT_ORDER.filter((id) => id !== currentId)
    .slice(0, 3)
    .map((id) => {
      const a = AGENT_DETAILS[id]
      return `
        <a class="agent-detail-related__card" href="./?id=${id}" style="--accent: ${a.accent}">
          <span class="material-symbols-outlined">${a.icon}</span>
          <div>
            <strong>${esc(a.name)}</strong>
          </div>
          <span class="material-symbols-outlined agent-detail-related__arrow">arrow_forward</span>
        </a>`
    })
    .join('')
}

export async function initAgentDetail() {
  const mount = document.getElementById('agent-detail')
  if (!mount) return
  const library = await loadAgentsLibraryContent()
  applyAgentsLibraryCms(library)
  applyAgentsOverviewCms(library)
  applyProductAgentsCms(library)

  const rawId = new URLSearchParams(window.location.search).get('id')
  const id = getAgentId()
  if (!id) {
    mount.innerHTML = renderNotFound(rawId)
    return
  }

  const a = { ...AGENT_DETAILS[id], id }
  document.title = `${a.name} | 安托未来`
  mount.style.setProperty('--accent', a.accent)

  if (id === 'space') {
    mount.innerHTML = renderAgentDetail({ ...a, _layout: 'space' })
    mountOnlineVideosIn(mount)
    return
  }

  mount.innerHTML = `
    ${renderAgentDetail(a)}
    <section class="py-20 bg-white">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="agent-detail-section-head">
          <span class="agent-detail-section-kicker">More Agents</span>
          <h2>探索其它智能体</h2>
        </div>
        <div class="agent-detail-related">${renderRelated(id)}</div>
      </div>
    </section>`
}
