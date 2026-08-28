import { applyHardwareSimpleCms, applyProductLibraryCms, getLine, getProductBySlug, getProductLibraryItem } from '../data/hardware-catalog.js'
import { buildProductStory } from '../data/hardware-product-details.js'
import { renderProductStory } from '../lib/product-story-render.js'
import { loadProductLibraryContent, loadSimplePageContent } from '../services/site-settings-api.js'

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function resolveSlug() {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('id') || params.get('slug')
  if (fromQuery) return fromQuery
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts[0] === 'hardware' && parts.length >= 3 && parts[1] !== 'product') {
    return parts[parts.length - 1]
  }
  return null
}

function renderNotFound(raw) {
  return `
    <section class="hpi">
      <div class="hwc-shell hpi-pad">
        <p class="hpi-crumb"><a href="/hardware/">智能硬件</a> / 未找到</p>
        <h1>未找到该产品</h1>
        <p>参数「${esc(raw || '')}」无效或未发布。</p>
        <p><a class="hwc-btn hwc-btn--cyan" href="/hardware/">返回产品中心</a></p>
      </div>
    </section>`
}

function productFromLibrary(item) {
  if (!item) return null
  const catalog = getProductBySlug(item.slug) || getProductBySlug(item.id)
  return {
    id: item.id,
    slug: item.slug,
    name: item.name || catalog?.name || '未命名产品',
    productLine: item.hardwareLine || catalog?.productLine || 'space',
    coverImage: item.coverImage || catalog?.coverImage || '',
    shortDescription: item.shortDescription || catalog?.shortDescription || '',
  }
}

export async function initHardwareProductPage() {
  const root = document.getElementById('hardware-product-root')
  if (!root) return
  const slug = resolveSlug()
  const [simple, library] = await Promise.all([loadSimplePageContent('hardware'), loadProductLibraryContent()])
  applyHardwareSimpleCms(simple)
  applyProductLibraryCms(library)

  const libItem = getProductLibraryItem(slug)
  const product = libItem ? productFromLibrary(libItem) : getProductBySlug(slug)
  if (!product) {
    document.title = '产品未找到 | 安托未来'
    root.innerHTML = renderNotFound(slug)
    return
  }
  document.title = `${product.name} | 智能硬件产品介绍 | 安托未来`
  const story = libItem?.story || buildProductStory(product)
  const line = getLine(product.productLine)
  root.innerHTML = renderProductStory(product, story, line, { editable: false })
}
