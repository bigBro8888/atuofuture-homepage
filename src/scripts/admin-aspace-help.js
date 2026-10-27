/** Aspace 知识库「页面配置」可视化编辑 */

const HELP_CAT_ICONS = [
  'description', 'folder', 'folder_managed', 'bar_chart', 'image', 'photo_library',
  'desktop_windows', 'groups', 'bolt', 'shield', 'sensors', 'campaign', 'support_agent',
]

let ctx = {
  escapeHtml: (v) => String(v ?? ''),
  toast: () => {},
  helpCategoryIconSelect: () => '',
}

function esc(value) {
  return ctx.escapeHtml(value)
}

function hotSearchesText(list) {
  return (Array.isArray(list) ? list : []).join('，')
}

function categoryFields(item, index, total) {
  return `
    <article class="admin-help-settings__item" data-aspace-help-category>
      <div class="admin-help-settings__item-order">
        <span>${String(index + 1).padStart(2, '0')}</span>
        <button type="button" data-aspace-help-cat-move="-1" ${index <= 1 ? 'disabled' : ''} title="上移"><span class="material-symbols-outlined">arrow_upward</span></button>
        <button type="button" data-aspace-help-cat-move="1" ${index === 0 || index === total - 1 ? 'disabled' : ''} title="下移"><span class="material-symbols-outlined">arrow_downward</span></button>
      </div>
      <div class="admin-help-settings__item-icon">
        <span class="material-symbols-outlined" data-aspace-help-cat-icon-preview>${esc(item.icon || 'folder')}</span>
        ${ctx.helpCategoryIconSelect(item.icon || 'folder', index === 0)}
      </div>
      <label><span>分类名称</span><input name="cat-name" maxlength="40" value="${esc(item.name || '')}" ${index === 0 ? 'readonly' : ''} required /></label>
      <button type="button" class="admin-help-settings__item-remove" data-aspace-help-remove="category" ${index === 0 ? 'hidden' : ''}>删除</button>
    </article>`
}

function updateFields(item, index) {
  return `
    <article class="admin-help-settings__item admin-help-settings__item--update" data-aspace-help-update>
      <span class="admin-help-settings__item-index">${String(index + 1).padStart(2, '0')}</span>
      <div class="admin-help-settings__item-body">
        <div class="admin-help-settings__fields">
          <label><span>日期</span><input name="upd-date" maxlength="20" value="${esc(item.date || '')}" /></label>
          <label><span>标题</span><input name="upd-title" maxlength="80" value="${esc(item.title || '')}" required /></label>
          <label class="admin-help-settings__wide"><span>说明</span><input name="upd-desc" maxlength="200" value="${esc(item.desc || '')}" /></label>
        </div>
      </div>
      <button type="button" class="admin-help-settings__item-remove" data-aspace-help-remove="update">删除</button>
    </article>`
}

function renderDrawer(kind, title) {
  return `
    <div class="admin-aso-help-drawer" data-aso-help-drawer="${kind}" hidden>
      <div class="admin-aso-help-drawer__backdrop" data-aso-help-drawer-close></div>
      <aside class="admin-aso-help-drawer__panel" role="dialog" aria-modal="true">
        <header>
          <div>
            <p>页面配置</p>
            <h3 data-aso-help-drawer-title>${esc(title)}</h3>
          </div>
          <button type="button" data-aso-help-drawer-close aria-label="关闭">×</button>
        </header>
        <div class="admin-aso-help-drawer__body" data-aso-help-drawer-body></div>
        <footer>
          <button type="button" data-aso-help-drawer-close>完成</button>
        </footer>
      </aside>
    </div>`
}

