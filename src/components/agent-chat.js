import { AGENTS, getAgentById } from '../data/agents.js'
import { sendMessage } from '../services/agent-chat-api.js'
import { cuteRobotIcon } from './robot-icon.js'

const STORAGE_KEY = 'atuo_agent_chat_state'
const ROBOT_MODEL_SRC = '/assets/ai-assistant-robot.glb'
const ROBOT_AVATAR_SRC = '/assets/robot-avatar.png'
const MODEL_VIEWER_SRC = 'https://unpkg.com/@google/model-viewer@4.1.0/dist/model-viewer.min.js'

function robotAvatarImg(extraClass = '') {
  return `<img class="agent-chat-robot-img ${extraClass}" src="${ROBOT_AVATAR_SRC}" alt="智能体头像" loading="lazy" />`
}

export function initAgentChat() {
  if (document.getElementById('agent-chat-root')) return

  ensureModelViewer()

  const state = loadState()
  const root = document.createElement('div')
  root.id = 'agent-chat-root'
  root.innerHTML = renderShell(state)
  document.body.appendChild(root)

  const els = {
    root,
    panel: root.querySelector('[data-chat-panel]'),
    backdrop: root.querySelector('[data-chat-backdrop]'),
    body: root.querySelector('[data-chat-body]'),
    toggle: root.querySelector('[data-chat-toggle]'),
    edgeCollapse: root.querySelector('[data-chat-edge-collapse]'),
    agentSelect: root.querySelector('[data-agent-select]'),
    messages: root.querySelector('[data-chat-messages]'),
    form: root.querySelector('[data-chat-form]'),
    input: root.querySelector('[data-chat-input]'),
    send: root.querySelector('[data-chat-send]'),
    quick: root.querySelector('[data-quick-prompts]'),
    status: root.querySelector('[data-chat-status]'),
  }

  let currentAgentId = state.agentId
  let messages = state.messages
  let isOpen = state.isOpen
  let isLoading = false

  function persist() {
    saveState({ agentId: currentAgentId, messages, isOpen })
  }

  function setOpen(open) {
    isOpen = open
    els.panel.classList.toggle('agent-chat-panel--open', open)
    els.panel.classList.toggle('agent-chat-panel--collapsed', !open)
    els.panel.setAttribute('aria-hidden', String(!open))
    els.backdrop?.classList.toggle('agent-chat-backdrop--open', open)
    els.toggle.classList.toggle('agent-chat-toggle--hidden', open)
    els.toggle.setAttribute('aria-expanded', String(open))
    if (els.edgeCollapse) {
      els.edgeCollapse.setAttribute('aria-label', open ? '关闭智能体对话' : '打开智能体对话')
      els.edgeCollapse.title = open ? '关闭' : ''
    }
    persist()
    if (open) {
      requestAnimationFrame(() => els.input?.focus())
    }
  }

  function collapse() {
    setOpen(false)
  }

  function renderMessages() {
    const agent = getAgentById(currentAgentId)
    if (messages.length === 0) {
      els.messages.innerHTML = `
        <div class="agent-chat-welcome">
          <div class="agent-chat-welcome__avatar">
            ${robotAvatarImg('agent-chat-robot-img--welcome')}
          </div>
          <p class="agent-chat-welcome__text">${agent.greeting}</p>
        </div>`
      return
    }

    els.messages.innerHTML = messages
      .map((m) => {
        const isUser = m.role === 'user'
        const icon = isUser
          ? 'person'
          : m.role === 'assistant'
            ? null
            : getAgentById(m.agentId || currentAgentId).icon
        const avatarContent = isUser
          ? `<span class="material-symbols-outlined">${icon}</span>`
          : m.role === 'assistant'
            ? cuteRobotIcon('cute-robot-icon cute-robot-icon--xs')
            : `<span class="material-symbols-outlined">${icon}</span>`
        return `
          <div class="agent-chat-msg agent-chat-msg--${m.role}">
            <div class="agent-chat-msg__avatar">
              ${avatarContent}
            </div>
            <div class="agent-chat-msg__bubble">${escapeHtml(m.content).replace(/\n/g, '<br>')}</div>
          </div>`
      })
      .join('')

    els.messages.scrollTop = els.messages.scrollHeight
  }

  function renderQuickPrompts() {
    const agent = getAgentById(currentAgentId)
    els.quick.innerHTML = agent.quickPrompts
      .map(
        (p) =>
          `<button type="button" class="agent-chat-quick-btn" data-quick="${escapeAttr(p)}">${escapeHtml(p)}</button>`
      )
      .join('')

    els.quick.querySelectorAll('[data-quick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        els.input.value = btn.dataset.quick
        els.input.focus()
      })
    })
  }

  function switchAgent(agentId) {
    if (agentId === currentAgentId) return
    currentAgentId = agentId
    messages = []
    els.agentSelect.value = agentId
    renderMessages()
    renderQuickPrompts()
    persist()
  }

  async function handleSend(text) {
    const content = text.trim()
    if (!content || isLoading) return

    isLoading = true
    els.send.disabled = true
    els.status.textContent = '智能体思考中…'

    const userMsg = { role: 'user', content, agentId: currentAgentId, ts: Date.now() }
    messages.push(userMsg)
    renderMessages()
    els.input.value = ''
    persist()

    try {
      const { reply } = await sendMessage({
        agentId: currentAgentId,
        message: content,
        history: messages.slice(0, -1),
      })
      messages.push({
        role: 'assistant',
        content: reply,
        agentId: currentAgentId,
        ts: Date.now(),
      })
    } catch {
      messages.push({
        role: 'assistant',
        content: '暂时无法连接服务，请稍后重试或直接联系我们：400-888-9999。',
        agentId: currentAgentId,
        ts: Date.now(),
      })
    } finally {
      isLoading = false
      els.send.disabled = false
      els.status.textContent = '描述您的空间需求，我来协助梳理方案'
      renderMessages()
      persist()
    }
  }

  // 初始化 UI
  els.agentSelect.innerHTML = AGENTS.map(
    (a) => `<option value="${a.id}">${a.name} · ${a.role}</option>`
  ).join('')
  els.agentSelect.value = currentAgentId
  renderMessages()
  renderQuickPrompts()
  setOpen(isOpen)

  els.toggle.addEventListener('click', () => setOpen(true))
  els.edgeCollapse.addEventListener('click', collapse)
  els.backdrop?.addEventListener('click', collapse)

  document.querySelectorAll('[data-agent-chat-open]').forEach((btn) => {
    btn.addEventListener('click', () => setOpen(true))
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) collapse()
  })

  els.agentSelect.addEventListener('change', (e) => switchAgent(e.target.value))

  els.form.addEventListener('submit', (e) => {
    e.preventDefault()
    handleSend(els.input.value)
  })

  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(els.input.value)
    }
  })

  root.querySelector('[data-chat-clear]')?.addEventListener('click', () => {
    messages = []
    renderMessages()
    persist()
  })
}

