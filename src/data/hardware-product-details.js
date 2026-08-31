/** 企业级产品介绍页叙事数据（非商城详情） */

import { ASPACE_SOLUTION_HREF } from './hardware-catalog.js'

/** 各产品在业务系统中的角色定位 */
export const PRODUCT_ROLES = {
  'control-screen': {
    heroTitle: '空间智能中控屏',
    role: '连接人员、空间设备、智能体与管理平台的统一交互入口',
    headline: '让空间具备统一控制、场景联动与智能协同能力。',
    description:
      '它不是孤立的控制设备，而是连接人员、空间设备、智能体与管理平台的统一交互入口。',
  },
  sensor: {
    heroTitle: '空间智能传感器',
    role: '让空间具备感知能力',
    headline: '让空间具备持续感知环境与占用状态的能力。',
    description: '传感器采集现场数据，为智能体决策与设备联动提供依据。',
  },
  gateway: {
    heroTitle: '空间智能网关',
    role: '连接现场设备、边缘计算与平台',
    headline: '让现场设备稳定接入，并在边缘完成汇聚与处理。',
    description: '网关承担协议转换、本地处理与平台连接，保障空间系统稳定运行。',
  },
  'e-table-sign': {
    heroTitle: '电子桌牌',
    role: '连接会议身份、座次与会务流程',
    headline: '让会议席位信息与会务状态同步可见。',
    description: '电子桌牌服务会议身份识别、座次展示与会务流程协同。',
  },
  'desk-screen': {
    heroTitle: '工位屏',
    role: '连接人员、工位与办公服务',
    headline: '让工位成为可识别、可服务、可联动的办公节点。',
    description: '工位屏连接人员身份、工位状态与办公空间服务。',
  },
  'smart-lighting': {
    heroTitle: '智能照明',
    role: '执行空间照明策略与场景联动',
    headline: '让照明按场景与占用策略自动响应。',
    description: '智能照明承接中控与智能体指令，完成调光与场景执行。',
  },
  'smart-hvac': {
    heroTitle: '智能空调系统',
    role: '执行温度策略与空间环境联动',
    headline: '让空调按会议与办公节奏进入预设状态。',
    description: '智能空调系统与空间场景联动，支撑舒适与节能目标。',
  },
  'switch-control': {
    heroTitle: '开关与设备控制',
    role: '执行回路通断与设备本地控制',
    headline: '让用电设备可被场景统一调度。',
    description: '开关与设备控制承接中控指令，完成回路与设备执行。',
  },
  'eink-price-tag': {
    heroTitle: '墨水屏电子价签',
    role: '连接商品信息、门店运营与内容更新',
    headline: '让货架信息随运营节奏远程更新。',
    description: '墨水屏电子价签服务门店改价、促销与货架信息同步。',
  },
  'lcd-price-tag': {
    heroTitle: 'LCD 电子价签',
    role: '连接商品信息、门店运营与高对比展示',
    headline: '让重点货架信息更清晰、更及时。',
    description: 'LCD 电子价签适合高对比展示场景下的商品信息更新。',
  },
  'cold-tag': {
    heroTitle: '低温标签',
    role: '服务冷链环境的信息展示与状态管理',
    headline: '让冷链场景也能稳定呈现关键信息。',
    description: '低温标签面向冷链仓储与生鲜门店的信息展示需求。',
  },
  aap: {
    heroTitle: 'AAP 资产盘点',
    role: '连接资产识别、盘点与管理流程',
    headline: '让资产盘点进入可追踪的管理闭环。',
    description: 'AAP 资产盘点连接标签识别、盘点执行与资产管理流程。',
  },
  'eink-phone-case': {
    heroTitle: 'AI 墨水屏手机壳',
    role: '展示智能生成内容与个性化体验',
    headline: '让智能生成内容进入随身终端。',
    description: 'AI 墨水屏手机壳强调个性化内容展示与使用体验。',
  },
  'eink-frame': {
    heroTitle: 'AI 电子纸艺术相框',
    role: '连接数字内容与实体空间展示',
    headline: '让数字内容以电子纸形态进入空间。',
    description: 'AI 电子纸艺术相框连接内容生成与实体空间展示。',
  },
}

