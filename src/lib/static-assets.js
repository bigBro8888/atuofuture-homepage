/** 字体、内置图片等静态大文件由 OSS 提供，同步脚本见 scripts/sync-static-to-oss.mjs */
export const STATIC_ASSET_BASE = String(
  import.meta.env.VITE_STATIC_ASSET_BASE || 'https://atuofuture.oss-cn-shanghai.aliyuncs.com/website/static',
).replace(/\/+$/, '')

export function staticAssetUrl(path) {
  return `${STATIC_ASSET_BASE}/${String(path || '').replace(/^\/+/, '')}`
}
