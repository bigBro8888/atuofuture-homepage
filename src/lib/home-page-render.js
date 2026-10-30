/** 官网首页可视化预览：按前台通栏结构渲染（后台编辑用） */

import { esc, textNode, imgNode } from './vedit-nodes.js'

function sectionChrome(kind, title, { editable, addLabel } = {}) {
  if (!editable) return ''
  return `
    <div class="admin-home-chrome" data-home-chrome>
      <strong>${esc(title)}</strong>
      <span class="admin-home-chrome__actions">
        ${addLabel ? `<button type="button" class="admin-add-slide" data-home-visual-add="${esc(kind)}">${esc(addLabel)}</button>` : ''}
      </span>
    </div>`
}

function itemTools(kind, index, total) {
  return `
    <div class="admin-home-item-tools">
      <button type="button" data-home-visual-move="-1" data-home-visual-kind="${esc(kind)}" data-home-visual-index="${index}" ${index === 0 ? 'disabled' : ''}>上移</button>
      <button type="button" data-home-visual-move="1" data-home-visual-kind="${esc(kind)}" data-home-visual-index="${index}" ${index >= total - 1 ? 'disabled' : ''}>下移</button>
      <button type="button" data-home-visual-remove data-home-visual-kind="${esc(kind)}" data-home-visual-index="${index}" ${total <= 1 ? 'disabled' : ''}>删除</button>
    </div>`
}

function renderHero(slides, { editable, activeIndex = 0 }) {
  const list = Array.isArray(slides) && slides.length ? slides : [{ title: '', description: '', background: '' }]
  const active = Math.min(Math.max(0, Number(activeIndex) || 0), list.length - 1)
  return `
    <section class="sm-hero ha-hero admin-home-hero" data-home-section="hero" id="home-visual-hero" aria-label="首屏轮播">
      ${sectionChrome('hero', '首屏轮播', { editable, addLabel: '+ 新增一屏' })}
      ${editable ? `
        <div class="admin-home-hero-pager" data-home-hero-pager>
          <span class="admin-home-hero-pager__meta">共 ${list.length} 屏 · 点选切换（仅显示当前一屏）</span>
          <div class="admin-home-hero-pager__tabs" role="tablist" aria-label="轮播屏切换">
            ${list.map((slide, index) => `
              <button type="button" role="tab" data-home-hero-pick="${index}" class="${index === active ? 'is-active' : ''}" aria-selected="${index === active ? 'true' : 'false'}" title="${esc(slide.title || `第 ${index + 1} 屏`)}">第 ${index + 1} 屏</button>
            `).join('')}
          </div>
        </div>` : ''}
      <div class="admin-home-hero__stack">
        ${list.map((slide, index) => `
          <article class="sm-hero__slide is-active admin-home-hero__slide${index === active ? ' is-editing' : ''}" data-home-hero-slide="${index}"${index === active ? '' : ' hidden'}>
            <div class="sm-hero__media" style="background-image:url('${esc(slide.background || '/images/home-advantages/advantage-ai-agent.webp')}')">
              ${editable ? `<button type="button" class="hpi-edit-bg" data-edit-image="heroSlides.${index}.background" data-edit-image-url="${esc(slide.background || '')}" title="更换背景">更换背景</button>` : ''}
            </div>
            <div class="sm-hero__gradient" aria-hidden="true"></div>
            <div class="sm-hero__content max-w-max-width mx-auto px-margin-desktop">
              <div class="sm-hero__copy">
                ${textNode(`heroSlides.${index}.label`, slide.label || '', { editable, tag: 'strong', className: 'sm-hero__kicker', placeholder: '角标（可空）' })}
                ${textNode(`heroSlides.${index}.title`, slide.title || '', { editable, tag: 'h2', placeholder: '主标题' })}
                ${textNode(`heroSlides.${index}.description`, slide.description || '', { editable, tag: 'p', multiline: true, placeholder: '说明文案' })}
                <div class="sm-hero__actions">
                  <span class="sm-btn sm-btn--primary">${textNode(`heroSlides.${index}.actionLabel`, slide.actionLabel || '了解更多', { editable, tag: 'span', placeholder: '按钮文字' })}</span>
                  ${editable ? textNode(`heroSlides.${index}.actionHref`, slide.actionHref || '', { editable, tag: 'small', className: 'admin-home-href', placeholder: '按钮链接 /agents/' }) : ''}
                </div>
              </div>
              ${editable ? itemTools('hero', index, list.length) : ''}
            </div>
          </article>`).join('')}
      </div>
    </section>`
}

