import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'
import { HARDWARE_PRODUCTS } from '../../../../src/data/hardware-catalog.js'
import { buildProductStory } from '../../../../src/data/hardware-product-details.js'

export const PRODUCT_LIBRARY_PAGE_KEY = 'product-library'

const LINE_IDS = new Set(['space', 'retail', 'consumer'])

function cleanText(value, fallback = '', max = 2000) {
  return String(value ?? fallback ?? '').trim().slice(0, max)
}

function cleanUrl(value, fallback = '') {
  const url = String(value ?? fallback ?? '').trim()
  if (!url) return fallback || ''
  if (url.startsWith('/') && !url.startsWith('//')) return url.slice(0, 1000)
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return fallback || ''
    return parsed.toString().slice(0, 2000)
  } catch {
    return fallback || ''
  }
}

function cleanHref(value, fallback = '') {
  const text = String(value ?? '').trim()
  if (!text) return fallback || ''
  if (text.startsWith('#') && text.length < 80) return text
  if (text.startsWith('/') && !text.startsWith('//')) return text.slice(0, 1000)
  if (/^https?:\/\//i.test(text)) return cleanUrl(text, fallback)
  return `/${text.replace(/^\/+/, '')}`.slice(0, 1000)
}

function cleanSlug(value, fallback = '') {
  const raw = String(value || fallback || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return (raw || fallback || `p-${randomUUID().slice(0, 8)}`).slice(0, 60)
}

function cleanLines(value, maxItems = 8, maxLen = 80) {
  const list = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[\n,，]+/)
      .map((item) => item.trim())
  return list.map((item) => cleanText(item, '', maxLen)).filter(Boolean).slice(0, maxItems)
}

function emptyStory(product = {}) {
  const cover = product.coverImage || ''
  const name = product.name || '未命名产品'
  return {
    hero: {
      title: name,
      headline: product.shortDescription || '',
      description: product.fullDescription || product.shortDescription || '',
      ctaLabel: '查看它如何工作',
      ctaHref: '#hpi-how',
      backgroundImage: '',
      deviceImage: cover,
    },
    value: {
      title: '',
      deviceImage: cover,
      left: [],
      right: [],
      footer: '',
    },
    howItWorks: {
      title: '',
      stages: [
        { title: '', caption: '', image: '' },
        { title: '', caption: '', image: '' },
        { title: '', caption: '', image: '' },
        { title: '', caption: '', image: '' },
      ],
    },
    scenarios: {
      title: '',
      items: [
        { title: '', desc: '', sceneImage: '', deviceImage: cover },
        { title: '', desc: '', sceneImage: '', deviceImage: cover },
        { title: '', desc: '', sceneImage: '', deviceImage: cover },
      ],
    },
    system: {
      title: '',
      upperLabel: '',
      upperItems: [],
      middleLabel: '',
      middleImage: cover,
      lowerItems: [],
      aspaceHref: '',
      aspaceLabel: '',
    },
    closing: {
      title: '',
      desc: '',
      primaryLabel: '预约方案演示',
      softLinks: [
        { label: '查看技术资料', action: 'demo' },
        { label: '获取产品文档', action: 'demo' },
      ],
    },
  }
}

function padList(list, count, factory) {
  const next = Array.isArray(list) ? [...list] : []
  while (next.length < count) next.push(factory())
  return next.slice(0, count)
}

function cleanStage(value = {}, fallback = {}) {
  return {
    title: cleanText(value.title, fallback.title || '', 40),
    caption: cleanText(value.caption, fallback.caption || '', 80),
    image: cleanUrl(value.image, fallback.image || ''),
  }
}

function cleanScene(value = {}, fallback = {}) {
  return {
    title: cleanText(value.title, fallback.title || '', 40),
    desc: cleanText(value.desc, fallback.desc || '', 200),
    sceneImage: cleanUrl(value.sceneImage, fallback.sceneImage || ''),
    deviceImage: cleanUrl(value.deviceImage, fallback.deviceImage || ''),
  }
}

function cleanStory(value = {}, fallback = {}) {
  const heroIn = value.hero || {}
  const heroFb = fallback.hero || {}
  const valueIn = value.value || {}
  const valueFb = fallback.value || {}
  const howIn = value.howItWorks || {}
  const howFb = fallback.howItWorks || {}
  const scenesIn = value.scenarios || {}
  const scenesFb = fallback.scenarios || {}
  const sysIn = value.system || {}
  const sysFb = fallback.system || {}
  const closeIn = value.closing || {}
  const closeFb = fallback.closing || {}
  const stages = padList(howIn.stages, 4, () => ({ title: '', caption: '', image: '' }))
    .map((stage, index) => cleanStage(stage, howFb.stages?.[index] || {}))
  const scenes = padList(scenesIn.items, 3, () => ({ title: '', desc: '', sceneImage: '', deviceImage: '' }))
    .map((item, index) => cleanScene(item, scenesFb.items?.[index] || {}))
  const softLinks = padList(closeIn.softLinks, 2, () => ({ label: '', action: 'demo' }))
    .map((link, index) => ({
      label: cleanText(link.label, closeFb.softLinks?.[index]?.label || '', 40),
      action: cleanText(link.action, closeFb.softLinks?.[index]?.action || 'demo', 20) || 'demo',
    }))
  return {
    hero: {
      title: cleanText(heroIn.title, heroFb.title || '', 80),
      headline: cleanText(heroIn.headline, heroFb.headline || '', 160),
      description: cleanText(heroIn.description, heroFb.description || '', 400),
      ctaLabel: cleanText(heroIn.ctaLabel, heroFb.ctaLabel || '查看它如何工作', 40),
      ctaHref: cleanHref(heroIn.ctaHref, heroFb.ctaHref || '#hpi-how'),
      backgroundImage: cleanUrl(heroIn.backgroundImage, heroFb.backgroundImage || ''),
      deviceImage: cleanUrl(heroIn.deviceImage, heroFb.deviceImage || ''),
    },
    value: {
      title: cleanText(valueIn.title, valueFb.title || '', 160),
      deviceImage: cleanUrl(valueIn.deviceImage, valueFb.deviceImage || ''),
      left: cleanLines(valueIn.left ?? valueFb.left, 6, 40),
      right: cleanLines(valueIn.right ?? valueFb.right, 6, 40),
      footer: cleanText(valueIn.footer, valueFb.footer || '', 400),
    },
    howItWorks: {
      title: cleanText(howIn.title, howFb.title || '', 80),
      stages,
    },
    scenarios: {
      title: cleanText(scenesIn.title, scenesFb.title || '', 80),
      items: scenes,
    },
    system: {
      title: cleanText(sysIn.title, sysFb.title || '', 80),
      upperLabel: cleanText(sysIn.upperLabel, sysFb.upperLabel || '', 40),
      upperItems: cleanLines(sysIn.upperItems ?? sysFb.upperItems, 8, 24),
      middleLabel: cleanText(sysIn.middleLabel, sysFb.middleLabel || '', 80),
      middleImage: cleanUrl(sysIn.middleImage, sysFb.middleImage || ''),
      lowerItems: cleanLines(sysIn.lowerItems ?? sysFb.lowerItems, 8, 24),
      aspaceHref: cleanHref(sysIn.aspaceHref, sysFb.aspaceHref || ''),
      aspaceLabel: cleanText(sysIn.aspaceLabel, sysFb.aspaceLabel || '', 40),
    },
    closing: {
      title: cleanText(closeIn.title, closeFb.title || '', 80),
      desc: cleanText(closeIn.desc, closeFb.desc || '', 240),
      primaryLabel: cleanText(closeIn.primaryLabel, closeFb.primaryLabel || '预约方案演示', 20),
      softLinks,
    },
  }
}

function catalogProduct(id) {
  return HARDWARE_PRODUCTS.find((item) => item.id === id || item.slug === id) || null
}

function seedItem(product) {
  const story = buildProductStory(product)
  const isSpace = product.productLine === 'space'
  return {
    id: product.slug || product.id,
    slug: product.slug || product.id,
    name: product.name,
    tag: product.id === 'control-screen' ? '旗舰产品' : '',
    hardwareLine: product.productLine || 'space',
    coverImage: product.coverImage || '',
    shortDescription: product.shortDescription || '',
    fullDescription: product.fullDescription || '',
    capabilities: product.capabilities || [],
    scenarios: product.scenarios || [],
    detailCtaLabel: '查看产品详情',
    solutionLabel: isSpace ? '了解 ASpace 总体方案' : '',
    solutionHref: isSpace ? '/solutions/' : '',
    linkedHardwareIds: [product.id],
    published: true,
    story,
  }
}

export function defaultProductLibraryContent() {
  return {
    items: HARDWARE_PRODUCTS
      .filter((item) => item.published !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(seedItem),
  }
}

function validateItem(value = {}, fallback = {}) {
  const catalog = catalogProduct(value.id || value.slug || fallback.id)
  const base = catalog ? seedItem(catalog) : fallback
  const name = cleanText(value.name, fallback.name || base.name || '未命名产品', 80)
  const id = cleanText(value.id, fallback.id || `p-${randomUUID().slice(0, 8)}`, 40)
    || `p-${randomUUID().slice(0, 8)}`
  const slug = cleanSlug(value.slug, fallback.slug || base.slug || id)
  const hardwareLine = LINE_IDS.has(value.hardwareLine) ? value.hardwareLine : (fallback.hardwareLine || base.hardwareLine || 'space')
  const storyFallback = fallback.story || base.story || emptyStory({ name, coverImage: value.coverImage || base.coverImage, shortDescription: value.shortDescription, fullDescription: value.fullDescription })
  return {
    id,
    slug,
    name,
    tag: cleanText(value.tag, fallback.tag || base.tag || '', 20),
    hardwareLine,
    coverImage: cleanUrl(value.coverImage, fallback.coverImage || base.coverImage || ''),
    shortDescription: cleanText(value.shortDescription, fallback.shortDescription || base.shortDescription || '', 240),
    fullDescription: cleanText(value.fullDescription, fallback.fullDescription || base.fullDescription || '', 600),
    capabilities: cleanLines(value.capabilities ?? fallback.capabilities ?? base.capabilities, 8, 40),
    scenarios: cleanLines(value.scenarios ?? fallback.scenarios ?? base.scenarios, 8, 40),
    detailCtaLabel: cleanText(value.detailCtaLabel, fallback.detailCtaLabel || base.detailCtaLabel || '查看产品详情', 20),
    solutionLabel: cleanText(value.solutionLabel, fallback.solutionLabel ?? base.solutionLabel ?? '', 40),
    solutionHref: cleanHref(value.solutionHref, fallback.solutionHref || base.solutionHref || ''),
    linkedHardwareIds: [...new Set(cleanLines(value.linkedHardwareIds ?? fallback.linkedHardwareIds ?? base.linkedHardwareIds, 24, 40))],
    published: value.published === undefined ? fallback.published !== false : Boolean(value.published),
    story: cleanStory(value.story || {}, storyFallback),
  }
}

export function validateProductLibraryContent(value = {}) {
  const fallback = defaultProductLibraryContent()
  const source = Array.isArray(value.items) ? value.items : fallback.items
  const usedSlugs = new Set()
  const items = source.slice(0, 80).map((item, index) => {
    const next = validateItem(item, {})
    let slug = next.slug
    if (usedSlugs.has(slug)) slug = `${slug}-${index + 1}`.slice(0, 60)
    usedSlugs.add(slug)
    return { ...next, slug }
  })
  return { items }
}

export function presentProductLibrary(page) {
  if (!page) return page
  return {
    ...page,
    draftContent: validateProductLibraryContent(page.draftContent || {}),
    publishedContent: validateProductLibraryContent(page.publishedContent || page.draftContent || {}),
  }
}

export function getProductLibraryConfig() {
  let page = db().pageConfigs.find((item) => item.pageKey === PRODUCT_LIBRARY_PAGE_KEY && item.locale === 'zh-CN')
  if (!page) {
    const now = new Date().toISOString()
    const content = validateProductLibraryContent(defaultProductLibraryContent())
    page = {
      id: randomUUID(),
      pageKey: PRODUCT_LIBRARY_PAGE_KEY,
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

export function publicProductLibraryContent(page) {
  const content = validateProductLibraryContent(page?.publishedContent || {})
  return {
    items: content.items.filter((item) => item.published !== false),
  }
}
