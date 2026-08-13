/** 大规模无线接入：楼宇剖面 + 分层汇聚网络 */

export function renderWirelessAccessVisual() {
  return `
<svg class="ha-viz ha-viz--wireless" viewBox="0 0 560 460" role="img" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="ha-wl-bldg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(40,80,150,0.55)"/>
      <stop offset="100%" stop-color="rgba(10,24,56,0.9)"/>
    </linearGradient>
  </defs>

  <!-- distant towers -->
  <g class="ha-viz__distant" opacity="0.45">
    <rect x="430" y="120" width="56" height="260" rx="3" fill="rgba(30,60,120,0.5)" stroke="rgba(120,170,230,0.25)"/>
    <rect x="498" y="160" width="42" height="220" rx="3" fill="rgba(30,60,120,0.4)" stroke="rgba(120,170,230,0.2)"/>
  </g>

  <!-- main building -->
  <g class="ha-viz__building">
    <rect x="150" y="70" width="220" height="320" rx="4" fill="url(#ha-wl-bldg)" stroke="rgba(140,190,255,0.35)"/>
    <!-- floors -->
    <g stroke="rgba(120,170,230,0.22)" stroke-width="1">
      <line x1="150" y1="134" x2="370" y2="134"/>
      <line x1="150" y1="198" x2="370" y2="198"/>
      <line x1="150" y1="262" x2="370" y2="262"/>
      <line x1="150" y1="326" x2="370" y2="326"/>
    </g>

    <!-- floor aggregators -->
    <g class="ha-viz__agg">
      <rect class="ha-viz__node" x="248" y="112" width="24" height="14" rx="2" fill="#1f6fd6"/>
      <rect class="ha-viz__node" x="248" y="176" width="24" height="14" rx="2" fill="#1f6fd6"/>
      <rect class="ha-viz__node" x="248" y="240" width="24" height="14" rx="2" fill="#1f6fd6"/>
      <rect class="ha-viz__node" x="248" y="304" width="24" height="14" rx="2" fill="#1f6fd6"/>
    </g>

    <!-- device nodes per floor -->
    <g class="ha-viz__devices" fill="#7ec8ff">
      <circle class="ha-viz__node" cx="178" cy="100" r="3.5"/><circle class="ha-viz__node" cx="210" cy="108" r="3.5"/><circle class="ha-viz__node" cx="320" cy="102" r="3.5"/><circle class="ha-viz__node" cx="348" cy="114" r="3.5"/>
      <circle class="ha-viz__node" cx="184" cy="164" r="3.5"/><circle class="ha-viz__node" cx="220" cy="172" r="3.5"/><circle class="ha-viz__node" cx="310" cy="168" r="3.5"/><circle class="ha-viz__node" cx="342" cy="180" r="3.5"/>
      <circle class="ha-viz__node" cx="176" cy="228" r="3.5"/><circle class="ha-viz__node" cx="214" cy="236" r="3.5"/><circle class="ha-viz__node" cx="318" cy="230" r="3.5"/><circle class="ha-viz__node" cx="350" cy="242" r="3.5"/>
      <circle class="ha-viz__node" cx="188" cy="292" r="3.5"/><circle class="ha-viz__node" cx="224" cy="300" r="3.5"/><circle class="ha-viz__node" cx="308" cy="296" r="3.5"/><circle class="ha-viz__node" cx="344" cy="308" r="3.5"/>
    </g>

    <!-- links to floor agg -->
    <g class="ha-viz__flows" stroke="rgba(110,190,255,0.4)" stroke-width="1" fill="none">
      <path d="M178 100 H248"/><path d="M320 102 H272"/><path d="M184 164 H248"/><path d="M310 168 H272"/>
      <path d="M176 228 H248"/><path d="M318 230 H272"/><path d="M188 292 H248"/><path d="M308 296 H272"/>
    </g>
  </g>

  <!-- building hub -->
  <g class="ha-viz__hub" transform="translate(260 360)">
    <rect x="-36" y="-14" width="72" height="28" rx="4" fill="rgba(12,36,80,0.9)" stroke="#6eb6ff"/>
    <text y="4" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">楼栋汇聚</text>
  </g>

  <!-- platform -->
  <g class="ha-viz__platform" transform="translate(450 240)">
    <circle class="ha-viz__core-glow" r="34" fill="rgba(20,70,160,0.85)" stroke="rgba(232,110,40,0.5)" stroke-width="2"/>
    <text y="4" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">平台</text>
    <text y="18" text-anchor="middle" fill="rgba(200,220,255,0.75)" font-size="9">统一管理</text>
  </g>

  <path class="ha-viz__flow" d="M260 346 C260 300 360 260 416 248" fill="none" stroke="rgba(110,190,255,0.55)" stroke-width="1.6"/>
  <path class="ha-viz__flow ha-viz__flow--delay" d="M430 250 C410 200 400 160 430 140" fill="none" stroke="rgba(110,190,255,0.3)" stroke-width="1.2"/>
  <path class="ha-viz__flow ha-viz__flow--delay2" d="M450 274 C470 300 490 330 510 360" fill="none" stroke="rgba(110,190,255,0.3)" stroke-width="1.2"/>

  <g class="ha-viz__ripple" transform="translate(260 190)">
    <circle class="ha-viz__wave" r="28" fill="none" stroke="rgba(126,200,255,0.35)" stroke-width="1.2"/>
    <circle class="ha-viz__wave ha-viz__wave--delay" r="46" fill="none" stroke="rgba(126,200,255,0.22)" stroke-width="1"/>
  </g>

  <g fill="rgba(200,220,245,0.7)" font-size="10">
    <text x="158" y="58">多层空间 · 设备节点 → 楼层汇聚 → 楼栋 → 平台</text>
  </g>
</svg>`
}