const DEFAULT_ATF_CARDS = [
  { title: '会议智能体', description: '会前准备、会中服务、会后数据', href: '/agent-detail/?id=meeting' },
  { title: '访客接待智能体', description: '邀约通行、接待联动', href: '/agent-detail/?id=visitor' },
  { title: '空间服务智能体', description: '感知状态、按需服务', href: '/agent-detail/?id=space' },
  { title: '能源能耗智能体', description: '能耗分析、策略优化', href: '/agent-detail/?id=energy' },
  { title: '展厅智能体', description: '接待讲解、展项联动', href: '/agent-detail/?id=exhibition' },
  { title: '商业运营智能体', description: '招商签约、入住运营', href: '/agent-detail/?id=opc' },
]

const DEFAULT_ATF_SOFTWARE = [
  { title: '会议预约', imageUrl: '/images/aspace-one/app-control.jpg', href: '/aspace-one/' },
  { title: '访客管理', imageUrl: '/images/aspace-one/app-visitor.jpg', href: '/aspace-one/' },
  { title: '资产管理', imageUrl: '/images/aspace-one/app-resource.jpg', href: '/aspace-one/' },
  { title: '能源运维', imageUrl: '/images/aspace-one/app-energy.jpg', href: '/aspace-one/' },
  { title: '信息发布', imageUrl: '/images/aspace-one/app-poster.jpg', href: '/aspace-one/' },
  { title: '招商运营', imageUrl: '/images/aspace-one/showcase-building.jpg', href: '/aspace-one/' },
]

const DEFAULT_ATF_HARDWARE = [
  { title: '中控屏', imageUrl: '/images/hardware/control-screen.jpg', href: '/hardware/product/?id=control-screen' },
  { title: '电子桌牌', imageUrl: '/images/hardware/e-table-sign.jpg', href: '/hardware/product/?id=e-table-sign' },
  { title: '环境传感', imageUrl: '/images/hardware/sensor.jpg', href: '/hardware/product/?id=sensor' },
  { title: '开关与网关', imageUrl: '/images/hardware/switch-control.jpg', href: '/hardware/product/?id=switch-control' },
  { title: 'RFID 设备', imageUrl: '/images/hardware/aap.jpg', href: '/hardware/products/' },
  { title: '信息发布终端', imageUrl: '/images/hardware/eink-frame.jpg', href: '/hardware/product/?id=eink-frame' },
]

const DEFAULT_ATF_PLATFORM = [
  { title: 'Aspace One 应用平台', description: '一个入口，汇聚业务应用', imageUrl: '/images/home-atf/atf-07.webp' },
  { title: 'IoT 设备连接与联动', description: '连接设备，执行场景联动', imageUrl: '/images/home-atf/atf-08.webp' },
  { title: '数字孪生', description: '在空间中查看设备与数据', imageUrl: '/images/home-atf/atf-09.webp' },
]

const ATF_SPARK = '<span class="atf-spark" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 2.2 13.7 8.8 20.4 10.4 13.7 12.1 12 18.8 10.3 12.1 3.6 10.4 10.3 8.8 12 2.2Zm7.2 11.1 1 3.7 3.7 1-3.7 1-1 3.7-1-3.7-3.7-1 3.7-1 1-3.7Z"/></svg></span>'

function renderAtfRailLink(labelPath, urlPath, label, url, { editable }) {
  if (editable) {
    return `<div class="atf-rail__more">${textNode(labelPath, label, { editable, tag: 'span', className: 'atf-link', placeholder: '链接文案' })}${textNode(urlPath, url, { editable, tag: 'small', className: 'admin-home-href', placeholder: '跳转链接' })}</div>`
  }
  return `<a class="atf-link" href="${esc(url)}">${esc(label)}</a>`
}

