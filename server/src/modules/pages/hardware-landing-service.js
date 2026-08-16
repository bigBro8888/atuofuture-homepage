import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'
import { HARDWARE_LINES, HARDWARE_PRODUCTS, HARDWARE_SPACE_FLOW } from '../../../../src/data/hardware-catalog.js'

export const HARDWARE_PAGE_KEY = 'hardware'

const OVERVIEW_DEFAULTS = {
  space: [
    { id: 'control-screen', label: '中控屏' },
    { id: 'e-table-sign', label: '电子桌牌' },
    { id: 'desk-screen', label: '工位屏' },
    { id: 'smart-lighting', label: '照明与空调' },
    { id: 'sensor', label: '传感器' },
    { id: 'gateway', label: '网关' },
  ],
  retail: [
    { id: 'eink-price-tag', label: '墨水屏电子价签' },
    { id: 'lcd-price-tag', label: 'LCD电子价签' },
    { id: 'cold-tag', label: '低温标签' },
    { id: 'aap', label: 'AAP资产盘点' },
  ],
  consumer: [
    { id: 'eink-phone-case', label: 'AI墨水屏手机壳' },
    { id: 'eink-frame', label: 'AI电子纸艺术相框' },
  ],
}

const EXTRA = {
  'eink-price-tag': { useBlurb: '低功耗电子纸价签，服务门店货架信息的远程更新与统一管理。' },
  'lcd-price-tag': { useBlurb: '彩色 LCD 价签，适合高对比、促销与品牌专柜展示场景。' },
  'cold-tag': { useBlurb: '面向冷链与低温货架的标签方案，适配生鲜与仓储环境。' },
  aap: { useBlurb: '资产盘点与标签管理硬件能力，支撑盘点、巡检与台账闭环。' },
  'eink-phone-case': {
    useBlurb: '把可刷新的电子纸带入个人设备，让通知、图文与个性表达常显可见。',
    sceneImage: '/images/hardware/scene-eink-phone-case.jpg',
  },
  'eink-frame': {
    useBlurb: '以低功耗电子纸呈现画作与影像，进入家居与办公的数字陈列场景。',
    sceneImage: '/images/hardware/scene-eink-frame.jpg',
  },
}

function text(value, fallback = '', max = 400) {
  return String(value ?? fallback ?? '').trim().slice(0, max)
}

function url(value, fallback = '') {
  const raw = String(value === undefined || value === null ? fallback ?? '' : value).trim()
  if (!raw) return ''
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw.slice(0, 1000)
  const parsed = new URL(raw)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('链接必须是站内路径或 http(s)')
  return parsed.toString().slice(0, 1000)
}

function lines(value, fallback = [], maxItems = 12, maxLen = 80) {
  const source = Array.isArray(value) ? value : String(value ?? '').split(/\n|、|,|，/)
  const list = source.map((item) => String(item).trim()).filter(Boolean)
  const base = list.length ? list : fallback
  return base.slice(0, maxItems).map((item) => String(item).slice(0, maxLen))
}

function overlayList(source, fallback, mapItem) {
  const incoming = Array.isArray(source) && source.length ? source : fallback
  return incoming.slice(0, 40).map((item, index) => mapItem(item || {}, fallback[index] || fallback[0] || {}, index))
}

function overviewLabelFor(product) {
  for (const items of Object.values(OVERVIEW_DEFAULTS)) {
    const found = items.find((item) => item.id === product.id || item.id === product.slug)
    if (found) return found.label
  }
  return product.name
}

function inOverview(product) {
  return Object.values(OVERVIEW_DEFAULTS).some((items) => items.some((item) => item.id === product.id || item.id === product.slug))
}

