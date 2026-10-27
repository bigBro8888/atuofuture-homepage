/** 官网首页可视化预览渲染（后台编辑用） */

import { esc, textNode, imgNode } from './vedit-nodes.js'

function listTools(kind, index, total) {
  return `
    <span class="admin-home-visual__tools">
      <button type="button" data-home-visual-move="-1" data-home-visual-kind="${esc(kind)}" data-home-visual-index="${index}" ${index === 0 ? 'disabled' : ''}>上移</button>
      <button type="button" data-home-visual-move="1" data-home-visual-kind="${esc(kind)}" data-home-visual-index="${index}" ${index >= total - 1 ? 'disabled' : ''}>下移</button>
      <button type="button" data-home-visual-remove data-home-visual-kind="${esc(kind)}" data-home-visual-index="${index}" ${total <= 1 ? 'disabled' : ''}>删除</button>
    </span>`
}

function renderHero(slides, { editable }) {
  const list = Array.isArray(slides) && slides.length ? slides : [{ title: '', description: '', background: '' }]
  return `
    <section class="admin-home-visual__section" data-home-section="hero" id="home-visual-hero">
      <header class="admin-home-visual__head">
        <div>
          <strong>首屏轮播</strong>
          <span>点文字改文案，点图片换背景；可增删与排序。</span>
        </div>
        ${editable ? '<button type="button" class="admin-add-slide" data-home-visual-add="hero">+ 新增一屏</button>' : ''}
      </header>
      <div class="admin-home-visual__hero-list">
        ${list.map((slide, index) => `
          <article class="admin-home-visual__hero-card">
            <div class="admin-home-visual__hero-media" style="background-image:url('${esc(slide.background || '/images/home-advantages/advantage-ai-agent.webp')}')">
              ${editable ? `<button type="button" class="hpi-edit-bg" data-edit-image="heroSlides.${index}.background" data-edit-image-url="${esc(slide.background || '')}" title="更换背景">更换背景</button>` : ''}
            </div>
            <div class="admin-home-visual__hero-copy">
              <em>第 ${index + 1} 屏</em>
              ${textNode(`heroSlides.${index}.label`, slide.label || '', { editable, tag: 'strong', className: 'sm-kicker', placeholder: '角标（可空）' })}
              ${textNode(`heroSlides.${index}.title`, slide.title || '', { editable, tag: 'h2', placeholder: '主标题' })}
              ${textNode(`heroSlides.${index}.description`, slide.description || '', { editable, tag: 'p', multiline: true, placeholder: '说明文案' })}
              <div class="admin-home-visual__hero-actions">
                <span class="sm-btn sm-btn--primary">${textNode(`heroSlides.${index}.actionLabel`, slide.actionLabel || '了解更多', { editable, tag: 'span', placeholder: '按钮文字' })}</span>
                ${editable ? textNode(`heroSlides.${index}.actionHref`, slide.actionHref || '', { editable, tag: 'small', className: 'admin-home-visual__href', placeholder: '按钮链接 /agents/' }) : ''}
              </div>
              ${editable ? listTools('hero', index, list.length) : ''}
            </div>
          </article>`).join('')}
      </div>
    </section>`
}

function renderBanner(banner = {}, { editable }) {
  const image = banner.imageUrl || '/images/home-agents/space.jpg'
  return `
    <section class="admin-home-visual__section sm-mini-banner" data-home-section="banner" id="home-visual-banner">
      <header class="admin-home-visual__head">
        <div><strong>中部推广条</strong><span>首屏下方咨询横条</span></div>
      </header>
      <div class="admin-home-visual__banner">
        <div class="admin-home-visual__banner-media" style="background-image:url('${esc(image)}')">
          ${editable ? `<button type="button" class="hpi-edit-bg" data-edit-image="banner.imageUrl" data-edit-image-url="${esc(banner.imageUrl || '')}" title="更换配图">更换配图</button>` : ''}
        </div>
        <div class="admin-home-visual__banner-copy">
          ${textNode('banner.title', banner.title || '', { editable, tag: 'h3', placeholder: '标题' })}
          ${textNode('banner.subtitle', banner.subtitle || '', { editable, tag: 'p', multiline: true, placeholder: '说明' })}
          <span class="sm-btn sm-btn--outline sm-btn--dark">${textNode('banner.ctaLabel', banner.ctaLabel || '查看', { editable, tag: 'span', placeholder: '按钮文字' })}</span>
          ${editable ? textNode('banner.ctaUrl', banner.ctaUrl || '', { editable, tag: 'small', className: 'admin-home-visual__href', placeholder: '跳转链接 /agents/ 或 #demo' }) : ''}
        </div>
      </div>
    </section>`
}

