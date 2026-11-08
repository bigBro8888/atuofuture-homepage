# 安托未来统一 Auth 接入说明

## 定位

统一 Auth 是独立身份服务，不属于 Aspace One 门户，也不属于任何一个业务子系统。

- Aspace One 第一阶段保持公开访问，仅承担产品入口与信息聚合。
- Aspace、官网后台、资产管理等子系统均作为 OIDC Client 接入。
- 子系统不得共享用户密码、登录 Cookie 或服务账号。
- 所有系统统一跳转到 Auth 登录窗口，登录成功后通过授权码回调。

## 线上现状（2026-11）

| 项目 | 值 |
|---|---|
| 对外主域名 | `https://ai.atuofuture.com`（系统 nginx 443 → 官网 nginx 18443） |
| Issuer | `https://ai.atuofuture.com/auth` |
| Auth 服务 | 代码 `auth/`，监听 `127.0.0.1:18089`，systemd 服务 `atuofuture-auth` |
| 官网后台 API | 代码 `server/`，监听 `127.0.0.1:18087`，systemd 服务 `atuofuture-home` |
| 登录方式 | 钉钉扫码 + 账号密码（含普通账号注册） |
| 已登记客户端 | `aspace-one`（官网首页 / Aspace 平台）、`website-admin`（官网后台） |
| 钉钉应用 | 企业内部应用「安托未来官网登录」，凭证见服务器 `.env` |

两个服务共用服务器上的 `/var/www/mydoc/atuofuture/.env`，部署流程见《ECS线上部署手册》。

## 协议

服务基于 OAuth 2.1 / OpenID Connect，使用 Authorization Code + PKCE：

1. 子系统生成 `state`、`nonce` 和 PKCE `code_verifier`。
2. 浏览器跳转到 `{issuer}/auth`。
3. 用户在统一窗口完成钉钉或账号密码认证。
4. Auth 将一次性授权码回传至子系统登记过的 `redirect_uri`。
5. 子系统后端或公共客户端使用 `code_verifier` 换取 ID Token。
6. 子系统校验签名、`iss`、`aud`、`exp`、`nonce` 后建立自己的业务会话。

禁止使用隐式模式，也不能只相信前端传入的姓名、邮箱或组织信息。

`profile` scope 返回的 claims：`name`、`picture`、`idp`（`dingtalk` / `password`）、`dingtalk_unionid`（仅钉钉身份）。子系统用 `sub` 作为统一用户主键，用 `dingtalk_unionid` 与钉钉通讯录对应。

## 一、钉钉开发者后台配置

