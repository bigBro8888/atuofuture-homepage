import { SOLUTIONS, getSolution } from '../data/solutions.js'
import { getProductAgent } from '../data/product-agents.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderList() {
  return `
    <section class="pb-8">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sx-sol-list">
          ${SOLUTIONS.map(
            (s) => `
            <article class="sx-sol-list__card">
              <div class="sx-sol-list__media" style="background-image:url('${s.image}')"></div>
              <div class="sx-sol-list__body">
                <h3>${esc(s.name)}</h3>
                <p>${esc(s.summary)}</p>
                <div class="sx-tags">${s.canDo.slice(0, 3).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
                <p><a class="sx-text-link" href="./?id=${s.id}">查看方案 →</a></p>
              </div>
            </article>`
          ).join('')}
        </div>
      </div>
    </section>`
}

function renderDetail(id) {
  const s = getSolution(id)
  document.title = `${s.name} | 安托未来`
  return `
    <section class="pb-8">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <nav class="agent-detail-breadcrumb mb-8">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="./">行业解决方案</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>${esc(s.name)}</span>
        </nav>
        <div class="sx-sol-list__media mb-8" style="height:280px;background-image:url('${s.image}')"></div>
        <div class="sx-section-head">
          <span>SOLUTION</span>
          <h2>${esc(s.name)}</h2>
          <p>${esc(s.summary)}</p>
        </div>
        <div class="sx-sol-detail">
          <div class="sx-sol-detail__panel">
            <h2>能做什么</h2>
            <ul>${s.canDo.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </div>
          <div class="sx-sol-detail__panel">
            <h2>联动智能体</h2>
            <ul>
              ${s.agents
                .map((aid) => {
                  const a = getProductAgent(aid)
                  return `<li><a class="sx-text-link" href="../agent-detail/?id=${a.id}">${esc(a.name)}</a></li>`
                })
                .join('')}
            </ul>
            <p class="mt-6"><a class="sx-text-link" href="./">← 返回方案列表</a></p>
          </div>
        </div>
      </div>
    </section>`
}

export function initSolutionsPage() {
  const root = document.getElementById('solutions-root')
  if (!root) return
  const id = new URLSearchParams(window.location.search).get('id')
  root.innerHTML = id && SOLUTIONS.some((s) => s.id === id) ? renderDetail(id) : renderList()
}
