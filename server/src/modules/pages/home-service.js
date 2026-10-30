import { randomUUID } from 'node:crypto'
import { db, save } from '../../lib/store.js'

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
  heroSlides: [
    { label: '', title: '让空间具备感知、思考与执行能力', description: '安托未来以空间智能中枢连接场景智能体与智能硬件，为楼宇、园区及各类空间提供可开放、可自治、可规模交付的解决方案。', actionLabel: '了解安托未来', actionHref: '#upgrade', background: '/images/home-advantages/advantage-ai-agent.webp' },
    { label: '能力 01', title: '开放架构，连接现有系统与未来应用', description: '以标准化 API 与灵活接入能力，连接客户现有系统、第三方平台，并为新增应用保留扩展空间。', actionLabel: '查看开放能力', actionHref: '#upgrade', background: '/images/home-advantages/advantage-open-interface.webp' },
    { label: '能力 02', title: 'AI 原生架构，让空间主动理解与执行', description: '以智能体感知环境、理解需求、协同决策并调用设备，将空间运营从人工操作升级为自动执行。', actionLabel: '探索智能体', actionHref: '/agents/', background: '/images/home-advantages/advantage-ai-agent.webp' },
    { label: '能力 03', title: '大规模无线接入，让复杂项目快速落地', description: '具备千万平方米级无线商用接入经验，支持多楼栋、多楼层、多类型终端的稳定连接与统一管理。', actionLabel: '查看接入能力', actionHref: '/hardware/#gateway', background: '/images/home-advantages/advantage-wireless-access.webp' },
    { label: '能力 04', title: '分层自治，全域协同', description: '平台、区域、边缘与终端均可独立闭环运行，也能在统一架构下协同联动，断网时本地仍可持续工作。', actionLabel: '了解技术架构', actionHref: '#upgrade', background: '/images/home-advantages/advantage-layered-loop.webp' },
    { label: '能力 05', title: '软硬协同，构建完整空间智能底座', description: '从感知终端、边缘网关到 AI 平台与场景应用，形成软硬件协同设计与项目交付能力。', actionLabel: '查看智能硬件', actionHref: '/hardware/', background: '/images/home-advantages/advantage-hardware-system.webp' },
  ],
  banner: {
    title: '八大空间智能体现已开放方案咨询',
    subtitle: '会议、访客、能耗、展厅、酒店公寓……每个智能体负责一类真实任务。',
    ctaLabel: '查看智能体',
    ctaUrl: '/agents/',
    imageUrl: '/images/home-agents/space.jpg',
  },
  agents: {
    title: '您的空间需要什么，这里一目了然',
    subtitle: '软件、硬件与平台，按业务需求灵活组合。',
    moreLabel: '探索全部产品 ↗',
    moreUrl: '/hardware/products/',
    cards: [
      { title: '会议与接待', description: '预约、签到、设备准备，一起就绪', tags: '会议预约 / 访客管理 / 中控屏 / 电子桌牌', imageUrl: '/images/home-atf/atf-01.webp', href: '/solutions/?id=meeting' },
      { title: '空间与设备控制', description: '灯光、空调与环境，按需联动', tags: '场景联动 / 环境监测 / 智能开关 / 空调网关', imageUrl: '/images/home-atf/atf-02.webp', href: '/solutions/?id=building' },
      { title: 'RFID 资产管理', description: '资产在哪里、有没有，一目了然', tags: '资产台账 / 智能盘点 / RFID读写器 / 电子标签', imageUrl: '/images/home-atf/atf-03.webp', href: '/solutions/?id=security' },
      { title: '能源与设备运维', description: '看清能耗，及时发现与处理异常', tags: '能耗分析 / 设备监测 / 工单巡检', imageUrl: '/images/home-atf/atf-04.webp', href: '/solutions/?id=energy' },
      { title: '信息发布与展示', description: '从会议投屏到企业宣传，统一管理', tags: '内容发布 / 无线投屏 / 电子相框 / 发布终端', imageUrl: '/images/home-atf/atf-05.webp', href: '/hardware/products/' },
      { title: '招商与空间运营', description: '从招商签约到交付入住，流程贯通', tags: '招商管理 / 合同管理 / 租户服务', imageUrl: '/images/home-atf/atf-06.webp', href: '/solutions/?id=commercial' },
    ],
    platformTitle: '连接这些产品，让空间协同运行',
    platform: [
      { title: 'Aspace One 应用平台', description: '一个入口，汇聚业务应用', imageUrl: '/images/home-atf/atf-07.webp' },
      { title: 'IoT 设备连接与联动', description: '连接设备，执行场景联动', imageUrl: '/images/home-atf/atf-08.webp' },
      { title: '数字孪生', description: '在空间中查看设备与数据', imageUrl: '/images/home-atf/atf-09.webp' },
    ],
    bottomText: '产品连接之后，AI 如何让工作自动完成？',
    bottomLabel: '探索空间智能体 →',
    bottomUrl: '/agents/',
  },
  news: {
    kicker: '新闻',
    title: '新闻动态',
    subtitle: '公司动态、产品更新与方案实践，带您了解正积极塑造更智能空间运营的技术进展。',
    moreLabel: '进入新闻中心',
    moreUrl: '/news/',
    items: [
      { category: '公司动态', title: '安托未来发布 AI 原生空间智能架构', description: '以智能体编排为核心，打通传感、网关、中控与开放接口。', imageUrl: '/images/home-advantages/advantage-ai-agent.webp', linkUrl: '/news-detail/?id=n1' },
      { category: '产品更新', title: '会议运维智能体支持云视频与中控联动', description: '预约、签到、中控与云视频形成运维闭环。', imageUrl: '/assets/hero/capability-agents.jpg', linkUrl: '/news-detail/?id=n2' },
      { category: '方案实践', title: '毫米波有无人感知助力楼宇节能落地', description: '按真实占用调节照明与空调策略。', imageUrl: '/images/home-advantages/advantage-layered-loop.webp', linkUrl: '/news-detail/?id=n3' },
    ],
  },
  pitch: {
    label: '探索安托未来',
    title: '我们把物理空间，做成可感知、可调度、可运营的智能系统',
    items: [
      { variant: 'photo', kicker: '关于我们', title: '了解是什么驱使我们去升级空间', href: '/about/', moreLabel: '阅读更多信息', imageUrl: '/images/home-advantages/advantage-open-interface.webp', openDemo: false },
      { variant: 'wave', kicker: '智能体', title: '八大空间智能体如何改变运营？', href: '/agents/', moreLabel: '阅读更多信息', imageUrl: '', openDemo: false },
      { variant: 'mint', kicker: '预约演示', title: '变革从一次方案沟通开始。', href: '#', moreLabel: '了解更多信息', imageUrl: '', openDemo: true },
      { variant: 'photo', kicker: '智能硬件', title: '端边云一体，开放可集成，也可自闭环。', href: '/hardware/', moreLabel: '阅读更多信息', imageUrl: '/images/home-advantages/advantage-hardware-system.webp', openDemo: false },
    ],
  },
}