export function renderHomeAgentsSection(agents = {}, { editable = false, sectionId = 'home-visual-agents' } = {}) {
  const title = agents.title || '您的空间需要什么，这里一目了然'
  const subtitle = agents.subtitle || '软件、硬件与平台，按业务需求灵活组合。'
  const moreLabel = agents.moreLabel || '探索全部产品 ↗'
  const moreUrl = agents.moreUrl || '/hardware/products/'
  const blockTitle = agents.blockTitle || '空间智能体'
  const blockSubtitle = agents.blockSubtitle || '理解需求，协同完成工作'
  const blockMoreLabel = agents.blockMoreLabel || '探索智能体 →'
  const blockMoreUrl = agents.blockMoreUrl || '/agents/'
  const cards = Array.isArray(agents.cards) && agents.cards.length ? agents.cards : DEFAULT_ATF_CARDS
  const softwareTitle = agents.softwareTitle || '系统软件'
  const softwareMoreLabel = agents.softwareMoreLabel || '探索软件 →'
  const softwareMoreUrl = agents.softwareMoreUrl || '/aspace-one/'
  const software = Array.isArray(agents.software) && agents.software.length ? agents.software : DEFAULT_ATF_SOFTWARE
  const hardwareTitle = agents.hardwareTitle || '智能硬件'
  const hardwareMoreLabel = agents.hardwareMoreLabel || '探索硬件 →'
  const hardwareMoreUrl = agents.hardwareMoreUrl || '/hardware/'
  const hardware = Array.isArray(agents.hardware) && agents.hardware.length ? agents.hardware : DEFAULT_ATF_HARDWARE
  const platformTitle = agents.platformTitle || '连接这些产品，让空间协同运行'
  const platform = Array.isArray(agents.platform) && agents.platform.length ? agents.platform : DEFAULT_ATF_PLATFORM
  const bottomText = agents.bottomText || '产品连接之后，AI 如何让工作自动完成？'
  const bottomLabel = agents.bottomLabel || '探索空间智能体 →'
  const bottomUrl = agents.bottomUrl || '/agents/'

  return `
    <section id="${esc(sectionId)}" class="atf-overview scroll-mt-24" data-home-section="agents" aria-labelledby="${esc(sectionId)}-title">
      ${sectionChrome('agents', '产品与方案总览', { editable })}
      <div class="atf-wrap">
        <header class="atf-header">
          <div>
            ${textNode('agents.title', title, { editable, tag: 'h2', placeholder: '主标题' }).replace('<h2 ', `<h2 id="${esc(sectionId)}-title" `)}
            ${textNode('agents.subtitle', subtitle, { editable, tag: 'p', className: 'atf-subtitle', multiline: true, placeholder: '说明' })}
          </div>
          ${editable
            ? `<div class="atf-header__more">${textNode('agents.moreLabel', moreLabel, { editable, tag: 'span', className: 'atf-link', placeholder: '右侧链接文案' })}${textNode('agents.moreUrl', moreUrl, { editable, tag: 'small', className: 'admin-home-href', placeholder: '/hardware/products/' })}</div>`
            : `<a class="atf-link" href="${esc(moreUrl)}">${esc(moreLabel)}</a>`}
        </header>

        <div class="atf-band atf-band--agents">
          <div class="atf-rail">
            ${textNode('agents.blockTitle', blockTitle, { editable, tag: 'h3', placeholder: '区块标题' })}
            ${textNode('agents.blockSubtitle', blockSubtitle, { editable, tag: 'p', multiline: true, placeholder: '区块说明' })}
            ${renderAtfRailLink('agents.blockMoreLabel', 'agents.blockMoreUrl', blockMoreLabel, blockMoreUrl, { editable })}
          </div>
          <div class="atf-agent-grid">
            ${cards.map((card, index) => {
              const href = card.href || '/agents/'
              const body = `
                ${ATF_SPARK}
                <div class="atf-agent-copy">
                  ${textNode(`agents.cards.${index}.title`, card.title || '', { editable, tag: 'strong', placeholder: '智能体名称' })}
                  ${textNode(`agents.cards.${index}.description`, card.description || '', { editable, tag: 'span', placeholder: '一句话说明' })}
                  ${editable ? textNode(`agents.cards.${index}.href`, href, { editable, tag: 'small', className: 'admin-home-href', placeholder: '跳转链接' }) : ''}
                </div>`
              if (editable) return `<article class="atf-agent-item">${body}</article>`
              return `<a class="atf-agent-item" href="${esc(href)}">${body}</a>`
            }).join('')}
          </div>
        </div>

        <div class="atf-band atf-band--software">
          <div class="atf-rail">
            ${textNode('agents.softwareTitle', softwareTitle, { editable, tag: 'h3', placeholder: '系统软件' })}
            ${renderAtfRailLink('agents.softwareMoreLabel', 'agents.softwareMoreUrl', softwareMoreLabel, softwareMoreUrl, { editable })}
          </div>
          <div class="atf-thumb-row">
            ${software.map((item, index) => {
              const href = item.href || '/aspace-one/'
              const media = imgNode(`agents.software.${index}.imageUrl`, item.imageUrl || DEFAULT_ATF_SOFTWARE[index]?.imageUrl || '', {
                editable,
                width: 320,
                height: 200,
                alt: item.title || '系统软件',
                loading: 'lazy',
                className: 'atf-thumb__media',
              })
              const body = `
                ${media}
                ${textNode(`agents.software.${index}.title`, item.title || '', { editable, tag: 'span', className: 'atf-thumb__label', placeholder: '软件名称' })}
                ${editable ? textNode(`agents.software.${index}.href`, href, { editable, tag: 'small', className: 'admin-home-href', placeholder: '跳转链接' }) : ''}`
              if (editable) return `<article class="atf-thumb">${body}</article>`
              return `<a class="atf-thumb" href="${esc(href)}">${body}</a>`
            }).join('')}
          </div>
        </div>

        <div class="atf-band atf-band--hardware">
          <div class="atf-rail">
            ${textNode('agents.hardwareTitle', hardwareTitle, { editable, tag: 'h3', placeholder: '智能硬件' })}
            ${renderAtfRailLink('agents.hardwareMoreLabel', 'agents.hardwareMoreUrl', hardwareMoreLabel, hardwareMoreUrl, { editable })}
          </div>
          <div class="atf-thumb-row">
            ${hardware.map((item, index) => {
              const href = item.href || '/hardware/'
              const media = imgNode(`agents.hardware.${index}.imageUrl`, item.imageUrl || DEFAULT_ATF_HARDWARE[index]?.imageUrl || '', {
                editable,
                width: 320,
                height: 200,
                alt: item.title || '智能硬件',
                loading: 'lazy',
                className: 'atf-thumb__media',
              })
              const body = `
                ${media}
                ${textNode(`agents.hardware.${index}.title`, item.title || '', { editable, tag: 'span', className: 'atf-thumb__label', placeholder: '硬件名称' })}
                ${editable ? textNode(`agents.hardware.${index}.href`, href, { editable, tag: 'small', className: 'admin-home-href', placeholder: '跳转链接' }) : ''}`
              if (editable) return `<article class="atf-thumb">${body}</article>`
              return `<a class="atf-thumb" href="${esc(href)}">${body}</a>`
            }).join('')}
          </div>
        </div>

        <div class="atf-platform">
          ${textNode('agents.platformTitle', platformTitle, { editable, tag: 'h3', placeholder: '平台条标题' })}
          ${platform.map((item, index) => `
            <div class="atf-platform-item">
              ${imgNode(`agents.platform.${index}.imageUrl`, item.imageUrl || `/images/home-atf/atf-0${index + 7}.webp`, {
                editable,
                width: 320,
                height: 180,
                alt: item.title || '平台能力',
                loading: 'lazy',
                className: 'atf-platform__media',
              })}
              <div class="atf-platform-copy">
                ${textNode(`agents.platform.${index}.title`, item.title || '', { editable, tag: 'strong', placeholder: '能力名称' })}
                ${textNode(`agents.platform.${index}.description`, item.description || '', { editable, tag: 'span', placeholder: '能力说明' })}
              </div>
            </div>`).join('')}
        </div>
        <p class="atf-bottom">
          ${textNode('agents.bottomText', bottomText, { editable, tag: 'span', placeholder: '底部说明' })}
          ${editable
            ? `${textNode('agents.bottomLabel', bottomLabel, { editable, tag: 'span', className: 'atf-link', placeholder: '底部链接文案' })}${textNode('agents.bottomUrl', bottomUrl, { editable, tag: 'small', className: 'admin-home-href', placeholder: '/agents/' })}`
            : ` <a class="atf-link" href="${esc(bottomUrl)}">${esc(bottomLabel)}</a>`}
        </p>
      </div>
    </section>`
}

