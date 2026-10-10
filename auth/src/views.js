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

/** 第三方登录尚未对接完成前不展示；接入后改为 true，并保持横向图标入口。 */
const SHOW_SOCIAL_LOGIN = false

function socialLoginMarkup({ uid, dingTalkEnabled }) {
  if (!SHOW_SOCIAL_LOGIN) return ''
  const base = authConfig.basePath
  const dingTalk = dingTalkEnabled
    ? `<a class="auth-method" href="${base}/interaction/${encodeURIComponent(uid)}/dingtalk" title="钉钉登录"><i>钉</i><span>钉钉</span></a>`
    : '<button class="auth-method" type="button" disabled title="钉钉登录待配置"><i>钉</i><span>钉钉</span></button>'
  return `<div class="auth-methods" aria-label="其他登录方式">
      ${dingTalk}
      <button class="auth-method" type="button" disabled title="微信登录待接入"><i>微</i><span>微信</span></button>
      <button class="auth-method" type="button" disabled title="企业 OA 登录待接入"><i>OA</i><span>企业 OA</span></button>
      <button class="auth-method" type="button" disabled title="短信登录待接入"><i>码</i><span>短信</span></button>
    </div>
    <div class="auth-divider"><span>账号登录</span></div>`
}

export function loginPage({ uid, clientName, dingTalkEnabled, passwordEnabled, mode = 'login', error = '' }) {
  const base = authConfig.basePath
  const registering = mode === 'register'
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>统一登录 | 安托未来</title>
  <link rel="stylesheet" href="${base}/assets/auth.css" />
</head>
<body>
  <main class="auth-shell">
    <section class="auth-card" aria-labelledby="auth-title">
      <header class="auth-brand"><span>A</span><div><strong>安托未来统一身份</strong><small>Atuo Future Identity</small></div></header>
      <p class="auth-eyebrow">UNIFIED AUTHENTICATION</p>
      <h1 id="auth-title">${registering ? '注册普通账号' : `登录到 ${escapeHtml(clientName)}`}</h1>
      <p class="auth-lead">${registering ? '创建一个用于收藏、排序与最近访问的个人账号。' : '使用同一个身份安全访问已授权的内部系统。'}</p>
      ${error ? `<p class="auth-error" role="alert">${escapeHtml(error)}</p>` : ''}
      ${registering ? '' : socialLoginMarkup({ uid, dingTalkEnabled })}
      ${passwordEnabled
        ? registering
          ? `<form class="auth-local" action="${base}/interaction/${encodeURIComponent(uid)}/password" method="post">
              <label>姓名<input name="name" type="text" maxlength="80" autocomplete="name" placeholder="请输入姓名" required /></label>
              <label>账号<input name="account" type="text" minlength="3" maxlength="64" autocomplete="username" placeholder="字母、数字或邮箱" required /></label>
              <label>密码<input name="password" type="password" minlength="8" maxlength="72" autocomplete="new-password" placeholder="至少 8 位" required /></label>
              <button name="action" value="register" type="submit">注册并登录</button>
            </form>
            <a class="auth-switch" href="${base}/interaction/${encodeURIComponent(uid)}">已有账号？返回登录</a>`
          : `<form class="auth-local" action="${base}/interaction/${encodeURIComponent(uid)}/password" method="post">
            <label>账号<input name="account" type="text" minlength="3" maxlength="64" autocomplete="username" placeholder="请输入账号" required /></label>
            <label>密码<input name="password" type="password" minlength="8" maxlength="72" autocomplete="current-password" placeholder="请输入密码" required /></label>
            <button name="action" value="login" type="submit">登录</button>
          </form>
          <a class="auth-switch" href="${base}/interaction/${encodeURIComponent(uid)}?mode=register">没有账号？注册普通账号</a>`
        : '<button class="auth-password" type="button" disabled>普通账号登录暂未启用</button>'}
      <footer>登录即表示你同意企业安全与隐私规范</footer>
    </section>
  </main>
</body>
</html>`
}

export function errorPage(message) {
  return `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>登录失败</title><link rel="stylesheet" href="${authConfig.basePath}/assets/auth.css" /></head>
<body><main class="auth-shell"><section class="auth-card auth-card--error"><header class="auth-brand"><span>A</span><div><strong>安托未来统一身份</strong></div></header><h1>暂时无法完成登录</h1><p class="auth-error">${escapeHtml(message)}</p><a class="auth-back" href="${authConfig.basePath}/">返回统一登录服务</a></section></main></body>
</html>`
}
