import { getAgentById } from '../data/agents.js'

const SESSION_KEY = 'atuo_agent_chat_session'

/**
 * 业务训练对接点：
 * 在 .env 中设置 VITE_AGENT_API_URL 即可切换到真实后端
 * 请求体格式见 sendMessage 的 payload
 */
const API_URL = import.meta.env.VITE_AGENT_API_URL || ''

export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

/** @typedef {{ role: 'user' | 'assistant', content: string, agentId?: string, ts: number }} ChatMessage */

/**
 * @param {{ agentId: string, message: string, history: ChatMessage[] }} params
 * @returns {Promise<{ reply: string, meta?: Record<string, unknown> }>}
 */
export async function sendMessage({ agentId, message, history }) {
  const payload = {
    sessionId: getSessionId(),
    agentId,
    message,
    history: history.map(({ role, content, agentId: aid }) => ({
      role,
      content,
      agentId: aid,
    })),
    page: document.body.dataset.page || 'unknown',
    timestamp: Date.now(),
  }

  if (API_URL) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const data = await res.json()
    return { reply: data.reply ?? data.message ?? '收到，我们会尽快处理。', meta: data.meta }
  }

  await delay(600 + Math.random() * 400)
  return { reply: mockReply(agentId, message), meta: { source: 'mock' } }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function mockReply(agentId, message) {
  const agent = getAgentById(agentId)
  const text = message.toLowerCase()

  const rules = [
    [/演示|预约|报价|白皮书|联系/, '已记录您的商务需求。方案顾问会在 1 个工作日内联系您，也可拨打 400-888-9999 加速对接。'],
    [/token|算力|api|接入/, 'AI Token 服务支持统一接入、弹性调用与计量治理。建议先明确日调用量级与主要场景（视觉/语音/LLM），我们可输出 Token 配额建议书。'],
    [/总部|大楼|办公/, '智慧总部方案通常包含：会务接待 + 能源能耗 + 安防消防 + 决策驾驶舱。请告知建筑面积与现有子系统（门禁、BA、会议等），便于评估集成复杂度。'],
    [/园区|产业/, '产业园区侧重全域安防、能耗治理与资产盘点。可提供园区面积、入驻企业数及当前运维模式，我来推荐智能体组合包。'],
    [/商业|商场|招商/, '商业综合体推荐：招商运营 + 空间运营 + 安防风险智能体。人流热力与业态分析是核心增值点。'],
    [/会议|会务|访客|接待/, '会务场景可实现：预约冲突检测、人脸签到、环境联动、纪要自动生成。请说明日均会议场次与接待流程痛点。'],
    [/安防|安全|监控|识别/, '安防智能体支持异常行为识别、访客全链路追踪、周界预警。请描述监控点位规模与现有平台品牌。'],
    [/能耗|节能|空调|碳/, '能源智能体可基于人员流动做动态供冷供热，典型节能预期 25%–35%。请提供建筑类型与主要用能设备。'],
    [/消防/, '消防预防智能体联动烟感、温感与视觉，实现烟火秒级检测与通道占用告警。'],
    [/价格|费用|成本|预算/, '费用与空间面积、接入子系统数量及智能体数量相关。建议先做一次空间诊断，我们可输出分阶段投资路线图。'],
    [/多久|周期|交付/, '标准交付六步法：诊断 → 设计 → 硬件接入 → 逻辑配置 → 集成 → 持续进化。中小型总部约 8–16 周，视存量系统而定。'],
  ]

  for (const [pattern, reply] of rules) {
    if (pattern.test(text)) return reply
  }

  return `作为【${agent.name}】，我已收到您的需求：「${message}」。\n\n您可以补充空间类型、面积、现有系统或期望效果，我会给出更具体的智能体组合与实施建议。后续接入业务训练后，回复将基于企业知识库生成。`
}