export function renderAspaceHelpPageVisualMarkup(data = {}, helpers = {}) {
  if (helpers.helpCategoryIconSelect) ctx.helpCategoryIconSelect = helpers.helpCategoryIconSelect
  if (helpers.escapeHtml) ctx.escapeHtml = helpers.escapeHtml
  if (helpers.toast) ctx.toast = helpers.toast
  const categories = Array.isArray(data.categories) ? data.categories : []
  const updates = Array.isArray(data.updates) ? data.updates : []
  const hot = Array.isArray(data.hotSearches) ? data.hotSearches : []
  const featured = Array.isArray(data.featuredDocs) ? data.featuredDocs.slice(0, 4) : []
  const docs = Array.isArray(data.docs) ? data.docs.filter((item) => item.title) : []
  const listDocs = docs.filter((item) => !item.featured).slice(0, 12)

  return `
    <div class="admin-vedit admin-vedit--aspace-help" data-aspace-help-page-settings>
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">点页面区块直接改：标题/导语/搜索热词/分类/更新/客服。左侧分类可拖拽排序。点精选卡片或下方文档列表可进入「内容管理」编辑资料。</p>
        <button type="button" class="admin-vedit-fullscreen-btn" data-aso-help-fullscreen>
          <span class="material-symbols-outlined" aria-hidden="true">fullscreen</span>
          全屏编辑
        </button>
      </div>
      <div class="admin-vedit-canvas admin-aso-help" data-aspace-help-visual>
        <div class="admin-vedit-fullscreen-bar" hidden>
          <strong>知识库页面 · 全屏编辑</strong>
          <button type="button" data-aso-help-fullscreen-exit>
            <span class="material-symbols-outlined" aria-hidden="true">fullscreen_exit</span>
            退出全屏
          </button>
        </div>

        <header class="admin-aso-help__head" data-aso-help-anchor="basics">
          <div class="admin-aso-help__intro">
            <p class="admin-aso-help__eyebrow">HELP CENTER</p>
            <h2 contenteditable="true" spellcheck="false" data-aso-help-preview="help-title" data-placeholder="知识库标题">${esc(data.title || '知识库')}</h2>
            <p class="admin-aso-help__lead" contenteditable="true" spellcheck="false" data-aso-help-preview="help-lead" data-placeholder="页面导语">${esc(data.lead || '')}</p>
            <button type="button" class="admin-aso-help__edit-chip" data-aso-help-open="basics">编辑基础信息</button>
          </div>
          <div class="admin-aso-help__find" data-aso-help-anchor="search">
            <div class="admin-aso-help__search">
              <span class="material-symbols-outlined">search</span>
              <em contenteditable="true" spellcheck="false" data-aso-help-preview="help-search-placeholder" data-placeholder="搜索占位文案">${esc(data.searchPlaceholder || '')}</em>
              <b>搜索</b>
            </div>
            <div class="admin-aso-help__hot">
              <span>热门搜索：</span>
              <div class="admin-aso-help__hot-list" data-aso-help-hot-list>
                ${hot.map((word) => `<button type="button" data-aso-help-open="search">${esc(word)}</button>`).join('') || '<button type="button" data-aso-help-open="search">添加热词</button>'}
              </div>
              <button type="button" class="admin-aso-help__edit-chip" data-aso-help-open="search">编辑热词</button>
            </div>
          </div>
        </header>

        <div class="admin-aso-help__grid">
          <nav class="admin-aso-help__cats" data-aso-help-anchor="categories" data-aso-help-cat-nav aria-label="文档分类">
            <div class="admin-aso-help__side-label">
              <span>文档分类</span>
              <small>拖拽排序</small>
            </div>
            ${categories.map((item, index) => `
              <button type="button" class="admin-aso-help__cat${index === 0 ? ' is-active' : ''}" draggable="${index === 0 ? 'false' : 'true'}" data-aso-help-cat-index="${index}" data-aso-help-open="categories" title="${index === 0 ? '全部文档固定首位' : '拖拽排序，点击编辑'}">
                ${index === 0 ? '' : '<span class="admin-aso-help__cat-drag material-symbols-outlined" aria-hidden="true">drag_indicator</span>'}
                <i class="material-symbols-outlined" data-aso-help-cat-icon>${esc(item.icon || 'folder')}</i>
                <span data-aso-help-cat-name>${esc(item.name || '')}</span>
              </button>
            `).join('') || '<p class="admin-form-section__hint">暂无分类</p>'}
            <button type="button" class="admin-aso-help__add" data-aspace-help-add="category">+ 新增分类</button>
          </nav>

          <div class="admin-aso-help__docs" data-aso-help-anchor="docs">
            <div class="admin-aso-help__docs-head">
              <div>
                <h3>文档中心</h3>
                <p class="admin-aso-help__docs-lead" contenteditable="true" spellcheck="false" data-aso-help-preview="help-docs-lead" data-placeholder="文档中心说明">${esc(data.docsLead || '')}</p>
              </div>
              <button type="button" class="admin-aso-help__edit-chip" data-aspace-help-section="content">编辑文档</button>
            </div>
            <div class="admin-aso-help__features">
              ${featured.map((doc) => `
                <button type="button" class="admin-aso-help__doc-card" data-aspace-help-open="${esc(doc.id || '')}" title="点击编辑该文档">
                  <em>${esc(doc.badge || '精选')}</em>
                  <b>${esc(doc.title || '')}</b>
                  <time>${esc(doc.date || '')}</time>
                </button>
              `).join('') || '<p class="admin-form-section__hint">暂无精选。在「内容管理」勾选推荐后会显示在这里。</p>'}
            </div>
            <div class="admin-aso-help__doc-list" data-aso-help-doc-list>
              ${listDocs.map((doc) => `
                <button type="button" class="admin-aso-help__doc-row" data-aspace-help-open="${esc(doc.id || '')}" title="点击编辑该文档">
                  <span class="material-symbols-outlined" aria-hidden="true">description</span>
                  <b>${esc(doc.title || '')}</b>
                  <time>${esc(doc.date || '')}</time>
                  <i class="material-symbols-outlined" aria-hidden="true">chevron_right</i>
                </button>
              `).join('') || (docs.length
                ? '<p class="admin-form-section__hint">当前文档均已设为精选，普通列表为空。</p>'
                : '<p class="admin-form-section__hint">暂无文档，点击下方新建。</p>')}
            </div>
            <button type="button" class="admin-aso-help__add" data-aspace-help-add="doc">+ 新建文档</button>
          </div>

          <aside class="admin-aso-help__updates" data-aso-help-anchor="updates">
            <header>
              <h3><span class="material-symbols-outlined">campaign</span> 最新更新</h3>
              <button type="button" data-aso-help-open="updates">编辑</button>
            </header>
            <ol data-aso-help-update-preview>
              ${updates.map((item) => `
                <li>
                  <time>${esc(item.date || '')}</time>
                  <div>
                    <b>${esc(item.title || '')}</b>
                    <p>${esc(item.desc || '')}</p>
                  </div>
                </li>
              `).join('') || '<li class="admin-form-section__hint">暂无更新，点击编辑添加</li>'}
            </ol>
            <button type="button" class="admin-aso-help__add" data-aspace-help-add="update">+ 新增更新</button>
          </aside>
        </div>

        <button type="button" class="admin-aso-help__support" data-aso-help-anchor="support" data-aso-help-open="support">
          <span class="admin-aso-help__support-icon material-symbols-outlined">headset_mic</span>
          <span class="admin-aso-help__support-copy">
            <b contenteditable="true" spellcheck="false" data-aso-help-preview="help-support-title" data-placeholder="客服主文案">${esc(data.support?.title || '')}</b>
            <small contenteditable="true" spellcheck="false" data-aso-help-preview="help-support-subtitle" data-placeholder="补充说明">${esc(data.support?.subtitle || '')}</small>
          </span>
          <span class="admin-aso-help__support-action">立即联系 →</span>
        </button>
      </div>

      <div hidden data-aso-help-field-sync>
        <input name="help-title" maxlength="40" value="${esc(data.title || '')}" />
        <input name="help-lead" maxlength="120" value="${esc(data.lead || '')}" />
        <input name="help-docs-lead" maxlength="120" value="${esc(data.docsLead || '')}" />
        <input name="help-search-placeholder" maxlength="120" value="${esc(data.searchPlaceholder || '')}" />
        <input name="help-hot-searches" maxlength="240" value="${esc(hotSearchesText(hot))}" />
        <input name="help-support-title" maxlength="80" value="${esc(data.support?.title || '')}" />
        <input name="help-support-subtitle" maxlength="120" value="${esc(data.support?.subtitle || '')}" />
      </div>
      <div hidden data-aso-help-cat-sync>
        ${categories.map((item, index) => categoryFields(item, index, categories.length)).join('')}
      </div>
      <div hidden data-aso-help-update-sync>
        ${updates.map((item, index) => updateFields(item, index)).join('') || ''}
      </div>

      ${renderDrawer('basics', '基础信息')}
      ${renderDrawer('search', '搜索热词')}
      ${renderDrawer('categories', '文档分类')}
      ${renderDrawer('updates', '最新更新')}
      ${renderDrawer('support', '客服引导')}
    </div>`
}

