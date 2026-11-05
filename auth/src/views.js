import { authConfig } from './config.js'

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])
}

/** CSP 禁止内联 style，星点用固定种子生成 SVG 属性，保证每次渲染一致。 */
const starsMarkup = (() => {
  let seed = 20261105
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  const colors = ['#ffffff', '#dce8ff', '#c8dcff', '#ffe6cf']
  return Array.from({ length: 70 }, (_, index) => {
    const cx = (random() * 600).toFixed(1)
    const cy = (random() * 900).toFixed(1)
    const r = (0.35 + random() * 1.2).toFixed(2)
    const opacity = (0.2 + random() * 0.6).toFixed(2)
    const color = colors[Math.floor(random() * colors.length)]
    const twinkle = index % 9 === 0 ? ` class="auth-star--twinkle auth-star--d${index % 4}"` : ''
    return `<circle${twinkle} cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}"/>`
  }).join('')
})()

const globeMarkup = `<svg class="auth-globe" viewBox="0 0 420 240" aria-hidden="true">
  <defs>
    <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#4f8cff" stop-opacity=".5"/>
      <stop offset="1" stop-color="#4f8cff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="globe-fill" cx="34%" cy="30%" r="75%">
      <stop offset="0" stop-color="#c4e6ff"/>
      <stop offset=".22" stop-color="#5b97ff"/>
      <stop offset=".58" stop-color="#2140b0"/>
      <stop offset="1" stop-color="#080d36"/>
    </radialGradient>
    <radialGradient id="globe-moon" cx="38%" cy="35%" r="70%">
      <stop offset="0" stop-color="#fff6ea"/>
      <stop offset="1" stop-color="#d7b28e"/>
    </radialGradient>
    <clipPath id="globe-clip"><circle cx="210" cy="120" r="72"/></clipPath>
  </defs>
  <circle cx="210" cy="120" r="118" fill="url(#globe-glow)"/>
  <ellipse class="auth-orbit" cx="210" cy="124" rx="178" ry="50" transform="rotate(-9 210 124)"/>
  <circle cx="210" cy="120" r="72" fill="url(#globe-fill)"/>
  <g class="auth-globe-grid" clip-path="url(#globe-clip)">
    <ellipse cx="210" cy="120" rx="22" ry="72"/>
    <ellipse cx="210" cy="120" rx="48" ry="72"/>
    <ellipse cx="210" cy="120" rx="68" ry="72"/>
    <ellipse cx="210" cy="96" rx="68" ry="12"/>
    <ellipse cx="210" cy="120" rx="72" ry="14"/>
    <ellipse cx="210" cy="146" rx="66" ry="12"/>
  </g>
  <g class="auth-globe-nodes">
    <circle class="auth-node auth-node--d0" cx="183" cy="98" r="2.6"/>
    <circle class="auth-node auth-node--d1" cx="236" cy="110" r="2.2"/>
    <circle class="auth-node auth-node--d2" cx="204" cy="146" r="2.4"/>
    <circle class="auth-node auth-node--d3" cx="251" cy="142" r="1.8"/>
    <path class="auth-node-link" d="M183 98 L236 110 L251 142 L204 146 Z"/>
  </g>
  <circle cx="210" cy="120" r="72" fill="none" stroke="#9cc8ff" stroke-opacity=".35"/>
  <circle r="6.5" fill="url(#globe-moon)">
    <animateMotion dur="16s" repeatCount="indefinite" rotate="0" path="M32,124 a178,50 0 1,0 356,0 a178,50 0 1,0 -356,0"/>
  </circle>
</svg>`

function brandPanel() {
  const base = authConfig.basePath
  return `<aside class="auth-side" aria-hidden="true">
      <svg class="auth-stars" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">${starsMarkup}</svg>
      <div class="auth-side__brand">
        <img class="auth-side__logo" src="${base}/assets/artink-logo-light.png" alt="" />
        <span class="auth-side__eyebrow"><i></i>空间智能 · SPACE INTELLIGENCE</span>
        <p class="auth-side__headline">连接空间业务<br />让智能应用<em>触手可及</em></p>
      </div>
      ${globeMarkup}
      <div class="auth-side__quote">
        <small>OUR MISSION</small>
        <p>把物理空间，做成可感知、可调度、可运营的智能系统。</p>
      </div>
    </aside>`
}

function pageShell({ title, body }) {
  const base = authConfig.basePath
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)} | 安托未来</title>
  <link rel="stylesheet" href="${base}/assets/auth.css" />
</head>
<body>
  <main class="auth-shell">
    <div class="auth-box">
      ${brandPanel()}
      <section class="auth-main" aria-labelledby="auth-title">
        ${body}
      </section>
    </div>
  </main>
