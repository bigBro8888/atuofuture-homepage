import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'
import { SOLUTIONS } from '../../../../src/data/solutions.js'

export const SOLUTIONS_LIBRARY_PAGE_KEY = 'solutions-library'

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

function cleanSlug(value, fallback = '') {
  const raw = String(value || fallback || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return (raw || fallback || `s-${randomUUID().slice(0, 8)}`).slice(0, 40)
}

function cleanLines(value, maxItems = 12, maxLen = 80) {
  const list = Array.isArray(value)
    ? value
    : String(value || '').split(/[\n,，]+/).map((item) => item.trim())
  return list.map((item) => cleanText(item, '', maxLen)).filter(Boolean).slice(0, maxItems)
}

function cleanCoreValue(value = {}, fallback = {}) {
  return {
    title: cleanText(value.title, fallback.title || '', 40),
    desc: cleanText(value.desc, fallback.desc || '', 200),
    icon: cleanText(value.icon, fallback.icon || 'hub', 40),
  }
}

function cleanScenarios(value, fallback = [], cover = '') {
  const list = Array.isArray(value) && value.length ? value : fallback
  return list
    .map((item) => {
      if (typeof item === 'string') {
        const title = cleanText(item, '', 40)
        return title ? { title, imageUrl: cleanUrl(cover, '') } : null
      }
      const title = cleanText(item?.title || item?.name || '', '', 40)
      if (!title) return null
      return {
        title,
        imageUrl: cleanUrl(item?.imageUrl || item?.image || cover, ''),
      }
    })
    .filter(Boolean)
    .slice(0, 12)
}

function cleanHardware(value, fallback = []) {
  const list = Array.isArray(value) && value.length ? value : fallback
  return list
    .map((item) => {
      if (typeof item === 'string') {
        const title = cleanText(item, '', 40)
        return title ? { title, desc: '可接入空间智能中枢的硬件与系统能力' } : null
      }
      const title = cleanText(item?.title || item?.name || '', '', 40)
      if (!title) return null
      return {
        title,
        desc: cleanText(item?.desc || item?.summary || '', '可接入空间智能中枢的硬件与系统能力', 160),
      }
    })
    .filter(Boolean)
    .slice(0, 12)
}

function defaultFaqs(item = {}) {
  const name = item.name || '该行业'
  const hardware = (item.hardware || [])
    .map((row) => (typeof row === 'string' ? row : row?.title))
    .filter(Boolean)
    .join('、')
  return [
    {
      q: `${name}方案主要解决什么问题？`,
      a: `${item.value || ''}${(item.pains || []).length ? ` 常见痛点包括：${item.pains.join('、')}。` : ''}`.trim(),
    },
    {
      q: '安托未来如何构建该行业方案？',
      a: item.approach || '',
    },
    {
      q: '落地需要哪些智能体与硬件？',
      a: hardware ? `可组合智能体，并连接 ${hardware} 等设备与系统。` : '可按场景组合智能体、硬件与开放接口。',
    },
    {
      q: '如何开始评估与交付？',
      a: '从方案评估、现场勘测、设备部署、联调上线到运维优化，安托未来提供可规模复制的交付路径。可通过预约方案演示启动对接。',
    },
  ].filter((row) => row.q && row.a)
}

function cleanFaqs(value, fallbackItem = {}) {
  const list = Array.isArray(value) && value.length ? value : defaultFaqs(fallbackItem)
  return list
    .map((item) => {
      const q = cleanText(item?.q || item?.title || '', '', 80)
      const a = cleanText(item?.a || item?.desc || '', '', 400)
      return q && a ? { q, a } : null
    })
    .filter(Boolean)
    .slice(0, 8)
}

function cleanSlides(value, cover = '') {
  const list = Array.isArray(value) ? value : []
  const slides = list
    .map((item) => {
      const imageUrl = cleanUrl(typeof item === 'string' ? item : (item?.imageUrl || item?.url || ''), '')
      return imageUrl ? { imageUrl } : null
    })
    .filter(Boolean)
    .slice(0, 30)
  if (!slides.length && cover) {
    const imageUrl = cleanUrl(cover, '')
    if (imageUrl) slides.push({ imageUrl })
  }
  return slides
}

function seedItem(item) {
  return {
    id: item.id,
    slug: item.id,
    name: item.name,
    icon: item.icon || 'domain',
    image: item.image || '',
    summary: item.summary || '',
    value: item.value || '',
    capabilities: item.capabilities || [],
    coreValues: item.coreValues || [],
    highlightAgents: item.highlightAgents || [],
    scenarios: item.scenarios || [],
    pains: item.pains || [],
    approach: item.approach || '',
    journey: item.journey || [],
    agents: item.agents || [],
    hardware: item.hardware || [],
    faqs: item.faqs || defaultFaqs(item),
    canDo: item.canDo || [],
    slides: Array.isArray(item.slides) && item.slides.length
      ? item.slides
      : (item.image ? [{ imageUrl: item.image }] : []),
    published: true,
  }
}

export function defaultSolutionsLibraryContent() {
  return { items: SOLUTIONS.map(seedItem) }
}

function validateItem(value = {}, fallback = {}) {
  const catalog = SOLUTIONS.find((item) => item.id === value.id || item.id === value.slug || item.id === fallback.id)
  const base = catalog ? seedItem(catalog) : fallback
  const coreSource = Array.isArray(value.coreValues) ? value.coreValues : (base.coreValues || [])
  const coreFallback = base.coreValues || []
  const coreValues = [0, 1, 2].map((index) => cleanCoreValue(coreSource[index] || {}, coreFallback[index] || {}))
  const id = cleanSlug(value.id || value.slug, fallback.id || base.id || `s-${randomUUID().slice(0, 8)}`)
  return {
    id,
    slug: id,
    name: cleanText(value.name, fallback.name || base.name || '未命名方案', 80),
    icon: cleanText(value.icon, fallback.icon || base.icon || 'domain', 40),
    image: cleanUrl(value.image, fallback.image || base.image || ''),
    summary: cleanText(value.summary, fallback.summary || base.summary || '', 240),
    value: cleanText(value.value, fallback.value || base.value || '', 240),
    capabilities: cleanLines(value.capabilities ?? fallback.capabilities ?? base.capabilities, 8, 40),
    coreValues,
    highlightAgents: cleanLines(value.highlightAgents ?? fallback.highlightAgents ?? base.highlightAgents, 8, 40),
    scenarios: cleanScenarios(value.scenarios, fallback.scenarios || base.scenarios, value.image || fallback.image || base.image || ''),
    pains: cleanLines(value.pains ?? fallback.pains ?? base.pains, 8, 80),
    approach: cleanText(value.approach, fallback.approach || base.approach || '', 400),
    journey: cleanLines(value.journey ?? fallback.journey ?? base.journey, 8, 40),
    agents: cleanLines(value.agents ?? fallback.agents ?? base.agents, 12, 40),
    hardware: cleanHardware(value.hardware, fallback.hardware || base.hardware),
    faqs: cleanFaqs(value.faqs, { ...base, ...fallback, ...value }),
    canDo: cleanLines(value.canDo ?? fallback.canDo ?? base.canDo, 12, 40),
    slides: cleanSlides(value.slides ?? fallback.slides ?? base.slides, value.image || fallback.image || base.image || ''),
    published: value.published === undefined ? fallback.published !== false : Boolean(value.published),
  }
}

export function validateSolutionsLibraryContent(value = {}) {
  const fallback = defaultSolutionsLibraryContent()
  const source = Array.isArray(value.items) ? value.items : fallback.items
  const used = new Set()
  const items = source.slice(0, 40).map((item, index) => {
    const next = validateItem(item, {})
    let id = next.id
    if (used.has(id)) id = `${id}-${index + 1}`.slice(0, 40)
    used.add(id)
    return { ...next, id, slug: id }
  })
  return { items }
}

export function presentSolutionsLibrary(page) {
  if (!page) return page
  return {
    ...page,
    draftContent: validateSolutionsLibraryContent(page.draftContent || {}),
    publishedContent: validateSolutionsLibraryContent(page.publishedContent || page.draftContent || {}),
  }
}

export function getSolutionsLibraryConfig() {
  let page = db().pageConfigs.find((item) => item.pageKey === SOLUTIONS_LIBRARY_PAGE_KEY && item.locale === 'zh-CN')
  if (!page) {
    const now = new Date().toISOString()
    const content = validateSolutionsLibraryContent(defaultSolutionsLibraryContent())
    page = {
      id: randomUUID(),
      pageKey: SOLUTIONS_LIBRARY_PAGE_KEY,
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

export function publicSolutionsLibraryContent(page) {
  const content = validateSolutionsLibraryContent(page?.publishedContent || {})
  return { items: content.items.filter((item) => item.published !== false) }
}
