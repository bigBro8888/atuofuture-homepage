/** 粘贴文本 → 产品参数行 { label, value }[] */

const HEADER_PATTERNS = [
  /^参数名称\s*建议填写内容/,
  /^参数名\s*建议填写内容/,
  /^参数名称\s*参数值/,
  /^参数名\s*[：:]\s*参数值/,
  /^参数名\s+参数值/,
  /^参数项目\s*[：:\t ]*\s*参数内容/,
  /^参数项目\s+参数内容/,
]

const HEADER_LABELS = new Set([
  '参数名称',
  '参数名',
  '参数项目',
  '参数内容',
  '参数值',
  '建议填写内容',
])

/** 产品参数行数上限（粘贴表常超过 24） */
export const MAX_PRODUCT_SPEC_ROWS = 48

/**
 * 参数名词表（偏具体、偏长，避免「型号/蜂鸣器」等短词在参数值里误切）
 * 可按业务继续追加。
 */
export const SPEC_LABEL_VOCAB = [
  '适用运营商',
  '产品名称',
  '检测方式',
  '通信方式',
  '网络制式',
  '报警方式',
  '触发条件',
  '检测水位',
  '供电方式',
  '电池规格',
  '续航时间',
  '本地提示',
  '低电提醒',
  '工作温度',
  '工作湿度',
  '外壳材质',
  '防护等级',
  '产品尺寸',
  '产品重量',
  '安装方式',
  '平台协议',
  '存储温度',
  '工作电压',
  '输入电压',
  '输出电压',
  '接口类型',
  '通信协议',
  '无线协议',
  '安装环境',
  '包装清单',
  '认证标准',
  '执行标准',
  '额定功率',
  '额定电流',
  '待机功耗',
  '测量精度',
  '探测距离',
  '响应时间',
  '采样频率',
  '上报周期',
  '数据协议',
  '天线类型',
  '电池类型',
  '电池容量',
  '充电方式',
  '显示方式',
  '按键方式',
  '工作频段',
  '发射功率',
  '接收灵敏度',
  'SIM卡',
  '产品类型',
  '产品型号',
  '产品颜色',
  '雷达技术',
  '工作频率',
  '感应状态',
  '环境光检测',
  '灵敏度设置',
  '延时设置',
  '移动探测半径',
  '微动探测半径',
  '呼吸探测半径',
  '建议安装高度',
  '天花板开孔',
  '面环直径',
  '筒体直径',
  '主体高度',
  '最大整体高度',
]

function cleanValue(value = '') {
  return String(value)
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .trim()
}

function stripHeader(text) {
  let s = String(text || '').replace(/^\uFEFF/, '').trim()
  for (const pattern of HEADER_PATTERNS) {
    if (pattern.test(s)) {
      s = s.replace(pattern, '').trim()
      break
    }
  }
  return s
}

/** 标记文本中落在 【…】 内的字符，避免参数值备注被当成下一参数名 */
function buildBracketMask(text) {
  const mask = new Array(text.length).fill(false)
  let depth = 0
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '【') {
      depth += 1
      mask[i] = true
      continue
    }
    if (ch === '】') {
      mask[i] = true
      depth = Math.max(0, depth - 1)
      continue
    }
    if (depth > 0) mask[i] = true
  }
  return mask
}

function parseLinePairs(text) {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return null

  const rows = []
  for (const line of lines) {
    const compact = line.replace(/\s+/g, '')
    if (HEADER_PATTERNS.some((pattern) => pattern.test(compact))) continue
    let label = ''
    let value = ''
    if (line.includes('\t')) {
      const parts = line.split('\t')
      label = parts[0] || ''
      value = parts.slice(1).join('\t')
    } else if (/[：:]/.test(line)) {
      const matched = line.match(/^(.{1,24}?)[：:]\s*(.*)$/)
      if (matched) {
        label = matched[1]
        value = matched[2]
      }
    } else if (/\s{2,}/.test(line)) {
      const matched = line.match(/^(\S.*?)\s{2,}(.*)$/)
      if (matched) {
        label = matched[1]
        value = matched[2]
      }
    } else {
      const matched = line.match(/^([\u4e00-\u9fffA-Za-z0-9]{2,12})\s+(.+)$/)
      if (matched) {
        label = matched[1]
        value = matched[2]
      }
    }
    label = cleanValue(label)
    value = cleanValue(value)
    if (!label && !value) continue
    if (HEADER_LABELS.has(label) || HEADER_LABELS.has(value)) continue
    rows.push({ label, value })
  }
  return rows.length >= 2 ? rows : null
}

