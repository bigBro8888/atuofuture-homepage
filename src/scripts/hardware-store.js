import { HARDWARE_SECTIONS, HARDWARE_MAIN_CATEGORIES } from '../data/hardware-catalog.js'

function renderAllSections() {
  return HARDWARE_SECTIONS.map(
    (section) => `
    <section class="sx-hw-section" id="${section.id}">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sx-section-head">
          <span>${section.id.toUpperCase()}</span>
          <h2>${section.title}</h2>
          <p>${section.desc}</p>
        </div>
        <div class="sx-hw-grid">
          ${section.products
            .map(
              (p) => `
            <article class="sx-hw-card">
              <span class="material-symbols-outlined">${p.icon}</span>
              <h3>${p.name}</h3>
              <p>${p.desc}</p>
            </article>`
            )
            .join('')}
        </div>
      </div>
    </section>`
  ).join('')
}

export function initHardwareStore() {
  const tabs = document.getElementById('hardware-category-tabs')
  const catalog = document.getElementById('hardware-catalog')
  if (!tabs || !catalog) return

  catalog.innerHTML = renderAllSections()

  tabs.innerHTML = HARDWARE_MAIN_CATEGORIES.map(
    (cat) =>
      `<a class="hardware-category-tab" href="#${cat.id}" data-category="${cat.id}">${cat.label}</a>`
  ).join('')

  const hash = window.location.hash.replace('#', '')
  if (hash && document.getElementById(hash)) {
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    tabs.querySelectorAll('[data-category]').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.category === hash)
    })
  } else if (HARDWARE_MAIN_CATEGORIES[0]) {
    tabs.querySelector(`[data-category="${HARDWARE_MAIN_CATEGORIES[0].id}"]`)?.classList.add('is-active')
  }

  tabs.addEventListener('click', (e) => {
    const link = e.target.closest('[data-category]')
    if (!link) return
    tabs.querySelectorAll('[data-category]').forEach((el) => {
      el.classList.toggle('is-active', el === link)
    })
  })
}
