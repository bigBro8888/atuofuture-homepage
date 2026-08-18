import { getAboutContent } from '../services/about-content-api.js'

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[character]))
}

function text(selector, value, root = document) {
  const element = root.querySelector(selector)
  if (element && value !== undefined) element.textContent = value
}

function href(selector, value) {
  const element = document.querySelector(selector)
  if (element && value) element.setAttribute('href', value)
}

function src(selector, value, root = document) {
  const element = root.querySelector(selector)
  if (element && value) element.setAttribute('src', value)
}

function bg(selector, value) {
  const element = document.querySelector(selector)
  if (element && value) element.style.backgroundImage = `url("${value}")`
}

function partnerLockup(name) {
  const colors = {
    阿里巴巴: '#FF6A00',
    盒马: '#00A86B',
    饿了么: '#0097DC',
    ZEBRA: '#111111',
    银泰: '#C41E3A',
    钉钉: '#0089FF',
    蚂蚁集团: '#1677FF',
    大润发: '#E60012',
  }
  const color = colors[name] || '#12122a'
  return `<span class="ab-partners__mark" style="background:${color}"></span><strong style="color:${color}">${escapeHtml(name)}</strong>`
}

function renderPartnerMarquee(items) {
  const root = document.querySelector('[data-about-partners]')
  if (!root) return
  const logos = (items || []).filter((item) => item?.name)
  if (!logos.length) return
  const tile = (item, hideName) => {
    const visual = item.logoUrl
      ? `<img src="${escapeHtml(item.logoUrl)}" alt="${hideName ? '' : escapeHtml(item.name)}">`
      : partnerLockup(item.name)
    return `<figure class="ab-partners__logo">${visual}</figure>`
  }
  const group = (hideName) => `<div class="ab-partners__group"${hideName ? ' aria-hidden="true"' : ''}>${logos.map((item) => tile(item, hideName)).join('')}</div>`
  const reversed = [...logos].reverse()
  const reverseGroup = `<div class="ab-partners__group" aria-hidden="true">${reversed.map((item) => tile(item, true)).join('')}</div>`
  root.innerHTML = `
    <div class="ab-partners__row ab-partners__row--ltr"><div class="ab-partners__track">${group(false)}${group(true)}</div></div>
    <div class="ab-partners__row ab-partners__row--rtl"><div class="ab-partners__track">${reverseGroup}${reverseGroup}</div></div>`
  root.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      const figure = image.closest('figure')
      if (figure) figure.innerHTML = partnerLockup(image.alt || '客户')
    })
  })
}

export function applyAboutContent(content) {
  if (!content) return

  text('[data-about-hero-title]', content.hero?.title)
  text('[data-about-hero-body]', content.hero?.body)
  text('[data-about-hero-primary]', content.hero?.primaryLabel)
  href('[data-about-hero-primary]', content.hero?.primaryHref)
  text('[data-about-hero-secondary]', content.hero?.secondaryLabel)
  href('[data-about-hero-secondary]', content.hero?.secondaryHref)
  bg('[data-about-hero-image]', content.hero?.imageUrl)

  text('[data-about-story-label]', content.story?.label)
  text('[data-about-story-title]', content.story?.title)
  text('[data-about-story-body1]', content.story?.body1)
  text('[data-about-story-body2]', content.story?.body2)
  src('[data-about-story-image]', content.story?.imageUrl)

  text('[data-about-values-label]', content.values?.label)
  text('[data-about-values-title]', content.values?.title)
  document.querySelectorAll('[data-about-value]').forEach((card, index) => {
    const item = content.values?.items?.[index]
    if (!item) return
    src('[data-about-value-image]', item.imageUrl, card)
    const image = card.querySelector('[data-about-value-image]')
    if (image && item.title) image.alt = item.title
    text('h3', item.title, card)
    text('p', item.body, card)
  })

  text('[data-about-partners-label]', content.partners?.label)
  text('[data-about-partners-title]', content.partners?.title)
  text('[data-about-partners-intro]', content.partners?.intro)
  renderPartnerMarquee(content.partners?.items)

  text('[data-about-duties-label]', content.duties?.label)
  text('[data-about-duties-title]', content.duties?.title)
  document.querySelectorAll('[data-about-duty]').forEach((card, index) => {
    const item = content.duties?.items?.[index]
    if (!item) return
    src('img', item.imageUrl, card)
    text('strong', item.title, card)
    text('span', item.body, card)
  })

  text('[data-about-join-label]', content.join?.label)
  text('[data-about-join-title]', content.join?.title)
  document.querySelectorAll('[data-about-join-item]').forEach((card, index) => {
    const item = content.join?.items?.[index]
    if (!item) return
    text('b', item.step, card)
    text('h3', item.title, card)
    text('p', item.body, card)
  })

  text('[data-about-contact-label]', content.contact?.label)
  text('[data-about-contact-title]', content.contact?.title)
  text('[data-about-contact-lead]', content.contact?.lead)
  text('[data-about-contact-email1]', content.contact?.email1)
  href('[data-about-contact-email1]', content.contact?.email1 ? `mailto:${content.contact.email1}` : '')
  text('[data-about-contact-email2]', content.contact?.email2)
  href('[data-about-contact-email2]', content.contact?.email2 ? `mailto:${content.contact.email2}` : '')
  text('[data-about-contact-address-zh]', content.contact?.addressZh)
  text('[data-about-contact-address-en]', content.contact?.addressEn)
  text('[data-about-contact-join-title]', content.contact?.joinTitle)
  text('[data-about-contact-join-body]', content.contact?.joinBody)
  text('[data-about-contact-join-label]', content.contact?.joinLabel)
  href('[data-about-contact-join-label]', content.contact?.joinHref)
}

export async function loadAndApplyAboutContent() {
  try {
    const payload = await getAboutContent()
    applyAboutContent(payload.content)
  } catch {
    /* 无后台时保留页面静态文案 */
  }
}
