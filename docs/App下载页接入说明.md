# App 下载页接入说明

> 给另一边首页项目 / 新对话使用：用 `@docs/App下载页接入说明.md` 引用本文即可。  
> 本文描述的是当前仓库（`公司首页/首页1`，GitHub：`https://github.com/bigBro8888/atuofuture-homepage.git`）里已经做完的 **App 独立下载页 + 分发后台 + 公开 API**。  
> 首页本身已经接好了入口；另一边项目通常只需要 **链到这个页面**，不要重新做一套下载逻辑。

---

## 1. 产品是什么

这不是小程序页面，而是官网里的 **独立 App 下载落地页**。一台设备打开同一个 URL，按 UA 自动切成三套体验：

| 访客 | 看到什么 | 点下载后发生什么 |
| --- | --- | --- |
| PC | 宽屏 Banner + 双商店按钮 + 功能亮点 + 底部二维码 | Android 走 APK；iOS 走 App Store |
| Android 手机 | 左侧 App 身份，右侧主按钮 + 切换按钮；绿色主题 | 直接下最新 APK |
| iPhone / iPad | 同上，黑色主按钮；银色主题 | 跳转 App Store |

额外产品规则：

- **微信内不能直接跳商店 / 不能直接装 APK。** iOS、Android 点下载都会弹出引导层：右上角「…」→ Safari / 系统浏览器打开。可复制当前页链接。不要再做「微信内自动跳 App Store」，微信会拦。
- **钉钉 Android** 会尝试用 Intent 拉起系统浏览器；失败时顶部提示条提供手动按钮。
- **iOS 在钉钉里** 可以直接走 App Store，不必特殊处理。
- 手机端顶部有「切换平台」按钮，文案和左侧小角标都可在后台改；角标留空即隐藏。
- 桌面 Banner、手机竖版展示图都走后台配置的 **在线图片 URL**，仓库里不再带 `back.png` / `phoneback.png`。没配图时：PC 露出浅蓝白渐变；手机展示区整块隐藏，不留裂图。

权威 Android 版本不写在页面里，而读：

```text
https://file.atuofuture.com/release/version          → 纯文本，如 1.0.25
https://file.atuofuture.com/release/artink-{version}.apk
```

前端不跨域读 OSS，一律打同源 `/api/public/apps/artink`。

---

## 2. 线上地址（另一边首页优先用这些）

本地开发（本仓库）：

| 用途 | 地址 |
| --- | --- |
| 下载页 | `http://localhost:5188/app-download/` |
| 管理后台 | `http://localhost:5188/admin/`（旧地址 `/admin/apps/` 自动跳转） |
| 公开配置 API | `http://localhost:5188/api/public/apps/artink`（Vite 反代到 `127.0.0.1:8787`） |
| API 健康检查 | `http://127.0.0.1:8787/api/health` |

测试机（已部署过）：

| 用途 | 路径 |
| --- | --- |
| 站点根 | `/var/www/mydoc/test-atuofuturehome` |
| 更新脚本 | `bash ~/update-atuo.sh`（读同目录 `app-update.zip`） |
| API | `127.0.0.1:18787`，systemd 服务名 `atuo-app-test` |

生产约定：

| 用途 | 地址 |
| --- | --- |
| 官网 | `https://www.atuofuture.com/` |
| 下载页 | `https://www.atuofuture.com/app-download/` |
| 后台 | `https://www.atuofuture.com/admin/` |
| 公开 API | `https://www.atuofuture.com/api/public/apps/artink` |

另一边首页要「包含下载页」，默认做法是 **链到上述下载页**，不要把 APK / App Store 链接写死在首页。

---

## 3. 目录结构