const CONTROL_SCREEN_STORY = {
  hero: {
    title: '空间智能中控屏',
    headline: '让空间具备统一控制、场景联动与智能协同能力。',
    description:
      '它不是孤立的控制设备，而是连接人员、空间设备、智能体与管理平台的统一交互入口。',
    ctaLabel: '查看它如何工作',
    ctaHref: '#hpi-how',
    backgroundImage: '/images/agents/meeting.jpg',
    deviceImage: '/images/hardware/control-screen.jpg',
  },
  value: {
    diagramImage: '/images/hardware/control-screen.jpg',
  },
  howItWorks: {
    title: '从人的意图，到空间的响应',
    stages: [
      {
        title: '发起操作',
        caption: '用户轻点“会议模式”',
        image: '/images/agents/meeting.jpg',
      },
      {
        title: '理解场景',
        caption: '中控屏识别场景，确认执行',
        image: '/images/solutions/building.jpg',
      },
      {
        title: '设备联动',
        caption: '灯光调节、窗帘关闭、显示开启、空调进入预设状态',
        image: '/images/agents/space.jpg',
      },
      {
        title: '状态反馈',
        caption: '执行完成，状态同步，任务可追踪',
        image: '/images/solutions/hero.jpg',
      },
    ],
  },
  scenarios: {
    title: '一套中控能力，服务不同类型的空间',
    items: [
      {
        title: '会议空间',
        desc: '从会前准备到会后关闭，让设备与会议流程同步。',
        sceneImage: '/images/agents/meeting.jpg',
        deviceImage: '/images/hardware/control-screen.jpg',
      },
      {
        title: '办公空间',
        desc: '统一管理照明、空调与公共设备，让空间按需运行。',
        sceneImage: '/images/agents/space.jpg',
        deviceImage: '/images/hardware/control-screen.jpg',
      },
      {
        title: '楼宇公区',
        desc: '连接公共区域设备与运营系统，形成统一管理入口。',
        sceneImage: '/images/solutions/building.jpg',
        deviceImage: '/images/hardware/control-screen.jpg',
      },
    ],
  },
  system: {
    title: '不是单点设备，而是空间智能系统的一部分',
    upperLabel: '空间智能体与业务应用',
    upperItems: ['会议管理', '工位服务', '能耗管理', '设备运维', '空间预约', '物业管理'],
    middleLabel: '中控屏 · 空间交互与执行入口',
    middleImage: '/images/hardware/control-screen.jpg',
    lowerItems: ['传感器', '照明', '空调', '窗帘', '音视频', '第三方设备'],
    aspaceHref: ASPACE_SOLUTION_HREF,
    aspaceLabel: '了解 ASpace 总体解决方案',
  },
  closing: {
    title: '让中控屏进入你的真实项目场景',
    desc: '根据空间类型、设备条件与系统接口，共同确定适合的接入与实施方案。',
    primaryLabel: '预约方案演示',
    softLinks: [
      { label: '查看技术资料', action: 'demo' },
      { label: '获取产品文档', action: 'demo' },
    ],
  },
}

/**
 * @param {import('./hardware-catalog.js').HardwareProduct} product
 */
