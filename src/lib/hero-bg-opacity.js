/** 首屏背景图透明度（0–100），缺省 100 即保持原图层效果 */
export function heroBgOpacity(value) {
  if (value === '' || value == null) return 100
  const number = Number(value)
  if (!Number.isFinite(number)) return 100
  return Math.min(100, Math.max(0, Math.round(number)))
}

export function heroBgOpacityStyle(value) {
  const percent = heroBgOpacity(value)
  return percent >= 100 ? '' : `opacity:${percent / 100};`
}
