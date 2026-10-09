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

export function loginPage({ uid, clientName, dingTalkEnabled, passwordEnabled, error = '' }) {
  const base = authConfig.basePath
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
      <h1 id="auth-title">登录到 ${escapeHtml(clientName)}</h1>
      <p class="auth-lead">使用同一个身份安全访问已授权的内部系统。</p>
      ${error ? `<p class="auth-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <div class="auth-methods">
        ${dingTalkEnabled
          ? `<a class="auth-method auth-method--primary" href="${base}/interaction/${encodeURIComponent(uid)}/dingtalk"><i>钉</i><span><b>使用钉钉登录</b><small>推荐 · 企业内部账号</small></span><em>→</em></a>`
          : '<button class="auth-method auth-method--primary" type="button" disabled><i>钉</i><span><b>使用钉钉登录</b><small>等待配置企业应用参数</small></span></button>'}
        <button class="auth-method" type="button" disabled><i>微</i><span><b>使用微信登录</b><small>第二批接入</small></span></button>
        <button class="auth-method" type="button" disabled><i>OA</i><span><b>使用企业 OA 登录</b><small>按客户系统对接</small></span></button>
        <button class="auth-method" type="button" disabled><i>码</i><span><b>短信验证码登录</b><small>等待短信服务配置</small></span></button>
      </div>
      <div class="auth-divider"><span>其他方式</span></div>
      ${passwordEnabled
        ? `<form class="auth-local" action="${base}/interaction/${encodeURIComponent(uid)}/password" method="post">
            <label>账号<input name="account" type="text" minlength="3" maxlength="64" autocomplete="username" placeholder="请输入账号" required /></label>
            <label>密码<input name="password" type="password" minlength="8" maxlength="72" autocomplete="current-password" placeholder="请输入密码" required /></label>
            <button name="action" value="login" type="submit">登录</button>
          </form>
          <details class="auth-register">
            <summary>没有账号？注册普通账号</summary>
            <form class="auth-local" action="${base}/interaction/${encodeURIComponent(uid)}/password" method="post">
              <label>姓名<input name="name" type="text" maxlength="80" autocomplete="name" placeholder="请输入姓名" required /></label>
              <label>账号<input name="account" type="text" minlength="3" maxlength="64" autocomplete="username" placeholder="字母、数字或邮箱" required /></label>
              <label>密码<input name="password" type="password" minlength="8" maxlength="72" autocomplete="new-password" placeholder="至少 8 位" required /></label>
              <button name="action" value="register" type="submit">注册并登录</button>
            </form>
          </details>`
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