function setFullscreen(on) {
  const wrap = document.querySelector('.admin-vedit--aspace-help')
  const canvas = document.querySelector('[data-aspace-help-visual]')
  const bar = canvas?.querySelector('.admin-vedit-fullscreen-bar')
  if (!wrap || !canvas) return
  wrap.classList.toggle('is-fullscreen', on)
  document.body.classList.toggle('admin-aspace-help-fullscreen', on)
  if (bar) bar.hidden = !on
}

function syncPreviewToInput(previewEl) {
  const name = previewEl?.dataset.asoHelpPreview
  if (!name) return
  const input = document.querySelector(`[data-aso-help-field-sync] [name="${CSS.escape(name)}"]`)
  if (!input) return
  const text = (previewEl.innerText || '').replace(/\u00a0/g, ' ').trim()
  input.value = text
}

function syncInputToPreview(name) {
  const input = document.querySelector(`[data-aso-help-field-sync] [name="${CSS.escape(name)}"]`)
  const preview = document.querySelector(`[data-aso-help-preview="${CSS.escape(name)}"]`)
  if (preview && input) preview.textContent = input.value
}

function refreshHotPreview() {
  const input = document.querySelector('[data-aso-help-field-sync] [name="help-hot-searches"]')
  const list = document.querySelector('[data-aso-help-hot-list]')
  if (!input || !list) return
  const words = String(input.value || '')
    .split(/[,，、]/)
    .map((item) => item.trim())
    .filter(Boolean)
  list.innerHTML = words.length
    ? words.map((word) => `<button type="button" data-aso-help-open="search">${esc(word)}</button>`).join('')
    : '<button type="button" data-aso-help-open="search">添加热词</button>'
}

