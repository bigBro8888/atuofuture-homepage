/** 七类产品智能体详情 —— 供 agent-detail 页按 id 渲染 */
export const AGENT_DETAILS = {
  space: {
    name: '空间服务智能体',
    icon: 'tune',
    accent: '0, 82, 209',
    eyebrow: 'Space Agent',
    tagline: '统一调度空调、照明、设备控制、智能工单与信息发布，让空间按场景自动响应。',
    overview:
      '空间服务智能体面向办公与楼宇空间运营，把环境控制、设备状态、工单流转与信息发布编排成可执行策略。无论是会议准备、下班节能还是异常报修，都能按规则自动触发并闭环跟踪。',
    capabilities: [
      { icon: 'ac_unit', title: '空调与照明策略', desc: '按时段、占用与场景策略联动启停与调光调温。' },
      { icon: 'settings_remote', title: '设备控制回读', desc: '远程控制终端设备并回读状态，形成可信执行闭环。' },
      { icon: 'assignment', title: '智能工单', desc: '异常与服务请求自动生成工单并流转处理。' },
      { icon: 'campaign', title: '信息发布', desc: '门牌、相框与大屏内容按场景自动切换。' },
    ],
    workflow: [
      { title: '感知', desc: '汇聚占用、环境与设备状态。' },
      { title: '研判', desc: '匹配场景规则与节能/舒适策略。' },
      { title: '执行', desc: '下发控制指令并联动信息发布。' },
      { title: '闭环', desc: '跟踪工单与执行结果，持续优化。' },
    ],
    metrics: [
      { value: '多场景', label: '策略编排' },
      { value: '软硬一体', label: '执行闭环' },
      { value: '可开放', label: '接口接入' },
    ],
    scenarios: ['智慧办公楼', '园区楼栋', '会议室集群', '展厅与大堂'],
  },
  energy: {
    name: '能源能耗智能体',
    icon: 'bolt',
    accent: '0, 121, 107',
    eyebrow: 'Energy Agent',
    tagline: '按区域与功能分项计量，结合毫米波有无人感知，把照明与空调的用时和能耗说清楚。',
    overview:
      '能源能耗智能体把计量、占用感知与控制策略打通：按区域/功能看清用时与能耗，并在无人时段自动收敛照明与空调，减少空耗。',
    capabilities: [
      { icon: 'speed', title: '分项计量', desc: '按区域与功能拆分用电用水，支撑归因分析。' },
      { icon: 'schedule', title: '用时分析', desc: '统计照明与空调实际运行时长。' },
      { icon: 'sensors', title: '有无人节能', desc: '毫米波/PIR 感知占用，驱动节能策略。' },
      { icon: 'notification_important', title: '异常告警', desc: '异常峰值与空转能耗及时提醒。' },
    ],
    workflow: [
      { title: '计量采集', desc: '电表、水表与设备功率数据汇聚。' },
      { title: '占用感知', desc: '毫米波人数/人存判断真实使用。' },
      { title: '策略执行', desc: '无人时收敛照明空调，有人时保障舒适。' },
      { title: '复盘优化', desc: '输出区域能耗报表与改进建议。' },
    ],
    metrics: [
      { value: '分项', label: '计量维度' },
      { value: '毫米波', label: '占用感知' },
      { value: '可告警', label: '异常能耗' },
    ],
    scenarios: ['楼宇节能改造', '园区能耗管理', '会议室空耗治理', '酒店客房能耗'],
  },
  meeting: {
    name: '会议智能体',
    icon: 'meeting_room',
    accent: '21, 101, 192',
    eyebrow: 'Meeting Agent',
    tagline: '从预约到会议结束，全流程自动运行：预约签到、中控联动与音视频运维。',
    overview:
      '会议智能体服务行政与 IT：从预约冲突检测、签到核验，到中控开停与云视频接入，把会议室日常运维变成可自动化流程。',
    capabilities: [
      { icon: 'event_available', title: '预约与冲突检测', desc: '统一会议室资源，避免重复预订。' },
      { icon: 'how_to_reg', title: '签到核验', desc: '到会核验与未到释放，提高房间周转。' },
      { icon: 'smart_display', title: '中控联动', desc: '一键开停灯光、空调、投影与桌牌。' },
      { icon: 'videocam', title: '云视频接入', desc: '与云视频会议终端联动启停。' },
    ],
    workflow: [
      { title: '预约', desc: '创建会议并检测资源冲突。' },
      { title: '准备', desc: '会前联动中控预启环境与设备。' },
      { title: '开会', desc: '签到、中控与云视频协同。' },
      { title: '收尾', desc: '会后释放房间并回收能耗。' },
    ],
    metrics: [
      { value: '预约→收尾', label: '全流程' },
      { value: '中控', label: '一键编排' },
      { value: '云视频', label: '可接入' },
    ],
    scenarios: ['企业会议室集群', '总部会议中心', '园区共享会议室', '培训教室'],
  },
  exhibition: {
    name: '展厅智能体',
    icon: 'view_in_ar',
    accent: '94, 53, 177',
    eyebrow: 'Showroom Agent',
    tagline: '驱动 3D 大屏与数字孪生，让展厅讲解、内容切换与空间氛围自动编排。',
    overview:
      '展厅智能体面向企业展厅与招商中心，把内容编排、讲解流程、数字孪生与氛围灯光统一调度，让参观体验可配置、可复用。',
    capabilities: [
      { icon: 'desktop_windows', title: '3D 大屏编排', desc: '按参观节点切换大屏内容与镜头。' },
      { icon: 'view_in_ar', title: '数字孪生联动', desc: '孪生模型与现场设备状态同步展示。' },
      { icon: 'record_voice_over', title: '讲解导览', desc: '讲解脚本与空间动线联动推进。' },
      { icon: 'visibility', title: '展项可视化', desc: '展项状态与互动数据实时可见。' },
    ],
    workflow: [
      { title: '场景配置', desc: '配置参观脚本、内容节点与设备映射。' },
      { title: '接待触发', desc: '访客到访后启动对应讲解流程。' },
      { title: '内容编排', desc: '大屏、孪生与氛围按节点切换。' },
      { title: '复盘沉淀', desc: '记录参观路径与互动数据。' },
    ],
    metrics: [
      { value: '3D', label: '大屏叙事' },
      { value: '孪生', label: '状态可视' },
      { value: '可脚本化', label: '讲解流程' },
    ],
    scenarios: ['企业展厅', '园区招商中心', '产品体验馆', '数字展项空间'],
  },
  visitor: {
    name: '访客接待智能体',
    icon: 'badge',
    accent: '2, 119, 189',
    eyebrow: 'Visitor Agent',
    tagline: '覆盖访客邀约、登记、通行、接待提醒、空间准备与离场流程。',
    overview:
      '访客接待智能体把邀约、登记、通行权限、接待通知与空间准备连成一条链，减少前台与行政的临时协调，并在离场后回收权限。',
    capabilities: [
      { icon: 'edit_calendar', title: '邀约与登记', desc: '线上邀约与现场登记统一入口。' },
      { icon: 'lock_open', title: '通行权限下发', desc: '按来访范围下发临时门禁权限。' },
      { icon: 'notifications_active', title: '接待提醒', desc: '自动通知被访人与前台。' },
      { icon: 'meeting_room', title: '空间准备与离场', desc: '联动会面空间准备，离场回收权限。' },
    ],
    workflow: [
      { title: '发起邀约', desc: '填写来访信息并生成通行凭证。' },
      { title: '到访识别', desc: '核验身份并开放通行权限。' },
      { title: '接待与空间准备', desc: '通知接待人并准备会面空间。' },
      { title: '离场回收', desc: '签退并回收临时权限。' },
    ],
    metrics: [
      { value: '端到端', label: '来访闭环' },
      { value: '权限', label: '自动下发' },
      { value: '可留痕', label: '接待记录' },
    ],
    scenarios: ['总部大堂', '园区访客中心', '商务来访', '面试接待'],
  },
  opc: {
    name: '商业空间运营智能体',
    icon: 'storefront',
    accent: '183, 110, 40',
    eyebrow: 'OPC · Commercial Ops Agent',
    tagline: '让商业空间从展示、带看到签约持续运营（OPC）。',
    overview:
      '商业空间运营智能体（OPC）面向商业与空间运营团队，把空间发布、获客带看、签约订单与入驻运营串成可执行链路，降低线索流失与协作成本。',
    capabilities: [
      { icon: 'campaign', title: '空间资源发布', desc: '统一发布可招商/可租赁空间资源。' },
      { icon: 'share', title: '分享获客', desc: '支持分享触达与线索沉淀。' },
      { icon: 'event', title: '预约带看', desc: '自动编排带看时间与空间准备。' },
      { icon: 'handshake', title: '签约与运营', desc: '签约订单与运营协同回流。' },
    ],
    workflow: [
      { title: '发布', desc: '上架空间资源并配置展示信息。' },
      { title: '获客', desc: '线索进入并预约带看。' },
      { title: '成交', desc: '签约与订单确认。' },
      { title: '运营', desc: '入驻后持续运营协同。' },
    ],
    metrics: [
      { value: '发布→成交', label: '运营闭环' },
      { value: '带看', label: '可编排' },
      { value: '订单', label: '可协同' },
    ],
    scenarios: ['商业资产招商', '园区企业服务', '联合办公运营', '空间可视化获客'],
  },
  hospitality: {
    name: '酒店公寓智能体',
    icon: 'apartment',
    accent: '0, 105, 92',
    eyebrow: 'Hospitality Agent',
    tagline: '分配房间、蓝牙门锁与客房设备能耗统一管理，提升入住与运营效率。',
    overview:
      '酒店公寓智能体面向公寓与短租运营：智能分房、蓝牙门锁授权、客房设备控制与房间能耗统计一体管理，降低前台与工程协同成本。',
    capabilities: [
      { icon: 'hotel', title: '智能分房', desc: '按房态与规则自动推荐与分配房间。' },
      { icon: 'lock', title: '蓝牙门锁授权', desc: '入住授权、退房回收，减少实体钥匙。' },
      { icon: 'settings_remote', title: '客房设备控制', desc: '灯光空调等设备远程与场景控制。' },
      { icon: 'monitoring', title: '房间能耗统计', desc: '按房统计能耗，支撑运营分析。' },
    ],
    workflow: [
      { title: '入住准备', desc: '分房并生成门锁临时授权。' },
      { title: '入住中', desc: '设备控制与服务请求响应。' },
      { title: '能耗跟踪', desc: '统计房间用能与异常。' },
      { title: '退房回收', desc: '回收权限并复位设备状态。' },
    ],
    metrics: [
      { value: '分房', label: '自动化' },
      { value: '蓝牙锁', label: '无钥匙' },
      { value: '能耗', label: '可按房' },
    ],
    scenarios: ['服务式公寓', '精品酒店', '长租公寓', '企业招待所'],
  },
  asset: {
    name: '资产管理智能体',
    icon: 'inventory_2',
    accent: '69, 90, 100',
    eyebrow: 'Asset Agent',
    tagline: '资产盘点、领用借还与全生命周期管理，让资产状态实时可查。',
    overview:
      '资产管理智能体覆盖台账、盘点、领用借还与定位标签联动，帮助企业把资产从“事后找”变成“实时知”，支撑全生命周期治理。',
    capabilities: [
      { icon: 'checklist', title: '盘点核对', desc: '按区域/责任人快速盘点与差异核对。' },
      { icon: 'swap_horiz', title: '领用借还', desc: '规范领用流程与归还提醒。' },
      { icon: 'location_on', title: '定位标签联动', desc: '定位资产位置，缩短查找时间。' },
      { icon: 'history_edu', title: '生命周期台账', desc: '采购、使用、维保到报废全程留痕。' },
    ],
    workflow: [
      { title: '建档', desc: '资产入库建档并绑定标签。' },
      { title: '流转', desc: '领用借还与责任人变更。' },
      { title: '盘点', desc: '定期盘点并处理差异。' },
      { title: '治理', desc: '维保、调拨与报废闭环。' },
    ],
    metrics: [
      { value: '全周期', label: '台账管理' },
      { value: '定位', label: '可查找' },
      { value: '盘点', label: '可核对' },
    ],
    scenarios: ['企业固定资产', '园区公用资产', '展厅展项设备', '酒店客房资产'],
  },
}

export const AGENT_ORDER = ['space', 'energy', 'meeting', 'exhibition', 'visitor', 'opc', 'hospitality', 'asset']

/** 兼容旧链接与别名 */
export const AGENT_ID_ALIASES = {
  reception: 'visitor',
  visitor: 'visitor',
  space: 'space',
  energy: 'energy',
  meeting: 'meeting',
  exhibition: 'exhibition',
  opc: 'opc',
  hospitality: 'hospitality',
  asset: 'asset',
}

export function resolveAgentId(rawId) {
  if (!rawId) return null
  const mapped = AGENT_ID_ALIASES[rawId] || rawId
  return AGENT_DETAILS[mapped] ? mapped : null
}
