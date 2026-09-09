/** 首页可视化预览渲染（后台编辑；前台仍走水合） */

import { esc, textNode, imgNode } from './vedit-nodes.js'
import '../styles/home-advantages.css'

const HERO_THEMES = ['overview', 'open-interface', 'ai-agent', 'wireless-access', 'layered-loop', 'hardware-system']

function bgEdit(path, url, label = '更换图片') {
  const safe = String(url || '').trim()
  return `<button type="button" class="hpi-edit-bg" data-edit-image="${esc(path)}" data-edit-image-url="${esc(safe)}" title="${esc(label)}">${safe ? esc(label) : '添加图片'}</button>`
}

function renderHero(slides, { editable }) {
  const list = slides?.length ? slides : []
  if (!list.length && !editable) return ''
  if (editable) {
    return `
      <section class="sm-hero ha-hero home-vedit-hero" data-home-vedit-hero>
        <div class="home-vedit-hero__stack">
          ${list
            .map((slide, index) => {
              const theme = HERO_THEMES[index % HERO_THEMES.length]
              const bg = slide.background || ''
              return `
            <article class="sm-hero__slide ha-slide ha-slide--${esc(theme)} is-active home-vedit-hero__slide">
              <div class="sm-hero__media ha-media" style="${bg ? `background-image:url('${esc(bg)}')` : ''}">
                ${bg ? `<img class="ha-media__img" src="${esc(bg)}" alt="" />` : ''}
                ${bgEdit(`heroSlides.${index}.background`, bg, '更换桌面 Banner')}
              </div>
              <div class="sm-hero__gradient ha-mask" aria-hidden="true"></div>
              <div class="sm-hero__content ha-content max-w-max-width mx-auto px-margin-desktop">
                <div class="sm-hero__copy ha-copy">
                  ${textNode(`heroSlides.${index}.label`, slide.label || '', {
                    editable: true,
                    tag: 'strong',
                    className: 'sm-hero__kicker ha-kicker',
                    placeholder: '角标（可空）',
                  })}
                  ${textNode(`heroSlides.${index}.title`, slide.title || '', {
                    editable: true,
                    tag: 'h2',
                    className: 'ha-title',
                    placeholder: '主标题',
                  })}
                  ${textNode(`heroSlides.${index}.description`, slide.description || '', {
                    editable: true,
                    tag: 'p',
                    className: 'ha-desc',
                    multiline: true,
                    placeholder: '说明文案',
                  })}
                  <div class="sm-hero__actions ha-actions">
                    <span class="sm-btn sm-btn--primary">
                      ${textNode(`heroSlides.${index}.actionLabel`, slide.actionLabel || '了解更多', {
                        editable: true,
                        tag: 'span',
                        placeholder: '按钮文字',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </article>`
            })
            .join('') || '<p class="admin-form-section__hint">暂无轮播屏，请在上方基础设置新增。</p>'}
        </div>
      </section>`
  }
  return ''
}

function renderBanner(banner = {}, { editable }) {
  const imageUrl = banner.imageUrl || ''
  return `
    <section class="sm-mini-banner">
      <div class="max-w-max-width mx-auto px-margin-desktop sm-mini-banner__inner">
        <div class="sm-mini-banner__media"${imageUrl ? ` style="background-image:url('${esc(imageUrl)}')"` : ''}>
          ${editable ? bgEdit('banner.imageUrl', imageUrl, '更换配图') : ''}
        </div>
        <div class="sm-mini-banner__text">
          ${textNode('banner.title', banner.title || '', {
            editable,
            tag: 'h3',
            placeholder: '推广标题',
          })}
          ${textNode('banner.subtitle', banner.subtitle || '', {
            editable,
            tag: 'p',
            multiline: true,
            placeholder: '说明',
          })}
        </div>
        <span class="sm-btn sm-btn--outline sm-btn--dark">
          ${textNode('banner.ctaLabel', banner.ctaLabel || '查看智能体', {
            editable,
            tag: 'span',
            placeholder: '按钮文字',
          })}
        </span>
      </div>
    </section>`
}

function renderAgents(agents = {}, { editable }) {
  const items = agents.items || []
  return `
    <section id="upgrade" class="sm-agent-glance scroll-mt-24">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sm-agent-glance__intro">
          ${textNode('agents.kicker', agents.kicker || '', {
            editable,
            tag: 'strong',
            className: 'sm-agent-glance__kicker',
            placeholder: '眉题',
          })}
          ${textNode('agents.title', agents.title || '', {
            editable,
            tag: 'h2',
            placeholder: '主标题',
          })}
          ${textNode('agents.subtitle', agents.subtitle || '', {
            editable,
            tag: 'p',
            multiline: true,
            placeholder: '说明',
          })}
        </div>
        <div class="home-vedit-agents"${editable ? ' data-home-vedit-agents' : ''}>
          ${items
            .map(
              (item, index) => `
            <article class="home-vedit-agent-card">
              <figure class="sm-agent-banner">
                ${imgNode(`agents.items.${index}.imageUrl`, item.imageUrl || '', {
                  editable,
                  width: 2100,
                  height: 900,
                  alt: item.name || '智能体',
                  className: 'home-vedit-agent-card__img',
                })}
                <figcaption>
                  ${textNode(`agents.items.${index}.sceneTitle`, item.sceneTitle || '', {
                    editable,
                    tag: 'strong',
                    placeholder: '画面标题',
                  })}
                  ${textNode(`agents.items.${index}.sceneCaption`, item.sceneCaption || '', {
                    editable,
                    tag: 'span',
                    placeholder: '画面说明',
                  })}
                </figcaption>
              </figure>
              ${textNode(`agents.items.${index}.name`, item.name || '', {
                editable,
                tag: 'p',
                className: 'home-vedit-agent-card__name',
                placeholder: '智能体名称',
              })}
            </article>`
            )
            .join('') || (editable ? '<p class="admin-form-section__hint">暂无智能体，请在上方基础设置新增。</p>' : '')}
        </div>
      </div>
    </section>`
}

function renderSolutions(solutions = {}, { editable }) {
  const items = solutions.items || []
  return `
    <section class="sm-sol-carousel-section">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sm-sol-carousel-section__head">
          ${textNode('solutions.eyebrow', solutions.eyebrow || '', {
            editable,
            tag: 'strong',
            className: 'sm-kicker sm-kicker--ink',
            placeholder: '眉题',
          })}
          ${textNode('solutions.title', solutions.title || '', {
            editable,
            tag: 'h2',
            placeholder: '区块标题',
          })}
          ${textNode('solutions.subtitle', solutions.subtitle || '', {
            editable,
            tag: 'p',
            multiline: true,
            placeholder: '区块说明',
          })}
          <span class="sm-btn sm-btn--ghost">
            ${textNode('solutions.moreLabel', solutions.moreLabel || '查看全部方案', {
              editable,
              tag: 'span',
              placeholder: '更多按钮',
            })}
          </span>
        </div>
        <div class="home-vedit-sol-grid">
          ${items
            .map((item, index) => {
              const imageUrl = item.imageUrl || ''
              return `
            <article class="sm-sol-card">
              <div class="sm-sol-card__media"${imageUrl ? ` style="background-image:url('${esc(imageUrl)}')"` : ''}>
                ${editable ? bgEdit(`solutions.items.${index}.imageUrl`, imageUrl, '更换封面') : ''}
                ${textNode(`solutions.items.${index}.chip`, item.chip || '', {
                  editable,
                  tag: 'span',
                  className: 'sm-sol-card__badge',
                  placeholder: '角标',
                })}
              </div>
              <div class="sm-sol-card__body">
                ${textNode(`solutions.items.${index}.title`, item.title || '', {
                  editable,
                  tag: 'h3',
                  placeholder: '标题',
                })}
                ${textNode(`solutions.items.${index}.description`, item.description || '', {
                  editable,
                  tag: 'p',
                  multiline: true,
                  placeholder: '说明',
                })}
                <span class="sm-text-link">了解更多信息 <span class="material-symbols-outlined">arrow_forward</span></span>
              </div>
            </article>`
            })
            .join('') || (editable ? '<p class="admin-form-section__hint">暂无方案卡，请在上方基础设置新增。</p>' : '')}
        </div>
      </div>
    </section>`
}

function renderNews(news = {}, { editable }) {
  const items = news.items || []
  return `
    <section class="sm-news-section">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="sm-news-section__head">
          ${textNode('news.kicker', news.kicker || '', {
            editable,
            tag: 'strong',
            className: 'sm-kicker sm-kicker--blue',
            placeholder: '眉题',
          })}
          ${textNode('news.title', news.title || '', {
            editable,
            tag: 'h2',
            placeholder: '区块标题',
          })}
          ${textNode('news.subtitle', news.subtitle || '', {
            editable,
            tag: 'p',
            multiline: true,
            placeholder: '区块说明',
          })}
        </div>
        <div class="sm-news-grid home-vedit-news-grid">
          ${items
            .map((item, index) => {
              const imageUrl = item.imageUrl || ''
              return `
            <div class="sm-news-card">
              <div class="sm-news-card__media"${imageUrl ? ` style="background-image:url('${esc(imageUrl)}')"` : ''}>
                ${editable ? bgEdit(`news.items.${index}.imageUrl`, imageUrl, '更换封面') : ''}
              </div>
              ${textNode(`news.items.${index}.category`, item.category || '', {
                editable,
                tag: 'strong',
                className: 'sm-kicker',
                placeholder: '分类',
              })}
              ${textNode(`news.items.${index}.title`, item.title || '', {
                editable,
                tag: 'h3',
                placeholder: '标题',
              })}
              ${textNode(`news.items.${index}.description`, item.description || '', {
                editable,
                tag: 'p',
                multiline: true,
                placeholder: '摘要',
              })}
            </div>`
            })
            .join('') || (editable ? '<p class="admin-form-section__hint">暂无新闻卡，请在上方基础设置新增。</p>' : '')}
        </div>
        <p class="sm-news-more">
          <span class="sm-text-link sm-text-link--blue">
            ${textNode('news.moreLabel', news.moreLabel || '进入新闻中心', {
              editable,
              tag: 'span',
              placeholder: '更多按钮',
            })}
            <span class="material-symbols-outlined">arrow_forward</span>
          </span>
        </p>
      </div>
    </section>`
}

function renderPitch(pitch = {}, { editable }) {
  const items = pitch.items || []
  const titleHtml = editable
    ? textNode('pitch.title', pitch.title || '', {
        editable: true,
        tag: 'h2',
        multiline: true,
        placeholder: '主标题',
      })
    : `<h2>${esc(pitch.title || '').replace(/\n/g, '<br>')}</h2>`
  return `
    <section class="sm-pitch" aria-labelledby="sm-pitch-title">
      <div class="max-w-max-width mx-auto px-margin-desktop sm-pitch__inner">
        <div class="sm-pitch__head">
          ${textNode('pitch.label', pitch.label || '', {
            editable,
            tag: 'strong',
            className: 'sm-pitch__label',
            placeholder: '小标题',
          })}
          ${titleHtml}
        </div>
        <div class="sm-pitch__grid home-vedit-pitch-grid">
          ${items
            .map((item, index) => {
              const variant = item.variant === 'wave' || item.variant === 'mint' ? item.variant : 'photo'
              const imageUrl = item.imageUrl || ''
              const bg = variant === 'photo' && imageUrl ? ` style="background-image:url('${esc(imageUrl)}')"` : ''
              return `
            <div class="sm-pitch__tile sm-pitch__tile--${variant}"${bg}>
              ${editable && variant === 'photo' ? bgEdit(`pitch.items.${index}.imageUrl`, imageUrl, '更换背景图') : ''}
              ${textNode(`pitch.items.${index}.kicker`, item.kicker || '', {
                editable,
                tag: 'span',
                placeholder: '卡片小标题',
              })}
              ${textNode(`pitch.items.${index}.title`, item.title || '', {
                editable,
                tag: 'strong',
                multiline: true,
                placeholder: '卡片主文案',
              })}
              <em>
                ${textNode(`pitch.items.${index}.moreLabel`, item.moreLabel || '阅读更多信息', {
                  editable,
                  tag: 'span',
                  placeholder: '底部链接',
                })}
                <span class="material-symbols-outlined">arrow_forward</span>
              </em>
            </div>`
            })
            .join('') || (editable ? '<p class="admin-form-section__hint">暂无宫格，请在上方基础设置新增。</p>' : '')}
        </div>
      </div>
    </section>`
}

export function renderHomePage(content = {}, { editable = false } = {}) {
  return `
    <div class="home-vedit${editable ? ' home-vedit--editable hpi--editable' : ''}">
      ${renderHero(content.heroSlides, { editable })}
      ${renderBanner(content.banner, { editable })}
      ${renderAgents(content.agents, { editable })}
      ${renderSolutions(content.solutions, { editable })}
      ${renderNews(content.news, { editable })}
      ${renderPitch(content.pitch, { editable })}
    </div>`
}
