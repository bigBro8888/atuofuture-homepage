const API = '/api/admin'
const state = { user: null, app: null, homePage: null, aboutPage: null }
const titles = {
  overview: ['官网后台概览', '网站内容、App 下载与发布状态'],
  home: ['官网首页', '编辑草稿并发布官网核心运营内容'],
  about: ['关于我们', '编辑公司介绍、客户与联系方式'],
  config: ['App 下载页', '管理下载页文案、Banner、商店链接与按钮'],
  releases: ['版本发布', '上传、发布和回滚 Android 版本'],
  analytics: ['下载统计', '查看匿名点击趋势和终端分布'],
  users: ['账号权限', '按职责管理后台访问权限'],
  audit: ['操作审计', '追踪关键配置和发布操作'],
}
const roleNames = { super_admin: '超级管理员', editor: '运营编辑', publisher: '发布管理员', analyst: '数据查看员' }

async function api(path, options = {}) {
  const headers = { Accept: 'application/json', ...options.headers }
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  const response = await fetch(`${API}${path}`, { credentials: 'same-origin', ...options, headers })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || data.error || `请求失败（${response.status}）`)
  return data
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[character]))
}

let toastTimer
function toast(message, isError = false) {
  const element = document.querySelector('[data-toast]')
  element.textContent = message
  element.className = `admin-toast is-visible${isError ? ' is-error' : ''}`
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { element.className = 'admin-toast' }, 3500)
}

function dateTime(value) {
  if (!value) return '--'
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function showHeroImagePreview(source) {
  const preview = document.querySelector('[data-hero-image-preview]')
  if (!source) {
    preview.removeAttribute('src')
    preview.hidden = true
    return
  }
  preview.src = source
  preview.hidden = false
}

function showDesktopBannerPreview(source) {
  const preview = document.querySelector('[data-desktop-banner-preview]')
  if (!source) {
    preview.removeAttribute('src')
    preview.hidden = true
    return
  }
  preview.src = source
  preview.hidden = false
}

function showAdmin(user) {
  state.user = user
  document.querySelector('[data-login-view]').hidden = true
  document.querySelector('[data-admin-view]').hidden = false
  document.querySelector('[data-user-name]').textContent = user.name
  document.querySelector('[data-user-role]').textContent = roleNames[user.role] || user.role
  document.querySelector('[data-user-avatar]').textContent = (user.name || user.email).slice(0, 1).toUpperCase()
  document.querySelectorAll('[data-super-only]').forEach((element) => { element.hidden = user.role !== 'super_admin' })
  const initial = location.hash.replace('#', '')
  loadOverview()
  if (initial && titles[initial] && initial !== 'overview') openTab(initial, { skipHash: true })
}

function showLogin() {
  document.querySelector('[data-login-view]').hidden = false
  document.querySelector('[data-admin-view]').hidden = true
}

async function loadOverview() {
  try {
    const [{ app, currentVersion, sourceHealth }, stats] = await Promise.all([api('/app'), api('/stats?days=30')])
    state.app = app
    document.querySelector('[data-overview-version]').textContent = currentVersion ? `v${currentVersion.version}` : '--'
    document.querySelector('[data-version-source]').textContent = currentVersion?.source === 'remote' ? 'OSS 实时同步' : (currentVersion?.source || '暂无版本')
    document.querySelector('[data-overview-downloads]').textContent = stats.total.toLocaleString()
    document.querySelector('[data-health-status]').textContent = sourceHealth.status === 'healthy' ? '正常' : sourceHealth.status === 'degraded' ? '降级' : '待检查'
    document.querySelector('[data-health-time]').textContent = sourceHealth.checkedAt ? dateTime(sourceHealth.checkedAt) : '尚未检查'
    document.querySelector('[data-ios-status]').textContent = app.iosStoreUrl ? '已配置' : '未配置'
  } catch (error) {
    toast(error.message, true)
  }
}

function openTab(name, options = {}) {
  if (!titles[name]) name = 'overview'
  document.querySelectorAll('[data-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.tab === name))
  document.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === name))
  const [title, subtitle] = titles[name]
  document.querySelector('[data-page-title]').textContent = title
  document.querySelector('[data-page-subtitle]').textContent = subtitle
  document.querySelector('.admin-sidebar').classList.remove('is-open')
  if (!options.skipHash && location.hash !== `#${name}`) {
    history.replaceState(null, '', `#${name}`)
  }
  if (name === 'config') {
    loadConfig()
    window.scrollTo({ top: 0 })
    updateAnchorState()
  }
  if (name === 'home') loadHomePage()
  if (name === 'about') loadAboutPage()
  if (name === 'releases') loadReleases()
  if (name === 'analytics') loadStats()
  if (name === 'users' && state.user.role === 'super_admin') loadUsers()
  if (name === 'audit' && state.user.role === 'super_admin') loadAudit()
}

