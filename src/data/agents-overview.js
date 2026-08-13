/** 空间智能体总览页：八大智能体配置（独立于详情页文案） */

/**
 * @typedef {{ title: string, description: string }} AgentWorkflowStep
 * @typedef {{
 *   id: string,
 *   aliases?: string[],
 *   shortName: string,
 *   name: string,
 *   tagline: string,
 *   description: string,
 *   image: string,
 *   href: string,
 *   icon: string,
 *   problem: string,
 *   actions: string,
 *   integrations: string,
 *   overlays: { label: string, value: string }[],
 *   workflow: AgentWorkflowStep[],
 * }} AgentOverviewItem
 */

export const AGENTS_PROCESS = [
  { id: 'sense', title: '感知', desc: '获取人员、环境、设备和业务状态', icon: 'sensors' },
  { id: 'understand', title: '理解', desc: '结合业务规则识别当前需求', icon: 'psychology' },
  { id: 'decide', title: '决策', desc: '生成任务计划与执行策略', icon: 'account_tree' },
  { id: 'execute', title: '执行', desc: '调用软件系统和真实设备', icon: 'settings_ethernet' },
  { id: 'feedback', title: '反馈', desc: '追踪结果并持续优化', icon: 'replay' },
]

export const AGENTS_COLLAB = [
  {
    id: 'building',
    title: '智慧楼宇协同',
    agents: '访客接待＋会议运维＋空间服务＋能源能耗',
  },
  {
    id: 'campus',
    title: '智慧园区协同',
    agents: '空间服务＋能源能耗＋资产管理＋OPC运营',
  },
  {
    id: 'hospitality',
    title: '酒店公寓协同',
    agents: '酒店公寓＋空间服务＋能源能耗＋资产管理',
  },
]

