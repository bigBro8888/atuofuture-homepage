/** 空间智能体总览：八大智能体与行业协同配置 */

/**
 * @typedef {{ label: string, x: number, y: number, step: number }} AgentSceneNode
 * @typedef {{
 *   id: string,
 *   aliases?: string[],
 *   name: string,
 *   shortName: string,
 *   abbr?: string,
 *   blurb: string,
 *   value: string,
 *   trigger: string,
 *   action: string,
 *   result: string,
 *   workflow: string[],
 *   sceneImage: string,
 *   sceneNodes: AgentSceneNode[],
 *   detailUrl: string,
 *   icon: string,
 *   side: 'left' | 'right',
 * }} AgentOverviewItem
 */

export const AGENTS_CAPABILITY_CHAIN = [
  { id: 'sense', title: '感知状态', icon: 'sensors' },
  { id: 'understand', title: '理解场景', icon: 'psychology' },
  { id: 'task', title: '生成任务', icon: 'account_tree' },
  { id: 'invoke', title: '调用系统与设备', icon: 'settings_ethernet' },
  { id: 'feedback', title: '回读结果', icon: 'replay' },
]

export const AGENTS_HUB_LAYERS = {
  software: {
    title: '软件系统',
    items: ['会议', '访客', '工单', '资产', '能耗', '运营系统'],
  },
  hardware: {
    title: '智能硬件',
    items: ['传感器', '中控屏', '网关', '开关', '空调', '门锁'],
  },
  ecosystem: {
    title: '第三方生态',
    items: ['门禁', '音视频', 'KNX', 'BUS', '第三方业务平台'],
  },
}

