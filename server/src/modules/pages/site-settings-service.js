import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'

export const defaultSiteSettings = {
  brandZh: '安托未来',
  brandEn: 'Atuo Future',
  logoLightUrl: '/assets/artink-logo-light.png',
  logoDarkUrl: '/assets/artink-logo.png',
  downloadLabel: '下载 App',
  demoLabel: '预约方案演示',
  showAppDownload: true,
  tokenSiteUrl: 'https://token.atuofuture.com',
  showTokenEntry: true,
  email: 'service@atuofuture.com',
  emailSecondary: 'sherri@atuofuture.com',
  phone: '',
  phoneDisplay: '',
  address: '杭州市余杭区阿里巴巴数字生态创新园 1 号楼 5 层',
  footerNote: '© 2026 atuofuture',
}

function cleanText(value, fallback, max = 200) {
  const text = String(value ?? fallback ?? '').trim()
  return text.slice(0, max)
}

function cleanUrl(value, fallback = '') {
  const url = String(value ?? fallback ?? '').trim()
  if (!url) return fallback
  if (url.startsWith('/') && !url.startsWith('//')) return url.slice(0, 1000)
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('链接必须是站内路径或 http(s)')
  return parsed.toString().slice(0, 1000)
}

export function validateSiteSettings(value = {}) {
  return {
    brandZh: cleanText(value.brandZh, defaultSiteSettings.brandZh, 40),
    brandEn: cleanText(value.brandEn, defaultSiteSettings.brandEn, 40),
    logoLightUrl: cleanUrl(value.logoLightUrl, defaultSiteSettings.logoLightUrl),
    logoDarkUrl: cleanUrl(value.logoDarkUrl, defaultSiteSettings.logoDarkUrl),
    downloadLabel: cleanText(value.downloadLabel, defaultSiteSettings.downloadLabel, 20),
    demoLabel: cleanText(value.demoLabel, defaultSiteSettings.demoLabel, 20),
    showAppDownload: value.showAppDownload !== false,
    tokenSiteUrl: cleanUrl(value.tokenSiteUrl, defaultSiteSettings.tokenSiteUrl),
    showTokenEntry: value.showTokenEntry !== false,
    email: cleanText(value.email, defaultSiteSettings.email, 80),
    emailSecondary: cleanText(value.emailSecondary, defaultSiteSettings.emailSecondary, 80),
    phone: cleanText(value.phone, defaultSiteSettings.phone, 40),
    phoneDisplay: cleanText(value.phoneDisplay, defaultSiteSettings.phoneDisplay, 40),
    address: cleanText(value.address, defaultSiteSettings.address, 120),
    footerNote: cleanText(value.footerNote, defaultSiteSettings.footerNote, 80),
  }
}

export function getSiteSettingsPage() {
  let page = db().pageConfigs.find((item) => item.pageKey === 'site' && item.locale === 'zh-CN')
  if (!page) {
    const now = new Date().toISOString()
    page = {
      id: randomUUID(),
      pageKey: 'site',
      locale: 'zh-CN',
      status: 'published',
      draftContent: structuredClone(defaultSiteSettings),
      publishedContent: structuredClone(defaultSiteSettings),
      updatedAt: now,
      publishedAt: now,
    }
    db().pageConfigs.push(page)
  }
  return page
}