const featureIconOptions = [
  ['settings_remote', '空间控制'],
  ['lightbulb', '灯光调节'],
  ['ac_unit', '空调新风'],
  ['calendar_month', '会议预约'],
  ['confirmation_number', '工单服务'],
  ['smart_toy', 'AI 助手'],
  ['badge', '门禁通行'],
  ['sensors', '传感联动'],
  ['insights', '数据分析'],
  ['bolt', '能耗管理'],
  ['shield', '安全防护'],
  ['groups', '团队协作'],
  ['support_agent', '运营服务'],
  ['notifications', '消息提醒'],
  ['brush', '图片编辑'],
  ['auto_awesome', 'AI 创作'],
  ['sync', '一键同步'],
  ['photo_library', '相册管理'],
]

function renderFeatureCards(features) {
  const host = document.querySelector('[data-feature-cards]')
  host.innerHTML = features.items.map((item, index) => {
    const known = featureIconOptions.some(([value]) => value === item.icon)
    const options = (known ? featureIconOptions : [...featureIconOptions, [item.icon, item.icon]])
      .map(([value, label]) => `<option value="${value}"${value === item.icon ? ' selected' : ''}>${label}</option>`)
      .join('')
    return `<article class="admin-feature-card">
      <header><span class="material-symbols-outlined" data-feature-preview="${index}">${item.icon}</span><b>卡片 ${index + 1}</b></header>
      <label><span>图标</span><select name="features.items.${index}.icon" data-feature-icon="${index}">${options}</select></label>
      <label><span>标题</span><input name="features.items.${index}.title" maxlength="80" /></label>
      <label><span>描述</span><textarea name="features.items.${index}.description" rows="3" maxlength="300"></textarea></label>
    </article>`
  }).join('')

  features.items.forEach((item, index) => {
    host.querySelector(`[name="features.items.${index}.title"]`).value = item.title
    host.querySelector(`[name="features.items.${index}.description"]`).value = item.description
  })
}

async function loadConfig() {
  try {
    const { app } = await api('/app')
    state.app = app
    const form = document.querySelector('[data-config-form]')
    renderFeatureCards(app.features)
    form.elements['features.title'].value = app.features.title || ''
    form.elements['features.subtitle'].value = app.features.subtitle || ''
    for (const key of ['androidLabel', 'iosLabel', 'switchToAndroid', 'switchToIos', 'switchToAndroidTag', 'switchToIosTag']) {
      form.elements[`buttons.${key}`].value = app.buttons[key] || ''
    }
    for (const name of ['name', 'description', 'iconUrl', 'downloadTitle', 'downloadSubtitle', 'downloadDescription', 'desktopBannerUrl', 'heroImageUrl', 'iosStoreUrl', 'privacyUrl', 'termsUrl']) {
      form.elements[name].value = app[name] || ''
    }
    form.elements.heroImageFile.value = ''
    form.elements.desktopBannerFile.value = ''
    showHeroImagePreview(app.heroImageUrl)
    showDesktopBannerPreview(app.desktopBannerUrl)
    form.elements.published.checked = Boolean(app.published)
  } catch (error) { toast(error.message, true) }
}

function homeField(path, label, value, options = {}) {
  const type = options.type || 'text'
  const field = type === 'textarea'
    ? `<textarea data-home-field="${path}" rows="${options.rows || 3}">${escapeHtml(value)}</textarea>`
    : `<input data-home-field="${path}" data-home-type="${type}" type="${type === 'number' ? 'number' : 'text'}" value="${escapeHtml(value)}" ${type === 'number' ? 'min="0"' : ''} />`
  const media = options.image
    ? `<div class="admin-home-media">
        <img data-home-preview-for="${path}" src="${escapeHtml(value)}" alt="" ${value ? '' : 'hidden'} />
        <label class="admin-home-upload">上传本地图片<input type="file" accept="image/jpeg,image/png,image/webp" data-home-upload-for="${path}" /></label>
      </div>`
    : ''
  return `<label class="${options.wide ? 'admin-form-wide' : ''}"><span>${label}</span>${field}${options.help ? `<small>${options.help}</small>` : ''}${media}</label>`
}

