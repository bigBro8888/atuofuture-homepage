import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'

export const defaultHomeContent = {
  hero: {
    eyebrow: '',
    title: '让每一座空间，拥有 AI 原生运营能力',
    subtitle: '数字孪生 · 场景智能体 · AI Token 服务底座',
    posterUrl: '',
    videoUrl: '',
  },
  core: {
    kicker: '',
    title: '四类核心能力，交付 AI 原生智能空间',
    subtitle: '安托未来面向楼宇、园区、商业资产，提供从 AI 能力接入、场景智能体构建，到空间系统联动和持续运营服务的一体化解决方案。',
    items: [
      { icon: 'token', title: 'AI Token 服务', description: '统一接入通义千问、DeepSeek、即梦、视觉识别、语音交互、IoT 控制与业务系统 API，将 AI 能力封装成可调用、可计量、可治理的标准化服务。', label: '' },
      { icon: 'smart_toy', title: '场景智能体', description: '围绕会议、访客、资产、能耗、安防、招商运营等高频场景，构建可配置、可执行、可持续优化的专业智能体，让空间服务自动响应。', label: '' },
      { icon: 'device_hub', title: '空间系统联动', description: '打通门禁、电梯、灯光、空调、摄像头、能耗表、资产标签、工单系统等软硬件，让人、设备、资产、事件和服务形成统一联动。', label: '' },
      { icon: 'support_agent', title: '持续运营服务', description: '提供智能体配置、模型能力接入、策略调优、数据分析、系统运维和长期服务支持，让 AI 能力持续嵌入客户日常运营。', label: '' },
    ],
  },
  partners: {
    kicker: '',
    title: '历史合作单位与标杆客户',
    subtitle: '沉淀在总部大楼、产业园区、商业综合体、医疗冷链等多类高价值空间中的交付经验。',
    metrics: [
      { value: 500, suffix: '+', label: '合作企业' },
      { value: 60, suffix: '+', label: '覆盖城市' },
      { value: 128, suffix: '万㎡', label: '连接空间' },
      { value: 98, suffix: '%', label: '续约率' },
    ],
  },
  solutions: {
    eyebrow: '',
    title: 'AI 原生行业解决方案矩阵',
    subtitle: '围绕楼宇、园区与商业资产，安托未来以 AI Token 服务、场景智能体、空间系统联动与持续运营服务，构建可复制的行业解决方案。',
    moreLabel: '查看全部解决方案',
    moreUrl: '#solutions',
    items: [
      { chip: '智慧楼宇', title: 'AI 原生智慧楼宇', description: '围绕会议、访客、空间、能耗、安防与资产管理，打造可感知、可联动、可持续优化的 AI 原生智慧楼宇。', tags: ['会议智能体', '访客接待', '空间联动', '数字孪生大屏'], imageUrl: '', linkUrl: '#solutions' },
      { chip: '园区运营', title: '智慧园区运营', description: '打通园区内多楼栋、多系统与多角色服务，覆盖空间预约、运维管理、能耗分析、安全管理与运营调度。', tags: ['园区运营', '运维调度', '设备联动', '安全管理'], imageUrl: '', linkUrl: '#solutions' },
      { chip: '商业资产', title: '商业资产运营', description: '聚焦招商、带看、租赁、支付、能耗与资产精细化管理，帮助商业资产实现可视、可管、可运营的数字化升级。', tags: ['招商租赁', '预约带看', '支付结算', '资产运营'], imageUrl: '', linkUrl: '#solutions' },
      { chip: '会务接待', title: '会议与访客服务', description: '从邀约预约、车位引导、门禁派梯、会议联动到会后纪要与离场服务，打造一体化智能接待体验。', tags: ['预约邀约', '门禁派梯', '会务联动', 'AI 纪要'], imageUrl: '', linkUrl: '#solutions' },
      { chip: '能源管理', title: '能源与空间能耗', description: '面向空调、照明、电梯与重点设备，提供分项计量、用能分析、策略调优与设备联动，提升空间能效与运营质量。', tags: ['分项计量', '能耗分析', '节能策略', '设备联动'], imageUrl: '', linkUrl: '#solutions' },
      { chip: '安防资产', title: '安防与资产管理', description: '融合视觉识别、资产盘点、领用借还、异常预警与全生命周期管理，让安全管理与资产管理从被动响应走向主动治理。', tags: ['视频识别', '资产盘点', '异常预警', '生命周期管理'], imageUrl: '', linkUrl: '#solutions' },
    ],
  },
  cases: {
    title: '行业标杆案例',
    items: [
      { client: '王力安防集团总部', title: '打造全球领先的“数字孪生智能总部”', description: '集成全域 20+ 子系统，实现从入园、考勤、会议到安防的全链路 AI 自动驱动。', imageUrl: '', linkUrl: '#solutions' },
      { client: '包河区政府智慧办公', title: '存量政务空间的高质量智能进化', description: '利用 AI Token 服务快速赋能老旧建筑，实现资产精细化管理与能耗 25% 降幅。', imageUrl: '', linkUrl: '#solutions' },
    ],
  },
  cta: {
    title: '准备好开启您的空间智能进化之旅了吗？',
    primaryLabel: '立即预约方案演示',
    secondaryLabel: '咨询专家建议',
    note: '已有 500+ 企业在安托未来的帮助下实现空间智能升级',
  },
}

