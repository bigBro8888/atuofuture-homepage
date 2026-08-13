/** 智能硬件产品中心：三大产品线数据 */

/**
 * @typedef {{
 *   id: string,
 *   slug: string,
 *   productLine: string,
 *   category: string,
 *   name: string,
 *   shortDescription: string,
 *   coverImage: string,
 *   gallery?: string[],
 *   capabilities?: string[],
 *   scenarios?: string[],
 *   specifications?: { label: string, value: string }[],
 *   interfaces?: string[],
 *   documentUrl?: string,
 *   relatedSolutions?: { label: string, href: string }[],
 *   sortOrder: number,
 *   published: boolean,
 *   icon?: string,
 *   shopUrl?: string,
 * }} HardwareProduct
 */

/** @type {{ id: string, slug: string, name: string, shortName: string, description: string, icon: string, categoryIds: string[] }[]} */
export const HARDWARE_LINES = [
  {
    id: 'space',
    slug: 'space-intelligence',
    name: '空间智能',
    shortName: '空间智能',
    description: '覆盖交互终端、环境控制、感知计量与边缘接入。',
    icon: 'deployed_code',
    categoryIds: ['space-terminal', 'env-control', 'sense-meter', 'edge-access', 'meeting-office'],
  },
  {
    id: 'retail',
    slug: 'retail',
    name: '新零售与行业电子纸',
    shortName: '新零售与行业电子纸',
    description: '电子价签、冷链标签与资产盘点硬件。',
    icon: 'shopping_bag',
    categoryIds: ['price-tag', 'cold-chain', 'asset-inventory'],
  },
  {
    id: 'consumer',
    slug: 'consumer',
    name: '3C 数码',
    shortName: '3C 数码',
    description: 'AI 墨水屏手机壳与电子纸艺术相框。',
    icon: 'smartphone',
    categoryIds: ['consumer-devices'],
  },
]

/** @type {{ id: string, lineId: string, name: string, icon: string }[]} */
export const HARDWARE_CATEGORIES = [
  { id: 'space-terminal', lineId: 'space', name: '空间交互终端', icon: 'smart_display' },
  { id: 'env-control', lineId: 'space', name: '环境控制', icon: 'tune' },
  { id: 'sense-meter', lineId: 'space', name: '感知与计量', icon: 'sensors' },
  { id: 'edge-access', lineId: 'space', name: '边缘接入', icon: 'router' },
  { id: 'meeting-office', lineId: 'space', name: '会议与办公', icon: 'meeting_room' },
  { id: 'price-tag', lineId: 'retail', name: '电子价签', icon: 'sell' },
  { id: 'cold-chain', lineId: 'retail', name: '冷链', icon: 'ac_unit' },
  { id: 'asset-inventory', lineId: 'retail', name: '资产盘点', icon: 'inventory_2' },
  { id: 'consumer-devices', lineId: 'consumer', name: '智能终端', icon: 'devices' },
]

