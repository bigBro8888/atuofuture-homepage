/** 行业解决方案：园区、楼宇、学校、酒店、公寓、商业资产 */

/**
 * @typedef {{ title: string, desc: string, icon: string }} SolutionCapability
 * @typedef {{ title: string, imageUrl: string }} SolutionScene
 * @typedef {{ title: string, desc: string }} SolutionHardware
 * @typedef {{ q: string, a: string }} SolutionFaq
 * @typedef {{
 *   id: string,
 *   name: string,
 *   icon: string,
 *   image: string,
 *   summary: string,
 *   value: string,
 *   capabilities: string[],
 *   coreValues: SolutionCapability[],
 *   highlightAgents: string[],
 *   scenarios: SolutionScene[],
 *   pains: string[],
 *   approach: string,
 *   journey: string[],
 *   agents: string[],
 *   hardware: SolutionHardware[],
 *   faqs?: SolutionFaq[],
 *   canDo: string[],
 *   slides?: { imageUrl: string }[],
 * }} SolutionItem
 */

function sceneCards(image, titles) {
  return titles.map((title) => ({ title, imageUrl: image }))
}

function stackHardware(titles) {
  return titles.map((title) => ({
    title,
    desc: '可接入空间智能中枢的硬件与系统能力',
  }))
}

