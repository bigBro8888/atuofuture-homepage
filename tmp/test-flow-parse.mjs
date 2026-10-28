function parseFlowStepsPaste(raw = '') {
  const text = String(raw || '').replace(/\r\n/g, '\n').trim()
  if (!text) return []
  const chunks = text.split(/(?=^\s*0?[1-6][\s.、．]+)/m).map((s) => s.trim()).filter(Boolean)
  const steps = []
  for (const chunk of chunks) {
    const head = chunk.match(/^\s*0?([1-6])[\s.、．]+(.+?)(?:\n|$)/)
    if (!head) continue
    const index = Number(head[1]) - 1
    const title = String(head[2] || '').replace(/^描述[：:].*$/u, '').replace(/^配图内容[：:].*$/u, '').trim()
    const descMatch = chunk.match(/(?:^|\n)\s*描述[：:]\s*(.+?)(?=\n\s*(?:配图内容[：:]|0?[1-6][\s.、．]|$))/su)
    const desc = descMatch ? String(descMatch[1] || '').replace(/\s+/g, ' ').trim() : ''
    if (!title && !desc) continue
    steps[index] = { title, desc }
  }
  return steps
}
const sample = `01 建立空间档案

描述：统一面积、价格、平面图、配套与可租状态

配图内容：A座 12F-1203（320㎡，精装，可租）

02 多渠道发布

描述：自动生成空间介绍，同步官网、小程序与招商渠道

配图内容：品质办公空间

06 交付入驻运营

描述：完成交接、权限开通、服务协同与续租跟进

配图内容：入驻交付清单`
console.log(JSON.stringify(parseFlowStepsPaste(sample), null, 2))