/** @type {HardwareProduct[]} */
export const HARDWARE_PRODUCTS = [
  {
    id: 'control-screen',
    slug: 'control-screen',
    productLine: 'space',
    category: 'space-terminal',
    name: '中控屏',
    shortDescription: '空间控制、设备联动与场景执行的统一交互入口。',
    fullDescription:
      '面向会议室、办公空间与智慧楼宇，将照明、空调、窗帘、音视频及空间服务集中到一个界面。',
    coverImage: '/images/hardware/control-screen.jpg',
    gallery: ['/images/hardware/control-screen.jpg'],
    capabilities: ['场景一键执行', '设备状态回读', '本地与云端协同控制'],
    scenarios: ['总部办公', '会议室', '展厅与接待空间'],
    interfaces: ['蓝牙直连', 'IoT 网关', '平台 API'],
    relatedSolutions: [
      { label: '智慧楼宇', href: '/solutions/?id=building' },
      { label: '智慧园区', href: '/solutions/?id=campus' },
    ],
    sortOrder: 10,
    published: true,
    icon: 'smart_display',
  },
  {
    id: 'e-table-sign',
    slug: 'e-table-sign',
    productLine: 'space',
    category: 'space-terminal',
    name: '电子桌牌',
    shortDescription: '会议席位信息显示与会务状态同步。',
    coverImage: '/images/hardware/e-table-sign.jpg',
    capabilities: ['席位信息同步', '会务状态展示'],
    scenarios: ['会议室', '会务接待'],
    sortOrder: 20,
    published: true,
    icon: 'badge',
  },
  {
    id: 'desk-screen',
    slug: 'desk-screen',
    productLine: 'space',
    category: 'space-terminal',
    name: '工位屏',
    shortDescription: '工位身份、预约状态与空间信息交互终端。',
    coverImage: '/images/hardware/desk-screen.jpg',
    capabilities: ['工位状态显示', '信息发布联动'],
    scenarios: ['开放办公', '共享工位'],
    sortOrder: 30,
    published: true,
    icon: 'desktop_windows',
  },
  {
    id: 'smart-lighting',
    slug: 'smart-lighting',
    productLine: 'space',
    category: 'env-control',
    name: '智能照明',
    shortDescription: '按场景与占用策略执行照明控制。',
    coverImage: '/images/hardware/smart-lighting.jpg',
    capabilities: ['场景调光', '占用联动'],
    scenarios: ['办公楼宇', '公共区域'],
    sortOrder: 40,
    published: true,
    icon: 'lightbulb',
  },
  {
    id: 'smart-hvac',
    slug: 'smart-hvac',
    productLine: 'space',
    category: 'env-control',
    name: '智能空调系统',
    shortDescription: '空调启停、温度策略与空间场景联动。',
    coverImage: '/images/hardware/smart-hvac.jpg',
    capabilities: ['温度策略', '会前自动准备'],
    scenarios: ['会议室', '办公区域'],
    sortOrder: 50,
    published: true,
    icon: 'ac_unit',
  },
  {
    id: 'switch-control',
    slug: 'switch-control',
    productLine: 'space',
    category: 'env-control',
    name: '开关与设备控制',
    shortDescription: '照明回路与用电设备的本地/远程控制。',
    coverImage: '/images/hardware/switch-control.jpg',
    capabilities: ['回路控制', '远程通断'],
    scenarios: ['办公空间', '公共区域'],
    sortOrder: 60,
    published: true,
    icon: 'toggle_on',
  },
  {
    id: 'sensor',
    slug: 'sensor',
    productLine: 'space',
    category: 'sense-meter',
    name: '传感器',
    shortDescription: '采集环境、占用与设备状态，支撑智能体决策。',
    coverImage: '/images/hardware/sensor.jpg',
    capabilities: ['环境采集', '有无人感知'],
    scenarios: ['楼宇节能', '空间运营'],
    sortOrder: 70,
    published: true,
    icon: 'sensors',
  },
  {
    id: 'energy-meter',
    slug: 'energy-meter',
    productLine: 'space',
    category: 'sense-meter',
    name: '智能能耗',
    shortDescription: '分项计量与能耗数据回传，支撑节能分析。',
    coverImage: '/images/hardware/energy-meter.jpg',
    capabilities: ['分项计量', '能耗回传'],
    scenarios: ['园区能耗', '楼宇节能'],
    sortOrder: 80,
    published: true,
    icon: 'speed',
  },
  {
    id: 'gateway',
    slug: 'gateway',
    productLine: 'space',
    category: 'edge-access',
    name: '网关',
    shortDescription: '设备接入、协议转换与本地边缘处理。',
    coverImage: '/images/hardware/gateway.jpg',
    capabilities: ['规模接入', '协议汇聚', '边缘缓存'],
    scenarios: ['楼宇接入', '园区部署'],
    sortOrder: 90,
    published: true,
    icon: 'router',
  },
  {
    id: 'smart-meeting',
    slug: 'smart-meeting',
    productLine: 'space',
    category: 'meeting-office',
    name: '智能会议室',
    shortDescription: '会议场景开停、中控与音视频设备编排。',
    coverImage: '/images/hardware/smart-meeting.jpg',
    capabilities: ['会前准备', '设备编排'],
    scenarios: ['总部会议室', '多功能厅'],
    sortOrder: 100,
    published: true,
    icon: 'cast',
  },
  {
    id: 'office-device',
    slug: 'office-device',
    productLine: 'space',
    category: 'meeting-office',
    name: '办公设备',
    shortDescription: '服务办公与会议场景的配套终端设备。',
    coverImage: '/images/hardware/office-device.jpg',
    capabilities: ['办公场景配套', '终端联动'],
    scenarios: ['办公空间', '会议空间'],
    sortOrder: 110,
    published: true,
    icon: 'print',
  },
  {
    id: 'eink-price-tag',
    slug: 'eink-price-tag',
    productLine: 'retail',
    category: 'price-tag',
    name: '墨水屏电子价签',
    shortDescription: '低功耗电子纸价签，服务门店与货架信息更新。',
    coverImage: '/images/hardware/eink-price-tag.jpg',
    capabilities: ['远程改价', '低功耗显示'],
    scenarios: ['新零售门店', '商超货架'],
    sortOrder: 120,
    published: true,
    icon: 'sell',
  },
  {
    id: 'lcd-price-tag',
    slug: 'lcd-price-tag',
    productLine: 'retail',
    category: 'price-tag',
    name: 'LCD 电子价签',
    shortDescription: '彩色 LCD 价签，适合高对比展示场景。',
    coverImage: '/images/hardware/lcd-price-tag.jpg',
    capabilities: ['彩色显示', '信息刷新'],
    scenarios: ['新零售门店', '品牌专柜'],
    sortOrder: 130,
    published: true,
    icon: 'screenshot',
  },
  {
    id: 'cold-tag',
    slug: 'cold-tag',
    productLine: 'retail',
    category: 'cold-chain',
    name: '低温标签',
    shortDescription: '面向冷链场景的低温环境标签方案。',
    coverImage: '/images/hardware/cold-tag.jpg',
    capabilities: ['低温场景适配'],
    scenarios: ['冷链仓储', '生鲜门店'],
    sortOrder: 140,
    published: true,
    icon: 'ac_unit',
  },
  {
    id: 'aap',
    slug: 'aap',
    productLine: 'retail',
    category: 'asset-inventory',
    name: 'AAP 资产盘点',
    shortDescription: '资产盘点与标签管理硬件能力。',
    coverImage: '/images/hardware/aap.jpg',
    capabilities: ['资产盘点', '标签管理'],
    scenarios: ['资产盘点', '仓储管理'],
    sortOrder: 150,
    published: true,
    icon: 'inventory_2',
  },
  {
    id: 'eink-phone-case',
    slug: 'eink-phone-case',
    productLine: 'consumer',
    category: 'consumer-devices',
    name: 'AI 墨水屏手机壳',
    shortDescription: '墨水屏手机壳智能终端产品。',
    coverImage: '/images/hardware/eink-phone-case.jpg',
    capabilities: ['墨水屏显示'],
    scenarios: ['个人消费电子'],
    sortOrder: 160,
    published: true,
    icon: 'smartphone',
    shopUrl: '',
  },
  {
    id: 'eink-frame',
    slug: 'eink-frame',
    productLine: 'consumer',
    category: 'consumer-devices',
    name: 'AI 电子纸艺术相框',
    shortDescription: '电子纸艺术相框智能终端产品。',
    coverImage: '/images/hardware/eink-frame.jpg',
    capabilities: ['电子纸画作展示'],
    scenarios: ['家居与办公装饰'],
    sortOrder: 170,
    published: true,
    icon: 'photo_frame',
    shopUrl: '',
  },
]

