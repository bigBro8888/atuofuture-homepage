/** 新闻中心示例内容（可替换） */

/**
 * @typedef {{ heading: string, paragraphs: string[], showCover?: boolean }} NewsSection
 * @typedef {{
 *   id: string,
 *   category: string,
 *   date: string,
 *   title: string,
 *   summary: string,
 *   cover: string,
 *   author?: string,
 *   tags?: string[],
 *   sections: NewsSection[],
 * }} NewsItem
 */

/** @type {NewsItem[]} */
export const NEWS_ITEMS = [
  {
    id: 'n1',
    category: '公司动态',
    date: '2026-07-18',
    title: '安托未来发布 AI 原生空间智能架构',
    summary:
      '以智能体编排为核心，打通传感、网关、中控与开放接口。本文说明架构定位、适用场景，以及对楼宇与园区客户交付方式的影响。',
    cover: '/images/home-advantages/advantage-ai-agent.webp',
    author: '安托未来',
    tags: ['空间智能', 'AI原生架构', '智能体编排', '开放接口'],
    sections: [
      {
        heading: '一、为什么要做 AI 原生空间架构？',
        paragraphs: [
          '楼宇与园区长期面临系统割裂：照明、空调、门禁、会议与运维各自为政，业务变化往往要靠人工跨系统协调。安托未来发布的 AI 原生空间智能架构，面向这一问题，把「感知—理解—协同—执行」做成可规模交付的闭环。',
          '与传统「堆软件模块」不同，该架构以场景智能体编排为核心，让空间能够按策略主动响应，而不是停留在被动控制面板。',
        ],
        showCover: true,
      },
      {
        heading: '二、架构如何连接现有系统与新增应用？',
        paragraphs: [
          '平台连接毫米波等传感终端、无线/多功能网关、中控屏，以及客户既有业务系统，支持标准化 API 与灵活接入。客户可保留现有投资，同时为后续应用预留扩展空间。',
          '对交付侧而言，这意味着更低的单厂商锁定风险，以及更清晰的分层：上层协同、边缘与终端可本地闭环，弱网场景仍可保持可控。',
        ],
      },
      {
        heading: '三、适合谁 / 下一步',
        paragraphs: [
          '该架构适合正在推进楼宇智能化、园区统一运营，或希望把多套子系统收敛到一套空间中枢的客户与集成商。下一步可从场景评估与方案演示开始，明确优先落地的智能体与硬件组合。',
        ],
      },
    ],
  },
  {
    id: 'n2',
    category: '产品更新',
    date: '2026-06-30',
    title: '会议运维智能体支持云视频与中控联动',
    summary:
      '预约、签到、中控与云视频形成运维闭环。本文介绍联动范围、对行政与 IT 的价值，以及典型总部办公落地方式。',
    cover: '/assets/hero/capability-agents.jpg',
    author: '安托未来',
    tags: ['会议运维', '云视频', '中控联动', '总部办公'],
    sections: [
      {
        heading: '一、会议运维为何仍是高协作成本场景？',
        paragraphs: [
          '会议室状态、设备可用性、日程与现场执行往往分散在多个系统里，行政与 IT 需要反复切换与人工确认。会议运维智能体新增云视频与中控联动后，把预约、签到、会前准备、会中控制与会后复位串成一条链路。',
        ],
        showCover: true,
      },
      {
        heading: '二、联动后能减少哪些现场干预？',
        paragraphs: [
          '统一入口可查看会议室占用、设备状态与会议日程；临近开会时可按策略联动照明、空调、显示与音视频终端，减少临时找人调试。',
          '会后复位与资源释放也可由智能体触发，提升会议室周转效率与体验一致性。',
        ],
      },
      {
        heading: '三、适合谁 / 下一步',
        paragraphs: [
          '适合会议量大、多系统并存的总部办公与园区客户。可先选择试点楼层验证联动清单，再扩展到全量会议室与云视频账号体系。',
        ],
      },
    ],
  },
  {
    id: 'n3',
    category: '方案实践',
    date: '2026-06-12',
    title: '毫米波有无人感知助力楼宇节能落地',
    summary:
      '能源能耗智能体结合毫米波传感器，按真实占用调节照明与空调。本文梳理落地逻辑、适用区域与可观察的节能路径。',
    cover: '/images/home-advantages/advantage-layered-loop.webp',
    author: '安托未来',
    tags: ['毫米波感知', '楼宇节能', '能源能耗', '有无人'],
    sections: [
      {
        heading: '一、从定时策略到真实占用',
        paragraphs: [
          '粗放定时开关灯与空调，容易在空闲时段浪费能耗，也难适应开放办公与会议室的动态占用。毫米波有无人感知为能源能耗智能体提供更贴近现场的占用信号。',
        ],
        showCover: true,
      },
      {
        heading: '二、按区域调节照明与空调',
        paragraphs: [
          '系统可按区域占用动态调节照明与空调，空闲时段自动降载；同时为分项计量与能效分析沉淀数据，便于后续策略迭代。',
        ],
      },
      {
        heading: '三、适合谁 / 下一步',
        paragraphs: [
          '适合开放办公、会议室与公共区域等场景。建议先圈定试点区域对比改造前后能耗曲线，再决定是否扩大部署密度。',
        ],
      },
    ],
  },
  {
    id: 'n4',
    category: '产品更新',
    date: '2026-05-20',
    title: '中控屏升级：蓝牙直连 + 第三方协议接入',
    summary:
      '同一中控可直连自有蓝牙设备，也可经服务器对接 KNX、BUS 等协议。本文说明升级价值与现场部署选择。',
    cover: '/assets/hero/capability-hardware.jpg',
    author: '安托未来',
    tags: ['中控屏', '蓝牙直连', 'KNX', '协议接入'],
    sections: [
      {
        heading: '一、现场对接为什么总卡在「协议与链路」？',
        paragraphs: [
          '楼宇现状往往既有自有设备，也有第三方弱电系统。中控屏升级后，同一终端可蓝牙直连安托设备，也可经服务器侧对接 KNX、BUS 等协议，按现场条件选择路径。',
        ],
        showCover: true,
      },
      {
        heading: '二、对交付周期意味着什么？',
        paragraphs: [
          '直连适合快速落地自有设备；协议接入适合保护既有投资、降低改造面。中控作为边缘执行节点，可承接上层智能体策略，并在弱网时保持本地可控。',
        ],
      },
      {
        heading: '三、适合谁 / 下一步',
        paragraphs: [
          '适合新建与改造并存的项目。可先梳理目标楼层设备清单与协议类型，再确定中控部署数量与接入方式。',
        ],
      },
    ],
  },
  {
    id: 'n5',
    category: '公司动态',
    date: '2026-04-28',
    title: 'AI Token 服务独立站点上线',
    summary:
      '模型与工具能力以 Token 方式计量交付。本文介绍独立站定位，以及与空间智能业务的关系。',
    cover: '/assets/hero/capability-api.jpg',
    author: '安托未来',
    tags: ['AI Token', '模型能力', '计量交付'],
    sections: [
      {
        heading: '一、为什么把 Token 服务做成独立站？',
        paragraphs: [
          '模型与工具调用需要独立的计量、说明与商务路径。AI Token 独立站上线后，能力以 Token 方式交付，便于按项目规模与调用量采购，并与空间智能主站解耦运营。',
        ],
        showCover: true,
      },
      {
        heading: '二、官网如何配合？',
        paragraphs: [
          '官网保留入口说明与商务对接通道；详细产品能力与接入指引以 Token 独立站为准，避免信息混杂。',
        ],
      },
      {
        heading: '三、适合谁 / 下一步',
        paragraphs: [
          '适合需要按量调用模型与工具能力的客户与合作伙伴。可先确认业务场景与预估调用量，再通过独立站或商务渠道开通。',
        ],
      },
    ],
  },
  {
    id: 'n6',
    category: '方案实践',
    date: '2026-03-15',
    title: '酒店公寓智能体完成分房与门锁联调',
    summary:
      '分房策略、蓝牙门锁授权与客房能耗统计一体化演示通过。本文回顾联调范围与对运营效率的意义。',
    cover: '/images/home-advantages/advantage-wireless-access.webp',
    author: '安托未来',
    tags: ['酒店公寓', '分房', '蓝牙门锁', '客房能耗'],
    sections: [
      {
        heading: '一、入住链路里最容易断在哪里？',
        paragraphs: [
          '分房、门锁授权与客房能耗往往分属不同系统，入住与退房环节容易靠人工衔接。酒店公寓智能体完成一体化联调后，演示了从分房到授权再到能耗回传的闭环。',
        ],
        showCover: true,
      },
      {
        heading: '二、联调覆盖哪些关键动作？',
        paragraphs: [
          '入住办理后可自动下发门锁权限，退房后及时回收；客房环境与能耗数据回传运营侧，支撑精细化管理与周转分析。',
        ],
      },
      {
        heading: '三、适合谁 / 下一步',
        paragraphs: [
          '适合精品酒店、长租公寓与服务式公寓等场景。可从单栋或单层试点开始，验证门锁协议与 PMS/运营系统对接方式。',
        ],
      },
    ],
  },
]

/** @param {string | null | undefined} id */
export function getNewsById(id) {
  if (!id) return null
  return NEWS_ITEMS.find((n) => n.id === id) || null
}

/** @param {string} date */
export function formatNewsDate(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!m) return date
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`
}