function refreshCategoryPreview() {
  const nav = document.querySelector('[data-aso-help-cat-nav]')
  const sync = document.querySelector('[data-aso-help-cat-sync]')
  if (!nav || !sync) return
  const rows = [...document.querySelectorAll('[data-aspace-help-category]')]
  const addBtn = nav.querySelector('[data-aspace-help-add="category"]')
  const label = nav.querySelector('.admin-aso-help__side-label')
  ;[...nav.querySelectorAll('[data-aso-help-cat-index]')].forEach((el) => el.remove())
  rows.forEach((row, index) => {
    const name = row.querySelector('[name="cat-name"]')?.value.trim() || ''
    const icon = row.querySelector('[name="cat-icon"]')?.value.trim() || 'folder'
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `admin-aso-help__cat${index === 0 ? ' is-active' : ''}`
    btn.draggable = index !== 0
    btn.dataset.asoHelpCatIndex = String(index)
    btn.dataset.asoHelpOpen = 'categories'
    btn.title = index === 0 ? '全部文档固定首位' : '拖拽排序，点击编辑'
    btn.innerHTML = `
      ${index === 0 ? '' : '<span class="admin-aso-help__cat-drag material-symbols-outlined" aria-hidden="true">drag_indicator</span>'}
      <i class="material-symbols-outlined" data-aso-help-cat-icon>${esc(icon)}</i>
      <span data-aso-help-cat-name>${esc(name)}</span>`
    if (addBtn) nav.insertBefore(btn, addBtn)
    else nav.appendChild(btn)
  })
  if (label && addBtn) {
    // keep label at top
  }
}

