/** 首屏背景蒙层透明度（0–100）：0 为默认蒙层，100 为蒙层完全透明 */
export function heroMaskTransparency(value) {
  if (value === '' || value == null) return 0
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(100, Math.max(0, Math.round(number)))
}

export function heroMaskStyle(value) {
  const percent = heroMaskTransparency(value)
  return percent <= 0 ? '' : `opacity:${(100 - percent) / 100};`
}
