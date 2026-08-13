/** 开放接口能力：中枢枢纽 + 内外层系统节点 */

export function renderOpenInterfaceVisual() {
  return `
<svg class="ha-viz ha-viz--open" viewBox="0 0 560 460" role="img" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="ha-open-core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7ec8ff"/>
      <stop offset="55%" stop-color="#1a5fb4"/>
      <stop offset="100%" stop-color="#0a1f4d"/>
    </radialGradient>
    <linearGradient id="ha-open-line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(110,190,255,0)"/>
      <stop offset="50%" stop-color="rgba(110,190,255,0.85)"/>
      <stop offset="100%" stop-color="rgba(110,190,255,0)"/>
    </linearGradient>
  </defs>

  <g class="ha-viz__ambient">
    <circle cx="300" cy="230" r="196" fill="none" stroke="rgba(90,160,255,0.12)" stroke-width="1"/>
    <circle cx="300" cy="230" r="148" fill="none" stroke="rgba(90,160,255,0.16)" stroke-width="1"/>
    <circle cx="300" cy="230" r="98" fill="none" stroke="rgba(90,160,255,0.22)" stroke-width="1.2"/>
  </g>

  <g class="ha-viz__flows">
    <path class="ha-viz__flow" d="M110 120 C180 150 210 190 250 210" fill="none" stroke="url(#ha-open-line)" stroke-width="1.6"/>
    <path class="ha-viz__flow ha-viz__flow--delay" d="M490 100 C420 140 380 180 340 210" fill="none" stroke="url(#ha-open-line)" stroke-width="1.6"/>
    <path class="ha-viz__flow ha-viz__flow--delay2" d="M90 320 C170 300 220 270 255 245" fill="none" stroke="url(#ha-open-line)" stroke-width="1.6"/>
    <path class="ha-viz__flow" d="M500 340 C420 310 370 280 340 250" fill="none" stroke="url(#ha-open-line)" stroke-width="1.6"/>
    <path class="ha-viz__flow ha-viz__flow--delay" d="M300 40 C300 100 300 150 300 175" fill="none" stroke="url(#ha-open-line)" stroke-width="1.6"/>
    <path class="ha-viz__flow ha-viz__flow--delay2" d="M300 420 C300 360 300 310 300 285" fill="none" stroke="url(#ha-open-line)" stroke-width="1.6"/>
  </g>

  <g class="ha-viz__outer">
    <g class="ha-viz__node ha-viz__node--outer" transform="translate(78 98)">
      <rect width="92" height="36" rx="4" fill="rgba(8,20,48,0.72)" stroke="rgba(140,190,255,0.35)"/>
      <text x="46" y="22" text-anchor="middle" fill="rgba(220,235,255,0.92)" font-size="11">客户现有系统</text>
    </g>
    <g class="ha-viz__node ha-viz__node--outer" transform="translate(392 78)">
      <rect width="100" height="36" rx="4" fill="rgba(8,20,48,0.72)" stroke="rgba(140,190,255,0.35)"/>
      <text x="50" y="22" text-anchor="middle" fill="rgba(220,235,255,0.92)" font-size="11">第三方业务平台</text>
    </g>
    <g class="ha-viz__node ha-viz__node--outer" transform="translate(392 348)">
      <rect width="100" height="36" rx="4" fill="rgba(8,20,48,0.72)" stroke="rgba(140,190,255,0.35)"/>
      <text x="50" y="22" text-anchor="middle" fill="rgba(220,235,255,0.92)" font-size="11">未来新增应用</text>
    </g>
    <g class="ha-viz__node ha-viz__node--outer" transform="translate(64 328)">
      <rect width="92" height="36" rx="4" fill="rgba(8,20,48,0.72)" stroke="rgba(140,190,255,0.35)"/>
      <text x="46" y="22" text-anchor="middle" fill="rgba(220,235,255,0.92)" font-size="11">外部数据服务</text>
    </g>
  </g>

  <g class="ha-viz__mid">
    <g class="ha-viz__node" transform="translate(168 66)"><circle r="5" fill="#5eb0ff"/><text x="12" y="4" fill="rgba(210,230,255,0.9)" font-size="11">门禁</text></g>
    <g class="ha-viz__node" transform="translate(250 52)"><circle r="5" fill="#5eb0ff"/><text x="12" y="4" fill="rgba(210,230,255,0.9)" font-size="11">会议</text></g>
    <g class="ha-viz__node" transform="translate(340 66)"><circle r="5" fill="#5eb0ff"/><text x="12" y="4" fill="rgba(210,230,255,0.9)" font-size="11">能耗</text></g>
    <g class="ha-viz__node" transform="translate(420 180)"><circle r="5" fill="#5eb0ff"/><text x="12" y="4" fill="rgba(210,230,255,0.9)" font-size="11">照明</text></g>
    <g class="ha-viz__node" transform="translate(400 270)"><circle r="5" fill="#5eb0ff"/><text x="12" y="4" fill="rgba(210,230,255,0.9)" font-size="11">空调</text></g>
    <g class="ha-viz__node" transform="translate(180 360)"><circle r="5" fill="#5eb0ff"/><text x="12" y="4" fill="rgba(210,230,255,0.9)" font-size="11">安防</text></g>
    <g class="ha-viz__node" transform="translate(300 378)"><circle r="5" fill="#5eb0ff"/><text x="12" y="4" fill="rgba(210,230,255,0.9)" font-size="11">停车</text></g>
    <g class="ha-viz__node" transform="translate(120 210)"><circle r="5" fill="#5eb0ff"/><text x="12" y="4" fill="rgba(210,230,255,0.9)" font-size="11">通行</text></g>
  </g>

  <g class="ha-viz__core" transform="translate(300 230)">
    <circle class="ha-viz__core-ring" r="52" fill="none" stroke="rgba(232,110,40,0.55)" stroke-width="2.5"/>
    <circle class="ha-viz__core-glow" r="40" fill="url(#ha-open-core)" opacity="0.95"/>
    <polygon points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="1.4"/>
    <text y="4" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">安托平台</text>
  </g>
</svg>`
}