function renderHomeEditor(content) {
  const editor = document.querySelector('[data-home-editor]')
  editor.innerHTML = `
    <fieldset>
      <legend>首屏 Hero</legend>
      <div class="admin-form-grid">
        ${homeField('hero.eyebrow', '英文眉题', content.hero.eyebrow)}
        ${homeField('hero.title', '主标题', content.hero.title)}
        ${homeField('hero.subtitle', '副标题', content.hero.subtitle, { wide: true })}
        ${homeField('hero.posterUrl', '背景 Banner 图', content.hero.posterUrl, { image: true, help: '填写图片且视频链接留空时，首页显示静态 Banner；全部留空则保留默认视频' })}
        ${homeField('hero.videoUrl', '背景视频 HTTPS 链接', content.hero.videoUrl, { help: '填写后播放该视频，并使用 Banner 图作为视频封面' })}
      </div>
    </fieldset>
    <fieldset>
      <legend>核心能力</legend>
      <div class="admin-form-grid">
        ${homeField('core.kicker', '英文眉题', content.core.kicker)}
        ${homeField('core.title', '区块标题', content.core.title)}
        ${homeField('core.subtitle', '区块说明', content.core.subtitle, { type: 'textarea', wide: true })}
      </div>
      <div class="admin-home-list">${content.core.items.map((item, index) => `
        <details ${index === 0 ? 'open' : ''}><summary>能力 ${index + 1}：${escapeHtml(item.title)}</summary>
          <div class="admin-form-grid">
            ${homeField(`core.items.${index}.icon`, '图标名称', item.icon)}
            ${homeField(`core.items.${index}.title`, '标题', item.title)}
            ${homeField(`core.items.${index}.label`, '英文标签', item.label)}
            ${homeField(`core.items.${index}.description`, '说明', item.description, { type: 'textarea', wide: true })}
          </div>
        </details>`).join('')}</div>
    </fieldset>
    <fieldset>
      <legend>合作数据</legend>
      <div class="admin-form-grid">
        ${homeField('partners.kicker', '英文眉题', content.partners.kicker)}
        ${homeField('partners.title', '区块标题', content.partners.title)}
        ${homeField('partners.subtitle', '区块说明', content.partners.subtitle, { type: 'textarea', wide: true })}
      </div>
      <div class="admin-home-metrics">${content.partners.metrics.map((metric, index) => `
        <div>
          <b>指标 ${index + 1}</b>
          ${homeField(`partners.metrics.${index}.value`, '数值', metric.value, { type: 'number' })}
          ${homeField(`partners.metrics.${index}.suffix`, '单位/后缀', metric.suffix)}
          ${homeField(`partners.metrics.${index}.label`, '名称', metric.label)}
        </div>`).join('')}</div>
    </fieldset>
    <fieldset>
      <legend>解决方案</legend>
      <div class="admin-form-grid">
        ${homeField('solutions.eyebrow', '英文眉题', content.solutions.eyebrow)}
        ${homeField('solutions.title', '区块标题', content.solutions.title)}
        ${homeField('solutions.subtitle', '区块说明', content.solutions.subtitle, { type: 'textarea', wide: true })}
        ${homeField('solutions.moreLabel', '更多按钮文字', content.solutions.moreLabel)}
        ${homeField('solutions.moreUrl', '更多按钮链接', content.solutions.moreUrl)}
      </div>
      <div class="admin-home-list">${content.solutions.items.map((item, index) => `
        <details ${index === 0 ? 'open' : ''}><summary>方案 ${index + 1}：${escapeHtml(item.title)}</summary>
          <div class="admin-form-grid">
            ${homeField(`solutions.items.${index}.chip`, '分类标签', item.chip)}
            ${homeField(`solutions.items.${index}.title`, '标题', item.title)}
            ${homeField(`solutions.items.${index}.description`, '说明', item.description, { type: 'textarea', wide: true })}
            ${homeField(`solutions.items.${index}.tags`, '标签（逗号分隔）', item.tags.join('，'), { wide: true })}
            ${homeField(`solutions.items.${index}.imageUrl`, '封面图', item.imageUrl, { image: true, help: '留空保留当前默认图片' })}
            ${homeField(`solutions.items.${index}.linkUrl`, '详情链接', item.linkUrl)}
          </div>
        </details>`).join('')}</div>
    </fieldset>
    <fieldset>
      <legend>标杆案例</legend>
      ${homeField('cases.title', '区块标题', content.cases.title)}
      <div class="admin-home-list">${content.cases.items.map((item, index) => `
        <details open><summary>案例 ${index + 1}：${escapeHtml(item.client)}</summary>
          <div class="admin-form-grid">
            ${homeField(`cases.items.${index}.client`, '客户名称', item.client)}
            ${homeField(`cases.items.${index}.title`, '案例标题', item.title)}
            ${homeField(`cases.items.${index}.description`, '案例说明', item.description, { type: 'textarea', wide: true })}
            ${homeField(`cases.items.${index}.imageUrl`, '案例图片', item.imageUrl, { image: true, help: '留空保留当前默认图片' })}
            ${homeField(`cases.items.${index}.linkUrl`, '详情链接', item.linkUrl)}
          </div>
        </details>`).join('')}</div>
    </fieldset>
    <fieldset>
      <legend>底部行动区</legend>
      <div class="admin-form-grid">
        ${homeField('cta.title', '主标题', content.cta.title, { wide: true })}
        ${homeField('cta.primaryLabel', '主按钮文字', content.cta.primaryLabel)}
        ${homeField('cta.secondaryLabel', '次按钮文字', content.cta.secondaryLabel)}
        ${homeField('cta.note', '底部说明', content.cta.note, { wide: true })}
      </div>
    </fieldset>`
}

