/** 新闻中心示例内容（可替换） */

/**
 * @typedef {{
 *   id: string,
 *   category: string,
 *   date: string,
 *   title: string,
 *   summary: string,
 *   cover: string,
 *   body: string[],
 * }} NewsItem
 */

/** @type {NewsItem[]} */
export const NEWS_ITEMS = [
  {
    id: 'n1',
    category: '公司动态',
    date: '2026-07-18',
    title: '安托未来发布 AI 原生空间智能架构',
    summary: '以智能体编排为核心，打通传感、网关、中控与开放接口，服务楼宇与园区客户。',
    cover: '/images/home-advantages/advantage-ai-agent.webp',
    body: [
      '安托未来正式发布 AI 原生空间智能架构，面向楼宇、园区与多业态空间，构建「感知—理解—协同—执行」的完整闭环。',
      '该架构以场景智能体编排为核心，连接毫米波等传感终端、无线/多功能网关、中控屏以及客户既有业务系统，支持标准化 API 与灵活接入。',
      '面向交付侧，平台强调开放与可扩展：既可对接客户现有系统，也可预留新增应用扩展空间，降低单厂商锁定风险，便于规模复制。',
    ],
  },
  {
    id: 'n2',
    category: '产品更新',
    date: '2026-06-30',
    title: '会议运维智能体支持云视频与中控联动',
    summary: '预约、签到、中控与云视频形成运维闭环，降低行政与 IT 协同成本。',
    cover: '/assets/hero/capability-agents.jpg',
    body: [
      '会议运维智能体新增云视频与中控联动能力，覆盖预约、签到、会前准备、会中控制与会后复位等关键环节。',
      '行政与 IT 可通过统一入口查看会议室状态、设备可用性与会议日程，减少跨系统切换与现场人工干预。',
      '在典型总部办公场景中，智能体可按会议日程自动联动照明、空调、显示与音视频终端，提升会议室利用率与体验一致性。',
    ],
  },
  {
    id: 'n3',
    category: '方案实践',
    date: '2026-06-12',
    title: '毫米波有无人感知助力楼宇节能落地',
    summary: '能源能耗智能体结合毫米波传感器，按真实占用调节照明与空调策略。',
    cover: '/images/home-advantages/advantage-layered-loop.webp',
    body: [
      '在楼宇节能实践中，能源能耗智能体结合毫米波有无人感知，以真实占用替代粗放定时策略。',
      '系统可按区域占用情况动态调节照明与空调，并在空闲时段自动降载，减少无效能耗。',
      '该方案适合开放办公、会议室与公共区域等场景，既保障舒适度，也为后续分项计量与能效分析提供数据基础。',
    ],
  },
  {
    id: 'n4',
    category: '产品更新',
    date: '2026-05-20',
    title: '中控屏升级：蓝牙直连 + 第三方协议接入',
    summary: '同一中控可直连自有蓝牙设备，也可经服务器对接 KNX、BUS 等协议。',
    cover: '/assets/hero/capability-hardware.jpg',
    body: [
      '中控屏能力升级后，同一终端既可蓝牙直连安托自有设备，也可经服务器侧对接 KNX、BUS 等第三方协议。',
      '现场部署时可按楼宇现状选择直连或协议接入，缩短联调周期，降低对既有弱电系统的改造成本。',
      '升级后中控更适合作为边缘执行节点，承接上层智能体下发的场景策略，并在弱网时保持本地可控。',
    ],
  },
  {
    id: 'n5',
    category: '公司动态',
    date: '2026-04-28',
    title: 'AI Token 服务独立站点上线',
    summary: '模型与工具能力以 Token 方式计量交付，详情请访问 Token 独立站。',
    cover: '/assets/hero/capability-api.jpg',
    body: [
      '安托未来 AI Token 服务独立站点正式上线，面向需要调用模型与工具能力的客户与合作伙伴。',
      '能力以 Token 方式计量交付，便于按项目规模与调用量灵活采购，并与空间智能业务解耦运营。',
      '更多产品说明与接入指引，可前往 Token 独立站查看；官网保留入口说明与商务对接通道。',
    ],
  },
  {
    id: 'n6',
    category: '方案实践',
    date: '2026-03-15',
    title: '酒店公寓智能体完成分房与门锁联调',
    summary: '分房策略、蓝牙门锁授权与客房能耗统计一体化演示通过。',
    cover: '/images/home-advantages/advantage-wireless-access.webp',
    body: [
      '酒店公寓智能体完成分房策略、蓝牙门锁授权与客房能耗统计的一体化联调演示。',
      '入住办理后可自动下发门锁权限，退房后及时回收；客房环境与能耗数据可回传至运营侧，支撑精细化管理。',
      '该能力适用于精品酒店、长租公寓与服务式公寓等场景，帮助运营团队缩短入住链路并提升客房周转效率。',
    ],
  },
]

/** @param {string | null | undefined} id */
export function getNewsById(id) {
  if (!id) return null
  return NEWS_ITEMS.find((n) => n.id === id) || null
}