/** @type {SolutionItem[]} */
export const SOLUTIONS = [
  {
    id: 'campus',
    name: '智慧园区',
    icon: 'domain',
    image: '/images/solutions/campus.jpg',
    summary: '多楼栋统一运营，覆盖访客车辆、运维工单、能源安全与企业服务。',
    value: '让园区从分散系统走向统一调度的智能运营。',
    capabilities: ['多楼栋统一运营', '园区访客与车辆', '运维工单协同'],
    coreValues: [
      {
        title: '统一感知，全面可视',
        desc: '整合园区人员、车辆、设备、环境与能耗数据，实现运营状态统一查看。',
        icon: 'hub',
      },
      {
        title: '智能协同，主动运营',
        desc: '让多个业务系统与场景策略自动协同，减少重复操作和人工协调。',
        icon: 'psychology',
      },
      {
        title: '安全保障，降本增效',
        desc: '通过异常预警、能源优化和设备联动，提升园区安全与运营效率。',
        icon: 'verified_user',
      },
    ],
    highlightAgents: ['visitor', 'energy', 'space'],
    scenarios: sceneCards('/images/solutions/campus.jpg', ['多楼栋统一运营', '园区访客与车辆', '运维工单协同', '能源与安全管理', '数字孪生大屏', '企业服务与空间运营']),
    pains: ['多楼栋系统割裂', '访客与车辆流程复杂', '运维响应慢', '能耗与安全难统一看板'],
    approach: '以空间智能中枢连接场景智能体与边缘硬件，实现跨楼栋感知、调度与闭环执行。',
    journey: ['园区到访', '通行与接待', '空间/会议服务', '运维与能耗', '运营复盘'],
    agents: ['space', 'energy', 'visitor', 'asset', 'opc'],
    hardware: stackHardware(['无线网关', '中控屏', '毫米波传感', '门锁与通行', '水电计量']),
    canDo: ['多楼栋统一运营', '园区访客与车辆', '运维工单协同', '能源与安全管理', '数字孪生大屏', '企业服务与空间运营'],
  },
  {
    id: 'building',
    name: '智慧楼宇',
    icon: 'apartment',
    image: '/images/solutions/building.jpg',
    summary: '围绕访客、会议、照明空调、运维与能耗，打造可感知、可联动、可优化的智能楼宇。',
    value: '把总部与办公楼变成能够主动响应的空间运营系统。',
    capabilities: ['访客预约与通行', '会议室自动准备', '照明空调联动'],
    coreValues: [
      {
        title: '访客与通行一体化',
        desc: '预约、核验、通行与接待编排联动，减少前台重复登记与临时授权。',
        icon: 'badge',
      },
      {
        title: '会议空间自动准备',
        desc: '按日程联动中控、照明、空调与音视频，降低会前人工准备成本。',
        icon: 'meeting_room',
      },
      {
        title: '环境与能耗联动',
        desc: '结合占用感知调节照明空调，让舒适与节能同时落地。',
        icon: 'thermostat',
      },
    ],
    highlightAgents: ['meeting', 'visitor', 'space'],
    scenarios: sceneCards('/images/solutions/building.jpg', ['访客预约与通行', '会议室自动准备', '照明空调联动', '工单与设备运维', '能源能耗分析', '安防与资产管理']),
    pains: ['接待依赖人工', '会议室准备不及时', '空耗难治理', '设备报修链路长'],
    approach: '访客、会议、空间、能源与资产智能体协同，连接门禁、中控、传感与工单系统形成业务闭环。',
    journey: ['访客邀约', '通行授权', '会议准备', '空间环境联动', '会后收尾与工单'],
    agents: ['space', 'meeting', 'visitor', 'energy', 'asset'],
    hardware: stackHardware(['门禁门锁', '桌牌中控', '毫米波传感', '空调照明控制', '网关']),
    canDo: ['访客预约与通行', '会议室自动准备', '照明空调联动', '工单与设备运维', '能源能耗分析', '安防与资产管理'],
  },
  {
    id: 'school',
    name: '智慧学校',
    icon: 'school',
    image: '/images/solutions/school.jpg',
    summary: '覆盖教室与公共空间、设备资产、能源通行、会议活动与信息发布。',
    value: '让校园空间管理更安全、更节能、更易运营。',
    capabilities: ['教室与公共空间管理', '设备与资产管理', '校园能源能耗'],
    coreValues: [
      {
        title: '教学空间可管可控',
        desc: '教室与公共空间状态可视、预约可用，减少设备闲置与冲突。',
        icon: 'school',
      },
      {
        title: '资产设备可追溯',
        desc: '设备台账、领用与报修协同，降低资产流失与维护盲区。',
        icon: 'inventory_2',
      },
      {
        title: '校园能耗可优化',
        desc: '按区域与时段分析能耗，结合占用策略实现节能运行。',
        icon: 'eco',
      },
    ],
    highlightAgents: ['space', 'energy', 'asset'],
    scenarios: sceneCards('/images/solutions/school.jpg', ['教室和公共空间管理', '设备与资产管理', '能源能耗', '安防与通行', '会议及活动空间', '信息发布']),
    pains: ['教室设备管理分散', '公共空间利用率低', '能耗难归因', '信息发布不及时'],
    approach: '空间、能源、会议与资产智能体组合，支撑教学与公共空间的日常运行。',
    journey: ['空间使用预约', '设备准备', '通行与安防', '能耗统计', '信息发布'],
    agents: ['space', 'energy', 'meeting', 'asset', 'visitor'],
    hardware: stackHardware(['中控屏', '传感计量', '信息发布屏', '门锁通行', '网关']),
    canDo: ['教室和公共空间管理', '设备与资产管理', '能源能耗', '安防与通行', '会议及活动空间', '信息发布'],
  },
  {
    id: 'hotel',
    name: '智慧酒店',
    icon: 'hotel',
    image: '/images/solutions/hotel.jpg',
    summary: '客房中控、房态分配、门锁通行、设备控制与客房能耗一体化。',
    value: '提升入住体验，降低客房运营与能源成本。',
    capabilities: ['客房智能中控', '房间状态与分配', '门锁与通行授权'],
    coreValues: [
      {
        title: '客房体验一体化',
        desc: '中控联动灯光、空调与场景模式，提升入住舒适度与服务一致性。',
        icon: 'bedroom_parent',
      },
      {
        title: '房态与授权同步',
        desc: '入住分配后自动下发门锁权限，退房及时回收，减少人工差错。',
        icon: 'key',
      },
      {
        title: '客房能耗可核算',
        desc: '按房态与占用优化能耗策略，降低空房与空闲时段浪费。',
        icon: 'bolt',
      },
    ],
    highlightAgents: ['hospitality', 'space', 'energy'],
    scenarios: sceneCards('/images/solutions/hotel.jpg', ['客房中控', '房间状态与分配', '门锁与通行', '客房设备控制', '多语言服务', '客房能耗']),
    pains: ['房态与授权不同步', '客房设备控制分散', '能耗费用难核算', '服务响应依赖人工'],
    approach: '酒店公寓智能体连接门锁、中控、计量与入住流程，实现客房服务与能耗闭环。',
    journey: ['入住分配', '门锁授权', '客房环境准备', '在住服务', '离店回收与结算'],
    agents: ['hospitality', 'space', 'energy', 'visitor'],
    hardware: stackHardware(['蓝牙门锁', '客房中控', '传感计量', '无线网关']),
    canDo: ['客房中控', '房间状态与分配', '门锁与通行', '客房设备控制', '多语言服务', '客房能耗'],
  },
  {
    id: 'apartment',
    name: '智慧公寓',
    icon: 'home_work',
    image: '/images/solutions/apartment.jpg',
    summary: '房间分配、长短期入住、门锁授权、水电计量、费用与共享设备管理。',
    value: '让入住、授权、计量和费用结算形成自动化闭环。',
    capabilities: ['房间智能分配', '临时与长期入住', '门锁与费用管理'],
    coreValues: [
      {
        title: '入住分配自动化',
        desc: '按规则分配房间并同步状态，缩短办理链路。',
        icon: 'home_work',
      },
      {
        title: '长短期授权灵活',
        desc: '临时与长期入住可分别下发与回收权限，降低人工跟进成本。',
        icon: 'schedule',
      },
      {
        title: '计量费用一体化',
        desc: '水电计量与费用结算联动，减少分摊争议与对账成本。',
        icon: 'payments',
      },
    ],
    highlightAgents: ['hospitality', 'energy', 'asset'],
    scenarios: sceneCards('/images/solutions/apartment.jpg', ['房间分配', '临时与长期入住', '门锁授权', '水电计量', '租金与能源费用', '共享洗衣等公共设备']),
    pains: ['授权与费用核算复杂', '水电分摊不清', '公共设备难管理'],
    approach: '以酒店公寓与能源智能体打通入住、授权、计量与费用，支持共享设备运营。',
    journey: ['入住办理', '授权下发', '日常计量', '费用结算', '退住回收'],
    agents: ['hospitality', 'energy', 'asset', 'opc'],
    hardware: stackHardware(['门锁', '水电表', '网关', '共享设备控制']),
    canDo: ['房间分配', '临时与长期入住', '门锁授权', '水电计量', '租金与能源费用', '共享洗衣等公共设备'],
  },
  {
    id: 'commercial',
    name: '商业资产',
    icon: 'storefront',
    image: '/images/solutions/commercial.jpg',
    summary: '空间资源展示、招商获客、预约带看、签约运营与资产能耗管理。',
    value: '把商业空间从静态展示升级为可获客、可成交、可运营的资产系统。',
    capabilities: ['空间资源展示', '招商获客', '预约带看'],
    coreValues: [
      {
        title: '空间资源可展示',
        desc: '统一发布可招商空间与状态，让资产信息对外透明可触达。',
        icon: 'storefront',
      },
      {
        title: '招商获客可转化',
        desc: '线索、预约与跟进形成闭环，提升从曝光到成交的转化效率。',
        icon: 'campaign',
      },
      {
        title: '带看成交可协同',
        desc: '预约带看与空间体验联动，缩短从意向到签约的路径。',
        icon: 'handshake',
      },
    ],
    highlightAgents: ['opc', 'visitor', 'asset'],
    scenarios: sceneCards('/images/solutions/commercial.jpg', ['空间资源展示', '招商获客', '预约带看', '签约与运营', '资产与能耗管理', '空间可视化']),
    pains: ['招商线索难转化', '带看与签约割裂', '资产状态不透明'],
    approach: 'OPC运营智能体串联发布、带看、签约与运营，并联动资产与能耗能力。',
    journey: ['空间发布', '获客与预约', '带看体验', '签约成交', '入驻运营'],
    agents: ['opc', 'visitor', 'asset', 'energy', 'space'],
    hardware: stackHardware(['中控与大屏', '传感', '门锁通行', '能耗计量']),
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

export const SOLUTIONS_HERO = {
  title: '为不同空间，构建可落地的智能解决方案',
  desc: '以空间智能中枢为核心，组合场景智能体、智能硬件与开放接口，让每个行业拥有适合自己的智能运营能力。',
  image: '/images/solutions/hero.jpg',
}

export const SOLUTIONS_BASE_NODES = [
  {
    id: 'hub',
    title: '空间智能中枢',
    desc: '统一数据、策略与任务编排。',
    icon: 'memory',
  },
  {
    id: 'agents',
    title: '场景智能体',
    desc: '根据行业组合会议、访客、能源、资产等能力。',
    icon: 'smart_toy',
  },
  {
    id: 'hardware',
    title: '智能硬件',
    desc: '连接传感器、网关、中控屏与执行设备。',
    icon: 'developer_board',
  },
  {
    id: 'open',
    title: '开放接口',
    desc: '通过 API、MCP 和第三方协议连接既有系统。',
    icon: 'hub',
  },
]

export function resolveSolutionId(id) {
  if (!id) return null
  const mapped = SOLUTION_ALIASES[id] || id
  const hit = SOLUTIONS.find((s) => s.id === mapped)
  return hit && hit.published !== false ? mapped : null
}

export function getPublishedSolutions() {
  return SOLUTIONS.filter((item) => item.published !== false)
}

export function getSolution(id) {
  const resolved = resolveSolutionId(id)
  const item = resolved ? SOLUTIONS.find((s) => s.id === resolved) : null
  return item && item.published !== false ? item : null
}

export function applySolutionsLibraryCms(content) {
  const items = Array.isArray(content?.items) ? content.items.filter((item) => item && item.published !== false) : []
  if (!items.length) return
  const seen = new Set()
  for (const item of items) {
    const existing = SOLUTIONS.find((row) => row.id === item.id || row.id === item.slug)
    const mapped = {
      id: item.id,
      name: item.name,
      icon: item.icon || 'domain',
      image: item.image || '',
      summary: item.summary || '',
      value: item.value || '',
      capabilities: item.capabilities || [],
      coreValues: item.coreValues || [],
      highlightAgents: item.highlightAgents || [],
      scenarios: item.scenarios || [],
      pains: item.pains || [],
      approach: item.approach || '',
      journey: item.journey || [],
      agents: item.agents || [],
      hardware: item.hardware || [],
      faqs: item.faqs || [],
      canDo: item.canDo || [],
      slides: Array.isArray(item.slides) && item.slides.length
        ? item.slides
        : (item.image ? [{ imageUrl: item.image }] : []),
      published: true,
    }
    if (existing) Object.assign(existing, mapped)
    else SOLUTIONS.push(mapped)
    seen.add(item.id)
  }
  for (const row of SOLUTIONS) {
    if (!seen.has(row.id)) row.published = false
  }
}