function renderAgents(agents = {}, { editable }) {
  const items = Array.isArray(agents.items) && agents.items.length ? agents.items : [{ name: '', sceneTitle: '', sceneCaption: '', imageUrl: '' }]
  return `
    <section class="admin-home-visual__section" data-home-section="agents" id="home-visual-agents">
      <header class="admin-home-visual__head">
        <div>
          ${textNode('agents.kicker', agents.kicker || '', { editable, tag: 'strong', className: 'sm-kicker', placeholder: '眉题' })}
          ${textNode('agents.title', agents.title || '', { editable, tag: 'h2', placeholder: '主标题' })}
          ${textNode('agents.subtitle', agents.subtitle || '', { editable, tag: 'p', multiline: true, placeholder: '说明' })}
        </div>
        ${editable ? '<button type="button" class="admin-add-slide" data-home-visual-add="agents">+ 新增智能体</button>' : ''}
      </header>
      <div class="admin-home-visual__agent-grid">
        ${items.map((item, index) => `
          <article class="admin-home-visual__agent-card">
            ${imgNode(`agents.items.${index}.imageUrl`, item.imageUrl || '/images/home-agents/space.jpg', {
              editable,
              width: 2100,
              height: 900,
              alt: item.name || '智能体',
              className: 'admin-home-visual__agent-img',
            })}
            <div class="admin-home-visual__agent-copy">
              ${textNode(`agents.items.${index}.name`, item.name || '', { editable, tag: 'h3', placeholder: '底部名称' })}
              ${textNode(`agents.items.${index}.sceneTitle`, item.sceneTitle || '', { editable, tag: 'strong', placeholder: '画面标题' })}
              ${textNode(`agents.items.${index}.sceneCaption`, item.sceneCaption || '', { editable, tag: 'span', placeholder: '画面说明' })}
              ${editable ? textNode(`agents.items.${index}.id`, item.id || '', { editable, tag: 'small', className: 'admin-home-visual__href', placeholder: '内部编号 space' }) : ''}
              ${editable ? listTools('agents', index, items.length) : ''}
            </div>
          </article>`).join('')}
      </div>
    </section>`
}