/** @type {AgentOverviewItem[]} */
export const AGENTS_OVERVIEW = [
  {
    id: 'space',
    side: 'left',
    shortName: '空间服务',
    name: '空间服务智能体',
    blurb: '控制环境与空间设备',
    value: '让环境、设备与服务请求自动响应',
    trigger: '人员进入空间，或环境、设备状态出现变化。',
    action: '读取人体与环境传感器，自动调节照明和空调，更新信息屏；发现异常时自动创建工单。',
    result: '确认设备执行状态，持续跟踪环境变化和工单处理结果。',
    workflow: ['人员进入或环境异常', '读取现场状态', '识别当前场景', '调用系统与设备', '回读执行结果'],
    sceneImage: '/images/agents/space.jpg',
    sceneNodes: [
      { label: '人员进入', x: 18, y: 62, step: 0 },
      { label: '环境已更新', x: 42, y: 22, step: 1 },
      { label: '照明开启', x: 68, y: 28, step: 3 },
      { label: '空调舒适模式', x: 78, y: 48, step: 3 },
      { label: '信息屏更新', x: 52, y: 70, step: 3 },
      { label: '执行成功', x: 30, y: 78, step: 4 },
    ],
    detailUrl: '../agent-detail/?id=space',
    icon: 'tune',
  },
  {
    id: 'energy',
    side: 'left',
    shortName: '能源能耗',
    name: '能源能耗智能体',
    blurb: '分析能耗并执行节能策略',
    value: '看清能源用在哪里，让节能策略自动执行',
    trigger: '分区能耗异常升高，或空间进入空闲、占用状态切换。',
    action: '关联电表、水表与占用感知，识别空耗来源，并自动下发照明、空调节能策略。',
    result: '回读末端执行与能耗曲线变化，验证节能量并持续迭代策略。',
    workflow: ['能耗异常或空闲', '采集分区计量', '识别空耗来源', '下发节能策略', '回读能耗曲线'],
    sceneImage: '/images/agents/energy.jpg',
    sceneNodes: [
      { label: '分区计量', x: 22, y: 30, step: 1 },
      { label: '空闲降载', x: 48, y: 24, step: 2 },
      { label: '空调节能', x: 72, y: 36, step: 3 },
      { label: '照明联动', x: 66, y: 58, step: 3 },
      { label: '策略生效', x: 34, y: 72, step: 4 },
    ],
    detailUrl: '../agent-detail/?id=energy',
    icon: 'bolt',
  },
  {
    id: 'meeting',
    side: 'left',
    shortName: '会议',
    name: '会议智能体',
    blurb: '自动运行会议全流程',
    value: '从预约到会议结束，全流程自动运行',
    trigger: '用户发起会议预约，或会议即将开始、结束。',
    action: '校验冲突并分配会议室，下发门禁与桌牌，会前启动中控与音视频，会后关闭设备。',
    result: '确认设备启停与权限状态，沉淀会议记录并释放房间资源。',
    workflow: ['会议预约触发', '校验资源冲突', '准备会议室', '联动中控音视频', '会后复位回读'],
    sceneImage: '/images/agents/meeting.jpg',
    sceneNodes: [
      { label: '预约确认', x: 20, y: 28, step: 0 },
      { label: '签到核验', x: 36, y: 58, step: 1 },
      { label: '中控启动', x: 58, y: 34, step: 3 },
      { label: '大屏待命', x: 74, y: 48, step: 3 },
      { label: '会后关闭', x: 48, y: 76, step: 4 },
    ],
    detailUrl: '../agent-detail/?id=meeting',
    icon: 'meeting_room',
  },
  {
    id: 'exhibition',
    side: 'left',
    shortName: '展厅',
    name: '展厅智能体',
    blurb: '编排内容、讲解与氛围',
    value: '让内容、讲解、灯光与大屏按参观流程自动编排',
    trigger: '识别参观对象或到达讲解节点，需要切换内容与氛围。',
    action: '按脚本切换大屏与数字孪生内容，联动灯光与展项，推进讲解导览。',
    result: '确认展项与设备状态，沉淀参观路径与互动数据用于复盘。',
    workflow: ['识别参观对象', '编排讲解脚本', '切换大屏内容', '联动灯光展项', '回读参观数据'],
    sceneImage: '/images/agents/exhibition.jpg',
    sceneNodes: [
      { label: '讲解启动', x: 24, y: 36, step: 0 },
      { label: '大屏切换', x: 62, y: 28, step: 2 },
      { label: '灯光场景', x: 78, y: 46, step: 3 },
      { label: '展项联动', x: 46, y: 62, step: 3 },
      { label: '节点推进', x: 30, y: 74, step: 4 },
    ],
    detailUrl: '../agent-detail/?id=exhibition',
    icon: 'view_in_ar',
  },
  {
    id: 'visitor',
    side: 'right',
    aliases: ['reception'],
    shortName: '访客接待',
    name: '访客接待智能体',
    blurb: '协同邀约、通行与接待',
    value: '从邀约到离场，一次完成身份与空间权限编排',
    trigger: '发起访客邀约，或访客到达、签退。',
    action: '完成登记并下发门禁与停车权限，通知接待人，按需准备会面空间，离场后回收权限。',
    result: '确认通行与接待状态，沉淀来访记录并完成权限失效。',
    workflow: ['访客邀约发起', '完成登记核验', '下发通行权限', '通知接待准备', '离场回收回读'],
    sceneImage: '/images/agents/visitor.jpg',
    sceneNodes: [
      { label: '手机邀约已打开', x: 22, y: 58, step: 0 },
      { label: '入口到访识别', x: 48, y: 24, step: 1 },
      { label: '临时权限已下发', x: 68, y: 46, step: 2 },
      { label: '接待人已通知', x: 36, y: 40, step: 3 },
      { label: '接待空间已准备', x: 78, y: 68, step: 3 },
      { label: '离场权限失效', x: 18, y: 78, step: 4 },
    ],
    detailUrl: '../agent-detail/?id=visitor',
    icon: 'badge',
  },
  {
    id: 'opc',
    side: 'right',
    shortName: '商业空间运营',
    name: '商业空间运营智能体',
    abbr: 'OPC',
    blurb: '连接展示、带看与签约',
    value: '让商业空间从展示、带看到签约持续运营',
    trigger: '发布可招商空间，或线索进入、预约带看、推进签约。',
    action: '统一上架空间资源，生成分享获客入口，安排带看体验，并推进签约与订单流转。',
    result: '跟踪线索转化、签约进度与入驻状态，形成可持续运营闭环。',
    workflow: ['发布空间资源', '沉淀获客线索', '预约带看', '推进签约订单', '回读运营状态'],
    sceneImage: '/images/solutions/commercial.jpg',
    sceneNodes: [
      { label: '资源上架', x: 24, y: 30, step: 0 },
      { label: '线索进入', x: 48, y: 24, step: 1 },
      { label: '预约带看', x: 70, y: 42, step: 2 },
      { label: '签约推进', x: 54, y: 68, step: 3 },
      { label: '订单同步', x: 28, y: 74, step: 4 },
    ],
    detailUrl: '../agent-detail/?id=opc',
    icon: 'storefront',
  },
  {
    id: 'hospitality',
    side: 'right',
    shortName: '酒店公寓',
    name: '酒店公寓智能体',
    blurb: '管理入住、授权与计费',
    value: '打通入住、授权、设备控制与费用结算',
    trigger: '办理入住、换房，或退房结算。',
    action: '分配房间并下发门锁权限，联动客房设备场景，读取水电用量并完成费用结算。',
    result: '确认权限、设备与计费状态，退房后回收权限并复位房态。',
    workflow: ['入住分配房间', '下发门锁权限', '准备客房设备', '统计水电费用', '退房复位回读'],
    sceneImage: '/images/solutions/hotel.jpg',
    sceneNodes: [
      { label: '房间分配', x: 24, y: 32, step: 0 },
      { label: '门锁授权', x: 62, y: 28, step: 1 },
      { label: '客房准备', x: 74, y: 52, step: 2 },
      { label: '水电计量', x: 46, y: 66, step: 3 },
      { label: '退房复位', x: 28, y: 78, step: 4 },
    ],
    detailUrl: '../agent-detail/?id=hospitality',
    icon: 'apartment',
  },
  {
    id: 'asset',
    side: 'right',
    shortName: '资产管理',
    name: '资产管理智能体',
    blurb: '掌握资产位置与流转',
    value: '让资产位置、状态和流转过程实时可见',
    trigger: '发起盘点、借还、调拨，或资产位置与状态异常。',
    action: '维护台账并采集定位标签，执行盘点与位置查询，管理借还调拨并识别异常。',
    result: '更新资产生命周期状态，沉淀可审计的流转与异常处理记录。',
    workflow: ['台账状态变化', '采集定位标签', '盘点或查询', '借还调拨执行', '回读生命周期'],
    sceneImage: '/images/agents/asset.jpg',
    sceneNodes: [
      { label: '台账更新', x: 22, y: 28, step: 0 },
      { label: '定位采集', x: 56, y: 24, step: 1 },
      { label: '盘点进行', x: 72, y: 48, step: 2 },
      { label: '借还记录', x: 44, y: 64, step: 3 },
      { label: '状态闭环', x: 26, y: 78, step: 4 },
    ],
    detailUrl: '../agent-detail/?id=asset',
    icon: 'inventory_2',
  },
]