function setHomeValue(target, path, value) {
  const parts = path.split('.')
  let cursor = target
  parts.slice(0, -1).forEach((part) => { cursor = cursor[Number.isNaN(Number(part)) ? part : Number(part)] })
  cursor[parts.at(-1)] = value
}

function collectHomeContent() {
  const content = structuredClone(state.homePage.draftContent)
  document.querySelectorAll('[data-home-field]').forEach((field) => {
    let value = field.value.trim()
    if (field.dataset.homeType === 'number') value = Number(value)
    if (field.dataset.homeField.endsWith('.tags')) value = value.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean)
    setHomeValue(content, field.dataset.homeField, value)
  })
  return content
}

function updateHomeStatus(page) {
  document.querySelector('[data-home-draft-time]').textContent = `草稿更新：${dateTime(page.updatedAt)}`
  document.querySelector('[data-home-publish-status]').textContent = page.publishedAt ? `已发布 ${dateTime(page.publishedAt)}` : '尚未发布'
}

async function loadHomePage() {
  try {
    const { page } = await api('/pages/home')
    state.homePage = page
    renderHomeEditor(page.draftContent)
    updateHomeStatus(page)
  } catch (error) { toast(error.message, true) }
}

async function saveHomeDraft({ quiet = false } = {}) {
  const content = collectHomeContent()
  const { page } = await api('/pages/home/draft', { method: 'PUT', body: JSON.stringify({ content }) })
  state.homePage = page
  updateHomeStatus(page)
  if (!quiet) toast('PC 首页草稿已保存，线上内容尚未改变')
  return page
}

function aboutField(path, label, value, options = {}) {
  const type = options.type || 'text'
  const control = type === 'textarea'
    ? `<textarea data-about-field="${path}" rows="${options.rows || 3}">${escapeHtml(value)}</textarea>`
    : `<input data-about-field="${path}" type="text" value="${escapeHtml(value)}" />`
  const media = options.image
    ? `<div class="admin-home-media">
        <img data-about-preview-for="${path}" src="${escapeHtml(value)}" alt="" ${value ? '' : 'hidden'} />
        <label class="admin-home-upload">上传本地图片<input type="file" accept="image/jpeg,image/png,image/webp" data-about-upload-for="${path}" /></label>
      </div>`
    : ''
  return `<label class="${options.wide ? 'admin-form-wide' : ''}"><span>${label}</span>${control}${options.help ? `<small>${options.help}</small>` : ''}${media}</label>`
}