function cleanText(value, fallback, maxLength = 500) {
  const text = String(value ?? fallback ?? '').trim()
  return text.slice(0, maxLength)
}

function cleanUrl(value, fallback = '') {
  const url = String(value ?? fallback ?? '').trim()
  if (!url) return ''
  if (url.startsWith('#') || (url.startsWith('/') && !url.startsWith('//'))) return url.slice(0, 1000)
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:') throw new Error('图片、视频和跳转链接必须使用 HTTPS 或站内相对地址')
  return parsed.toString().slice(0, 1000)
}

function fixedItems(value, defaults, mapper) {
  const source = Array.isArray(value) ? value : []
  return defaults.map((fallback, index) => mapper(source[index] || {}, fallback))
}

export function validateHomeContent(value = {}) {
  const hero = value.hero || {}
  const core = value.core || {}
  const partners = value.partners || {}
  const solutions = value.solutions || {}
  const cases = value.cases || {}
  const cta = value.cta || {}

  return {
    hero: {
      eyebrow: cleanText(hero.eyebrow, defaultHomeContent.hero.eyebrow, 100),
      title: cleanText(hero.title, defaultHomeContent.hero.title, 120),
      subtitle: cleanText(hero.subtitle, defaultHomeContent.hero.subtitle, 240),
      posterUrl: cleanUrl(hero.posterUrl),
      videoUrl: cleanUrl(hero.videoUrl),
    },
    core: {
      kicker: cleanText(core.kicker, defaultHomeContent.core.kicker, 100),
      title: cleanText(core.title, defaultHomeContent.core.title, 120),
      subtitle: cleanText(core.subtitle, defaultHomeContent.core.subtitle, 500),
      items: fixedItems(core.items, defaultHomeContent.core.items, (item, fallback) => ({
        icon: cleanText(item.icon, fallback.icon, 40),
        title: cleanText(item.title, fallback.title, 80),
        description: cleanText(item.description, fallback.description, 500),
        label: cleanText(item.label, fallback.label, 100),
      })),
    },
    partners: {
      kicker: cleanText(partners.kicker, defaultHomeContent.partners.kicker, 100),
      title: cleanText(partners.title, defaultHomeContent.partners.title, 120),
      subtitle: cleanText(partners.subtitle, defaultHomeContent.partners.subtitle, 400),
      metrics: fixedItems(partners.metrics, defaultHomeContent.partners.metrics, (item, fallback) => ({
        value: Math.max(0, Math.min(9999999, Number(item.value ?? fallback.value) || 0)),
        suffix: cleanText(item.suffix, fallback.suffix, 20),
        label: cleanText(item.label, fallback.label, 60),
      })),
    },
    solutions: {
      eyebrow: cleanText(solutions.eyebrow, defaultHomeContent.solutions.eyebrow, 100),
      title: cleanText(solutions.title, defaultHomeContent.solutions.title, 120),
      subtitle: cleanText(solutions.subtitle, defaultHomeContent.solutions.subtitle, 500),
      moreLabel: cleanText(solutions.moreLabel, defaultHomeContent.solutions.moreLabel, 60),
      moreUrl: cleanUrl(solutions.moreUrl, defaultHomeContent.solutions.moreUrl),
      items: fixedItems(solutions.items, defaultHomeContent.solutions.items, (item, fallback) => ({
        chip: cleanText(item.chip, fallback.chip, 40),
        title: cleanText(item.title, fallback.title, 100),
        description: cleanText(item.description, fallback.description, 500),
        tags: (Array.isArray(item.tags) ? item.tags : fallback.tags).slice(0, 6).map((tag) => cleanText(tag, '', 30)).filter(Boolean),
        imageUrl: cleanUrl(item.imageUrl),
        linkUrl: cleanUrl(item.linkUrl, fallback.linkUrl),
      })),
    },
    cases: {
      title: cleanText(cases.title, defaultHomeContent.cases.title, 120),
      items: fixedItems(cases.items, defaultHomeContent.cases.items, (item, fallback) => ({
        client: cleanText(item.client, fallback.client, 100),
        title: cleanText(item.title, fallback.title, 120),
        description: cleanText(item.description, fallback.description, 500),
        imageUrl: cleanUrl(item.imageUrl),
        linkUrl: cleanUrl(item.linkUrl, fallback.linkUrl),
      })),
    },
    cta: {
      title: cleanText(cta.title, defaultHomeContent.cta.title, 120),
      primaryLabel: cleanText(cta.primaryLabel, defaultHomeContent.cta.primaryLabel, 40),
      secondaryLabel: cleanText(cta.secondaryLabel, defaultHomeContent.cta.secondaryLabel, 40),
      note: cleanText(cta.note, defaultHomeContent.cta.note, 240),
    },
  }
}

export function getHomePageConfig() {
  let page = db().pageConfigs.find((item) => item.pageKey === 'home' && item.locale === 'zh-CN')
  if (!page) {
    const now = new Date().toISOString()
    page = {
      id: randomUUID(),
      pageKey: 'home',
      locale: 'zh-CN',
      status: 'published',
      draftContent: structuredClone(defaultHomeContent),
      publishedContent: structuredClone(defaultHomeContent),
      updatedAt: now,
      publishedAt: now,
    }
    db().pageConfigs.push(page)
  }
  return page
}
