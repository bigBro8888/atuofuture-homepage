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
```

- `AUTH_PORTAL_ORIGINS` 决定各客户端允许的 `redirect_uri` 和退出回跳地址，新增访问域名时要加进来并重启 `atuofuture-auth`。
- 配置了钉钉凭证但 `AUTH_ISSUER` 不是 HTTPS 时，Auth 服务会拒绝启动。
- 官网 nginx（`/etc/nginx/atuofuture-only.conf`）的 server 块必须保留 `absolute_redirect off;`，否则补斜杠的 301 会带出内部端口 `:18443`，回调换了 origin 后 PKCE / state 丢失，登录静默失败。
- 官网 nginx 把 `/auth/` 反代到 `127.0.0.1:18089`，并传 `Host $http_host` 和 `X-Forwarded-Proto`。

### 只有主域名能用钉钉登录

钉钉回调固定回到 `AUTH_PUBLIC_ORIGIN`。如果登录页是在别的地址打开的（IP `47.103.102.65:18180`、`ai.atuofuture.com:18443`），钉钉授权回来后接不上原来的登录会话，所以 Auth 在非主域名下会**隐藏钉钉入口**，只显示账号密码。

为此前端统一处理：

- 官网首页、Aspace 平台：从 IP 或其它端口点「登录」时，先跳到 `https://ai.atuofuture.com` 的同一页面（带 `?site_login=1`），再自动发起登录。逻辑在 `src/lib/site-account.js` 的 `loginOrigin()` / `canonicalLoginUrl()` / `consumeLoginHandoff()`。
- 官网后台：登录页「钉钉登录」按钮直接指向主域名的 `/api/admin/oidc/start`。

新接入的子系统也要从主域名发起登录。

## 三、子系统登记

每个子系统必须独立登记（默认在 `auth/src/config.js` 的 `clients`，也可用 `AUTH_CLIENTS_JSON` 覆盖）：

- 唯一 `client_id`
- 精确的 HTTPS `redirect_uri`
- 精确的退出回跳地址
- 允许申请的 Scope
- 是否允许刷新令牌

浏览器和移动端使用公共客户端，不保存 `client_secret`，必须启用 PKCE。能安全保存密钥的服务端客户端使用 `private_key_jwt` 或受控的客户端认证方式。

当前客户端：

| client_id | 回调 | 说明 |
|---|---|---|
| `aspace-one` | `{origin}/aspace-one/auth/callback` | 官网首页右上角登录、Aspace 平台；纯前端 PKCE，token 存浏览器 |
| `website-admin` | `{origin}/api/admin/oidc/callback` | 官网后台；服务端完成换码，建立后台自己的会话 Cookie |

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
