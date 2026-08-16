import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'
import { HARDWARE_PRODUCTS } from '../../../../src/data/hardware-catalog.js'
import { SOLUTIONS } from '../../../../src/data/solutions.js'
import { AGENTS_OVERVIEW } from '../../../../src/data/agents-overview.js'

export const SIMPLE_PAGE_KEYS = ['solutions', 'agents', 'hardware', 'news', 'ai-token']

export function catalogItemsFor(key) {
  if (key === 'hardware') {
    return HARDWARE_PRODUCTS
      .filter((item) => item.published !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item) => ({
        id: item.slug || item.id,
        group: item.productLine || 'space',
        title: item.name,
        summary: item.shortDescription || '',
        imageUrl: item.coverImage || '',
      }))
  }
  if (key === 'solutions') {
    return SOLUTIONS.map((item) => ({
      id: item.id,
      group: item.id,
      title: item.name,
      summary: item.summary || item.value || '',
      imageUrl: item.image || '',
    }))
  }
  if (key === 'agents') {
    return AGENTS_OVERVIEW.map((item) => ({
      id: item.id,
      group: item.id,
      title: item.name,
      summary: item.blurb || '',
      imageUrl: item.sceneImage || '',
    }))
  }
  return []
}

export const defaultSimplePages = {
  solutions: {
    title: '行业解决方案',
    subtitle: '围绕楼宇、园区与商业资产，构建可复制的 AI 原生行业方案。',
    bannerUrl: '/images/solutions/hero.jpg',
    ctaLabel: '预约方案演示',
  },
  agents: {
    title: '让空间智能体感知现场、调用设备、完成任务',
    subtitle: '不只是回答问题，而是连接软件系统、智能硬件与业务流程，让空间能够自主感知、判断、执行并持续反馈。',
    bannerUrl: '/images/agents/hero-bleed.jpg',
    ctaLabel: '预约方案演示',
  },
  hardware: {
    title: '连接空间、商品与真实业务',
    subtitle: '安托未来以空间智能、电子纸与边缘连接能力，构建覆盖企业空间、新零售与智能终端的硬件产品体系。',
    bannerUrl: '/images/hardware/hero-bg-3840.png',
    ctaLabel: '获取选型建议',
  },
  news: {
    title: '新闻中心',
    subtitle: '公司动态、产品更新与方案实践。',
    bannerUrl: '',
    ctaLabel: '',
  },
  'ai-token': {
    title: 'AI Token 服务',
    subtitle: '像购买云服务一样购买空间 AI 能力。统一计量、透明计费、开箱即用。',
    bannerUrl: '',
    ctaLabel: '立即购买 Token',
  },
}

function cleanText(value, fallback, max = 300) {
  const text = String(value ?? fallback ?? '').trim()
  return text.slice(0, max)
}

function cleanUrl(value, fallback = '') {
  const url = String(value ?? fallback ?? '').trim()
  if (!url) return fallback
  if (url.startsWith('/') && !url.startsWith('//')) return url.slice(0, 1000)
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('图片链接必须是站内路径或 http(s)')
  return parsed.toString().slice(0, 1000)
}

function cleanItems(value, catalog) {
  const saved = Array.isArray(value) ? value : []
  const byId = new Map(saved.map((item) => [String(item.id || '').trim(), item]))
  const source = catalog.length ? catalog : saved
  return source.slice(0, 40).map((item) => {
    const extra = byId.get(item.id) || {}
    return {
      id: cleanText(extra.id || item.id, item.id, 40),
      group: cleanText(extra.group || item.group, item.group || '', 40),
      title: cleanText(extra.title, item.title || '未命名', 80),
      summary: cleanText(extra.summary, item.summary || '', 240),
      imageUrl: cleanUrl(extra.imageUrl || item.imageUrl || '', item.imageUrl || ''),
    }
  }).filter((item) => item.id)
}

export function validateSimplePage(key, value = {}) {
  const fallback = defaultSimplePages[key]
  if (!fallback) throw new Error('未知页面')
  const catalog = catalogItemsFor(key)
  return {
    title: cleanText(value.title, fallback.title, 120),
    subtitle: cleanText(value.subtitle, fallback.subtitle, 400),
    bannerUrl: cleanUrl(value.bannerUrl, fallback.bannerUrl),
    ctaLabel: cleanText(value.ctaLabel, fallback.ctaLabel, 20),
    items: cleanItems(value.items, catalog),
  }
}

export function presentSimplePage(key, page) {
  if (!page) return page
  return {
    ...page,
    draftContent: validateSimplePage(key, page.draftContent || {}),
    publishedContent: validateSimplePage(key, page.publishedContent || page.draftContent || {}),
  }
}

export function getSimplePageConfig(key) {
  if (!SIMPLE_PAGE_KEYS.includes(key)) return null
  let page = db().pageConfigs.find((item) => item.pageKey === key && item.locale === 'zh-CN')
  if (!page) {
    const now = new Date().toISOString()
    const content = structuredClone(defaultSimplePages[key])
    page = {
      id: randomUUID(),
      pageKey: key,
      locale: 'zh-CN',
      status: 'published',
      draftContent: content,
      publishedContent: structuredClone(content),
      updatedAt: now,
      publishedAt: now,
    }
    db().pageConfigs.push(page)
  }
  return page
}
