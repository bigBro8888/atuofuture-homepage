/** 可对话的智能体列表，后续业务训练可在此扩展 persona / 知识库 ID */
export const AGENTS = [
  {
    id: 'spatial-advisor',
    name: '空间顾问',
    role: '总览咨询',
    icon: 'support_agent',
    description: '了解您的空间类型与业务目标，推荐合适的智能化路径',
    greeting: '您好，我是 Atuo Future 空间顾问。请告诉我您的空间类型（总部、园区、商业等）和核心诉求，我来帮您梳理方案方向。',
    quickPrompts: ['我想做智慧总部', '园区智能化怎么做', '想了解 AI Token 服务'],
  },
  {
    id: 'meeting-agent',
    name: '会务接待智能体',
    role: '会务场景',
    icon: 'meeting_room',
    description: '会议预约、访客接待、空间调度相关需求',
    greeting: '您好，我是会务接待智能体。您可以描述会议规模、接待流程或访客管理需求，我来评估智能化切入点。',
    quickPrompts: ['会议室自动调度', '访客无感通行', '会议纪要自动化'],
  },
  {
    id: 'security-agent',
    name: '安防风险智能体',
    role: '安防场景',
    icon: 'security',
    description: '安防监控、风险预警、周界防护等需求',
    greeting: '您好，我是安防风险智能体。请描述您关注的安全场景，例如人员识别、异常行为或周界告警，我来给出能力建议。',
    quickPrompts: ['异常行为识别', '访客轨迹追踪', '周界主动预警'],
  },
  {
    id: 'energy-agent',
    name: '能源能耗智能体',
    role: '能耗场景',
    icon: 'bolt',
    description: '能耗优化、碳管理、设备能效相关需求',
    greeting: '您好，我是能源能耗智能体。可以告诉我建筑类型、当前能耗痛点或节能目标，我来分析可落地的优化策略。',
    quickPrompts: ['降低空调能耗', '人走灯灭策略', '能耗异常监测'],
  },
  {
    id: 'solution-agent',
    name: '方案顾问',
    role: '商务对接',
    icon: 'handshake',
    description: '预约演示、方案报价、项目交付周期咨询',
    greeting: '您好，我是方案顾问。如需预约演示、获取白皮书或了解交付流程，请直接说明，我会记录您的需求并安排跟进。',
    quickPrompts: ['预约方案演示', '获取白皮书', '了解交付周期'],
  },
]

export function getAgentById(id) {
  return AGENTS.find((a) => a.id === id) ?? AGENTS[0]
}
