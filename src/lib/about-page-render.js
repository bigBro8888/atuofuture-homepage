/** 关于我们页渲染（前台与后台可视化编辑共用） */

import { esc, textNode, imgNode } from './vedit-nodes.js'

function partnerTiles(items, { editable }) {
  const logos = (items || []).filter((item) => item?.name || item?.logoUrl)
  if (!logos.length) {
    return editable
      ? `<p class="ab-partners__empty">暂无客户 Logo，请在上方基础设置中新增。</p>`
      : ''
  }
  if (editable) {
    return `
      <div class="ab-partners ab-partners--edit" data-about-partners>
        <div class="ab-partners__edit-grid">
          ${logos
            .map(
              (item, index) => `
            <figure class="ab-partners__logo ab-partners__logo--edit">
              ${imgNode(`partners.items.${index}.logoUrl`, item.logoUrl || '', {
                editable: true,
                width: 160,
                height: 64,
                alt: item.name || '客户',
                className: 'ab-partners__edit-img',
              })}
              ${textNode(`partners.items.${index}.name`, item.name || '', {
                editable: true,
                tag: 'figcaption',
                placeholder: '客户名称',
              })}
            </figure>`
            )
            .join('')}
        </div>
      </div>`
  }
  const tile = (item, hideName) => {
    const visual = item.logoUrl
      ? `<img src="${esc(item.logoUrl)}" alt="${hideName ? '' : esc(item.name || '')}">`
      : `<strong>${esc(item.name || '')}</strong>`
    return `<figure class="ab-partners__logo">${visual}</figure>`
  }
  const group = (hideName) =>
    `<div class="ab-partners__group"${hideName ? ' aria-hidden="true"' : ''}>${logos.map((item) => tile(item, hideName)).join('')}</div>`
  return `<div class="ab-partners" data-about-partners>
    <div class="ab-partners__row"><div class="ab-partners__track">${group(false)}${group(true)}</div></div>
  </div>`
}

function joinCarousel(slides, { editable }) {
  const list = (slides || []).filter((item) => item?.imageUrl || editable)
  if (!list.length) {
    return `<div class="ab-join__stage" data-about-join-carousel></div>`
  }
  if (editable) {
    return `
      <div class="ab-join__stage ab-join__stage--edit" data-about-join-carousel>
        <div class="ab-join__edit-slides">
          ${list
            .map(
              (item, index) => `
            <figure class="ab-join__slide is-active ab-join__slide--edit">
              ${imgNode(`join.slides.${index}.imageUrl`, item.imageUrl || '', {
                editable: true,
                width: 960,
                height: 720,
                alt: item.caption || '轮播图',
              })}
              ${textNode(`join.slides.${index}.caption`, item.caption || '', {
                editable: true,
                tag: 'figcaption',
                placeholder: '图片说明',
              })}
            </figure>`
            )
            .join('')}
        </div>
      </div>`
  }
  return `
    <div class="ab-join__stage" data-about-join-carousel>
      <div class="ab-join__film">
        ${list
          .map(
            (item, index) => `
          <figure class="ab-join__slide${index === 0 ? ' is-active' : ''}">
            <img src="${esc(item.imageUrl)}" alt="${esc(item.caption || '')}">
            ${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}
          </figure>`
          )
          .join('')}
      </div>
      <div class="ab-join__bar">
        <button type="button" class="ab-join__ctrl" data-about-join-prev aria-label="上一张">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 4.5 8 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="ab-join__dots" data-about-join-dots>
          ${list.map((_, index) => `<button type="button" class="${index === 0 ? 'is-active' : ''}" aria-label="第 ${index + 1} 张"></button>`).join('')}
        </div>
        <button type="button" class="ab-join__ctrl" data-about-join-next aria-label="下一张">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 4.5 16 12l-7.5 7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>`
}

