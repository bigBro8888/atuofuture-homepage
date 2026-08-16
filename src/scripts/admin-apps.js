import { ADMIN_SITEMAP } from '../data/admin-sitemap.js'
import { bindNewsRichEditor, newsRichEditorMarkup, readNewsRichContent } from './admin-news-rich.js'

const API = '/api/admin'
const state = { user: null, app: null, homePage: null, aboutPage: null, sitePage: null, simplePage: null, simpleKey: '', newsPage: null, homeSection: 'hero' }
const HOME_OUTLINE = [
  { id: 'hero', no: '01', title: '首屏轮播', desc: '多屏大图，可新增和逐屏编辑' },
  { id: 'banner', no: '02', title: '中部推广条', desc: '智能体咨询横条' },
  { id: 'agents', no: '03', title: '空间智能体', desc: '八个智能体可逐个改图和文案' },
  { id: 'solutions', no: '04', title: '产品与方案', desc: '方案卡可新增删除' },
  { id: 'news', no: '05', title: '新闻动态', desc: '新闻卡可新增删除' },
  { id: 'pitch', no: '06', title: '探索安托未来', desc: '底部宫格卡片可新增删除' },
]
const titles = {
  overview: ['页面目录', '每个前台路径对应一块后台配置，结构与官网导航一致'],
  site: ['全站设置', 'Logo、品牌名、顶栏按钮与联系方式'],
  home: ['官网首页', '路径 / · 按前台区块逐项编辑，点左侧大纲跳转'],
  about: ['关于我们', '路径 /about/ · 编辑草稿并发布'],
  'page-solutions': ['行业解决方案', '路径 /solutions/ · 首屏标题与 Banner'],
  'page-agents': ['空间智能体', '路径 /agents/ · 首屏标题与 Banner'],
  'page-hardware': ['智能硬件', '路径 /hardware/ · 首屏标题与 Banner'],
  'page-news': ['新闻中心', '路径 /news/ · 列表管理，点编辑即可改稿并发布'],
  'page-ai-token': ['AI Token', '路径 /ai-token/ · 首屏标题'],
  config: ['App 下载页', '路径 /app-download/ · 文案、Banner、商店链接'],
  releases: ['版本发布', '上传、发布和回滚 Android 版本'],
  analytics: ['下载统计', '查看匿名点击趋势和终端分布'],
  users: ['账号权限', '按职责管理后台访问权限'],
  audit: ['操作审计', '追踪关键配置和发布操作'],
}
const roleNames = { super_admin: '超级管理员', editor: '运营编辑', publisher: '发布管理员', analyst: '数据查看员' }

const API_ERROR_TEXT = {
  authentication_required: '登录已失效，请重新登录',
  invalid_session: '登录已失效，请重新登录',
  invalid_credentials: '账号或密码不正确',
  permission_denied: '没有操作权限',
  too_many_attempts: '尝试次数过多，请稍后再试',
  account_exists: '该账号已存在',
  email_exists: '该账号已存在',
}

async function api(path, options = {}) {
  const headers = { Accept: 'application/json', ...options.headers }
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  const response = await fetch(`${API}${path}`, { credentials: 'same-origin', ...options, headers })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401 && path !== '/login' && path !== '/me') showLogin()
    throw new Error(API_ERROR_TEXT[data.error] || data.message || data.error || `请求失败（${response.status}）`)
  }
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

function renderSitemap() {
  const host = document.querySelector('[data-sitemap]')
  if (!host) return
  host.innerHTML = ADMIN_SITEMAP.map((item) => `
    <button type="button" class="admin-sitemap__row" data-jump="${escapeHtml(item.hash)}">
      <strong>${escapeHtml(item.label)}</strong>
      <code>${escapeHtml(item.path)}</code>
      <span>${escapeHtml(item.group)}</span>
      <em>进入配置</em>
    </button>
  `).join('')
}

function showAdmin(user) {
  state.user = user
  document.querySelector('[data-login-view]').hidden = true
  document.querySelector('[data-admin-view]').hidden = false
  document.querySelector('[data-user-name]').textContent = user.name
  document.querySelector('[data-user-role]').textContent = roleNames[user.role] || user.role
  document.querySelector('[data-user-avatar]').textContent = (user.name || user.email).slice(0, 1).toUpperCase()
  document.querySelectorAll('[data-super-only]').forEach((element) => { element.hidden = user.role !== 'super_admin' })
  renderSitemap()
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
  const panelName = name === 'page-news' ? 'news' : name.startsWith('page-') ? 'simple' : name
  document.querySelectorAll('[data-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.tab === name))
  document.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === panelName))
  const [title, subtitle] = titles[name]
  document.querySelector('[data-page-title]').textContent = title
  document.querySelector('[data-page-subtitle]').textContent = subtitle
  document.querySelector('.admin-sidebar').classList.remove('is-open')
  if (!options.skipHash && location.hash !== `#${name}`) {
    history.replaceState(null, '', `#${name}`)
  }
  if (name === 'overview') renderSitemap()
  if (name === 'site') loadSitePage()
  if (name === 'config') {
    loadConfig()
    window.scrollTo({ top: 0 })
    updateAnchorState()
  }
  if (name === 'page-news') loadNewsFeed()
  else if (name.startsWith('page-')) loadSimplePage(name.slice('page-'.length))
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
  let field
  if (type === 'textarea') {
    field = `<textarea data-home-field="${path}" rows="${options.rows || 3}">${escapeHtml(value ?? '')}</textarea>`
  } else if (type === 'select') {
    const opts = (options.options || []).map(([key, text]) => `<option value="${escapeHtml(key)}"${String(value) === String(key) ? ' selected' : ''}>${escapeHtml(text)}</option>`).join('')
    field = `<select data-home-field="${path}">${opts}</select>`
  } else if (type === 'checkbox') {
    field = `<input data-home-field="${path}" data-home-type="checkbox" type="checkbox"${value ? ' checked' : ''} />`
  } else {
    field = `<input data-home-field="${path}" data-home-type="${type}" type="${type === 'number' ? 'number' : 'text'}" value="${escapeHtml(value ?? '')}" ${type === 'number' ? 'min="0"' : ''} />`
  }
  const media = options.image
    ? `<div class="admin-home-media">
        <img data-home-preview-for="${path}" src="${escapeHtml(value ?? '')}" alt="" ${value ? '' : 'hidden'} />
        <label class="admin-home-upload">上传本地图片<input type="file" accept="image/jpeg,image/png,image/webp" data-home-upload-for="${path}" /></label>
      </div>`
    : ''
  return `<label class="${options.wide ? 'admin-form-wide' : ''}"><span>${label}</span>${field}${options.help ? `<small>${options.help}</small>` : ''}${media}</label>`
}

function compactRow(title, subtitle, tools) {
  return `<div class="admin-item-row">
    <div><strong>${escapeHtml(title)}</strong>${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ''}</div>
    <span class="admin-slide-tools">${tools}</span>
  </div>`
}

function itemEditButton(kind, index) {
  return `<button type="button" data-item-edit="${kind}" data-item-index="${index}">编辑</button>`
}

function listTools(kind, index, total, min = 1) {
  return `<button type="button" data-list-kind="${kind}" data-list-move="-1" ${index === 0 ? 'disabled' : ''}>上移</button>
    <button type="button" data-list-kind="${kind}" data-list-move="1" ${index === total - 1 ? 'disabled' : ''}>下移</button>
    <button type="button" data-list-kind="${kind}" data-list-remove ${total <= min ? 'disabled' : ''}>删除</button>`
}

function showHomeSection(id) {
  if (!HOME_OUTLINE.some((item) => item.id === id)) id = 'hero'
  state.homeSection = id
  document.querySelectorAll('[data-home-goto]').forEach((button) => button.classList.toggle('is-active', button.dataset.homeGoto === id))
  document.querySelectorAll('[data-home-section]').forEach((section) => {
    section.hidden = section.dataset.homeSection !== id
  })
}