function renderSolutions(solutions = {}, { editable }) {
  const items = Array.isArray(solutions.items) && solutions.items.length ? solutions.items : [{ title: '', description: '', chip: '', imageUrl: '' }]
  return `
    <section class="admin-home-visual__section" data-home-section="solutions" id="home-visual-solutions">
      <header class="admin-home-visual__head">
        <div>
          ${textNode('solutions.eyebrow', solutions.eyebrow || '', { editable, tag: 'strong', className: 'sm-kicker', placeholder: '眉题' })}
          ${textNode('solutions.title', solutions.title || '', { editable, tag: 'h2', placeholder: '区块标题' })}
          ${textNode('solutions.subtitle', solutions.subtitle || '', { editable, tag: 'p', multiline: true, placeholder: '区块说明' })}
          <div class="admin-home-visual__more">
            <span class="sm-btn sm-btn--ghost">${textNode('solutions.moreLabel', solutions.moreLabel || '查看全部', { editable, tag: 'span', placeholder: '更多按钮' })}</span>
            ${editable ? textNode('solutions.moreUrl', solutions.moreUrl || '', { editable, tag: 'small', className: 'admin-home-visual__href', placeholder: '/solutions/' }) : ''}
          </div>
        </div>
        ${editable ? '<button type="button" class="admin-add-slide" data-home-visual-add="solutions">+ 新增方案卡</button>' : ''}
      </header>
      <div class="admin-home-visual__sol-grid">
        ${items.map((item, index) => `
          <article class="admin-home-visual__sol-card">
            <div class="admin-home-visual__sol-media" style="background-image:url('${esc(item.imageUrl || '/images/home-agents/meeting.jpg')}')">
              ${editable ? `<button type="button" class="hpi-edit-bg" data-edit-image="solutions.items.${index}.imageUrl" data-edit-image-url="${esc(item.imageUrl || '')}" title="更换封面">更换封面</button>` : ''}
              ${textNode(`solutions.items.${index}.chip`, item.chip || '', { editable, tag: 'span', className: 'sm-sol-card__badge', placeholder: '角标' })}
            </div>
            <div class="admin-home-visual__sol-body">
              ${textNode(`solutions.items.${index}.title`, item.title || '', { editable, tag: 'h3', placeholder: '标题' })}
              ${textNode(`solutions.items.${index}.description`, item.description || '', { editable, tag: 'p', multiline: true, placeholder: '说明' })}
              ${editable ? textNode(`solutions.items.${index}.tags`, Array.isArray(item.tags) ? item.tags.join('，') : (item.tags || ''), { editable, tag: 'small', className: 'admin-home-visual__href', placeholder: '标签，逗号分隔' }) : ''}
              ${editable ? textNode(`solutions.items.${index}.linkUrl`, item.linkUrl || '', { editable, tag: 'small', className: 'admin-home-visual__href', placeholder: '详情链接' }) : ''}
              ${editable ? listTools('solutions', index, items.length) : ''}
            </div>
          </article>`).join('')}
      </div>
    </section>`
}

function renderNews(news = {}, { editable }) {
  const items = Array.isArray(news.items) && news.items.length ? news.items : [{ title: '', description: '', category: '', imageUrl: '' }]
  return `
    <section class="admin-home-visual__section" data-home-section="news" id="home-visual-news">
      <header class="admin-home-visual__head">
        <div>
          ${textNode('news.kicker', news.kicker || '', { editable, tag: 'strong', className: 'sm-kicker sm-kicker--blue', placeholder: '眉题' })}
          ${textNode('news.title', news.title || '', { editable, tag: 'h2', placeholder: '区块标题' })}
          ${textNode('news.subtitle', news.subtitle || '', { editable, tag: 'p', multiline: true, placeholder: '区块说明' })}
          <div class="admin-home-visual__more">
            <span class="sm-text-link sm-text-link--blue">${textNode('news.moreLabel', news.moreLabel || '进入新闻中心', { editable, tag: 'span', placeholder: '更多按钮' })}</span>
            ${editable ? textNode('news.moreUrl', news.moreUrl || '', { editable, tag: 'small', className: 'admin-home-visual__href', placeholder: '/news/' }) : ''}
          </div>
        </div>
        ${editable ? '<button type="button" class="admin-add-slide" data-home-visual-add="news">+ 新增新闻</button>' : ''}
      </header>
      <div class="admin-home-visual__news-grid">
        ${items.map((item, index) => `
          <article class="admin-home-visual__news-card">
            <div class="admin-home-visual__news-media" style="background-image:url('${esc(item.imageUrl || '/images/home-advantages/advantage-ai-agent.webp')}')">
              ${editable ? `<button type="button" class="hpi-edit-bg" data-edit-image="news.items.${index}.imageUrl" data-edit-image-url="${esc(item.imageUrl || '')}" title="更换封面">更换封面</button>` : ''}
            </div>
            ${textNode(`news.items.${index}.category`, item.category || '', { editable, tag: 'strong', className: 'sm-kicker', placeholder: '分类' })}
            ${textNode(`news.items.${index}.title`, item.title || '', { editable, tag: 'h3', placeholder: '标题' })}
            ${textNode(`news.items.${index}.description`, item.description || '', { editable, tag: 'p', multiline: true, placeholder: '摘要' })}
            ${editable ? textNode(`news.items.${index}.linkUrl`, item.linkUrl || '', { editable, tag: 'small', className: 'admin-home-visual__href', placeholder: '详情链接' }) : ''}
            ${editable ? listTools('news', index, items.length) : ''}
          </article>`).join('')}
      </div>
    </section>`
}