export const AGENTS_INDUSTRY = [
  {
    id: 'building',
    title: '智慧楼宇',
    navDesc: '到访、会议、环境与能源同一流程协同',
    combo: [
      { id: 'visitor', label: '访客接待' },
      { id: 'meeting', label: '会议' },
      { id: 'space', label: '空间服务' },
      { id: 'energy', label: '能源能耗' },
    ],
    scenePins: [
      { id: 'visitor', label: '大堂 · 访客接待', x: 22, y: 68, chain: 0 },
      { id: 'meeting', label: '会议室 · 会议', x: 62, y: 36, chain: 2 },
      { id: 'space', label: '办公区 · 空间服务', x: 78, y: 58, chain: 3 },
      { id: 'energy', label: '机房 · 能源能耗', x: 34, y: 28, chain: 4 },
    ],
    desc: '让人员到访、会议使用、环境控制和能源管理在同一套流程中协同运行。',
    chain: ['访客预约', '到访通行', '会议室自动准备', '空间设备联动', '能耗策略持续执行'],
    image: '/images/solutions/building.jpg',
    href: '../solutions/?id=building',
  },
  {
    id: 'campus',
    title: '智慧园区',
    navDesc: '统一管理空间、设备、能源、资产与商业运营',
    combo: [
      { id: 'space', label: '空间服务' },
      { id: 'energy', label: '能源能耗' },
      { id: 'asset', label: '资产管理' },
      { id: 'opc', label: '商业空间运营' },
    ],
    scenePins: [
      { id: 'space', label: '空间服务', x: 28, y: 42, chain: 0 },
      { id: 'energy', label: '能源能耗', x: 58, y: 30, chain: 2 },
      { id: 'asset', label: '资产管理', x: 72, y: 58, chain: 3 },
      { id: 'opc', label: '商业空间运营', x: 40, y: 72, chain: 4 },
    ],
    desc: '统一管理园区空间、设备、能源、资产和商业运营过程。',
    chain: ['空间状态采集', '设备统一管理', '能耗分析', '资产盘点', '商业资源运营'],
    image: '/images/solutions/campus.jpg',
    href: '../solutions/?id=campus',
  },
  {
    id: 'hospitality',
    title: '酒店公寓',
    navDesc: '连接入住、门锁、设备、计费与资产运维',
    combo: [
      { id: 'hospitality', label: '酒店公寓' },
      { id: 'space', label: '空间服务' },
      { id: 'energy', label: '能源能耗' },
      { id: 'asset', label: '资产管理' },
    ],
    scenePins: [
      { id: 'hospitality', label: '前台入住', x: 30, y: 46, chain: 0 },
      { id: 'space', label: '客房空间', x: 68, y: 34, chain: 2 },
      { id: 'energy', label: '能耗计费', x: 74, y: 64, chain: 3 },
      { id: 'asset', label: '资产巡检', x: 42, y: 72, chain: 4 },
    ],
    desc: '连接入住、门锁、房间设备、能耗计费与资产运维。',
    chain: ['房间分配', '门锁授权', '客房设备准备', '水电费用统计', '退房与资产检查'],
    image: '/images/solutions/hotel.jpg',
    href: '../solutions/?id=hotel',
  },
]

