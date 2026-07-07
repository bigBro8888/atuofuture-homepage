/** 订单 / 结算页：根据 URL 参数渲染套餐订阅、Token 充值或方案报价订单 */

const PLANS = {
  starter: {
    name: '入门版套餐',
    quota: '50 万 Token / 月',
    monthly: 999,
    annual: 9590,
    features: ['LLM + 语音基础能力', '单空间接入', '标准 SLA 支持'],
  },
  standard: {
    name: '标准版套餐',
    quota: '500 万 Token / 月',
    monthly: 4999,
    annual: 47990,
    features: ['全模态能力调用', '最多 5 个空间节点', '用量看板与告警', '专属客户成功经理'],
  },
  flagship: {
    name: '旗舰版套餐',
    quota: '千万级 Token 池',
    custom: true,
    features: ['私有化部署可选', '多租户治理与审计', '专属模型路由优化', '7×24 技术支持'],
  },
}

const CAP_LABEL = { text: '文本推理', vision: '视觉识别', voice: '语音交互' }
const CALC_RATE = { text: 0.024, vision: 0.028, voice: 0.018 }
const TOKENS_PER_YUAN = 900
const AMOUNT_OPTIONS = [500, 2000, 10000, 50000]

const PAYMENTS = [
  { id: 'wechat', label: '微信支付', icon: 'qr_code_2' },
  { id: 'alipay', label: '支付宝', icon: 'account_balance_wallet' },
  { id: 'bank', label: '对公转账', icon: 'account_balance' },
]

const state = {
  kind: 'plan',
  planId: 'standard',
  billing: 'monthly',
  amount: 2000,
  calc: { text: 0, vision: 0, voice: 0 },
  payment: 'wechat',
}

function money(n) {
  return '¥' + Math.round(n).toLocaleString('zh-CN')
}

function esc(s = '') {
  return String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
}

function readParams() {
  const p = new URLSearchParams(window.location.search)
  const type = p.get('type')
  if (type === 'topup') {
    state.kind = 'topup'
    const amt = Number(p.get('amount'))
    if (AMOUNT_OPTIONS.includes(amt)) state.amount = amt
    else if (amt > 0) state.amount = amt
  } else if (type === 'calc') {
    state.kind = 'calc'
    state.calc = {
      text: Number(p.get('text')) || 0,
      vision: Number(p.get('vision')) || 0,
      voice: Number(p.get('voice')) || 0,
    }
  } else {
    state.kind = 'plan'
    const plan = p.get('plan')
    if (PLANS[plan]) state.planId = plan
    if (p.get('billing') === 'annual') state.billing = 'annual'
  }
}

