import { getAboutContent } from '../services/about-content-api.js'
import { renderAboutPage } from '../lib/about-page-render.js'

const FALLBACK_ABOUT = {
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
      { title: '使命', body: '让生活更智能，让每一刻更明亮。' },
      { title: '价值观', body: '今天的最佳表现，是明天的最低要求。' },
      { title: '愿景', body: '共建、共享、高效协同。' },
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
  join: {
    label: '加入我们',
    title: '关注成长，鼓励创新',
    lead: '青春正好，我们在等你。无论你刚走出校园，还是已有锋芒，这里都有成长路径、动手空间，和一份看得见的日常。',
    ctaLabel: '投递简历',
    ctaHref: 'mailto:service@atuofuture.com',
    slides: [
      { imageUrl: '/images/solutions/building.jpg', caption: '杭州办公空间' },
      { imageUrl: '/images/home-agents/meeting.jpg', caption: '协作与共创' },
      { imageUrl: '/images/solutions/campus.jpg', caption: '数字生态园区' },
      { imageUrl: '/images/hardware/smart-meeting.jpg', caption: '智能会议室' },
    ],
    items: [
      { step: '01', title: '聚焦成长', body: '通过应届生培养与一对一导师，帮助每一位新人发光。' },
      { step: '02', title: '助力攀登', body: '阶梯式领导力项目，帮助核心骨干从超越走向卓越。' },
      { step: '03', title: '鼓励创新', body: '科技奖、黑客松与青年工程师计划，推动技术突破。' },
      { step: '04', title: '乐在工作', body: '现代办公、食堂、健身与完善配套，提升工作幸福感。' },
      { step: '05', title: '温暖福利', body: '多元假期与综合福利，让同事在工作之外也有从容。' },
    ],
    jobsTitle: '在招职位',
    briefLabel: '查看招聘需求',
    briefUrl: '',
    jobs: [
      { title: '嵌入式软件工程师', dept: '研发', location: '杭州', type: '社招', summary: '负责物联网终端固件与硬件联调，把设备稳定送进客户现场。', applyHref: 'mailto:service@atuofuture.com?subject=应聘嵌入式软件工程师' },
      { title: '物联网产品经理', dept: '产品', location: '杭州', type: '社招', summary: '把空间智能体、硬件与交付流程做成可规模复制的产品。', applyHref: 'mailto:service@atuofuture.com?subject=应聘物联网产品经理' },
      { title: '应届生培养计划', dept: '校招', location: '杭州', type: '校招', summary: '软件、硬件、交付方向同步开放，一对一导师带教。', applyHref: 'mailto:service@atuofuture.com?subject=应聘应届生培养计划' },
    ],
  },
  contact: {
    label: '联系我们',
    title: 'Artink 在等你',
    lead: '杭州安托未来科技有限公司。校园招聘与社会招聘同步开放，也欢迎客户、伙伴与投资者来信。',
    email1: 'service@atuofuture.com',
    email2: 'sherri@atuofuture.com',
    phoneDisplay: '',
    phone: '',
    addressZh: '杭州市余杭区阿里巴巴数字生态创新园 1 号楼 5 层',
    addressEn: '5th Floor, Building 1, Alibaba Digital Ecological Innovation Park, Yuhang District, Hangzhou',
    joinTitle: '加入我们',
    joinBody: '青春正好，我们在等你。你的经验与锋芒，值得更大的舞台。',
  },
}

function bindJoinCarousel(root) {
  if (!root || root.classList.contains('ab-join__stage--edit')) return
  root._joinCleanup?.()
  const slides = [...root.querySelectorAll('.ab-join__slide')]
  const dots = [...root.querySelectorAll('[data-about-join-dots] button')]
  if (slides.length < 2) return

  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')))
  let timer = 0
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function goTo(next) {
    index = ((next % slides.length) + slides.length) % slides.length
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index))
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index))
  }

  function play() {
    if (reduced) return
    stop()
    timer = window.setInterval(() => goTo(index + 1), 5200)
  }

  function stop() {
    window.clearInterval(timer)
    timer = 0
  }

  const onPrev = () => {
    goTo(index - 1)
    play()
  }
  const onNext = () => {
    goTo(index + 1)
    play()
  }
  root.querySelector('[data-about-join-prev]')?.addEventListener('click', onPrev)
  root.querySelector('[data-about-join-next]')?.addEventListener('click', onNext)
  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => {
      goTo(i)
      play()
    })
  )
  root.addEventListener('mouseenter', stop)
  root.addEventListener('mouseleave', play)
  root.addEventListener('focusin', stop)
  root.addEventListener('focusout', play)

  let touchX = 0
  const film = root.querySelector('.ab-join__film')
  const onTouchStart = (event) => {
    touchX = event.changedTouches[0].clientX
  }
  const onTouchEnd = (event) => {
    const dx = event.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 40) {
      goTo(index + (dx < 0 ? 1 : -1))
      play()
    }
  }
  film?.addEventListener('touchstart', onTouchStart, { passive: true })
  film?.addEventListener('touchend', onTouchEnd, { passive: true })

  root._joinCleanup = () => {
    stop()
    root.removeEventListener('mouseenter', stop)
    root.removeEventListener('mouseleave', play)
    root.removeEventListener('focusin', stop)
    root.removeEventListener('focusout', play)
    film?.removeEventListener('touchstart', onTouchStart)
    film?.removeEventListener('touchend', onTouchEnd)
  }
  play()
}

function mountAbout(content) {
  const root = document.getElementById('about-root')
  if (!root) return
  root.innerHTML = renderAboutPage(content || {}, { editable: false })
  root.querySelectorAll('[data-about-partners] img').forEach((image) => {
    image.addEventListener('error', () => {
      const figure = image.closest('figure')
      if (figure) figure.innerHTML = `<strong>${image.alt || '客户'}</strong>`
    })
  })
  bindJoinCarousel(root.querySelector('[data-about-join-carousel]'))
}

export async function loadAndApplyAboutContent() {
  try {
    const payload = await getAboutContent()
    mountAbout(payload.content || FALLBACK_ABOUT)
  } catch {
    mountAbout(FALLBACK_ABOUT)
  }
}
