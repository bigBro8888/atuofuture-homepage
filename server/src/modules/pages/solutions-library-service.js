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
    canDo: item.canDo || [],
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
    scenarios: cleanLines(value.scenarios ?? fallback.scenarios ?? base.scenarios, 12, 40),
    pains: cleanLines(value.pains ?? fallback.pains ?? base.pains, 8, 80),
    approach: cleanText(value.approach, fallback.approach || base.approach || '', 400),
    journey: cleanLines(value.journey ?? fallback.journey ?? base.journey, 8, 40),
    agents: cleanLines(value.agents ?? fallback.agents ?? base.agents, 12, 40),
    hardware: cleanLines(value.hardware ?? fallback.hardware ?? base.hardware, 12, 40),
    canDo: cleanLines(value.canDo ?? fallback.canDo ?? base.canDo, 12, 40),
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
