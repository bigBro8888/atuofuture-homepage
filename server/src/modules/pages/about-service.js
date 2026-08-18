import { randomUUID } from 'node:crypto'
import { db } from '../../lib/store.js'

export const defaultAboutContent = {
  hero: {
    title: '让生活更智能',
    body: '让每一刻更明亮。我们相信物联网能够赋能高效的商业、充满活力的生活和繁荣的社区。安托未来持续创新物联网技术与智能硬件，并致力于提升这些方案在全球的可及性与可负担性。我们最核心的承诺，是帮助客户取得成功。',
    primaryLabel: '联系我们',
    primaryHref: '#contact',
    secondaryLabel: '关于安托未来',
    secondaryHref: '#story',
    imageUrl: '/images/hardware/hero-bg.png',
  },
  story: {
    label: '关于安托未来',
    title: '客户是我们的首要责任',
    body1: '为满足客户需求，我们交付的一切都必须达到最高品质。我们持续创造价值、优化成本、保持公允定价，确保订单及时准确履行，并在交付前后提供一流服务。',
    body2: '多年来，我们有幸服务阿里巴巴、盒马、饿了么、ZEBRA、银泰、钉钉、蚂蚁集团、大润发等领先企业。数千万件产品在其业务与零售网络中稳定运行。团队保障及时交付、实施质量、客户培训与售后支持，并建立灵活的反馈机制，持续提升客户满意度。',
    imageUrl: '/images/hardware/eink-price-tag.jpg',
  },
  values: {
    label: 'CULTURE / 01—03',
    title: '使命、价值观与愿景',
    items: [
      { icon: 'flag', title: '使命', body: '让生活更智能，让每一刻更明亮。', imageUrl: '/images/home-agents/space.jpg' },
      { icon: 'workspace_premium', title: '价值观', body: '今天的最佳表现，是明天的最低要求。', imageUrl: '/images/home-agents/meeting.jpg' },
      { icon: 'handshake', title: '愿景', body: '共建、共享、高效协同。', imageUrl: '/images/solutions/campus.jpg' },
    ],
  },
  partners: {
    label: '客户与网络',
    title: '服务领先企业与零售网络',
    intro: '数千万件产品运行在客户的商业与零售网络中。以下为我们长期服务的部分客户与合作伙伴。',
    items: [
      { name: '阿里巴巴', logoUrl: '/images/partners/alibaba.png' },
      { name: '盒马', logoUrl: '/images/partners/hema.png' },
      { name: '饿了么', logoUrl: '/images/partners/eleme.png' },
      { name: 'ZEBRA', logoUrl: '/images/partners/zebra.png' },
      { name: '银泰', logoUrl: '/images/partners/intime.png' },
      { name: '钉钉', logoUrl: '/images/partners/dingtalk.png' },
      { name: '蚂蚁集团', logoUrl: '/images/partners/ant.png' },
      { name: '大润发', logoUrl: '/images/partners/rtmart.png' },
    ],
  },
  duties: {
    label: '责任与承诺',
    title: '对客户、员工与股东负责',
    items: [
      { imageUrl: '/images/hardware/eink-price-tag.jpg', title: '对客户', body: '品质、公允定价、及时履约，以及交付前后的一流服务。' },
      { imageUrl: '/images/solutions/campus.jpg', title: '对员工', body: '建设包容、多元、相互尊重的工作环境，关心健康与职业发展。' },
      { imageUrl: '/images/solutions/building.jpg', title: '对社区与股东', body: '支持公益、依法纳税、保护环境；拥抱创新，实现可持续增长与合理回报。' },
    ],
  },
  join: {
    label: '加入我们',
    title: '关注成长，鼓励创新',
    items: [
      { step: '01', title: '聚焦成长', body: '通过应届生培养与一对一导师，帮助每一位新人发光。' },
      { step: '02', title: '助力攀登', body: '阶梯式领导力项目，帮助核心骨干从超越走向卓越。' },
      { step: '03', title: '鼓励创新', body: '科技奖、黑客松与青年工程师计划，推动技术突破。' },
      { step: '04', title: '乐在工作', body: '现代办公、食堂、健身与完善配套，提升工作幸福感。' },
      { step: '05', title: '温暖福利', body: '多元假期与综合福利，让同事在工作之外也有从容。' },
    ],
  },
  contact: {
    label: '联系我们',
    title: 'Artink 在等你',
    lead: '杭州安托未来科技有限公司。校园招聘与社会招聘同步开放，也欢迎客户、伙伴与投资者来信。',
    email1: 'service@atuofuture.com',
    email2: 'sherri@atuofuture.com',
    addressZh: '杭州市余杭区阿里巴巴数字生态创新园 1 号楼 5 层',
    addressEn: '5th Floor, Building 1, Alibaba Digital Ecological Innovation Park, Yuhang District, Hangzhou',
    joinTitle: '加入我们',
    joinBody: '青春正好，我们在等你。你的经验与锋芒，值得更大的舞台。',
    joinLabel: '投递简历',
    joinHref: 'mailto:service@atuofuture.com',
  },
}

