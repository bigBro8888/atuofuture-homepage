import { PRODUCT_AGENTS } from '../data/product-agents.js'

export function initAgentsPage() {
  const grid = document.getElementById('agents-grid')
  if (!grid) return

  grid.innerHTML = PRODUCT_AGENTS.map(
    (a) => `
    <article class="sx-agent-card" data-agent-card>
      <div class="sx-agent-card__icon"><span class="material-symbols-outlined">${a.icon}</span></div>
      <small>${a.kicker}</small>
      <h3>${a.name}</h3>
      <p>${a.summary}</p>
      <ul>${a.points.map((p) => `<li>${p}</li>`).join('')}</ul>
      <a href="../agent-detail/?id=${a.id}">查看详情 →</a>
    </article>`
  ).join('')
}