export function defaultHardwareContent() {
  return {
    hero: {
      title: '连接空间、商品与真实业务',
      subtitle: '安托未来以空间智能、电子纸与边缘连接能力，构建覆盖企业空间、新零售与智能终端的硬件产品体系。',
      bannerUrl: '/images/hardware/hero-bg-3840.png',
      ctaLabel: '获取咨询建议',
      browseLabel: '浏览全部产品',
    },
    lines: HARDWARE_LINES.map((line) => ({
      id: line.id,
      name: line.name,
      description: line.description,
      icon: line.id === 'space' ? 'apartment' : line.icon,
    })),
    products: HARDWARE_PRODUCTS.map((product) => ({
      ...product,
      thumb: `/images/hardware/thumb-${product.slug || product.id}.png`,
      overviewLabel: overviewLabelFor(product),
      showInOverview: inOverview(product),
      useBlurb: EXTRA[product.id]?.useBlurb || product.shortDescription,
      sceneImage: EXTRA[product.id]?.sceneImage || '',
    })),
    space: {
      kicker: '空间智能',
      title: '空间智能硬件',
      subtitle: '以中控屏为交互入口，连接感知、边缘、控制与信息终端，形成可部署的空间智能闭环。',
      flagshipId: 'control-screen',
      flagshipTag: '旗舰产品',
      matrixTitle: '空间智能配套硬件',
      matrixSubtitle: '围绕交互、环境、感知与边缘接入，覆盖会议室、办公与楼宇场景。',
      flowTitle: '空间智能硬件如何协同',
      flowSubtitle: '从数据采集到终端交互的横向能力链路。',
      flowLinkLabel: '了解 ASpace 总体解决方案 →',
    },
    flow: structuredClone(HARDWARE_SPACE_FLOW),
    retail: {
      kicker: '新零售与行业电子纸',
      title: '以电子纸连接商品、资产与行业数据',
      subtitle: '覆盖门店价签、冷链标签与资产盘点，帮助业务侧更快完成信息同步与现场执行。',
    },
    consumer: {
      kicker: '3C 数码',
      title: '电子纸进入个人设备与数字生活',
      subtitle: '面向消费与陈列场景，以大幅场景卡呈现产品形态与使用氛围。',
    },
    cta: {
      title: '获取适合项目的硬件选型建议',
      body: '告诉我们空间类型、部署规模与接入需求，安托未来将协助完成硬件选型与联调方案。',
      primary: '获取选型建议',
      secondary: '预约方案演示',
    },
  }
}

function migrateLegacy(value = {}) {
  if (value.hero && Array.isArray(value.products)) return value
  const next = defaultHardwareContent()
  if (value.title) next.hero.title = value.title
  if (value.subtitle) next.hero.subtitle = value.subtitle
  if (value.bannerUrl) next.hero.bannerUrl = value.bannerUrl
  if (value.ctaLabel) next.hero.ctaLabel = value.ctaLabel
  return next
}

