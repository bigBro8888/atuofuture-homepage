/** 全站外链与可配置入口（Token 独立站等） */
export const TOKEN_SITE_URL = 'https://token.atuofuture.com'

/** Token 入口是否展示（无有效外链时设为 false，避免空链接） */
export const SHOW_TOKEN_ENTRY = Boolean(TOKEN_SITE_URL)

/** App 下载入口：顶栏、页脚一律链到独立下载页，不要写死 APK / App Store */
export const SHOW_APP_DOWNLOAD = true
export const APP_DOWNLOAD_PATH = 'app-download/'
export const OFFICIAL_SITE_URL = 'https://www.atuofuture.com/'

export const SITE_CTA = {
  demoLabel: '预约方案演示',
  downloadLabel: '下载 App',
  contactAdvisorLabel: '联系方案顾问',
}
