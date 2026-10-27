/** Aspace 应用广场可视化：业务分类 + 应用资料 + 归属 合在一页 */

let ctx = {
  escapeHtml: (v) => String(v ?? ''),
  toast: () => {},
  api: null,
  state: null,
}

function esc(value) {
  return ctx.escapeHtml(value)
}

function categoryOptions(categories, selected) {
  return (categories || [])
    .map((category) => `<option value="${esc(category.id)}"${category.id === selected ? ' selected' : ''}>${esc(category.label)}</option>`)
    .join('')
}

function categoryIconMarkup(category) {
  if (category.iconUrl) return `<img src="${esc(category.iconUrl)}" alt="" />`
  return `<span class="material-symbols-outlined">${esc(category.icon || 'folder')}</span>`
}

function appCountByCategory(apps, categoryId) {
  return (apps || []).filter((app) => app.category === categoryId && !app.hidden).length
}

function renderCategoryDrawer() {
  return `
    <div class="admin-aso-plaza-drawer" data-aso-plaza-cat-drawer hidden>
      <div class="admin-aso-plaza-drawer__backdrop" data-aso-plaza-cat-close></div>
      <aside class="admin-aso-plaza-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="aso-plaza-cat-title">
        <header>
          <div>
            <p>业务分类</p>
            <h3 id="aso-plaza-cat-title">编辑分类</h3>
          </div>
          <button type="button" data-aso-plaza-cat-close aria-label="关闭">×</button>
        </header>
        <div class="admin-aso-plaza-drawer__body" data-aso-plaza-cat-body></div>
        <footer>
          <button type="button" data-aso-plaza-cat-close>完成</button>
        </footer>
      </aside>
    </div>`
}

function renderAppDrawer() {
  return `
    <div class="admin-aso-plaza-drawer" data-aso-plaza-app-drawer hidden>
      <div class="admin-aso-plaza-drawer__backdrop" data-aso-plaza-app-close></div>
      <aside class="admin-aso-plaza-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="aso-plaza-app-title">
        <header>
          <div>
            <p>应用卡片</p>
            <h3 id="aso-plaza-app-title">编辑应用</h3>
          </div>
          <button type="button" data-aso-plaza-app-close aria-label="关闭">×</button>
        </header>
        <div class="admin-aso-plaza-drawer__body" data-aso-plaza-app-body></div>
        <footer>
          <button type="button" data-aso-plaza-app-close>完成</button>
        </footer>
      </aside>
    </div>`
}

function categoryEditorFields(category, index, total) {
  return `
    <article class="admin-aso-plaza-cat-fields" data-aspace-category="${esc(category.id)}">
      <div class="admin-aso-plaza-cat-fields__order">
        <span>顺序 ${String(index + 1).padStart(2, '0')}</span>
        <button type="button" data-aspace-move="-1" ${index === 0 ? 'disabled' : ''} title="上移"><span class="material-symbols-outlined">arrow_upward</span></button>
        <button type="button" data-aspace-move="1" ${index >= total - 1 ? 'disabled' : ''} title="下移"><span class="material-symbols-outlined">arrow_downward</span></button>
      </div>
      <label><span>栏目标题</span><input name="category-label" maxlength="40" value="${esc(category.label)}" required /></label>
      <div class="admin-aspace-category__icon">
        <span>栏目图标</span>
        <div>
          <i data-aspace-icon-preview>${categoryIconMarkup(category)}</i>
          <label>上传替换<input type="file" accept="image/jpeg,image/png,image/webp" data-aspace-icon-upload /></label>
          <button type="button" data-aspace-icon-reset ${category.iconUrl ? '' : 'hidden'}>恢复默认</button>
        </div>
        <input type="hidden" name="category-icon" value="${esc(category.icon || '')}" />
        <input type="hidden" name="category-icon-url" value="${esc(category.iconUrl || '')}" />
      </div>
      <label><span>栏目说明</span><input name="category-description" maxlength="160" value="${esc(category.description || '')}" placeholder="侧栏与筛选说明，可选" /></label>
      <p class="admin-form-section__hint">保存后前台侧栏分类名称、图标和顺序会同步更新。</p>
    </article>`
}