function renderAgents(agents = {}, { editable }) {
  return renderHomeAgentsSection(agents, { editable, sectionId: editable ? 'home-visual-agents' : 'upgrade' })
}

function renderSolutions(solutions = {}, { editable }) {
  const items = Array.isArray(solutions.items) && solutions.items.length
    ? solutions.items
    : [{ title: '', description: '', chip: '', imageUrl: '' }]
  return `
    <section class="sm-sol-carousel-section" data-home-section="solutions" id="home-visual-solutions">
      ${sectionChrome('solutions', '产品与方案', { editable, addLabel: '+ 新增方案卡' })}
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sm-section-intro">
          ${textNode('solutions.eyebrow', solutions.eyebrow || '', { editable, tag: 'strong', className: 'sm-kicker sm-kicker--ink', placeholder: '眉题' })}
          ${textNode('solutions.title', solutions.title || '', { editable, tag: 'h2', placeholder: '区块标题' })}
          ${textNode('solutions.subtitle', solutions.subtitle || '', { editable, tag: 'p', multiline: true, placeholder: '区块说明' })}
          <span class="sm-btn sm-btn--ghost">${textNode('solutions.moreLabel', solutions.moreLabel || '查看全部方案', { editable, tag: 'span', placeholder: '更多按钮' })}</span>
          ${editable ? textNode('solutions.moreUrl', solutions.moreUrl || '', { editable, tag: 'small', className: 'admin-home-href', placeholder: '/solutions/' }) : ''}
        </div>
        <div class="sm-sol-carousel__track admin-home-sol-track">
          ${items.map((item, index) => `
            <article class="sm-sol-card">
              <div class="sm-sol-card__media" style="background-image:url('${esc(item.imageUrl || '/images/home-agents/meeting.jpg')}')">
                ${editable ? `<button type="button" class="hpi-edit-bg" data-edit-image="solutions.items.${index}.imageUrl" data-edit-image-url="${esc(item.imageUrl || '')}" title="更换封面">更换封面</button>` : ''}
                ${textNode(`solutions.items.${index}.chip`, item.chip || '', { editable, tag: 'span', className: 'sm-sol-card__badge', placeholder: '角标' })}
              </div>
              <div class="sm-sol-card__body">
                ${textNode(`solutions.items.${index}.title`, item.title || '', { editable, tag: 'h3', placeholder: '标题' })}
                ${textNode(`solutions.items.${index}.description`, item.description || '', { editable, tag: 'p', multiline: true, placeholder: '说明' })}
                ${editable ? textNode(`solutions.items.${index}.tags`, Array.isArray(item.tags) ? item.tags.join('，') : (item.tags || ''), { editable, tag: 'small', className: 'admin-home-href', placeholder: '标签，逗号分隔' }) : ''}
                ${editable ? textNode(`solutions.items.${index}.linkUrl`, item.linkUrl || '', { editable, tag: 'small', className: 'admin-home-href', placeholder: '详情链接' }) : ''}
                ${editable ? itemTools('solutions', index, items.length) : ''}
              </div>
            </article>`).join('')}
        </div>
      </div>
    </section>`
}