function renderHomeEditor(content) {
  const slides = content.heroSlides?.length ? content.heroSlides : []
  const banner = content.banner || {}
  const agents = content.agents || {}
  const news = content.news || { items: [] }
  const pitch = content.pitch || {}
  const editor = document.querySelector('[data-home-editor]')
  editor.innerHTML = `
    <aside class="admin-home-outline" data-home-outline>
      <p>按官网首页从上到下排列，点一项只打开这一块</p>
      ${HOME_OUTLINE.map((item) => `
        <button type="button" class="admin-home-outline__item${item.id === state.homeSection ? ' is-active' : ''}" data-home-goto="${item.id}">
          <em>${item.no}</em>
          <span><b>${item.title}</b><small>${item.desc}</small></span>
        </button>`).join('')}
    </aside>
    <div class="admin-home-stage">
      <fieldset data-home-section="hero">
        <legend>首屏轮播</legend>
        <p class="admin-form-section__hint">每屏一行，点「编辑」在弹窗里改文案和背景图。</p>
        <div class="admin-home-list" data-hero-slides>${slides.map((slide, index) => `
          <div class="admin-item-row" data-hero-slide>
            <div><strong>第 ${index + 1} 屏：${escapeHtml(slide.title || '未填写标题')}</strong></div>
            <span class="admin-slide-tools">
              ${itemEditButton('hero', index)}
              <button type="button" data-hero-move="-1" ${index === 0 ? 'disabled' : ''}>上移</button>
              <button type="button" data-hero-move="1" ${index === slides.length - 1 ? 'disabled' : ''}>下移</button>
              <button type="button" data-hero-remove ${slides.length <= 1 ? 'disabled' : ''}>删除</button>
            </span>
          </div>`).join('')}</div>
        <button type="button" class="admin-add-slide" data-hero-add>+ 新增一屏</button>
      </fieldset>
      <fieldset data-home-section="banner">
        <legend>中部推广条</legend>
        <p class="admin-form-section__hint">首屏下方的咨询横条。</p>
        <div class="admin-form-grid">
          ${homeField('banner.title', '标题', banner.title, { wide: true })}
          ${homeField('banner.subtitle', '说明', banner.subtitle, { type: 'textarea', wide: true })}
          ${homeField('banner.ctaLabel', '按钮文字', banner.ctaLabel)}
          ${homeField('banner.ctaUrl', '按钮链接', banner.ctaUrl)}
          ${homeField('banner.imageUrl', '左侧配图', banner.imageUrl, { image: true, wide: true })}
        </div>
      </fieldset>
      <fieldset data-home-section="agents">
        <legend>空间智能体</legend>
        <p class="admin-form-section__hint">整区标题在上面改。每个智能体点「编辑」弹窗修改，避免一长条展开。</p>
        <div class="admin-form-grid">
          ${homeField('agents.kicker', '眉题', agents.kicker)}
          ${homeField('agents.title', '主标题', agents.title, { wide: true })}
          ${homeField('agents.subtitle', '说明', agents.subtitle, { type: 'textarea', wide: true, rows: 4 })}
        </div>
        <div class="admin-home-list">${(agents.items || []).map((item, index) => `
          <div class="admin-item-row" data-agent-item>
            <div><strong>智能体 ${index + 1}：${escapeHtml(item.name || '未命名')}</strong><small>${escapeHtml(item.sceneTitle || '')}</small></div>
            <span class="admin-slide-tools">
              ${itemEditButton('agents', index)}
              <button type="button" data-agent-move="-1" ${index === 0 ? 'disabled' : ''}>上移</button>
              <button type="button" data-agent-move="1" ${index === (agents.items || []).length - 1 ? 'disabled' : ''}>下移</button>
              <button type="button" data-agent-remove ${(agents.items || []).length <= 1 ? 'disabled' : ''}>删除</button>
            </span>
          </div>`).join('')}</div>
        <button type="button" class="admin-add-slide" data-agent-add>+ 新增一个智能体</button>
      </fieldset>
      <fieldset data-home-section="solutions">
        <legend>产品与方案</legend>
        <p class="admin-form-section__hint">方案卡一行一条，点「编辑」弹窗修改。</p>
        <div class="admin-form-grid">
          ${homeField('solutions.eyebrow', '眉题', content.solutions.eyebrow)}
          ${homeField('solutions.title', '区块标题', content.solutions.title)}
          ${homeField('solutions.subtitle', '区块说明', content.solutions.subtitle, { type: 'textarea', wide: true })}
          ${homeField('solutions.moreLabel', '更多按钮文字', content.solutions.moreLabel)}
          ${homeField('solutions.moreUrl', '更多按钮链接', content.solutions.moreUrl)}
        </div>
        <div class="admin-home-list">${(content.solutions.items || []).map((item, index) => `
          <div class="admin-item-row" data-list-item="solutions">
            <div><strong>方案 ${index + 1}：${escapeHtml(item.title || '未填写')}</strong></div>
            <span class="admin-slide-tools">${itemEditButton('solutions', index)}${listTools('solutions', index, (content.solutions.items || []).length)}</span>
          </div>`).join('')}</div>
        <button type="button" class="admin-add-slide" data-list-kind="solutions" data-list-add>+ 新增一张方案卡</button>
      </fieldset>
      <fieldset data-home-section="news">
        <legend>新闻动态</legend>
        <p class="admin-form-section__hint">这三张卡也可在「新闻中心」里勾选「推送到首页」。封面比例与新闻列表封面一致。</p>
        <div class="admin-form-grid">
          ${homeField('news.kicker', '眉题', news.kicker)}
          ${homeField('news.title', '区块标题', news.title)}
          ${homeField('news.subtitle', '区块说明', news.subtitle, { type: 'textarea', wide: true })}
          ${homeField('news.moreLabel', '更多按钮', news.moreLabel)}
          ${homeField('news.moreUrl', '更多链接', news.moreUrl)}
        </div>
        <div class="admin-home-list">${(news.items || []).map((item, index) => `
          <div class="admin-item-row" data-list-item="news">
            <div><strong>新闻 ${index + 1}：${escapeHtml(item.title || '未填写')}</strong></div>
            <span class="admin-slide-tools">${itemEditButton('news', index)}${listTools('news', index, (news.items || []).length)}</span>
          </div>`).join('')}</div>
        <button type="button" class="admin-add-slide" data-list-kind="news" data-list-add>+ 新增一条新闻</button>
      </fieldset>
      <fieldset data-home-section="pitch">
        <legend>探索安托未来</legend>
        <p class="admin-form-section__hint">宫格一行一张，点「编辑」弹窗修改样式、图片和跳转。</p>
        <div class="admin-form-grid">
          ${homeField('pitch.label', '小标题', pitch.label)}
          ${homeField('pitch.title', '主标题', pitch.title, { type: 'textarea', wide: true })}
        </div>
        <div class="admin-home-list">${(pitch.items || []).map((item, index) => `
          <div class="admin-item-row" data-list-item="pitch">
            <div><strong>宫格 ${index + 1}：${escapeHtml(item.kicker || item.title || '未填写')}</strong></div>
            <span class="admin-slide-tools">${itemEditButton('pitch', index)}${listTools('pitch', index, (pitch.items || []).length)}</span>
          </div>`).join('')}</div>
        <button type="button" class="admin-add-slide" data-list-kind="pitch" data-list-add>+ 新增一张宫格</button>
      </fieldset>
    </div>`
  showHomeSection(state.homeSection)
}

function setHomeValue(target, path, value) {
  const parts = path.split('.')
  let cursor = target
  parts.slice(0, -1).forEach((part, index) => {
    const key = Number.isNaN(Number(part)) ? part : Number(part)
    const next = parts[index + 1]
    const nextIsIndex = next !== undefined && !Number.isNaN(Number(next))
    if (cursor[key] == null) cursor[key] = nextIsIndex ? [] : {}
    cursor = cursor[key]
  })
  cursor[parts.at(-1)] = value
}

