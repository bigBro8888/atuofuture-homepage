/** 产品详情扩展数据：按 id 合并到 hardware-catalog 基础字段 */

import { ASPACE_SOLUTION_HREF } from './hardware-catalog.js'

const EMPTY_SPEC = ''

/** 空间智能默认流程 */
export const SPACE_WORKFLOW = {
  title: '从操作指令到设备执行，形成空间闭环',
  steps: [
    { icon: 'person', title: '用户操作' },
    { icon: 'psychology', title: '场景理解' },
    { icon: 'send', title: '指令下发' },
    { icon: 'smart_display', title: '设备执行' },
    { icon: 'graphic_eq', title: '状态反馈' },
    { icon: 'check_circle', title: '任务完成' },
  ],
}

/** 新零售默认流程 */
export const RETAIL_WORKFLOW = {
  title: '从内容下发到平台管理，形成显示闭环',
  steps: [
    { icon: 'cloud_upload', title: '内容下发' },
    { icon: 'devices', title: '设备接收' },
    { icon: 'screenshot', title: '屏幕更新' },
    { icon: 'sync', title: '状态回传' },
    { icon: 'monitoring', title: '平台管理' },
  ],
}

const SPEC_GROUPS_TEMPLATE = [
  {
    id: 'basic',
    label: '基础信息',
    rows: [
      { label: '产品尺寸', value: EMPTY_SPEC },
      { label: '产品重量', value: EMPTY_SPEC },
      { label: '显示屏', value: EMPTY_SPEC },
      { label: '产品材质', value: EMPTY_SPEC },
      { label: '产品颜色', value: EMPTY_SPEC },
    ],
  },
  {
    id: 'connectivity',
    label: '接口与连接',
    rows: [
      { label: '网络连接', value: EMPTY_SPEC },
      { label: '蓝牙连接', value: EMPTY_SPEC },
      { label: '有线接口', value: EMPTY_SPEC },
      { label: '第三方协议', value: EMPTY_SPEC },
      { label: '平台接入方式', value: EMPTY_SPEC },
    ],
  },
  {
    id: 'install',
    label: '安装与环境',
    rows: [
      { label: '安装方式', value: EMPTY_SPEC },
      { label: '供电方式', value: EMPTY_SPEC },
      { label: '工作温度', value: EMPTY_SPEC },
      { label: '工作湿度', value: EMPTY_SPEC },
      { label: '使用环境', value: EMPTY_SPEC },
    ],
  },
]

const DEFAULT_DOWNLOADS = [
  { name: '产品彩页', format: 'PDF', applyRequired: true, icon: 'description' },
  { name: '安装说明', format: 'PDF', applyRequired: true, icon: 'description' },
  { name: '接口文档', format: 'PDF', applyRequired: true, icon: 'code' },
]

/** @type {Record<string, object>} */
export const HARDWARE_DETAIL_BY_ID = {
  'control-screen': {
    fullDescription:
      '面向会议室、办公空间与智慧楼宇，将照明、空调、窗帘、音视频及空间服务集中到一个界面。',
    gallery: [
      { src: '/images/hardware/control-screen.svg', label: '正面' },
      { src: '/images/hardware/control-screen.svg', label: '侧面' },
      { src: '/images/hardware/control-screen.svg', label: '安装示意' },
    ],
    quickInfo: [
      { label: '适用场景', value: '会议室 / 办公空间 / 智慧楼宇' },
      { label: '接入方式', value: '蓝牙IoT / 网络 / 第三方系统' },
      { label: '产品形态', value: '壁装 / 桌面' },
    ],
    overviewTitle: '一个入口，统一管理空间设备与服务',
    applicationImage: '/images/hardware/control-screen.svg',
    capabilityItems: [
      {
        icon: 'pan_tool_alt',
        title: '统一交互',
        desc: '将空间设备与服务集中到同一个操作界面',
      },
      {
        icon: 'filter_none',
        title: '场景联动',
        desc: '一键执行会议、离场、观影等空间场景',
      },
      {
        icon: 'bluetooth',
        title: '边缘接入',
        desc: '连接蓝牙IoT设备，并与网关协同',
      },
      {
        icon: 'apps',
        title: '开放集成',
        desc: '可接入第三方系统与上层管理平台',
      },
    ],
    workflow: SPACE_WORKFLOW,
    sceneCards: [
      {
        title: '会议空间',
        desc: '一键开启会议，设备与环境自动就绪。',
        image: '/images/hardware/control-screen.svg',
        href: '/solutions/?id=building',
      },
      {
        title: '智慧办公',
        desc: '联动照明、空调与工位设备，提升办公体验。',
        image: '/images/hardware/desk-screen.svg',
        href: '/solutions/?id=building',
      },
      {
        title: '楼宇公区',
        desc: '统一管理公共设备，优化运行与使用体验。',
        image: '/images/hardware/gateway.svg',
        href: '/solutions/?id=campus',
      },
    ],
    specGroups: SPEC_GROUPS_TEMPLATE,
    downloads: DEFAULT_DOWNLOADS,
    collaboration: {
      title: '让硬件进入完整的空间智能系统',
      desc: '中控屏可与传感器、照明、空调、开关、网关和空间智能体协同工作。',
      aspaceHref: ASPACE_SOLUTION_HREF,
      aspaceLabel: '了解 ASpace 总体解决方案',
      productIds: ['control-screen', 'sensor', 'switch-control', 'gateway'],
    },
  },
}