function renderNews(news = {}, { editable }) {
  const items = Array.isArray(news.items) && news.items.length
    ? news.items
    : [{ title: '', description: '', category: '', imageUrl: '' }]
  return `
    <section class="sm-news-section" data-home-section="news" id="home-visual-news">
      ${sectionChrome('news', '新闻动态', { editable, addLabel: '+ 新增新闻' })}
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sm-section-intro">
          ${textNode('news.kicker', news.kicker || '', { editable, tag: 'strong', className: 'sm-kicker sm-kicker--blue', placeholder: '眉题' })}
          ${textNode('news.title', news.title || '', { editable, tag: 'h2', placeholder: '区块标题' })}
          ${textNode('news.subtitle', news.subtitle || '', { editable, tag: 'p', multiline: true, placeholder: '区块说明' })}
        </div>
        <div class="sm-news-grid">
          ${items.map((item, index) => `
            <a class="sm-news-card" href="${esc(item.linkUrl || '/news/')}">
              <div class="sm-news-card__media" style="background-image:url('${esc(item.imageUrl || '/images/home-advantages/advantage-ai-agent.webp')}')">
                ${editable ? `<button type="button" class="hpi-edit-bg" data-edit-image="news.items.${index}.imageUrl" data-edit-image-url="${esc(item.imageUrl || '')}" title="更换封面">更换封面</button>` : ''}
              </div>
              ${textNode(`news.items.${index}.category`, item.category || '', { editable, tag: 'strong', className: 'sm-kicker', placeholder: '分类' })}
              ${textNode(`news.items.${index}.title`, item.title || '', { editable, tag: 'h3', placeholder: '新闻标题' })}
              ${textNode(`news.items.${index}.description`, item.description || '', { editable, tag: 'p', multiline: true, placeholder: '摘要' })}
              ${editable ? textNode(`news.items.${index}.linkUrl`, item.linkUrl || '', { editable, tag: 'small', className: 'admin-home-href', placeholder: '详情链接' }) : ''}
              ${editable ? itemTools('news', index, items.length) : ''}
            </a>`).join('')}
        </div>
        <p class="sm-news-more">
          <a class="sm-text-link sm-text-link--blue" href="${esc(news.moreUrl || '/news/')}">
            ${textNode('news.moreLabel', news.moreLabel || '进入新闻中心', { editable, tag: 'span', placeholder: '更多文案' })}
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
          ${editable ? textNode('news.moreUrl', news.moreUrl || '', { editable, tag: 'small', className: 'admin-home-href', placeholder: '/news/' }) : ''}
        </p>
      </div>
    </section>`
}