function refreshUpdatePreview() {
  const list = document.querySelector('[data-aso-help-update-preview]')
  if (!list) return
  const rows = [...document.querySelectorAll('[data-aspace-help-update]')]
  list.innerHTML = rows.length
    ? rows.map((row) => {
      const date = row.querySelector('[name="upd-date"]')?.value.trim() || ''
      const title = row.querySelector('[name="upd-title"]')?.value.trim() || ''
      const desc = row.querySelector('[name="upd-desc"]')?.value.trim() || ''
      return `<li><time>${esc(date)}</time><div><b>${esc(title)}</b><p>${esc(desc)}</p></div></li>`
    }).join('')
    : '<li class="admin-form-section__hint">暂无更新，点击编辑添加</li>'
}

function closeHelpDrawer() {
  const drawer = document.querySelector('.admin-aso-help-drawer:not([hidden])')
  if (!drawer) return
  const kind = drawer.dataset.asoHelpDrawer
  const body = drawer.querySelector('[data-aso-help-drawer-body]')
  const syncMap = {
    basics: '[data-aso-help-field-sync]',
    search: '[data-aso-help-field-sync]',
    support: '[data-aso-help-field-sync]',
    categories: '[data-aso-help-cat-sync]',
    updates: '[data-aso-help-update-sync]',
  }
  const sync = document.querySelector(syncMap[kind] || '')
  if (body && sync && ['categories', 'updates'].includes(kind)) {
    [...body.children].forEach((child) => sync.appendChild(child))
  } else if (body && sync && ['basics', 'search', 'support'].includes(kind)) {
    // fields were cloned/moved? we use templates in body - write back
    body.querySelectorAll('[name]').forEach((field) => {
      const target = sync.querySelector(`[name="${CSS.escape(field.name)}"]`)
      if (target) target.value = field.value
    })
    body.innerHTML = ''
  }
  if (kind === 'categories') refreshCategoryPreview()
  if (kind === 'updates') refreshUpdatePreview()
  if (kind === 'search') refreshHotPreview()
  if (kind === 'basics') {
    syncInputToPreview('help-title')
    syncInputToPreview('help-lead')
    syncInputToPreview('help-docs-lead')
  }
  if (kind === 'support') {
    syncInputToPreview('help-support-title')
    syncInputToPreview('help-support-subtitle')
  }
  drawer.hidden = true
}

