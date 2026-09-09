import { loadProductLibraryContent, loadSimplePageContent } from '../services/site-settings-api.js'
import {
  applyHardwareSimpleCms,
  applyProductLibraryCms,
  getProductBySlug,
  getProductDetailHref,
  listingActions,
  presentHardwareProduct,
  resolveHardwareSpaceMatrixRows,
} from '../data/hardware-catalog.js'
import { DEFAULT_HARDWARE_SECTIONS, renderHardwarePage } from '../lib/hardware-page-render.js'

function viewProduct(product) {
  return presentHardwareProduct(product) || product
}

function productHref(product) {
  return getProductDetailHref(product)
}

const RETAIL_META = [
  { id: 'eink-price-tag', use: '低功耗电子纸价签，服务门店货架信息的远程更新与统一管理。' },
  { id: 'lcd-price-tag', use: '彩色 LCD 价签，适合高对比、促销与品牌专柜展示场景。' },
  { id: 'cold-tag', use: '面向冷链与低温货架的标签方案，适配生鲜与仓储环境。' },
  { id: 'aap', use: '资产盘点与标签管理硬件能力，支撑盘点、巡检与台账闭环。' },
]

const CONSUMER_META = [
  {
    id: 'eink-phone-case',
    scene: '/images/hardware/scene-eink-phone-case.jpg',
    use: '把可刷新的电子纸带入个人设备，让通知、图文与个性表达常显可见。',
  },
  {
    id: 'eink-frame',
    scene: '/images/hardware/scene-eink-frame.jpg',
    use: '以低功耗电子纸呈现画作与影像，进入家居与办公的数字陈列场景。',
  },
]

export function buildHardwarePageModel(simpleContent = {}) {
  const items = Array.isArray(simpleContent.items) ? simpleContent.items : []
  const resolveItemIndex = (idOrSlug) => items.findIndex((item) => item.id === idOrSlug || item.slug === idOrSlug)
  const resolveProduct = (id) => viewProduct(getProductBySlug(id))

  const flagship = viewProduct(getProductBySlug('control-screen'))
  const matrixRows = resolveHardwareSpaceMatrixRows()

  const retailCards = RETAIL_META.map((item) => {
    const p = resolveProduct(item.id)
    if (!p) return null
    const idx = resolveItemIndex(item.id)
    const summary = idx >= 0 ? items[idx].summary : ''
    return { ...p, use: summary || item.use }
  }).filter(Boolean)

  const consumerCards = CONSUMER_META.map((item) => {
    const p = resolveProduct(item.id)
    if (!p) return null
    const idx = resolveItemIndex(item.id)
    const summary = idx >= 0 ? items[idx].summary : ''
    return { ...p, scene: item.scene, use: summary || item.use }
  }).filter(Boolean)

  return {
    hero: {
      title: simpleContent.title || '',
      subtitle: simpleContent.subtitle || '',
      bannerUrl: simpleContent.bannerUrl || '',
      ctaLabel: simpleContent.ctaLabel || '',
    },
    sections: {
      ...DEFAULT_HARDWARE_SECTIONS,
      ...(simpleContent.sections || {}),
    },
    flagship: flagship
      ? {
          ...flagship,
          detailCtaLabel: listingActions(flagship).detailLabel,
          solutionHref: listingActions(flagship).solutionHref,
          solutionLabel: listingActions(flagship).solutionLabel,
          tag: listingActions(flagship).tag || flagship.tag,
        }
      : null,
    matrixRows,
    retailCards,
    consumerCards,
    resolveProduct,
    resolveItemIndex,
    productHref,
    listingDetailLabel: (p) => listingActions(p).detailLabel,
  }
}

export async function initHardwareStore() {
  const root = document.getElementById('hardware-root')
  if (!root) return
  const [simple, library] = await Promise.all([loadSimplePageContent('hardware'), loadProductLibraryContent()])
  applyHardwareSimpleCms(simple)
  applyProductLibraryCms(library)

  const model = buildHardwarePageModel(simple || {})
  root.innerHTML = renderHardwarePage(model, { editable: false })

  const hash = window.location.hash.replace(/^#/, '')
  const legacyMap = {
    'hwc-browser': 'hwc-space',
    terminal: 'hwc-space',
    sensor: 'hwc-space',
    gateway: 'hwc-space',
    av: 'hwc-space',
  }
  const targetId = legacyMap[hash] || (hash.startsWith('hwc-') ? hash : '')
  if (targetId) {
    window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }
}