function renderPitch(pitch = {}, { editable }) {
  const items = Array.isArray(pitch.items) && pitch.items.length
    ? pitch.items
    : [{ kicker: '', title: '', variant: 'photo', imageUrl: '' }]
  const titleNode = editable
    ? textNode('pitch.title', pitch.title || '', { editable, tag: 'h2', multiline: true, placeholder: '主标题' }).replace('<h2 ', '<h2 id="home-visual-pitch-title" ')
    : `<h2 id="home-visual-pitch-title">${esc(pitch.title || '').replace(/\n/g, '<br>')}</h2>`
  return `
    <section class="sm-pitch" data-home-section="pitch" id="home-visual-pitch" aria-labelledby="home-visual-pitch-title">
      ${sectionChrome('pitch', '探索安托未来', { editable, addLabel: '+ 新增宫格' })}
      <div class="max-w-max-width mx-auto px-margin-desktop sm-pitch__inner">
        <div class="sm-pitch__head">
          <div>
            ${textNode('pitch.label', pitch.label || '', { editable, tag: 'strong', className: 'sm-pitch__label', placeholder: '小标题' })}
            ${titleNode}
          </div>
        </div>
        <div class="sm-pitch__grid">
          ${items.map((item, index) => {
            const variant = item.variant === 'wave' || item.variant === 'mint' ? item.variant : 'photo'
            const bg = variant === 'photo' && item.imageUrl ? ` style="background-image:url('${esc(item.imageUrl)}')"` : ''
            return `
            <div class="sm-pitch__tile sm-pitch__tile--${variant} admin-home-pitch-tile"${bg}>
              ${editable && variant === 'photo' ? `<button type="button" class="hpi-edit-bg" data-edit-image="pitch.items.${index}.imageUrl" data-edit-image-url="${esc(item.imageUrl || '')}" title="更换图片">换图</button>` : ''}
              ${textNode(`pitch.items.${index}.kicker`, item.kicker || '', { editable, tag: 'span', placeholder: '角标' })}
              ${textNode(`pitch.items.${index}.title`, item.title || '', { editable, tag: 'strong', placeholder: '标题' })}
              ${textNode(`pitch.items.${index}.moreLabel`, item.moreLabel || '阅读更多信息', { editable, tag: 'em', placeholder: '更多文案' })}
              ${editable ? `
                <label class="admin-home-pitch-meta">样式
                  <select data-home-field="pitch.items.${index}.variant">
                    <option value="photo"${variant === 'photo' ? ' selected' : ''}>图片卡</option>
                    <option value="wave"${variant === 'wave' ? ' selected' : ''}>波浪卡</option>
                    <option value="mint"${variant === 'mint' ? ' selected' : ''}>浅色卡</option>
                  </select>
                </label>
                <label class="admin-home-pitch-meta"><input type="checkbox" data-home-field="pitch.items.${index}.openDemo" data-home-type="checkbox"${item.openDemo ? ' checked' : ''} /> 打开预约演示弹窗</label>
                ${textNode(`pitch.items.${index}.href`, item.href || '', { editable, tag: 'small', className: 'admin-home-href', placeholder: '跳转链接' })}
                ${itemTools('pitch', index, items.length)}
              ` : ''}
            </div>`
          }).join('')}
        </div>
      </div>
    </section>`
}

export function renderHomePage(content = {}, { editable = false, heroIndex = 0 } = {}) {
  return `
    <div class="admin-home-page">
      ${renderHero(content.heroSlides, { editable, activeIndex: heroIndex })}
      ${renderAgents(content.agents, { editable })}
      ${renderSolutions(content.solutions, { editable })}
      ${renderNews(content.news, { editable })}
      ${renderPitch(content.pitch, { editable })}
    </div>`
}
