import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'
import { AGENT_DETAILS, AGENT_ORDER } from '../../../../src/data/agents-detail.js'
import { AGENTS_OVERVIEW } from '../../../../src/data/agents-overview.js'

export const AGENTS_LIBRARY_PAGE_KEY = 'agents-library'

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
  return (raw || fallback || `a-${randomUUID().slice(0, 8)}`).slice(0, 40)
}

function cleanLines(value, maxItems = 12, maxLen = 80) {
  const list = Array.isArray(value)
    ? value
    : String(value || '').split(/[\n,，]+/).map((item) => item.trim())
  return list.map((item) => cleanText(item, '', maxLen)).filter(Boolean).slice(0, maxItems)
}

function pad(list, count, factory) {
  const next = Array.isArray(list) ? [...list] : []
  while (next.length < count) next.push(factory())
  return next.slice(0, count)
}

function seedItem(id) {
  const detail = AGENT_DETAILS[id] || {}
  const overview = AGENTS_OVERVIEW.find((item) => item.id === id) || {}
  return {
    id,
    slug: id,
    name: detail.name || overview.name || id,
    shortName: overview.shortName || '',
    icon: detail.icon || overview.icon || 'smart_toy',
    accent: detail.accent || '0, 82, 209',
    eyebrow: detail.eyebrow || '',
    tagline: detail.tagline || overview.blurb || '',
    overview: detail.overview || '',
    blurb: overview.blurb || '',
    value: overview.value || '',
    trigger: overview.trigger || '',
    action: overview.action || '',
    result: overview.result || '',
    sceneImage: overview.sceneImage || '',
    capabilities: detail.capabilities || [],
    workflow: detail.workflow || [],
    metrics: detail.metrics || [],
    scenarios: detail.scenarios || [],
    published: true,
  }
}

export function defaultAgentsLibraryContent() {
  return { items: AGENT_ORDER.map(seedItem) }
}

function validateCap(value = {}, fallback = {}) {
  return {
    icon: cleanText(value.icon, fallback.icon || 'auto_awesome', 40),
    title: cleanText(value.title, fallback.title || '', 40),
    desc: cleanText(value.desc, fallback.desc || '', 160),
  }
}

function validateStep(value = {}, fallback = {}) {
  return {
    title: cleanText(value.title, fallback.title || '', 40),
    desc: cleanText(value.desc, fallback.desc || '', 160),
  }
}

function validateMetric(value = {}, fallback = {}) {
  return {
    value: cleanText(value.value, fallback.value || '', 20),
    label: cleanText(value.label, fallback.label || '', 20),
  }
}

function validateItem(value = {}, fallback = {}) {
  const id = cleanSlug(value.id || value.slug, fallback.id || `a-${randomUUID().slice(0, 8)}`)
  const catalogId = AGENT_DETAILS[id] ? id : (AGENT_DETAILS[fallback.id] ? fallback.id : '')
  const catalog = catalogId ? seedItem(catalogId) : fallback
  const caps = pad(value.capabilities, 4, () => ({})).map((item, index) => validateCap(item, catalog.capabilities?.[index] || {}))
  const workflow = pad(value.workflow, 4, () => ({})).map((item, index) => validateStep(item, catalog.workflow?.[index] || {}))
  const metrics = pad(value.metrics, 3, () => ({})).map((item, index) => validateMetric(item, catalog.metrics?.[index] || {}))
  return {
    id,
    slug: id,
    name: cleanText(value.name, fallback.name || catalog.name || '未命名智能体', 80),
    shortName: cleanText(value.shortName, fallback.shortName || catalog.shortName || '', 20),
    icon: cleanText(value.icon, fallback.icon || catalog.icon || 'smart_toy', 40),
    accent: cleanText(value.accent, fallback.accent || catalog.accent || '0, 82, 209', 40),
    eyebrow: cleanText(value.eyebrow, fallback.eyebrow || catalog.eyebrow || '', 40),
    tagline: cleanText(value.tagline, fallback.tagline || catalog.tagline || '', 240),
    overview: cleanText(value.overview, fallback.overview || catalog.overview || '', 800),
    blurb: cleanText(value.blurb, fallback.blurb || catalog.blurb || '', 80),
    value: cleanText(value.value, fallback.value || catalog.value || '', 160),
    trigger: cleanText(value.trigger, fallback.trigger || catalog.trigger || '', 200),
    action: cleanText(value.action, fallback.action || catalog.action || '', 240),
    result: cleanText(value.result, fallback.result || catalog.result || '', 200),
    sceneImage: cleanUrl(value.sceneImage, fallback.sceneImage || catalog.sceneImage || ''),
    capabilities: caps,
    workflow,
    metrics,
    scenarios: cleanLines(value.scenarios ?? fallback.scenarios ?? catalog.scenarios, 8, 40),
    published: value.published === undefined ? fallback.published !== false : Boolean(value.published),
  }
}

export function validateAgentsLibraryContent(value = {}) {
  const fallback = defaultAgentsLibraryContent()
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

export function presentAgentsLibrary(page) {
  if (!page) return page
  return {
    ...page,
    draftContent: validateAgentsLibraryContent(page.draftContent || {}),
    publishedContent: validateAgentsLibraryContent(page.publishedContent || page.draftContent || {}),
  }
}

export function getAgentsLibraryConfig() {
  let page = db().pageConfigs.find((item) => item.pageKey === AGENTS_LIBRARY_PAGE_KEY && item.locale === 'zh-CN')
  if (!page) {
    const now = new Date().toISOString()
    const content = validateAgentsLibraryContent(defaultAgentsLibraryContent())
    page = {
      id: randomUUID(),
      pageKey: AGENTS_LIBRARY_PAGE_KEY,
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

export function publicAgentsLibraryContent(page) {
  const content = validateAgentsLibraryContent(page?.publishedContent || {})
  return { items: content.items.filter((item) => item.published !== false) }
}