```text
首页1/
├── app-download/index.html          # 下载页 HTML（唯一页面，PC/Android/iOS 一套）
├── admin/index.html                 # 官网统一后台（含 App 下载管理）
├── admin/apps/index.html            # 兼容跳转到 /admin/
├── index.html                       # 官网首页（已挂「下载 App」入口）
├── src/
│   ├── data/site-links.js           # 全站下载入口开关与路径
│   ├── services/app-download-api.js # 平台识别 + 拉配置 + 拼下载链接
│   ├── scripts/app-download.js      # 下载页交互（主题、微信引导、埋点、水合）
│   ├── scripts/admin-apps.js        # 后台：下载页 / 首页 / 关于我们 / 发版 / 统计
│   ├── styles/app-download.css      # 下载页样式与平台主题
│   ├── styles/admin-apps.css
│   ├── components/site-nav.js       # 顶栏「下载 App」→ app-download/
│   ├── components/site-footer.js    # 页脚「下载 App」
│   └── components/app-download-modal.js  # 已空实现，入口不再弹窗
├── server/
│   ├── src/index.js                 # Express，只监听 127.0.0.1
│   ├── src/config.js
│   ├── src/lib/store.js             # JSON 存储 + features/buttons 默认值
│   ├── src/modules/apps/            # 公开下载 API、版本源、发版
│   ├── src/modules/admin/           # 登录、配置、上传、统计
│   ├── src/modules/pages/           # 官网首页 / 关于我们 CMS（与下载页共用后台菜单）
│   ├── data/store.json              # 运行时数据，禁止提交、禁止覆盖线上
│   ├── uploads/                     # 后台上传图，禁止覆盖线上
│   └── README.md
├── docs/App下载页接入说明.md         # 本文
├── vite.config.js                   # 多页入口 + /api 反代
└── .env.example
```

不要提交、不要打进更新包：

- `server/data/`（账号、配置、统计）
- `server/uploads/`
- `.env`
- `node_modules/`
- `app download/`（带空格，只是早期设计稿，不是线上代码）

---

## 4. 页面结构（下载页 DOM）

`app-download/index.html` 一块页面，用 `body[data-platform=desktop|android|ios]` 和 CSS 显隐，不拆路由。

```text
[微信引导遮罩 data-wechat-mask]          仅微信内点下载时出现
[钉钉/浏览器提示条 data-browser-guide]   钉钉 Android 自动尝试外跳

header.download-nav
  品牌 Logo、锚点（产品下载 / 功能介绍 / 安装帮助）、返回官网 → https://www.atuofuture.com/

main
  #download  .download-hero
    桌面：主标题 / 副标题 / 说明 / App Store + Android 按钮 / 版本条
    手机：左身份（图标+名称+一句话）右操作（主下载 + 平台切换）
    手机中部：竖版展示图 data-hero-image（后台 heroImageUrl）
  #features  .download-features          仅 PC 显示，4 张能力卡片
  #guide     .download-guide             桌面 / Android / iOS 三套安装步骤
  底部 CTA + Android 二维码

footer  产品 / 法律（隐私、协议）/ 支持
```

关键 `data-*`（后台内容水合用）：

| 属性 | 含义 |
| --- | --- |
| `data-app-name` / `data-app-icon` | App 名称、图标 |
| `data-download-title` / `subtitle` / `description` | 首屏三段文案 |
| `data-primary-download` | 手机主按钮 |
| `data-platform-switch` / `data-switch-label` / `data-switch-icon` | 切换按钮与角标 |
| `data-android-download` / `data-ios-download` | 桌面与底部下载入口 |
| `data-feature-item` | 功能卡片 |
| `data-hero-image` | 手机展示图 |
| `data-android-qr` | 二维码图，src 为 `/api/public/apps/artink/qr?platform=android` |

CSS 变量 `--download-desktop-banner` 由 JS 写成 `url("后台 desktopBannerUrl")`。

---

## 5. 数据与后台可配字段

应用记录 `id` 固定为 `artink`，存在 `server/data/store.json` 的 `apps[0]`。

### 5.1 基础与首屏

| 字段 | 用途 |
| --- | --- |
| `name` | App 名称，也作页面标题兜底 |
| `iconUrl` | 图标（HTTPS） |
| `description` | 产品介绍，也作详细说明兜底 |
| `downloadTitle` / `downloadSubtitle` / `downloadDescription` | 首屏三段字 |
| `desktopBannerUrl` | PC 顶部大图 |
| `heroImageUrl` | 手机竖版展示图 |
| `iosStoreUrl` | App Store 链接；空则禁用 iOS 入口 |
| `privacyUrl` / `termsUrl` | 页脚法务 |
| `published` | false 时公开 API 返回 404 |