/**
 * 为未单独配置详情的产品生成可渲染的扩展字段（不编造参数数值）
 * @param {import('./hardware-catalog.js').HardwareProduct} product
 */
export function buildDetailExtras(product) {
  const override = HARDWARE_DETAIL_BY_ID[product.id] || {}
  const lineId = product.productLine

  const gallery =
    override.gallery ||
    (product.gallery?.length
      ? product.gallery.map((src, i) => ({
          src: typeof src === 'string' ? src : src.src,
          label: typeof src === 'object' && src.label ? src.label : i === 0 ? '正面' : `视图 ${i + 1}`,
        }))
      : product.coverImage
        ? [{ src: product.coverImage, label: '正面' }]
        : [])

  const capabilityItems =
    override.capabilityItems ||
    (Array.isArray(product.capabilities)
      ? product.capabilities.map((item) =>
          typeof item === 'string'
            ? { icon: product.icon || 'check', title: item, desc: '' }
            : item
        )
      : [])

  const sceneCards =
    override.sceneCards ||
    (Array.isArray(product.scenarios)
      ? product.scenarios.map((s) =>
          typeof s === 'string'
            ? { title: s, desc: '', image: product.coverImage || '', href: '' }
            : s
        )
      : [])

  let workflow = override.workflow
  if (workflow === undefined) {
    if (lineId === 'space') workflow = SPACE_WORKFLOW
    else if (lineId === 'retail') workflow = RETAIL_WORKFLOW
    else workflow = null
  }

  const quickInfo =
    override.quickInfo ||
    [
      product.scenarios?.length
        ? {
            label: '适用场景',
            value: product.scenarios
              .map((s) => (typeof s === 'string' ? s : s.title))
              .filter(Boolean)
              .join(' / '),
          }
        : null,
      product.interfaces?.length
        ? { label: '接入方式', value: product.interfaces.join(' / ') }
        : null,
    ].filter(Boolean)

  const collaboration =
    override.collaboration ||
    (lineId === 'space'
      ? {
          title: '让硬件进入完整的空间智能系统',
          desc: `${product.name}可与传感器、照明、空调、开关、网关和空间智能体协同工作。`,
          aspaceHref: ASPACE_SOLUTION_HREF,
          aspaceLabel: '了解 ASpace 总体解决方案',
          productIds: ['control-screen', 'sensor', 'switch-control', 'gateway'],
        }
      : null)

  // 3C 不展示空间协同与流程
  const finalWorkflow = lineId === 'consumer' ? null : workflow
  const finalCollaboration = lineId === 'space' ? collaboration : null

  return {
    fullDescription: override.fullDescription || '',
    gallery,
    quickInfo,
    overviewTitle:
      override.overviewTitle ||
      (capabilityItems.length ? `${product.name}核心能力` : ''),
    applicationImage: override.applicationImage || product.coverImage || '',
    capabilityItems,
    workflow: finalWorkflow,
    sceneCards,
    specGroups: override.specGroups || (lineId === 'consumer' ? SPEC_GROUPS_TEMPLATE.slice(0, 2) : SPEC_GROUPS_TEMPLATE),
    downloads: override.downloads || DEFAULT_DOWNLOADS,
    collaboration: finalCollaboration,
    relatedSolutions: override.relatedSolutions || product.relatedSolutions || [],
  }
}
