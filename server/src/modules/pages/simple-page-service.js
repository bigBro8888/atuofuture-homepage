import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'

export const SIMPLE_PAGE_KEYS = ['hardware', 'news', 'ai-token']

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

export function validateSimplePage(key, value = {}) {
  const fallback = defaultSimplePages[key]
  if (!fallback) throw new Error('未知页面')
  return {
    title: cleanText(value.title, fallback.title, 120),
    subtitle: cleanText(value.subtitle, fallback.subtitle, 400),
    bannerUrl: cleanUrl(value.bannerUrl, fallback.bannerUrl),
    ctaLabel: cleanText(value.ctaLabel, fallback.ctaLabel, 20),
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
