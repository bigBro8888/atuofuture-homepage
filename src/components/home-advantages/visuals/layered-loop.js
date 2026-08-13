/** 分层自治：平台 / 区域 / 边缘 / 终端四层闭环 + 纵向总线 */

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

  <rect class="ha-viz__bus" x="272" y="40" width="5" height="360" rx="2" fill="url(#ha-loop-bus)"/>
  <text x="286" y="56" fill="rgba(232,180,140,0.9)" font-size="10">开放数据总线</text>

  <g class="ha-viz__layer ha-viz__layer--platform" transform="translate(70 36)">
    <rect width="400" height="72" rx="8" fill="rgba(12,28,64,0.78)" stroke="rgba(140,190,255,0.4)"/>
    <text x="18" y="28" fill="#fff" font-size="15" font-weight="700">平台层</text>
    <text x="18" y="50" fill="rgba(190,215,245,0.85)" font-size="12">智能体编排 · 全局策略 · 统一运营</text>
    <text x="300" y="40" fill="rgba(180,210,240,0.75)" font-size="11">感知→判断→执行→反馈</text>
  </g>

  <g class="ha-viz__layer ha-viz__layer--region" transform="translate(70 128)">
    <rect width="400" height="72" rx="8" fill="rgba(10,36,72,0.78)" stroke="rgba(120,200,220,0.4)"/>
    <text x="18" y="28" fill="#fff" font-size="15" font-weight="700">区域层</text>
    <text x="18" y="50" fill="rgba(190,215,245,0.85)" font-size="12">楼栋 / 楼层 / 园区分区运营</text>
    <text x="300" y="40" fill="rgba(180,210,240,0.75)" font-size="11">本地业务闭环</text>
  </g>

  <g class="ha-viz__layer ha-viz__layer--edge" transform="translate(70 220)">
    <rect width="400" height="72" rx="8" fill="rgba(9,40,74,0.78)" stroke="rgba(110,190,255,0.38)"/>
    <text x="18" y="28" fill="#fff" font-size="15" font-weight="700">边缘层</text>
    <text x="18" y="50" fill="rgba(190,215,245,0.85)" font-size="12">边缘网关 · 协议转换 · 本地决策</text>
    <text x="300" y="40" fill="rgba(180,210,240,0.75)" font-size="11">断网可持续运行</text>
  </g>

  <g class="ha-viz__layer ha-viz__layer--terminal" transform="translate(70 312)">
    <rect width="400" height="72" rx="8" fill="rgba(8,40,70,0.78)" stroke="rgba(100,190,255,0.35)"/>
    <text x="18" y="28" fill="#fff" font-size="15" font-weight="700">终端层</text>
    <text x="18" y="50" fill="rgba(190,215,245,0.85)" font-size="12">中控屏 · 传感 · 控制器 · 门锁</text>
    <text x="300" y="40" fill="rgba(180,210,240,0.75)" font-size="11">现场即时执行</text>
  </g>

  <g class="ha-viz__note" transform="translate(70 408)">
    <rect width="14" height="8" rx="2" fill="rgba(232,110,40,0.7)"/>
    <text x="22" y="8" fill="rgba(210,220,240,0.8)" font-size="11">上层中断时，边缘与终端仍可自治；恢复后自动同步</text>
  </g>
</svg>`
}
