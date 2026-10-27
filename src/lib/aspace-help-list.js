/** 知识库文档列表展示规则（页面配置 ↔ 前台共用） */

export const defaultDocsListRules = {
  mode: 'auto',
  sort: 'catalog',
  limit: 0,
  hideFeatured: true,
  manualIds: [],
}

export function normalizeDocsListRules(source = {}) {
  const mode = source?.mode === 'manual' ? 'manual' : 'auto'
  const sort = ['catalog', 'date-desc', 'date-asc'].includes(source?.sort) ? source.sort : 'catalog'
  const rawLimit = Number(source?.limit)
  const limit = Number.isFinite(rawLimit) ? Math.max(0, Math.min(80, Math.floor(rawLimit))) : 0
  const hideFeatured = source?.hideFeatured !== false
  const manualIds = Array.isArray(source?.manualIds)
    ? [...new Set(source.manualIds.map((id) => String(id || '').trim()).filter(Boolean))].slice(0, 40)
    : []
  return { mode, sort, limit, hideFeatured, manualIds }
}

function sortDocs(list, sort) {
  if (sort === 'date-desc') {
    return [...list].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  }
  if (sort === 'date-asc') {
    return [...list].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))
  }
  return list
}

/**
 * @param {Array} docs
 * @param {object} rules
 * @param {{ category?: string, keyword?: string }} [view]
 */
export function resolveHelpDocList(docs = [], rules = {}, view = {}) {
  const cfg = normalizeDocsListRules(rules)
  const category = view.category || '全部文档'
  const query = String(view.keyword || '').trim().toLowerCase()
  const isDefaultView = category === '全部文档' && !query
  const pool = Array.isArray(docs) ? docs : []

  let list
  if (cfg.mode === 'manual' && isDefaultView) {
    const byId = new Map(pool.map((item) => [item.id, item]))
    list = cfg.manualIds.map((id) => byId.get(id)).filter(Boolean)
  } else {
    list = pool.filter((item) => {
      if (isDefaultView && cfg.hideFeatured && item.featured) return false
      const categoryMatch = category === '全部文档' || item.category === category
      if (!categoryMatch) return false
      if (!query) return true
      return `${item.title || ''} ${item.category || ''} ${item.keywords || ''}`.toLowerCase().includes(query)
    })
    list = sortDocs(list, cfg.sort)
  }

  if (isDefaultView && cfg.limit > 0) list = list.slice(0, cfg.limit)
  return list
}

/** 最新更新：按文档发布/更新日期倒序自动生成 */
export function updatesFromHelpDocs(docs = [], limit = 5) {
  const max = Math.max(1, Math.min(20, Number(limit) || 5))
  return [...(Array.isArray(docs) ? docs : [])]
    .filter((item) => item?.title && item?.date)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .slice(0, max)
    .map((item) => ({
      date: String(item.date || '').trim(),
      title: String(item.title || '').trim(),
      desc: String(item.keywords || '').trim()
        || (item.featured ? '精选文档已更新' : `${item.category || '文档'} · 已发布`),
    }))
}

export function describeDocsListRules(rules = {}) {
  const cfg = normalizeDocsListRules(rules)
  if (cfg.mode === 'manual') {
    const n = cfg.manualIds.length
    return n ? `手动编排 · 已选 ${n} 篇` : '手动编排 · 尚未选择文档'
  }
  const sortLabel = {
    catalog: '内容管理顺序',
    'date-desc': '更新日期新→旧',
    'date-asc': '更新日期旧→新',
  }[cfg.sort] || '内容管理顺序'
  const limitLabel = cfg.limit > 0 ? `最多 ${cfg.limit} 篇` : '不限条数'
  const featuredLabel = cfg.hideFeatured ? '列表排除精选' : '精选也出现在列表'
  return `自动 · ${sortLabel} · ${limitLabel} · ${featuredLabel}`
}
