/** 知识库分类与应用广场分类对齐 */

export const HELP_CATEGORY_ALIASES = {
  AI画报: '信息发布',
  电子相册: '信息发布',
  会议室预约系统: '会议管理',
  会议与空间: '智能底座',
  项目服务: '智能底座',
}

export function helpCategoriesFromCatalog(catalog) {
  const source = Array.isArray(catalog?.categories) ? catalog.categories : []
  const mapped = source
    .map((item) => ({
      icon: String(item?.icon || 'folder').trim() || 'folder',
      name: String(item?.label || item?.name || '').trim(),
    }))
    .filter((item) => item.name && item.name !== '全部文档')
  return [{ icon: 'description', name: '全部文档' }, ...mapped]
}

export function remapHelpDocCategory(category, categories = []) {
  const raw = String(category || '').trim() || '全部文档'
  const aliased = HELP_CATEGORY_ALIASES[raw] || raw
  const valid = new Set((categories || []).map((item) => item.name))
  if (valid.has(aliased)) return aliased
  if (valid.has(raw)) return raw
  return '全部文档'
}

export function alignHelpWithCatalog(help, catalog) {
  if (!help || typeof help !== 'object') return help
  const categories = helpCategoriesFromCatalog(catalog)
  const docs = (Array.isArray(help.docs) ? help.docs : []).map((item) => ({
    ...item,
    category: remapHelpDocCategory(item.category, categories),
  }))
  const featuredDocs = docs
    .filter((item) => item.featured)
    .slice(0, 4)
    .map((item) => ({
      title: item.title,
      date: item.date,
      badge: item.badge,
      tone: item.tone,
      art: item.art,
      fileUrl: item.fileUrl,
      id: item.id,
    }))
  return {
    ...help,
    categories,
    docs,
    featuredDocs: featuredDocs.length ? featuredDocs : (help.featuredDocs || []),
  }
}