</body>
</html>`
}

function mainHeader(greeting) {
  return `<header class="auth-main__hd">
          <span>${escapeHtml(greeting)}</span>
          <span class="auth-status"><i></i>服务在线</span>
        </header>`
}

const footer = '<footer class="auth-foot"><strong>杭州安托未来科技有限公司</strong> · 登录即表示同意企业安全与隐私规范</footer>'

function dingTalkPanel(uid) {
  const base = authConfig.basePath
  return `<div class="auth-panel auth-panel--dingtalk">
          <a class="auth-dingtalk" href="${base}/interaction/${encodeURIComponent(uid)}/dingtalk">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.92 10.44c-.071.287-.233.723-.46 1.209l-.005.013c-.538 1.152-1.913 3.411-1.913 3.411l-.006-.013-.403.7h1.946l-3.715 4.948.845-3.358h-1.534l.534-2.219c-.433.104-.943.247-1.548.437 0 0-.817.479-2.357-.917 0 0-1.039-.914-.436-1.143.256-.097 1.243-.22 2.019-.325 1.05-.141 1.693-.216 1.693-.216s-3.235.048-4.003-.072c-.767-.12-1.74-1.401-1.948-2.527 0 0-.32-.619.691-.326 1.012.293 5.199 1.143 5.199 1.143S8.62 9.476 7.993 8.774c-.627-.703-1.843-3.832-1.685-5.755 0 0 .069-.48.562-.35 0 0 6.932 3.164 7.698 3.434.766.27 1.468.698 1.352 1.337z"/></svg>
            使用钉钉登录
          </a>
          <p class="auth-hint">将跳转到钉钉授权页面，企业成员确认后即可进入。</p>
          <ul class="auth-perks">
            <li><i>01</i><div><strong>企业身份直接登录</strong><span>使用钉钉组织身份，无需另记密码</span></div></li>
            <li><i>02</i><div><strong>一次登录，多处通用</strong><span>Aspace 各应用共享同一登录状态</span></div></li>
          </ul>
        </div>`
}

function passwordPanel(uid) {
  const base = authConfig.basePath
  return `<div class="auth-panel auth-panel--password">
          <form class="auth-form" action="${base}/interaction/${encodeURIComponent(uid)}/password" method="post">
            <label class="auth-field">账号<input name="account" type="text" minlength="3" maxlength="64" autocomplete="username" placeholder="请输入账号" required /></label>
            <label class="auth-field">密码<input name="password" type="password" minlength="8" maxlength="72" autocomplete="current-password" placeholder="请输入密码" required /></label>
            <button class="auth-submit" name="action" value="login" type="submit">登 录</button>
          </form>
          <a class="auth-switch" href="${base}/interaction/${encodeURIComponent(uid)}?mode=register">没有账号？注册普通账号</a>
        </div>`
}

function registerPanel(uid) {
  const base = authConfig.basePath
  return `<form class="auth-form" action="${base}/interaction/${encodeURIComponent(uid)}/password" method="post">
          <label class="auth-field">姓名<input name="name" type="text" maxlength="80" autocomplete="name" placeholder="请输入姓名" required /></label>
          <label class="auth-field">账号<input name="account" type="text" minlength="3" maxlength="64" autocomplete="username" placeholder="字母、数字或邮箱" required /></label>
          <label class="auth-field">密码<input name="password" type="password" minlength="8" maxlength="72" autocomplete="new-password" placeholder="至少 8 位" required /></label>
          <button class="auth-submit" name="action" value="register" type="submit">注册并登录</button>
        </form>
        <a class="auth-switch" href="${base}/interaction/${encodeURIComponent(uid)}">已有账号？返回登录</a>`
}

function methodsMarkup({ uid, dingTalkEnabled, passwordEnabled, preferPassword }) {
  if (dingTalkEnabled && passwordEnabled) {
    return `<div class="auth-methods">
          <input class="auth-tab-input" type="radio" name="auth-tab" id="auth-tab-dingtalk"${preferPassword ? '' : ' checked'} />
          <input class="auth-tab-input" type="radio" name="auth-tab" id="auth-tab-password"${preferPassword ? ' checked' : ''} />
          <div class="auth-tabs" role="presentation">
            <label class="auth-tab auth-tab--dingtalk" for="auth-tab-dingtalk">钉钉登录</label>
            <label class="auth-tab auth-tab--password" for="auth-tab-password">账号密码登录</label>
          </div>
          ${dingTalkPanel(uid)}
          ${passwordPanel(uid)}
        </div>`
  }
  if (dingTalkEnabled) return dingTalkPanel(uid)
  if (passwordEnabled) return passwordPanel(uid)
  return '<p class="auth-hint">当前没有可用的登录方式，请联系管理员。</p>'
}

export function loginPage({ uid, clientName, dingTalkEnabled, passwordEnabled, mode = 'login', error = '' }) {
  const registering = mode === 'register' && passwordEnabled
  const name = escapeHtml(clientName)
  const body = `${mainHeader(registering ? '创建账号' : '欢迎回来')}
        <h1 id="auth-title">${registering ? '注册普通账号' : `登录 ${name}`}</h1>
        <p class="auth-lead">${registering
          ? '创建一个用于收藏、排序与最近访问的个人账号。'
          : '通过企业钉钉一键进入，或使用分配给你的账号。'}</p>
        ${error ? `<p class="auth-error" role="alert">${escapeHtml(error)}</p>` : ''}
        ${registering
          ? registerPanel(uid)
          : methodsMarkup({ uid, dingTalkEnabled, passwordEnabled, preferPassword: Boolean(error) })}
        ${footer}`
  return pageShell({ title: registering ? '注册账号' : '统一登录', body })
}

export function errorPage(message) {
  const body = `${mainHeader('统一身份认证')}
        <h1 id="auth-title">暂时无法完成登录</h1>
        <p class="auth-lead">请稍后重试；如果问题持续出现，请联系管理员。</p>
        <p class="auth-error" role="alert">${escapeHtml(message)}</p>
        <a class="auth-submit auth-submit--link" href="/">返回首页重新登录</a>
        ${footer}`
  return pageShell({ title: '登录失败', body })
}