export function buildProductStory(product) {
  if (product.id === 'control-screen') return CONTROL_SCREEN_STORY

  const role = PRODUCT_ROLES[product.id] || {
    heroTitle: product.name,
    role: product.shortDescription,
    headline: product.shortDescription,
    description: product.shortDescription,
  }

  const lineId = product.productLine
  const isSpace = lineId === 'space'
  const isRetail = lineId === 'retail'

  return {
    hero: {
      title: role.heroTitle,
      headline: role.headline,
      description: role.description,
      ctaLabel: '查看它如何工作',
      ctaHref: '#hpi-how',
      backgroundImage: isRetail
        ? '/images/solutions/commercial.jpg'
        : isSpace
          ? '/images/agents/space.jpg'
          : '/images/agents/exhibition.jpg',
      deviceImage: product.coverImage,
    },
    value: {
      diagramImage: product.coverImage,
    },
    howItWorks: {
      title: isRetail ? '从内容更新，到门店呈现' : isSpace ? '从人的意图，到空间的响应' : '从内容到体验',
      stages: isRetail
        ? [
            { title: '内容下发', caption: '运营侧发布商品或资产信息', image: '/images/solutions/commercial.jpg' },
            { title: '设备接收', caption: '终端接收并校验更新指令', image: product.coverImage },
            { title: '屏幕更新', caption: '电子纸或 LCD 完成刷新', image: product.coverImage },
            { title: '状态回传', caption: '更新结果回传平台可追踪', image: '/images/solutions/hero.jpg' },
          ]
        : isSpace
          ? [
              { title: '发起操作', caption: '用户或智能体发起任务', image: '/images/agents/space.jpg' },
              { title: '理解场景', caption: '系统确认当前空间状态', image: '/images/solutions/building.jpg' },
              { title: '设备执行', caption: `${product.name}参与联动执行`, image: product.coverImage },
              { title: '状态反馈', caption: '结果同步，任务可追踪', image: '/images/solutions/hero.jpg' },
            ]
          : [
              { title: '选择内容', caption: '确定要展示的数字内容', image: '/images/agents/exhibition.jpg' },
              { title: '终端呈现', caption: `${product.name}完成显示`, image: product.coverImage },
              { title: '空间体验', caption: '内容进入真实使用场景', image: '/images/agents/space.jpg' },
              { title: '持续更新', caption: '支持后续内容更换与管理', image: product.coverImage },
            ],
    },
    scenarios: {
      title: `一套能力，服务${product.name}所面向的场景`,
      items: (product.scenarios || []).slice(0, 3).map((s, i) => ({
        title: typeof s === 'string' ? s : s.title,
        desc: typeof s === 'string' ? role.headline : s.desc || role.headline,
        sceneImage:
          i === 0
            ? '/images/solutions/building.jpg'
            : i === 1
              ? '/images/agents/space.jpg'
              : '/images/solutions/campus.jpg',
        deviceImage: product.coverImage,
      })),
    },
    system: {
      title: '不是单点设备，而是业务系统的一部分',
      upperLabel: isSpace ? '空间智能体与业务应用' : isRetail ? '运营与管理应用' : '内容与体验应用',
      upperItems: isSpace
        ? ['会议管理', '能耗管理', '设备运维', '空间预约']
        : isRetail
          ? ['改价运营', '门店管理', '资产盘点', '内容发布']
          : ['内容生成', '个性化展示', '空间陈列'],
      middleLabel: `${product.name} · ${role.role}`,
      middleImage: product.coverImage,
      lowerItems: isSpace
        ? ['传感器', '照明', '空调', '网关', '第三方设备']
        : isRetail
          ? ['价签', '网关', '门店系统', '平台']
          : ['终端', '内容源', '空间场景'],
      aspaceHref: isSpace ? ASPACE_SOLUTION_HREF : '',
      aspaceLabel: isSpace ? '了解 ASpace 总体解决方案' : '',
    },
    closing: {
      title: `让${product.name}进入你的真实项目场景`,
      desc: '根据空间类型、设备条件与系统接口，共同确定适合的接入与实施方案。',
      primaryLabel: '预约方案演示',
      softLinks: [
        { label: '查看技术资料', action: 'demo' },
        { label: '获取产品文档', action: 'demo' },
      ],
    },
  }
}
