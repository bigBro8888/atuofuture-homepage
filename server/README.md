# App 下载分发服务

## 本地运行

1. 复制 `.env.example` 为 `.env`，至少修改 `JWT_SECRET`、`ADMIN_EMAIL`、`ADMIN_PASSWORD`。
2. 分别运行 `npm run dev:api` 与 `npm run dev`。
3. 打开 `http://localhost:5188/app-download/`；后台为 `http://localhost:5188/admin/apps/`。

首次启动会在 `server/data/store.json` 创建开发数据和初始管理员。生产环境不得继续使用示例密码。

## Android 版本规则

- 权威版本：`https://file.atuofuture.com/release/version`
- APK：`https://file.atuofuture.com/release/artink-{version}.apk`
- 公开页不跨域读取 OSS，而通过同源 `/api/public/apps/artink` 获取已校验版本。
- 发布顺序固定为：上传 APK → HEAD 校验与 SHA-256 留档 → 更新 `release/version`。
- 版本源异常时使用服务端缓存或数据库中最后一次成功发布版本。

## 生产部署

- 使用 Nginx/网关把 `/api/*` 反向代理至 Node 服务，其余路径指向 Vite 的 `dist`。
- 设置 `PUBLIC_BASE_URL=https://www.atuofuture.com`，二维码会使用该域名。
- 配置 OSS RAM 子账号，仅授予目标 Bucket 的 `GetObject`、`PutObject` 权限；不要使用主账号密钥。
- 执行 `server/migrations/001_app_distribution.sql` 创建 PostgreSQL 表。仓库内 JSON 数据存储仅适合单实例开发/验收，生产上线时应将 `server/src/lib/store.js` 替换为 PostgreSQL 数据访问实现，并使用 Redis 承载版本缓存。
- 对 `/api/admin/login` 在网关层增加第二层限流；后台建议限制办公网或接入企业 SSO。
- 监控 `/api/health`、`sourceHealth` 和 Node 错误日志，并对版本源降级、APK 校验失败设置告警。

## 权限

- `super_admin`：全部功能、账号和审计。
- `editor`：下载页与 App Store 配置、统计。
- `publisher`：Android 发布、回滚、统计。
- `analyst`：只读统计。
