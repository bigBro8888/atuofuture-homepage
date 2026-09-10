/** 智能硬件频道页渲染（前台与后台可视化编辑共用） */

import { esc, textNode, imgNode } from './vedit-nodes.js'

export const DEFAULT_HARDWARE_SECTIONS = {
  space: {
    kicker: '空间智能',
    title: '空间智能硬件',
    subtitle: '以中控屏为交互入口，连接感知、边缘、控制与信息终端，形成可部署的空间智能闭环。',
  },
  retail: {
    kicker: '新零售与行业电子纸',
    title: '以电子纸连接商品、资产与行业数据',
    subtitle: '覆盖门店价签、冷链标签与资产盘点，帮助业务侧更快完成信息同步与现场执行。',
  },
  consumer: {
    kicker: '3C 数码',
    title: '电子纸进入个人设备与数字生活',
    subtitle: '面向消费与陈列场景，以大幅场景卡呈现产品形态与使用氛围。',
  },
  cta: {
    title: '获取适合项目的硬件选型建议',
    subtitle: '告诉我们空间类型、部署规模与接入需求，安托未来将协助完成硬件选型与联调方案。',
    primaryLabel: '获取选型建议',
    secondaryLabel: '预约方案演示',
  },
}

function sectionOf(sections, key) {
  return { ...DEFAULT_HARDWARE_SECTIONS[key], ...(sections?.[key] || {}) }
}

function itemPath(index, field) {
  return `items.${index}.${field}`
}

function renderHero(hero, { editable }) {
  const banner = hero.bannerUrl || '/images/hardware/hero-bg-3840.png'
  const bgEdit = editable
    ? `<button type="button" class="hpi-edit-bg" data-edit-image="bannerUrl" data-edit-image-url="${esc(banner)}" title="更换 Banner">${banner ? '更换 Banner' : '添加 Banner'}</button>`
    : ''
  return `
    <section class="hwc-hero">
      <div class="hwc-hero__bg" aria-hidden="true">
        <img src="${esc(banner)}" alt="" width="3840" height="1054" decoding="async"${editable ? '' : ' fetchpriority="high"'} />
      </div>
      ${bgEdit}
      <div class="hwc-shell hwc-hero__content">
        <div class="hwc-hero__copy">
          ${textNode('title', hero.title || '', { editable, tag: 'h1', placeholder: '首屏主标题' })}
          ${textNode('subtitle', hero.subtitle || '', { editable, tag: 'p', multiline: true, placeholder: '首屏说明' })}
          <div class="hwc-hero__actions">
            <a class="hwc-btn hwc-btn--cyan hwc-btn--hero" href="${editable ? '#' : '/hardware/products/'}"${editable ? ' tabindex="-1"' : ''}>
              ${textNode('primaryCtaLabel', hero.primaryCtaLabel || '浏览全部产品', { editable, tag: 'span', placeholder: '主按钮文案' })}
            </a>
            <button type="button" class="hwc-btn hwc-btn--outline-dark"${editable ? '' : ' data-demo-modal-open'}>
              ${textNode('ctaLabel', hero.ctaLabel || '获取选型建议', { editable, tag: 'span', placeholder: '按钮文案' })}
            </button>
          </div>
        </div>
      </div>
    </section>`
}

/**
 * @param {object} model
 * @param {{ editable?: boolean }} options
 */