function renderAboutEditor(content) {
  const editor = document.querySelector('[data-about-editor]')
  editor.innerHTML = `
    <fieldset>
      <legend>首屏主张</legend>
      <div class="admin-form-grid">
        ${aboutField('hero.title', '主标题', content.hero.title)}
        ${aboutField('hero.body', '介绍', content.hero.body, { type: 'textarea', wide: true, rows: 4 })}
        ${aboutField('hero.primaryLabel', '主按钮文字', content.hero.primaryLabel)}
        ${aboutField('hero.primaryHref', '主按钮链接', content.hero.primaryHref)}
        ${aboutField('hero.secondaryLabel', '次按钮文字', content.hero.secondaryLabel)}
        ${aboutField('hero.secondaryHref', '次按钮链接', content.hero.secondaryHref)}
        ${aboutField('hero.imageUrl', '右侧图片', content.hero.imageUrl, { image: true, wide: true })}
      </div>
    </fieldset>
    <fieldset>
      <legend>公司介绍</legend>
      <div class="admin-form-grid">
        ${aboutField('story.label', '小标题', content.story.label)}
        ${aboutField('story.title', '标题', content.story.title)}
        ${aboutField('story.body1', '第一段', content.story.body1, { type: 'textarea', wide: true })}
        ${aboutField('story.body2', '第二段', content.story.body2, { type: 'textarea', wide: true })}
        ${aboutField('story.imageUrl', '左侧图片', content.story.imageUrl, { image: true, wide: true })}
      </div>
    </fieldset>
    <fieldset>
      <legend>使命、价值观与愿景</legend>
      <div class="admin-form-grid">
        ${aboutField('values.label', '小标题', content.values.label)}
        ${aboutField('values.title', '标题', content.values.title)}
      </div>
      <div class="admin-home-list">${content.values.items.map((item, index) => `
        <details ${index === 0 ? 'open' : ''}>
          <summary>${escapeHtml(item.title)}</summary>
          <div class="admin-form-grid">
            ${aboutField(`values.items.${index}.icon`, '图标名称', item.icon)}
            ${aboutField(`values.items.${index}.title`, '名称', item.title)}
            ${aboutField(`values.items.${index}.body`, '说明', item.body, { type: 'textarea', wide: true })}
          </div>
        </details>`).join('')}
      </div>
    </fieldset>
    <fieldset>
      <legend>客户与网络</legend>
      <div class="admin-form-grid">
        ${aboutField('partners.label', '小标题', content.partners.label)}
        ${aboutField('partners.title', '标题', content.partners.title)}
        ${aboutField('partners.intro', '说明', content.partners.intro, { type: 'textarea', wide: true })}
      </div>
      <div class="admin-home-list">${content.partners.items.map((item, index) => `
        <details>
          <summary>客户 ${index + 1}</summary>
          <div class="admin-form-grid">
            ${aboutField(`partners.items.${index}.name`, '名称', item.name)}
          </div>
        </details>`).join('')}
      </div>
    </fieldset>
    <fieldset>
      <legend>责任与承诺</legend>
      <div class="admin-form-grid">
        ${aboutField('duties.label', '小标题', content.duties.label)}
        ${aboutField('duties.title', '标题', content.duties.title)}
      </div>
      <div class="admin-home-list">${content.duties.items.map((item, index) => `
        <details>
          <summary>${escapeHtml(item.title)}</summary>
          <div class="admin-form-grid">
            ${aboutField(`duties.items.${index}.title`, '标题', item.title)}
            ${aboutField(`duties.items.${index}.body`, '说明', item.body, { type: 'textarea', wide: true })}
            ${aboutField(`duties.items.${index}.imageUrl`, '图片', item.imageUrl, { image: true, wide: true })}
          </div>
        </details>`).join('')}
      </div>
    </fieldset>
    <fieldset>
      <legend>加入我们</legend>
      <div class="admin-form-grid">
        ${aboutField('join.label', '小标题', content.join.label)}
        ${aboutField('join.title', '标题', content.join.title)}
      </div>
      <div class="admin-home-list">${content.join.items.map((item, index) => `
        <details>
          <summary>${escapeHtml(item.title)}</summary>
          <div class="admin-form-grid">
            ${aboutField(`join.items.${index}.step`, '序号', item.step)}
            ${aboutField(`join.items.${index}.title`, '标题', item.title)}
            ${aboutField(`join.items.${index}.body`, '说明', item.body, { type: 'textarea', wide: true })}
          </div>
        </details>`).join('')}
      </div>
    </fieldset>
    <fieldset>
      <legend>联系我们</legend>
      <div class="admin-form-grid">
        ${aboutField('contact.label', '小标题', content.contact.label)}
        ${aboutField('contact.title', '标题', content.contact.title)}
        ${aboutField('contact.lead', '说明', content.contact.lead, { type: 'textarea', wide: true })}
        ${aboutField('contact.email1', '邮箱 1', content.contact.email1)}
        ${aboutField('contact.email2', '邮箱 2', content.contact.email2)}
        ${aboutField('contact.addressZh', '中文地址', content.contact.addressZh, { wide: true })}
        ${aboutField('contact.addressEn', '英文地址', content.contact.addressEn, { wide: true })}
        ${aboutField('contact.joinTitle', '加入标题', content.contact.joinTitle)}
        ${aboutField('contact.joinBody', '加入说明', content.contact.joinBody, { type: 'textarea', wide: true })}
        ${aboutField('contact.joinLabel', '按钮文字', content.contact.joinLabel)}
        ${aboutField('contact.joinHref', '按钮链接', content.contact.joinHref, { wide: true })}
      </div>
    </fieldset>
  `
}

function collectAboutContent() {
  const content = structuredClone(state.aboutPage.draftContent)
  document.querySelectorAll('[data-about-field]').forEach((field) => {
    setHomeValue(content, field.dataset.aboutField, field.value.trim())
  })
  return content
}

function updateAboutStatus(page) {
  document.querySelector('[data-about-draft-time]').textContent = `草稿更新：${dateTime(page.updatedAt)}`
  document.querySelector('[data-about-publish-status]').textContent = page.publishedAt ? `已发布 ${dateTime(page.publishedAt)}` : '尚未发布'
}

async function loadAboutPage() {
  try {
    const { page } = await api('/pages/about')
    state.aboutPage = page
    renderAboutEditor(page.draftContent)
    updateAboutStatus(page)
  } catch (error) { toast(error.message, true) }
}

async function saveAboutDraft({ quiet = false } = {}) {
  const content = collectAboutContent()
  const { page } = await api('/pages/about/draft', { method: 'PUT', body: JSON.stringify({ content }) })
  state.aboutPage = page
  updateAboutStatus(page)
  if (!quiet) toast('关于我们草稿已保存，线上内容尚未改变')
  return page
}

