import { getHomeContent } from '../services/home-content-api.js'

function text(selector, value, root = document) {
  const element = root.querySelector(selector)
  if (element && value !== undefined) element.textContent = value
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
  linkAction(document.querySelector('[data-home-solutions-more]'), content.solutions?.moreUrl)
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

  const ctaTitle = document.querySelector('[data-home-cta-title]')
  if (ctaTitle && content.cta?.title) {
    ctaTitle.textContent = content.cta.title
    ctaTitle.dataset.text = content.cta.title
  }
  text('[data-home-cta-primary]', content.cta?.primaryLabel)
  text('[data-home-cta-secondary]', content.cta?.secondaryLabel)
  text('[data-home-cta-note]', content.cta?.note)
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
