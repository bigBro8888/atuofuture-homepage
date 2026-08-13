import { COMPANY_STATS } from '../data/company-stats.js'
import { PRODUCT_AGENTS } from '../data/product-agents.js'
import { SOLUTIONS } from '../data/solutions.js'
import { SHOW_TOKEN_ENTRY, TOKEN_SITE_URL } from '../data/site-links.js'
import '../styles/home-main.css'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function mountHomeMain(root) {
  if (!root) return
  root.innerHTML = `
    <section class="hm-stats" aria-label="实力证明">
      <div class="max-w-max-width mx-auto px-margin-desktop hm-stats__grid">
        ${COMPANY_STATS.map(
          (item) => `
          <article class="hm-stats__item">
            <strong>${esc(item.label)}</strong>
            <span>${esc(item.desc)}</span>
          </article>`
        ).join('')}
      </div>
    </section>

    <section class="hm-explain" id="what-is-agent">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sm-section-intro">
          <strong class="sm-kicker sm-kicker--blue">空间智能体</strong>
          <h2>它不只是回答问题，而是进入真实空间完成任务</h2>
          <p>普通AI助手主要提供信息与对话；安托未来的空间智能体能够感知物理环境、理解业务规则、调用业务系统、控制真实设备，并持续跟踪执行结果。</p>
        </div>
        <div class="hm-flow" aria-hidden="true">
          ${['感知', '理解', '决策', '执行', '反馈'].map((step) => `<span>${step}</span>`).join('<i></i>')}
        </div>
        <div class="hm-compare">
          <article><strong>普通AI助手</strong><p>提供回答</p></article>
          <article><strong>传统管理平台</strong><p>等待人工操作</p></article>
          <article class="is-accent"><strong>安托未来空间智能体</strong><p>主动感知、判断并执行</p></article>
        </div>
      </div>
    </section>

    <section class="hm-agents" id="home-agents">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sm-section-intro">
          <strong class="sm-kicker sm-kicker--ink">八大场景智能体</strong>
          <h2>按业务场景完成真实任务</h2>
          <p>每个智能体都说明解决什么问题、能完成什么任务、会联动哪些系统与设备。</p>
          <a href="agents/" class="sm-btn sm-btn--ghost">查看全部智能体</a>
        </div>
        <div class="hm-agent-grid">
          ${PRODUCT_AGENTS.map(
            (a) => `
            <article class="hm-agent-card">
              <span class="material-symbols-outlined" aria-hidden="true">${a.icon}</span>
              <h3>${esc(a.name)}</h3>
              <p><strong>解决问题</strong> ${esc(a.problem || a.summary)}</p>
              <p><strong>可完成任务</strong> ${(a.tasks || a.points).slice(0, 3).map(esc).join('；')}</p>
              <p><strong>联动系统与设备</strong> ${(a.systems || []).slice(0, 4).map(esc).join('、') || '业务系统与现场设备'}</p>
              <a href="agent-detail/?id=${a.id}">查看详情 →</a>
            </article>`
          ).join('')}
        </div>
      </div>
    </section>

    <section class="hm-industries" id="home-industries">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sm-section-intro">
          <strong class="sm-kicker sm-kicker--blue">行业解决方案</strong>
          <h2>匹配您的空间与行业</h2>
          <p>面向园区、楼宇、学校、酒店、公寓与商业资产，提供可规模交付的空间智能方案。</p>
          <a href="solutions/" class="sm-btn sm-btn--ghost">查看全部方案</a>
        </div>
        <div class="hm-industry-grid">
          ${SOLUTIONS.map(
            (s) => `
            <article class="hm-industry-card">
              <div class="hm-industry-card__media" style="background-image:url('${esc(s.image)}')"></div>
              <div class="hm-industry-card__body">
                <h3>${esc(s.name)}</h3>
                <p>${esc(s.value || s.summary)}</p>
                <ul>${s.scenarios.slice(0, 3).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
                <a href="solutions/?id=${s.id}">查看行业方案 →</a>
              </div>
            </article>`
          ).join('')}
        </div>
      </div>
    </section>

    <section class="hm-hardware" id="system-architecture">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sm-section-intro">
          <strong class="sm-kicker sm-kicker--ink">智能硬件与无线架构</strong>
          <h2>端、边、云协同，既能开放集成，也能本地闭环</h2>
          <p>自有终端、传感计量、无线网关、多功能网关、中控屏与音视频会议设备，连接空间智能中枢与第三方系统。</p>
        </div>
        <div class="hm-hw-arch" aria-hidden="true">
          <div><strong>终端设备</strong><span>开关 / 空调控制 / 桌牌 / 门锁</span></div>
          <div><strong>传感与计量</strong><span>毫米波 / 温湿度 / 水电表</span></div>
          <div><strong>网关与中控</strong><span>无线网关 / 多功能网关 / 中控屏</span></div>
          <div><strong>空间智能中枢</strong><span>智能体编排 · 开放接口</span></div>
          <div><strong>第三方系统</strong><span>API / MCP / 协议接入</span></div>
        </div>
        <p class="mt-6"><a class="sm-text-link sm-text-link--blue" href="hardware/">查看智能硬件体系 →</a></p>
      </div>
    </section>

    <section class="hm-delivery" id="home-delivery">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sm-section-intro">
          <strong class="sm-kicker sm-kicker--blue">团队与交付</strong>
          <h2>具备把方案落到现场的能力</h2>
          <p>真实客户案例将在确认后补充。当前先展示能力结构与交付流程，避免发布虚构项目数据。</p>
        </div>
        <div class="hm-delivery-grid">
          <article><strong>AI智能体与软件平台</strong><span>场景编排、业务闭环与开放接口</span></article>
          <article><strong>IoT与智能硬件</strong><span>无线接入、传感控制与中控汇聚</span></article>
          <article><strong>方案与实施</strong><span>规划、勘测、部署、联调与运维</span></article>
          <article><strong>完整交付流程</strong><span>从方案沟通到上线持续优化</span></article>
        </div>
        <p class="mt-6"><a class="sm-text-link sm-text-link--blue" href="about/#delivery">了解关于我们 →</a>
          ${SHOW_TOKEN_ENTRY ? ` · <a class="sm-text-link sm-text-link--blue" href="${TOKEN_SITE_URL}" target="_blank" rel="noopener noreferrer" data-token-link>AI Token 能力支撑</a>` : ''}
        </p>
      </div>
    </section>

    <section class="hm-cta">
      <div class="max-w-max-width mx-auto px-margin-desktop hm-cta__inner">
        <div>
          <h2>让空间智能真正进入业务现场</h2>
          <p>告诉我们您的空间类型和核心诉求，安托未来将为您提供针对性的智能体、硬件与系统架构建议。</p>
        </div>
        <div class="hm-cta__actions">
          <button type="button" class="sm-btn sm-btn--primary" data-demo-modal-open>预约方案演示</button>
          <a href="about/#contact" class="sm-btn sm-btn--outline sm-btn--dark">联系方案顾问</a>
        </div>
      </div>
    </section>
  `
}