export function resolveAgentOverviewId(raw) {
  if (!raw) return null
  const id = String(raw).trim().toLowerCase()
  const found = AGENTS_OVERVIEW.find((a) => a.id === id || (a.aliases || []).includes(id))
  return found ? found.id : null
}

export function getAgentOverview(id) {
  const resolved = resolveAgentOverviewId(id)
  return resolved ? AGENTS_OVERVIEW.find((a) => a.id === resolved) : null
}

export function applyAgentsOverviewCms(content) {
  const items = Array.isArray(content?.items) ? content.items.filter((item) => item && item.published !== false) : []
  if (!items.length) return
  for (const item of items) {
    const existing = AGENTS_OVERVIEW.find((row) => row.id === item.id)
    if (!existing) continue
    if (item.name) existing.name = item.name
    if (item.shortName) existing.shortName = item.shortName
    if (item.blurb) existing.blurb = item.blurb
    if (item.value) existing.value = item.value
    if (item.trigger) existing.trigger = item.trigger
    if (item.action) existing.action = item.action
    if (item.result) existing.result = item.result
    if (item.sceneImage) existing.sceneImage = item.sceneImage
    if (item.icon) existing.icon = item.icon
    if (Array.isArray(item.workflow) && item.workflow.length) {
      existing.workflow = item.workflow.map((step) => step.title || step).filter(Boolean)
    }
  }
}

export function getIndustryComposition(id) {
  return AGENTS_INDUSTRY.find((item) => item.id === id) || AGENTS_INDUSTRY[0]
}