function collectHomeContent() {
  const content = structuredClone(state.homePage.draftContent)
  document.querySelectorAll('[data-home-editor] [data-home-field], [data-item-modal]:not([hidden]) [data-home-field]').forEach((field) => {
    let value
    if (field.dataset.homeType === 'checkbox') value = field.checked
    else if (field.dataset.homeType === 'number') value = Number(field.value.trim())
    else value = field.value.trim()
    if (field.dataset.homeField.endsWith('.tags')) value = String(field.value || '').split(/[，,]/).map((tag) => tag.trim()).filter(Boolean)
    setHomeValue(content, field.dataset.homeField, value)
  })
  const heroCount = document.querySelectorAll('[data-hero-slide]').length
  if (heroCount) content.heroSlides = (content.heroSlides || []).slice(0, heroCount)
  const agentCount = document.querySelectorAll('[data-agent-item]').length
  if (agentCount) {
    content.agents = content.agents || {}
    content.agents.items = (content.agents.items || []).slice(0, agentCount)
  }
  const solCount = document.querySelectorAll('[data-list-item="solutions"]').length
  if (solCount) {
    content.solutions = content.solutions || {}
    content.solutions.items = (content.solutions.items || []).slice(0, solCount)
  }
  const newsCount = document.querySelectorAll('[data-list-item="news"]').length
  if (newsCount) {
    content.news = content.news || {}
    content.news.items = (content.news.items || []).slice(0, newsCount)
  }
  const pitchCount = document.querySelectorAll('[data-list-item="pitch"]').length
  if (pitchCount) {
    content.pitch = content.pitch || {}
    content.pitch.items = (content.pitch.items || []).slice(0, pitchCount)
  }
  return content
}

function homeItemFields(kind, index, item) {
  if (kind === 'hero') {
    return `
      ${homeField(`heroSlides.${index}.label`, '角标', item.label, { help: '例如「能力 01」，可留空' })}
      ${homeField(`heroSlides.${index}.title`, '主标题', item.title, { wide: true })}
      ${homeField(`heroSlides.${index}.description`, '说明', item.description, { type: 'textarea', wide: true })}
      ${homeField(`heroSlides.${index}.actionLabel`, '按钮文字', item.actionLabel)}
      ${homeField(`heroSlides.${index}.actionHref`, '按钮链接', item.actionHref)}
      ${homeField(`heroSlides.${index}.background`, '背景图', item.background, { image: true, wide: true })}`
  }
  if (kind === 'agents') {
    return `
      ${homeField(`agents.items.${index}.name`, '底部名称', item.name, { wide: true })}
      ${homeField(`agents.items.${index}.sceneTitle`, '画面标题', item.sceneTitle, { help: '叠在长图左下角，如「人员进入」' })}
      ${homeField(`agents.items.${index}.sceneCaption`, '画面说明', item.sceneCaption, { wide: true })}
      ${homeField(`agents.items.${index}.imageUrl`, '21:9 场景图', item.imageUrl, { image: true, wide: true, help: '建议 21:9，左下留暗部给文字' })}
      ${homeField(`agents.items.${index}.id`, '内部编号', item.id, { help: '一般不用改，用于切换定位' })}`
  }
  if (kind === 'solutions') {
    return `
      ${homeField(`solutions.items.${index}.chip`, '角标', item.chip)}
      ${homeField(`solutions.items.${index}.title`, '标题', item.title)}
      ${homeField(`solutions.items.${index}.description`, '说明', item.description, { type: 'textarea', wide: true })}
      ${homeField(`solutions.items.${index}.tags`, '标签（逗号分隔）', (item.tags || []).join('，'), { wide: true })}
      ${homeField(`solutions.items.${index}.imageUrl`, '封面图', item.imageUrl, { image: true, help: '留空保留当前默认图片' })}
      ${homeField(`solutions.items.${index}.linkUrl`, '详情链接', item.linkUrl)}`
  }
  if (kind === 'news') {
    return `
      ${homeField(`news.items.${index}.category`, '分类', item.category)}
      ${homeField(`news.items.${index}.title`, '标题', item.title, { wide: true })}
      ${homeField(`news.items.${index}.description`, '摘要', item.description, { type: 'textarea', wide: true })}
      ${homeField(`news.items.${index}.linkUrl`, '详情链接', item.linkUrl)}
      ${homeField(`news.items.${index}.imageUrl`, '封面图', item.imageUrl, { image: true, wide: true })}`
  }
  return `
    ${homeField(`pitch.items.${index}.kicker`, '卡片小标题', item.kicker)}
    ${homeField(`pitch.items.${index}.title`, '卡片主文案', item.title, { type: 'textarea', wide: true })}
    ${homeField(`pitch.items.${index}.moreLabel`, '底部链接文字', item.moreLabel)}
    ${homeField(`pitch.items.${index}.href`, '跳转链接', item.href)}
    ${homeField(`pitch.items.${index}.variant`, '卡片样式', item.variant || 'photo', { type: 'select', options: [['photo', '图片卡'], ['wave', '深蓝波纹'], ['mint', '绿色纯色']] })}
    ${homeField(`pitch.items.${index}.imageUrl`, '背景图（图片卡用）', item.imageUrl, { image: true, wide: true })}
    ${homeField(`pitch.items.${index}.openDemo`, '点击打开预约演示', item.openDemo, { type: 'checkbox' })}`
}

function aboutSectionFields(key, content) {
  if (key === 'hero') {
    return `
      ${aboutField('hero.title', '主标题', content.hero.title)}
      ${aboutField('hero.body', '介绍', content.hero.body, { type: 'textarea', wide: true, rows: 4 })}
      ${aboutField('hero.primaryLabel', '主按钮文字', content.hero.primaryLabel)}
      ${aboutField('hero.primaryHref', '主按钮链接', content.hero.primaryHref)}
      ${aboutField('hero.secondaryLabel', '次按钮文字', content.hero.secondaryLabel)}
      ${aboutField('hero.secondaryHref', '次按钮链接', content.hero.secondaryHref)}
      ${aboutField('hero.imageUrl', '右侧图片', content.hero.imageUrl, { image: true, wide: true })}`
  }
  if (key === 'story') {
    return `
      ${aboutField('story.label', '小标题', content.story.label)}
      ${aboutField('story.title', '标题', content.story.title)}
      ${aboutField('story.body1', '第一段', content.story.body1, { type: 'textarea', wide: true })}
      ${aboutField('story.body2', '第二段', content.story.body2, { type: 'textarea', wide: true })}
      ${aboutField('story.imageUrl', '左侧图片', content.story.imageUrl, { image: true, wide: true })}`
  }
  if (key === 'values') {
    return `
      ${aboutField('values.label', '小标题', content.values.label)}
      ${aboutField('values.title', '标题', content.values.title)}`
  }
  if (key === 'partners') {
    return `
      ${aboutField('partners.label', '小标题', content.partners.label)}
      ${aboutField('partners.title', '标题', content.partners.title)}
      ${aboutField('partners.intro', '说明', content.partners.intro, { type: 'textarea', wide: true })}`
  }
  if (key === 'duties') {
    return `
      ${aboutField('duties.label', '小标题', content.duties.label)}
      ${aboutField('duties.title', '标题', content.duties.title)}`
  }
  if (key === 'join') {
    return `
      ${aboutField('join.label', '小标题', content.join.label)}
      ${aboutField('join.title', '标题', content.join.title)}`
  }
  return `
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
    ${aboutField('contact.joinHref', '按钮链接', content.contact.joinHref, { wide: true })}`
}

function aboutItemFields(kind, index, item) {
  if (kind === 'values') {
    return `
      ${aboutField(`values.items.${index}.icon`, '图标名称', item.icon)}
      ${aboutField(`values.items.${index}.title`, '名称', item.title)}
      ${aboutField(`values.items.${index}.body`, '说明', item.body, { type: 'textarea', wide: true })}`
  }
  if (kind === 'partners') {
    return `${aboutField(`partners.items.${index}.name`, '名称', item.name)}`
  }
  if (kind === 'duties') {
    return `
      ${aboutField(`duties.items.${index}.title`, '标题', item.title)}
      ${aboutField(`duties.items.${index}.body`, '说明', item.body, { type: 'textarea', wide: true })}
      ${aboutField(`duties.items.${index}.imageUrl`, '图片', item.imageUrl, { image: true, wide: true })}`
  }
  return `
    ${aboutField(`join.items.${index}.step`, '序号', item.step)}
    ${aboutField(`join.items.${index}.title`, '标题', item.title)}
    ${aboutField(`join.items.${index}.body`, '说明', item.body, { type: 'textarea', wide: true })}`
}

function openItemModal({ scope, kind, index, title, html }) {
  const modal = document.querySelector('[data-item-modal]')
  modal.dataset.scope = scope
  modal.dataset.kind = kind
  modal.dataset.index = String(index ?? '')
  document.querySelector('[data-item-modal-title]').textContent = title
  document.querySelector('[data-item-modal-body]').innerHTML = html
  document.querySelector('[data-item-modal-apply]').textContent = scope === 'news' ? '发布上线' : '完成'
  modal.hidden = false
  document.body.classList.add('admin-modal-open')
}

