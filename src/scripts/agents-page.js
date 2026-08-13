import { PRODUCT_AGENTS } from '../data/product-agents.js'

export function initAgentsPage() {
  const grid = document.getElementById('agents-grid')
  if (!grid) return

  grid.innerHTML = PRODUCT_AGENTS.map(
    (a) => `
    <article class="sx-agent-card" data-agent-card>
      <div class="sx-agent-card__icon"><span class="material-symbols-outlined">${a.icon}</span></div>
      <h3>${a.name}</h3>
      <p>${a.summary}</p>
      <ul>
        <li><strong>解决问题：</strong>${a.problem || a.summary}</li>
        <li><strong>典型任务：</strong>${(a.tasks || a.points).slice(0, 2).join('；')}</li>
        <li><strong>联动：</strong>${(a.systems || []).slice(0, 3).join('、') || '业务系统与设备'}</li>
      </ul>
      <a href="../agent-detail/?id=${a.id}">查看详情 →</a>
    </article>`
  ).join('')
}
