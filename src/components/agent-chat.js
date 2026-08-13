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

  const state = loadState()
  const root = document.createElement('div')
  root.id = 'agent-chat-root'
  root.innerHTML = renderShell(state)
  document.body.appendChild(root)

  // 3D 模型与 model-viewer 延后加载，避免阻塞首屏
  scheduleRobotModelUpgrade(root)

  const els = {
    root,
    panel: root.querySelector('[data-chat-panel]'),
    backdrop: root.querySelector('[data-chat-backdrop]'),
    body: root.querySelector('[data-chat-body]'),
    toggle: root.querySelector('[data-chat-toggle]'),
    edgeCollapse: root.querySelector('[data-chat-edge-collapse]'),
    agentOptions: root.querySelector('[data-agent-options]'),
    messages: root.querySelector('[data-chat-messages]'),
    form: root.querySelector('[data-chat-form]'),
    input: root.querySelector('[data-chat-input]'),
    send: root.querySelector('[data-chat-send]'),
    quick: root.querySelector('[data-quick-prompts]'),
    status: root.querySelector('[data-chat-status]'),
  }

  let currentAgentId = state.agentId
  let messages = state.messages
  /** 默认收起，避免遮挡首屏控件；用户手动打开后再记忆 */
  let isOpen = false
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
          <h4 class="agent-chat-welcome__title">${escapeHtml(agent.name)}</h4>
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

  function pageQuickPrompts() {
    const page = document.body.dataset.page
    if (page === 'hardware') {
      return ['无线网关和多功能网关有什么区别？', '中控屏如何接入自有设备？', '如何实现端边云本地闭环？']
    }
    if (page === 'solutions') {
      return ['智慧楼宇适合解决哪些问题？', '园区如何实现多楼栋统一运营？', '如何预约行业方案演示？']
    }
    if (page === 'agents' || page === 'agent-detail') {
      return ['空间智能体和普通AI助手有什么区别？', '会议运维智能体能完成哪些任务？', '访客接待流程如何闭环？']
    }
    if (page === 'about') {
      return ['安托未来的核心定位是什么？', '你们的交付流程包含哪些环节？', '如何联系方案顾问？']
    }
    return ['安托未来主要服务哪些行业？', '空间智能系统是如何构成的？', '如何预约方案演示？']
  }

  function renderQuickPrompts() {
    const prompts = pageQuickPrompts()
    els.quick.innerHTML = prompts
      .map(
        (p) =>
          `<button type="button" class="agent-chat-quick-btn" data-quick="${escapeAttr(p)}">
            <span class="material-symbols-outlined">auto_awesome</span>
            <strong>${escapeHtml(p)}</strong>
            <small>点击快速开始咨询</small>
          </button>`
      )
      .join('')

    els.quick.querySelectorAll('[data-quick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        els.input.value = btn.dataset.quick
        els.input.focus()
      })
    })
  }

  function renderAgentOptions() {
    els.agentOptions.innerHTML = AGENTS.map((agent) => {
      const isActive = agent.id === currentAgentId
      return `
        <button
          type="button"
          class="agent-chat-agent-tab${isActive ? ' is-active' : ''}"
          data-agent-option="${escapeAttr(agent.id)}"
        >
          <span class="material-symbols-outlined">${agent.icon}</span>
          <span>${escapeHtml(agent.name)}</span>
        </button>`
    }).join('')

    els.agentOptions.querySelectorAll('[data-agent-option]').forEach((btn) => {
      btn.addEventListener('click', () => switchAgent(btn.dataset.agentOption))
    })
  }

  function switchAgent(agentId) {
    if (agentId === currentAgentId) return
    currentAgentId = agentId
    messages = []
    renderAgentOptions()
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
        content: '暂时无法连接服务，请稍后重试，或通过页面「预约方案演示」联系我们。',
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
  renderAgentOptions()
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

  root.querySelectorAll('[data-chat-clear]').forEach((btn) => {
    btn.addEventListener('click', () => {
      messages = []
      renderMessages()
      persist()
    })
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
      <span class="agent-chat-model-shell agent-chat-model--toggle" data-robot-mount>
        ${robotAvatarImg('agent-chat-robot-img--toggle')}
      </span>
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
        <div class="agent-chat-sidebar">
          <div class="agent-chat-sidebar__brand">
            <span class="agent-chat-sidebar__mark">${robot}</span>
            <strong>Atuo AI</strong>
          </div>
          <label class="agent-chat-sidebar__search" aria-label="搜索">
            <span class="material-symbols-outlined">search</span>
            <input type="search" placeholder="搜索" />
          </label>
          <div class="agent-chat-sidebar__primary">
            <button type="button" class="agent-chat-new-btn" data-chat-clear>
              <span class="material-symbols-outlined">add_box</span>
              <span>新建对话</span>
            </button>
            <button type="button" class="agent-chat-side-link">
              <span class="material-symbols-outlined">schedule</span>
              <span>自动任务</span>
            </button>
            <button type="button" class="agent-chat-side-link">
              <span class="material-symbols-outlined">construction</span>
              <span>技能广场</span>
            </button>
          </div>
          <div class="agent-chat-sidebar__label">空间智能体</div>
          <nav class="agent-chat-agent-tabs" data-agent-options aria-label="选择智能体"></nav>
          <div class="agent-chat-sidebar__label">本地知识库</div>
          <div class="agent-chat-sidebar__knowledge">
            <button type="button" class="agent-chat-side-link">
              <span class="material-symbols-outlined">apps</span>
              <span>应用</span>
            </button>
            <button type="button" class="agent-chat-side-link">
              <span class="material-symbols-outlined">description</span>
              <span>文档</span>
              <span class="material-symbols-outlined agent-chat-side-link__chev">expand_more</span>
            </button>
            <button type="button" class="agent-chat-side-link">
              <span class="material-symbols-outlined">image</span>
              <span>图库</span>
              <span class="material-symbols-outlined agent-chat-side-link__chev">expand_more</span>
            </button>
          </div>
          <div class="agent-chat-sidebar__foot">
            <span class="material-symbols-outlined">verified</span>
            <span>空间智能服务助手</span>
          </div>
        </div>

        <main class="agent-chat-main">
          <header class="agent-chat-header">
            <div class="agent-chat-header__info">
              <span class="agent-chat-header__robot">${robot}</span>
              <div>
                <h3 class="agent-chat-header__title">智能体对话</h3>
                <p class="agent-chat-header__sub" data-chat-status>描述您的空间需求，我来协助梳理方案</p>
              </div>
            </div>
          </header>

          <div class="agent-chat-messages" data-chat-messages role="log" aria-live="polite"></div>

          <div class="agent-chat-compose">
            <form class="agent-chat-input-area" data-chat-form>
              <textarea
                class="agent-chat-input"
                data-chat-input
                rows="3"
                placeholder="请输入任务、交给我来帮你完成"
                maxlength="2000"
              ></textarea>
              <div class="agent-chat-input-actions">
                <button type="button" class="agent-chat-clear-btn" data-chat-clear>
                  <span class="material-symbols-outlined">delete_sweep</span>
                  清空
                </button>
                <button type="submit" class="agent-chat-send-btn" data-chat-send aria-label="发送">
                  <span class="material-symbols-outlined">arrow_upward</span>
                </button>
              </div>
            </form>
            <div class="agent-chat-quick-head">推荐</div>
            <div class="agent-chat-quick" data-quick-prompts></div>
          </div>
        </main>
      </div>
    </aside>
  `
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

function ensureModelViewer() {
  if (!supportsWebGL()) return Promise.resolve(false)
  if (customElements.get('model-viewer')) return Promise.resolve(true)
  const existing = document.querySelector('script[data-model-viewer]')
  if (existing) {
    return customElements.whenDefined('model-viewer').then(() => true).catch(() => false)
  }
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = MODEL_VIEWER_SRC
    script.dataset.modelViewer = 'true'
    script.onload = () => customElements.whenDefined('model-viewer').then(() => resolve(true)).catch(() => resolve(false))
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

function renderRobotModelMarkup() {
  return `
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
  `
}

function scheduleRobotModelUpgrade(root) {
  const mount = root.querySelector('[data-robot-mount]')
  if (!mount) return

  const upgrade = async () => {
    if (mount.dataset.upgraded === 'true') return
    mount.dataset.upgraded = 'true'
    const ok = await ensureModelViewer()
    if (!ok || !customElements.get('model-viewer')) return
    try {
      mount.innerHTML = renderRobotModelMarkup()
      const viewer = mount.querySelector('model-viewer')
      viewer?.addEventListener('error', () => {
        mount.innerHTML = `<span class="agent-chat-model-fallback" aria-hidden="true">${cuteRobotIcon('cute-robot-icon cute-robot-icon--avatar')}</span>`
      }, { once: true })
    } catch {
      mount.innerHTML = `<span class="agent-chat-model-fallback" aria-hidden="true">${cuteRobotIcon('cute-robot-icon cute-robot-icon--avatar')}</span>`
    }
  }

  const start = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => { void upgrade() }, { timeout: 2500 })
    } else {
      window.setTimeout(() => { void upgrade() }, 1200)
    }
  }

  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
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
