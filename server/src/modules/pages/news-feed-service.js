import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'
import { formatNewsBody } from '../../../../src/lib/format-news-body.js'
import { htmlFromPlainBody, plainTextFromHtml, sanitizeNewsHtml } from '../../../../src/lib/sanitize-news-html.js'

export const NEWS_FEED_PAGE_KEY = 'news-feed'
export const NEWS_CATEGORIES = ['公司动态', '产品更新', '方案实践']

const defaultItems = [
  {
    id: 'n1',
    category: '公司动态',
    date: '2026-08-01',
    title: '安托未来发布空间智能体 2.0：感知、决策与执行闭环',
    summary: '新版本强化现场感知与设备编排，支持弱网本地执行。本文说明升级重点与适用场景。',
    cover: '/assets/hero/capability-ai.jpg',
    author: '安托未来',
    tags: ['空间智能体', '产品发布', '边缘执行'],
    body: `一、这次升级解决什么问题？

空间智能体 2.0 把感知、决策与执行做成可编排闭环：现场传感器与中控数据进入同一上下文，策略可在云端生成、在边缘落地。弱网环境下仍可按本地规则继续执行，避免「断网即停」。

二、对交付意味着什么？

项目不必再把「问答」和「控设备」拆成两套系统。同一智能体可调用灯光、空调、门禁与工单，并按楼层/房间权限隔离。适合既要演示效果、又要长期运维的园区与楼宇项目。

三、适合谁 / 下一步

适合已有中控或传感器基础、希望尽快形成可演示闭环的客户。可先选一层楼试点，再复制到其它楼层。`,
  },
  {
    id: 'n2',
    category: '方案实践',
    date: '2026-07-12',
    title: '智慧楼宇试点：会议室预约与环境策略联动上线',
    summary: '预约状态自动联动灯光、空调与门禁策略，减少会前人工准备。本文复盘试点范围与效果。',
    cover: '/images/home-advantages/advantage-space-agent.webp',
    author: '安托未来',
    tags: ['智慧楼宇', '会议室', '策略联动'],
    body: `一、现场原来怎么做？

会议室准备依赖行政提前开门、开灯、调温，散会后再人工复位。预约系统与设备控制彼此独立，状态不同步时容易出现空开或忘记关闭。

二、试点做了哪些联动？

预约开始前按策略预热/预冷并开启照明；会议中按人数与时段微调；结束后延时关闭并回收门禁。异常占用会推送到运营侧。

三、适合谁 / 下一步

适合会议密集的办公楼与园区。建议先覆盖核心会议层，验证预约数据源与设备协议后再横向复制。`,
  },
  {
    id: 'n3',
    category: '公司动态',
    date: '2026-06-08',
    title: '安托未来完成新一轮产品矩阵梳理：软件、硬件与 Token 协同',
    summary: '官网信息架构按智能体、硬件、行业方案与 Token 服务重新对齐，便于客户按场景选型。',
    cover: '/assets/hero/capability-software.jpg',
    author: '安托未来',
    tags: ['产品矩阵', '官网', '选型'],
    body: `一、为什么要重新对齐信息架构？

客户往往同时问「有没有智能体」「硬件怎么接」「Token 怎么买」。过去入口分散，选型路径不清晰。本次把软件、硬件与 Token 放在同一叙事下，按场景进入。

二、对官网访问意味着什么？

首页、方案、智能体、硬件与新闻中心路径保持稳定，内容由后台统一发布。客户可先看场景，再下钻产品与案例。

三、适合谁 / 下一步

适合需要对外讲清产品边界的销售与售前。后续将持续用新闻中心同步版本与落地案例。`,
  },
  {
    id: 'n4',
    category: '产品更新',
    date: '2026-05-20',
    title: '中控屏升级：蓝牙直连 + 第三方协议接入',
    summary: '同一中控可直连自有蓝牙设备，也可经服务器对接 KNX、BUS 等协议。本文说明升级价值与现场部署选择。',
    cover: '/assets/hero/capability-hardware.jpg',
    author: '安托未来',
    tags: ['中控屏', '蓝牙直连', 'KNX', '协议接入'],
    body: `一、现场对接为什么总卡在「协议与链路」？

楼宇现状往往既有自有设备，也有第三方弱电系统。中控屏升级后，同一终端可蓝牙直连安托设备，也可经服务器侧对接 KNX、BUS 等协议，按现场条件选择路径。

二、对交付周期意味着什么？

直连适合快速落地自有设备；协议接入适合保护既有投资、降低改造面。中控作为边缘执行节点，可承接上层智能体策略，并在弱网时保持本地可控。

三、适合谁 / 下一步

适合新建与改造并存的项目。可先梳理目标楼层设备清单与协议类型，再确定中控部署数量与接入方式。`,
  },
  {
    id: 'n5',
    category: '公司动态',
    date: '2026-04-28',
    title: 'AI Token 服务独立站点上线',
    summary: '模型与工具能力以 Token 方式计量交付。本文介绍独立站定位，以及与空间智能业务的关系。',
    cover: '/assets/hero/capability-api.jpg',
    author: '安托未来',
    tags: ['AI Token', '模型能力', '计量交付'],
    body: `一、为什么把 Token 服务做成独立站？

模型与工具调用需要独立的计量、说明与商务路径。AI Token 独立站上线后，能力以 Token 方式交付，便于按项目规模与调用量采购，并与空间智能主站解耦运营。

二、官网如何配合？

官网保留入口说明与商务对接通道；详细产品能力与接入指引以 Token 独立站为准，避免信息混杂。

三、适合谁 / 下一步

适合需要按量调用模型与工具能力的客户与合作伙伴。可先确认业务场景与预估调用量，再通过独立站或商务渠道开通。`,
  },
  {
    id: 'n6',
    category: '方案实践',
    date: '2026-03-15',
    title: '酒店公寓智能体完成分房与门锁联调',
    summary: '分房策略、蓝牙门锁授权与客房能耗统计一体化演示通过。本文回顾联调范围与对运营效率的意义。',
    cover: '/images/home-advantages/advantage-wireless-access.webp',
    author: '安托未来',
    tags: ['酒店公寓', '分房', '蓝牙门锁', '客房能耗'],
    body: `一、入住链路里最容易断在哪里？

分房、门锁授权与客房能耗往往分属不同系统，入住与退房环节容易靠人工衔接。酒店公寓智能体完成一体化联调后，演示了从分房到授权再到能耗回传的闭环。

二、联调覆盖哪些关键动作？

入住办理后可自动下发门锁权限，退房后及时回收；客房环境与能耗数据回传运营侧，支撑精细化管理与周转分析。

三、适合谁 / 下一步

适合精品酒店、长租公寓与服务式公寓等场景。可从单栋或单层试点开始，验证门锁协议与 PMS/运营系统对接方式。`,
  },
]