async function loadReleases() {
  try {
    const { releases } = await api('/releases')
    const list = document.querySelector('[data-release-list]')
    list.innerHTML = releases.length ? releases.map((release) => `
      <div class="admin-release-item">
        <div><strong>v${escapeHtml(release.version)} ${release.status === 'published' ? '<span class="admin-release-item__status">· 当前版本</span>' : ''}</strong><small>${dateTime(release.publishedAt || release.createdAt)} · ${release.fileSize ? `${(release.fileSize / 1048576).toFixed(1)} MB` : '历史版本'}<br>${escapeHtml(release.notes || '无更新说明')}</small></div>
        ${release.status === 'published' ? '' : `<button type="button" data-rollback="${escapeHtml(release.id)}">回滚至此版本</button>`}
      </div>`).join('') : '<div class="admin-empty">尚无后台发布记录，当前版本仍可由远程 version 获取。</div>'
  } catch (error) { toast(error.message, true) }
}

async function loadStats() {
  try {
    const stats = await api('/stats?days=30')
    const android = stats.byPlatform.android || 0
    const ios = stats.byPlatform.ios || 0
    document.querySelector('[data-stat-total]').textContent = stats.total.toLocaleString()
    document.querySelector('[data-stat-android]').textContent = android.toLocaleString()
    document.querySelector('[data-stat-ios]').textContent = ios.toLocaleString()
    document.querySelector('[data-stat-android-rate]').textContent = `${stats.total ? Math.round(android / stats.total * 100) : 0}%`
    document.querySelector('[data-stat-ios-rate]').textContent = `${stats.total ? Math.round(ios / stats.total * 100) : 0}%`

    const today = new Date()
    const days = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (29 - index))
      return date.toISOString().slice(0, 10)
    })
    const max = Math.max(1, ...days.map((day) => stats.byDay[day] || 0))
    document.querySelector('[data-day-chart]').innerHTML = days.map((day) => {
      const count = stats.byDay[day] || 0
      return `<i style="height:${Math.max(2, count / max * 100)}%" title="${day}: ${count}"></i>`
    }).join('')

    const browserEntries = Object.entries(stats.byBrowser).sort((a, b) => b[1] - a[1])
    const maxBrowser = Math.max(1, ...browserEntries.map(([, count]) => count))
    document.querySelector('[data-browser-list]').innerHTML = browserEntries.length
      ? browserEntries.map(([browser, count]) => `<div class="admin-browser-row"><span>${escapeHtml(browser)}</span><i style="--width:${count / maxBrowser * 100}%"></i><b>${count}</b></div>`).join('')
      : '<div class="admin-empty">暂无下载数据</div>'
  } catch (error) { toast(error.message, true) }
}

async function loadUsers() {
  try {
    const { users } = await api('/users')
    document.querySelector('[data-user-list]').innerHTML = users.map((user) => `
      <div class="admin-user-item"><div><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)} · ${dateTime(user.createdAt)}</small></div><em>${escapeHtml(roleNames[user.role] || user.role)}</em></div>
    `).join('')
  } catch (error) { toast(error.message, true) }
}

async function loadAudit() {
  try {
    const { logs } = await api('/audit-logs')
    document.querySelector('[data-audit-list]').innerHTML = logs.length ? logs.map((log) => `
      <div class="admin-audit-item"><span>${dateTime(log.createdAt)}</span><b>${escapeHtml(log.action)} · ${escapeHtml(log.target)}</b><span>${escapeHtml(log.userEmail)}</span></div>
    `).join('') : '<div class="admin-empty">暂无审计记录</div>'
  } catch (error) { toast(error.message, true) }
}

document.querySelector('[data-login-form]').addEventListener('submit', async (event) => {
  event.preventDefault()
  const form = event.currentTarget
  const message = document.querySelector('[data-login-message]')
  const button = form.querySelector('button')
  button.disabled = true
  message.textContent = ''
  try {
    const body = Object.fromEntries(new FormData(form).entries())
    const { user } = await api('/login', { method: 'POST', body: JSON.stringify(body) })
    form.reset()
    showAdmin(user)
  } catch (error) {
    message.textContent = error.message === 'invalid_credentials' ? '邮箱或密码错误' : error.message
  } finally { button.disabled = false }
})

document.querySelector('[data-logout]').addEventListener('click', async () => {
  try { await api('/logout', { method: 'POST' }) } finally { showLogin() }
})
document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => openTab(button.dataset.tab)))
document.querySelectorAll('[data-jump]').forEach((button) => button.addEventListener('click', () => openTab(button.dataset.jump)))
window.addEventListener('hashchange', () => {
  const name = location.hash.replace('#', '')
  if (name && titles[name]) openTab(name, { skipHash: true })
})
document.querySelector('[data-mobile-menu]').addEventListener('click', () => document.querySelector('.admin-sidebar').classList.toggle('is-open'))