function openHelpDrawer(kind) {
  closeHelpDrawer()
  const drawer = document.querySelector(`[data-aso-help-drawer="${CSS.escape(kind)}"]`)
  const body = drawer?.querySelector('[data-aso-help-drawer-body]')
  if (!drawer || !body) return
  body.innerHTML = ''
  if (kind === 'basics') {
    const sync = document.querySelector('[data-aso-help-field-sync]')
    body.innerHTML = `
      <div class="admin-help-settings__fields">
        <label><span>标题</span><input name="help-title" maxlength="40" value="${esc(sync.querySelector('[name="help-title"]')?.value || '')}" /></label>
        <label class="admin-help-settings__wide"><span>导语</span><input name="help-lead" maxlength="120" value="${esc(sync.querySelector('[name="help-lead"]')?.value || '')}" /></label>
        <label class="admin-help-settings__wide"><span>文档中心说明</span><input name="help-docs-lead" maxlength="120" value="${esc(sync.querySelector('[name="help-docs-lead"]')?.value || '')}" /></label>
      </div>`
  } else if (kind === 'search') {
    const sync = document.querySelector('[data-aso-help-field-sync]')
    body.innerHTML = `
      <div class="admin-help-settings__fields">
        <label class="admin-help-settings__wide"><span>搜索占位文案</span><input name="help-search-placeholder" maxlength="120" value="${esc(sync.querySelector('[name="help-search-placeholder"]')?.value || '')}" /></label>
        <label class="admin-help-settings__wide"><span>热门搜索</span><input name="help-hot-searches" maxlength="240" value="${esc(sync.querySelector('[name="help-hot-searches"]')?.value || '')}" placeholder="例如：会议室预约，权限申请" /></label>
      </div>
      <p class="admin-form-section__hint">多个热词用逗号分隔。</p>`
  } else if (kind === 'support') {
    const sync = document.querySelector('[data-aso-help-field-sync]')
    body.innerHTML = `
      <div class="admin-help-settings__fields">
        <label class="admin-help-settings__wide"><span>主文案</span><input name="help-support-title" maxlength="80" value="${esc(sync.querySelector('[name="help-support-title"]')?.value || '')}" /></label>
        <label class="admin-help-settings__wide"><span>补充说明</span><input name="help-support-subtitle" maxlength="120" value="${esc(sync.querySelector('[name="help-support-subtitle"]')?.value || '')}" /></label>
      </div>`
  } else if (kind === 'categories') {
    const sync = document.querySelector('[data-aso-help-cat-sync]')
    const header = document.createElement('div')
    header.className = 'admin-aso-help-drawer__toolbar'
    header.innerHTML = `<button type="button" data-aspace-help-add="category">新增分类</button>`
    body.appendChild(header)
    ;[...sync.querySelectorAll('[data-aspace-help-category]')].forEach((row) => body.appendChild(row))
  } else if (kind === 'updates') {
    const sync = document.querySelector('[data-aso-help-update-sync]')
    const header = document.createElement('div')
    header.className = 'admin-aso-help-drawer__toolbar'
    header.innerHTML = `<button type="button" data-aspace-help-add="update">新增更新</button>`
    body.appendChild(header)
    ;[...sync.querySelectorAll('[data-aspace-help-update]')].forEach((row) => body.appendChild(row))
    if (!sync.querySelector('[data-aspace-help-update]') && !body.querySelector('[data-aspace-help-update]')) {
      const empty = document.createElement('p')
      empty.className = 'admin-form-section__hint'
      empty.textContent = '还没有更新动态。'
      body.appendChild(empty)
    }
  }
  drawer.hidden = false
}

function syncCategoryOrderFromNav(nav) {
  const sync = document.querySelector('[data-aso-help-cat-sync]')
  const drawerBody = document.querySelector('[data-aso-help-drawer="categories"] [data-aso-help-drawer-body]')
  if (!nav || !sync) return
  const buttons = [...nav.querySelectorAll('[data-aso-help-cat-index]')]
  // first must stay 全部文档
  const first = buttons.find((btn) => Number(btn.dataset.asoHelpCatIndex) === 0) || buttons[0]
  const rest = buttons.filter((btn) => btn !== first)
  const orderedIndexes = [0, ...rest.map((btn) => Number(btn.dataset.asoHelpCatIndex))]
  const host = drawerBody && !drawerBody.closest('[hidden]') ? drawerBody : sync
  const articles = [...document.querySelectorAll('[data-aspace-help-category]')]
  const byOldIndex = articles
  const reordered = orderedIndexes.map((i) => byOldIndex[i]).filter(Boolean)
  // Ensure first is 全部文档 article
  if (reordered[0] && articles[0] && reordered[0] !== articles[0]) {
    // rebuild: keep articles[0] first, then rest in visual order excluding first visual if wrong
    const firstArticle = articles[0]
    const others = rest.map((btn) => articles[Number(btn.dataset.asoHelpCatIndex)]).filter((row) => row && row !== firstArticle)
    reordered.length = 0
    reordered.push(firstArticle, ...others)
  }
  const toolbar = host.querySelector('.admin-aso-help-drawer__toolbar')
  reordered.forEach((row) => host.appendChild(row))
  if (toolbar) host.prepend(toolbar)
  // reindex buttons
  refreshCategoryPreview()
}

