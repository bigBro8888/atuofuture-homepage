/** 粘贴文本 → 卖点 { title, desc }[] */

function cleanText(value = '') {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .trim()
}

function normalizeTitle(title = '') {
  return String(title || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase()
}

function parseLinePairs(text) {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (!lines.length) return []

  const rows = []

  // 交替：标题行 + 说明行（说明行通常更长，或不含短标题特征）
  const looksLikeTitle = (line) =>
    line.length <= 12 && !/[：:，。；;！!？?\t]/.test(line)

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.includes('\t')) {
      const parts = line.split('\t')
      rows.push({ title: cleanText(parts[0]), desc: cleanText(parts.slice(1).join('\t')) })
      i += 1
      continue
    }
    if (/[：:]/.test(line)) {
      const matched = line.match(/^(.{1,24}?)[：:]\s*(.*)$/)
      if (matched) {
        rows.push({ title: cleanText(matched[1]), desc: cleanText(matched[2]) })
        i += 1
        continue
      }
    }
    if (/\s{2,}/.test(line)) {
      const matched = line.match(/^(\S.*?)\s{2,}(.*)$/)
      if (matched) {
        rows.push({ title: cleanText(matched[1]), desc: cleanText(matched[2]) })
        i += 1
        continue
      }
    }
    // 短行标题 + 下一行说明（下一行若自带「：」/制表符则视为独立条目）
    if (looksLikeTitle(line) && lines[i + 1]) {
      const next = lines[i + 1]
      const nextIsOwnPair = /[：:]/.test(next) || next.includes('\t') || /\s{2,}/.test(next)
      if (!nextIsOwnPair && !looksLikeTitle(next)) {
        rows.push({ title: cleanText(line), desc: cleanText(next) })
        i += 2
        continue
      }
    }
    // 单行「短标题 + 空格 + 说明」
    const spaced = line.match(/^([\u4e00-\u9fffA-Za-z0-9]{2,12})\s+(.+)$/)
    if (spaced) {
      rows.push({ title: cleanText(spaced[1]), desc: cleanText(spaced[2]) })
      i += 1
      continue
    }
    rows.push({ title: cleanText(line), desc: '' })
    i += 1
  }

  return rows.filter((row) => row.title || row.desc)
}

/** 同名卖点只保留最后一次 */
export function dedupeBulletItemsLatestWins(items = []) {
  const map = new Map()
  for (const item of items) {
    const title = cleanText(item?.title)
    const desc = cleanText(item?.desc)
    if (!title && !desc) continue
    const key = normalizeTitle(title) || `__empty_${map.size}`
    const prev = map.get(key)
    map.set(key, {
      title,
      desc,
      icon: String(item?.icon || prev?.icon || '').trim(),
    })
  }
  return [...map.values()]
}

/**
 * 合并卖点：标题一致时以最新说明为准，其余保留，新项追加。
 */
export function mergeProductBulletItems(existing = [], incoming = [], { maxRows = 4 } = {}) {
  const latestIncoming = dedupeBulletItemsLatestWins(incoming)
  const incomingByKey = new Map()
  for (const item of latestIncoming) {
    const key = normalizeTitle(item.title)
    if (!key) continue
    incomingByKey.set(key, item)
  }

  const used = new Set()
  const merged = []

  for (const item of existing) {
    const title = cleanText(item?.title)
    const desc = cleanText(item?.desc)
    if (!title && !desc) continue
    const key = normalizeTitle(title)
    if (key && incomingByKey.has(key)) {
      const next = incomingByKey.get(key)
      merged.push({
        title: next.title,
        desc: next.desc,
        icon: String(item?.icon || next.icon || '').trim(),
      })
      used.add(key)
      continue
    }
    merged.push({
      title,
      desc,
      icon: String(item?.icon || '').trim(),
    })
  }

  for (const item of latestIncoming) {
    const key = normalizeTitle(item.title)
    if (!key || used.has(key)) continue
    merged.push({
      title: item.title,
      desc: item.desc,
      icon: String(item.icon || '').trim(),
    })
    used.add(key)
  }

  return merged.slice(0, maxRows)
}

/**
 * @param {string} raw
 * @param {{ maxRows?: number }} [options]
 * @returns {{ title: string, desc: string }[]}
 */
export function parseProductBulletsText(raw, { maxRows = 4 } = {}) {
  const source = String(raw || '').replace(/\u00a0/g, ' ').trim()
  if (!source) return []
  return dedupeBulletItemsLatestWins(parseLinePairs(source)).slice(0, maxRows)
}
