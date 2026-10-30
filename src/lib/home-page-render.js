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

function renderHero(slides, { editable }) {
  const list = Array.isArray(slides) && slides.length ? slides : [{ title: '', description: '', background: '' }]
  return `
    <section class="sm-hero ha-hero admin-home-hero" data-home-section="hero" id="home-visual-hero" aria-label="首屏轮播">
      ${sectionChrome('hero', '首屏轮播', { editable, addLabel: '+ 新增一屏' })}
      <div class="admin-home-hero__stack">
        ${list.map((slide, index) => `
          <article class="sm-hero__slide is-active admin-home-hero__slide" data-home-hero-slide="${index}">
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

function renderBanner(banner = {}, { editable }) {
  const image = banner.imageUrl || '/images/home-agents/space.jpg'
  return `
    <section class="sm-mini-banner" data-home-section="banner" id="home-visual-banner">
      ${sectionChrome('banner', '中部推广条', { editable })}
      <div class="max-w-max-width mx-auto px-margin-desktop sm-mini-banner__inner">
        <div class="sm-mini-banner__media" style="background-image:url('${esc(image)}')">
          ${editable ? `<button type="button" class="hpi-edit-bg" data-edit-image="banner.imageUrl" data-edit-image-url="${esc(banner.imageUrl || '')}" title="更换配图">更换配图</button>` : ''}
        </div>
        <div class="sm-mini-banner__text">
          ${textNode('banner.title', banner.title || '', { editable, tag: 'h3', placeholder: '标题' })}
          ${textNode('banner.subtitle', banner.subtitle || '', { editable, tag: 'p', multiline: true, placeholder: '说明' })}
        </div>
        <span class="sm-btn sm-btn--outline sm-btn--dark">${textNode('banner.ctaLabel', banner.ctaLabel || '查看', { editable, tag: 'span', placeholder: '按钮文字' })}</span>
        ${editable ? textNode('banner.ctaUrl', banner.ctaUrl || '', { editable, tag: 'small', className: 'admin-home-href', placeholder: '跳转链接 /agents/ 或 #demo' }) : ''}
      </div>
    </section>`
}

function renderAgents(agents = {}, { editable }) {
  const kicker = agents.kicker || '安托未来 · 产品与方案'
  const title = agents.title || '您的空间需要什么，这里一目了然'
  const subtitle = agents.subtitle || '软件、硬件与平台，按业务需求灵活组合。'
  return `
    <section id="home-visual-agents" class="atf-overview" data-home-section="agents" aria-labelledby="home-visual-atf-title">
      ${sectionChrome('agents', '产品与方案总览', { editable })}
      <div class="atf-wrap">
        <header class="atf-header">
          <div>
            ${textNode('agents.kicker', kicker, { editable, tag: 'p', className: 'atf-eyebrow', placeholder: '眉题' })}
            ${textNode('agents.title', title, { editable, tag: 'h2', className: '', placeholder: '主标题' }).replace('<h2 ', '<h2 id="home-visual-atf-title" ')}
            ${textNode('agents.subtitle', subtitle, { editable, tag: 'p', className: 'atf-subtitle', multiline: true, placeholder: '说明' })}
          </div>
          <a class="atf-link" href="/hardware/products/">探索全部产品 ↗</a>
        </header>
        ${editable ? '<p class="admin-home-agents-note">下方六宫格与平台条为设计定稿静态内容；仅眉题/标题/说明可在此编辑。</p>' : ''}
        <div class="atf-grid">
          <a class="atf-card" href="/solutions/?id=meeting"><div class="atf-card-head"><h3>会议与接待</h3><p>预约、签到、设备准备，一起就绪</p></div><img src="/images/home-atf/atf-01.webp" alt="会议与接待产品和软件示意图" loading="lazy"><div class="atf-card-foot"><span>会议预约 / 访客管理 / 中控屏 / 电子桌牌</span><span aria-hidden="true">→</span></div></a>
          <a class="atf-card" href="/solutions/?id=building"><div class="atf-card-head"><h3>空间与设备控制</h3><p>灯光、空调与环境，按需联动</p></div><img src="/images/home-atf/atf-02.webp" alt="空间与设备控制产品和软件示意图" loading="lazy"><div class="atf-card-foot"><span>场景联动 / 环境监测 / 智能开关 / 空调网关</span><span aria-hidden="true">→</span></div></a>
          <a class="atf-card" href="/solutions/?id=security"><div class="atf-card-head"><h3>RFID 资产管理</h3><p>资产在哪里、有没有，一目了然</p></div><img src="/images/home-atf/atf-03.webp" alt="RFID 资产管理产品和软件示意图" loading="lazy"><div class="atf-card-foot"><span>资产台账 / 智能盘点 / RFID读写器 / 电子标签</span><span aria-hidden="true">→</span></div></a>
          <a class="atf-card" href="/solutions/?id=energy"><div class="atf-card-head"><h3>能源与设备运维</h3><p>看清能耗，及时发现与处理异常</p></div><img src="/images/home-atf/atf-04.webp" alt="能源与设备运维产品和软件示意图" loading="lazy"><div class="atf-card-foot"><span>能耗分析 / 设备监测 / 工单巡检</span><span aria-hidden="true">→</span></div></a>
          <a class="atf-card" href="/hardware/products/"><div class="atf-card-head"><h3>信息发布与展示</h3><p>从会议投屏到企业宣传，统一管理</p></div><img src="/images/home-atf/atf-05.webp" alt="信息发布与展示产品和软件示意图" loading="lazy"><div class="atf-card-foot"><span>内容发布 / 无线投屏 / 电子相框 / 发布终端</span><span aria-hidden="true">→</span></div></a>
          <a class="atf-card" href="/solutions/?id=commercial"><div class="atf-card-head"><h3>招商与空间运营</h3><p>从招商签约到交付入住，流程贯通</p></div><img src="/images/home-atf/atf-06.webp" alt="招商与空间运营产品和软件示意图" loading="lazy"><div class="atf-card-foot"><span>招商管理 / 合同管理 / 租户服务</span><span aria-hidden="true">→</span></div></a>
        </div>
        <div class="atf-platform">
          <h3>连接这些产品，让空间协同运行</h3>
          <div class="atf-platform-item"><img src="/images/home-atf/atf-07.webp" alt="应用平台电脑界面" loading="lazy"><div class="atf-platform-copy"><strong>Aspace One 应用平台</strong><span>一个入口，汇聚业务应用</span></div></div>
          <div class="atf-platform-item"><img src="/images/home-atf/atf-08.webp" alt="物联网智能设备" loading="lazy"><div class="atf-platform-copy"><strong>IoT 设备连接与联动</strong><span>连接设备，执行场景联动</span></div></div>
          <div class="atf-platform-item"><img src="/images/home-atf/atf-09.webp" alt="数字孪生楼层模型" loading="lazy"><div class="atf-platform-copy"><strong>数字孪生</strong><span>在空间中查看设备与数据</span></div></div>
        </div>
        <p class="atf-bottom">产品连接之后，AI 如何让工作自动完成？ <a class="atf-link" href="/agents/">探索空间智能体 →</a></p>
      </div>
    </section>`
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
            <article class="sm-news-card">
              <div class="sm-news-card__media" style="background-image:url('${esc(item.imageUrl || '/images/home-advantages/advantage-ai-agent.webp')}')">
                ${editable ? `<button type="button" class="hpi-edit-bg" data-edit-image="news.items.${index}.imageUrl" data-edit-image-url="${esc(item.imageUrl || '')}" title="更换封面">更换封面</button>` : ''}
              </div>
              ${textNode(`news.items.${index}.category`, item.category || '', { editable, tag: 'strong', className: 'sm-kicker', placeholder: '分类' })}
              ${textNode(`news.items.${index}.title`, item.title || '', { editable, tag: 'h3', placeholder: '标题' })}
              ${textNode(`news.items.${index}.description`, item.description || '', { editable, tag: 'p', multiline: true, placeholder: '摘要' })}
              ${editable ? textNode(`news.items.${index}.linkUrl`, item.linkUrl || '', { editable, tag: 'small', className: 'admin-home-href', placeholder: '详情链接' }) : ''}
              ${editable ? itemTools('news', index, items.length) : ''}
            </article>`).join('')}
        </div>
        <p class="sm-news-more">
          <span class="sm-text-link sm-text-link--blue">${textNode('news.moreLabel', news.moreLabel || '进入新闻中心', { editable, tag: 'span', placeholder: '更多按钮' })}</span>
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

export function renderHomePage(content = {}, { editable = false } = {}) {
  return `
    <div class="admin-home-page">
      ${renderHero(content.heroSlides, { editable })}
      ${renderBanner(content.banner, { editable })}
      ${renderAgents(content.agents, { editable })}
      ${renderSolutions(content.solutions, { editable })}
      ${renderNews(content.news, { editable })}
      ${renderPitch(content.pitch, { editable })}
    </div>`
}