function cleanText(value, fallback, maxLength = 500) {
  const text = String(value ?? fallback ?? '').trim()
  return text.slice(0, maxLength)
}

function cleanHref(value, fallback = '') {
  const url = String(value ?? fallback ?? '').trim()
  if (!url) return ''
  if (url.startsWith('#') || url.startsWith('mailto:') || (url.startsWith('/') && !url.startsWith('//'))) {
    return url.slice(0, 1000)
  }
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('链接必须使用 HTTPS、站内地址或邮箱')
  }
  return parsed.toString().slice(0, 1000)
}

function fixedItems(value, defaults, mapper) {
  const source = Array.isArray(value) ? value : []
  return defaults.map((fallback, index) => mapper(source[index] || {}, fallback))
}

function listItems(value, defaults, mapper, max = 16) {
  const fallback = defaults[0] || {}
  const source = Array.isArray(value) && value.length ? value : defaults
  return source.slice(0, max).map((item, index) => mapper(item || {}, defaults[index] || fallback, index))
}

export function validateAboutContent(value = {}) {
  const hero = value.hero || {}
  const story = value.story || {}
  const values = value.values || {}
  const partners = value.partners || {}
  const duties = value.duties || {}
  const join = value.join || {}
  const contact = value.contact || {}

  return {
    hero: {
      title: cleanText(hero.title, defaultAboutContent.hero.title, 40),
      body: cleanText(hero.body, defaultAboutContent.hero.body, 800),
      primaryLabel: cleanText(hero.primaryLabel, defaultAboutContent.hero.primaryLabel, 20),
      primaryHref: cleanHref(hero.primaryHref, defaultAboutContent.hero.primaryHref),
      secondaryLabel: cleanText(hero.secondaryLabel, defaultAboutContent.hero.secondaryLabel, 20),
      secondaryHref: cleanHref(hero.secondaryHref, defaultAboutContent.hero.secondaryHref),
      imageUrl: cleanHref(hero.imageUrl, defaultAboutContent.hero.imageUrl),
    },
    story: {
      label: cleanText(story.label, defaultAboutContent.story.label, 40),
      title: cleanText(story.title, defaultAboutContent.story.title, 40),
      body1: cleanText(story.body1, defaultAboutContent.story.body1, 800),
      body2: cleanText(story.body2, defaultAboutContent.story.body2, 800),
      imageUrl: cleanHref(story.imageUrl, defaultAboutContent.story.imageUrl),
    },
    values: {
      label: cleanText(values.label, defaultAboutContent.values.label, 40),
      title: cleanText(values.title, defaultAboutContent.values.title, 40),
      items: fixedItems(values.items, defaultAboutContent.values.items, (item, fallback) => ({
        icon: cleanText(item.icon, fallback.icon, 40),
        title: cleanText(item.title, fallback.title, 20),
        body: cleanText(item.body, fallback.body, 200),
        imageUrl: cleanHref(item.imageUrl, fallback.imageUrl),
      })),
    },
    partners: {
      label: cleanText(partners.label, defaultAboutContent.partners.label, 40),
      title: cleanText(partners.title, defaultAboutContent.partners.title, 40),
      intro: cleanText(partners.intro, defaultAboutContent.partners.intro, 400),
      items: listItems(partners.items, defaultAboutContent.partners.items, (item, fallback) => {
        const name = cleanText(item.name, fallback.name, 40)
        const named = defaultAboutContent.partners.items.find((entry) => entry.name === name)
        return {
          name,
          logoUrl: cleanHref(item.logoUrl, named?.logoUrl || ''),
        }
      }, 16),
    },
    duties: {
      label: cleanText(duties.label, defaultAboutContent.duties.label, 40),
      title: cleanText(duties.title, defaultAboutContent.duties.title, 40),
      items: fixedItems(duties.items, defaultAboutContent.duties.items, (item, fallback) => ({
        imageUrl: cleanHref(item.imageUrl, fallback.imageUrl),
        title: cleanText(item.title, fallback.title, 40),
        body: cleanText(item.body, fallback.body, 240),
      })),
    },
    join: {
      label: cleanText(join.label, defaultAboutContent.join.label, 40),
      title: cleanText(join.title, defaultAboutContent.join.title, 40),
      items: fixedItems(join.items, defaultAboutContent.join.items, (item, fallback) => ({
        step: cleanText(item.step, fallback.step, 8),
        title: cleanText(item.title, fallback.title, 20),
        body: cleanText(item.body, fallback.body, 200),
      })),
    },
    contact: {
      label: cleanText(contact.label, defaultAboutContent.contact.label, 40),
      title: cleanText(contact.title, defaultAboutContent.contact.title, 40),
      lead: cleanText(contact.lead, defaultAboutContent.contact.lead, 400),
      email1: cleanText(contact.email1, defaultAboutContent.contact.email1, 80),
      email2: cleanText(contact.email2, defaultAboutContent.contact.email2, 80),
      addressZh: cleanText(contact.addressZh, defaultAboutContent.contact.addressZh, 200),
      addressEn: cleanText(contact.addressEn, defaultAboutContent.contact.addressEn, 240),
      joinTitle: cleanText(contact.joinTitle, defaultAboutContent.contact.joinTitle, 40),
      joinBody: cleanText(contact.joinBody, defaultAboutContent.contact.joinBody, 240),
      joinLabel: cleanText(contact.joinLabel, defaultAboutContent.contact.joinLabel, 20),
      joinHref: cleanHref(contact.joinHref, defaultAboutContent.contact.joinHref),
    },
  }
}