function renderPitch(pitch = {}, { editable }) {
  const items = Array.isArray(pitch.items) && pitch.items.length ? pitch.items : [{ kicker: '', title: '', variant: 'photo', imageUrl: '' }]
  return `
    <section class="admin-home-visual__section" data-home-section="pitch" id="home-visual-pitch">
      <header class="admin-home-visual__head">
        <div>
          ${textNode('pitch.label', pitch.label || '', { editable, tag: 'strong', className: 'sm-pitch__label', placeholder: '小标题' })}
          ${textNode('pitch.title', pitch.title || '', { editable, tag: 'h2', multiline: true, placeholder: '主标题' })}
        </div>
        ${editable ? '<button type="button" class="admin-add-slide" data-home-visual-add="pitch">+ 新增宫格</button>' : ''}
      </header>
      <div class="admin-home-visual__pitch-grid">
        ${items.map((item, index) => {
          const variant = item.variant === 'wave' || item.variant === 'mint' ? item.variant : 'photo'
          const bg = variant === 'photo' && item.imageUrl ? ` style="background-image:url('${esc(item.imageUrl)}')"` : ''
          return `
          <article class="admin-home-visual__pitch-tile admin-home-visual__pitch-tile--${variant}"${bg}>
            ${editable && variant === 'photo' ? `<button type="button" class="hpi-edit-bg" data-edit-image="pitch.items.${index}.imageUrl" data-edit-image-url="${esc(item.imageUrl || '')}" title="更换图片">换图</button>` : ''}
            ${textNode(`pitch.items.${index}.kicker`, item.kicker || '', { editable, tag: 'span', placeholder: '角标' })}
            ${textNode(`pitch.items.${index}.title`, item.title || '', { editable, tag: 'strong', placeholder: '标题' })}
            ${textNode(`pitch.items.${index}.moreLabel`, item.moreLabel || '阅读更多信息', { editable, tag: 'em', placeholder: '更多文案' })}
            ${editable ? `
              <label class="admin-home-visual__pitch-meta">样式
                <select data-home-field="pitch.items.${index}.variant">
                  <option value="photo"${variant === 'photo' ? ' selected' : ''}>图片卡</option>
                  <option value="wave"${variant === 'wave' ? ' selected' : ''}>波浪卡</option>
                  <option value="mint"${variant === 'mint' ? ' selected' : ''}>浅色卡</option>
                </select>
              </label>
              <label class="admin-home-visual__pitch-meta"><input type="checkbox" data-home-field="pitch.items.${index}.openDemo" data-home-type="checkbox"${item.openDemo ? ' checked' : ''} /> 打开预约演示弹窗</label>
              ${textNode(`pitch.items.${index}.href`, item.href || '', { editable, tag: 'small', className: 'admin-home-visual__href', placeholder: '跳转链接' })}
              ${listTools('pitch', index, items.length)}
            ` : ''}
          </article>`
        }).join('')}
      </div>
    </section>`
}

export function renderHomePage(content = {}, { editable = false } = {}) {
  return `
    <div class="admin-home-visual-page">
      ${renderHero(content.heroSlides, { editable })}
      ${renderBanner(content.banner, { editable })}
      ${renderAgents(content.agents, { editable })}
      ${renderSolutions(content.solutions, { editable })}
      ${renderNews(content.news, { editable })}
      ${renderPitch(content.pitch, { editable })}
    </div>`
}