function renderShell(state) {
  const robot = robotAvatarImg('agent-chat-robot-img--header')

  return `
    <button
      type="button"
      class="agent-chat-toggle${state.isOpen ? ' agent-chat-toggle--hidden' : ''}"
      data-chat-toggle
      aria-label="打开智能体对话"
      aria-expanded="${state.isOpen}"
    >
      ${renderRobotModel('agent-chat-model--toggle')}
    </button>

    <div
      class="agent-chat-backdrop${state.isOpen ? ' agent-chat-backdrop--open' : ''}"
      data-chat-backdrop
      aria-hidden="true"
    ></div>

    <aside
      class="agent-chat-panel${state.isOpen ? ' agent-chat-panel--open' : ' agent-chat-panel--collapsed'}"
      data-chat-panel
      aria-label="智能体对话面板"
      aria-hidden="${!state.isOpen}"
    >
      <button
        type="button"
        class="agent-chat-edge-collapse"
        data-chat-edge-collapse
        aria-label="关闭智能体对话"
        title="关闭"
      >
        <span class="material-symbols-outlined">close</span>
      </button>

      <div class="agent-chat-panel__inner" data-chat-body>
        <header class="agent-chat-header">
          <div class="agent-chat-header__info">
            <span class="agent-chat-header__robot">${robot}</span>
            <div>
              <h3 class="agent-chat-header__title">智能体对话</h3>
              <p class="agent-chat-header__sub" data-chat-status>描述您的空间需求，我来协助梳理方案</p>
            </div>
          </div>
        </header>

        <div class="agent-chat-agent-picker">
          <label class="agent-chat-agent-picker__label" for="agent-select">选择智能体</label>
          <select id="agent-select" class="agent-chat-agent-picker__select" data-agent-select></select>
        </div>

        <div class="agent-chat-messages" data-chat-messages role="log" aria-live="polite"></div>

        <div class="agent-chat-quick" data-quick-prompts></div>

        <form class="agent-chat-input-area" data-chat-form>
          <textarea
            class="agent-chat-input"
            data-chat-input
            rows="2"
            placeholder="例如：我们有一栋 3 万平的总部大楼，想做智慧化改造…"
            maxlength="2000"
          ></textarea>
          <div class="agent-chat-input-actions">
            <button type="button" class="agent-chat-clear-btn" data-chat-clear>清空对话</button>
            <button type="submit" class="agent-chat-send-btn" data-chat-send>
              <span class="material-symbols-outlined">send</span>
              发送
            </button>
          </div>
        </form>
      </div>
    </aside>
  `
}

function ensureModelViewer() {
  if (customElements.get('model-viewer') || document.querySelector('script[data-model-viewer]')) return
  const script = document.createElement('script')
  script.type = 'module'
  script.src = MODEL_VIEWER_SRC
  script.dataset.modelViewer = 'true'
  document.head.appendChild(script)
}

function renderRobotModel(extraClass = '') {
  return `
    <span class="agent-chat-model-shell ${extraClass}">
      <model-viewer
        class="agent-chat-model"
        src="${ROBOT_MODEL_SRC}"
        autoplay
        animation-name="Idle_Loop"
        camera-orbit="0deg 78deg auto"
        camera-target="auto auto auto"
        shadow-intensity="0.45"
        exposure="1"
        interaction-prompt="none"
        disable-zoom
      ></model-viewer>
      <span class="agent-chat-model-fallback" aria-hidden="true">
        ${cuteRobotIcon('cute-robot-icon cute-robot-icon--avatar')}
      </span>
    </span>
  `
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { agentId: AGENTS[0].id, messages: [], isOpen: false }
    return { agentId: AGENTS[0].id, messages: [], isOpen: false, ...JSON.parse(raw) }
  } catch {
    return { agentId: AGENTS[0].id, messages: [], isOpen: false }
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;')
}
