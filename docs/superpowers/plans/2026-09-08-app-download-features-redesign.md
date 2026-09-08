# App 下载页核心能力区改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 App 下载页四大核心能力区改成深蓝科技风，并让后台可配置每张卡片的强调色。

**Architecture:** 在现有 `features.items[]` 数据结构中增加受白名单约束的 `accent` 字段。服务端负责旧数据补全与输入清洗，前台脚本只映射合法样式类，页面结构和 CSS 负责卡片序号、重点卡与发光视觉；后台沿用现有表单提交链路，增加强调色选择及对应预览。

**Tech Stack:** Vite、原生 JavaScript、HTML/CSS、Express、Node.js Test Runner

## Global Constraints

- `features.items[].accent` 只允许 `blue | cyan | violet | amber`。
- 旧 `store.json` 没有 `accent` 时必须自动补齐。
- 不改变现有 API 路径、发布流程和移动端隐藏规则。
- 前台不接受任意 CSS 值，只使用白名单样式类。

---

### Task 1: 强调色数据模型与兼容

**Files:**
- Modify: `server/src/lib/store.js`
- Test: `server/test/app-features.test.js`

**Interfaces:**
- Consumes: `normalizeAppFeatures(value)`
- Produces: `features.items[].accent: 'blue' | 'cyan' | 'violet' | 'amber'`

- [ ] **Step 1: 写失败测试**

在更新请求的四个卡片中分别传入 `cyan`、非法值、`violet` 和空对象，并断言公开 API 返回 `cyan`、默认 `cyan`、`violet`、默认 `amber`；同时断言初始第一项为 `blue`。

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test server/test/app-features.test.js`

Expected: FAIL，返回项目缺少 `accent`。

- [ ] **Step 3: 实现最小数据兼容**

为 `defaultAppFeatures.items` 添加四个默认强调色，并在 `normalizeAppFeatures` 内使用白名单校验；非法值和缺失值回退到对应卡片默认值。

- [ ] **Step 4: 运行测试确认通过**

Run: `node --test server/test/app-features.test.js`

Expected: PASS，1 个测试通过。

### Task 2: 前台核心能力区视觉与数据绑定

**Files:**
- Modify: `app-download/index.html`
- Modify: `src/scripts/app-download.js`
- Modify: `src/styles/app-download.css`

**Interfaces:**
- Consumes: `/api/public/apps/artink` 返回的 `features.items[].accent`
- Produces: `.download-feature-card--blue|cyan|violet|amber`

- [ ] **Step 1: 更新语义结构**

在区块标题前加入 `CORE CAPABILITIES` 眉题；为四张默认卡片增加统一类名、两位序号节点和默认强调色类。

- [ ] **Step 2: 绑定强调色**

在 `app-download.js` 中创建强调色白名单。更新卡片时移除旧强调色类，再按 API 值或序号默认值添加合法类。

- [ ] **Step 3: 实现深蓝科技视觉**

将标题改成左对齐；卡片使用更大的圆角、顶部光带、序号、图标柔光和悬停效果；第一张蓝色卡使用深蓝渐变和浅色文字，其余使用白色玻璃表面。保留四列与现有移动端隐藏规则。

- [ ] **Step 4: 构建验证**

Run: `npm run build`

Expected: Vite 构建成功，输出 `dist/app-download/index.html` 和带哈希的 CSS/JS。

### Task 3: 后台强调色配置与全链路验证

**Files:**
- Modify: `src/scripts/admin-apps.js`
- Modify: `src/styles/admin-apps.css`

**Interfaces:**
- Consumes: 管理 API 返回的 `features.items[].accent`
- Produces: 表单字段 `features.items.{index}.accent`

- [ ] **Step 1: 添加后台字段**

新增四种强调色选项，在每张后台能力卡中添加 `select`，字段名为 `features.items.{index}.accent`；现有通用表单收集逻辑自动将其写入请求。

- [ ] **Step 2: 增强后台预览**

在卡片根节点增加强调色数据属性，切换下拉框时同步更新卡片边框、图标背景和颜色圆点，使后台所见与前台颜色一致。

- [ ] **Step 3: 完整验证**

Run: `npm test`

Expected: 全部测试通过。

Run: `npm run build`

Expected: 构建成功且无错误。

在浏览器打开 `http://127.0.0.1:5188/app-download/` 和 `http://127.0.0.1:5188/admin/#config`，确认前台卡片视觉、后台强调色选择及预览。

- [ ] **Step 4: 提交、推送与部署**

仅提交本任务源码、测试、设计和计划文件，使用作者 `bigBro8888 <bigBro8888@users.noreply.github.com>`；推送 `main`。将改动源码上传至 `/var/www/mydoc/atuofuture`，以 `atuoapp` 运行 `npm run build`，重启 `atuofuture-home`，验证 `http://47.103.102.65:18180/app-download/` 和 `/api/health`。
