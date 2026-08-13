/** AI 智能体协同中枢：核心 → 能力 → 智能体 → 场景 */

export function renderAiAgentVisual() {
  return `
<svg class="ha-viz ha-viz--ai" viewBox="0 0 560 460" role="img" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="ha-ai-core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#b8e0ff"/>
      <stop offset="45%" stop-color="#3d8dff"/>
      <stop offset="100%" stop-color="#0b1c4a"/>
    </radialGradient>
  </defs>

  <g class="ha-viz__chain" transform="translate(36 28)">
    <text fill="rgba(190,210,240,0.75)" font-size="11">用户需求 → AI理解 → 智能体协同 → 调用系统 → 执行结果</text>
  </g>

  <g class="ha-viz__scene">
    <g class="ha-viz__node ha-viz__node--scene" transform="translate(420 70)">
      <rect width="110" height="52" rx="4" fill="rgba(10,24,56,0.78)" stroke="rgba(120,180,255,0.3)"/>
      <text x="55" y="22" text-anchor="middle" fill="#d8e8ff" font-size="12" font-weight="600">智慧园区</text>
      <text x="55" y="40" text-anchor="middle" fill="rgba(180,205,235,0.75)" font-size="10">跨楼宇联动</text>
    </g>
    <g class="ha-viz__node ha-viz__node--scene" transform="translate(420 150)">
      <rect width="110" height="52" rx="4" fill="rgba(10,24,56,0.78)" stroke="rgba(120,180,255,0.3)"/>
      <text x="55" y="22" text-anchor="middle" fill="#d8e8ff" font-size="12" font-weight="600">总部办公</text>
      <text x="55" y="40" text-anchor="middle" fill="rgba(180,205,235,0.75)" font-size="10">空间运营</text>
    </g>
    <g class="ha-viz__node ha-viz__node--scene" transform="translate(420 230)">
      <rect width="110" height="52" rx="4" fill="rgba(10,24,56,0.78)" stroke="rgba(120,180,255,0.3)"/>
      <text x="55" y="22" text-anchor="middle" fill="#d8e8ff" font-size="12" font-weight="600">酒店场景</text>
      <text x="55" y="40" text-anchor="middle" fill="rgba(180,205,235,0.75)" font-size="10">客房联动</text>
    </g>
    <g class="ha-viz__node ha-viz__node--scene" transform="translate(420 310)">
      <rect width="110" height="52" rx="4" fill="rgba(10,24,56,0.78)" stroke="rgba(120,180,255,0.3)"/>
      <text x="55" y="22" text-anchor="middle" fill="#d8e8ff" font-size="12" font-weight="600">会议室</text>
      <text x="55" y="40" text-anchor="middle" fill="rgba(180,205,235,0.75)" font-size="10">会务编排</text>
    </g>
  </g>

  <g class="ha-viz__agents">
    <g class="ha-viz__node ha-viz__node--agent" transform="translate(250 78)"><circle r="18" fill="rgba(20,50,110,0.85)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="10">接待</text></g>
    <g class="ha-viz__node ha-viz__node--agent" transform="translate(330 130)"><circle r="18" fill="rgba(20,50,110,0.85)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="10">会议</text></g>
    <g class="ha-viz__node ha-viz__node--agent" transform="translate(330 230)"><circle r="18" fill="rgba(20,50,110,0.85)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="10">运维</text></g>
    <g class="ha-viz__node ha-viz__node--agent" transform="translate(250 300)"><circle r="18" fill="rgba(20,50,110,0.85)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="10">能源</text></g>
    <g class="ha-viz__node ha-viz__node--agent" transform="translate(170 230)"><circle r="18" fill="rgba(20,50,110,0.85)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="10">空间</text></g>
  </g>

  <g class="ha-viz__capability" transform="translate(210 160)">
    <rect width="100" height="100" rx="8" fill="rgba(8,22,52,0.7)" stroke="rgba(110,180,255,0.4)"/>
    <text x="50" y="28" text-anchor="middle" fill="rgba(190,220,255,0.8)" font-size="10">感知</text>
    <text x="50" y="48" text-anchor="middle" fill="rgba(190,220,255,0.8)" font-size="10">理解</text>
    <text x="50" y="68" text-anchor="middle" fill="rgba(190,220,255,0.8)" font-size="10">决策</text>
    <text x="50" y="88" text-anchor="middle" fill="rgba(190,220,255,0.8)" font-size="10">执行</text>
  </g>

  <g class="ha-viz__core" transform="translate(260 210)">
    <circle class="ha-viz__breath" r="36" fill="url(#ha-ai-core)"/>
    <circle class="ha-viz__breath-ring" r="44" fill="none" stroke="rgba(232,110,40,0.45)" stroke-width="2"/>
    <path d="M-10 -6 h20 v4 h-8 v14 h-4 v-14 h-8z" fill="rgba(255,255,255,0.92)" transform="translate(0 -2) scale(0.9)"/>
    <text y="28" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">AI 核心</text>
  </g>

  <g class="ha-viz__demand">
    <circle class="ha-viz__pulse-dot" cx="90" cy="210" r="5" fill="#e86e28"/>
    <path class="ha-viz__flow" d="M100 210 H170" fill="none" stroke="rgba(232,110,40,0.65)" stroke-width="1.5" stroke-dasharray="4 6"/>
    <text x="90" y="236" text-anchor="middle" fill="rgba(220,200,180,0.85)" font-size="11">用户需求</text>
  </g>

  <g class="ha-viz__links" stroke="rgba(110,180,255,0.35)" stroke-width="1.2" fill="none">
    <path class="ha-viz__flow" d="M278 210 H420"/>
    <path class="ha-viz__flow ha-viz__flow--delay" d="M278 200 C340 120 380 100 420 96"/>
    <path class="ha-viz__flow ha-viz__flow--delay2" d="M278 220 C340 280 380 320 420 336"/>
  </g>
</svg>`
}