export function getAboutPageConfig() {
  let page = db().pageConfigs.find((item) => item.pageKey === 'about' && item.locale === 'zh-CN')
  if (!page) {
    const now = new Date().toISOString()
    page = {
      id: randomUUID(),
      pageKey: 'about',
      locale: 'zh-CN',
      status: 'published',
      draftContent: structuredClone(defaultAboutContent),
      publishedContent: structuredClone(defaultAboutContent),
      updatedAt: now,
      publishedAt: now,
    }
    db().pageConfigs.push(page)
  }
  hydrateValueImages(page.draftContent)
  hydrateValueImages(page.publishedContent)
  hydratePartnerLogos(page.draftContent)
  hydratePartnerLogos(page.publishedContent)
  hydrateValuesKicker(page.draftContent)
  hydrateValuesKicker(page.publishedContent)
  return page
}

function hydrateValuesKicker(content) {
  if (content?.values?.label === '我们努力践行的企业文化') {
    content.values.label = defaultAboutContent.values.label
  }
}

function hydrateValueImages(content) {
  const items = content?.values?.items
  if (!Array.isArray(items)) return
  defaultAboutContent.values.items.forEach((fallback, index) => {
    if (items[index] && !items[index].imageUrl) items[index].imageUrl = fallback.imageUrl
  })
}

function hydratePartnerLogos(content) {
  const items = content?.partners?.items
  if (!Array.isArray(items)) return
  const byName = Object.fromEntries(defaultAboutContent.partners.items.map((item) => [item.name, item.logoUrl]))
  items.forEach((item) => {
    if (item && !item.logoUrl) item.logoUrl = byName[item.name] || ''
  })
}
