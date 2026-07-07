/** AI Token 商城交互：计费周期切换、定价表分类、成本估算器 */

const PRICE_SHEET = {
  text: [
    { name: 'Atuo-Max（GPT-4o 级）', tag: '旗舰', desc: '复杂推理、长上下文、场景剧本生成', input: '¥0.012 / 1K', output: '¥0.036 / 1K' },
    { name: 'Atuo-Pro（Claude 级）', tag: '长文本', desc: '超长文档解析与结构化输出', input: '¥0.015 / 1K', output: '¥0.045 / 1K' },
    { name: 'Atuo-Turbo（通义 / DeepSeek）', tag: '高性价比', desc: '日常对话与批量任务，性价比之选', input: '¥0.004 / 1K', output: '¥0.012 / 1K' },
    { name: 'Atuo-Lite（轻量模型）', tag: '高并发', desc: '意图识别、分类等高频轻量调用', input: '¥0.001 / 1K', output: '¥0.002 / 1K' },
  ],
  vision: [
    { name: '视觉大模型 VLM', tag: '图文理解', desc: '图像描述、多模态问答与场景理解', input: '¥0.028 / 1K', output: '¥0.030 / 1K' },
    { name: '目标检测与追踪', tag: '实时', desc: '人/车/物识别与轨迹追踪', input: '¥0.015 / 张', output: '—' },
    { name: 'OCR 文字识别', tag: '结构化', desc: '证照、票据、铭牌文字提取', input: '¥0.008 / 张', output: '—' },
    { name: '行为与姿态分析', tag: '安防', desc: '异常行为、跌倒、聚集检测', input: '¥0.020 / 帧', output: '—' },
  ],
  voice: [
    { name: 'ASR 语音识别', tag: '实时', desc: '低延迟语音转写与指令识别', input: '¥0.018 / 分钟', output: '—' },
    { name: 'TTS 语音合成', tag: '拟人', desc: '自然拟人播报与多音色合成', input: '¥0.020 / 1K字', output: '—' },
    { name: '实时语音对话', tag: '交互', desc: '全双工语音交互闭环', input: '¥0.035 / 分钟', output: '—' },
    { name: '声纹识别', tag: '身份', desc: '声纹验证与身份核验', input: '¥0.010 / 次', output: '—' },
  ],
}

// 估算器混合费率（元 / 1K Token）
const CALC_RATE = { text: 0.024, vision: 0.028, voice: 0.018 }

function syncPlanLinks(mode) {
  document.querySelectorAll('[data-plan-link]').forEach((a) => {
    a.setAttribute('href', `../order/?type=plan&plan=${a.dataset.planLink}&billing=${mode}`)
  })
}

function initBillingToggle() {
  const toggle = document.querySelector('.token-billing-toggle')
  if (!toggle) return
  const buttons = toggle.querySelectorAll('button[data-billing]')
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('is-active'))
      btn.classList.add('is-active')
      const mode = btn.dataset.billing
      document.querySelectorAll('[data-price]').forEach((el) => {
        const next = mode === 'annual' ? el.dataset.annual : el.dataset.monthly
        if (next) el.textContent = next
      })
      document.querySelectorAll('[data-period]').forEach((el) => {
        el.textContent = mode === 'annual' ? '/月起 · 年付' : '/月'
      })
      syncPlanLinks(mode)
    })
  })
  syncPlanLinks('monthly')
}

function renderPriceRows(tab) {
  const mount = document.getElementById('price-rows')
  if (!mount) return
  mount.innerHTML = PRICE_SHEET[tab]
    .map(
      (r) => `
      <div class="token-price-row">
        <span class="token-price-row__name">${r.name}<em>${r.tag}</em></span>
        <span class="token-price-row__desc">${r.desc}</span>
        <span class="token-price-row__price">${r.input}</span>
        <span class="token-price-row__price">${r.output}</span>
        <span class="token-price-row__cta"><a href="../order/?type=topup&cap=${tab}">开通</a></span>
      </div>`
    )
    .join('')
}

function initPriceTabs() {
  const tabs = document.querySelectorAll('.token-tabs button[data-tab]')
  if (!tabs.length) return
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'))
      tab.classList.add('is-active')
      renderPriceRows(tab.dataset.tab)
    })
  })
  renderPriceRows('text')
}

function initCalculator() {
  const sliders = document.querySelectorAll('input[data-calc]')
  if (!sliders.length) return
  const totalEl = document.querySelector('[data-calc-total]')
  const tokensEl = document.querySelector('[data-calc-tokens]')
  const tipEl = document.querySelector('[data-calc-tip]')
  const quoteBtn = document.querySelector('[data-calc-quote]')

  const update = () => {
    let cost = 0
    let totalWan = 0
    const vals = {}
    sliders.forEach((s) => {
      const wan = Number(s.value)
      vals[s.dataset.calc] = wan
      totalWan += wan
      const tokensK = (wan * 10000) / 1000
      cost += tokensK * CALC_RATE[s.dataset.calc]
      const out = document.querySelector(`[data-calc-out="${s.dataset.calc}"]`)
      if (out) out.textContent = `${wan} 万 Token`
    })
    if (totalEl) totalEl.textContent = cost.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
    if (tokensEl) tokensEl.textContent = `合计 ${totalWan} 万 Token / 月`
    if (tipEl) {
      let plan = '按量计费更灵活'
      if (totalWan > 0 && totalWan <= 50) plan = '推荐搭配「入门版」套餐'
      else if (totalWan <= 600) plan = '推荐搭配「标准版」套餐更划算'
      else plan = '建议选择「旗舰版」或定制方案'
      tipEl.textContent = plan
    }
    if (quoteBtn) {
      quoteBtn.setAttribute(
        'href',
        `../order/?type=calc&text=${vals.text || 0}&vision=${vals.vision || 0}&voice=${vals.voice || 0}`
      )
    }
  }

  sliders.forEach((s) => s.addEventListener('input', update))
  update()
}

function initConsoleBuy() {
  const quick = document.querySelectorAll('.token-console__quick button[data-quick]')
  const buyBtn = document.querySelector('.token-console__buy')
  if (!buyBtn) return
  let amount = 2000
  quick.forEach((b) => {
    b.addEventListener('click', () => {
      quick.forEach((x) => x.classList.remove('is-active'))
      b.classList.add('is-active')
      amount = Number(b.textContent.replace(/[^\d]/g, '')) || amount
    })
  })
  buyBtn.addEventListener('click', () => {
    window.location.href = `../order/?type=topup&amount=${amount}`
  })
}

export function initAiTokenStore() {
  initBillingToggle()
  initPriceTabs()
  initCalculator()
  initConsoleBuy()
}
