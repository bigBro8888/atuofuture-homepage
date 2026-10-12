import { applyHardwareSimpleCms, applyProductLibraryCms, getLine, getProductBySlug, getProductLibraryItem } from '../data/hardware-catalog.js'
import { buildProductStory } from '../data/hardware-product-details.js'
import { bindProductStoryTabs, renderProductStory } from '../lib/product-story-render.js'
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
    gallery: catalog?.gallery || [],
    capabilities: catalog?.capabilities || [],
    interfaces: catalog?.interfaces || [],
    scenarios: catalog?.scenarios || [],
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
  const fallback = buildProductStory(product)
  const libStory = libItem?.story || {}
  const story = {
    ...fallback,
    ...libStory,
    showcase:
      libStory.showcase?.image || libStory.showcase?.points?.some((p) => p?.title)
        ? { ...fallback.showcase, ...libStory.showcase, points: libStory.showcase.points?.length ? libStory.showcase.points : fallback.showcase.points }
        : fallback.showcase,
    capabilities:
      libStory.capabilities?.items?.some((item) => item?.title)
        ? { ...fallback.capabilities, ...libStory.capabilities }
        : fallback.capabilities,
    scenarios: libStory.scenarios?.items?.length ? libStory.scenarios : fallback.scenarios,
    value: {
      ...fallback.value,
      ...(libStory.value || {}),
      title: libStory.value?.title || fallback.value?.title,
      subtitle: libStory.value?.subtitle || fallback.value?.subtitle,
      diagramImage: libStory.value?.diagramImage || libStory.value?.deviceImage || fallback.value?.diagramImage,
    },
    specs: libStory.specs?.rows?.length ? libStory.specs : fallback.specs,
    album: libStory.album?.items?.length ? libStory.album : fallback.album,
    videos: libStory.videos || fallback.videos,
    detailImages: libStory.detailImages || fallback.detailImages,
  }
  const line = getLine(product.productLine)
  root.innerHTML = renderProductStory(product, story, line, { editable: false })
  bindProductStoryTabs(root)
}