/** @type {AgentOverviewItem[]} */
export const AGENTS_OVERVIEW = [
  {
    id: 'space',
    shortName: '空间服务',
    name: '空间服务智能体',
    tagline: '环境与设备统一响应',
    description: '统一调度空调、照明、设备控制、智能工单与信息发布，让空间按场景自动响应。',
    image: '/images/agents/space.jpg',
    href: '../agent-detail/?id=space',
    icon: 'tune',
    problem: '设备分散、场景切换依赖人工、异常处理滞后、运营状态难以统一掌握。',
    actions: '自动调整环境与设备、生成并流转工单、发布空间信息、回读执行状态。',
    integrations: '楼宇自控、照明、空调、传感器、门禁、工单系统、信息屏。',
    overlays: [
      { label: '环境状态', value: '温度 26°C · 湿度 68% · PM2.5 优' },
      { label: '设备状态', value: '空调 24°C 制冷 · 照明 60% · 信息屏 欢迎墙' },
    ],
    workflow: [
      { title: '环境或业务状态变化', description: '空间占用、温湿度或业务事件发生变化。' },
      { title: '传感器与系统采集状态', description: '传感与设备回读实时空间数据。' },
      { title: '智能体识别当前场景', description: '结合规则判断需要启动的空间策略。' },
      { title: '生成设备与运营任务', description: '形成环境调节、工单与信息发布计划。' },
      { title: '调用系统和设备执行', description: '联动楼控、照明、空调与信息屏。' },
      { title: '回读状态并跟踪结果', description: '确认执行结果并持续优化策略。' },
    ],
  },
  {
    id: 'energy',
    shortName: '能源能耗',
    name: '能源能耗智能体',
    tagline: '让节能策略真正落地',
    description: '把能耗数据与空间、设备和人员活动关联起来，让节能策略真正落地。',
    image: '/images/agents/energy.jpg',
    href: '../agent-detail/?id=energy',
    icon: 'bolt',
    problem: '传统能耗系统只能看到读数，难以解释能源消耗发生在哪里、由什么设备和活动产生。',
    actions: '分区分项计量、照明空调用时分析、有无人节能、异常能耗识别与策略下发。',
    integrations: '电表、水表、毫米波传感器、照明、空调、能源平台。',
    overlays: [
      { label: '分区能耗', value: '办公区 42% · 公区 28% · 机房 30%' },
      { label: '节能策略', value: '空闲区自动降载 · 有无人联动开启' },
    ],
    workflow: [
      { title: '采集分区与设备能耗', description: '电表、水表与设备运行数据持续回传。' },
      { title: '关联占用与场景活动', description: '结合毫米波等感知解释能耗来源。' },
      { title: '识别空耗与异常波动', description: '发现空闲耗能与异常尖峰。' },
      { title: '生成节能执行策略', description: '按区域与时段制定调节计划。' },
      { title: '下发照明空调控制', description: '联动末端设备完成节能动作。' },
      { title: '复盘效果并迭代策略', description: '对比改造前后曲线持续优化。' },
    ],
  },
  {
    id: 'meeting',
    shortName: '会议运维',
    name: '会议运维智能体',
    tagline: '会议全流程自动运行',
    description: '连接预约、签到、中控、桌牌和音视频设备，让会议全流程自动运行。',
    image: '/images/agents/meeting.jpg',
    href: '../agent-detail/?id=meeting',
    icon: 'meeting_room',
    problem: '会议预约冲突、会前准备依赖人工、设备状态不明、会后设备未及时关闭。',
    actions: '检查预约冲突、准备会议室、更新桌牌门牌、开启设备、联动音视频、离场关闭。',
    integrations: '会议预约、门禁、中控屏、电子桌牌、显示设备、音视频会议系统。',
    overlays: [
      { label: '会议室', value: 'A301 · 已预约 14:00-15:30' },
      { label: '会前准备', value: '空调已开 · 桌牌已更新 · 大屏待命' },
    ],
    workflow: [
      { title: '用户发起会议预约', description: '提交时间、人数与会议需求。' },
      { title: '检查时间和会议室冲突', description: '自动校验可用房间与资源。' },
      { title: '分配会议室及座位', description: '确认房间并同步会议信息。' },
      { title: '下发门禁、门牌和桌牌', description: '权限与显示信息同步更新。' },
      { title: '会前开启空调、大屏和音视频', description: '按日程自动完成设备准备。' },
      { title: '离场后关闭设备并生成记录', description: '释放资源并沉淀会议运维记录。' },
    ],
  },
  {
    id: 'exhibition',
    shortName: '展厅',
    name: '展厅智能体',
    tagline: '内容与氛围自动编排',
    description: '连接数字孪生、大屏、讲解流程和空间设备，让展厅内容与氛围自动编排。',
    image: '/images/agents/exhibition.jpg',
    href: '../agent-detail/?id=exhibition',
    icon: 'view_in_ar',
    problem: '展厅内容切换依赖人工、讲解过程不统一、展项与空间设备相互割裂。',
    actions: '按照参观对象调用讲解脚本、切换大屏内容、联动灯光与展项、追踪设备状态。',
    integrations: '3D大屏、数字孪生、信息发布、灯光系统、音视频设备与互动展项。',
    overlays: [
      { label: '当前脚本', value: 'VIP 参观路线 · 第 2 站' },
      { label: '展项状态', value: '大屏播放中 · 灯光场景 B' },
    ],
    workflow: [
      { title: '识别参观对象与路线', description: '按访客类型选择讲解脚本。' },
      { title: '编排大屏与孪生内容', description: '准备对应章节与可视化内容。' },
      { title: '联动灯光与展项状态', description: '同步氛围与互动展项。' },
      { title: '推进讲解与导览节点', description: '按动线切换内容与提示。' },
      { title: '监控展项与设备健康', description: '异常及时告警并转工单。' },
      { title: '沉淀参观过程数据', description: '用于复盘体验与内容优化。' },
    ],
  },
  {
    id: 'visitor',
    aliases: ['reception'],
    shortName: '访客接待',
    name: '访客接待智能体',
    tagline: '从邀约到离场一次编排',
    description: '覆盖访客邀约、登记、通行、接待提醒、空间准备与离场回收。',
    image: '/images/agents/visitor.jpg',
    href: '../agent-detail/?id=visitor',
    icon: 'badge',
    problem: '访客流程割裂、权限人工下发、接待信息不同步、到访后的空间准备不及时。',
    actions: '生成邀约、完成登记、下发权限、通知接待人、准备会议空间、离场回收权限。',
    integrations: '访客系统、门禁、停车、会议预约、信息屏、通知系统与电梯。',
    overlays: [
      { label: '今日访客', value: '已预约 12 · 在途 3 · 已签到 5' },
      { label: '通行状态', value: '门禁已授权 · 接待人已通知' },
    ],
    workflow: [
      { title: '发起访客邀约', description: '接待人或系统生成来访邀请。' },
      { title: '访客登记信息', description: '完成身份与来访目的登记。' },
      { title: '下发通行权限', description: '同步门禁、停车与电梯权限。' },
      { title: '到访后通知接待人', description: '实时提醒并对接接待安排。' },
      { title: '自动准备会面空间', description: '联动会议与空间服务能力。' },
      { title: '离场后回收权限', description: '及时失效权限并沉淀来访记录。' },
    ],
  },
  {
    id: 'opc',
    shortName: 'OPC运营',
    name: 'OPC运营智能体',
    tagline: '从获客到成交可运营',
    description: '连接空间资源发布、分享获客、预约带看、签约和订单运营。',
    image: '/images/agents/opc.jpg',
    href: '../agent-detail/?id=opc',
    icon: 'storefront',
    problem: '空间资源分散、招商线索难沉淀、带看流程效率低、签约与订单信息不同步。',
    actions: '发布资源、生成分享入口、收集线索、安排带看、推进签约、生成订单并跟踪状态。',
    integrations: '招商系统、空间资源库、预约带看、合同、订单和费用结算系统。',
    overlays: [
      { label: '可招商空间', value: '在售 28 · 今日带看 6' },
      { label: '线索转化', value: '新增线索 15 · 待跟进 9' },
    ],
    workflow: [
      { title: '发布空间资源', description: '统一上架可招商空间与状态。' },
      { title: '生成分享获客入口', description: '对外触达并沉淀线索。' },
      { title: '收集并分配线索', description: '跟进责任与优先级清晰。' },
      { title: '安排预约带看', description: '联动空间体验与接待流程。' },
      { title: '推进签约与订单', description: '合同、订单信息同步流转。' },
      { title: '跟踪入驻与运营状态', description: '成交后继续服务与复盘。' },
    ],
  },
  {
    id: 'hospitality',
    shortName: '酒店公寓',
    name: '酒店公寓智能体',
    tagline: '入住授权与费用闭环',
    description: '统一管理房间分配、入住授权、客房设备、能源计量与费用结算。',
    image: '/images/agents/hospitality.jpg',
    href: '../agent-detail/?id=hospitality',
    icon: 'apartment',
    problem: '房间分配依赖人工、入住权限管理复杂、客房设备与水电费用缺少统一管理。',
    actions: '分配房间、下发门锁权限、联动客房设备、读取水电用量、计算入住费用。',
    integrations: '房态系统、蓝牙门锁、客房中控、水电表、支付和费用结算系统。',
    overlays: [
      { label: '房态', value: '可售 46 · 在住 112 · 待清扫 8' },
      { label: '客房联动', value: '门锁已授权 · 中控场景已准备' },
    ],
    workflow: [
      { title: '办理入住并分配房间', description: '按规则完成分房与房态更新。' },
      { title: '下发门锁与通行权限', description: '权限即时生效并可追踪。' },
      { title: '联动客房设备与场景', description: '灯光空调等按入住策略准备。' },
      { title: '读取水电与能耗数据', description: '计量数据进入费用核算。' },
      { title: '计算并结算入住费用', description: '租金与能源费用一体化处理。' },
      { title: '退房回收权限并复位', description: '权限失效、设备复位、房态释放。' },
    ],
  },
  {
    id: 'asset',
    shortName: '资产管理',
    name: '资产管理智能体',
    tagline: '台账、定位与流转一体',
    description: '覆盖资产登记、盘点、定位、领用借还、异常预警与全生命周期管理。',
    image: '/images/agents/asset.jpg',
    href: '../agent-detail/?id=asset',
    icon: 'inventory_2',
    problem: '资产数量不清、位置难找、领用借还记录缺失、盘点依赖大量人工。',
    actions: '建立资产台账、自动盘点、查询位置、管理借还、识别异常并更新生命周期状态。',
    integrations: 'RFID标签、定位标签、读写设备、盘点车、资产台账和工单系统。',
    overlays: [
      { label: '台账状态', value: '在库 1286 · 领用中 214' },
      { label: '盘点进度', value: '本周已盘 82% · 异常 6' },
    ],
    workflow: [
      { title: '建立并维护资产台账', description: '登记资产身份与归属信息。' },
      { title: '标签绑定与定位采集', description: 'RFID/定位标签持续回传位置。' },
      { title: '发起盘点或查询位置', description: '快速核对数量与空间分布。' },
      { title: '管理领用借还流程', description: '流转记录可追溯可审计。' },
      { title: '识别异常并触发工单', description: '丢失、越界等异常及时预警。' },
      { title: '更新生命周期状态', description: '报废、维修、调拨状态闭环。' },
    ],
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
