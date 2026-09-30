# 安托未来统一 Auth 接入说明

## 定位

统一 Auth 是独立身份服务，不属于 Aspace One 门户，也不属于任何一个业务子系统。

- Aspace One 第一阶段保持公开访问，仅承担产品入口与信息聚合。
- Aspace、Admin、资产管理等子系统均作为 OIDC Client 接入。
- 子系统不得共享用户密码、登录 Cookie 或服务账号。
- 所有系统统一跳转到 Auth 登录窗口，登录成功后通过授权码回调。

## 协议

服务基于 OAuth 2.1 / OpenID Connect，使用 Authorization Code + PKCE：

1. 子系统生成 `state`、`nonce` 和 PKCE `code_verifier`。
2. 浏览器跳转到 `{issuer}/auth`。
3. 用户在统一窗口完成钉钉等身份认证。
4. Auth 将一次性授权码回传至子系统登记过的 `redirect_uri`。
5. 子系统后端或公共客户端使用 `code_verifier` 换取 ID Token。
6. 子系统校验签名、`iss`、`aud`、`exp`、`nonce` 后建立自己的业务会话。

禁止使用隐式模式，也不能只相信前端传入的姓名、邮箱或组织信息。

## 当前第一批能力

- OIDC Discovery、JWKS、授权码、PKCE、刷新令牌和注销协议。
- 统一登录窗口。
- 钉钉 OAuth 登录及统一用户绑定。
- 独立用户存储、签名密钥和登录审计。
- 微信、客户 OA、短信验证码、账号密码 + 二次验证的扩展入口。

未配置钉钉参数时，钉钉按钮会显示为不可用，不会降级为不安全的账号密码登录。

当前基础版本使用单实例 JSON 持久化，便于先完成协议与子系统联调；扩展为多实例或正式承载大量用户前，必须将 OIDC 会话迁移到 Redis、用户与审计迁移到数据库。

## 钉钉配置

在钉钉开放平台创建企业内部应用，将回调地址配置为：

```text
{AUTH_ISSUER}/callback/dingtalk
```

启用真实钉钉登录前，`AUTH_ISSUER` 和回调地址必须使用 HTTPS。

服务器环境变量：

```text
AUTH_DINGTALK_CLIENT_ID=应用 Client ID
AUTH_DINGTALK_CLIENT_SECRET=应用 Client Secret
```

密钥只能存放在服务器环境变量中，不能提交到仓库或下发到浏览器。

## 子系统登记

每个子系统必须独立登记：

- 唯一 `client_id`
- 精确的 HTTPS `redirect_uri`
- 精确的退出回跳地址
- 允许申请的 Scope
- 是否允许刷新令牌

浏览器和移动端使用公共客户端，不保存 `client_secret`，必须启用 PKCE。能安全保存密钥的服务端客户端使用 `private_key_jwt` 或受控的客户端认证方式。

## 后续顺序

1. 获取钉钉应用参数并完成真实联调。
2. 先接入一个测试子系统，验证登录、注销、过期和权限拒绝。
3. 接入 Aspace、Admin 和资产管理系统。
4. 按客户需求接入微信和企业 OA。
5. 接入短信服务后开放短信登录。
6. 账号密码方式必须同时具备验证码或 MFA、风控、限流和密码安全策略后才能上线。
