import { AGENTS_OVERVIEW } from '../../data/agents-overview.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stepIcon(i) {
  const names = ['sensors', 'query_stats', 'psychology', 'settings_ethernet', 'task_alt']
  return names[i] || 'circle'
}

/**
 * AgentTaskStory
 * @param {{ selectedId: string }} props
 */
export function renderAgentTaskStory({ selectedId }) {
  const selected = AGENTS_OVERVIEW.find((a) => a.id === selectedId) || AGENTS_OVERVIEW[0]
  return `
    <section class="ag-story" id="agent-story">
      <div class="ag-shell ag-shell--1280">
        <header class="ag-section-head">
          <h2>看一次智能体如何完成真实任务</h2>
          <p>从现场变化开始，到系统与设备执行，再到结果回读，让智能体真正进入业务现场。</p>
        </header>

        <div class="ag-story__nav" role="tablist" aria-label="智能体切换">
          ${AGENTS_OVERVIEW.map((a) => {
            const on = a.id === selected.id
            return `
            <button
              type="button"
              class="ag-story__tab${on ? ' is-selected' : ''}"
              role="tab"
              aria-selected="${on ? 'true' : 'false'}"
              data-ag-select="${esc(a.id)}"
            >
              <span class="material-symbols-outlined" aria-hidden="true">${esc(a.icon)}</span>
              <span>${esc(a.shortName)}</span>
            </button>`
          }).join('')}
        </div>

        <div class="ag-story__stage" data-ag-story-stage>
          <div class="ag-story__scene" data-ag-scene>
            <img
              src="${esc(selected.sceneImage)}"
              alt="${esc(selected.name)}业务场景"
              width="960"
              height="600"
              loading="lazy"
              data-ag-scene-img
            />
            <div class="ag-story__states" data-ag-states>
              ${selected.sceneStates
                .map(
                  (s) => `
                <span class="ag-story__chip"><i></i>${esc(s)}</span>`
                )
                .join('')}
            </div>
          </div>
          <div class="ag-story__aside" data-ag-aside>
            <p class="ag-story__kicker" data-ag-short>${esc(selected.shortName)}</p>
            <h3 data-ag-name>${esc(selected.name)}</h3>
            <p class="ag-story__value" data-ag-value>${esc(selected.value)}</p>
            <ol class="ag-story__loop">
              <li>
                <span class="ag-story__num">01</span>
                <div>
                  <strong>触发条件</strong>
                  <p data-ag-trigger>${esc(selected.trigger)}</p>
                </div>
              </li>
              <li>
                <span class="ag-story__num">02</span>
                <div>
                  <strong>自动执行</strong>
                  <p data-ag-action>${esc(selected.action)}</p>
                </div>
              </li>
              <li>
                <span class="ag-story__num">03</span>
                <div>
                  <strong>结果回读</strong>
                  <p data-ag-result>${esc(selected.result)}</p>
                </div>
              </li>
            </ol>
            <a class="ag-btn ag-btn--solid" data-ag-detail href="${esc(selected.detailUrl)}">查看${esc(selected.shortName)}智能体详情</a>
          </div>
        </div>

        <ol class="ag-story__flow" data-ag-flow aria-label="任务闭环">
          ${selected.workflow
            .map(
              (step, i) => `
            <li class="${i === 0 ? 'is-active' : ''}" data-ag-flow-step="${i}">
              <span class="ag-story__flow-icon" aria-hidden="true">
                <span class="material-symbols-outlined">${esc(stepIcon(i))}</span>
              </span>
              <strong>${esc(step)}</strong>
            </li>`
            )
            .join('')}
        </ol>
      </div>
    </section>`
}

export function syncAgentTaskStory(root, selectedId) {
  const selected = AGENTS_OVERVIEW.find((a) => a.id === selectedId) || AGENTS_OVERVIEW[0]
  const stage = root.querySelector('[data-ag-story-stage]')
  const aside = root.querySelector('[data-ag-aside]')
  const scene = root.querySelector('[data-ag-scene]')

  ;[stage, aside, scene].forEach((el) => {
    if (!el) return
    el.classList.remove('is-animating')
    void el.offsetWidth
    el.classList.add('is-animating')
  })

  root.querySelectorAll('.ag-story__tab').forEach((btn) => {
    const on = btn.dataset.agSelect === selected.id
    btn.classList.toggle('is-selected', on)
    btn.setAttribute('aria-selected', on ? 'true' : 'false')
  })

  const img = root.querySelector('[data-ag-scene-img]')
  if (img) {
    img.src = selected.sceneImage
    img.alt = `${selected.name}业务场景`
  }

  const states = root.querySelector('[data-ag-states]')
  if (states) {
    states.innerHTML = selected.sceneStates
      .map((s) => `<span class="ag-story__chip"><i></i>${esc(s)}</span>`)
      .join('')
  }

  const setText = (sel, value) => {
    const el = root.querySelector(sel)
    if (el) el.textContent = value
  }
  setText('[data-ag-short]', selected.shortName)
  setText('[data-ag-name]', selected.name)
  setText('[data-ag-value]', selected.value)
  setText('[data-ag-trigger]', selected.trigger)
  setText('[data-ag-action]', selected.action)
  setText('[data-ag-result]', selected.result)

  const detail = root.querySelector('[data-ag-detail]')
  if (detail) {
    detail.setAttribute('href', selected.detailUrl)
    detail.textContent = `查看${selected.shortName}智能体详情`
  }

  const flow = root.querySelector('[data-ag-flow]')
  if (flow) {
    flow.innerHTML = selected.workflow
      .map(
        (step, i) => `
      <li class="${i === 0 ? 'is-active' : ''}" data-ag-flow-step="${i}">
        <span class="ag-story__flow-icon" aria-hidden="true">
          <span class="material-symbols-outlined">${esc(stepIcon(i))}</span>
        </span>
        <strong>${esc(step)}</strong>
      </li>`
      )
      .join('')
  }
}
