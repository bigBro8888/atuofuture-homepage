import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'
import { HARDWARE_MEGA_GROUPS, HARDWARE_PRODUCTS, HARDWARE_SPACE_MATRIX_ROWS } from '../../../../src/data/hardware-catalog.js'
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

function cleanHref(value, fallback = '') {
  const text = String(value ?? '').trim()
  if (!text) return fallback
  if (text.startsWith('/') && !text.startsWith('//')) return text.slice(0, 1000)
  if (/^https?:\/\//i.test(text)) return cleanUrl(text, fallback)
  return `/${text.replace(/^\/+/, '')}`.slice(0, 1000)
}

function cleanLines(value, maxItems = 8, maxLen = 80) {
  const list = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[\n,，]+/)
      .map((item) => item.trim())
  return list.map((item) => cleanText(item, '', maxLen)).filter(Boolean).slice(0, maxItems)
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
      detailId: cleanText(extra.detailId, '', 40),
      tag: cleanText(extra.tag, extra.tag || '', 20),
      fullDescription: cleanText(extra.fullDescription, extra.fullDescription || '', 600),
      capabilities: cleanLines(extra.capabilities, 8, 40),
      detailCtaLabel: cleanText(extra.detailCtaLabel, extra.detailCtaLabel || '', 20),
      solutionLabel: cleanText(extra.solutionLabel, extra.solutionLabel || '', 40),
      solutionHref: extra.solutionHref ? cleanHref(extra.solutionHref, '') : '',
    }
  }).filter((item) => item.id)
}

function defaultNavGroups() {
  return HARDWARE_MEGA_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    icon: group.icon,
    products: group.products.map((item) => ({
      id: item.id,
      label: item.label || '',
      imageUrl: `/images/hardware/thumb-${item.id}.png`,
      href: `/hardware/product/?id=${item.id}`,
    })),
  }))
}

function defaultSpaceMatrixRows() {
  return HARDWARE_SPACE_MATRIX_ROWS.map((row) => ({
    id: row.id,
    title: row.title || '',
    subtitle: row.subtitle || '',
    products: row.products.map((item) => ({
      id: item.id,
      label: item.label || '',
    })),
  }))
}

function cleanSpaceMatrixRows(value) {
  const fallback = defaultSpaceMatrixRows()
  const saved = Array.isArray(value) ? value : []
  return fallback.map((base, index) => {
    const extra = saved.find((row) => row.id === base.id) || saved[index] || {}
    const extraProducts = Array.isArray(extra.products) ? extra.products : []
    const products = base.products.map((item, productIndex) => {
      const hit = extraProducts.find((entry) => entry.id === item.id) || extraProducts[productIndex] || {}
      return {
        id: cleanText(hit.id || item.id, item.id, 40),
        label: cleanText(hit.label, item.label || '', 40),
      }
    }).filter((entry) => entry.id)
    return {
      id: base.id,
      title: cleanText(extra.title, base.title || '', 80),
      subtitle: cleanText(extra.subtitle, base.subtitle || '', 160),
      products: products.length ? products : base.products,
    }
  })
}

function cleanNavGroups(value) {
  const fallback = defaultNavGroups()
  const saved = Array.isArray(value) ? value : []
  return fallback.map((base, index) => {
    const extra = saved.find((item) => item.id === base.id) || saved[index] || {}
    const extraProducts = Array.isArray(extra.products) ? extra.products : []
    return {
      id: base.id,
      title: cleanText(extra.title, base.title, 40),
      icon: cleanText(extra.icon, base.icon, 40),
      products: base.products.map((item, productIndex) => {
        const extraProduct = extraProducts.find((row) => row.id === item.id)
          || (item.id === 'smart-lighting' ? extraProducts.find((row) => row.id === 'switch-control') : null)
          || extraProducts[productIndex]
          || {}
        const defaultHref = `/hardware/product/?id=${item.id}`
        const defaultImage = `/images/hardware/thumb-${item.id}.png`
        return {
          id: item.id,
          label: cleanText(extraProduct.label, item.label || '', 40),
          imageUrl: cleanUrl(extraProduct.imageUrl, defaultImage),
          href: cleanHref(extraProduct.href, defaultHref),
        }
      }),
    }
  })
}

export function validateSimplePage(key, value = {}) {
  const fallback = defaultSimplePages[key]
  if (!fallback) throw new Error('未知页面')
  const catalog = catalogItemsFor(key)
  const page = {
    title: cleanText(value.title, fallback.title, 120),
    subtitle: cleanText(value.subtitle, fallback.subtitle, 400),
    bannerUrl: cleanUrl(value.bannerUrl, fallback.bannerUrl),
    ctaLabel: cleanText(value.ctaLabel, fallback.ctaLabel, 20),
    items: cleanItems(value.items, catalog),
  }
  if (key === 'hardware') {
    page.navGroups = cleanNavGroups(value.navGroups)
    page.spaceMatrixRows = cleanSpaceMatrixRows(value.spaceMatrixRows)
  }
  return page
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
