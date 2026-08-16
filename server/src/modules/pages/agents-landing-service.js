import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'
import {
  AGENTS_CAPABILITY_CHAIN,
  AGENTS_HUB_LAYERS,
  AGENTS_INDUSTRY,
  AGENTS_OVERVIEW,
} from '../../../../src/data/agents-overview.js'

export const AGENTS_PAGE_KEY = 'agents'

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
  const source = Array.isArray(value)
    ? value
    : String(value ?? '').split(/\n|、|,|，/)
  const list = source.map((item) => String(item).trim()).filter(Boolean)
  const base = list.length ? list : fallback
  return base.slice(0, maxItems).map((item) => String(item).slice(0, maxLen))
}

function overlayList(source, fallback, mapItem) {
  const incoming = Array.isArray(source) && source.length ? source : fallback
  return incoming.slice(0, 16).map((item, index) => mapItem(item || {}, fallback[index] || fallback[0] || {}, index))
}

export function defaultAgentsContent() {
  return {
    hero: {
      title: '让空间智能体感知现场、调用设备、完成任务',
      subtitle: '不只是回答问题，而是连接软件系统、智能硬件与业务流程，让空间能够自主感知、判断、执行并持续反馈。',
      bannerUrl: '/images/agents/hero-bleed.jpg',
      ctaLabel: '预约方案演示',
      exploreLabel: '探索八大智能体',
    },
    chain: structuredClone(AGENTS_CAPABILITY_CHAIN),
    hub: structuredClone(AGENTS_HUB_LAYERS),
    ecoTitle: '空间智能体，让业务目标在真实空间自动落地',
    story: {
      title: '看一次智能体如何完成真实任务',
      subtitle: '从现场变化开始，到系统与设备执行，再到结果回读，让智能体真正进入业务现场。',
    },
    agents: structuredClone(AGENTS_OVERVIEW),
    industries: structuredClone(AGENTS_INDUSTRY),
    cta: {
      title: '让空间智能体进入您的业务现场',
      body: '从一个场景开始，连接现有系统和设备，逐步构建可感知、可执行、可持续运营的空间智能体系。',
      primary: '预约方案演示',
      secondaryLabel: '查看行业解决方案',
      secondaryHref: '../solutions/',
    },
  }
}

function migrateLegacy(value = {}) {
  if (value.hero && Array.isArray(value.agents)) return value
  const next = defaultAgentsContent()
  if (value.title) next.hero.title = value.title
  if (value.subtitle) next.hero.subtitle = value.subtitle
  if (value.bannerUrl) next.hero.bannerUrl = value.bannerUrl
  if (value.ctaLabel) next.hero.ctaLabel = value.ctaLabel
  return next
}

export function validateAgentsContent(raw = {}) {
  const value = migrateLegacy(raw)
  const fallback = defaultAgentsContent()
  const hubSrc = value.hub || {}
  return {
    hero: {
      title: text(value.hero?.title, fallback.hero.title, 120),
      subtitle: text(value.hero?.subtitle, fallback.hero.subtitle, 400),
      bannerUrl: url(value.hero?.bannerUrl, fallback.hero.bannerUrl),
      ctaLabel: text(value.hero?.ctaLabel, fallback.hero.ctaLabel, 20),
      exploreLabel: text(value.hero?.exploreLabel, fallback.hero.exploreLabel, 20),
    },
    chain: overlayList(value.chain, fallback.chain, (item, fb) => ({
      id: text(item.id, fb.id, 40) || `chain-${randomUUID().slice(0, 6)}`,
      title: text(item.title, fb.title, 40),
      icon: text(item.icon, fb.icon, 40),
    })),
    hub: {
      software: {
        title: text(hubSrc.software?.title, fallback.hub.software.title, 20),
        items: lines(hubSrc.software?.items, fallback.hub.software.items, 12, 20),
      },
      hardware: {
        title: text(hubSrc.hardware?.title, fallback.hub.hardware.title, 20),
        items: lines(hubSrc.hardware?.items, fallback.hub.hardware.items, 12, 20),
      },
      ecosystem: {
        title: text(hubSrc.ecosystem?.title, fallback.hub.ecosystem.title, 20),
        items: lines(hubSrc.ecosystem?.items, fallback.hub.ecosystem.items, 12, 20),
      },
    },
    ecoTitle: text(value.ecoTitle, fallback.ecoTitle, 80),
    story: {
      title: text(value.story?.title, fallback.story.title, 80),
      subtitle: text(value.story?.subtitle, fallback.story.subtitle, 240),
    },
    agents: overlayList(value.agents, fallback.agents, (item, fb) => ({
      ...fb,
      id: text(item.id, fb.id, 40) || `agent-${randomUUID().slice(0, 6)}`,
      name: text(item.name, fb.name, 40),
      shortName: text(item.shortName, fb.shortName, 20),
      blurb: text(item.blurb, fb.blurb, 80),
      value: text(item.value, fb.value, 80),
      trigger: text(item.trigger, fb.trigger, 200),
      action: text(item.action, fb.action, 240),
      result: text(item.result, fb.result, 200),
      workflow: lines(item.workflow, fb.workflow, 8, 40),
      sceneImage: url(item.sceneImage, fb.sceneImage),
      icon: text(item.icon, fb.icon, 40),
      side: item.side === 'right' || fb.side === 'right' ? 'right' : 'left',
      detailUrl: text(item.detailUrl, fb.detailUrl || `../agent-detail/?id=${item.id || fb.id}`, 120),
      sceneNodes: Array.isArray(item.sceneNodes) && item.sceneNodes.length ? item.sceneNodes : fb.sceneNodes,
    })),
    industries: overlayList(value.industries, fallback.industries, (item, fb) => ({
      ...fb,
      id: text(item.id, fb.id, 40) || `ind-${randomUUID().slice(0, 6)}`,
      title: text(item.title, fb.title, 40),
      navDesc: text(item.navDesc, fb.navDesc, 80),
      desc: text(item.desc, fb.desc, 200),
      image: url(item.image, fb.image),
      href: text(item.href, fb.href, 120),
      chain: lines(item.chain, fb.chain, 8, 40),
      combo: Array.isArray(item.combo) && item.combo.length
        ? item.combo.slice(0, 8).map((c, i) => ({
          id: text(c.id, fb.combo?.[i]?.id, 40),
          label: text(c.label, fb.combo?.[i]?.label, 20),
        }))
        : fb.combo,
    })),
    cta: {
      title: text(value.cta?.title, fallback.cta.title, 80),
      body: text(value.cta?.body, fallback.cta.body, 240),
      primary: text(value.cta?.primary, fallback.cta.primary, 20),
      secondaryLabel: text(value.cta?.secondaryLabel, fallback.cta.secondaryLabel, 20),
      secondaryHref: text(value.cta?.secondaryHref, fallback.cta.secondaryHref, 120),
    },
  }
}

export function getAgentsPageConfig() {
  let page = db().pageConfigs.find((item) => item.pageKey === AGENTS_PAGE_KEY && item.locale === 'zh-CN')
  const content = validateAgentsContent(page?.draftContent || defaultAgentsContent())
  if (!page) {
    const now = new Date().toISOString()
    page = {
      id: randomUUID(),
      pageKey: AGENTS_PAGE_KEY,
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
  if (!page.publishedContent?.agents) page.publishedContent = structuredClone(content)
  return page
}