### 5.2 功能亮点 `features`（仅 PC 中部四卡）

```json
{
  "title": "四大核心能力，重塑办公体验",
  "subtitle": "全场景覆盖，让空间更懂你的需求",
  "items": [
    { "icon": "settings_remote", "title": "Space Control", "description": "…" },
    { "icon": "calendar_month", "title": "Meeting Service", "description": "…" },
    { "icon": "confirmation_number", "title": "Message & Ticket", "description": "…" },
    { "icon": "smart_toy", "title": "AI Assistant", "description": "…" }
  ]
}
```

固定 4 张。图标是 Material Symbols 名，后台有下拉（含图片编辑 / AI 创作 / 一键同步 / 相册管理等）。单卡留空回退默认值。

### 5.3 按钮文案 `buttons`

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `androidLabel` | `立即下载 {version}` | `{version}` 会替换成 `V1.0.25` |
| `iosLabel` | `前往 App Store` | 未配商店链接时强制显示「App Store 暂未配置」 |
| `switchToAndroid` | `需要 Android 版本？` | iPhone 上的切换主文案 |
| `switchToIos` | `需要 iPhone 版本？` | Android 上的切换主文案 |
| `switchToAndroidTag` | `Android` | 左侧小角标；**留空即隐藏** |
| `switchToIosTag` | `iOS` | 同上 |

文案字段留空回退默认；角标字段留空是「不要这个标签」，两者规则不同。

后台「页面配置」里下载页分成 6 区，顶部有锚点导航：应用基础信息 / 首屏文案 / 视觉素材 / 功能亮点 / 按钮文案 / 下载入口与合规。同一菜单下还有「官网首页」「关于我们」，那是另一套 CMS，不要和下载页字段混用。

---

## 6. 公开 API

基路径：`/api/public/apps`

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| GET | `/artink` | 整页配置 + 当前 Android 版本 + iOS 链接 |
| GET | `/artink/android/download` | 记一次点击，302 到 APK |
| GET | `/artink/ios/download` | 记一次点击，302 到 App Store |
| POST | `/artink/android/event` | 仅埋点（前端 `sendBeacon`） |
| POST | `/artink/ios/event` | 仅埋点 |
| GET | `/artink/qr?platform=android\|ios` | SVG 二维码，指向带 `source=qr` 的下载 URL |

`GET /artink` 成功时的关键形状：

```json
{
  "id": "artink",
  "name": "AI投屏",
  "iconUrl": "https://…",
  "desktopBannerUrl": "https://…",
  "heroImageUrl": "https://…",
  "downloadTitle": "AI投屏",
  "downloadSubtitle": "随时随地，连接并管理智能空间",
  "downloadDescription": "…",
  "features": { "title": "…", "subtitle": "…", "items": [] },
  "buttons": {
    "androidLabel": "立即下载 {version}",
    "iosLabel": "前往 App Store",
    "switchToAndroid": "需要 Android 版本？",
    "switchToIos": "需要 iPhone 版本？",
    "switchToAndroidTag": "Android",
    "switchToIosTag": "iOS"
  },
  "platforms": {
    "android": {
      "version": "1.0.25",
      "downloadUrl": "https://file.atuofuture.com/release/artink-1.0.25.apk",
      "trackingUrl": "/api/public/apps/artink/android/event",
      "available": true
    },
    "ios": {
      "storeUrl": "https://apps.apple.com/…",
      "downloadUrl": "https://apps.apple.com/…",
      "trackingUrl": "/api/public/apps/artink/ios/event",
      "available": true
    }
  }
}
```

未发布：`404 { "error": "app_not_available" }`。  
iOS 未配置：`platforms.ios.available = false`，`downloadUrl` 为空。

