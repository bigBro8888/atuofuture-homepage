/** 软硬件一体：感知→控制→交互→边缘→平台 五层架构 */

export function renderHardwareArchitectureVisual() {
  return `
<svg class="ha-viz ha-viz--hw" viewBox="0 0 560 460" role="img" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="ha-hw-up" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="rgba(110,190,255,0)"/>
      <stop offset="50%" stop-color="rgba(110,190,255,0.85)"/>
      <stop offset="100%" stop-color="rgba(110,190,255,0)"/>
    </linearGradient>
  </defs>

  <g class="ha-viz__layers">
    <!-- Platform -->
    <g class="ha-viz__hw-row" transform="translate(70 36)">
      <rect width="420" height="56" rx="6" fill="rgba(16,40,90,0.88)" stroke="rgba(232,110,40,0.45)"/>
      <text x="16" y="24" fill="#fff" font-size="13" font-weight="700">平台层</text>
      <text x="16" y="42" fill="rgba(200,220,245,0.8)" font-size="11">AI智能体平台 · 设备管理 · 数字孪生 · 业务系统</text>
    </g>
    <!-- Edge -->
    <g class="ha-viz__hw-row" transform="translate(70 108)">
      <rect width="420" height="56" rx="6" fill="rgba(14,42,82,0.82)" stroke="rgba(120,190,255,0.35)"/>
      <text x="16" y="24" fill="#fff" font-size="13" font-weight="700">边缘层</text>
      <text x="16" y="42" fill="rgba(200,220,245,0.8)" font-size="11">IoT网关 · 协议转换 · 边缘计算主机</text>
      <g class="ha-viz__device" transform="translate(330 8)">
        <rect width="70" height="40" rx="4" fill="rgba(8,24,56,0.9)" stroke="#6eb6ff"/>
        <text x="35" y="24" text-anchor="middle" fill="#fff" font-size="10">边缘网关</text>
      </g>
    </g>
    <!-- Interact -->
    <g class="ha-viz__hw-row" transform="translate(70 180)">
      <rect width="420" height="56" rx="6" fill="rgba(12,44,76,0.8)" stroke="rgba(120,190,255,0.32)"/>
      <text x="16" y="24" fill="#fff" font-size="13" font-weight="700">交互层</text>
      <text x="16" y="42" fill="rgba(200,220,245,0.8)" font-size="11">墙体中控屏 · 会议屏 · 电子桌牌 · 门外屏 · 移动端</text>
    </g>
    <!-- Control -->
    <g class="ha-viz__hw-row" transform="translate(70 252)">
      <rect width="420" height="56" rx="6" fill="rgba(10,46,70,0.78)" stroke="rgba(120,190,255,0.3)"/>
      <text x="16" y="24" fill="#fff" font-size="13" font-weight="700">控制层</text>
      <text x="16" y="42" fill="rgba(200,220,245,0.8)" font-size="11">灯光 / 窗帘控制器 · 继电器 · 环境控制模块</text>
    </g>
    <!-- Sense -->
    <g class="ha-viz__hw-row" transform="translate(70 324)">
      <rect width="420" height="56" rx="6" fill="rgba(8,48,66,0.76)" stroke="rgba(120,190,255,0.28)"/>
      <text x="16" y="24" fill="#fff" font-size="13" font-weight="700">感知层</text>
      <text x="16" y="42" fill="rgba(200,220,245,0.8)" font-size="11">温湿度 · 人体存在 · 门磁 · 空气质量 · 能耗传感</text>
    </g>
  </g>

  <!-- data flow spine -->
  <g class="ha-viz__spine">
    <rect x="276" y="92" width="4" height="232" rx="2" fill="url(#ha-hw-up)"/>
    <circle class="ha-viz__pulse-dot" cx="278" cy="340" r="4" fill="#7ec8ff"/>
    <circle class="ha-viz__pulse-dot ha-viz__pulse-dot--down" cx="278" cy="70" r="4" fill="#e86e28"/>
  </g>

  <g class="ha-viz__legend" transform="translate(70 400)">
    <text fill="rgba(200,220,245,0.78)" font-size="11">硬件感知 → 边缘处理 → 平台决策 → 设备执行</text>
  </g>

  <!-- representative devices -->
  <g class="ha-viz__devices-row" transform="translate(70 418)" fill="rgba(180,210,245,0.7)" font-size="10">
    <text>代表硬件：中控屏 · IoT网关 · 无线控制模块 · 环境传感器 · 电子桌牌</text>
  </g>
</svg>`
}