/* ---------- 计算 ---------- */
function computeOrder() {
  if (state.kind === 'plan') {
    const plan = PLANS[state.planId]
    if (plan.custom) {
      return {
        custom: true,
        title: plan.name,
        spec: plan.quota,
        lines: [{ label: plan.name, sub: '定制方案', price: '待报价' }],
        subtotal: null,
        discount: 0,
        total: null,
      }
    }
    const isAnnual = state.billing === 'annual'
    const subtotal = isAnnual ? plan.annual : plan.monthly
    const original = isAnnual ? plan.monthly * 12 : plan.monthly
    const discount = isAnnual ? original - plan.annual : 0
    return {
      title: plan.name,
      spec: plan.quota,
      lines: [
        {
          label: plan.name,
          sub: isAnnual ? '年付订阅（12 个月）' : '月付订阅',
          price: money(subtotal),
        },
      ],
      original: isAnnual ? original : null,
      subtotal: original,
      discount,
      total: subtotal,
    }
  }

  if (state.kind === 'topup') {
    const amt = state.amount
    let bonusRate = 0
    if (amt >= 50000) bonusRate = 0.1
    else if (amt >= 10000) bonusRate = 0.08
    else if (amt >= 5000) bonusRate = 0.05
    else if (amt >= 2000) bonusRate = 0.03
    const baseTokens = amt * TOKENS_PER_YUAN
    const bonusTokens = Math.round(baseTokens * bonusRate)
    return {
      title: 'Token 充值',
      spec: `到账约 ${((baseTokens + bonusTokens) / 10000).toLocaleString('zh-CN', { maximumFractionDigits: 0 })} 万 Token`,
      lines: [
        { label: 'Token 充值', sub: `基础 ${(baseTokens / 10000).toLocaleString('zh-CN')} 万 Token`, price: money(amt) },
        ...(bonusTokens
          ? [{ label: '充值赠送', sub: `+${(bonusTokens / 10000).toLocaleString('zh-CN', { maximumFractionDigits: 1 })} 万 Token`, price: '免费', free: true }]
          : []),
      ],
      subtotal: amt,
      discount: 0,
      total: amt,
      tokens: baseTokens + bonusTokens,
    }
  }

  // calc
  const lines = []
  let total = 0
  let totalWan = 0
  Object.keys(CALC_RATE).forEach((k) => {
    const wan = state.calc[k]
    if (!wan) return
    const cost = (wan * 10000) / 1000 * CALC_RATE[k]
    total += cost
    totalWan += wan
    lines.push({ label: CAP_LABEL[k], sub: `${wan} 万 Token / 月`, price: money(cost) })
  })
  if (!lines.length) lines.push({ label: '按量方案', sub: '请调整用量', price: money(0) })
  return {
    title: '按量用量方案',
    spec: `合计约 ${totalWan} 万 Token / 月`,
    lines,
    subtotal: total,
    discount: 0,
    total,
  }
}

/* ---------- 渲染 ---------- */
function renderConfigurator() {
  if (state.kind === 'plan') {
    const plan = PLANS[state.planId]
    if (plan.custom) {
      return `
        <div class="order-config">
          <h3>方案说明</h3>
          <p class="order-config__note">旗舰版为定制方案，提交需求后专属顾问将于 1 个工作日内与您联系，提供专属报价与私有化部署评估。</p>
          <ul class="order-feature-list">${plan.features.map((f) => `<li><span class="material-symbols-outlined">check_circle</span>${f}</li>`).join('')}</ul>
        </div>`
    }
    return `
      <div class="order-config">
        <h3>计费周期</h3>
        <div class="order-billing">
          <button type="button" data-order-billing="monthly" class="${state.billing === 'monthly' ? 'is-active' : ''}">
            <strong>按月付费</strong><span>${money(plan.monthly)} / 月</span>
          </button>
          <button type="button" data-order-billing="annual" class="${state.billing === 'annual' ? 'is-active' : ''}">
            <strong>按年付费 <em>省 20%</em></strong><span>${money(plan.annual)} / 年</span>
          </button>
        </div>
        <ul class="order-feature-list">${plan.features.map((f) => `<li><span class="material-symbols-outlined">check_circle</span>${f}</li>`).join('')}</ul>
      </div>`
  }

  if (state.kind === 'topup') {
    return `
      <div class="order-config">
        <h3>选择充值金额</h3>
        <div class="order-amounts">
          ${AMOUNT_OPTIONS.map(
            (a) => `<button type="button" data-order-amount="${a}" class="${state.amount === a ? 'is-active' : ''}">${money(a)}</button>`
          ).join('')}
        </div>
        <label class="order-custom-amount">
          <span>自定义金额（¥）</span>
          <input type="number" min="100" step="100" value="${state.amount}" data-order-custom/>
        </label>
        <p class="order-config__note">充值金额越高，赠送 Token 比例越高，最高额外赠送 10%。余额永久有效，可用于全模态按量调用。</p>
      </div>`
  }

  return `
    <div class="order-config">
      <h3>用量方案明细</h3>
      <p class="order-config__note">以下为估算方案，可返回上一页调整滑块。开通后按实际用量结算，套餐配额优先抵扣。</p>
      <ul class="order-feature-list">
        ${Object.keys(CALC_RATE)
          .map((k) => `<li><span class="material-symbols-outlined">check_circle</span>${CAP_LABEL[k]} · ${state.calc[k] || 0} 万 Token / 月</li>`)
          .join('')}
      </ul>
    </div>`
}

