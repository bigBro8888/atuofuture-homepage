/** 行业解决方案：园区、楼宇、学校、酒店、公寓、商业资产 */

export const SOLUTIONS = [
  {
    id: 'campus',
    name: '智慧园区',
    icon: 'domain',
    image: '/images/home-advantages/advantage-wireless-access.webp',
    summary: '多楼栋统一运营，覆盖访客车辆、运维工单、能源安全与企业服务。',
    value: '让园区从分散系统走向统一可调度的智能运营。',
    scenarios: ['多楼栋统一运营', '园区访客与车辆', '运维工单协同', '能源与安全管理', '数字孪生大屏', '企业服务与空间运营'],
    pains: ['多楼栋系统割裂', '访客与车辆流程复杂', '运维响应慢', '能耗与安全难统一看板'],
    approach: '以空间智能中枢连接场景智能体与边缘硬件，实现跨楼栋感知、调度与闭环执行。',
    journey: ['园区到访', '通行与接待', '空间/会议服务', '运维与能耗', '运营复盘'],
    agents: ['space', 'energy', 'visitor', 'asset', 'opc'],
    hardware: ['无线网关', '中控屏', '毫米波传感', '门锁与通行', '水电计量'],
    canDo: ['多楼栋统一运营', '园区访客与车辆', '运维工单协同', '能源与安全管理', '数字孪生大屏', '企业服务与空间运营'],
  },
  {
    id: 'building',
    name: '智慧楼宇',
    icon: 'apartment',
    image: '/images/home-advantages/advantage-layered-loop.webp',
    summary: '围绕访客、会议、照明空调、运维与能耗，打造可感知、可联动、可优化的智能楼宇。',
    value: '把总部与办公楼变成可执行的空间运营系统。',
    scenarios: ['访客预约与通行', '会议室自动准备', '照明空调联动', '工单与设备运维', '能源能耗分析', '安防与资产管理'],
    pains: ['接待依赖人工', '会议室准备不及时', '空耗难治理', '设备报修链路长'],
    approach: '访客、会议、空间、能源与资产智能体协同，连接门禁、中控、传感与工单系统形成业务闭环。',
    journey: ['访客邀约', '通行授权', '会议准备', '空间环境联动', '会后收尾与工单'],
    agents: ['space', 'meeting', 'visitor', 'energy', 'asset'],
    hardware: ['门禁门锁', '桌牌中控', '毫米波传感', '空调照明控制', '网关'],
    canDo: ['访客预约与通行', '会议室自动准备', '照明空调联动', '工单与设备运维', '能源能耗分析', '安防与资产管理'],
  },
  {
    id: 'school',
    name: '智慧学校',
    icon: 'school',
    image: '/images/home-advantages/advantage-open-interface.webp',
    summary: '覆盖教室与公共空间、设备资产、能源通行、会议活动与信息发布。',
    value: '让校园空间管理更安全、节能且可运营。',
    scenarios: ['教室和公共空间管理', '设备与资产管理', '能源能耗', '安防与通行', '会议及活动空间', '信息发布'],
    pains: ['教室设备管理分散', '公共空间利用率低', '能耗难归因', '信息发布不及时'],
    approach: '空间、能源、会议与资产智能体组合，支撑教学与公共空间的日常运行。',
    journey: ['空间使用预约', '设备准备', '通行与安防', '能耗统计', '信息发布'],
    agents: ['space', 'energy', 'meeting', 'asset', 'visitor'],
    hardware: ['中控屏', '传感计量', '信息发布屏', '门锁通行', '网关'],
    canDo: ['教室和公共空间管理', '设备与资产管理', '能源能耗', '安防与通行', '会议及活动空间', '信息发布'],
  },
  {
    id: 'hotel',
    name: '智慧酒店',
    icon: 'hotel',
    image: '/images/home-advantages/advantage-hardware-system.webp',
    summary: '客房中控、房态分配、门锁通行、设备控制与客房能耗一体化。',
    value: '提升入住体验，降低客房运营与能耗成本。',
    scenarios: ['客房中控', '房间状态与分配', '门锁与通行', '客房设备控制', '多语言服务', '客房能耗'],
    pains: ['房态与授权不同步', '客房设备控制分散', '能耗费用难核算', '服务响应依赖人工'],
    approach: '酒店公寓智能体连接门锁、中控、计量与入住流程，实现客房服务与能耗闭环。',
    journey: ['入住分配', '门锁授权', '客房环境准备', '在住服务', '离店回收与结算'],
    agents: ['hospitality', 'space', 'energy', 'visitor'],
    hardware: ['蓝牙门锁', '客房中控', '传感计量', '无线网关'],
    canDo: ['客房中控', '房间状态与分配', '门锁与通行', '客房设备控制', '多语言服务', '客房能耗'],
  },
  {
    id: 'apartment',
    name: '智慧公寓',
    icon: 'home_work',
    image: '/images/home-advantages/advantage-ai-agent.webp',
    summary: '房间分配、长短期入住、门锁授权、水电计量、费用与共享设备管理。',
    value: '让公寓运营从入住到费用结算更自动化。',
    scenarios: ['房间分配', '临时与长期入住', '门锁授权', '水电计量', '租金与能源费用', '共享洗衣等公共设备'],
    pains: ['授权与费用核算复杂', '水电分摊不清', '公共设备难管理'],
    approach: '以酒店公寓与能源智能体打通入住、授权、计量与费用，支持共享设备运营。',
    journey: ['入住办理', '授权下发', '日常计量', '费用结算', '退住回收'],
    agents: ['hospitality', 'energy', 'asset', 'opc'],
    hardware: ['门锁', '水电表', '网关', '共享设备控制'],
    canDo: ['房间分配', '临时与长期入住', '门锁授权', '水电计量', '租金与能源费用', '共享洗衣等公共设备'],
  },
  {
    id: 'commercial',
    name: '商业资产',
    icon: 'storefront',
    image: '/images/home-advantages/advantage-open-interface.webp',
    summary: '空间资源展示、招商获客、预约带看、签约运营与资产能耗管理。',
    value: '把商业空间从展示变成可获客、可成交、可运营的资产系统。',
    scenarios: ['空间资源展示', '招商获客', '预约带看', '签约与运营', '资产与能耗管理', '空间可视化'],
    pains: ['招商线索难转化', '带看与签约割裂', '资产状态不透明'],
    approach: 'OPC运营智能体串联发布、带看、签约与运营，并联动资产与能耗能力。',
    journey: ['空间发布', '获客与预约', '带看体验', '签约成交', '入驻运营'],
    agents: ['opc', 'visitor', 'asset', 'energy', 'space'],
    hardware: ['中控与大屏', '传感', '门锁通行', '能耗计量'],
    canDo: ['空间资源展示', '招商获客', '预约带看', '签约与运营', '资产与能耗管理', '空间可视化'],
  },
]

/** 旧 ID 兼容：会务/能源/安防不再作为一级行业 */
export const SOLUTION_ALIASES = {
  meeting: 'building',
  energy: 'building',
  security: 'campus',
  building: 'building',
  campus: 'campus',
  commercial: 'commercial',
  school: 'school',
  hotel: 'hotel',
  apartment: 'apartment',
}

export function resolveSolutionId(id) {
  if (!id) return null
  const mapped = SOLUTION_ALIASES[id] || id
  return SOLUTIONS.some((s) => s.id === mapped) ? mapped : null
}

export function getSolution(id) {
  const resolved = resolveSolutionId(id)
  return resolved ? SOLUTIONS.find((s) => s.id === resolved) : null
}
