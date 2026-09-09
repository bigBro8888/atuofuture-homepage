/** App 下载页渲染（后台可视化预览；前台仍用静态 HTML + 水合） */

import { esc, textNode, imgNode } from './vedit-nodes.js'

const ACCENTS = ['blue', 'cyan', 'violet', 'amber']

/**
 * @param {object} app
 * @param {{ editable?: boolean }} options
 */
export function renderAppDownloadPage(app = {}, { editable = false } = {}) {
  const features = app.features || { title: '', subtitle: '', items: [] }
  const items = Array.isArray(features.items) ? features.items : []
  const banner = app.desktopBannerUrl || '/images/app-download/back.png'
  const heroImage = app.heroImageUrl || ''
  const name = app.name || 'AI投屏'

  return `
<div class="dl-vedit${editable ? ' dl-vedit--editable hpi--editable' : ''}" style="--dl-banner:url('${esc(banner)}')">
  <section class="dl-vedit-hero">
    ${
      editable
        ? `<button type="button" class="hpi-edit-bg" data-edit-image="desktopBannerUrl" data-edit-image-url="${esc(app.desktopBannerUrl || '')}" title="更换桌面 Banner">${app.desktopBannerUrl ? '更换桌面 Banner' : '添加桌面 Banner'}</button>`
        : ''
    }
    <div class="dl-vedit-hero__inner">
      <div class="dl-vedit-hero__copy">
        <span class="dl-vedit-chip">${esc(name)}</span>
        ${textNode('downloadTitle', app.downloadTitle || name, { editable, tag: 'h1', placeholder: '主标题' })}
        ${textNode('downloadSubtitle', app.downloadSubtitle || '', { editable, tag: 'h2', placeholder: '副标题' })}
        ${textNode('downloadDescription', app.downloadDescription || app.description || '', {
          editable,
          tag: 'p',
          multiline: true,
          placeholder: '详细说明',
        })}
        <div class="dl-vedit-hero__actions">
          <span class="dl-vedit-store">App Store</span>
          <span class="dl-vedit-store dl-vedit-store--android">安卓下载</span>
        </div>
      </div>
      <div class="dl-vedit-hero__phone">
        ${
          editable
            ? imgNode('heroImageUrl', heroImage, {
                editable: true,
                width: 375,
                height: 667,
                alt: '手机展示图',
                className: 'dl-vedit-phone-img',
              })
            : heroImage
              ? `<img src="${esc(heroImage)}" alt="手机展示图" width="375" height="667" />`
              : '<div class="dl-vedit-phone-empty">暂无展示图</div>'
        }
      </div>
    </div>
  </section>

  <section class="dl-vedit-features">
    <header>
      ${textNode('features.title', features.title || '', { editable, tag: 'h2', placeholder: '亮点区块标题' })}
      ${textNode('features.subtitle', features.subtitle || '', {
        editable,
        tag: 'p',
        multiline: true,
        placeholder: '亮点区块说明',
      })}
    </header>
    <div class="dl-vedit-feature-grid">
      ${[0, 1, 2, 3]
        .map((index) => {
          const item = items[index] || {}
          const accent = ACCENTS.includes(item.accent) ? item.accent : ACCENTS[index]
          return `
        <article class="dl-vedit-feature dl-vedit-feature--${accent}">
          <span class="dl-vedit-feature__no">${String(index + 1).padStart(2, '0')}</span>
          ${textNode(`features.items.${index}.title`, item.title || '', { editable, tag: 'h3', placeholder: '亮点标题' })}
          ${textNode(`features.items.${index}.description`, item.description || '', {
            editable,
            tag: 'p',
            multiline: true,
            placeholder: '亮点说明',
          })}
        </article>`
        })
        .join('')}
    </div>
  </section>
</div>`
}