function renderSummary() {
  const o = computeOrder()
  const linesHtml = o.lines
    .map(
      (l) => `
      <div class="order-summary__line">
        <div><span>${esc(l.label)}</span><small>${esc(l.sub)}</small></div>
        <strong class="${l.free ? 'order-summary__free' : ''}">${esc(l.price)}</strong>
      </div>`
    )
    .join('')

  let totalsHtml
  if (o.custom) {
    totalsHtml = `
      <div class="order-summary__total">
        <span>应付总额</span>
        <strong>待报价</strong>
      </div>`
  } else {
    totalsHtml = `
      ${o.original && o.discount ? `<div class="order-summary__row"><span>原价</span><del>${money(o.original)}</del></div>` : ''}
      ${o.discount ? `<div class="order-summary__row order-summary__row--discount"><span>优惠</span><span>- ${money(o.discount)}</span></div>` : ''}
      <div class="order-summary__total">
        <span>应付总额</span>
        <strong>${money(o.total)}</strong>
      </div>
      <p class="order-summary__tax">${state.kind === 'plan' && state.billing === 'annual' ? '已按年付价格结算 · ' : ''}价格已含 6% 增值税</p>`
  }

  return `
    <div class="order-summary__head">
      <span class="material-symbols-outlined">receipt_long</span>
      <div><strong>${esc(o.title)}</strong><small>${esc(o.spec)}</small></div>
    </div>
    <div class="order-summary__lines">${linesHtml}</div>
    ${totalsHtml}
    <button type="button" class="order-submit">${o.custom ? '提交需求' : '提交订单'}</button>
    <p class="order-summary__secure"><span class="material-symbols-outlined text-[16px]">lock</span> 支付信息全程加密，支持企业开票</p>`
}

function renderPage() {
  const root = document.getElementById('order-root')
  if (!root) return
  const o = computeOrder()
  document.title = `确认订单 · ${o.title} | Atuo Future`

  root.innerHTML = `
    <section class="order-hero">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <nav class="order-breadcrumb">
          <a href="../">首页</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <a href="../ai-token/">AI Token 服务</a>
          <span class="material-symbols-outlined">chevron_right</span>
          <span>确认订单</span>
        </nav>
        <h1>确认订单</h1>
        <div class="order-steps">
          <span class="is-active"><i>1</i>确认配置</span>
          <span class="is-active"><i>2</i>填写信息</span>
          <span><i>3</i>支付完成</span>
        </div>
      </div>
    </section>
    <section class="order-body">
      <div class="max-w-max-width mx-auto px-margin-desktop order-grid">
        <div class="order-main">
          <div id="order-config">${renderConfigurator()}</div>
          <div class="order-payer">
            <h3>购买方信息</h3>
            <div class="order-form">
              <label><span>企业 / 单位名称 *</span><input type="text" data-field="company" placeholder="请输入企业全称"/></label>
              <label><span>联系人 *</span><input type="text" data-field="contact" placeholder="您的姓名"/></label>
              <label><span>手机号 *</span><input type="tel" data-field="phone" placeholder="用于订单与开票联系"/></label>
              <label><span>邮箱</span><input type="email" data-field="email" placeholder="接收电子发票"/></label>
              <label class="order-form__full"><span>备注</span><input type="text" data-field="note" placeholder="选填：部署需求、发票抬头等"/></label>
            </div>
          </div>
          <div class="order-pay">
            <h3>支付方式</h3>
            <div class="order-pay__methods">
              ${PAYMENTS.map(
                (m) => `<button type="button" data-pay="${m.id}" class="${state.payment === m.id ? 'is-active' : ''}">
                  <span class="material-symbols-outlined">${m.icon}</span>${m.label}
                </button>`
              ).join('')}
            </div>
          </div>
        </div>
        <aside class="order-summary" id="order-summary">${renderSummary()}</aside>
      </div>
    </section>`

  bindEvents()
}

