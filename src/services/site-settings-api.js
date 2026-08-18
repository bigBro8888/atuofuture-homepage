export async function getPublishedPage(path) {
  const response = await fetch(path, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
  if (!response.ok) return null
  const data = await response.json()
  return data.content || null
}

export function applySiteSettings(content) {
  if (!content) return
  document.querySelectorAll('.site-header__logo-img, .site-footer__logo img').forEach((image) => {
    if (content.logoLightUrl) {
      image.src = content.logoLightUrl
      image.alt = content.brandZh || image.alt
    }
  })
  document.querySelectorAll('.site-header__btn--primary, [data-demo-modal-open]').forEach((element) => {
    if (element.dataset.keepLabel === 'true') return
    if (content.demoLabel && (element.matches('.site-header__btn--primary') || element.classList.contains('site-footer__text-btn'))) {
      if (element.childElementCount === 0) element.textContent = content.demoLabel
    }
  })
  document.querySelectorAll('.site-header__btn--ghost').forEach((element) => {
    if (content.showAppDownload === false) {
      element.hidden = true
      return
    }
    if (!content.downloadLabel) return
    const icon = element.querySelector('.material-symbols-outlined')
    if (icon) element.replaceChildren(icon, document.createTextNode(` ${content.downloadLabel}`))
    else element.textContent = content.downloadLabel
  })
  const footerNote = document.querySelector('.site-footer__bottom p')
  if (footerNote && content.footerNote) footerNote.textContent = content.footerNote
  const contactMail = document.querySelector('.site-footer__col:last-child ul li a[href^="mailto:"]')
  if (contactMail && content.email) {
    contactMail.href = `mailto:${content.email}`
    contactMail.textContent = content.email
  }
}

export async function loadAndApplySiteSettings() {
  try {
    const content = await getPublishedPage('/api/public/pages/site')
    applySiteSettings(content)
    return content
  } catch {
    return null
  }
}

export async function loadSimplePageContent(key) {
  try {
    return await getPublishedPage(`/api/public/pages/simple/${encodeURIComponent(key)}`)
  } catch {
    return null
  }
}

export async function loadNewsFeedContent() {
  try {
    return await getPublishedPage('/api/public/pages/news-feed')
  } catch {
    return null
  }
}

export async function loadProductLibraryContent() {
  try {
    return await getPublishedPage('/api/public/pages/product-library')
  } catch {
    return null
  }
}
