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

function renderJoinPoints(items) {
  const list = document.querySelector('[data-about-join-points]')
  if (!list || !items?.length) return
  list.innerHTML = items.map((item, index) => {
    const step = escapeHtml(item.step || String(index + 1).padStart(2, '0'))
    return `<li data-about-join-item><b>${step}</b><div><h3>${escapeHtml(item.title || '')}</h3><p>${escapeHtml(item.body || '')}</p></div></li>`
  }).join('')
}

function renderJoinCarousel(slides) {
  const root = document.querySelector('[data-about-join-carousel]')
  if (!root) return
  const list = (slides || []).filter((item) => item?.imageUrl)
  if (list.length) {
    root.innerHTML = `
      <div class="ab-join__film">
        ${list.map((item, index) => `
          <figure class="ab-join__slide${index === 0 ? ' is-active' : ''}">
            <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.caption || '')}">
            ${item.caption ? `<figcaption>${escapeHtml(item.caption)}</figcaption>` : ''}
          </figure>`).join('')}
      </div>
      <div class="ab-join__bar">
        <button type="button" class="ab-join__ctrl" data-about-join-prev aria-label="上一张">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 4.5 8 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="ab-join__dots" data-about-join-dots>
          ${list.map((_, index) => `<button type="button" class="${index === 0 ? 'is-active' : ''}" aria-label="第 ${index + 1} 张"></button>`).join('')}
        </div>
        <button type="button" class="ab-join__ctrl" data-about-join-next aria-label="下一张">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 4.5 16 12l-7.5 7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>`
  }
  bindJoinCarousel(root)
}

function bindJoinCarousel(root) {
  if (!root) return
  root._joinCleanup?.()
  const slides = [...root.querySelectorAll('.ab-join__slide')]
  const dots = [...root.querySelectorAll('[data-about-join-dots] button')]
  if (slides.length < 2) return

  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')))
  let timer = 0
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function goTo(next) {
    index = ((next % slides.length) + slides.length) % slides.length
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index))
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index))
  }

  function play() {
    if (reduced) return
    stop()
    timer = window.setInterval(() => goTo(index + 1), 5200)
  }

  function stop() {
    window.clearInterval(timer)
    timer = 0
  }

  const onPrev = () => { goTo(index - 1); play() }
  const onNext = () => { goTo(index + 1); play() }
  root.querySelector('[data-about-join-prev]')?.addEventListener('click', onPrev)
  root.querySelector('[data-about-join-next]')?.addEventListener('click', onNext)
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); play() }))
  root.addEventListener('mouseenter', stop)
  root.addEventListener('mouseleave', play)
  root.addEventListener('focusin', stop)
  root.addEventListener('focusout', play)

  let touchX = 0
  const film = root.querySelector('.ab-join__film')
  const onTouchStart = (event) => { touchX = event.changedTouches[0].clientX }
  const onTouchEnd = (event) => {
    const dx = event.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 40) { goTo(index + (dx < 0 ? 1 : -1)); play() }
  }
  film?.addEventListener('touchstart', onTouchStart, { passive: true })
  film?.addEventListener('touchend', onTouchEnd, { passive: true })

  root._joinCleanup = () => {
    stop()
    root.removeEventListener('mouseenter', stop)
    root.removeEventListener('mouseleave', play)
    root.removeEventListener('focusin', stop)
    root.removeEventListener('focusout', play)
    film?.removeEventListener('touchstart', onTouchStart)
    film?.removeEventListener('touchend', onTouchEnd)
  }
  play()
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
    text('h3', item.title, card)
    text('p', item.body, card)
  })

  text('[data-about-partners-label]', content.partners?.label)
  text('[data-about-partners-title]', content.partners?.title)
  text('[data-about-partners-intro]', content.partners?.intro)
  renderPartnerMarquee(content.partners?.items)

  text('[data-about-join-label]', content.join?.label)
  text('[data-about-join-title]', content.join?.title)
  text('[data-about-join-lead]', content.join?.lead)
  text('[data-about-join-cta]', content.join?.ctaLabel)
  href('[data-about-join-cta]', content.join?.ctaHref)
  renderJoinPoints(content.join?.items)
  renderJoinCarousel(content.join?.slides)

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
  bindJoinCarousel(document.querySelector('[data-about-join-carousel]'))
  try {
    const payload = await getAboutContent()
    applyAboutContent(payload.content)
  } catch {
    /* 无后台时保留页面静态文案 */
  }
}