export const HARDWARE_SPACE_FLOW = [
  { id: 'sense', title: '传感器与计量', desc: '环境、占用与能耗数据采集', icon: 'sensors' },
  { id: 'edge', title: '网关与边缘', desc: '协议汇聚、本地处理与可靠上云', icon: 'router' },
  { id: 'hub', title: '空间智能中枢 / 智能体', desc: '策略编排、场景理解与任务决策', icon: 'psychology' },
  { id: 'actuate', title: '控制执行设备', desc: '照明、空调、开关与回路执行', icon: 'tune' },
  { id: 'terminal', title: '中控屏与信息终端', desc: '人机交互、状态呈现与会务信息', icon: 'smart_display' },
]

export const ASPACE_SOLUTION_HREF = '/solutions/'

export function getPublishedProducts() {
  return HARDWARE_PRODUCTS.filter((p) => p.published).sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getLine(idOrSlug) {
  return HARDWARE_LINES.find((l) => l.id === idOrSlug || l.slug === idOrSlug) || null
}

export function getCategory(id) {
  return HARDWARE_CATEGORIES.find((c) => c.id === id) || null
}

export function getCategoriesByLine(lineId) {
  return HARDWARE_CATEGORIES.filter((c) => c.lineId === lineId)
}

export function getProductsByLine(lineId) {
  return getPublishedProducts().filter((p) => p.productLine === lineId)
}

export function getProductsByCategory(categoryId) {
  return getPublishedProducts().filter((p) => p.category === categoryId)
}

export function getProductBySlug(slug) {
  if (!slug) return null
  return getPublishedProducts().find((p) => p.slug === slug || p.id === slug) || null
}

export function getProductDetailPath(product) {
  const line = getLine(product.productLine)
  if (!line) return `/hardware/product/?id=${encodeURIComponent(product.slug)}`
  return `/hardware/${line.slug}/${product.slug}`
}

export function getProductDetailHref(product) {
  return `/hardware/product/?id=${encodeURIComponent(product.slug)}`
}

/** 兼容旧锚点与导航 */
export const HARDWARE_SECTIONS = [
  {
    id: 'terminal',
    title: '空间交互终端',
    desc: '中控屏、电子桌牌与工位屏。',
    products: getProductsByCategory('space-terminal').map((p) => ({
      name: p.name,
      icon: p.icon,
      desc: p.shortDescription,
    })),
  },
  {
    id: 'sensor',
    title: '感知与计量',
    desc: '传感器与智能能耗。',
    products: getProductsByCategory('sense-meter').map((p) => ({
      name: p.name,
      icon: p.icon,
      desc: p.shortDescription,
    })),
  },
  {
    id: 'gateway',
    title: '边缘接入与中控',
    desc: '网关与中控交互能力。',
    products: [...getProductsByCategory('edge-access'), ...getProductsByCategory('space-terminal').slice(0, 1)].map(
      (p) => ({ name: p.name, icon: p.icon, desc: p.shortDescription })
    ),
  },
  {
    id: 'av',
    title: '会议与办公',
    desc: '智能会议室与办公设备。',
    products: getProductsByCategory('meeting-office').map((p) => ({
      name: p.name,
      icon: p.icon,
      desc: p.shortDescription,
    })),
  },
]

export const HARDWARE_MAIN_CATEGORIES = HARDWARE_LINES.map((l) => ({ id: l.id, label: l.name }))

export const HARDWARE_CATALOG = HARDWARE_LINES.map((line) => ({
  id: line.id,
  label: line.name,
  groups: getCategoriesByLine(line.id).map((cat) => ({
    id: cat.id,
    label: cat.name,
    products: getProductsByCategory(cat.id).map((p) => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      desc: p.shortDescription,
    })),
  })),
}))
