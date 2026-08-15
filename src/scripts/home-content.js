import { getHomeContent } from '../services/home-content-api.js'
import { applyCmsHeroSlides, applyCmsHomeAgents, applyCmsHomeNews, applyCmsHomePitch, applyCmsHomeSolutions } from './home-siemens.js'

function text(selector, value, root = document) {
  const element = root.querySelector(selector)
  if (element && value !== undefined) element.textContent = value
}

function escapeHome(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function linkAction(element, url) {
  if (!element || !url) return
  element.dataset.homeUrl = url
  element.setAttribute('role', 'link')
  element.tabIndex = 0
  element.addEventListener('click', () => { window.location.href = url })
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') window.location.href = url
  })
}

export function applyHomeContent(content) {
  if (!content) return

  text('[data-home-hero-eyebrow]', content.hero?.eyebrow)
  text('[data-home-hero-title]', content.hero?.title)
  text('[data-home-hero-subtitle]', content.hero?.subtitle)
  if (content.hero?.posterUrl) {
    const background = document.querySelector('.hero-ai .bg-cover')
    const video = document.querySelector('[data-hero-video]')
    if (background) background.style.backgroundImage = `url("${content.hero.posterUrl}")`
    if (video) video.poster = content.hero.posterUrl
  }
  const video = document.querySelector('[data-hero-video]')
  const soundToggle = document.querySelector('[data-hero-sound-toggle]')
  if (content.hero?.videoUrl) {
    const source = video?.querySelector('source')
    if (source && source.src !== content.hero.videoUrl) {
      source.src = content.hero.videoUrl
      video.hidden = false
      if (soundToggle) soundToggle.hidden = false
      video.load()
    }
  } else if (content.hero?.posterUrl && video) {
    video.pause()
    video.hidden = true
    if (soundToggle) soundToggle.hidden = true
  }

  text('[data-home-core-kicker]', content.core?.kicker)
  text('[data-home-core-title]', content.core?.title)
  text('[data-home-core-subtitle]', content.core?.subtitle)
  document.querySelectorAll('[data-home-core-item]').forEach((card, index) => {
    const item = content.core?.items?.[index]
    if (!item) return
    text('.core-business-card__head .material-symbols-outlined', item.icon, card)
    text('.core-business-card__head h3', item.title, card)
    text('p', item.description, card)
    text('strong', item.label, card)
  })

  text('[data-home-partners-kicker]', content.partners?.kicker)
  text('[data-home-partners-title]', content.partners?.title)
  text('[data-home-partners-subtitle]', content.partners?.subtitle)
  document.querySelectorAll('[data-home-partners-metrics] > div').forEach((metric, index) => {
    const item = content.partners?.metrics?.[index]
    if (!item) return
    const number = metric.querySelector('.stat-num')
    if (number) {
      number.dataset.target = String(item.value)
      number.textContent = '0'
    }
    text('em', item.suffix, metric)
    const label = metric.querySelector(':scope > span')
    if (label) label.textContent = item.label
  })

  text('[data-home-solutions-eyebrow]', content.solutions?.eyebrow)
  text('[data-home-solutions-title]', content.solutions?.title)
  text('[data-home-solutions-subtitle]', content.solutions?.subtitle)
  text('[data-home-solutions-more-label]', content.solutions?.moreLabel)
  const solutionsMore = document.querySelector('[data-home-solutions-more]')
  if (solutionsMore && content.solutions?.moreUrl) solutionsMore.setAttribute('href', content.solutions.moreUrl)
  if (content.solutions?.items?.length) applyCmsHomeSolutions(content.solutions.items)
  document.querySelectorAll('[data-sol-card]').forEach((card, index) => {
    const item = content.solutions?.items?.[index]
    if (!item) return
    text('.sol-card__chip', item.chip, card)
    text('.sol-card__title', item.title, card)
    text('.sol-card__desc', item.description, card)
    if (item.imageUrl) card.querySelector('.sol-card__img').style.backgroundImage = `url("${item.imageUrl}")`
    const tags = card.querySelector('.sol-card__tags')
    if (tags && Array.isArray(item.tags)) {
      tags.replaceChildren(...item.tags.map((tag) => {
        const span = document.createElement('span')
        span.textContent = tag
        return span
      }))
    }
    linkAction(card.querySelector('.sol-card__link'), item.linkUrl)
  })

  text('[data-home-cases-title]', content.cases?.title)
  document.querySelectorAll('[data-home-case-item]').forEach((card, index) => {
    const item = content.cases?.items?.[index]
    if (!item) return
    text('.p-10 > span', item.client, card)
    text('.p-10 > h3', item.title, card)
    text('.p-10 > p', item.description, card)
    if (item.imageUrl) card.querySelector('.bg-cover').style.backgroundImage = `url("${item.imageUrl}")`
    const link = card.querySelector('a')
    if (link && item.linkUrl) link.href = item.linkUrl
  })

  text('[data-home-banner-title]', content.banner?.title)
  text('[data-home-banner-subtitle]', content.banner?.subtitle)
  const bannerCta = document.querySelector('[data-home-banner-cta]')
  if (bannerCta && content.banner?.ctaLabel) bannerCta.textContent = content.banner.ctaLabel
  if (bannerCta && content.banner?.ctaUrl) bannerCta.setAttribute('href', content.banner.ctaUrl)
  const bannerMedia = document.querySelector('[data-home-banner-media]')
  if (bannerMedia && content.banner?.imageUrl) bannerMedia.style.backgroundImage = `url("${content.banner.imageUrl}")`

  text('[data-home-agents-kicker]', content.agents?.kicker)
  text('[data-home-agents-title]', content.agents?.title)
  text('[data-home-agents-subtitle]', content.agents?.subtitle)
  if (content.agents?.items?.length) applyCmsHomeAgents(content.agents.items)

  text('[data-home-news-kicker]', content.news?.kicker)
  text('[data-home-news-title]', content.news?.title)
  text('[data-home-news-subtitle]', content.news?.subtitle)
  text('[data-home-news-more-label]', content.news?.moreLabel)
  const newsMore = document.querySelector('[data-home-news-more]')
  if (newsMore && content.news?.moreUrl) newsMore.setAttribute('href', content.news.moreUrl)
  if (content.news?.items?.length) applyCmsHomeNews(content.news.items)

  text('[data-home-pitch-label]', content.pitch?.label)
  if (content.pitch?.title) {
    const pitchTitle = document.querySelector('[data-home-pitch-title]')
    if (pitchTitle) pitchTitle.innerHTML = escapeHome(content.pitch.title).replace(/\n/g, '<br>')
  }
  if (content.pitch?.items?.length) applyCmsHomePitch(content.pitch.items)

  if (content.heroSlides?.length) applyCmsHeroSlides(content.heroSlides)
}

export async function loadAndApplyHomeContent() {
  try {
    const { content } = await getHomeContent()
    applyHomeContent(content)
    return true
  } catch {
    return false
  }
}
