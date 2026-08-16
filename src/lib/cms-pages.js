import {
  AGENTS_CAPABILITY_CHAIN,
  AGENTS_HUB_LAYERS,
  AGENTS_INDUSTRY,
  AGENTS_OVERVIEW,
} from '../data/agents-overview.js'
import {
  SOLUTIONS,
  SOLUTIONS_BASE_NODES,
  SOLUTIONS_HERO,
} from '../data/solutions.js'

let agentsRuntime = null
let solutionsRuntime = null

export function setAgentsRuntime(content) {
  agentsRuntime = content
}

export function setSolutionsRuntime(content) {
  solutionsRuntime = content
}

export function agentsList() {
  return agentsRuntime?.agents?.length ? agentsRuntime.agents : AGENTS_OVERVIEW
}

export function agentsChain() {
  return agentsRuntime?.chain?.length ? agentsRuntime.chain : AGENTS_CAPABILITY_CHAIN
}

export function agentsHub() {
  return agentsRuntime?.hub || AGENTS_HUB_LAYERS
}

export function agentsIndustry() {
  return agentsRuntime?.industries?.length ? agentsRuntime.industries : AGENTS_INDUSTRY
}

export function agentsHero() {
  return agentsRuntime?.hero || null
}

export function agentsCta() {
  return agentsRuntime?.cta || null
}

export function agentsEcoTitle() {
  return agentsRuntime?.ecoTitle || '空间智能体，让业务目标在真实空间自动落地'
}

export function agentsStoryHead() {
  return agentsRuntime?.story || {
    title: '看一次智能体如何完成真实任务',
    subtitle: '从现场变化开始，到系统与设备执行，再到结果回读，让智能体真正进入业务现场。',
  }
}

export function findAgent(id) {
  const list = agentsList()
  return list.find((a) => a.id === id || (a.aliases || []).includes(id)) || list[0]
}

export function findIndustry(id) {
  const list = agentsIndustry()
  return list.find((item) => item.id === id) || list[0]
}

export function solutionsList() {
  return solutionsRuntime?.items?.length ? solutionsRuntime.items : SOLUTIONS
}

export function solutionsHero() {
  return solutionsRuntime?.hero || SOLUTIONS_HERO
}

export function solutionsBase() {
  return solutionsRuntime?.base || {
    title: '统一空间智能底座，组合不同的行业能力',
    subtitle: '不同空间面对的问题不同，但底层都需要完成感知、决策、执行与反馈。安托未来通过统一中枢，按行业组合智能体、硬件和开放接口。',
    nodes: SOLUTIONS_BASE_NODES,
  }
}

export function solutionsCta() {
  return solutionsRuntime?.cta || {
    title: '找到适合您的空间智能方案',
    body: '告诉我们您的行业、空间规模和核心问题，安托未来将为您组合合适的智能体、硬件与系统能力。',
    primary: '预约方案演示',
    secondaryLabel: '联系方案顾问',
    secondaryHref: '../about/#contact',
    imageUrl: '/images/solutions/cta.jpg',
  }
}

export function solutionsSceneTitle() {
  return solutionsRuntime?.sceneTitle || '选择您的行业场景'
}

export function findSolution(id) {
  const list = solutionsList()
  if (!id) return list[0]
  return list.find((item) => item.id === id) || list[0]
}