document.querySelector('[name="heroImageUrl"]').addEventListener('input', (event) => {
  showHeroImagePreview(event.currentTarget.value.trim())
})
document.querySelector('[name="heroImageFile"]').addEventListener('change', (event) => {
  const file = event.currentTarget.files[0]
  if (file) showHeroImagePreview(URL.createObjectURL(file))
})
function updateAnchorState() {
  const panel = document.querySelector('[data-panel="config"]')
  if (!panel.classList.contains('is-active')) return
  const sections = [...panel.querySelectorAll('[data-section]')]
  let active = sections[0]?.dataset.section
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 120) active = section.dataset.section
  }
  document.querySelectorAll('[data-anchor]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.anchor === active)
  })
}

document.querySelector('[data-anchor-nav]').addEventListener('click', (event) => {
  const button = event.target.closest('[data-anchor]')
  if (!button) return
  document.querySelector(`[data-section="${button.dataset.anchor}"]`).scrollIntoView({ behavior: 'smooth', block: 'start' })
})

window.addEventListener('scroll', updateAnchorState, { passive: true })

document.querySelector('[data-feature-cards]').addEventListener('change', (event) => {
  const select = event.target.closest('[data-feature-icon]')
  if (!select) return
  document.querySelector(`[data-feature-preview="${select.dataset.featureIcon}"]`).textContent = select.value
})

document.querySelector('[name="desktopBannerUrl"]').addEventListener('input', (event) => {
  showDesktopBannerPreview(event.currentTarget.value.trim())
})
document.querySelector('[name="desktopBannerFile"]').addEventListener('change', (event) => {
  const file = event.currentTarget.files[0]
  if (file) showDesktopBannerPreview(URL.createObjectURL(file))
})

document.querySelector('[data-config-form]').addEventListener('submit', async (event) => {
  event.preventDefault()
  const form = event.currentTarget
  const imageFile = form.elements.heroImageFile.files[0]
  const desktopBannerFile = form.elements.desktopBannerFile.files[0]
  const body = {}
  const features = { items: [{}, {}, {}, {}] }
  const buttons = {}
  for (const [key, value] of new FormData(form).entries()) {
    const card = key.match(/^features\.items\.(\d+)\.(\w+)$/)
    if (card) features.items[Number(card[1])][card[2]] = value
    else if (key.startsWith('features.')) features[key.slice('features.'.length)] = value
    else if (key.startsWith('buttons.')) buttons[key.slice('buttons.'.length)] = value
    else body[key] = value
  }
  delete body.heroImageFile
  delete body.desktopBannerFile
  body.features = features
  body.buttons = buttons
  body.published = form.elements.published.checked
  const submit = form.querySelector('button[type="submit"]')
  submit.disabled = true
  try {
    if (imageFile) {
      const imageData = new FormData()
      imageData.append('image', imageFile)
      const uploaded = await api('/app/hero-image', { method: 'POST', body: imageData })
      body.heroImageUrl = uploaded.url
      form.elements.heroImageUrl.value = uploaded.url
    }
    if (desktopBannerFile) {
      const imageData = new FormData()
      imageData.append('image', desktopBannerFile)
      const uploaded = await api('/app/hero-image', { method: 'POST', body: imageData })
      body.desktopBannerUrl = uploaded.url
      form.elements.desktopBannerUrl.value = uploaded.url
    }
    await api('/app', { method: 'PUT', body: JSON.stringify(body) })
    toast('App 下载页配置已保存并生效')
    loadOverview()
  } catch (error) {
    toast(error.message, true)
  } finally {
    submit.disabled = false
  }
})

document.querySelector('[data-home-editor]').addEventListener('input', (event) => {
  const field = event.target.closest('[data-home-field]')
  if (!field) return
  const preview = document.querySelector(`[data-home-preview-for="${field.dataset.homeField}"]`)
  if (preview) {
    preview.src = field.value.trim()
    preview.hidden = !field.value.trim()
  }
})

document.querySelector('[data-home-form]').addEventListener('submit', (event) => event.preventDefault())

document.querySelector('[data-home-editor]').addEventListener('change', async (event) => {
  const upload = event.target.closest('[data-home-upload-for]')
  const file = upload?.files?.[0]
  if (!upload || !file) return
  const path = upload.dataset.homeUploadFor
  upload.disabled = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const { url } = await api('/pages/media/image', { method: 'POST', body: formData })
    const field = document.querySelector(`[data-home-field="${path}"]`)
    field.value = url
    field.dispatchEvent(new Event('input', { bubbles: true }))
    toast('图片上传成功，请继续保存草稿')
  } catch (error) {
    toast(error.message, true)
  } finally {
    upload.disabled = false
    upload.value = ''
  }
})