function joinJobs(jobs, { editable }) {
  const list = (jobs || []).filter((item) => item?.title || editable)
  if (!list.length) {
    return `<ul class="ab-join__jobs" data-about-join-jobs><li class="ab-join__empty">目前没有开放职位，欢迎把简历发到招聘邮箱。</li></ul>`
  }
  return `<ul class="ab-join__jobs" data-about-join-jobs>
    ${list
      .map((item, index) => {
        const metaParts = [item.dept, item.location, item.type].filter(Boolean)
        const meta = metaParts.join(' · ')
        if (editable) {
          return `<li>
            <div>
              ${textNode(`join.jobs.${index}.title`, item.title || '', { editable: true, tag: 'strong', placeholder: '职位名称' })}
              <small>
                ${textNode(`join.jobs.${index}.dept`, item.dept || '', { editable: true, tag: 'span', placeholder: '部门' })}
                · ${textNode(`join.jobs.${index}.location`, item.location || '', { editable: true, tag: 'span', placeholder: '地点' })}
                · ${textNode(`join.jobs.${index}.type`, item.type || '', { editable: true, tag: 'span', placeholder: '类型' })}
              </small>
              ${textNode(`join.jobs.${index}.summary`, item.summary || '', {
                editable: true,
                tag: 'p',
                multiline: true,
                placeholder: '职位简介',
              })}
            </div>
            <span class="ab-join__apply-label">投递</span>
          </li>`
        }
        const apply = item.applyHref ? `<a href="${esc(item.applyHref)}">投递</a>` : ''
        return `<li>
          <div>
            <strong>${esc(item.title || '')}</strong>
            ${meta ? `<small>${esc(meta)}</small>` : ''}
            ${item.summary ? `<p>${esc(item.summary)}</p>` : ''}
          </div>
          ${apply}
        </li>`
      })
      .join('')}
  </ul>`
}

/**
 * @param {object} content
 * @param {{ editable?: boolean }} options
 */
