/** 空间智能体总览页：八大智能体与协同方案配置 */

/**
 * @typedef {{
 *   id: string,
 *   aliases?: string[],
 *   name: string,
 *   shortName: string,
 *   abbr?: string,
 *   value: string,
 *   tasks: string[],
 *   trigger: string,
 *   actions: string,
 *   result: string,
 *   workflow: string[],
 *   image: string,
 *   detailUrl: string,
 *   icon: string,
 *   accent?: string,
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

export const AGENTS_INDUSTRY = [
  {
    id: 'building',
    title: '智慧楼宇协同',
    icon: 'apartment',
    combo: ['访客接待', '会议', '空间服务', '能源能耗'],
    desc: '让人员到访、会议使用、环境控制和能源管理在同一套流程中协同运行。',
    href: '../solutions/?id=building',
  },
  {
    id: 'campus',
    title: '智慧园区协同',
    icon: 'location_city',
    combo: ['空间服务', '能源能耗', '资产管理', '商业空间运营'],
    desc: '统一管理园区空间、设备、能源、资产和商业运营过程。',
    href: '../solutions/?id=campus',
  },
  {
    id: 'hospitality',
    title: '酒店公寓协同',
    icon: 'hotel',
    combo: ['酒店公寓', '空间服务', '能源能耗', '资产管理'],
    desc: '连接入住、门锁、房间设备、能耗计费与资产运维。',
    href: '../solutions/?id=hotel',
  },
]

/** @type {AgentOverviewItem[]} */
export const AGENTS_OVERVIEW = [
  {
    id: 'space',
    shortName: '空间服务',
    name: '空间服务智能体',
    value: '让环境、设备与服务请求自动响应',
    tasks: ['设备控制', '信息发布', '智能工单'],
    trigger: '人员进入空间，或环境、设备状态出现变化。',
    actions: '读取人体与环境传感器，自动调节照明和空调，更新信息屏；发现异常时自动创建工单。',
    result: '确认设备执行状态，持续跟踪环境变化和工单处理结果。',
    workflow: [
      '人员进入或环境异常',
      '传感器读取现场状态',
      '智能体识别当前场景',
      '调整照明与空调',
      '更新信息屏或生成工单',
      '回读执行结果',
    ],
    image: '/images/agents/space.jpg',
    detailUrl: '../agent-detail/?id=space',
    icon: 'tune',
    accent: '#00BFC1',
  },
  {
    id: 'energy',
    shortName: '能源能耗',
    name: '能源能耗智能体',
    value: '看清能源用在哪里，让节能策略自动执行',
    tasks: ['分区计量', '功能分析', '有人无人联动'],
    trigger: '分区能耗异常升高，或空间进入空闲、占用状态切换。',
    actions: '关联电表、水表与占用感知，识别空耗来源，并自动下发照明、空调节能策略。',
    result: '回读末端执行与能耗曲线变化，验证节能量并持续迭代策略。',
    workflow: [
      '采集分区与设备能耗',
      '关联占用与场景活动',
      '识别空耗与异常波动',
      '生成节能执行策略',
      '下发照明空调控制',
      '复盘效果并迭代策略',
    ],
    image: '/images/agents/energy.jpg',
    detailUrl: '../agent-detail/?id=energy',
    icon: 'bolt',
    accent: '#2BB673',
  },
  {
    id: 'meeting',
    shortName: '会议',
    name: '会议智能体',
    value: '从预约到会议结束，全流程自动运行',
    tasks: ['预约签到', '中控联动', '音视频运维'],
    trigger: '用户发起会议预约，或会议即将开始、结束。',
    actions: '校验冲突并分配会议室，下发门禁与桌牌，会前启动中控与音视频，会后关闭设备。',
    result: '确认设备启停与权限状态，沉淀会议运维记录并释放房间资源。',
    workflow: [
      '用户发起会议预约',
      '检查时间和会议室冲突',
      '分配会议室并同步信息',
      '下发门禁、门牌与桌牌',
      '会前开启空调、大屏和音视频',
      '离场关闭设备并生成记录',
    ],
    image: '/images/agents/meeting.jpg',
    detailUrl: '../agent-detail/?id=meeting',
    icon: 'meeting_room',
    accent: '#3978F6',
  },
  {
    id: 'exhibition',
    shortName: '展厅',
    name: '展厅智能体',
    value: '让内容、讲解、灯光与大屏按参观流程自动编排',
    tasks: ['3D大屏', '数字孪生', '讲解联动'],
    trigger: '识别参观对象或到达讲解节点，需要切换内容与氛围。',
    actions: '按脚本切换大屏与数字孪生内容，联动灯光与展项，推进讲解导览。',
    result: '确认展项与设备状态，沉淀参观路径与互动数据用于复盘。',
    workflow: [
      '识别参观对象与路线',
      '编排大屏与孪生内容',
      '联动灯光与展项状态',
      '推进讲解与导览节点',
      '监控展项与设备健康',
      '沉淀参观过程数据',
    ],
    image: '/images/agents/exhibition.jpg',
    detailUrl: '../agent-detail/?id=exhibition',
    icon: 'view_in_ar',
    accent: '#7B61FF',
  },
  {
    id: 'visitor',
    aliases: ['reception'],
    shortName: '访客接待',
    name: '访客接待智能体',
    value: '从邀约到离场，一次完成身份与空间权限编排',
    tasks: ['预约登记', '门禁授权', '到访提醒'],
    trigger: '发起访客邀约，或访客到达、签退。',
    actions: '完成登记并下发门禁与停车权限，通知接待人，按需准备会面空间，离场后回收权限。',
    result: '确认通行与接待状态，沉淀来访记录并完成权限失效。',
    workflow: [
      '发起访客邀约',
      '访客登记信息',
      '下发通行权限',
      '到访后通知接待人',
      '自动准备会面空间',
      '离场后回收权限',
    ],
    image: '/images/agents/visitor.jpg',
    detailUrl: '../agent-detail/?id=visitor',
    icon: 'badge',
    accent: '#1494D4',
  },
  {
    id: 'opc',
    shortName: '商业空间运营',
    name: '商业空间运营智能体',
    abbr: 'OPC',
    value: '让商业空间从展示、带看到签约持续运营',
    tasks: ['资源发布', '预约带看', '签约订单'],
    trigger: '发布可招商空间，或线索进入、预约带看、推进签约。',
    actions: '统一上架空间资源，生成分享获客入口，安排带看体验，并推进签约与订单流转。',
    result: '跟踪线索转化、签约进度与入驻状态，形成可持续运营闭环。',
    workflow: [
      '发布空间资源',
      '生成分享获客入口',
      '收集并分配线索',
      '安排预约带看',
      '推进签约与订单',
      '跟踪入驻与运营状态',
    ],
    image: '/images/agents/opc.jpg',
    detailUrl: '../agent-detail/?id=opc',
    icon: 'storefront',
    accent: '#FF6A2A',
  },
  {
    id: 'hospitality',
    shortName: '酒店公寓',
    name: '酒店公寓智能体',
    value: '打通入住、授权、设备控制与费用结算',
    tasks: ['房间分配', '门锁权限', '水电计费'],
    trigger: '办理入住、换房，或退房结算。',
    actions: '分配房间并下发门锁权限，联动客房设备场景，读取水电用量并完成费用结算。',
    result: '确认权限、设备与计费状态，退房后回收权限并复位房态。',
    workflow: [
      '办理入住并分配房间',
      '下发门锁与通行权限',
      '联动客房设备与场景',
      '读取水电与能耗数据',
      '计算并结算入住费用',
      '退房回收权限并复位',
    ],
    image: '/images/agents/hospitality.jpg',
    detailUrl: '../agent-detail/?id=hospitality',
    icon: 'apartment',
    accent: '#E2A03F',
  },
  {
    id: 'asset',
    shortName: '资产管理',
    name: '资产管理智能体',
    value: '让资产位置、状态和流转过程实时可见',
    tasks: ['资产台账', '定位盘点', '借还调拨'],
    trigger: '发起盘点、借还、调拨，或资产位置与状态异常。',
    actions: '维护台账并采集定位标签，执行盘点与位置查询，管理借还调拨并识别异常。',
    result: '更新资产生命周期状态，沉淀可审计的流转与异常处理记录。',
    workflow: [
      '建立并维护资产台账',
      '标签绑定与定位采集',
      '发起盘点或查询位置',
      '管理领用借还流程',
      '识别异常并触发工单',
      '更新生命周期状态',
    ],
    image: '/images/agents/asset.jpg',
    detailUrl: '../agent-detail/?id=asset',
    icon: 'inventory_2',
    accent: '#5B6B8C',
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

/** @deprecated 保留兼容旧引用 */
export const AGENTS_PROCESS = AGENTS_CAPABILITY_CHAIN
/** @deprecated 保留兼容旧引用 */
export const AGENTS_COLLAB = AGENTS_INDUSTRY
