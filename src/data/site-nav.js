/** 全站顶部导航：一级 + 二级（mega menu）
 * 智能体 / 方案文案与 AGENTS_OVERVIEW、SOLUTIONS 同源，避免顶栏与频道页不一致。
 */

import { AGENTS_OVERVIEW } from './agents-overview.js'
import { SOLUTIONS } from './solutions.js'

/** 顶栏补充说明（比 overview.blurb 更适合导航） */
const AGENT_NAV_DESC = {
  space: '空调照明、工单与信息发布统一调度',
  energy: '分项计量与有无人节能分析',
  meeting: '预约签到、中控与音视频联动',
  exhibition: '大屏、孪生、讲解与展项状态',
  visitor: '邀约登记、通行与接待编排',
  opc: '空间发布、带看、签约与运营协同（OPC）',
  hospitality: '分房、门锁、客房与费用管理',
  asset: '盘点、领用借还与全生命周期',
}

const SOLUTION_NAV_DESC = {
  campus: '多楼栋统一运营与园区服务协同',
  building: '访客、会议、能耗与运维一体联动',
  school: '教室、通行、能耗与信息发布',
  hotel: '客房中控、门锁与能耗服务',
  apartment: '分房、授权、水电与费用管理',
  commercial: '招商获客、带看签约与资产运营',
}

export function buildAgentNavChildren() {
  return AGENTS_OVERVIEW.filter((agent) => !agent.hidden).map((agent) => ({
    id: agent.id,
    label: agent.name,
    desc: AGENT_NAV_DESC[agent.id] || agent.value || agent.blurb || '',
    segment: `agent-detail/?id=${agent.id}`,
  }))
}

/** 顶栏智能体下拉与生态图顺序同步 */
export function syncAgentNavChildren() {
  const item = SITE_NAV_ITEMS.find((entry) => entry.id === 'agents')
  if (item) item.children = buildAgentNavChildren()
  return item?.children || []
}

function buildSolutionNavChildren() {
  return SOLUTIONS.map((sol) => ({
    id: `sol-${sol.id}`,
    label: sol.name,
    desc: SOLUTION_NAV_DESC[sol.id] || sol.summary || '',
    segment: `solutions/?id=${sol.id}`,
  }))
}

/** 全站顶部导航：一级 + 二级（mega menu） */
export const SITE_NAV_ITEMS = [
  { id: 'home', label: '首页', segment: '' },
  // 门户独立开页；登录 token 已同步 localStorage，新标签可保留登录态
  { id: 'aspace-one', label: 'Aspace空间智能', segment: 'aspace-one/', href: '/aspace-one/', newTab: true },
  {
    id: 'agents',
    label: '空间智能体',
    segment: 'agents/',
    mega: 'visual',
    children: buildAgentNavChildren(),
  },
  {
    id: 'hardware',
    label: '智能硬件',
    segment: 'hardware/',
    mega: 'hardware',
    children: [
      { id: 'hw-space', label: '空间智能', desc: '中控屏、智慧门牌、工位屏与传感网关', segment: 'hardware/?line=space#hwc-browser' },
      { id: 'hw-retail', label: '新零售与行业电子纸', desc: '电子价签、低温标签与资产盘点', segment: 'hardware/?line=retail#hwc-browser' },
      { id: 'hw-consumer', label: '3C 数码', desc: 'AI 墨水屏手机壳与电子纸相框', segment: 'hardware/?line=consumer#hwc-browser' },
    ],
  },
  { id: 'news', label: '新闻中心', segment: 'news/' },
  {
    id: 'solutions',
    label: '行业解决方案',
    segment: 'solutions/',
    mega: 'visual',
    children: buildSolutionNavChildren(),
  },
  {
    id: 'about',
    label: '关于我们',
    segment: 'about/',
    mega: 'visual',
    children: [
      { id: 'about-intro', label: '公司介绍', desc: '物理AI与空间智能定位', segment: 'about/#intro', image: '/images/home-advantages/advantage-ai-agent.webp', icon: 'apartment' },
      { id: 'about-culture', label: '使命愿景', desc: '使命、价值观与愿景', segment: 'about/#culture', image: '/images/home-advantages/advantage-hardware-system.webp', icon: 'flag' },
      { id: 'about-join', label: '加入我们', desc: '成长、创新与办公日常', segment: 'about/#join', image: '/images/solutions/building.jpg', icon: 'groups' },
      { id: 'about-contact', label: '联系我们', desc: '预约演示与商务对接', segment: 'about/#contact', image: '/images/solutions/cta.jpg', icon: 'call' },
    ],
  },
]