管理 API（需登录 Cookie）在 `/api/admin`：`POST /login`、`GET|PUT /app`、`POST /app/hero-image`、`GET|POST /releases`、`GET /stats`。另一边首页接入 **不需要** 调这些。

---

## 7. 前端行为（实现要点）

入口文件：`src/scripts/app-download.js` + `src/services/app-download-api.js`。

1. `detectPlatform()`：Android / HarmonyOS → android；iPhone/iPad 或 `MacIntel + maxTouchPoints>1` → ios；其余 desktop。同时标 `isWechat`、`isDingTalk`。
2. `getAppConfig()` 拉 `/api/public/apps/artink`，失败则主按钮禁用，文案提示服务不可用。
3. `renderPlatform()` 写 `body.dataset.platform`，换主按钮图标/文案/href，换切换按钮。
4. Android 下载：微信 → 引导遮罩；钉钉 → Intent 外跳；普通浏览器 → `sendBeacon` 后 `location.assign(apk)`。
5. iOS 下载：微信 → 引导遮罩；其它 → `sendBeacon` 后 `location.assign(storeUrl)`。
6. 主视觉图只信后台 URL，不再读本地 `pic/`。

平台识别不要只看 `navigator.platform`。iPad 桌面 UA 必须靠 `maxTouchPoints`。

---

## 8. 本仓库首页已经怎么接

全站开关在 `src/data/site-links.js`：

```js
export const SHOW_APP_DOWNLOAD = true
export const APP_DOWNLOAD_PATH = 'app-download/'
export const SITE_CTA = { downloadLabel: '下载 App', … }
```

- 顶栏、手机抽屉：`site-nav.js` → `/{root}app-download/`
- 页脚：`site-footer.js` 同样路径
- 旧弹窗 `initAppDownloadModal()` 已清空，不再拦截点击

另一边如果是 **另一份官网仓库**，按第 9 节做。如果其实就是继续改本仓库首页，入口已经通了，只要保证 `SHOW_APP_DOWNLOAD === true`。

---

## 9. 另一边项目怎么接（按这个做）

### 方案 A：只链过来（推荐）

首页任何「下载 App / 立即下载 / 扫码下载」都指向：

```text
https://www.atuofuture.com/app-download/
```

测试环境则换成测试机上的 `/app-download/`。

不要在首页写死 APK 或 App Store URL。版本和商店链接以后台为准。

PC 首页若要内嵌二维码，用：

```html
<img src="https://www.atuofuture.com/api/public/apps/artink/qr?platform=android" alt="下载二维码" />
```

若只要展示当前版本号，同源或 CORS 允许时：

```js
const app = await fetch('https://www.atuofuture.com/api/public/apps/artink').then((r) => r.json())
// app.platforms.android.version
// app.platforms.ios.downloadUrl
```

跨域时不要直接打测试机的 `18787` 端口（只绑 127.0.0.1）。走官网同域 Nginx 反代 `/api`。

### 方案 B：把整页搬进另一仓库

必须整组带走，缺一块页面会空转或无法发版：

**页面**

- `app-download/index.html`
- `src/scripts/app-download.js`
- `src/styles/app-download.css`
- `src/services/app-download-api.js`

**后台（要改文案 / 发 APK 才需要）**

- `admin/index.html`
- `admin/apps/index.html`（兼容跳转）
- `src/scripts/admin-apps.js`
- `src/styles/admin-apps.css`

**服务端**

- 整个 `server/src/`
- `server/migrations/`（若上 PostgreSQL）
- `.env.example` 里 App 相关变量

**构建**

- `vite.config.js` 增加 `appDownload`、`admin` 两个 input（`adminApps` 仅为旧地址跳转）
- `server.port` 的 `/api` proxy 指向本机 API
- `package.json` 里 `dev:api` / `start:api` 以及 express、jsonwebtoken、multer、qrcode、ali-oss、bcryptjs、cookie-parser、helmet、dotenv

入口常量建议仍集中在一个 `site-links.js`，路径保持 `app-download/`（带尾斜杠，配合 Vite 多页）。

不要复制 `server/data/store.json`。新环境让服务首次启动自己建库，再在后台重新填配置。