function appEditorFields(app, categories) {
  return `
    <article class="admin-aso-plaza-app-fields" data-aspace-profile="${esc(app.id)}" data-aspace-app="${esc(app.id)}">
      <p class="admin-aso-plaza-app-fields__id">${esc(app.id)}</p>
      <div class="admin-aso-plaza-app-fields__cover">
        <figure data-aspace-cover-preview>
          ${app.image
            ? `<img src="${esc(app.image)}" alt="" />`
            : `<span class="material-symbols-outlined">image</span>`}
        </figure>
        <label class="admin-aspace-profile__url">
          <span>封面图链接</span>
          <input name="app-image" type="text" maxlength="500" value="${esc(app.image || '')}" placeholder="https://… 或 /images/…" data-aspace-cover-url />
        </label>
        <div>
          <label class="admin-aspace-profile__upload">上传封面<input type="file" accept="image/jpeg,image/png,image/webp" data-aspace-cover-upload /></label>
          <button type="button" data-aspace-cover-clear ${app.image ? '' : 'hidden'}>清除封面</button>
        </div>
      </div>
      <label><span>标题</span><input name="app-name" maxlength="40" value="${esc(app.name || '')}" required /></label>
      <label><span>简介</span><input name="app-description" maxlength="160" value="${esc(app.description || '')}" placeholder="显示在卡片上的一行说明" /></label>
      <label>
        <span>所属分类（应用归属）</span>
        <select name="app-category">${categoryOptions(categories, app.category)}</select>
      </label>
      <p class="admin-form-section__hint">改归属后，左侧分类数量与前台侧栏会一起更新。</p>
    </article>`
}

function syncHiddenCategoryFields(root, categories) {
  let host = root.querySelector('[data-aso-plaza-cat-sync]')
  if (!host) {
    host = document.createElement('div')
    host.hidden = true
    host.dataset.asoPlazaCatSync = ''
    root.appendChild(host)
  }
  host.innerHTML = (categories || []).map((category, index, list) => categoryEditorFields(category, index, list.length)).join('')
}

function syncHiddenAppFields(root, apps, categories) {
  let host = root.querySelector('[data-aso-plaza-app-sync]')
  if (!host) {
    host = document.createElement('div')
    host.hidden = true
    host.dataset.asoPlazaAppSync = ''
    root.appendChild(host)
  }
  host.innerHTML = (apps || []).map((app) => appEditorFields(app, categories)).join('')
}