function cleanText(value, fallback, maxLength = 500) {
  const text = String(value ?? fallback ?? '').trim()
  return text.slice(0, maxLength)
}

function cleanUrl(value, fallback = '') {
  const url = String(value ?? fallback ?? '').trim()
  if (!url) return fallback || ''
  if (url.startsWith('#') || (url.startsWith('/') && !url.startsWith('//')) || !/^[a-z]+:/i.test(url)) return url.slice(0, 1000)
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('图片、视频和跳转链接必须使用 http(s) 或站内相对地址')
  return parsed.toString().slice(0, 1000)
}

function fixedItems(value, defaults, mapper) {
  const source = Array.isArray(value) ? value : []
  return defaults.map((fallback, index) => mapper(source[index] || {}, fallback))
}

function listItems(value, defaults, mapper, max = 12) {
  const fallback = defaults[0] || {}
  const source = Array.isArray(value) && value.length ? value : defaults
  return source.slice(0, max).map((item, index) => mapper(item || {}, defaults[index] || fallback, index))
}

export function validateHomeContent(value = {}) {
  const hero = value.hero || {}
  const core = value.core || {}
  const partners = value.partners || {}
  const solutions = value.solutions || {}
  const cases = value.cases || {}
  const cta = value.cta || {}
  const banner = value.banner || {}
  const agents = value.agents || {}
  const news = value.news || {}
  const pitch = value.pitch || {}

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
      items: listItems(solutions.items, defaultHomeContent.solutions.items, (item, fallback) => ({
        chip: cleanText(item.chip, fallback.chip, 40),
        title: cleanText(item.title, fallback.title, 100),
        description: cleanText(item.description, fallback.description, 500),
        tags: (Array.isArray(item.tags) ? item.tags : fallback.tags || []).slice(0, 6).map((tag) => cleanText(tag, '', 30)).filter(Boolean),
        imageUrl: cleanUrl(item.imageUrl, fallback.imageUrl),
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
    heroSlides: listItems(value.heroSlides, defaultHomeContent.heroSlides, (item, fallback) => ({
      label: cleanText(item.label, fallback.label, 40),
      title: cleanText(item.title, fallback.title, 120),
      description: cleanText(item.description, fallback.description, 400),
      actionLabel: cleanText(item.actionLabel, fallback.actionLabel, 40),
      actionHref: cleanUrl(item.actionHref, fallback.actionHref),
      background: cleanUrl(item.background, fallback.background),
    })),
    banner: {
      title: cleanText(banner.title, defaultHomeContent.banner.title, 80),
      subtitle: cleanText(banner.subtitle, defaultHomeContent.banner.subtitle, 200),
      ctaLabel: cleanText(banner.ctaLabel, defaultHomeContent.banner.ctaLabel, 20),
      ctaUrl: cleanUrl(banner.ctaUrl, defaultHomeContent.banner.ctaUrl),
      imageUrl: cleanUrl(banner.imageUrl, defaultHomeContent.banner.imageUrl),
    },
    agents: {
      title: cleanText(agents.title, defaultHomeContent.agents.title, 80),
      subtitle: cleanText(agents.subtitle, defaultHomeContent.agents.subtitle, 500),
      moreLabel: cleanText(agents.moreLabel, defaultHomeContent.agents.moreLabel, 40),
      moreUrl: cleanUrl(agents.moreUrl, defaultHomeContent.agents.moreUrl),
      cards: fixedItems(agents.cards, defaultHomeContent.agents.cards, (item, fallback) => ({
        title: cleanText(item.title, fallback.title, 40),
        description: cleanText(item.description, fallback.description, 80),
        tags: cleanText(Array.isArray(item.tags) ? item.tags.join(' / ') : item.tags, fallback.tags, 80),
        imageUrl: cleanUrl(item.imageUrl, fallback.imageUrl),
        href: cleanUrl(item.href, fallback.href),
      })),
      platformTitle: cleanText(agents.platformTitle, defaultHomeContent.agents.platformTitle, 60),
      platform: fixedItems(agents.platform, defaultHomeContent.agents.platform, (item, fallback) => ({
        title: cleanText(item.title, fallback.title, 40),
        description: cleanText(item.description, fallback.description, 60),
        imageUrl: cleanUrl(item.imageUrl, fallback.imageUrl),
      })),
      bottomText: cleanText(agents.bottomText, defaultHomeContent.agents.bottomText, 80),
      bottomLabel: cleanText(agents.bottomLabel, defaultHomeContent.agents.bottomLabel, 40),
      bottomUrl: cleanUrl(agents.bottomUrl, defaultHomeContent.agents.bottomUrl),
    },
    news: {
      kicker: cleanText(news.kicker, defaultHomeContent.news.kicker, 40),
      title: cleanText(news.title, defaultHomeContent.news.title, 80),
      subtitle: cleanText(news.subtitle, defaultHomeContent.news.subtitle, 300),
      moreLabel: cleanText(news.moreLabel, defaultHomeContent.news.moreLabel, 30),
      moreUrl: cleanUrl(news.moreUrl, defaultHomeContent.news.moreUrl),
      items: listItems(news.items, defaultHomeContent.news.items, (item, fallback) => ({
        category: cleanText(item.category, fallback.category, 20),
        title: cleanText(item.title, fallback.title, 80),
        description: cleanText(item.description, fallback.description, 200),
        imageUrl: cleanUrl(item.imageUrl, fallback.imageUrl),
        linkUrl: cleanUrl(item.linkUrl, fallback.linkUrl),
      })),
    },
    pitch: {
      label: cleanText(pitch.label, defaultHomeContent.pitch.label, 40),
      title: cleanText(pitch.title, defaultHomeContent.pitch.title, 120),
      items: listItems(pitch.items, defaultHomeContent.pitch.items, (item, fallback) => ({
        variant: ['photo', 'wave', 'mint'].includes(item.variant) ? item.variant : (fallback.variant || 'photo'),
        kicker: cleanText(item.kicker, fallback.kicker, 40),
        title: cleanText(item.title, fallback.title, 120),
        href: cleanUrl(item.href, fallback.href || '/'),
        moreLabel: cleanText(item.moreLabel, fallback.moreLabel || '阅读更多信息', 30),
        imageUrl: cleanUrl(item.imageUrl, fallback.imageUrl),
        openDemo: Boolean(item.openDemo),
      })),
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
  if (!Array.isArray(page.draftContent?.heroSlides) || !page.draftContent.heroSlides.length) {
    page.draftContent = {
      ...page.draftContent,
      heroSlides: structuredClone(defaultHomeContent.heroSlides),
      banner: page.draftContent?.banner || structuredClone(defaultHomeContent.banner),
      agents: page.draftContent?.agents || structuredClone(defaultHomeContent.agents),
      news: page.draftContent?.news || structuredClone(defaultHomeContent.news),
      pitch: page.draftContent?.pitch || structuredClone(defaultHomeContent.pitch),
    }
  }
  let agentsMigrated = false
  if (!page.draftContent.agents?.cards?.length) {
    page.draftContent.agents = structuredClone(defaultHomeContent.agents)
    agentsMigrated = true
  }
  if (page.publishedContent && !page.publishedContent.agents?.cards?.length) {
    page.publishedContent.agents = structuredClone(defaultHomeContent.agents)
    agentsMigrated = true
  }
  if (agentsMigrated) {
    page.updatedAt = new Date().toISOString()
    void save()
  }
  if (!page.draftContent.pitch?.items?.length) {
    page.draftContent.pitch = {
      ...structuredClone(defaultHomeContent.pitch),
      ...page.draftContent.pitch,
      items: structuredClone(defaultHomeContent.pitch.items),
    }
  }
  return page
}
