import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'
import { SOLUTIONS, SOLUTIONS_BASE_NODES, SOLUTIONS_HERO } from '../../../../src/data/solutions.js'

export const SOLUTIONS_PAGE_KEY = 'solutions'

function text(value, fallback = '', max = 400) {
  return String(value ?? fallback ?? '').trim().slice(0, max)
}

function url(value, fallback = '') {
  const raw = String(value ?? fallback ?? '').trim()
  if (!raw) return fallback
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
  return incoming.slice(0, 16).map((item, index) => mapItem(item || {}, fallback[index] || fallback[0] || {}, index))
}

export function defaultSolutionsContent() {
  return {
    hero: {
      title: SOLUTIONS_HERO.title,
      subtitle: SOLUTIONS_HERO.desc,
      bannerUrl: SOLUTIONS_HERO.image,
      ctaLabel: '预约方案演示',
    },
    sceneTitle: '选择您的行业场景',
    items: structuredClone(SOLUTIONS),
    base: {
      title: '统一空间智能底座，组合不同的行业能力',
      subtitle: '不同空间面对的问题不同，但底层都需要完成感知、决策、执行与反馈。安托未来通过统一中枢，按行业组合智能体、硬件和开放接口。',
      nodes: structuredClone(SOLUTIONS_BASE_NODES),
    },
    cta: {
      title: '找到适合您的空间智能方案',
      body: '告诉我们您的行业、空间规模和核心问题，安托未来将为您组合合适的智能体、硬件与系统能力。',
      primary: '预约方案演示',
      secondaryLabel: '联系方案顾问',
      secondaryHref: '../about/#contact',
      imageUrl: '/images/solutions/cta.jpg',
    },
  }
}

function migrateLegacy(value = {}) {
  if (value.hero && Array.isArray(value.items)) return value
  const next = defaultSolutionsContent()
  if (value.title) next.hero.title = value.title
  if (value.subtitle) next.hero.subtitle = value.subtitle
  if (value.bannerUrl) next.hero.bannerUrl = value.bannerUrl
  if (value.ctaLabel) next.hero.ctaLabel = value.ctaLabel
  return next
}

export function validateSolutionsContent(raw = {}) {
  const value = migrateLegacy(raw)
  const fallback = defaultSolutionsContent()
  return {
    hero: {
      title: text(value.hero?.title, fallback.hero.title, 120),
      subtitle: text(value.hero?.subtitle, fallback.hero.subtitle, 400),
      bannerUrl: url(value.hero?.bannerUrl, fallback.hero.bannerUrl),
      ctaLabel: text(value.hero?.ctaLabel, fallback.hero.ctaLabel, 20),
    },
    sceneTitle: text(value.sceneTitle, fallback.sceneTitle, 40),
    items: overlayList(value.items, fallback.items, (item, fb) => ({
      ...fb,
      id: text(item.id, fb.id, 40) || `sol-${randomUUID().slice(0, 6)}`,
      name: text(item.name, fb.name, 40),
      icon: text(item.icon, fb.icon, 40),
      image: url(item.image, fb.image),
      summary: text(item.summary, fb.summary, 200),
      value: text(item.value, fb.value, 200),
      capabilities: lines(item.capabilities, fb.capabilities, 8, 40),
      coreValues: overlayList(item.coreValues, fb.coreValues || [], (cv, cf) => ({
        title: text(cv.title, cf.title, 40),
        desc: text(cv.desc, cf.desc, 160),
        icon: text(cv.icon, cf.icon, 40),
      })),
      highlightAgents: lines(item.highlightAgents, fb.highlightAgents, 6, 40),
      scenarios: lines(item.scenarios, fb.scenarios, 10, 40),
      pains: lines(item.pains, fb.pains, 8, 40),
      approach: text(item.approach, fb.approach, 240),
      journey: lines(item.journey, fb.journey, 8, 40),
      agents: lines(item.agents, fb.agents, 10, 40),
      hardware: lines(item.hardware, fb.hardware, 10, 40),
      canDo: lines(item.canDo, fb.canDo, 10, 40),
    })),
    base: {
      title: text(value.base?.title, fallback.base.title, 80),
      subtitle: text(value.base?.subtitle, fallback.base.subtitle, 300),
      nodes: overlayList(value.base?.nodes, fallback.base.nodes, (item, fb) => ({
        id: text(item.id, fb.id, 40),
        title: text(item.title, fb.title, 40),
        desc: text(item.desc, fb.desc, 120),
        icon: text(item.icon, fb.icon, 40),
      })),
    },
    cta: {
      title: text(value.cta?.title, fallback.cta.title, 80),
      body: text(value.cta?.body, fallback.cta.body, 240),
      primary: text(value.cta?.primary, fallback.cta.primary, 20),
      secondaryLabel: text(value.cta?.secondaryLabel, fallback.cta.secondaryLabel, 20),
      secondaryHref: text(value.cta?.secondaryHref, fallback.cta.secondaryHref, 120),
      imageUrl: url(value.cta?.imageUrl, fallback.cta.imageUrl),
    },
  }
}

export function getSolutionsPageConfig() {
  let page = db().pageConfigs.find((item) => item.pageKey === SOLUTIONS_PAGE_KEY && item.locale === 'zh-CN')
  const content = validateSolutionsContent(page?.draftContent || defaultSolutionsContent())
  if (!page) {
    const now = new Date().toISOString()
    page = {
      id: randomUUID(),
      pageKey: SOLUTIONS_PAGE_KEY,
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
  if (!page.publishedContent?.items) page.publishedContent = structuredClone(content)
  return page
}