export function renderHardwarePage(model, { editable = false } = {}) {
  const {
    hero = {},
    sections = {},
    flagship = null,
    matrixRows = [],
    matrixFromRule = false,
    retailCards = [],
    consumerCards = [],
    resolveProduct,
    resolveItemIndex = () => -1,
    productHref = () => '#',
    listingDetailLabel = () => '查看详情',
  } = model

  const space = sectionOf(sections, 'space')
  const retail = sectionOf(sections, 'retail')
  const consumer = sectionOf(sections, 'consumer')
  const cta = sectionOf(sections, 'cta')
  const flagshipIndex = flagship ? resolveItemIndex(flagship.id || flagship.slug) : -1

  const matrixHtml = matrixRows
    .map((row, rowIndex) => {
      const products = (row.products || [])
        .map((entry, productIndex) => {
          const p = resolveProduct(entry.id)
          if (!p) return null
          const itemIndex = matrixFromRule || row.fromRule ? -1 : resolveItemIndex(entry.id)
          return { ...p, displayName: entry.label || p.name, productIndex, itemIndex }
        })
        .filter(Boolean)
      if (!products.length) return ''
      const titleNode = textNode(`spaceMatrixRows.${rowIndex}.title`, row.title || '', {
        editable,
        tag: 'h3',
        placeholder: '矩阵标题（可空）',
      })
      const subtitleNode = textNode(`spaceMatrixRows.${rowIndex}.subtitle`, row.subtitle || '', {
        editable,
        tag: 'p',
        multiline: true,
        placeholder: '矩阵说明（可空）',
      })
      const ruleBtn =
        editable && rowIndex === 0
          ? `<button type="button" class="admin-hw-rule-btn" data-hw-matrix-rule>规则设置</button>`
          : ''
      const head =
        row.title || row.subtitle || editable
          ? `<div class="hwx-matrix__head">
            <div class="hwx-matrix__title-row">
              ${titleNode}
              ${ruleBtn}
            </div>
            ${subtitleNode}
          </div>`
          : ''
      const cardEditable = editable && !matrixFromRule && !row.fromRule
      return `
        <div class="hwx-matrix${rowIndex > 0 ? ' hwx-matrix--compact' : ''}">
          ${head}
          <div class="hwx-matrix__grid">
            ${products
              .map(
                (p) => `
              <a class="hwx-matrix__card" href="${editable ? '#' : productHref(p)}"${editable ? ' tabindex="-1"' : ''}>
                <span class="hwx-matrix__media">
                  ${
                    cardEditable && p.itemIndex >= 0
                      ? imgNode(itemPath(p.itemIndex, 'imageUrl'), p.coverImage, {
                          editable: true,
                          width: 640,
                          height: 480,
                          alt: p.displayName,
                          loading: 'lazy',
                        })
                      : `<img src="${esc(p.coverImage)}" alt="${esc(p.displayName)}" width="640" height="480" loading="lazy" />`
                  }
                </span>
                <span class="hwx-matrix__body">
                  ${
                    cardEditable
                      ? textNode(`spaceMatrixRows.${rowIndex}.products.${p.productIndex}.label`, p.displayName || '', {
                          editable: true,
                          tag: 'strong',
                          placeholder: '产品名',
                        })
                      : `<strong>${esc(p.displayName || '')}</strong>`
                  }
                  ${
                    cardEditable && p.itemIndex >= 0
                      ? textNode(itemPath(p.itemIndex, 'summary'), p.shortDescription || '', {
                          editable: true,
                          tag: 'small',
                          multiline: true,
                          placeholder: '简介',
                        })
                      : `<small>${esc(p.shortDescription || '')}</small>`
                  }
                  <span class="hwx-matrix__link">查看详情</span>
                </span>
              </a>`
              )
              .join('')}
          </div>
        </div>`
    })
    .join('')

  return `
    <div class="hwc${editable ? ' hwc--editable hpi--editable' : ''}">
      <div class="hwc-first">${renderHero(hero, { editable })}</div>
      <section class="hwx-space" id="hwc-space">
        <div class="hwc-shell">
          <header class="hwx-head">
            ${textNode('sections.space.kicker', space.kicker, { editable, tag: 'p', className: 'hwx-kicker', placeholder: '分区眉题' })}
            ${textNode('sections.space.title', space.title, { editable, tag: 'h2', placeholder: '分区标题' })}
            ${textNode('sections.space.subtitle', space.subtitle, { editable, tag: 'p', multiline: true, placeholder: '分区说明' })}
          </header>
          ${
            flagship
              ? `
          <article class="hwx-flagship">
            <div class="hwx-flagship__media">
              ${
                flagshipIndex >= 0
                  ? imgNode(itemPath(flagshipIndex, 'imageUrl'), flagship.coverImage, {
                      editable,
                      width: 1200,
                      height: 900,
                      alt: flagship.name,
                      loading: 'lazy',
                    })
                  : `<img src="${esc(flagship.coverImage)}" alt="${esc(flagship.name)}" width="1200" height="900" loading="lazy" />`
              }
            </div>
            <div class="hwx-flagship__copy">
              ${
                flagshipIndex >= 0
                  ? textNode(itemPath(flagshipIndex, 'tag'), flagship.tag || '旗舰产品', {
                      editable,
                      tag: 'p',
                      className: 'hwx-flagship__tag',
                      placeholder: '标签',
                    })
                  : `<p class="hwx-flagship__tag">${esc(flagship.tag || '旗舰产品')}</p>`
              }
              ${
                flagshipIndex >= 0
                  ? textNode(itemPath(flagshipIndex, 'title'), flagship.name, { editable, tag: 'h3', placeholder: '旗舰产品名' })
                  : `<h3>${esc(flagship.name)}</h3>`
              }
              ${
                flagshipIndex >= 0
                  ? textNode(itemPath(flagshipIndex, 'summary'), flagship.shortDescription || '', {
                      editable,
                      tag: 'p',
                      className: 'hwx-flagship__lead',
                      multiline: true,
                      placeholder: '一句话简介',
                    })
                  : `<p class="hwx-flagship__lead">${esc(flagship.shortDescription || '')}</p>`
              }
              ${
                flagshipIndex >= 0
                  ? textNode(itemPath(flagshipIndex, 'fullDescription'), flagship.fullDescription || '', {
                      editable,
                      tag: 'p',
                      multiline: true,
                      placeholder: '详细介绍',
                    })
                  : `<p>${esc(flagship.fullDescription || '')}</p>`
              }
              <ul class="hwx-flagship__points">
                ${(flagship.capabilities || []).map((c, i) => {
                  const canEditCap = editable && flagshipIndex >= 0
                  return `<li>${
                    canEditCap
                      ? textNode(itemPath(flagshipIndex, `capabilities.${i}`), c, {
                          editable: true,
                          tag: 'span',
                          placeholder: '能力点',
                        })
                      : esc(c)
                  }</li>`
                }).join('')}
              </ul>
              <div class="hwx-flagship__actions">
                <a class="hwc-btn hwc-btn--orange" href="${editable ? '#' : productHref(flagship)}"${editable ? ' tabindex="-1"' : ''}>
                  ${
                    editable && flagshipIndex >= 0
                      ? textNode(itemPath(flagshipIndex, 'detailCtaLabel'), flagship.detailCtaLabel || '查看产品详情', {
                          editable: true,
                          tag: 'span',
                          placeholder: '详情按钮',
                        })
                      : esc(flagship.detailCtaLabel || '查看产品详情')
                  }
                </a>
                ${
                  flagship.solutionHref || (editable && flagshipIndex >= 0)
                    ? `<a class="hwc-text-link" href="${editable ? '#' : esc(flagship.solutionHref || '#')}"${editable ? ' tabindex="-1"' : ''}>${
                        editable && flagshipIndex >= 0
                          ? textNode(itemPath(flagshipIndex, 'solutionLabel'), flagship.solutionLabel || '了解 ASpace 总体方案', {
                              editable: true,
                              tag: 'span',
                              placeholder: '方案链接文案',
                            })
                          : esc(flagship.solutionLabel || '了解 ASpace 总体方案')
                      }</a>`
                    : ''
                }
              </div>
            </div>
          </article>`
              : ''
          }
          ${matrixHtml}
        </div>
      </section>
      <section class="hwx-retail" id="hwc-retail">
        <div class="hwc-shell">
          <header class="hwx-head hwx-head--light">
            ${textNode('sections.retail.kicker', retail.kicker, { editable, tag: 'p', className: 'hwx-kicker', placeholder: '分区眉题' })}
            ${textNode('sections.retail.title', retail.title, { editable, tag: 'h2', placeholder: '分区标题' })}
            ${textNode('sections.retail.subtitle', retail.subtitle, { editable, tag: 'p', multiline: true, placeholder: '分区说明' })}
          </header>
          <div class="hwx-retail__grid">
            ${retailCards
              .map((p) => {
                const itemIndex = resolveItemIndex(p.id || p.slug)
                const canEdit = editable && itemIndex >= 0
                return `
            <article class="hwx-retail__card">
              <div class="hwx-retail__media">
                ${
                  canEdit
                    ? imgNode(itemPath(itemIndex, 'imageUrl'), p.coverImage, {
                        editable: true,
                        width: 1200,
                        height: 900,
                        alt: p.name,
                        loading: 'lazy',
                      })
                    : `<img src="${esc(p.coverImage)}" alt="${esc(p.name)}" width="1200" height="900" loading="lazy" />`
                }
              </div>
              <div class="hwx-retail__body">
                ${canEdit ? textNode(itemPath(itemIndex, 'title'), p.name, { editable: true, tag: 'h3', placeholder: '产品名' }) : `<h3>${esc(p.name)}</h3>`}
                ${
                  canEdit
                    ? textNode(itemPath(itemIndex, 'summary'), p.use || p.shortDescription || '', {
                        editable: true,
                        tag: 'p',
                        className: 'hwx-retail__use',
                        multiline: true,
                        placeholder: '用途说明',
                      })
                    : `<p class="hwx-retail__use">${esc(p.use || p.shortDescription || '')}</p>`
                }
                <div class="hwx-retail__meta">
                  <div>
                    <span>核心特性</span>
                    ${
                      canEdit
                        ? textNode(itemPath(itemIndex, 'capabilities'), (p.capabilities || []).join(' · '), {
                            editable: true,
                            tag: 'p',
                            placeholder: '用 · 分隔，如：远程改价 · 低功耗',
                          })
                        : `<p>${esc((p.capabilities || []).join(' · '))}</p>`
                    }
                  </div>
                  <div>
                    <span>适用场景</span>
                    ${
                      canEdit
                        ? textNode(itemPath(itemIndex, 'scenarios'), (p.scenarios || []).join(' · '), {
                            editable: true,
                            tag: 'p',
                            placeholder: '用 · 分隔，如：门店 · 货架',
                          })
                        : `<p>${esc((p.scenarios || []).join(' · '))}</p>`
                    }
                  </div>
                </div>
                <a class="hwc-text-link" href="${editable ? '#' : esc(productHref(p))}"${editable ? ' tabindex="-1"' : ''}>
                  ${
                    canEdit
                      ? `${textNode(itemPath(itemIndex, 'detailCtaLabel'), listingDetailLabel(p), {
                          editable: true,
                          tag: 'span',
                          placeholder: '查看详情',
                        })} →`
                      : `${esc(listingDetailLabel(p))} →`
                  }
                </a>
              </div>
            </article>`
              })
              .join('')}
          </div>
        </div>
      </section>
      <section class="hwx-consumer" id="hwc-consumer">
        <div class="hwc-shell">
          <header class="hwx-head">
            ${textNode('sections.consumer.kicker', consumer.kicker, { editable, tag: 'p', className: 'hwx-kicker', placeholder: '分区眉题' })}
            ${textNode('sections.consumer.title', consumer.title, { editable, tag: 'h2', placeholder: '分区标题' })}
            ${textNode('sections.consumer.subtitle', consumer.subtitle, { editable, tag: 'p', multiline: true, placeholder: '分区说明' })}
          </header>
          <div class="hwx-consumer__grid">
            ${consumerCards
              .map((p) => {
                const itemIndex = resolveItemIndex(p.id || p.slug)
                const canEdit = editable && itemIndex >= 0
                return `
            <a class="hwx-scene" href="${editable ? '#' : productHref(p)}"${editable ? ' tabindex="-1"' : ''}>
              <img src="${esc(p.scene)}" alt="${esc(p.name)}" width="1536" height="1024" loading="lazy" />
              <span class="hwx-scene__shade" aria-hidden="true"></span>
              <span class="hwx-scene__copy">
                ${canEdit ? textNode(itemPath(itemIndex, 'title'), p.name, { editable: true, tag: 'strong', placeholder: '产品名' }) : `<strong>${esc(p.name)}</strong>`}
                ${
                  canEdit
                    ? textNode(itemPath(itemIndex, 'summary'), p.use || p.shortDescription || '', {
                        editable: true,
                        tag: 'small',
                        multiline: true,
                        placeholder: '场景说明',
                      })
                    : `<small>${esc(p.use || p.shortDescription || '')}</small>`
                }
                ${
                  canEdit
                    ? textNode(itemPath(itemIndex, 'detailCtaLabel'), p.detailCtaLabel || '查看详情', {
                        editable: true,
                        tag: 'em',
                        placeholder: '查看详情',
                      })
                    : `<em>${esc(p.detailCtaLabel || '查看详情')}</em>`
                }
              </span>
            </a>`
              })
              .join('')}
          </div>
        </div>
      </section>
      <section class="hwc-cta">
        <div class="hwc-shell hwc-cta__inner">
          <div>
            ${textNode('sections.cta.title', cta.title, { editable, tag: 'h2', placeholder: '收尾标题' })}
            ${textNode('sections.cta.subtitle', cta.subtitle, { editable, tag: 'p', multiline: true, placeholder: '收尾说明' })}
          </div>
          <div class="hwc-cta__actions">
            <button type="button" class="hwc-btn hwc-btn--cyan"${editable ? '' : ' data-demo-modal-open'}>
              ${textNode('sections.cta.primaryLabel', cta.primaryLabel, { editable, tag: 'span', placeholder: '主按钮' })}
            </button>
            <button type="button" class="hwc-text-link hwc-cta__link"${editable ? '' : ' data-demo-modal-open'}>
              ${textNode('sections.cta.secondaryLabel', cta.secondaryLabel, { editable, tag: 'span', placeholder: '次按钮' })}
            </button>
          </div>
        </div>
      </section>
    </div>`
}