function refreshSummary() {
  const s = document.getElementById('order-summary')
  if (s) s.innerHTML = renderSummary()
  bindSummary()
}

function refreshConfig() {
  const c = document.getElementById('order-config')
  if (c) c.innerHTML = renderConfigurator()
  bindConfig()
  refreshSummary()
}

/* ---------- 事件 ---------- */
function bindConfig() {
  document.querySelectorAll('[data-order-billing]').forEach((b) => {
    b.addEventListener('click', () => {
      state.billing = b.dataset.orderBilling
      refreshConfig()
    })
  })
  document.querySelectorAll('[data-order-amount]').forEach((b) => {
    b.addEventListener('click', () => {
      state.amount = Number(b.dataset.orderAmount)
      const input = document.querySelector('[data-order-custom]')
      if (input) input.value = state.amount
      document.querySelectorAll('[data-order-amount]').forEach((x) => x.classList.remove('is-active'))
      b.classList.add('is-active')
      refreshSummary()
    })
  })
  const custom = document.querySelector('[data-order-custom]')
  if (custom) {
    custom.addEventListener('input', () => {
      const v = Number(custom.value)
      state.amount = v > 0 ? v : 0
      document.querySelectorAll('[data-order-amount]').forEach((x) =>
        x.classList.toggle('is-active', Number(x.dataset.orderAmount) === state.amount)
      )
      refreshSummary()
    })
  }
}

function bindSummary() {
  const submit = document.querySelector('.order-submit')
  if (submit) submit.addEventListener('click', handleSubmit)
}

function bindPayments() {
  document.querySelectorAll('[data-pay]').forEach((b) => {
    b.addEventListener('click', () => {
      state.payment = b.dataset.pay
      document.querySelectorAll('[data-pay]').forEach((x) => x.classList.remove('is-active'))
      b.classList.add('is-active')
    })
  })
}

function bindEvents() {
  bindConfig()
  bindPayments()
  bindSummary()
}

function handleSubmit() {
  const company = document.querySelector('[data-field="company"]')
  const contact = document.querySelector('[data-field="contact"]')
  const phone = document.querySelector('[data-field="phone"]')
  const missing = [company, contact, phone].filter((el) => el && !el.value.trim())
  if (missing.length) {
    missing.forEach((el) => {
      el.classList.add('order-input-error')
      el.addEventListener('input', () => el.classList.remove('order-input-error'), { once: true })
    })
    missing[0].focus()
    return
  }
  showSuccess()
}

function showSuccess() {
  const o = computeOrder()
  const root = document.getElementById('order-root')
  const orderNo = 'AF' + Date.now().toString().slice(-10)
  root.innerHTML = `
    <section class="order-body">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="order-success">
          <div class="order-success__icon"><span class="material-symbols-outlined">check</span></div>
          <h1>${o.custom ? '需求已提交' : '订单已提交'}</h1>
          <p>${o.custom ? '专属顾问将于 1 个工作日内与您联系，提供定制报价。' : '我们已收到您的订单，请按所选方式完成支付，开通将在支付后秒级生效。'}</p>
          <div class="order-success__card">
            <div><span>订单编号</span><strong>${orderNo}</strong></div>
            <div><span>商品</span><strong>${esc(o.title)}</strong></div>
            <div><span>应付金额</span><strong>${o.custom ? '待报价' : money(o.total)}</strong></div>
          </div>
          <div class="order-success__actions">
            <a href="../ai-token/" class="token-hero__cta token-hero__cta--ghost">返回商城</a>
            <a href="../" class="token-hero__cta token-hero__cta--primary">回到首页</a>
          </div>
        </div>
      </div>
    </section>`
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function initOrder() {
  readParams()
  renderPage()
}