function closeItemModal() {
  const modal = document.querySelector('[data-item-modal]')
  modal.hidden = true
  document.body.classList.remove('admin-modal-open')
  document.querySelector('[data-item-modal-body]').innerHTML = ''
  const apply = document.querySelector('[data-item-modal-apply]')
  if (apply) apply.textContent = '完成'
}

function openHomeItemModal(kind, index) {
  const content = collectHomeContent()
  state.homePage.draftContent = content
  const map = {
    hero: [content.heroSlides?.[index], `编辑第 ${index + 1} 屏`],
    agents: [content.agents?.items?.[index], `编辑智能体 ${index + 1}`],
    solutions: [content.solutions?.items?.[index], `编辑方案 ${index + 1}`],
    news: [content.news?.items?.[index], `编辑新闻 ${index + 1}`],
    pitch: [content.pitch?.items?.[index], `编辑宫格 ${index + 1}`],
  }
  const [item, title] = map[kind] || []
  if (!item) return
  openItemModal({ scope: 'home', kind, index, title, html: homeItemFields(kind, index, item) })
}

function applyItemModal() {
  const modal = document.querySelector('[data-item-modal]')
  if (modal.hidden) return
  if (modal.dataset.scope === 'home') {
    const content = collectHomeContent()
    state.homePage.draftContent = content
    closeItemModal()
    renderHomeEditor(content)
    return
  }
  if (modal.dataset.scope === 'about' || modal.dataset.scope === 'about-section') {
    const content = collectAboutContent()
    state.aboutPage.draftContent = content
    closeItemModal()
    renderAboutEditor(content)
    return
  }
  if (modal.dataset.scope === 'news') {
    void publishNewsFromModal()
  }
}

const EMPTY_HOME_LIST = {
  solutions: { chip: '智能体 + 硬件', title: '新方案', description: '', tags: [], imageUrl: '', linkUrl: '/solutions/' },
  news: { category: '公司动态', title: '新闻标题', description: '', imageUrl: '', linkUrl: '/news/' },
  pitch: { variant: 'photo', kicker: '新入口', title: '填写导语', href: '/', moreLabel: '阅读更多信息', imageUrl: '', openDemo: false },
}

function homeListItems(content, kind) {
  if (kind === 'solutions') {
    content.solutions = content.solutions || {}
    content.solutions.items = content.solutions.items || []
    return content.solutions.items
  }
  if (kind === 'news') {
    content.news = content.news || {}
    content.news.items = content.news.items || []
    return content.news.items
  }
  content.pitch = content.pitch || {}
  content.pitch.items = content.pitch.items || []
  return content.pitch.items
}

function addHomeListItem(kind) {
  const content = collectHomeContent()
  const items = homeListItems(content, kind)
  if (items.length >= 12) {
    toast('最多 12 条', true)
    return
  }
  items.push({ ...EMPTY_HOME_LIST[kind] })
  state.homePage.draftContent = content
  renderHomeEditor(content)
}

function removeHomeListItem(kind, index) {
  const content = collectHomeContent()
  const items = homeListItems(content, kind)
  if (items.length <= 1) {
    toast('至少保留一条', true)
    return
  }
  items.splice(index, 1)
  state.homePage.draftContent = content
  renderHomeEditor(content)
}

function moveHomeListItem(kind, index, offset) {
  const content = collectHomeContent()
  const items = homeListItems(content, kind)
  const next = index + offset
  if (!items[index] || next < 0 || next >= items.length) return
  const [item] = items.splice(index, 1)
  items.splice(next, 0, item)
  state.homePage.draftContent = content
  renderHomeEditor(content)
}

function addHeroSlide() {
  const content = collectHomeContent()
  content.heroSlides = content.heroSlides || []
  if (content.heroSlides.length >= 12) {
    toast('最多 12 屏', true)
    return
  }
  content.heroSlides.push({ ...EMPTY_HERO_SLIDE })
  state.homePage.draftContent = content
  renderHomeEditor(content)
}

function removeHeroSlide(index) {
  const content = collectHomeContent()
  if (!content.heroSlides || content.heroSlides.length <= 1) {
    toast('至少保留一屏', true)
    return
  }
  content.heroSlides.splice(index, 1)
  state.homePage.draftContent = content
  renderHomeEditor(content)
}

function moveHeroSlide(index, offset) {
  const content = collectHomeContent()
  const next = index + offset
  if (!content.heroSlides?.[index] || next < 0 || next >= content.heroSlides.length) return
  const [slide] = content.heroSlides.splice(index, 1)
  content.heroSlides.splice(next, 0, slide)
  state.homePage.draftContent = content
  renderHomeEditor(content)
}

const EMPTY_HOME_AGENT = { id: '', name: '新智能体', sceneTitle: '', sceneCaption: '', imageUrl: '/images/home-agents/space.jpg' }

function addHomeAgent() {
  const content = collectHomeContent()
  content.agents = content.agents || {}
  content.agents.items = content.agents.items || []
  if (content.agents.items.length >= 12) {
    toast('最多 12 个智能体', true)
    return
  }
  content.agents.items.push({ ...EMPTY_HOME_AGENT, id: `agent-${content.agents.items.length + 1}` })
  state.homePage.draftContent = content
  renderHomeEditor(content)
}

function removeHomeAgent(index) {
  const content = collectHomeContent()
  if (!content.agents?.items || content.agents.items.length <= 1) {
    toast('至少保留一个智能体', true)
    return
  }
  content.agents.items.splice(index, 1)
  state.homePage.draftContent = content
  renderHomeEditor(content)
}