export function renderAspaceAppsVisualMarkup(catalog) {
  const data = catalog || { categories: [], apps: [] }
  const categories = Array.isArray(data.categories) ? data.categories : []
  const apps = Array.isArray(data.apps) ? data.apps.filter((app) => !app.hidden) : []
  const allApps = Array.isArray(data.apps) ? data.apps : []

  return `
    <section class="admin-aspace-section" data-aspace-tab-panel="apps" hidden>
      <header>
        <div>
          <h3>应用广场</h3>
          <p>按前台布局可视化配置：点左侧分类改名称/图标/顺序；点右侧卡片改封面、文案与<strong>所属分类</strong>。保存后立即生效。</p>
        </div>
      </header>
      <div class="admin-vedit admin-vedit--aspace-apps" data-aspace-apps-editor>
        <div class="admin-vedit-toolbar">
          <p class="admin-vedit-hint">左侧分类可拖拽排序，点击编辑名称/图标；右侧点卡片改资料与归属。保存后前台同步。</p>
          <button type="button" class="admin-vedit-fullscreen-btn" data-aso-plaza-fullscreen>
            <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
            全屏编辑
          </button>
        </div>
        <div class="admin-vedit-canvas admin-aso-plaza" data-aspace-apps-visual>
          <div class="admin-vedit-fullscreen-bar" hidden>
            <strong>应用广场 · 全屏编辑</strong>
            <button type="button" data-aso-plaza-fullscreen-exit>
              <span class="material-symbols-outlined" aria-hidden="true">fullscreen_exit</span>
              退出全屏
            </button>
          </div>
          <header class="admin-aso-plaza__hero">
            <div>
              <p class="admin-aso-plaza__eyebrow">ASPACE OVERVIEW</p>
              <h2>Aspace功能全览</h2>
              <p>统一浏览空间智能业务能力与应用服务</p>
            </div>
            <div class="admin-aso-plaza__search" aria-hidden="true">
              <span class="material-symbols-outlined">search</span>
              <em>搜索能力名称、业务场景或分类…</em>
              <b>搜索</b>
            </div>
          </header>
          <div class="admin-aso-plaza__center">
            <aside class="admin-aso-plaza__sidebar">
              <nav class="admin-aso-plaza__fixed-nav" aria-hidden="true">
                <span><i class="material-symbols-outlined">star</i>我的收藏</span>
                <span class="is-active"><i class="material-symbols-outlined">grid_view</i>全部能力<em>${apps.length}</em></span>
                <span><i class="material-symbols-outlined">history</i>最近访问</span>
              </nav>
              <div class="admin-aso-plaza__divider"></div>
              <p class="admin-aso-plaza__side-label"><span>业务分类</span><small>拖拽排序 · 点击编辑</small></p>
              <nav class="admin-aso-plaza__categories" data-aso-plaza-categories>
                ${categories.map((category, index) => `
                <button type="button" class="admin-aso-plaza__cat" draggable="true" data-aso-plaza-edit-cat="${esc(category.id)}" title="拖拽排序，点击编辑：${esc(category.label)}">
                  <span class="admin-aso-plaza__cat-drag material-symbols-outlined" aria-hidden="true">drag_indicator</span>
                  <i data-aso-plaza-cat-icon>${categoryIconMarkup(category)}</i>
                  <span data-aso-plaza-cat-label>${esc(category.label)}</span>
                  <em data-aso-plaza-cat-count>${appCountByCategory(allApps, category.id)}</em>
                  <b data-aso-plaza-cat-index>${String(index + 1).padStart(2, '0')}</b>
                </button>`).join('') || '<p class="admin-form-section__hint">暂无分类</p>'}
              </nav>
            </aside>
            <div class="admin-aso-plaza__catalog">
              <header>
                <div>
                  <h3>全部业务能力</h3>
                  <p>点卡片编辑封面、标题、简介和所属分类</p>
                </div>
              </header>
              <div class="admin-aso-plaza__grid" data-aso-plaza-grid>
                ${apps.map((app) => {
                  const category = categories.find((item) => item.id === app.category)
                  return `
                  <button type="button" class="admin-aso-plaza__card" data-aso-plaza-edit-app="${esc(app.id)}" title="编辑应用：${esc(app.name)}">
                    <figure>
                      ${app.image
                        ? `<img src="${esc(app.image)}" alt="" loading="lazy" />`
                        : `<span class="admin-aso-plaza__card-empty material-symbols-outlined">image</span>`}
                      <em>运行中</em>
                    </figure>
                    <div>
                      <strong data-aso-plaza-card-name>${esc(app.name)}</strong>
                      <p data-aso-plaza-card-desc>${esc(app.description || app.project || '')}</p>
                      <small data-aso-plaza-card-cat>${esc(category?.label || app.category || '未分类')}</small>
                    </div>
                    <span class="admin-aso-plaza__card-cta">编辑卡片</span>
                  </button>`
                }).join('') || '<p class="admin-form-section__hint">暂无应用</p>'}
              </div>
            </div>
          </div>
        </div>
        <div hidden data-aso-plaza-cat-sync>
          ${categories.map((category, index) => categoryEditorFields(category, index, categories.length)).join('')}
        </div>
        <div hidden data-aso-plaza-app-sync>
          ${allApps.map((app) => appEditorFields(app, categories)).join('')}
        </div>
        ${renderCategoryDrawer()}
        ${renderAppDrawer()}
      </div>
    </section>`
}

function setFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--aspace-apps')
  const canvas = document.querySelector('[data-aspace-apps-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-aspace-apps-fullscreen', on)
  if (bar) bar.hidden = !on
}

function closeCatDrawer() {
  const drawer = document.querySelector('[data-aso-plaza-cat-drawer]')
  if (!drawer) return
  // move fields back to sync host
  const body = drawer.querySelector('[data-aso-plaza-cat-body]')
  const article = body?.querySelector('[data-aspace-category]')
  const sync = document.querySelector('[data-aso-plaza-cat-sync]')
  if (article && sync) {
    refreshCategoryPreview(article.dataset.aspaceCategory)
    sync.appendChild(article)
  }
  drawer.hidden = true
}

function closeAppDrawer() {
  const drawer = document.querySelector('[data-aso-plaza-app-drawer]')
  if (!drawer) return
  const body = drawer.querySelector('[data-aso-plaza-app-body]')
  const article = body?.querySelector('[data-aspace-profile]')
  const sync = document.querySelector('[data-aso-plaza-app-sync]')
  if (article && sync) {
    refreshAppPreview(article.dataset.aspaceProfile)
    sync.appendChild(article)
  }
  drawer.hidden = true
}

