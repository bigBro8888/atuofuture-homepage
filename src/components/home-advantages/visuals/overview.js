/** 公司定位总览：空间智能中枢关系图 */

export function renderCompanyOverviewVisual() {
  return `
<svg class="ha-viz ha-viz--overview" viewBox="0 0 560 460" role="img" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="ha-ov-core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#b8e0ff"/>
      <stop offset="50%" stop-color="#2f74d8"/>
      <stop offset="100%" stop-color="#0a1f4d"/>
    </radialGradient>
  </defs>

  <g class="ha-viz__scenes" fill="rgba(200,220,245,0.78)" font-size="10">
    <text x="36" y="28">园区</text><text x="86" y="28">楼宇</text><text x="136" y="28">学校</text>
    <text x="186" y="28">酒店</text><text x="236" y="28">公寓</text><text x="286" y="28">商业</text>
  </g>

  <g class="ha-viz__outer">
    <g transform="translate(28 70)"><rect width="88" height="34" rx="4" fill="rgba(8,20,48,0.75)" stroke="rgba(140,190,255,0.35)"/><text x="44" y="21" text-anchor="middle" fill="#dce8ff" font-size="10">客户现有系统</text></g>
    <g transform="translate(28 160)"><rect width="88" height="34" rx="4" fill="rgba(8,20,48,0.75)" stroke="rgba(140,190,255,0.35)"/><text x="44" y="21" text-anchor="middle" fill="#dce8ff" font-size="10">第三方平台</text></g>
    <g transform="translate(28 250)"><rect width="88" height="34" rx="4" fill="rgba(8,20,48,0.75)" stroke="rgba(140,190,255,0.35)"/><text x="44" y="21" text-anchor="middle" fill="#dce8ff" font-size="10">API / MCP</text></g>
    <g transform="translate(28 340)"><rect width="88" height="34" rx="4" fill="rgba(8,20,48,0.75)" stroke="rgba(140,190,255,0.35)"/><text x="44" y="21" text-anchor="middle" fill="#dce8ff" font-size="10">第三方协议</text></g>
  </g>

  <g class="ha-viz__agents">
    <g class="ha-viz__node" transform="translate(250 70)"><circle r="16" fill="rgba(20,50,110,0.9)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="9">空间</text></g>
    <g class="ha-viz__node" transform="translate(320 95)"><circle r="16" fill="rgba(20,50,110,0.9)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="9">能源</text></g>
    <g class="ha-viz__node" transform="translate(370 150)"><circle r="16" fill="rgba(20,50,110,0.9)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="9">会议</text></g>
    <g class="ha-viz__node" transform="translate(370 230)"><circle r="16" fill="rgba(20,50,110,0.9)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="9">展厅</text></g>
    <g class="ha-viz__node" transform="translate(320 290)"><circle r="16" fill="rgba(20,50,110,0.9)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="9">访客</text></g>
    <g class="ha-viz__node" transform="translate(250 320)"><circle r="16" fill="rgba(20,50,110,0.9)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="9">OPC</text></g>
    <g class="ha-viz__node" transform="translate(180 290)"><circle r="16" fill="rgba(20,50,110,0.9)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="9">酒店</text></g>
    <g class="ha-viz__node" transform="translate(160 150)"><circle r="16" fill="rgba(20,50,110,0.9)" stroke="#6eb6ff"/><text y="4" text-anchor="middle" fill="#fff" font-size="9">资产</text></g>
  </g>

  <g class="ha-viz__loop" transform="translate(260 200)">
    <circle r="58" fill="none" stroke="rgba(110,180,255,0.28)" stroke-width="1.2"/>
    <text y="-42" text-anchor="middle" fill="rgba(190,220,255,0.85)" font-size="9">感知</text>
    <text x="42" y="-8" text-anchor="middle" fill="rgba(190,220,255,0.85)" font-size="9">理解</text>
    <text x="36" y="28" text-anchor="middle" fill="rgba(190,220,255,0.85)" font-size="9">决策</text>
    <text x="-36" y="28" text-anchor="middle" fill="rgba(190,220,255,0.85)" font-size="9">执行</text>
    <text x="-42" y="-8" text-anchor="middle" fill="rgba(190,220,255,0.85)" font-size="9">反馈</text>
  </g>

  <g class="ha-viz__core" transform="translate(260 200)">
    <circle class="ha-viz__breath" r="34" fill="url(#ha-ov-core)"/>
    <circle class="ha-viz__breath-ring" r="42" fill="none" stroke="rgba(232,110,40,0.5)" stroke-width="2"/>
    <text y="-2" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">安托中枢</text>
    <text y="14" text-anchor="middle" fill="rgba(220,235,255,0.8)" font-size="9">空间智能</text>
  </g>

  <g class="ha-viz__hw" transform="translate(140 380)">
    <rect width="300" height="42" rx="6" fill="rgba(10,28,60,0.85)" stroke="rgba(120,180,255,0.35)"/>
    <text x="150" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">智能硬件层</text>
    <text x="150" y="34" text-anchor="middle" fill="rgba(190,215,240,0.8)" font-size="10">网关 · 中控屏 · 传感器 · 控制器 · 门锁 · 桌牌</text>
  </g>

  <g class="ha-viz__token" transform="translate(430 380)">
    <rect width="100" height="42" rx="6" fill="rgba(8,24,52,0.7)" stroke="rgba(232,110,40,0.35)"/>
    <text x="50" y="18" text-anchor="middle" fill="rgba(255,220,190,0.9)" font-size="10">AI Token</text>
    <text x="50" y="34" text-anchor="middle" fill="rgba(200,210,230,0.7)" font-size="9">模型能力支撑</text>
  </g>
</svg>`
}
