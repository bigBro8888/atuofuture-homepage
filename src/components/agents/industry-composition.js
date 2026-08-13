import { AGENTS_INDUSTRY, getIndustryComposition } from '../../data/agents-overview.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function panelMarkup(item) {
  return `
    <div class="ag-ind__panel" data-ag-ind-panel>
      <div class="ag-ind__media">
        <img
          src="${esc(item.image)}"
          alt="${esc(item.title)}场景"
          width="960"
          height="640"
          loading="lazy"
          data-ag-ind-img
        />
      </div>
      <div class="ag-ind__info">
        <h3 data-ag-ind-title>${esc(item.title)}</h3>
        <p data-ag-ind-desc>${esc(item.desc)}</p>
        <div class="ag-ind__combo" data-ag-ind-combo>
          ${item.combo
            .map(
              (c) => `
            <span class="ag-ind__dot"><i></i>${esc(c.label)}</span>`
            )
            .join('')}
        </div>
        <ol class="ag-ind__chain" data-ag-ind-chain>
          ${item.chain
            .map(
              (step, i) => `
            <li>
              <em>${String(i + 1).padStart(2, '0')}</em>
              <strong>${esc(step)}</strong>
            </li>`
            )
            .join('')}
        </ol>
        <a class="ag-text-link" data-ag-ind-link href="${esc(item.href)}">
          查看行业方案
          <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </a>
      </div>
    </div>`
}

/**
 * IndustryAgentComposition
 * @param {{ selectedIndustryId: string }} props
 */
export function renderIndustryAgentComposition({ selectedIndustryId }) {
  const selected = getIndustryComposition(selectedIndustryId)
  return `
    <section class="ag-ind" id="agent-industry">
      <div class="ag-shell ag-shell--1280">
        <header class="ag-section-head">
          <h2>按业务场景组合智能体能力</h2>
          <p>围绕具体行业，将多个智能体、软件系统和智能硬件组合成可直接落地的协同方案。</p>
        </header>
        <div class="ag-ind__layout">
          <nav class="ag-ind__nav" aria-label="行业协同方案">
            ${AGENTS_INDUSTRY.map((item) => {
              const on = item.id === selected.id
              return `
              <button
                type="button"
                class="ag-ind__item${on ? ' is-selected' : ''}"
                data-ag-industry="${esc(item.id)}"
                aria-pressed="${on ? 'true' : 'false'}"
              >
                <span class="ag-ind__item-copy">
                  <strong>${esc(item.title)}</strong>
                  <small>${esc(item.navDesc)}</small>
                </span>
                <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>`
            }).join('')}
          </nav>
          ${panelMarkup(selected)}
        </div>
      </div>
    </section>`
}

export function syncIndustryAgentComposition(root, selectedIndustryId) {
  const selected = getIndustryComposition(selectedIndustryId)
  const panel = root.querySelector('[data-ag-ind-panel]')
  if (panel) {
    panel.classList.remove('is-animating')
    void panel.offsetWidth
    panel.classList.add('is-animating')
  }

  root.querySelectorAll('[data-ag-industry]').forEach((btn) => {
    const on = btn.dataset.agIndustry === selected.id
    btn.classList.toggle('is-selected', on)
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
  })

  const img = root.querySelector('[data-ag-ind-img]')
  if (img) {
    img.src = selected.image
    img.alt = `${selected.title}场景`
  }

  const setText = (sel, value) => {
    const el = root.querySelector(sel)
    if (el) el.textContent = value
  }
  setText('[data-ag-ind-title]', selected.title)
  setText('[data-ag-ind-desc]', selected.desc)

  const combo = root.querySelector('[data-ag-ind-combo]')
  if (combo) {
    combo.innerHTML = selected.combo
      .map((c) => `<span class="ag-ind__dot"><i></i>${esc(c.label)}</span>`)
      .join('')
  }

  const chain = root.querySelector('[data-ag-ind-chain]')
  if (chain) {
    chain.innerHTML = selected.chain
      .map(
        (step, i) => `
      <li>
        <em>${String(i + 1).padStart(2, '0')}</em>
        <strong>${esc(step)}</strong>
      </li>`
      )
      .join('')
  }

  const link = root.querySelector('[data-ag-ind-link]')
  if (link) link.setAttribute('href', selected.href)
}