function refreshCategoryPreview(categoryId) {
  const fields = document.querySelector(`[data-aspace-category="${CSS.escape(categoryId)}"]`)
  const button = document.querySelector(`[data-aso-plaza-edit-cat="${CSS.escape(categoryId)}"]`)
  if (!fields || !button) return
  const label = fields.querySelector('[name="category-label"]')?.value.trim() || categoryId
  const iconUrl = fields.querySelector('[name="category-icon-url"]')?.value.trim() || ''
  const icon = fields.querySelector('[name="category-icon"]')?.value.trim() || 'folder'
  const labelEl = button.querySelector('[data-aso-plaza-cat-label]')
  const iconEl = button.querySelector('[data-aso-plaza-cat-icon]')
  if (labelEl) labelEl.textContent = label
  if (iconEl) {
    iconEl.innerHTML = iconUrl
      ? `<img src="${esc(iconUrl)}" alt="" />`
      : `<span class="material-symbols-outlined">${esc(icon)}</span>`
  }
  refreshCategoryCounts()
}

function refreshAppPreview(appId) {
  const fields = document.querySelector(`[data-aspace-profile="${CSS.escape(appId)}"]`)
  const card = document.querySelector(`[data-aso-plaza-edit-app="${CSS.escape(appId)}"]`)
  if (!fields) return
  const name = fields.querySelector('[name="app-name"]')?.value.trim() || appId
  const desc = fields.querySelector('[name="app-description"]')?.value.trim() || ''
  const image = fields.querySelector('[name="app-image"]')?.value.trim() || ''
  const categoryId = fields.querySelector('[name="app-category"]')?.value || ''
  const categoryLabel = fields.querySelector(`[name="app-category"] option[value="${CSS.escape(categoryId)}"]`)?.textContent
    || document.querySelector(`[data-aspace-category="${CSS.escape(categoryId)}"] [name="category-label"]`)?.value
    || categoryId
  if (card) {
    const nameEl = card.querySelector('[data-aso-plaza-card-name]')
    const descEl = card.querySelector('[data-aso-plaza-card-desc]')
    const catEl = card.querySelector('[data-aso-plaza-card-cat]')
    const figure = card.querySelector('figure')
    if (nameEl) nameEl.textContent = name
    if (descEl) descEl.textContent = desc
    if (catEl) catEl.textContent = categoryLabel || '未分类'
    if (figure) {
      if (image) {
        let img = figure.querySelector('img')
        const empty = figure.querySelector('.admin-aso-plaza__card-empty')
        if (empty) empty.remove()
        if (!img) {
          img = document.createElement('img')
          img.alt = ''
          figure.prepend(img)
        }
        img.src = image
      } else {
        figure.querySelector('img')?.remove()
        if (!figure.querySelector('.admin-aso-plaza__card-empty')) {
          const empty = document.createElement('span')
          empty.className = 'admin-aso-plaza__card-empty material-symbols-outlined'
          empty.textContent = 'image'
          figure.prepend(empty)
        }
      }
    }
  }
  refreshCategoryCounts()
}

function refreshCategoryCounts() {
  const apps = [...document.querySelectorAll('[data-aso-plaza-app-sync] [data-aspace-app]')]
  document.querySelectorAll('[data-aso-plaza-edit-cat]').forEach((button) => {
    const id = button.dataset.asoPlazaEditCat
    const count = apps.filter((row) => row.querySelector('[name="app-category"]')?.value === id).length
    const countEl = button.querySelector('[data-aso-plaza-cat-count]')
    if (countEl) countEl.textContent = String(count)
  })
}

function openCatDrawer(categoryId) {
  closeAppDrawer()
  const drawer = document.querySelector('[data-aso-plaza-cat-drawer]')
  const body = drawer?.querySelector('[data-aso-plaza-cat-body]')
  const fields = document.querySelector(`[data-aspace-category="${CSS.escape(categoryId)}"]`)
  if (!drawer || !body || !fields) return
  body.innerHTML = ''
  body.appendChild(fields)
  const title = fields.querySelector('[name="category-label"]')?.value.trim() || categoryId
  const titleEl = drawer.querySelector('#aso-plaza-cat-title')
  if (titleEl) titleEl.textContent = title
  drawer.hidden = false
}