export function renderAboutPage(content = {}, { editable = false } = {}) {
  const hero = content.hero || {}
  const story = content.story || {}
  const values = content.values || {}
  const partners = content.partners || {}
  const join = content.join || {}
  const contact = content.contact || {}
  const valueItems = values.items || []
  const joinItems = join.items || []
  const briefUrl = String(join.briefUrl || '').trim()
  const phoneDisplay = String(contact.phoneDisplay || contact.phone || '').trim()
  const phoneHref = String(contact.phone || contact.phoneDisplay || '').replace(/[^\d+]/g, '')

  return `
<div class="ab-page${editable ? ' ab-page--editable hpi--editable' : ''}">
<section class="ab-hero" id="intro">
<div class="max-w-max-width mx-auto px-margin-desktop ab-hero__grid">
<div class="ab-hero__text">
${textNode('hero.title', hero.title || '', { editable, tag: 'h1', placeholder: '首屏标题' })}
${textNode('hero.body', hero.body || '', { editable, tag: 'p', multiline: true, placeholder: '首屏说明' })}
<div class="ab-hero__actions">
<a href="${editable ? '#' : esc(hero.primaryHref || '#contact')}" class="ab-btn ab-btn--primary"${editable ? ' tabindex="-1"' : ''}>
  ${textNode('hero.primaryLabel', hero.primaryLabel || '联系我们', { editable, tag: 'span', placeholder: '主按钮' })}
</a>
<a href="${editable ? '#' : esc(hero.secondaryHref || '#story')}" class="ab-btn ab-btn--ghost"${editable ? ' tabindex="-1"' : ''}>
  ${textNode('hero.secondaryLabel', hero.secondaryLabel || '关于安托未来', { editable, tag: 'span', placeholder: '次按钮' })}
</a>
</div>
</div>
<div class="ab-hero__visual" role="img" aria-label="安托未来智能硬件" style="background-image:url('${esc(hero.imageUrl || '/images/hardware/hero-bg.png')}')">
  ${
    editable
      ? `<button type="button" class="hpi-edit-bg" data-edit-image="hero.imageUrl" data-edit-image-url="${esc(hero.imageUrl || '')}" title="更换首屏大图">${hero.imageUrl ? '更换首屏大图' : '添加首屏大图'}</button>`
      : ''
  }
</div>
</div>
</section>

<section class="ab-story" id="story">
<div class="max-w-max-width mx-auto px-margin-desktop ab-story__grid">
<figure class="ab-story__photo">
${imgNode('story.imageUrl', story.imageUrl || '/images/hardware/eink-price-tag.jpg', {
  editable,
  width: 1200,
  height: 900,
  alt: '安托未来电子价签与智能硬件',
})}
</figure>
<div class="ab-story__copy" id="company">
${textNode('story.label', story.label || '', { editable, tag: 'p', className: 'ab-label', placeholder: '小标题' })}
${textNode('story.title', story.title || '', { editable, tag: 'h2', placeholder: '公司介绍标题' })}
${textNode('story.body1', story.body1 || '', { editable, tag: 'p', multiline: true, placeholder: '第一段正文' })}
${textNode('story.body2', story.body2 || '', { editable, tag: 'p', multiline: true, placeholder: '第二段正文' })}
</div>
</div>
</section>

<section class="ab-values" id="culture">
<div class="max-w-max-width mx-auto px-margin-desktop">
<div class="ab-values__head">
<span class="ab-values__accent" aria-hidden="true"></span>
${textNode('values.label', values.label || '', { editable, tag: 'p', className: 'ab-values__kicker', placeholder: '分区眉题' })}
${textNode('values.title', values.title || '', { editable, tag: 'h2', className: 'ab-values__title', placeholder: '分区标题' })}
</div>
<div class="ab-values__rail" aria-hidden="true"><i></i><i></i><i></i></div>
<div class="ab-values__grid">
${[0, 1, 2]
  .map((index) => {
    const item = valueItems[index] || {}
    const no = String(index + 1).padStart(2, '0')
    return `<article data-about-value>
<b>${no}</b>
${textNode(`values.items.${index}.title`, item.title || '', { editable, tag: 'h3', placeholder: '名称' })}
${textNode(`values.items.${index}.body`, item.body || '', { editable, tag: 'p', multiline: true, placeholder: '一句话' })}
</article>`
  })
  .join('')}
</div>
</div>
</section>

<section class="ab-footprint">
<div class="max-w-max-width mx-auto px-margin-desktop">
${textNode('partners.label', partners.label || '', { editable, tag: 'p', className: 'ab-label', placeholder: '小标题' })}
${textNode('partners.title', partners.title || '', { editable, tag: 'h2', placeholder: '客户墙标题' })}
${textNode('partners.intro', partners.intro || '', {
  editable,
  tag: 'p',
  className: 'ab-footprint__intro',
  multiline: true,
  placeholder: '客户墙说明',
})}
</div>
${partnerTiles(partners.items, { editable })}
</section>

<section class="ab-join" id="join">
<span id="team"></span>
<span id="delivery"></span>
<div class="max-w-max-width mx-auto px-margin-desktop ab-join__grid">
${joinCarousel(join.slides, { editable })}
<div class="ab-join__copy">
${textNode('join.label', join.label || '', { editable, tag: 'p', className: 'ab-label', placeholder: '小标题' })}
${textNode('join.title', join.title || '', { editable, tag: 'h2', placeholder: '加入我们标题' })}
${textNode('join.lead', join.lead || '', {
  editable,
  tag: 'p',
  className: 'ab-join__lead',
  multiline: true,
  placeholder: '招揽说明',
})}
<ol class="ab-join__points" data-about-join-points>
${(joinItems.length ? joinItems : editable ? [{}, {}, {}] : [])
  .map((item, index) => {
    const step = item.step || String(index + 1).padStart(2, '0')
    return `<li data-about-join-item>
<b>${
      editable
        ? textNode(`join.items.${index}.step`, step, { editable: true, tag: 'span', placeholder: '01' })
        : esc(step)
    }</b>
<div>
${textNode(`join.items.${index}.title`, item.title || '', { editable, tag: 'h3', placeholder: '要点标题' })}
${textNode(`join.items.${index}.body`, item.body || '', {
  editable,
  tag: 'p',
  multiline: true,
  placeholder: '要点说明',
})}
</div>
</li>`
  })
  .join('')}
</ol>
<div class="ab-join__actions">
<a class="ab-btn ab-btn--primary" href="${editable ? '#' : esc(join.ctaHref || 'mailto:service@atuofuture.com')}"${editable ? ' tabindex="-1"' : ''}>
  ${textNode('join.ctaLabel', join.ctaLabel || '投递简历', { editable, tag: 'span', placeholder: '主按钮' })}
</a>
${
  editable || briefUrl
    ? `<a class="ab-btn ab-btn--ghost" href="${editable ? '#' : esc(briefUrl)}"${editable ? ' tabindex="-1"' : ''}${!editable && briefUrl ? ' target="_blank" rel="noopener"' : ''}${!editable && !briefUrl ? ' hidden' : ''}>
  ${textNode('join.briefLabel', join.briefLabel || '查看招聘需求', { editable, tag: 'span', placeholder: '招聘文件按钮' })}
</a>`
    : ''
}
</div>
</div>
</div>
<div class="max-w-max-width mx-auto px-margin-desktop">
<div class="ab-join__board">
<div class="ab-join__board-head">
${textNode('join.jobsTitle', join.jobsTitle || '在招职位', { editable, tag: 'h3', placeholder: '职位区标题' })}
</div>
${joinJobs(join.jobs, { editable })}
</div>
</div>
</section>

<section class="ab-contact" id="contact">
<div class="max-w-max-width mx-auto px-margin-desktop">
<div class="ab-contact__head">
<div>
${textNode('contact.label', contact.label || '', { editable, tag: 'p', className: 'ab-label', placeholder: '小标题' })}
${textNode('contact.title', contact.title || '', { editable, tag: 'h2', placeholder: '联系标题' })}
</div>
${textNode('contact.lead', contact.lead || '', {
  editable,
  tag: 'p',
  className: 'ab-contact__lead',
  multiline: true,
  placeholder: '联系说明',
})}
</div>
<div class="ab-contact__panel">
<aside class="ab-contact__aside">
<span class="ab-contact__mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
${textNode('contact.joinTitle', contact.joinTitle || '', { editable, tag: 'h3', placeholder: '侧栏标题' })}
${textNode('contact.joinBody', contact.joinBody || '', {
  editable,
  tag: 'p',
  multiline: true,
  placeholder: '侧栏说明',
})}
<button type="button" class="ab-contact__demo"${editable ? '' : ' data-demo-modal-open'}>预约方案演示</button>
</aside>
<div class="ab-contact__list">
<a class="ab-contact__row" href="${editable ? '#' : esc(contact.email1 ? `mailto:${contact.email1}` : '#')}"${editable ? ' tabindex="-1"' : ''}>
<span class="ab-contact__icon" aria-hidden="true">
<svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m4.5 7.5 7.5 6 7.5-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
</span>
<div>
<h3>邮箱</h3>
${textNode('contact.email1', contact.email1 || '', { editable, tag: 'p', placeholder: '主邮箱' })}
${textNode('contact.email2', contact.email2 || '', { editable, tag: 'p', placeholder: '备用邮箱（可空）' })}
</div>
<span class="ab-contact__go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
</a>
<a class="ab-contact__row"${phoneDisplay || editable ? '' : ' hidden'}${phoneHref && !editable ? ` href="tel:${esc(phoneHref)}"` : ''}${editable ? ' tabindex="-1" href="#"' : ''}>
<span class="ab-contact__icon" aria-hidden="true">
<svg viewBox="0 0 24 24"><path d="M7.4 4.8c.3-.8 1.2-1.2 2-.9l2.2.8c.7.2 1.1.9 1 1.6l-.4 2.2c-.1.6-.5 1-1.1 1.2l-1.3.4c.8 1.7 2.1 3.1 3.8 4l.4-1.3c.2-.6.6-1 1.2-1.1l2.2-.4c.7-.1 1.4.3 1.6 1l.8 2.2c.3.8-.1 1.7-.9 2A15.2 15.2 0 0 1 7.4 4.8Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
</span>
<div>
<h3>电话</h3>
${textNode('contact.phoneDisplay', phoneDisplay, { editable, tag: 'p', placeholder: '电话展示（可空）' })}
</div>
<span class="ab-contact__go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
</a>
<div class="ab-contact__row">
<span class="ab-contact__icon" aria-hidden="true">
<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="9.8" r="2.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
</span>
<div>
<h3>地址</h3>
${textNode('contact.addressZh', contact.addressZh || '', { editable, tag: 'p', multiline: true, placeholder: '中文地址' })}
${textNode('contact.addressEn', contact.addressEn || '', { editable, tag: 'p', multiline: true, placeholder: '英文地址' })}
</div>
<span class="ab-contact__go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
</div>
</div>
</div>
</div>
</section>
</div>`
}
