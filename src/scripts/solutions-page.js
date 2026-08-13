import { SOLUTIONS, resolveSolutionId } from '../data/solutions.js'
import { getProductAgent } from '../data/product-agents.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderList() {
  document.title = '行业解决方案 | 安托未来'
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
                <p>${esc(s.value || s.summary)}</p>
                <div class="sx-tags">${s.scenarios.slice(0, 3).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
                <p><a class="sx-text-link" href="./?id=${s.id}">查看行业方案 →</a></p>
              </div>
            </article>`
          ).join('')}
        </div>
      </div>
    </section>`
}

function renderDetail(id) {
  const s = SOLUTIONS.find((item) => item.id === id)
  if (!s) return renderList()
  document.title = `${s.name} | 安托未来`
  return `
    <section class="pb-12">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <nav class="agent-detail-breadcrumb mb-8">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="./">行业解决方案</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>${esc(s.name)}</span>
        </nav>

        <div class="sx-sol-list__media mb-8" style="height:280px;background-image:url('${s.image}')" role="img" aria-label="${esc(s.name)}"></div>

        <div class="sx-section-head">
          <h1>${esc(s.name)}</h1>
          <p>${esc(s.summary)}</p>
        </div>

        <div class="sx-sol-detail" style="margin-bottom:28px">
          <div class="sx-sol-detail__panel">
            <h2>行业定位与主要问题</h2>
            <p>${esc(s.value)}</p>
            <ul>${(s.pains || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </div>
          <div class="sx-sol-detail__panel">
            <h2>安托未来解决思路</h2>
            <p>${esc(s.approach)}</p>
          </div>
        </div>

        <div class="sx-sol-detail" style="margin-bottom:28px">
          <div class="sx-sol-detail__panel">
            <h2>典型业务场景</h2>
            <ul>${s.scenarios.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </div>
          <div class="sx-sol-detail__panel">
            <h2>客户旅程</h2>
            <ul>${(s.journey || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="sx-sol-detail" style="margin-bottom:28px">
          <div class="sx-sol-detail__panel">
            <h2>调用的场景智能体</h2>
            <ul>
              ${s.agents
                .map((aid) => {
                  const a = getProductAgent(aid)
                  if (!a) return ''
                  return `<li><a class="sx-text-link" href="../agent-detail/?id=${a.id}">${esc(a.name)}</a></li>`
                })
                .join('')}
            </ul>
          </div>
          <div class="sx-sol-detail__panel">
            <h2>连接的硬件与系统</h2>
            <ul>${(s.hardware || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
            <p class="mt-4">支持开放接口与分层自治：上层协同、边缘与终端可本地闭环。</p>
          </div>
        </div>

        <div class="sx-sol-detail__panel">
          <h2>项目实施与下一步</h2>
          <p>从方案评估、现场勘测、设备部署、联调上线到运维优化，安托未来提供可规模复制的交付路径。真实案例数据将在确认后补充展示。</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <button type="button" class="site-header__btn site-header__btn--primary" data-demo-modal-open>预约方案演示</button>
            <a class="site-header__btn site-header__btn--ghost" href="./">返回方案列表</a>
          </div>
        </div>
      </div>
    </section>`
}

export function initSolutionsPage() {
  const root = document.getElementById('solutions-root')
  if (!root) return
  const raw = new URLSearchParams(window.location.search).get('id')
  const id = resolveSolutionId(raw)
  root.innerHTML = id ? renderDetail(id) : renderList()
}
