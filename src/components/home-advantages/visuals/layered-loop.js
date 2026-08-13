/** 分层自治：平台 / 区域 / 终端三层闭环 + 纵向总线 */

export function renderLayeredLoopVisual() {
  return `
<svg class="ha-viz ha-viz--loop" viewBox="0 0 560 460" role="img" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="ha-loop-bus" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(232,110,40,0.75)"/>
      <stop offset="50%" stop-color="rgba(110,180,255,0.85)"/>
      <stop offset="100%" stop-color="rgba(110,180,255,0.45)"/>
    </linearGradient>
  </defs>

  <!-- vertical bus -->
  <rect class="ha-viz__bus" x="268" y="56" width="6" height="340" rx="3" fill="url(#ha-loop-bus)"/>
  <text x="286" y="74" fill="rgba(232,180,140,0.9)" font-size="10">开放数据总线</text>

  <!-- Platform layer -->
  <g class="ha-viz__layer ha-viz__layer--platform" transform="translate(70 50)">
    <rect width="400" height="100" rx="8" fill="rgba(12,28,64,0.78)" stroke="rgba(140,190,255,0.4)"/>
    <text x="20" y="28" fill="#fff" font-size="14" font-weight="700">平台层</text>
    <text x="20" y="50" fill="rgba(190,215,245,0.8)" font-size="11">AI智能体平台 · 数据管理 · 全局策略 · 统一运营</text>
    <g class="ha-viz__mini-loop" transform="translate(250 30)">
      <circle r="28" fill="none" stroke="rgba(110,180,255,0.45)" stroke-width="1.4" stroke-dasharray="10 8"/>
      <text y="4" text-anchor="middle" fill="rgba(210,230,255,0.85)" font-size="9">感知→判断</text>
      <text y="16" text-anchor="middle" fill="rgba(210,230,255,0.75)" font-size="9">执行→反馈</text>
    </g>
  </g>

  <!-- Region layer -->
  <g class="ha-viz__layer ha-viz__layer--region" transform="translate(70 175)">
    <rect width="400" height="100" rx="8" fill="rgba(10,36,72,0.78)" stroke="rgba(120,200,220,0.4)"/>
    <text x="20" y="28" fill="#fff" font-size="14" font-weight="700">区域层</text>
    <text x="20" y="50" fill="rgba(190,215,245,0.8)" font-size="11">楼栋 · 楼层 · 会议区 · 酒店区域 · 边缘网关</text>
    <g class="ha-viz__mini-loop" transform="translate(250 30)">
      <circle r="28" fill="none" stroke="rgba(100,210,200,0.5)" stroke-width="1.4" stroke-dasharray="10 8"/>
      <text y="4" text-anchor="middle" fill="rgba(210,240,235,0.85)" font-size="9">本地闭环</text>
      <text y="16" text-anchor="middle" fill="rgba(210,240,235,0.75)" font-size="9">边缘自治</text>
    </g>
  </g>

  <!-- Terminal layer -->
  <g class="ha-viz__layer ha-viz__layer--terminal" transform="translate(70 300)">
    <rect width="400" height="100" rx="8" fill="rgba(8,40,70,0.78)" stroke="rgba(100,190,255,0.35)"/>
    <text x="20" y="28" fill="#fff" font-size="14" font-weight="700">终端层</text>
    <text x="20" y="50" fill="rgba(190,215,245,0.8)" font-size="11">中控屏 · 控制器 · 传感器 · 灯光 · 空调 · 窗帘</text>
    <g class="ha-viz__mini-loop" transform="translate(250 30)">
      <circle r="28" fill="none" stroke="rgba(110,180,255,0.45)" stroke-width="1.4" stroke-dasharray="10 8"/>
      <text y="4" text-anchor="middle" fill="rgba(210,230,255,0.85)" font-size="9">现场感知</text>
      <text y="16" text-anchor="middle" fill="rgba(210,230,255,0.75)" font-size="9">即时执行</text>
    </g>
  </g>

  <g class="ha-viz__note" transform="translate(70 416)">
    <rect width="16" height="8" rx="2" fill="rgba(232,110,40,0.7)"/>
    <text x="24" y="8" fill="rgba(210,220,240,0.75)" font-size="10">上层短暂中断时，区域层与终端层仍可独立运行并在恢复后同步</text>
  </g>
</svg>`
}