export function validateHardwareContent(raw = {}) {
  const value = migrateLegacy(raw)
  const fallback = defaultHardwareContent()
  return {
    hero: {
      title: text(value.hero?.title, fallback.hero.title, 120),
      subtitle: text(value.hero?.subtitle, fallback.hero.subtitle, 400),
      bannerUrl: url(value.hero?.bannerUrl, fallback.hero.bannerUrl),
      ctaLabel: text(value.hero?.ctaLabel, fallback.hero.ctaLabel, 20),
      browseLabel: text(value.hero?.browseLabel, fallback.hero.browseLabel, 20),
    },
    lines: overlayList(value.lines, fallback.lines, (item, fb) => ({
      id: text(item.id, fb.id, 40),
      name: text(item.name, fb.name, 40),
      description: text(item.description, fb.description, 120),
      icon: text(item.icon, fb.icon, 40),
    })),
    products: overlayList(value.products, fallback.products, (item, fb) => ({
      ...fb,
      id: text(item.id, fb.id, 40) || `hw-${randomUUID().slice(0, 6)}`,
      slug: text(item.slug, item.id || fb.slug, 40),
      productLine: text(item.productLine, fb.productLine, 20) || 'space',
      name: text(item.name, fb.name, 40),
      shortDescription: text(item.shortDescription, fb.shortDescription, 160),
      fullDescription: text(item.fullDescription, fb.fullDescription || '', 400),
      coverImage: url(item.coverImage, fb.coverImage),
      thumb: url(item.thumb, fb.thumb || fb.coverImage),
      overviewLabel: text(item.overviewLabel, fb.overviewLabel || item.name, 20),
      showInOverview: item.showInOverview === undefined
        ? Boolean(fb.showInOverview)
        : item.showInOverview === true || item.showInOverview === 'true',
      useBlurb: text(item.useBlurb, fb.useBlurb || item.shortDescription, 200),
      sceneImage: url(item.sceneImage, fb.sceneImage || ''),
      capabilities: lines(item.capabilities, fb.capabilities, 8, 40),
      scenarios: lines(item.scenarios, fb.scenarios, 8, 40),
      icon: text(item.icon, fb.icon, 40),
      published: item.published === undefined
        ? fb.published !== false
        : item.published !== false && item.published !== 'false',
    })),
    space: {
      kicker: text(value.space?.kicker, fallback.space.kicker, 20),
      title: text(value.space?.title, fallback.space.title, 40),
      subtitle: text(value.space?.subtitle, fallback.space.subtitle, 240),
      flagshipId: text(value.space?.flagshipId, fallback.space.flagshipId, 40),
      flagshipTag: text(value.space?.flagshipTag, fallback.space.flagshipTag, 20),
      matrixTitle: text(value.space?.matrixTitle, fallback.space.matrixTitle, 40),
      matrixSubtitle: text(value.space?.matrixSubtitle, fallback.space.matrixSubtitle, 160),
      flowTitle: text(value.space?.flowTitle, fallback.space.flowTitle, 40),
      flowSubtitle: text(value.space?.flowSubtitle, fallback.space.flowSubtitle, 160),
      flowLinkLabel: text(value.space?.flowLinkLabel, fallback.space.flowLinkLabel, 40),
    },
    flow: overlayList(value.flow, fallback.flow, (item, fb) => ({
      id: text(item.id, fb.id, 40),
      title: text(item.title, fb.title, 40),
      desc: text(item.desc, fb.desc, 80),
      icon: text(item.icon, fb.icon, 40),
    })),
    retail: {
      kicker: text(value.retail?.kicker, fallback.retail.kicker, 30),
      title: text(value.retail?.title, fallback.retail.title, 60),
      subtitle: text(value.retail?.subtitle, fallback.retail.subtitle, 240),
    },
    consumer: {
      kicker: text(value.consumer?.kicker, fallback.consumer.kicker, 20),
      title: text(value.consumer?.title, fallback.consumer.title, 60),
      subtitle: text(value.consumer?.subtitle, fallback.consumer.subtitle, 240),
    },
    cta: {
      title: text(value.cta?.title, fallback.cta.title, 80),
      body: text(value.cta?.body, fallback.cta.body, 240),
      primary: text(value.cta?.primary, fallback.cta.primary, 20),
      secondary: text(value.cta?.secondary, fallback.cta.secondary, 20),
    },
  }
}

export function getHardwarePageConfig() {
  let page = db().pageConfigs.find((item) => item.pageKey === HARDWARE_PAGE_KEY && item.locale === 'zh-CN')
  const content = validateHardwareContent(page?.draftContent || defaultHardwareContent())
  if (!page) {
    const now = new Date().toISOString()
    page = {
      id: randomUUID(),
      pageKey: HARDWARE_PAGE_KEY,
      locale: 'zh-CN',
      status: 'published',
      draftContent: content,
      publishedContent: structuredClone(content),
      updatedAt: now,
      publishedAt: now,
    }
    db().pageConfigs.push(page)
    return page
  }
  page.draftContent = content
  if (!page.publishedContent?.products) page.publishedContent = structuredClone(content)
  return page
}