### 方案 C：首页 CMS 里加一段「下载引导」

本仓库首页 CMS（`server/src/modules/pages/home-service.js`）和下载页配置是分开的。若另一边要在首页 Banner 上写「下载 App」按钮：

- 按钮 URL 固定 `/app-download/` 或完整官网地址
- 文案可以走首页 CMS
- 版本号、商店链接、APK **不要**再做一套字段

---

## 10. 环境变量

见 `.env.example`。接入下载能力至少要：

```env
PORT=8787
HOST=127.0.0.1
PUBLIC_BASE_URL=https://www.atuofuture.com
JWT_SECRET=至少32位随机串
ADMIN_EMAIL=…
ADMIN_PASSWORD=…
VERSION_SOURCE_URL=https://file.atuofuture.com/release/version
RELEASE_BASE_URL=https://file.atuofuture.com/release
VERSION_CACHE_MS=120000
```

发 Android 版还要 OSS：`OSS_REGION` / `OSS_ACCESS_KEY_ID` / `OSS_ACCESS_KEY_SECRET` / `OSS_BUCKET`。

生产注意：

- API 只绑 `127.0.0.1`，外网走 Nginx `/api` → 本地端口
- `PUBLIC_BASE_URL` 必须是用户能打开的 HTTPS 域名，二维码用它生成
- Cookie 在 `NODE_ENV=production` 时要求 HTTPS；纯 HTTP 测试环境曾把 `NODE_ENV` 临时改成 `development` 才能登录
- 不要把 Windows 的 `node_modules` 和本地 `store.json` 上传到 Linux

---

## 11. 部署约定（本仓库）

本地打包永远用这个文件名和范围：

```powershell
cd "F:\爱墨客工作文件\开发项目\公司首页\首页1"
tar -a -c -f app-update.zip --exclude="server/data" --exclude="server/uploads" dist server
```

上传到 `/var/www/mydoc/test-atuofuturehome`，然后：

```bash
bash ~/update-atuo.sh
```

脚本会备份 `dist` 与 `server/src`，`rsync` 同步，排除 `data` / `uploads` / `.env`；仅当 `server/` 有实质变化才重启 `atuo-app-test`。

`package.json` 依赖变了时脚本不会装包，需要额外 `npm ci --omit=dev`。

---

## 12. 给另一边 Agent 的最短指令

把下面整段交给另一边对话即可：

1. 下载能力已经在 `atuofuture-homepage` 做成独立页，不要重做微信跳转、APK 拼 URL、版本文件读取。
2. 首页所有下载入口指向 `https://www.atuofuture.com/app-download/`（或当前环境的 `/app-download/`）。
3. 需要版本号或二维码时，只读 `/api/public/apps/artink` 和 `/api/public/apps/artink/qr?platform=android`。
4. 文案、Banner、商店链接、按钮字、四张能力卡，一律在 `https://www.atuofuture.com/admin/` 的「App 下载页」改。
5. 微信内必须引导到系统浏览器 / Safari；不要再尝试自动 `location` 到 App Store。
6. Android 真源是 `file.atuofuture.com/release/version` + `artink-{version}.apk`，由服务端缓存后交给前端。
7. 若要搬代码，按本文第 9 节方案 B 整组复制，不要只拷 HTML。

---

## 13. 相关文件速查

| 想改什么 | 改哪里 |
| --- | --- |
| 页面骨架 / 锚点 | `app-download/index.html` |
| 识别、下载、微信引导 | `src/scripts/app-download.js` |
| 平台检测、API 封装 | `src/services/app-download-api.js` |
| 样式 / 平台主题 | `src/styles/app-download.css` |
| 全站入口开关 | `src/data/site-links.js` |
| 公开接口 | `server/src/modules/apps/public-routes.js` |
| 版本规则 | `server/src/modules/apps/version-service.js` |
| 默认文案与校验 | `server/src/lib/store.js` |
| 后台表单 | `admin/index.html` + `src/scripts/admin-apps.js` |
| 服务端说明 | `server/README.md` |