export const defaultNewsFeedContent = {
  title: '新闻中心',
  subtitle: '公司动态、产品更新与方案实践。',
  items: structuredClone(defaultItems),
}

function cleanText(value, fallback = '', max = 2000) {
  return String(value ?? fallback ?? '').trim().slice(0, max)
}

function cleanUrl(value, fallback = '') {
  const url = String(value ?? fallback ?? '').trim()
  if (!url) return fallback
  if (url.startsWith('/') && !url.startsWith('//')) return url.slice(0, 1000)
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('图片链接必须是站内路径或 http(s)')
  return parsed.toString().slice(0, 1000)
}

function cleanTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 12)
  }
  return String(value || '')
    .split(/[,，#\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12)
}

function cleanDate(value, fallback) {
  const text = String(value || fallback || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  return fallback || new Date().toISOString().slice(0, 10)
}

function validateItem(value = {}, fallback = {}) {
  const newsType = value.type === 'video' ? 'video' : 'article'
  const title = cleanText(value.title, fallback.title || '未命名新闻', 160)
  const bodyHtml = newsType === 'video'
    ? ''
    : sanitizeNewsHtml(value.bodyHtml || fallback.bodyHtml || htmlFromPlainBody(value.body || fallback.body || ''))
  const body = newsType === 'video' ? '' : cleanText(value.body || plainTextFromHtml(bodyHtml), fallback.body || '', 20000)
  const category = NEWS_CATEGORIES.includes(value.category) ? value.category : (fallback.category || '公司动态')
  const videoUrl = newsType === 'video' ? cleanUrl(value.videoUrl, fallback.videoUrl || '') : ''
  if (newsType === 'video' && !videoUrl) throw new Error('请上传视频')
  return {
    id: cleanText(value.id, fallback.id || `n-${randomUUID().slice(0, 8)}`, 40) || `n-${randomUUID().slice(0, 8)}`,
    type: newsType,
    category,
    date: cleanDate(value.date, fallback.date),
    title,
    summary: cleanText(value.summary, fallback.summary || '', 400),
    cover: cleanUrl(value.cover, fallback.cover || ''),
    videoUrl,
    author: cleanText(value.author, fallback.author || '安托未来', 40),
    tags: cleanTags(value.tags ?? fallback.tags),
    pinHome: Boolean(value.pinHome),
    pinnedAt: Boolean(value.pinHome) ? cleanText(value.pinnedAt, new Date().toISOString(), 40) : '',
    body,
    bodyHtml,
    sections: formatNewsBody(body),
  }
}

export function validateNewsFeedContent(value = {}) {
  const fallback = defaultNewsFeedContent
  const source = Array.isArray(value.items) ? value.items : fallback.items
  const items = source.slice(0, 80).map((item, index) => validateItem(item, fallback.items[index] || {}))
  return {
    title: cleanText(value.title, fallback.title, 80),
    subtitle: cleanText(value.subtitle, fallback.subtitle, 240),
    items,
  }
}

export function getNewsFeedConfig() {
  let page = db().pageConfigs.find((item) => item.pageKey === NEWS_FEED_PAGE_KEY && item.locale === 'zh-CN')
  if (!page) {
    const now = new Date().toISOString()
    const content = validateNewsFeedContent(defaultNewsFeedContent)
    page = {
      id: randomUUID(),
      pageKey: NEWS_FEED_PAGE_KEY,
      locale: 'zh-CN',
      status: 'published',
      draftContent: content,
      publishedContent: structuredClone(content),
      updatedAt: now,
      publishedAt: now,
    }
    db().pageConfigs.push(page)
  }
  return page
}