function findLabelHits(text, vocab) {
  const sorted = [...vocab].filter(Boolean).sort((a, b) => b.length - a.length || a.localeCompare(b, 'zh'))
  const inBracket = buildBracketMask(text)
  const hits = []
  let i = 0
  while (i < text.length) {
    if (inBracket[i]) {
      i += 1
      continue
    }
    let found = null
    for (const label of sorted) {
      if (i + label.length > text.length) continue
      if (!text.startsWith(label, i)) continue
      // 标签整段都不能落在【】内
      let blocked = false
      for (let k = i; k < i + label.length; k += 1) {
        if (inBracket[k]) {
          blocked = true
          break
        }
      }
      if (blocked) continue
      found = label
      break
    }
    if (found) {
      hits.push({ label: found, index: i, end: i + found.length })
      i += found.length
      continue
    }
    i += 1
  }
  return hits
}

function collapseDuplicateHits(hits) {
  // 同一参数名连续出现时，后一次多半是值里的词（如「外置SIM卡」），并回前一段
  const out = []
  for (const hit of hits) {
    const prev = out[out.length - 1]
    if (prev && prev.label === hit.label) continue
    out.push(hit)
  }
  return out
}

function parseConcatenatedPairs(text, vocab = SPEC_LABEL_VOCAB) {
  const hits = collapseDuplicateHits(findLabelHits(text, vocab))
  if (hits.length < 1) return []
  return hits.map((hit, index) => {
    const next = hits[index + 1]
    const value = cleanValue(text.slice(hit.end, next ? next.index : text.length))
    return { label: hit.label, value }
  })
}

function normalizeSpecLabel(label = '') {
  return String(label || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase()
}

/** 同名参数只保留最后一次（最新为准） */
export function dedupeSpecRowsLatestWins(rows = []) {
  const map = new Map()
  for (const row of rows) {
    const label = cleanValue(row?.label)
    const value = cleanValue(row?.value)
    if (!label && !value) continue
    const key = normalizeSpecLabel(label) || `__empty_${map.size}`
    map.set(key, { label, value })
  }
  return [...map.values()]
}

/**
 * 合并已有参数与本次解析结果。
 * - 默认：同名以 incoming 为准，其余保留，新参数追加
 * - preferIncoming / 批量粘贴（≥3 行）：以新表顺序为主，丢弃旧表空占位行，仅保留旧表仍有内容且不在新表中的行
 * @param {{ label?: string, value?: string }[]} existing
 * @param {{ label?: string, value?: string }[]} incoming
 * @param {{ maxRows?: number, preferIncoming?: boolean }} [options]
 */
export function mergeProductSpecRows(
  existing = [],
  incoming = [],
  { maxRows = MAX_PRODUCT_SPEC_ROWS, preferIncoming = false } = {},
) {
  const latestIncoming = dedupeSpecRowsLatestWins(incoming)
  const useIncomingFirst = preferIncoming || latestIncoming.length >= 3

  // 批量粘贴视为整表替换：新表顺序为准，旧空占位 / 过时字段不再保留
  if (useIncomingFirst) {
    return latestIncoming
      .filter((row) => normalizeSpecLabel(row.label))
      .slice(0, maxRows)
  }

  const incomingByKey = new Map()
  for (const row of latestIncoming) {
    const key = normalizeSpecLabel(row.label)
    if (!key) continue
    incomingByKey.set(key, row)
  }

  const used = new Set()
  const merged = []

  for (const row of existing) {
    const label = cleanValue(row?.label)
    const value = cleanValue(row?.value)
    if (!label && !value) continue
    const key = normalizeSpecLabel(label)
    if (key && incomingByKey.has(key)) {
      merged.push(incomingByKey.get(key))
      used.add(key)
      continue
    }
    merged.push({ label, value })
  }

  for (const row of latestIncoming) {
    const key = normalizeSpecLabel(row.label)
    if (!key || used.has(key)) continue
    merged.push(row)
    used.add(key)
  }

  return merged.slice(0, maxRows)
}

/**
 * @param {string} raw
 * @param {{ vocab?: string[], maxRows?: number }} [options]
 * @returns {{ label: string, value: string }[]}
 */
export function parseProductSpecsText(raw, { vocab = SPEC_LABEL_VOCAB, maxRows = MAX_PRODUCT_SPEC_ROWS } = {}) {
  const source = String(raw || '').replace(/\u00a0/g, ' ').trim()
  if (!source) return []

  const lineRows = parseLinePairs(source)
  const rows = lineRows || parseConcatenatedPairs(stripHeader(source.replace(/\s*\n\s*/g, '')), vocab)
  return dedupeSpecRowsLatestWins(rows).slice(0, maxRows)
}
