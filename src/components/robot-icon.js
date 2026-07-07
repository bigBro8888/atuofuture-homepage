/** 可爱小机器人 SVG 图标，用于对话入口与面板标题 */
export function cuteRobotIcon(className = 'cute-robot-icon') {
  return `
    <svg class="${className}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="18" width="28" height="22" rx="8" fill="#E8F0FF"/>
      <rect x="10" y="18" width="28" height="22" rx="8" stroke="#0052D1" stroke-width="2"/>
      <circle cx="18" cy="28" r="3" fill="#0052D1"/>
      <circle cx="30" cy="28" r="3" fill="#0052D1"/>
      <circle cx="19" cy="27" r="1" fill="#fff"/>
      <circle cx="31" cy="27" r="1" fill="#fff"/>
      <path d="M20 33.5C21.8 35.2 26.2 35.2 28 33.5" stroke="#0052D1" stroke-width="2" stroke-linecap="round"/>
      <rect x="19" y="8" width="10" height="12" rx="5" fill="#1769FF"/>
      <circle cx="24" cy="6" r="3" fill="#38A6FD"/>
      <rect x="4" y="24" width="6" height="10" rx="3" fill="#B3C5FF"/>
      <rect x="38" y="24" width="6" height="10" rx="3" fill="#B3C5FF"/>
      <circle cx="14" cy="32" r="2" fill="#FFB4C4" opacity="0.7"/>
      <circle cx="34" cy="32" r="2" fill="#FFB4C4" opacity="0.7"/>
    </svg>
  `
}

/** 收起箭头，用于弹窗左侧折叠把手 */
export function collapseArrowIcon(className = 'collapse-arrow-icon') {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 6L16 12L10 18" stroke="#0052D1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}
