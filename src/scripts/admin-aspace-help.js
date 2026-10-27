/** Aspace 知识库「页面配置」可视化编辑 */

import {
  defaultDocsListRules,
  describeDocsListRules,
  normalizeDocsListRules,
  resolveHelpDocList,
} from '../lib/aspace-help-list.js'

const HELP_CAT_ICONS = [
  'description', 'folder', 'folder_managed', 'bar_chart', 'image', 'photo_library',
  'desktop_windows', 'groups', 'bolt', 'shield', 'sensors', 'campaign', 'support_agent',
]

let ctx = {
  escapeHtml: (v) => String(v ?? ''),
  toast: () => {},
  helpCategoryIconSelect: () => '',
  state: null,
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
  const docsList = normalizeDocsListRules(data.docsList || defaultDocsListRules)
  const listDocs = resolveHelpDocList(docs, docsList).slice(0, 20)
  const ruleHint = describeDocsListRules(docsList)

  return `
    <div class="admin-vedit admin-vedit--aspace-help" data-aspace-help-page-settings>
      <div class="admin-vedit-toolbar">
        <p class="admin-vedit-hint">点页面区块直接改。文档列表可配置「自动规则 / 手动编排」；精选卡片与单篇资料在「内容管理」维护。</p>
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
              <small>与应用广场同步</small>
            </div>
            ${categories.map((item, index) => `
              <div class="admin-aso-help__cat${index === 0 ? ' is-active' : ''}" data-aso-help-cat-index="${index}" title="分类与应用广场保持一致">
                <i class="material-symbols-outlined" data-aso-help-cat-icon>${esc(item.icon || 'folder')}</i>
                <span data-aso-help-cat-name>${esc(item.name || '')}</span>
              </div>
            `).join('') || '<p class="admin-form-section__hint">暂无分类</p>'}
            <p class="admin-aso-help__sync-hint">分类名称、图标与顺序跟随「应用广场」，请在应用广场调整。</p>
          </nav>

          <div class="admin-aso-help__docs" data-aso-help-anchor="docs">
            <div class="admin-aso-help__docs-head">
              <div>
                <h3>文档中心</h3>
                <p class="admin-aso-help__docs-lead" contenteditable="true" spellcheck="false" data-aso-help-preview="help-docs-lead" data-placeholder="文档中心说明">${esc(data.docsLead || '')}</p>
              </div>
              <div class="admin-aso-help__docs-actions">
                <button type="button" class="admin-aso-help__edit-chip" data-aso-help-open="docs">展示规则</button>
                <button type="button" class="admin-aso-help__edit-chip admin-aso-help__edit-chip--ghost" data-aspace-help-section="content">内容管理</button>
              </div>
            </div>
            <p class="admin-aso-help__rule-badge" data-aso-help-rule-badge>${esc(ruleHint)}</p>
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
              `).join('') || '<p class="admin-form-section__hint">按当前展示规则，列表为空。点「展示规则」调整，或去内容管理添加文档。</p>'}
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
        <input name="help-docs-list-mode" value="${esc(docsList.mode)}" />
        <input name="help-docs-list-sort" value="${esc(docsList.sort)}" />
        <input name="help-docs-list-limit" value="${esc(String(docsList.limit || 0))}" />
        <input name="help-docs-list-hide-featured" value="${docsList.hideFeatured ? '1' : '0'}" />
        <input name="help-docs-list-manual-ids" value="${esc(docsList.manualIds.join(','))}" />
      </div>
      <div hidden data-aso-help-cat-sync>
        ${categories.map((item, index) => categoryFields(item, index, categories.length)).join('')}
      </div>
      <div hidden data-aso-help-update-sync>
        ${updates.map((item, index) => updateFields(item, index)).join('') || ''}
      </div>

      ${renderDrawer('basics', '基础信息')}
      ${renderDrawer('search', '搜索热词')}
      ${renderDrawer('docs', '文档列表展示规则')}
      ${renderDrawer('updates', '最新更新')}
      ${renderDrawer('support', '客服引导')}
    </div>`
}

function readDocsListFromSync() {
  const sync = document.querySelector('[data-aso-help-field-sync]')
  if (!sync) return normalizeDocsListRules(defaultDocsListRules)
  return normalizeDocsListRules({
    mode: sync.querySelector('[name="help-docs-list-mode"]')?.value,
    sort: sync.querySelector('[name="help-docs-list-sort"]')?.value,
    limit: sync.querySelector('[name="help-docs-list-limit"]')?.value,
    hideFeatured: sync.querySelector('[name="help-docs-list-hide-featured"]')?.value !== '0',
    manualIds: String(sync.querySelector('[name="help-docs-list-manual-ids"]')?.value || '')
      .split(/[,，\s]+/)
      .map((item) => item.trim())
      .filter(Boolean),
  })
}

function writeDocsListToSync(rules) {
  const sync = document.querySelector('[data-aso-help-field-sync]')
  if (!sync) return
  const cfg = normalizeDocsListRules(rules)
  const set = (name, value) => {
    const el = sync.querySelector(`[name="${name}"]`)
    if (el) el.value = value
  }
  set('help-docs-list-mode', cfg.mode)
  set('help-docs-list-sort', cfg.sort)
  set('help-docs-list-limit', String(cfg.limit || 0))
  set('help-docs-list-hide-featured', cfg.hideFeatured ? '1' : '0')
  set('help-docs-list-manual-ids', cfg.manualIds.join(','))
}

function currentHelpDocs() {
  const docs = ctx.state?.aspaceHelp?.docs
  return Array.isArray(docs) ? docs.filter((item) => item.title) : []
}

function refreshDocListPreview() {
  const list = document.querySelector('[data-aso-help-doc-list]')
  const badge = document.querySelector('[data-aso-help-rule-badge]')
  if (!list) return
  const rules = readDocsListFromSync()
  const docs = currentHelpDocs()
  const rows = resolveHelpDocList(docs, rules).slice(0, 20)
  if (badge) badge.textContent = describeDocsListRules(rules)
  list.innerHTML = rows.length
    ? rows.map((doc) => `
        <button type="button" class="admin-aso-help__doc-row" data-aspace-help-open="${esc(doc.id || '')}" title="点击编辑该文档">
          <span class="material-symbols-outlined" aria-hidden="true">description</span>
          <b>${esc(doc.title || '')}</b>
          <time>${esc(doc.date || '')}</time>
          <i class="material-symbols-outlined" aria-hidden="true">chevron_right</i>
        </button>`).join('')
    : '<p class="admin-form-section__hint">按当前展示规则，列表为空。点「展示规则」调整，或去内容管理添加文档。</p>'
}

function collectDocsListFromDrawer(body) {
  if (!body) return readDocsListFromSync()
  const mode = body.querySelector('[name="docs-list-mode"]:checked')?.value === 'manual' ? 'manual' : 'auto'
  const sort = body.querySelector('[name="docs-list-sort"]')?.value || 'catalog'
  const limit = body.querySelector('[name="docs-list-limit"]')?.value || '0'
  const hideFeatured = Boolean(body.querySelector('[name="docs-list-hide-featured"]')?.checked)
  const manualIds = [...body.querySelectorAll('[data-docs-manual-item]')]
    .filter((row) => row.querySelector('[name="docs-manual-check"]')?.checked)
    .map((row) => row.dataset.docId || '')
    .filter(Boolean)
  return normalizeDocsListRules({ mode, sort, limit, hideFeatured, manualIds })
}

function renderDocsListDrawerBody(body) {
  const rules = readDocsListFromSync()
  const docs = currentHelpDocs()
  const selected = new Set(rules.manualIds)
  const ordered = [
    ...rules.manualIds.map((id) => docs.find((item) => item.id === id)).filter(Boolean),
    ...docs.filter((item) => !selected.has(item.id)),
  ]
  body.innerHTML = `
    <div class="admin-aso-help-rules">
      <p class="admin-form-section__hint">控制前台「全部文档」默认列表怎么出。精选大卡片仍由内容管理里「设为精选」决定。</p>
      <fieldset class="admin-aso-help-rules__mode">
        <legend>展示方式</legend>
        <label><input type="radio" name="docs-list-mode" value="auto" ${rules.mode !== 'manual' ? 'checked' : ''} /><span>自动按规则</span></label>
        <label><input type="radio" name="docs-list-mode" value="manual" ${rules.mode === 'manual' ? 'checked' : ''} /><span>手动编排</span></label>
      </fieldset>
      <div class="admin-aso-help-rules__auto" data-docs-list-auto ${rules.mode === 'manual' ? 'hidden' : ''}>
        <div class="admin-help-settings__fields">
          <label>
            <span>排序</span>
            <select name="docs-list-sort">
              <option value="catalog" ${rules.sort === 'catalog' ? 'selected' : ''}>内容管理顺序</option>
              <option value="date-desc" ${rules.sort === 'date-desc' ? 'selected' : ''}>更新日期新 → 旧</option>
              <option value="date-asc" ${rules.sort === 'date-asc' ? 'selected' : ''}>更新日期旧 → 新</option>
            </select>
          </label>
          <label>
            <span>显示条数</span>
            <input name="docs-list-limit" type="number" min="0" max="80" value="${esc(String(rules.limit || 0))}" />
          </label>
          <label class="admin-help-settings__wide admin-aso-help-rules__check">
            <input name="docs-list-hide-featured" type="checkbox" ${rules.hideFeatured ? 'checked' : ''} />
            <span>列表中排除已精选文档（避免与上方卡片重复）</span>
          </label>
        </div>
        <p class="admin-form-section__hint">显示条数填 0 表示不限制。</p>
      </div>
      <div class="admin-aso-help-rules__manual" data-docs-list-manual ${rules.mode === 'manual' ? '' : 'hidden'}>
        <p class="admin-form-section__hint">勾选要展示的文档，用上下按钮调整顺序。未勾选的不会出现在默认列表。</p>
        <div class="admin-aso-help-rules__manual-list" data-docs-manual-list>
          ${ordered.map((doc, index) => `
            <article class="admin-aso-help-rules__manual-item" data-docs-manual-item data-doc-id="${esc(doc.id || '')}">
              <label class="admin-aso-help-rules__manual-check">
                <input type="checkbox" name="docs-manual-check" ${selected.has(doc.id) ? 'checked' : ''} />
                <span>
                  <b>${esc(doc.title || '未命名')}</b>
                  <small>${doc.featured ? '精选 · ' : ''}${esc(doc.category || '')} · ${esc(doc.date || '—')}</small>
                </span>
              </label>
              <div class="admin-aso-help-rules__manual-order">
                <button type="button" data-docs-manual-move="-1" ${index === 0 ? 'disabled' : ''} title="上移"><span class="material-symbols-outlined">arrow_upward</span></button>
                <button type="button" data-docs-manual-move="1" ${index === ordered.length - 1 ? 'disabled' : ''} title="下移"><span class="material-symbols-outlined">arrow_downward</span></button>
              </div>
            </article>
          `).join('') || '<p class="admin-form-section__hint">暂无文档，请先去内容管理新建。</p>'}
        </div>
      </div>
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
    docs: '[data-aso-help-field-sync]',
    categories: '[data-aso-help-cat-sync]',
    updates: '[data-aso-help-update-sync]',
  }
  const sync = document.querySelector(syncMap[kind] || '')
  if (body && sync && ['categories', 'updates'].includes(kind)) {
    [...body.children].forEach((child) => sync.appendChild(child))
  } else if (body && kind === 'docs') {
    writeDocsListToSync(collectDocsListFromDrawer(body))
    body.innerHTML = ''
  } else if (body && sync && ['basics', 'search', 'support'].includes(kind)) {
    body.querySelectorAll('[name]').forEach((field) => {
      const target = sync.querySelector(`[name="${CSS.escape(field.name)}"]`)
      if (target) target.value = field.value
    })
    body.innerHTML = ''
  }
  if (kind === 'categories') refreshCategoryPreview()
  if (kind === 'updates') refreshUpdatePreview()
  if (kind === 'search') refreshHotPreview()
  if (kind === 'docs') refreshDocListPreview()
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
  } else if (kind === 'docs') {
    renderDocsListDrawerBody(body)
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
    const manualMove = event.target.closest('[data-docs-manual-move]')
    if (manualMove) {
      event.preventDefault()
      const list = manualMove.closest('[data-docs-manual-list]')
      const row = manualMove.closest('[data-docs-manual-item]')
      if (!list || !row) return
      const delta = Number(manualMove.dataset.docsManualMove || 0)
      const rows = [...list.querySelectorAll('[data-docs-manual-item]')]
      const index = rows.indexOf(row)
      const target = index + delta
      if (index < 0 || target < 0 || target >= rows.length) return
      if (delta < 0) list.insertBefore(row, rows[target])
      else list.insertBefore(row, rows[target].nextSibling)
      writeDocsListToSync(collectDocsListFromDrawer(manualMove.closest('[data-aso-help-drawer-body]')))
      refreshDocListPreview()
      renderDocsListDrawerBody(manualMove.closest('[data-aso-help-drawer-body]'))
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
      if (drawerField.name?.startsWith('docs-list-') || drawerField.name === 'docs-manual-check') {
        const body = drawerField.closest('[data-aso-help-drawer-body]')
        if (drawerField.name === 'docs-list-mode') {
          const auto = body?.querySelector('[data-docs-list-auto]')
          const manual = body?.querySelector('[data-docs-list-manual]')
          const isManual = drawerField.value === 'manual' && drawerField.checked
          if (auto) auto.hidden = isManual
          if (manual) manual.hidden = !isManual
        }
        writeDocsListToSync(collectDocsListFromDrawer(body))
        refreshDocListPreview()
        return
      }
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
    const docsMode = event.target.closest('[name="docs-list-mode"]')
    if (docsMode) {
      const body = docsMode.closest('[data-aso-help-drawer-body]')
      const auto = body?.querySelector('[data-docs-list-auto]')
      const manual = body?.querySelector('[data-docs-list-manual]')
      const isManual = body?.querySelector('[name="docs-list-mode"]:checked')?.value === 'manual'
      if (auto) auto.hidden = isManual
      if (manual) manual.hidden = !isManual
      writeDocsListToSync(collectDocsListFromDrawer(body))
      refreshDocListPreview()
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