function initHelpCategoryDrag(editor) {
  const nav = editor.querySelector('[data-aso-help-cat-nav]')
  if (!nav || nav.dataset.dragBound === '1') return
  nav.dataset.dragBound = '1'
  let dragged = null
  let didDrag = false

  nav.addEventListener('dragstart', (event) => {
    const button = event.target.closest('[data-aso-help-cat-index]')
    if (!button || Number(button.dataset.asoHelpCatIndex) === 0) {
      event.preventDefault()
      return
    }
    dragged = button
    didDrag = false
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', button.dataset.asoHelpCatIndex || '')
    window.requestAnimationFrame(() => button.classList.add('is-dragging'))
  })

  nav.addEventListener('dragover', (event) => {
    if (!dragged) return
    const target = event.target.closest('[data-aso-help-cat-index]')
    if (!target || target === dragged || Number(target.dataset.asoHelpCatIndex) === 0) return
    event.preventDefault()
    didDrag = true
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
}

export function flushAspaceHelpVisualDrawer() {
  if (document.querySelector('.admin-aso-help-drawer:not([hidden])')) closeHelpDrawer()
}

export function bindAspaceHelpVisualAdmin(helpers = {}) {
  ctx = { ...ctx, ...helpers }
  const editor = document.querySelector('[data-aspace-editor]')
  if (!editor) return

  editor.addEventListener('pointerdown', () => {
    initHelpCategoryDrag(editor)
  }, true)

  editor.addEventListener('click', (event) => {
    if (event.target.closest('[data-aso-help-fullscreen]')) {
      event.preventDefault()
      setFullscreen(true)
      return
    }
    if (event.target.closest('[data-aso-help-fullscreen-exit]')) {
      event.preventDefault()
      setFullscreen(false)
      return
    }
    if (event.target.closest('[data-aso-help-drawer-close]')) {
      event.preventDefault()
      closeHelpDrawer()
      return
    }
    const open = event.target.closest('[data-aso-help-open]')
    if (open && editor.contains(open)) {
      const nav = open.closest('[data-aso-help-cat-nav]')
      if (nav?.dataset.suppressClick === '1') return
      // don't steal clicks from contenteditable
      if (event.target.closest('[contenteditable="true"]')) return
      event.preventDefault()
      openHelpDrawer(open.dataset.asoHelpOpen)
    }
  })

  editor.addEventListener('input', (event) => {
    const preview = event.target.closest('[data-aso-help-preview]')
    if (preview) {
      syncPreviewToInput(preview)
      return
    }
    const drawerField = event.target.closest('.admin-aso-help-drawer [name]')
    if (drawerField) {
      const sync = document.querySelector(`[data-aso-help-field-sync] [name="${CSS.escape(drawerField.name)}"]`)
      if (sync) sync.value = drawerField.value
      if (drawerField.name === 'help-hot-searches') refreshHotPreview()
      if (drawerField.name?.startsWith('help-')) syncInputToPreview(drawerField.name)
      if (drawerField.name === 'cat-name' || drawerField.name === 'cat-icon') refreshCategoryPreview()
      if (drawerField.name?.startsWith('upd-')) refreshUpdatePreview()
    }
  })

  editor.addEventListener('change', (event) => {
    const iconSelect = event.target.closest('[data-aspace-help-cat-icon]')
    if (iconSelect) {
      const preview = iconSelect.closest('[data-aspace-help-category]')?.querySelector('[data-aspace-help-cat-icon-preview]')
      if (preview) preview.textContent = iconSelect.value || 'folder'
      refreshCategoryPreview()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (document.body.classList.contains('admin-aspace-help-fullscreen')) {
      setFullscreen(false)
      return
    }
    if (document.querySelector('.admin-aso-help-drawer:not([hidden])')) closeHelpDrawer()
  })
}

// silence unused
void HELP_CAT_ICONS