在 [钉钉开发者后台](https://open-dev.dingtalk.com/) 创建**企业内部应用**，按下面逐项配置。每改一次权限或回调，都要到「版本管理与发布」**发布新版本**才会生效。

### 1. 凭证

「凭证与基础信息」里的 Client ID（AppKey）和 Client Secret（AppSecret）写进服务器 `.env`：

```text
AUTH_DINGTALK_CLIENT_ID=应用 Client ID
AUTH_DINGTALK_CLIENT_SECRET=应用 Client Secret
```

密钥只能存放在服务器环境变量中，不能提交到仓库或下发到浏览器。Auth 服务和官网后台 API 都读这两项（后台用它调通讯录接口）。

### 2. 应用能力与回调地址

- 「添加应用能力」里添加**网页应用**。
- 「安全设置」→ 重定向 URL（回调域名）填写：

```text
https://ai.atuofuture.com/auth/callback/dingtalk
```

即 `{AUTH_ISSUER}/callback/dingtalk`，必须是 HTTPS，必须与 `AUTH_PUBLIC_ORIGIN` 同一域名、同一端口。

### 3. 权限

「权限管理」里开通以下权限，通讯录权限范围选**全部员工**：

| 权限 | 权限点 code | 用途 |
|---|---|---|
| 个人信息读权限 | `Contact.User.Read` | 扫码登录后读取本人姓名、头像、unionId（`/v1.0/contact/users/me`） |
| 通讯录部门信息读权限 | `qyapi_get_department_list` | 后台「同步组织架构」遍历部门 |
| 通讯录部门成员读权限 | `qyapi_get_department_member` | 后台「同步组织架构」拉取部门成员 |

以上都是免审权限，点「立即开通」后看到「已开通」提示即可，然后发布新版本。

> 注意：开通按钮必须**人工真实点击**。用脚本触发的点击可能页面显示已开通，但权限并没有真正登记，接口仍返回 403。权限表格较宽时「立即开通」在右侧，需要先横向滚动才能看到。

### 4. 发布

「版本管理与发布」→ 填版本号和描述 → 保存 → 确认发布。可见范围选全部员工。

## 二、服务器配置

`.env` 中与统一登录相关的项：

```text
AUTH_PORT=18089
AUTH_PUBLIC_ORIGIN=https://ai.atuofuture.com
AUTH_ISSUER=https://ai.atuofuture.com/auth
AUTH_PORTAL_ORIGINS=https://ai.atuofuture.com,https://ai.atuofuture.com:18443,http://47.103.102.65:18180
AUTH_PASSWORD_LOGIN_ENABLED=true
AUTH_COOKIE_KEYS=随机长字符串（生产必填）
AUTH_DINGTALK_CLIENT_ID=...
AUTH_DINGTALK_CLIENT_SECRET=...
# 钉钉登录组织列表（未登记的公司不会出现在登录页；不配则只有「个人钉钉」）
# AUTH_DINGTALK_LOGIN_ORGS=[{"name":"安托未来","corp_id":"dingxxxxxxxx"}]
# 或只配一家时可用：
# AUTH_DINGTALK_DEFAULT_CORP_ID=dingxxxxxxxx
# AUTH_DINGTALK_DEFAULT_CORP_NAME=安托未来
AUTH_EXTRA_CLIENTS_JSON=[...]   # 新系统登记，见 3.1
```

- 钉钉 Tab：**个人钉钉**始终可用；**按组织登录**只展示 `AUTH_DINGTALK_LOGIN_ORGS`（或 DEFAULT_CORP_*）里登记的公司。其它公司需在钉钉侧授权同一套应用后，把 corpId 加进该列表并重启 Auth。一般**不必**为每家公司另配一套 Client ID。
- `AUTH_PORTAL_ORIGINS` 决定各客户端允许的 `redirect_uri` 和退出回跳地址，新增访问域名时要加进来并重启 `atuofuture-auth`。
- 配置了钉钉凭证但 `AUTH_ISSUER` 不是 HTTPS 时，Auth 服务会拒绝启动。
- 官网 nginx（`/etc/nginx/atuofuture-only.conf`）的 server 块必须保留 `absolute_redirect off;`，否则补斜杠的 301 会带出内部端口 `:18443`，回调换了 origin 后 PKCE / state 丢失，登录静默失败。
- 官网 nginx 把 `/auth/` 反代到 `127.0.0.1:18089`，并传 `Host $http_host` 和 `X-Forwarded-Proto`。

### 只有主域名能用钉钉登录

钉钉回调固定回到 `AUTH_PUBLIC_ORIGIN`。如果登录页是在别的地址打开的（IP `47.103.102.65:18180`、`ai.atuofuture.com:18443`），钉钉授权回来后接不上原来的登录会话，所以 Auth 在非主域名下会**隐藏钉钉入口**，只显示账号密码。

为此前端统一处理：

- 官网首页、Aspace 平台：从 IP 或其它端口点「登录」时，先跳到 `https://ai.atuofuture.com` 的同一页面（带 `?site_login=1`），再自动发起登录。逻辑在 `src/lib/site-account.js` 的 `loginOrigin()` / `canonicalLoginUrl()` / `consumeLoginHandoff()`。
- 官网后台：登录页「钉钉登录」按钮直接指向主域名的 `/api/admin/oidc/start`。

新系统用第三节的接入代码时，登录地址固定是 `https://ai.atuofuture.com/auth`，不受这个问题影响；自己写登录逻辑时，也要用这个完整地址，不要用相对路径 `/auth/...`。

## 三、新系统接入指南（含代码）

### 3.0 先了解这几点

- **统一登录窗口是整页跳转**，不是嵌在 iframe 里的弹窗（Auth 禁止被嵌入，防点击劫持）。任何系统点「登录」都会跳到同一个 `https://ai.atuofuture.com/auth/...` 登录页（钉钉 / 账号密码），登录后跳回原系统。
- **一次登录，多处通用**：用户在任一系统登录后，统一 Auth 在 `ai.atuofuture.com` 保留会话；同一浏览器进入别的系统时直接跳回、不用再输密码。只有带 `prompt=login` 时才强制重新登录。
- **退出是全局的**：任一系统调用统一退出，会结束统一 Auth 会话。
- **统一 Auth 只负责「你是谁」**，各系统自己决定「你能做什么」（角色、权限、是否允许进入）。

选哪种接入方式：

| 系统形态 | 推荐方式 | 接入代码 |
|---|---|---|
| 有 Node.js / Express 后端 | **方式 B：后端接入**（最推荐，token 不落浏览器） | `auth/sdk/atuo-auth-express.js` |
| 纯前端单页应用（Vue / React / 原生） | 方式 A：浏览器接入 | `auth/sdk/atuo-auth-browser.js` |
| Java / Python / Go 等其它后端 | 方式 C：标准 OIDC 库 | 按 3.4 的接口表配置 |

两份接入代码都无第三方依赖，**直接复制到新项目里使用**。它们由 `server/test/auth-sdk.test.js` 做端到端测试（真实启动 Auth，走完登录 → 跨系统免登录 → 取用户 → 退出），改动后运行 `node --test server/test/auth-sdk.test.js` 验证；这个测试文件本身也是最完整的用法示例。

### 3.1 第一步：登记客户端（只改服务器 `.env`）

每个系统一个独立的 `client_id`。在服务器 `/var/www/mydoc/atuofuture/.env` 里追加 `AUTH_EXTRA_CLIENTS_JSON`（**必须写成一行 JSON 数组**），多个系统放在同一个数组里：

```text
AUTH_EXTRA_CLIENTS_JSON=[{"client_id":"asset-system","client_name":"资产管理系统","redirect_uris":["https://asset.atuofuture.com/auth/callback","http://localhost:5173/auth/callback"],"post_logout_redirect_uris":["https://asset.atuofuture.com/","http://localhost:5173/"]}]
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `client_id` | 是 | 英文小写加短横线，全局唯一；与内置客户端同名时会覆盖内置配置 |
| `client_name` | 否 | 中文名，用于日志和审计 |
| `redirect_uris` | 是 | 登录回调地址，**必须与代码里的回调完全一致**（协议、域名、端口、路径都要一样）；线上用 HTTPS，可以同时登记本地开发地址 |
| `post_logout_redirect_uris` | 建议 | 退出后允许跳回的地址；没登记的地址会被拒绝，退出时报错 |
| `token_endpoint_auth_method` | 否 | 默认 `none`（公共客户端 + PKCE，不需要密钥），A、B 两种方式都用默认值 |

改完重启 Auth：

```bash
systemctl restart atuofuture-auth && systemctl is-active atuofuture-auth
```

验证是否登记成功：浏览器打开下面的地址（只换 `client_id` 和 `redirect_uri`，`code_challenge` 原样保留，它至少要 43 位）：

```text
https://ai.atuofuture.com/auth/auth?client_id=asset-system&response_type=code&scope=openid&redirect_uri=https%3A%2F%2Fasset.atuofuture.com%2Fauth%2Fcallback&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256
```

- 出现统一登录页，或者（已登录时）直接跳到你的回调地址并带 `code=` → 登记成功。
- 页面显示 `invalid_client` → client_id 没登记上（检查 JSON 是否写成一行、Auth 是否重启）。
- 页面显示 `invalid_redirect_uri` → 回调地址和登记的不完全一致。

> 本地开发也可以直接接线上 Auth：把 `http://localhost:端口/auth/callback` 一起登记即可。登录页在线上主域名打开，钉钉和账号密码都能用；线上 Auth 允许已登记回调地址的来源跨域调用 token 和 userinfo 接口。

### 3.2 方式 B：Node.js / Express 后端接入（推荐）

把 `auth/sdk/atuo-auth-express.js` 复制到新项目（例如 `src/lib/atuo-auth.js`）。它会自动提供 4 个路由：

| 路由 | 作用 |
|---|---|
| `GET /auth/login?returnTo=/xxx` | 跳到统一登录页；登录完回到 `returnTo` |
| `GET /auth/callback` | 统一登录回调（就是登记的 `redirect_uris`） |
| `GET /auth/logout` | 清本系统会话并统一退出，回到系统首页 |
| `GET /auth/me` | 返回当前登录用户 JSON，未登录返回 401 |

后端代码：

```js
import express from 'express'
import { createAtuoAuth } from './lib/atuo-auth.js'

const auth = createAtuoAuth({
  clientId: 'asset-system',
  appOrigin: process.env.APP_ORIGIN,              // 如 https://asset.atuofuture.com
  sessionSecret: process.env.SESSION_SECRET,      // 至少 32 位随机字符串，只放 .env
  // issuer 默认 https://ai.atuofuture.com/auth
  // 和 Auth 部署在同一台服务器时加上，服务端直连更快：
  // internalUrl: 'http://127.0.0.1:18089/auth',

  // 登录成功后把统一身份映射成本系统用户；返回 null 表示不允许进入
  async onLogin(claims) {
    // claims: { sub, name, picture, idp, dingtalk_unionid, email }
    const user = await db.users.findOrCreateByAuthSub(claims.sub, {
      name: claims.name,
      avatar: claims.picture,
      dingtalkUnionId: claims.dingtalk_unionid,
    })
    if (!user.enabled) return null                // 未授权 / 已停用，跳到 deniedPath
    return { id: user.id, name: user.name, role: user.role }  // 会写进会话 Cookie，保持精简
  },
  deniedPath: '/no-access',
})

const app = express()
app.use(auth.router)

// 页面：未登录自动跳统一登录，登录后回到当前页
app.get('/dashboard', auth.requireLogin, (req, res) => res.send(`你好，${req.atuoUser.name}`))

// 接口：未登录返回 401 { error, loginUrl }
app.get('/api/assets', auth.requireUser, (req, res) => {
  if (req.atuoUser.role !== 'admin') return res.status(403).json({ error: 'forbidden' })
  res.json([])
})
```

前端只需要三个链接 / 请求，不碰任何 token：

```html
<a href="/auth/login">登录</a>
<a href="/auth/logout">退出登录</a>
<script type="module">
  const res = await fetch('/auth/me', { credentials: 'same-origin' })
  const user = res.ok ? await res.json() : null
  // user 为 null 时显示「登录」按钮；也可以直接 location.href = '/auth/login?returnTo=' + encodeURIComponent(location.pathname)
</script>
```

说明：

- 会话保存在本系统签名的 HttpOnly Cookie（默认 8 小时，`sessionTtlSeconds` 可调）。过期后再访问会跳统一登录；如果统一 Auth 会话还在，会直接跳回来，用户无感。
- 前后端分离、前端在不同端口开发时，用前端开发服务器代理 `/auth` 和 `/api` 到后端，保证 Cookie 同源。
- 登录失败或用户取消，会跳回 `returnTo` 并带 `?login_error=xxx`，前端可据此提示。

### 3.3 方式 A：纯前端单页应用接入

把 `auth/sdk/atuo-auth-browser.js` 复制到新项目（例如 `src/lib/atuo-auth.js`）。

初始化（全局一份）：

```js
// src/auth.js
import { createAtuoAuth } from './lib/atuo-auth.js'

export const auth = createAtuoAuth({
  clientId: 'asset-system',
  // 以下都有默认值，与 3.1 登记的地址一致即可：
  // issuer: 'https://ai.atuofuture.com/auth',
  // redirectUri: `${location.origin}/auth/callback`,
  // postLogoutRedirectUri: `${location.origin}/`,
})
```

应用启动时处理回调、拿当前用户：

```js
// src/main.js
import { auth } from './auth.js'

async function boot() {
  if (auth.isRedirectCallback()) {
    try {
      const result = await auth.handleRedirectCallback()
      if (result.error) console.warn('登录未完成：', result.error)   // 用户取消等
      history.replaceState(null, '', result.returnTo)               // 回到登录前的页面
    } catch (error) {
      alert(error.message)
      history.replaceState(null, '', '/')
    }
  }

  const user = await auth.getUser()   // 未登录或 token 过期返回 null
  if (!user) {
    // 需要登录的系统：直接跳统一登录。已在别的系统登录过时会自动跳回，不用再输密码
    await auth.login()
    return
  }
  renderApp(user)                     // user: { sub, name, picture, idp, dingtalk_unionid, email }
}

boot()
```

登录 / 退出按钮：

```js
loginButton.onclick = () => auth.login()                       // 有统一会话时直接回来
switchAccountButton.onclick = () => auth.login({ prompt: 'login' }) // 强制出现登录页（切换账号）
logoutButton.onclick = () => auth.logout()                     // 统一退出
```

调用自己的后端接口时带上 access token：

```js
const res = await fetch('/api/assets', {
  headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
})
```

后端校验这个 token：把它转发给统一 Auth 的 userinfo 接口，返回 200 就是有效用户（建议按 token 缓存 1～5 分钟）：

```js
async function requireAtuoToken(req, res, next) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'unauthorized' })
  const response = await fetch('https://ai.atuofuture.com/auth/me', { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) return res.status(401).json({ error: 'unauthorized' })
  req.atuoUser = await response.json()   // 再按 req.atuoUser.sub 查本系统的角色权限
  next()
}
```

说明：

- 回调页 `/auth/callback` 要能返回前端页面：SPA 的 history 路由兜底到 `index.html` 即可（nginx `try_files $uri /index.html;`）。
- token 存在 `localStorage`，有效期 1 小时；过期后 `getUser()` 返回 null，再调一次 `auth.login()` 通常会无感跳回。
- PKCE 依赖 `crypto.subtle`，只能在 HTTPS 或 `localhost` 下运行。

### 3.4 方式 C：其它语言后端

用各语言成熟的 OIDC 客户端库，配置 issuer 自动发现即可（如 Java Spring Security `oauth2-client`、Python `Authlib`、Go `coreos/go-oidc` + `golang.org/x/oauth2`）。要点：

- Issuer：`https://ai.atuofuture.com/auth`
- 客户端类型：公共客户端（`token_endpoint_auth_method=none`），**必须开启 PKCE（S256）**，不配置 client_secret
- Scope：`openid profile email`
- 回调地址与 3.1 登记的完全一致

接口一览：

| 用途 | 地址 |
|---|---|
| 自动发现 | `https://ai.atuofuture.com/auth/.well-known/openid-configuration` |
| 授权（登录页） | `https://ai.atuofuture.com/auth/auth` |
| 换取 token | `POST https://ai.atuofuture.com/auth/token` |
| 用户信息 | `GET https://ai.atuofuture.com/auth/me`（`Authorization: Bearer <access_token>`） |
| 退出 | `https://ai.atuofuture.com/auth/session/end?client_id=...&post_logout_redirect_uri=...&id_token_hint=...` |
| 公钥（验签） | `https://ai.atuofuture.com/auth/jwks` |

换 token 的请求格式：

```http
POST /auth/token HTTP/1.1
Host: ai.atuofuture.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&client_id=asset-system&code=<回调拿到的code>&redirect_uri=https%3A%2F%2Fasset.atuofuture.com%2Fauth%2Fcallback&code_verifier=<登录前生成的verifier>
```

### 3.5 用户身份与权限的约定

- **`sub` 是统一用户的唯一主键**，本系统用户表存 `auth_sub` 字段关联，不要用姓名或手机号关联。
- `idp` 表示登录方式（`dingtalk` / `password`）；`dingtalk_unionid` 可与钉钉通讯录对应（例如和官网后台一样做组织架构同步）。
- 首次登录的用户怎么处理由各系统决定。常见做法：自动建成「待授权」账号，管理员授权后才能使用（官网后台就是这样，参考第四节）。
- 不要相信前端传来的用户名、角色等信息；身份只以 token 或本系统会话为准。

### 3.6 上线检查清单

- [ ] `.env` 的 `AUTH_EXTRA_CLIENTS_JSON` 已登记线上 HTTPS 回调和退出地址，Auth 已重启
- [ ] 用 3.1 的验证地址能打开登录页
- [ ] 钉钉扫码登录、账号密码登录都能回到系统
- [ ] 先在官网登录，再打开新系统，确认不用再输密码
- [ ] 退出后刷新页面是未登录状态
- [ ] 未授权用户被拒绝时有明确提示
- [ ] 方式 B 的 `SESSION_SECRET` 只在服务器 `.env`，没有提交到仓库

### 3.7 当前已登记的客户端

| client_id | 回调 | 说明 |
|---|---|---|
| `aspace-one` | `{origin}/aspace-one/auth/callback` | 官网首页右上角登录、Aspace 平台；纯前端 PKCE，token 存浏览器 |
| `website-admin` | `{origin}/api/admin/oidc/callback` | 官网后台；服务端完成换码，建立后台自己的会话 Cookie |

这两个是内置客户端（`auth/src/config.js`），`{origin}` 取自 `AUTH_PORTAL_ORIGINS`。新系统一律用 `AUTH_EXTRA_CLIENTS_JSON` 登记，不需要改 Auth 代码。

## 四、官网后台的钉钉登录

流程（代码 `server/src/modules/admin/oidc.js`）：

1. 登录页点「钉钉登录」→ `GET /api/admin/oidc/start?origin=https://ai.atuofuture.com`，服务端生成 PKCE，并写入签名 Cookie `atuo_admin_oidc`（path `/api/admin/oidc`，10 分钟有效）。
2. 跳转统一登录 → 钉钉扫码 → 回到 `/api/admin/oidc/callback`。
3. 服务端直连 `http://127.0.0.1:18089/auth` 的 token 和 me 接口（补 `X-Forwarded-*` 头，让 Auth 按对外 HTTPS 地址处理），校验 nonce、aud、sub。
4. 按 `sub` 找后台账号，找不到再按 `dingtalk_unionid` 匹配「同步组织架构」导入的记录，并回填 `sub`。

账号状态：

- 第一次用钉钉登录、又不在已同步名单里的人，会建成**待授权**账号（无角色、未启用），登录页提示「请联系超级管理员授权」。超级管理员在「账号权限」里编辑该账号，选择角色并启用后即可登录。
- 已停用 → 提示联系超级管理员；因离职停用 → 提示已不在组织架构中。
- 钉钉账号可以在抽屉里授权角色、启用/停用、移除；账号密码账号仍用原来的创建和改密方式。

登录页的错误提示由地址参数 `login_error` 决定：`pending`、`disabled`、`left`、`expired`、`denied`、`failed`（文案在 `src/scripts/admin-signin.js`）。

## 五、同步钉钉组织架构

后台「账号权限」→「同步组织架构」，接口 `POST /api/admin/users/sync-dingtalk`（需要账号管理权限，同一时间只允许一个同步任务）。代码 `server/src/modules/admin/dingtalk-directory.js`。

做法：

1. 用应用凭证换取企业 access token（带缓存）。
2. 从根部门（`dept_id=1`）开始，用 `/topapi/v2/department/listsub` 逐层遍历全部部门；根部门本身不在返回结果里，用 `/topapi/v2/department/get` 取公司名。
3. 每个部门用 `/topapi/v2/user/list` 分页拉成员，按 `userid` 去重并合并所在部门。

规则：

- 按钉钉 `unionid`（其次 `userid`）匹配已有账号，不会重复建号；重复同步结果应为「新增 0」。
- 新员工：角色默认**运营编辑**，直接启用，本人用钉钉扫码即可进后台。
- 已有账号：更新姓名、头像、部门、职位；原来没有角色的设为运营编辑。
- 不在组织架构里的钉钉账号：自动停用并标记为离职，记录保留；以后重新出现会自动恢复。
- 不会停用最后一个启用的超级管理员。
- 账号密码账号不参与同步，与同一个人的钉钉账号互不关联。需要统一时，给钉钉账号授权相应角色，再停用旧的账号密码账号。

> 首次上线同步前，先让已经用钉钉登录过后台的人再登录一次，把 `dingtalk_unionid` 回填进后台账号，否则同步时会给他们再建一条记录。

同步结果（时间、总数、新增、停用）保存在后台数据的 `dingtalkSync`，显示在同步按钮左侧。账号列表支持按姓名、账号、部门搜索和按部门筛选。

## 六、排查清单

| 现象 | 原因与处理 |
|---|---|
| 登录页没有「钉钉登录」标签，只有账号密码 | 登录页不在主域名下打开。确认地址是 `https://ai.atuofuture.com/auth/...`；新入口要先跳主域名再发起登录 |
| 钉钉授权后报 403 `AccessTokenPermissionDenied`，或授权页只列出「基本信息」 | `Contact.User.Read` 没有真正生效。在权限管理里移除该权限，再人工点击重新开通，看到「已开通」后发布新版本 |
| 授权成功但仍未登录，回到登录页 | 多半是回调换了 origin（地址里带出 `:18443`）。查官网 nginx 是否有 `absolute_redirect off;`，并看 access log 的回调链路 |
| 钉钉提示回调地址不合法 | 「安全设置」的重定向 URL 与 `{AUTH_ISSUER}/callback/dingtalk` 不一致，改完要发布新版本 |
| 「同步组织架构」报权限错误 | 缺 `qyapi_get_department_list` 或 `qyapi_get_department_member`，开通后发布新版本；通讯录权限范围要选全部员工 |
| 同步后部门显示为空或「钉钉」 | 员工直接挂在公司根部门下，部门名取根部门名称；确认后台代码已包含 `department/get` |
| 同一个人出现两条记录 | 一条是账号密码账号、一条是钉钉账号（正常，按上文合并）；或钉钉里本身就是两个不同账号 |
| 后台提示「已收到你的钉钉账号，请联系超级管理员授权」 | 正常的待授权状态，超级管理员授权并启用即可 |

## 后续计划

1. 接入资产管理等其它子系统。
2. 按客户需求接入微信和企业 OA。
3. 接入短信服务后开放短信登录。
4. 账号密码方式补齐验证码或 MFA、风控、限流和密码安全策略。
5. 扩展为多实例或大量用户前，OIDC 会话迁移到 Redis，用户与审计迁移到数据库（当前为单实例 JSON 持久化）。