function moveHomeAgent(index, offset) {
  const content = collectHomeContent()
  const next = index + offset
  if (!content.agents?.items?.[index] || next < 0 || next >= content.agents.items.length) return
  const [item] = content.agents.items.splice(index, 1)
  content.agents.items.splice(next, 0, item)
  state.homePage.draftContent = content
  renderHomeEditor(content)
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
  const sectionRow = (key, title, subtitle) => `
    <div class="admin-item-row">
      <div><strong>${title}</strong><small>${subtitle}</small></div>
      <span class="admin-slide-tools"><button type="button" data-about-section-edit="${key}">编辑</button></span>
    </div>`
  editor.innerHTML = `
    <div class="admin-home-list">
      ${sectionRow('hero', '首屏主张', '主标题、介绍与按钮')}
      ${sectionRow('story', '公司介绍', '文案与左侧图片')}
      ${sectionRow('values', '使命、价值观与愿景', '整区标题')}
    </div>
    <div class="admin-home-list">${content.values.items.map((item, index) => `
      <div class="admin-item-row">
        <div><strong>${escapeHtml(item.title || `条目 ${index + 1}`)}</strong></div>
        <span class="admin-slide-tools"><button type="button" data-about-item-edit="values" data-item-index="${index}">编辑</button></span>
      </div>`).join('')}</div>
    <div class="admin-home-list">
      ${sectionRow('partners', '客户与网络', '整区标题与说明')}
    </div>
    <div class="admin-home-list">${content.partners.items.map((item, index) => `
      <div class="admin-item-row">
        <div><strong>客户 ${index + 1}：${escapeHtml(item.name || '未填写')}</strong></div>
        <span class="admin-slide-tools"><button type="button" data-about-item-edit="partners" data-item-index="${index}">编辑</button></span>
      </div>`).join('')}</div>
    <div class="admin-home-list">
      ${sectionRow('duties', '责任与承诺', '整区标题')}
    </div>
    <div class="admin-home-list">${content.duties.items.map((item, index) => `
      <div class="admin-item-row">
        <div><strong>${escapeHtml(item.title || `条目 ${index + 1}`)}</strong></div>
        <span class="admin-slide-tools"><button type="button" data-about-item-edit="duties" data-item-index="${index}">编辑</button></span>
      </div>`).join('')}</div>
    <div class="admin-home-list">
      ${sectionRow('join', '加入我们', '整区标题')}
    </div>
    <div class="admin-home-list">${content.join.items.map((item, index) => `
      <div class="admin-item-row">
        <div><strong>${escapeHtml(item.title || `步骤 ${index + 1}`)}</strong></div>
        <span class="admin-slide-tools"><button type="button" data-about-item-edit="join" data-item-index="${index}">编辑</button></span>
      </div>`).join('')}</div>
    <div class="admin-home-list">
      ${sectionRow('contact', '联系我们', '邮箱、地址与加入入口')}
    </div>
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

function updateSiteStatus(page) {
  document.querySelector('[data-site-draft-time]').textContent = `草稿更新：${dateTime(page.updatedAt)}`
  document.querySelector('[data-site-publish-status]').textContent = page.publishedAt ? `已发布 ${dateTime(page.publishedAt)}` : '尚未发布'
}

function renderSiteEditor(content) {
  const editor = document.querySelector('[data-site-editor]')
  editor.innerHTML = `
    <fieldset>
      <legend>品牌与 Logo</legend>
      <div class="admin-form-grid">
        ${homeField('brandZh', '中文品牌名', content.brandZh)}
        ${homeField('brandEn', '英文品牌名', content.brandEn)}
        ${homeField('logoLightUrl', '浅色底 Logo', content.logoLightUrl, { image: true, wide: true, help: '用于官网顶栏、页脚。可填 /assets/... 或上传' })}
        ${homeField('logoDarkUrl', '深色/下载页 Logo', content.logoDarkUrl, { image: true, wide: true, help: '用于 App 下载页等浅色或彩色 Logo' })}
      </div>
    </fieldset>
    <fieldset>
      <legend>顶栏按钮</legend>
      <div class="admin-form-grid">
        ${homeField('downloadLabel', '下载按钮文案', content.downloadLabel)}
        ${homeField('demoLabel', '预约演示文案', content.demoLabel)}
        <label><span>显示下载入口</span><select data-home-field="showAppDownload"><option value="true" ${content.showAppDownload !== false ? 'selected' : ''}>显示</option><option value="false" ${content.showAppDownload === false ? 'selected' : ''}>隐藏</option></select></label>
        <label><span>显示 AI Token 入口</span><select data-home-field="showTokenEntry"><option value="true" ${content.showTokenEntry !== false ? 'selected' : ''}>显示</option><option value="false" ${content.showTokenEntry === false ? 'selected' : ''}>隐藏</option></select></label>
        ${homeField('tokenSiteUrl', 'AI Token 外链', content.tokenSiteUrl, { wide: true })}
      </div>
    </fieldset>
    <fieldset>
      <legend>联系方式</legend>
      <div class="admin-form-grid">
        ${homeField('email', '主邮箱', content.email)}
        ${homeField('emailSecondary', '备用邮箱', content.emailSecondary)}
        ${homeField('phoneDisplay', '电话展示', content.phoneDisplay)}
        ${homeField('phone', '电话号码', content.phone)}
        ${homeField('address', '地址', content.address, { wide: true })}
        ${homeField('footerNote', '页脚版权', content.footerNote, { wide: true })}
      </div>
    </fieldset>
  `
}

function collectSiteContent() {
  const content = {}
  document.querySelectorAll('[data-site-editor] [data-home-field]').forEach((field) => {
    const value = field.tagName === 'SELECT' ? field.value === 'true' : field.value
    content[field.dataset.homeField] = value
  })
  return content
}

async function loadSitePage() {
  try {
    const { page } = await api('/pages/site')
    state.sitePage = page
    renderSiteEditor(page.draftContent)
    updateSiteStatus(page)
  } catch (error) { toast(error.message, true) }
}

async function saveSiteDraft({ quiet = false } = {}) {
  const content = collectSiteContent()
  const { page } = await api('/pages/site/draft', { method: 'PUT', body: JSON.stringify({ content }) })
  state.sitePage = page
  updateSiteStatus(page)
  if (!quiet) toast('全站设置草稿已保存')
  return page
}

function updateSimpleStatus(page) {
  document.querySelector('[data-simple-draft-time]').textContent = `草稿更新：${dateTime(page.updatedAt)}`
  document.querySelector('[data-simple-publish-status]').textContent = page.publishedAt ? `已发布 ${dateTime(page.publishedAt)}` : '尚未发布'
}

function renderSimpleEditor(key, content) {
  const item = ADMIN_SITEMAP.find((entry) => entry.key === key)
  document.querySelector('[data-simple-title]').textContent = item?.label || key
  document.querySelector('[data-simple-path]').textContent = item?.path || `/${key}/`
  const preview = document.querySelector('[data-simple-preview]')
  if (preview && item) preview.href = item.path === '全站共用' ? '/' : item.path
  document.querySelector('[data-simple-editor]').innerHTML = `
    <fieldset>
      <legend>首屏信息</legend>
      <div class="admin-form-grid">
        ${homeField('title', '主标题', content.title, { wide: true })}
        ${homeField('subtitle', '说明', content.subtitle, { type: 'textarea', wide: true })}
        ${homeField('bannerUrl', 'Banner 图', content.bannerUrl, { image: true, wide: true })}
        ${homeField('ctaLabel', '主按钮文案', content.ctaLabel)}
      </div>
    </fieldset>
  `
}

function collectSimpleContent() {
  const content = {}
  document.querySelectorAll('[data-simple-editor] [data-home-field]').forEach((field) => {
    content[field.dataset.homeField] = field.value
  })
  return content
}

async function loadSimplePage(key) {
  state.simpleKey = key
  const item = ADMIN_SITEMAP.find((entry) => entry.key === key)
  try {
    const { page } = await api(`/pages/simple/${encodeURIComponent(key)}`)
    state.simplePage = page
    renderSimpleEditor(key, page.draftContent)
    updateSimpleStatus(page)
  } catch (error) {
    renderSimpleEditor(key, {
      title: item?.label || '',
      subtitle: '',
      bannerUrl: '',
      ctaLabel: '',
    })
    toast(error.message, true)
  }
}

async function saveSimpleDraft({ quiet = false } = {}) {
  const content = collectSimpleContent()
  const { page } = await api(`/pages/simple/${encodeURIComponent(state.simpleKey)}/draft`, { method: 'PUT', body: JSON.stringify({ content }) })
  state.simplePage = page
  updateSimpleStatus(page)
  if (!quiet) toast('页面草稿已保存，线上内容尚未改变')
  return page
}

function newsField(path, label, value, options = {}) {
  const type = options.type || 'text'
  let field
  if (type === 'textarea') {
    field = `<textarea data-news-field="${path}" rows="${options.rows || 3}">${escapeHtml(value ?? '')}</textarea>`
  } else if (type === 'select') {
    const opts = (options.options || []).map(([key, text]) => `<option value="${escapeHtml(key)}"${String(value) === String(key) ? ' selected' : ''}>${escapeHtml(text)}</option>`).join('')
    field = `<select data-news-field="${path}">${opts}</select>`
  } else if (options.hidden) {
    field = `<input data-news-field="${path}" type="hidden" value="${escapeHtml(value ?? '')}" />`
  } else {
    field = `<input data-news-field="${path}" type="${type}" value="${escapeHtml(value ?? '')}" />`
  }
  const media = options.image
    ? `<div class="admin-home-media">
        <img data-news-preview-for="${path}" src="${escapeHtml(value ?? '')}" alt="" ${value ? '' : 'hidden'} />
        <label class="admin-home-upload">上传封面<input type="file" accept="image/jpeg,image/png,image/webp" data-news-upload-for="${path}" /></label>
      </div>`
    : options.video
      ? `<div class="admin-news-video">
          <video data-news-preview-for="${path}" src="${escapeHtml(value ?? '')}" controls playsinline ${value ? '' : 'hidden'}></video>
          <label class="admin-home-upload">上传视频<input type="file" accept="video/mp4,video/webm,video/quicktime,video/*" data-news-upload-for="${path}" /></label>
        </div>`
      : ''
  return `<label class="${options.wide ? 'admin-form-wide' : ''}"><span>${label}</span>${field}${options.help ? `<small>${options.help}</small>` : ''}${media}</label>`
}

function updateNewsStatus(page) {
  document.querySelector('[data-news-draft-time]').textContent = `草稿 ${dateTime(page.updatedAt)}`
  document.querySelector('[data-news-publish-status]').textContent = page.publishedAt ? `已发布 ${dateTime(page.publishedAt)}` : '尚未发布'
}

function renderNewsEditor(content) {
  const items = [...(content.items || [])]
  const editor = document.querySelector('[data-news-editor]')
  editor.innerHTML = `
    <fieldset>
      <legend>列表页标题</legend>
      <div class="admin-form-grid">
        ${newsField('pageTitle', '主标题', content.title)}
        ${newsField('pageSubtitle', '副标题', content.subtitle, { type: 'textarea', wide: true, rows: 2 })}
      </div>
    </fieldset>
    <fieldset>
      <legend>新闻列表</legend>
      <p class="admin-form-section__hint">在每条新闻前填写序号（数字越小越靠前），改完点「按序号排序」即可发布到前台。</p>
      <div class="admin-news-list-actions">
        <button type="button" class="admin-add-slide" data-news-add>+ 新建新闻</button>
        <button type="button" class="admin-add-slide" data-news-apply-sort>按序号排序</button>
      </div>
      <div class="admin-home-list" data-news-list style="margin-top:12px">${items.map((item, index) => `
        <div class="admin-item-row" data-news-index="${index}">
          <label class="admin-item-row__sort">
            <span>序号</span>
            <input type="number" min="1" step="1" value="${index + 1}" data-news-sort="${index}" />
          </label>
          <div>
            <strong>${escapeHtml(item.title || '未填写标题')}</strong>
            <small>${item.type === 'video' ? '视频' : '图文'} · ${escapeHtml(item.category || '')} · ${escapeHtml(item.date || '')}${item.pinHome ? ' · 已上首页' : ''}</small>
          </div>
          <span class="admin-slide-tools">
            <button type="button" data-news-edit="${index}">编辑</button>
            <button type="button" data-news-remove="${index}">删除</button>
          </span>
        </div>`).join('') || '<p class="admin-form-section__hint">还没有新闻，先点上面的新建。</p>'}</div>
    </fieldset>`
}

function collectNewsItemsBySort() {
  const items = [...(state.newsPage?.draftContent?.items || [])]
  return items
    .map((item, index) => {
      const raw = Number(document.querySelector(`[data-news-sort="${index}"]`)?.value)
      const sort = Number.isFinite(raw) && raw > 0 ? raw : index + 1
      return { item, index, sort }
    })
    .sort((a, b) => a.sort - b.sort || a.index - b.index)
    .map((row) => row.item)
}

async function applyNewsSort() {
  const items = collectNewsItemsBySort()
  const same = items.every((item, index) => item === (state.newsPage?.draftContent?.items || [])[index])
  if (same) {
    toast('顺序没有变化')
    return
  }
  await persistNewsFeed({ ...collectNewsPageMeta(), items }, '新闻顺序已更新并发布')
}

function collectNewsPageMeta() {
  const title = document.querySelector('[data-news-editor] [data-news-field="pageTitle"]')?.value
  const subtitle = document.querySelector('[data-news-editor] [data-news-field="pageSubtitle"]')?.value
  return {
    title: title ?? state.newsPage?.draftContent?.title ?? '新闻中心',
    subtitle: subtitle ?? state.newsPage?.draftContent?.subtitle ?? '',
  }
}

function collectNewsArticleFromModal() {
  const get = (path) => document.querySelector(`[data-item-modal] [data-news-field="${path}"]`)?.value ?? ''
  const type = get('type') === 'video' ? 'video' : 'article'
  const rich = type === 'article' ? readNewsRichContent(document.querySelector('[data-item-modal]')) : { body: '', bodyHtml: '' }
  return {
    id: get('id'),
    type,
    title: get('title'),
    summary: get('summary'),
    date: get('date') || new Date().toISOString().slice(0, 10),
    author: get('author') || '安托未来',
    category: get('category'),
    cover: get('cover'),
    videoUrl: get('videoUrl'),
    tags: get('tags'),
    pinHome: Boolean(document.querySelector('[data-item-modal] [data-news-field="pinHome"]')?.checked),
    pinnedAt: Boolean(document.querySelector('[data-item-modal] [data-news-field="pinHome"]')?.checked) ? new Date().toISOString() : '',
    body: rich.body,
    bodyHtml: rich.bodyHtml,
  }
}

function newsTypeToggle(type) {
  return `
    <div class="admin-news-type" role="tablist" aria-label="发布类型">
      <button type="button" data-news-type-btn="article" class="${type !== 'video' ? 'is-active' : ''}">图文</button>
      <button type="button" data-news-type-btn="video" class="${type === 'video' ? 'is-active' : ''}">视频</button>
      <input type="hidden" data-news-field="type" value="${type === 'video' ? 'video' : 'article'}" />
    </div>`
}

function newsPinHomeField(item = {}) {
  return `
    <label class="admin-news-pin admin-form-wide">
      <input data-news-field="pinHome" type="checkbox"${item.pinHome ? ' checked' : ''} />
      <span>
        <b>展示在首页</b>
        <small>勾选后出现在首页「新闻动态」三卡中，新勾选的排在最前；最多 3 篇。</small>
      </span>
    </label>`
}

function newsArticleFields(item = {}) {
  const today = new Date().toISOString().slice(0, 10)
  const type = item.type === 'video' ? 'video' : 'article'
  return `
    <input type="hidden" data-news-field="id" value="${escapeHtml(item.id || '')}" />
    ${newsTypeToggle(type)}
    ${newsField('title', '新闻标题', item.title || '', { wide: true })}
    ${newsField('category', '内容分类', item.category || '公司动态', { type: 'select', options: [['公司动态', '公司动态'], ['产品更新', '产品更新'], ['方案实践', '方案实践']] })}
    ${newsField('cover', '封面图', item.cover || '', { image: true, wide: true })}
    <div data-news-panel="article"${type === 'video' ? ' hidden' : ''}>
      ${newsField('summary', '新闻简介', item.summary || '', { type: 'textarea', wide: true, rows: 3 })}
      ${newsField('date', '发布日期', item.date || today, { type: 'date' })}
      ${newsField('author', '发布人', item.author || '安托未来')}
      ${newsField('tags', '标签', Array.isArray(item.tags) ? item.tags.join('，') : (item.tags || ''), { wide: true, help: '可选，用逗号分隔' })}
      ${newsRichEditorMarkup(item)}
    </div>
    <div data-news-panel="video"${type === 'video' ? '' : ' hidden'}>
      ${newsField('videoUrl', '视频', item.videoUrl || '', { video: true, hidden: true, wide: true, help: '支持 MP4 / WebM，建议不超过 200MB。' })}
    </div>
    ${newsPinHomeField(item)}`
}

function setNewsModalType(type) {
  const modal = document.querySelector('[data-item-modal]')
  const next = type === 'video' ? 'video' : 'article'
  const field = modal.querySelector('[data-news-field="type"]')
  if (field) field.value = next
  modal.querySelectorAll('[data-news-type-btn]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.newsTypeBtn === next)
  })
  modal.querySelectorAll('[data-news-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.newsPanel !== next
  })
  document.querySelector('[data-item-modal-title]').textContent = next === 'video' ? '发布视频' : (modal.dataset.kind === 'create' ? '新建新闻' : '编辑新闻')
}

function openNewsModal(index) {
  const items = state.newsPage?.draftContent?.items || []
  const isNew = index < 0 || !items[index]
  const item = isNew
    ? { id: '', type: 'article', title: '', summary: '', date: new Date().toISOString().slice(0, 10), author: '安托未来', category: '公司动态', cover: '', videoUrl: '', tags: [], body: '', bodyHtml: '' }
    : items[index]
  const type = item.type === 'video' ? 'video' : 'article'
  openItemModal({
    scope: 'news',
    kind: isNew ? 'create' : 'edit',
    index: isNew ? -1 : index,
    title: isNew ? (type === 'video' ? '发布视频' : '新建新闻') : (type === 'video' ? '编辑视频' : '编辑新闻'),
    html: newsArticleFields(item),
  })
  bindNewsRichEditor(document.querySelector('[data-item-modal]'), { api, toast })
}

function limitPinnedNews(items) {
  const pinned = items
    .filter((item) => item.pinHome)
    .sort((a, b) => String(b.pinnedAt || '').localeCompare(String(a.pinnedAt || '')))
  const keep = new Set(pinned.slice(0, 3).map((item) => item.id).filter(Boolean))
  return items.map((item) => (
    item.pinHome && keep.has(item.id)
      ? item
      : { ...item, pinHome: false, pinnedAt: '' }
  ))
}

function toHomeNewsCard(article) {
  return {
    category: article.category,
    title: article.title,
    description: article.summary,
    imageUrl: article.cover,
    linkUrl: `/news-detail/?id=${encodeURIComponent(article.id)}`,
  }
}

async function syncPinnedNewsToHome(items) {
  const pinned = items
    .filter((item) => item.pinHome && item.id)
    .sort((a, b) => String(b.pinnedAt || '').localeCompare(String(a.pinnedAt || '')))
    .slice(0, 3)
    .map(toHomeNewsCard)
  const { page } = await api('/pages/home')
  const content = page.draftContent
  const existing = content.news?.items || []
  const cards = [...pinned]
  const used = new Set(cards.map((item) => item.linkUrl))
  for (const item of existing) {
    if (cards.length >= 3) break
    if (!used.has(item.linkUrl)) {
      cards.push(item)
      used.add(item.linkUrl)
    }
  }
  content.news = content.news || {}
  content.news.items = cards.slice(0, 3)
  await api('/pages/home/draft', { method: 'PUT', body: JSON.stringify({ content }) })
  await api('/pages/home/publish', { method: 'POST' })
}

async function persistNewsFeed(content, message) {
  content.items = limitPinnedNews(content.items || [])
  const { page: draftPage } = await api('/pages/news-feed/draft', { method: 'PUT', body: JSON.stringify({ content }) })
  const { page } = await api('/pages/news-feed/publish', { method: 'POST' })
  state.newsPage = page.publishedContent ? page : draftPage
  await syncPinnedNewsToHome(state.newsPage.draftContent.items || [])
  renderNewsEditor(state.newsPage.draftContent)
  updateNewsStatus(state.newsPage)
  toast(message)
}

async function publishNewsFromModal() {
  const modal = document.querySelector('[data-item-modal]')
  const index = Number(modal.dataset.index)
  const article = collectNewsArticleFromModal()
  if (!article.title.trim()) {
    toast('请填写新闻标题', true)
    return
  }
  if (article.type === 'video') {
    if (!article.videoUrl.trim()) {
      toast('请上传视频', true)
      return
    }
  } else if (!article.body.trim() && !article.bodyHtml.trim()) {
    toast('请粘贴或填写正文', true)
    return
  }
  const meta = collectNewsPageMeta()
  const items = [...(state.newsPage?.draftContent?.items || [])]
  if (index >= 0 && items[index]) items[index] = { ...items[index], ...article }
  else items.unshift({ ...article, id: article.id || `n-${crypto.randomUUID().slice(0, 8)}` })
  try {
    await persistNewsFeed({ ...meta, items }, '新闻已发布到前台')
    closeItemModal()
  } catch (error) {
    toast(error.message, true)
  }
}

async function loadNewsFeed() {
  try {
    const { page } = await api('/pages/news-feed')
    state.newsPage = page
    renderNewsEditor(page.draftContent)
    updateNewsStatus(page)
  } catch (error) {
    toast(error.message, true)
  }
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
      <div class="admin-user-item"><div><strong>${escapeHtml(user.email)}</strong><small>${escapeHtml(roleNames[user.role] || user.role)} · ${dateTime(user.createdAt)}</small></div></div>
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
    message.textContent = error.message === 'invalid_credentials' ? '账号或密码错误' : error.message
  } finally { button.disabled = false }
})

document.querySelector('[data-logout]').addEventListener('click', async () => {
  try { await api('/logout', { method: 'POST' }) } finally { showLogin() }
})
document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => openTab(button.dataset.tab)))
document.querySelectorAll('[data-jump]').forEach((button) => button.addEventListener('click', () => openTab(button.dataset.jump)))
document.querySelector('[data-sitemap]')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-jump]')
  if (button) openTab(button.dataset.jump)
})
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
document.querySelector('[data-home-form]').addEventListener('click', (event) => {
  const jump = event.target.closest('[data-home-goto]')
  if (jump) {
    showHomeSection(jump.dataset.homeGoto)
    return
  }
  const itemEdit = event.target.closest('[data-item-edit]')
  if (itemEdit) {
    event.preventDefault()
    openHomeItemModal(itemEdit.dataset.itemEdit, Number(itemEdit.dataset.itemIndex))
    return
  }
  if (event.target.closest('[data-hero-add]')) {
    event.preventDefault()
    addHeroSlide()
    return
  }
  const remove = event.target.closest('[data-hero-remove]')
  if (remove) {
    event.preventDefault()
    event.stopPropagation()
    const index = [...document.querySelectorAll('[data-hero-slide]')].indexOf(remove.closest('[data-hero-slide]'))
    if (index >= 0) removeHeroSlide(index)
    return
  }
  const move = event.target.closest('[data-hero-move]')
  if (move) {
    event.preventDefault()
    event.stopPropagation()
    const index = [...document.querySelectorAll('[data-hero-slide]')].indexOf(move.closest('[data-hero-slide]'))
    if (index >= 0) moveHeroSlide(index, Number(move.dataset.heroMove))
    return
  }
  if (event.target.closest('[data-agent-add]')) {
    event.preventDefault()
    addHomeAgent()
    return
  }
  const agentRemove = event.target.closest('[data-agent-remove]')
  if (agentRemove) {
    event.preventDefault()
    event.stopPropagation()
    const index = [...document.querySelectorAll('[data-agent-item]')].indexOf(agentRemove.closest('[data-agent-item]'))
    if (index >= 0) removeHomeAgent(index)
    return
  }
  const agentMove = event.target.closest('[data-agent-move]')
  if (agentMove) {
    event.preventDefault()
    event.stopPropagation()
    const index = [...document.querySelectorAll('[data-agent-item]')].indexOf(agentMove.closest('[data-agent-item]'))
    if (index >= 0) moveHomeAgent(index, Number(agentMove.dataset.agentMove))
    return
  }
  const listAdd = event.target.closest('[data-list-add]')
  if (listAdd) {
    event.preventDefault()
    addHomeListItem(listAdd.dataset.listKind)
    return
  }
  const listRemove = event.target.closest('[data-list-remove]')
  if (listRemove) {
    event.preventDefault()
    event.stopPropagation()
    const kind = listRemove.dataset.listKind
    const index = [...document.querySelectorAll(`[data-list-item="${kind}"]`)].indexOf(listRemove.closest('[data-list-item]'))
    if (index >= 0) removeHomeListItem(kind, index)
    return
  }
  const listMove = event.target.closest('[data-list-move]')
  if (listMove) {
    event.preventDefault()
    event.stopPropagation()
    const kind = listMove.dataset.listKind
    const index = [...document.querySelectorAll(`[data-list-item="${kind}"]`)].indexOf(listMove.closest('[data-list-item]'))
    if (index >= 0) moveHomeListItem(kind, index, Number(listMove.dataset.listMove))
  }
})

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
document.querySelector('[data-about-form]').addEventListener('click', (event) => {
  const sectionEdit = event.target.closest('[data-about-section-edit]')
  if (sectionEdit) {
    event.preventDefault()
    const key = sectionEdit.dataset.aboutSectionEdit
    const content = collectAboutContent()
    state.aboutPage.draftContent = content
    const titles = { hero: '编辑首屏主张', story: '编辑公司介绍', values: '编辑价值观标题', partners: '编辑客户与网络', duties: '编辑责任与承诺', join: '编辑加入我们', contact: '编辑联系我们' }
    openItemModal({ scope: 'about-section', kind: key, title: titles[key] || '编辑', html: aboutSectionFields(key, content) })
    return
  }
  const itemEdit = event.target.closest('[data-about-item-edit]')
  if (itemEdit) {
    event.preventDefault()
    const kind = itemEdit.dataset.aboutItemEdit
    const index = Number(itemEdit.dataset.itemIndex)
    const content = collectAboutContent()
    state.aboutPage.draftContent = content
    const item = content[kind]?.items?.[index]
    if (!item) return
    openItemModal({ scope: 'about', kind, index, title: `编辑${item.title || item.name || '条目'}`, html: aboutItemFields(kind, index, item) })
  }
})

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

document.querySelector('[data-news-form]').addEventListener('submit', (event) => event.preventDefault())
document.querySelector('[data-news-editor]').addEventListener('click', async (event) => {
  if (event.target.closest('[data-news-add]')) {
    event.preventDefault()
    openNewsModal(-1)
    return
  }
  if (event.target.closest('[data-news-apply-sort]')) {
    event.preventDefault()
    const button = event.target.closest('[data-news-apply-sort]')
    button.disabled = true
    try {
      await applyNewsSort()
    } catch (error) {
      toast(error.message, true)
    } finally {
      button.disabled = false
    }
    return
  }
  const edit = event.target.closest('[data-news-edit]')
  if (edit) {
    event.preventDefault()
    openNewsModal(Number(edit.dataset.newsEdit))
    return
  }
  const remove = event.target.closest('[data-news-remove]')
  if (remove) {
    event.preventDefault()
    if (!window.confirm('删除后前台将不再展示这条新闻，确定吗？')) return
    const index = Number(remove.dataset.newsRemove)
    const meta = collectNewsPageMeta()
    const items = [...(state.newsPage?.draftContent?.items || [])]
    items.splice(index, 1)
    try {
      await persistNewsFeed({ ...meta, items }, '新闻已删除并发布')
    } catch (error) {
      toast(error.message, true)
    }
  }
})
document.querySelector('[data-news-publish]').addEventListener('click', async (event) => {
  const button = event.currentTarget
  button.disabled = true
  try {
    const meta = collectNewsPageMeta()
    await persistNewsFeed({ ...meta, items: collectNewsItemsBySort() }, '新闻中心已更新')
  } catch (error) {
    toast(error.message, true)
  } finally {
    button.disabled = false
  }
})

document.querySelector('[data-site-form]').addEventListener('submit', (event) => event.preventDefault())
document.querySelector('[data-site-save]').addEventListener('click', async (event) => {
  const button = event.currentTarget
  button.disabled = true
  try { await saveSiteDraft() } catch (error) { toast(error.message, true) } finally { button.disabled = false }
})
document.querySelector('[data-site-publish]').addEventListener('click', async (event) => {
  if (!window.confirm('确认发布全站设置？Logo 与联系方式会立即出现在所有页面。')) return
  const button = event.currentTarget
  button.disabled = true
  try {
    await saveSiteDraft({ quiet: true })
    const { page } = await api('/pages/site/publish', { method: 'POST' })
    state.sitePage = page
    updateSiteStatus(page)
    toast('全站设置已发布')
  } catch (error) { toast(error.message, true) } finally { button.disabled = false }
})
document.querySelector('[data-site-editor]').addEventListener('input', (event) => {
  const field = event.target.closest('[data-home-field]')
  if (!field) return
  const preview = document.querySelector(`[data-site-editor] [data-home-preview-for="${field.dataset.homeField}"]`)
  if (preview) {
    preview.src = field.value.trim()
    preview.hidden = !field.value.trim()
  }
})
document.querySelector('[data-site-editor]').addEventListener('change', async (event) => {
  const upload = event.target.closest('[data-home-upload-for]')
  const file = upload?.files?.[0]
  if (!upload || !file) return
  upload.disabled = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const { url } = await api('/pages/media/image', { method: 'POST', body: formData })
    const field = document.querySelector(`[data-site-editor] [data-home-field="${upload.dataset.homeUploadFor}"]`)
    field.value = url
    field.dispatchEvent(new Event('input', { bubbles: true }))
    toast('图片上传成功，请继续保存草稿')
  } catch (error) { toast(error.message, true) } finally {
    upload.disabled = false
    upload.value = ''
  }
})

document.querySelector('[data-simple-form]').addEventListener('submit', (event) => event.preventDefault())
document.querySelector('[data-simple-save]').addEventListener('click', async (event) => {
  const button = event.currentTarget
  button.disabled = true
  try { await saveSimpleDraft() } catch (error) { toast(error.message, true) } finally { button.disabled = false }
})
document.querySelector('[data-simple-publish]').addEventListener('click', async (event) => {
  if (!window.confirm('确认发布该页首屏内容？')) return
  const button = event.currentTarget
  button.disabled = true
  try {
    await saveSimpleDraft({ quiet: true })
    const { page } = await api(`/pages/simple/${encodeURIComponent(state.simpleKey)}/publish`, { method: 'POST' })
    state.simplePage = page
    updateSimpleStatus(page)
    toast('页面首屏已发布')
  } catch (error) { toast(error.message, true) } finally { button.disabled = false }
})
document.querySelector('[data-simple-editor]').addEventListener('input', (event) => {
  const field = event.target.closest('[data-home-field]')
  if (!field) return
  const preview = document.querySelector(`[data-simple-editor] [data-home-preview-for="${field.dataset.homeField}"]`)
  if (preview) {
    preview.src = field.value.trim()
    preview.hidden = !field.value.trim()
  }
})
document.querySelector('[data-simple-editor]').addEventListener('change', async (event) => {
  const upload = event.target.closest('[data-home-upload-for]')
  const file = upload?.files?.[0]
  if (!upload || !file) return
  upload.disabled = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const { url } = await api('/pages/media/image', { method: 'POST', body: formData })
    const field = document.querySelector(`[data-simple-editor] [data-home-field="${upload.dataset.homeUploadFor}"]`)
    field.value = url
    field.dispatchEvent(new Event('input', { bubbles: true }))
    toast('图片上传成功，请继续保存草稿')
  } catch (error) { toast(error.message, true) } finally {
    upload.disabled = false
    upload.value = ''
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

document.querySelector('[data-item-modal]').addEventListener('click', (event) => {
  if (event.target.closest('[data-item-modal-close]')) {
    closeItemModal()
    return
  }
  const typeBtn = event.target.closest('[data-news-type-btn]')
  if (typeBtn) {
    event.preventDefault()
    setNewsModalType(typeBtn.dataset.newsTypeBtn)
    return
  }
  if (event.target.closest('[data-item-modal-apply]')) {
    event.preventDefault()
    applyItemModal()
  }
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !document.querySelector('[data-item-modal]').hidden) closeItemModal()
})
document.querySelector('[data-item-modal]').addEventListener('input', (event) => {
  const homeEl = event.target.closest('[data-home-field]')
  if (homeEl) {
    const preview = document.querySelector(`[data-home-preview-for="${homeEl.dataset.homeField}"]`)
    if (preview) {
      preview.src = homeEl.value.trim()
      preview.hidden = !homeEl.value.trim()
    }
  }
  const aboutEl = event.target.closest('[data-about-field]')
  if (aboutEl) {
    const preview = document.querySelector(`[data-about-preview-for="${aboutEl.dataset.aboutField}"]`)
    if (preview) {
      preview.src = aboutEl.value.trim()
      preview.hidden = !aboutEl.value.trim()
    }
  }
  const newsEl = event.target.closest('[data-news-field]')
  if (newsEl) {
    const preview = document.querySelector(`[data-news-preview-for="${newsEl.dataset.newsField}"]`)
    if (preview) {
      preview.src = newsEl.value.trim()
      preview.hidden = !newsEl.value.trim()
    }
  }
})
document.querySelector('[data-item-modal]').addEventListener('change', async (event) => {
  const homeUpload = event.target.closest('[data-home-upload-for]')
  const aboutUpload = event.target.closest('[data-about-upload-for]')
  const newsUpload = event.target.closest('[data-news-upload-for]')
  const upload = homeUpload || aboutUpload || newsUpload
  const file = upload?.files?.[0]
  if (!upload || !file) return
  const path = homeUpload ? upload.dataset.homeUploadFor : aboutUpload ? upload.dataset.aboutUploadFor : upload.dataset.newsUploadFor
  const isVideo = Boolean(newsUpload && path === 'videoUrl')
  upload.disabled = true
  try {
    const formData = new FormData()
    formData.append(isVideo ? 'video' : 'image', file)
    const { url } = await api(isVideo ? '/pages/media/video' : '/pages/media/image', { method: 'POST', body: formData })
    const selector = homeUpload ? `[data-home-field="${path}"]` : aboutUpload ? `[data-about-field="${path}"]` : `[data-news-field="${path}"]`
    const field = document.querySelector(selector)
    if (field) {
      field.value = url
      field.dispatchEvent(new Event('input', { bubbles: true }))
    }
    toast(isVideo ? '视频已上传，点发布上线即可' : newsUpload ? '封面已上传，点发布上线即可' : '图片上传成功，请点完成后再保存草稿')
  } catch (error) {
    toast(error.message, true)
  } finally {
    upload.disabled = false
    upload.value = ''
  }
})

api('/me').then(({ user }) => showAdmin(user)).catch(showLogin)