function openAppDrawer(appId) {
  closeCatDrawer()
  const drawer = document.querySelector('[data-aso-plaza-app-drawer]')
  const body = drawer?.querySelector('[data-aso-plaza-app-body]')
  const fields = document.querySelector(`[data-aspace-profile="${CSS.escape(appId)}"]`)
  if (!drawer || !body || !fields) return
  // refresh category options from current category labels
  const select = fields.querySelector('[name="app-category"]')
  if (select) {
    const current = select.value
    const options = [...document.querySelectorAll('[data-aso-plaza-cat-sync] [data-aspace-category], [data-aso-plaza-cat-body] [data-aspace-category]')]
      .map((row) => {
        const id = row.dataset.aspaceCategory
        const label = row.querySelector('[name="category-label"]')?.value.trim() || id
        return { id, label }
      })
    if (options.length) {
      select.innerHTML = categoryOptions(options, current)
      select.value = current
    }
  }
  body.innerHTML = ''
  body.appendChild(fields)
  const title = fields.querySelector('[name="app-name"]')?.value.trim() || appId
  const titleEl = drawer.querySelector('#aso-plaza-app-title')
  if (titleEl) titleEl.textContent = title
  drawer.hidden = false
}

function renumberCategoryButtons(nav) {
  [...nav.querySelectorAll('[data-aso-plaza-edit-cat]')].forEach((button, index) => {
    const badge = button.querySelector('[data-aso-plaza-cat-index]')
    if (badge) badge.textContent = String(index + 1).padStart(2, '0')
  })
}

function syncCategoryOrderFromNav(nav) {
  const sync = document.querySelector('[data-aso-plaza-cat-sync]')
  if (!nav || !sync) return
  const order = [...nav.querySelectorAll('[data-aso-plaza-edit-cat]')].map((button) => button.dataset.asoPlazaEditCat)
  const articles = new Map([...sync.querySelectorAll('[data-aspace-category]')].map((row) => [row.dataset.aspaceCategory, row]))
  // also include article currently in open drawer
  const drawerArticle = document.querySelector('[data-aso-plaza-cat-body] [data-aspace-category]')
  if (drawerArticle) articles.set(drawerArticle.dataset.aspaceCategory, drawerArticle)
  order.forEach((id) => {
    const row = articles.get(id)
    if (row && row.parentElement === sync) sync.appendChild(row)
    else if (row && row.parentElement !== sync) {
      // keep in drawer, but ensure siblings in sync follow order for the rest
    }
  })
  // Rebuild sync order: move all to sync in order except the one in drawer
  const fragment = document.createDocumentFragment()
  order.forEach((id) => {
    const row = articles.get(id)
    if (!row) return
    if (row.parentElement?.matches?.('[data-aso-plaza-cat-body]')) return
    fragment.appendChild(row)
  })
  sync.appendChild(fragment)
  // Update move button disabled states inside sync + drawer
  const allRows = order.map((id) => articles.get(id)).filter(Boolean)
  allRows.forEach((row, index) => {
    const up = row.querySelector('[data-aspace-move="-1"]')
    const down = row.querySelector('[data-aspace-move="1"]')
    if (up) up.disabled = index === 0
    if (down) down.disabled = index >= allRows.length - 1
    const orderLabel = row.querySelector('.admin-aso-plaza-cat-fields__order span')
    if (orderLabel) orderLabel.textContent = `顺序 ${String(index + 1).padStart(2, '0')}`
  })
  renumberCategoryButtons(nav)
  if (ctx.state?.aspaceCatalog) {
    const byId = new Map(ctx.state.aspaceCatalog.categories.map((item) => [item.id, item]))
    ctx.state.aspaceCatalog.categories = order.map((id) => byId.get(id)).filter(Boolean)
  }
}