document.querySelector('[data-home-save]').addEventListener('click', async (event) => {
  const button = event.currentTarget
  button.disabled = true
  try {
    await saveHomeDraft()
  } catch (error) {
    toast(error.message, true)
  } finally {
    button.disabled = false
  }
})

document.querySelector('[data-home-publish]').addEventListener('click', async (event) => {
  if (!window.confirm('确认将当前草稿发布到 PC 首页？发布后访客将看到新内容。')) return
  const button = event.currentTarget
  button.disabled = true
  try {
    await saveHomeDraft({ quiet: true })
    const { page } = await api('/pages/home/publish', { method: 'POST' })
    state.homePage = page
    updateHomeStatus(page)
    toast('PC 首页内容已正式发布')
  } catch (error) {
    toast(error.message, true)
  } finally {
    button.disabled = false
  }
})

document.querySelector('[data-about-editor]').addEventListener('input', (event) => {
  const field = event.target.closest('[data-about-field]')
  if (!field) return
  const preview = document.querySelector(`[data-about-preview-for="${field.dataset.aboutField}"]`)
  if (preview) {
    preview.src = field.value.trim()
    preview.hidden = !field.value.trim()
  }
})

document.querySelector('[data-about-form]').addEventListener('submit', (event) => event.preventDefault())

document.querySelector('[data-about-editor]').addEventListener('change', async (event) => {
  const upload = event.target.closest('[data-about-upload-for]')
  const file = upload?.files?.[0]
  if (!upload || !file) return
  const path = upload.dataset.aboutUploadFor
  upload.disabled = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const { url } = await api('/pages/media/image', { method: 'POST', body: formData })
    const field = document.querySelector(`[data-about-field="${path}"]`)
    field.value = url
    field.dispatchEvent(new Event('input', { bubbles: true }))
    toast('图片上传成功，请继续保存草稿')
  } catch (error) {
    toast(error.message, true)
  } finally {
    upload.disabled = false
    upload.value = ''
  }
})

document.querySelector('[data-about-save]').addEventListener('click', async (event) => {
  const button = event.currentTarget
  button.disabled = true
  try {
    await saveAboutDraft()
  } catch (error) {
    toast(error.message, true)
  } finally {
    button.disabled = false
  }
})

document.querySelector('[data-about-publish]').addEventListener('click', async (event) => {
  if (!window.confirm('确认将当前草稿发布到关于我们？发布后访客将看到新内容。')) return
  const button = event.currentTarget
  button.disabled = true
  try {
    await saveAboutDraft({ quiet: true })
    const { page } = await api('/pages/about/publish', { method: 'POST' })
    state.aboutPage = page
    updateAboutStatus(page)
    toast('关于我们内容已正式发布')
  } catch (error) {
    toast(error.message, true)
  } finally {
    button.disabled = false
  }
})

document.querySelector('[data-release-form]').addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!window.confirm('确认正式发布该版本？APK 校验完成后将自动切换 Android 下载版本。')) return
  const form = event.currentTarget
  const submit = form.querySelector('[data-release-submit]')
  const progress = form.querySelector('[data-upload-progress]')
  submit.disabled = true
  progress.hidden = false
  try {
    await api('/releases', { method: 'POST', body: new FormData(form) })
    form.reset()
    toast('Android 新版本已发布')
    await Promise.all([loadReleases(), loadOverview()])
  } catch (error) { toast(error.message, true) } finally {
    submit.disabled = false
    progress.hidden = true
  }
})

document.querySelector('[data-release-list]').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-rollback]')
  if (!button || !window.confirm('确认回滚？所有新下载将切换到此历史版本。')) return
  button.disabled = true
  try {
    await api(`/releases/${encodeURIComponent(button.dataset.rollback)}/rollback`, { method: 'POST' })
    toast('版本已回滚')
    await Promise.all([loadReleases(), loadOverview()])
  } catch (error) { toast(error.message, true) } finally { button.disabled = false }
})

document.querySelector('[data-user-form]').addEventListener('submit', async (event) => {
  event.preventDefault()
  const form = event.currentTarget
  try {
    const body = Object.fromEntries(new FormData(form).entries())
    await api('/users', { method: 'POST', body: JSON.stringify(body) })
    form.reset()
    toast('管理员账号已创建')
    loadUsers()
  } catch (error) { toast(error.message, true) }
})

document.querySelector('[data-refresh-releases]').addEventListener('click', loadReleases)
document.querySelector('[data-refresh-audit]').addEventListener('click', loadAudit)

api('/me').then(({ user }) => showAdmin(user)).catch(showLogin)