function initCategoryDrag(editor) {
  const nav = editor.querySelector('[data-aso-plaza-categories]')
  if (!nav || nav.dataset.dragBound === '1') return
  nav.dataset.dragBound = '1'
  let dragged = null
  let didDrag = false

  nav.addEventListener('dragstart', (event) => {
    const button = event.target.closest('[data-aso-plaza-edit-cat]')
    if (!button || !nav.contains(button)) return
    dragged = button
    didDrag = false
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', button.dataset.asoPlazaEditCat || '')
    window.requestAnimationFrame(() => button.classList.add('is-dragging'))
  })

  nav.addEventListener('dragover', (event) => {
    if (!dragged) return
    const target = event.target.closest('[data-aso-plaza-edit-cat]')
    if (!target || target === dragged || !nav.contains(target)) return
    event.preventDefault()
    didDrag = true
    event.dataTransfer.dropEffect = 'move'
    const rect = target.getBoundingClientRect()
    nav.insertBefore(dragged, event.clientY > rect.top + rect.height / 2 ? target.nextSibling : target)
  })

  nav.addEventListener('drop', (event) => {
    if (!dragged) return
    event.preventDefault()
    didDrag = true
  })

  nav.addEventListener('dragend', () => {
    dragged?.classList.remove('is-dragging')
    if (didDrag) {
      syncCategoryOrderFromNav(nav)
      ctx.toast?.('分类顺序已调整，点击保存后发布')
      nav.dataset.suppressClick = '1'
      window.setTimeout(() => { delete nav.dataset.suppressClick }, 0)
    }
    dragged = null
    didDrag = false
  })

  nav.addEventListener('click', (event) => {
    if (nav.dataset.suppressClick === '1') {
      event.preventDefault()
      event.stopPropagation()
    }
  }, true)
}

export function bindAspaceAppsVisualAdmin(helpers = {}) {
  ctx = { ...ctx, ...helpers }
  const editor = document.querySelector('[data-aspace-editor]')
  if (!editor) return
  initCategoryDrag(editor)

  // catalog re-render replaces DOM; re-bind via delegated MutationObserver-free approach:
  // re-init on any click into plaza if not bound
  editor.addEventListener('pointerdown', () => {
    initCategoryDrag(editor)
  }, true)

  editor.addEventListener('click', (event) => {
    if (event.target.closest('[data-aso-plaza-fullscreen]')) {
      event.preventDefault()
      setFullscreen(true)
      return
    }
    if (event.target.closest('[data-aso-plaza-fullscreen-exit]')) {
      event.preventDefault()
      setFullscreen(false)
      return
    }
    if (event.target.closest('[data-aso-plaza-cat-close]')) {
      event.preventDefault()
      closeCatDrawer()
      return
    }
    if (event.target.closest('[data-aso-plaza-app-close]')) {
      event.preventDefault()
      closeAppDrawer()
      return
    }
    const catBtn = event.target.closest('[data-aso-plaza-edit-cat]')
    if (catBtn && editor.contains(catBtn)) {
      const nav = catBtn.closest('[data-aso-plaza-categories]')
      if (nav?.dataset.suppressClick === '1') return
      event.preventDefault()
      openCatDrawer(catBtn.dataset.asoPlazaEditCat)
      return
    }
    const appBtn = event.target.closest('[data-aso-plaza-edit-app]')
    if (appBtn && editor.contains(appBtn)) {
      event.preventDefault()
      openAppDrawer(appBtn.dataset.asoPlazaEditApp)
    }
  })

  editor.addEventListener('input', (event) => {
    const catLabel = event.target.closest('[data-aspace-category] [name="category-label"]')
    if (catLabel) {
      const id = catLabel.closest('[data-aspace-category]')?.dataset.aspaceCategory
      if (id) refreshCategoryPreview(id)
      return
    }
    const appField = event.target.closest('[data-aspace-profile] [name="app-name"], [data-aspace-profile] [name="app-description"], [data-aspace-profile] [name="app-image"]')
    if (appField) {
      const id = appField.closest('[data-aspace-profile]')?.dataset.aspaceProfile
      if (id) refreshAppPreview(id)
    }
  })

  editor.addEventListener('change', (event) => {
    const categorySelect = event.target.closest('[data-aspace-profile] [name="app-category"]')
    if (categorySelect) {
      const id = categorySelect.closest('[data-aspace-profile]')?.dataset.aspaceProfile
      if (id) refreshAppPreview(id)
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (document.body.classList.contains('admin-aspace-apps-fullscreen')) {
      setFullscreen(false)
      return
    }
    const appDrawer = document.querySelector('[data-aso-plaza-app-drawer]')
    if (appDrawer && !appDrawer.hidden) {
      closeAppDrawer()
      return
    }
    const catDrawer = document.querySelector('[data-aso-plaza-cat-drawer]')
    if (catDrawer && !catDrawer.hidden) closeCatDrawer()
  })
}

// silence unused in case tree-shaken helpers needed later
void syncHiddenCategoryFields
void syncHiddenAppFields
