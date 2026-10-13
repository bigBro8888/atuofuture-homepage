# ECS 线上部署手册

面向本仓库日常改动后的**快速上线**。新对话 / Agent 接到「推送线上」「部署 ECS」时，按本文执行即可。

---

## 1. 环境一览

| 项 | 值 |
|---|---|
| 机器 | `root@47.103.102.65` |
| 站点目录 | `/var/www/mydoc/atuofuture` |
| 运行用户 | `atuoapp`（文件属主 / 构建用户） |
| 对外地址 | http://47.103.102.65:18180/ |
| Node 服务 | `atuofuture-home`（systemd） |
| 前端构建 | 站点目录下 `sudo -u atuoapp npm run build`（Vite → `dist/`） |

### Git 远程

| 远程名 | 用途 | 地址 |
|---|---|---|
| `github` | GitHub 备份 / 规则默认推送 | `https://github.com/bigBro8888/atuofuture-homepage.git` |
| `origin` | 阿里云 Codeup | `git@codeup.aliyun.com:680d87867641ba6f861ec2b8/tony-daimaku/atuofuture.com.git` |

分支均为 `main`。作者临时环境变量（不改全局 config）：

```powershell
$env:GIT_AUTHOR_NAME='bigBro8888'
$env:GIT_AUTHOR_EMAIL='bigBro8888@users.noreply.github.com'
$env:GIT_COMMITTER_NAME='bigBro8888'
$env:GIT_COMMITTER_EMAIL='bigBro8888@users.noreply.github.com'
```

---

## 2. 推荐流程（默认用 scp，不要依赖服务器 git pull）

服务器工作区常有未提交改动，`git pull` 容易冲突失败。**默认做法：只 scp 本次改过的源文件 → install 覆盖 → build（必要时重启服务）。**

### 2.1 本地改完并提交（如需要）

```powershell
# 在仓库根目录
git add <相关文件>
git commit -m "说明本次改动"
```

### 2.2 推远程（按规则 / 用户要求）

```powershell
# GitHub（遇代理问题时可加 -c http.proxy= -c https.proxy=）
git -c http.proxy= -c https.proxy= -c http.version=HTTP/1.1 push github main

# Codeup
git push origin main
```

### 2.3 部署到 ECS（核心）

在**本机仓库根目录**执行（PowerShell 示例）：

```powershell
# 1) 上传本次改动的文件到服务器 /tmp（文件名扁平，避免路径问题）
scp -o StrictHostKeyChecking=accept-new src/lib/product-story-render.js root@47.103.102.65:/tmp/product-story-render.js
scp -o StrictHostKeyChecking=accept-new src/styles/main.css root@47.103.102.65:/tmp/main.css
# …按实际改动继续 scp

# 2) 覆盖到站点目录 + 构建（+ 按需重启）
ssh root@47.103.102.65 @"
set -e
install -o atuoapp -g atuoapp -m 644 /tmp/product-story-render.js /var/www/mydoc/atuofuture/src/lib/product-story-render.js
install -o atuoapp -g atuoapp -m 644 /tmp/main.css /var/www/mydoc/atuofuture/src/styles/main.css
cd /var/www/mydoc/atuofuture && sudo -u atuoapp npm run build
# 若改了 server/ 或 API，再执行：
# systemctl restart atuofuture-home
# systemctl is-active atuofuture-home
"@
```

### 2.4 验收

- 打开 http://47.103.102.65:18180/ 对应页面
- 告知用户：**普通 F5** 即可；不必 Ctrl+F5（除非怀疑强缓存未刷新）

---

## 3. 什么时候要重启服务

| 改动范围 | 操作 |
|---|---|
| 仅 `src/` 前端页面、样式、脚本；`public/` 静态资源 | `npm run build` 即可，**不必**重启 |
| `server/`、API、环境相关后端逻辑 | build 后执行 `systemctl restart atuofuture-home` |
| nginx 配置 | 一般不动；若改了再 `nginx -t && systemctl reload nginx` |

常用检查：

```bash
systemctl status atuofuture-home --no-pager
systemctl is-active atuofuture-home
journalctl -u atuofuture-home -n 50 --no-pager
```

---

## 4. 批量 scp 小抄（多文件）

```powershell
$pairs = @(
  @{ Local = 'src/lib/product-story-render.js';  Tmp = '/tmp/product-story-render.js';  Remote = '/var/www/mydoc/atuofuture/src/lib/product-story-render.js' },
  @{ Local = 'src/styles/main.css';              Tmp = '/tmp/main.css';                 Remote = '/var/www/mydoc/atuofuture/src/styles/main.css' },
  @{ Local = 'src/scripts/hardware-product.js';  Tmp = '/tmp/hardware-product.js';     Remote = '/var/www/mydoc/atuofuture/src/scripts/hardware-product.js' }
)
foreach ($p in $pairs) {
  scp -o StrictHostKeyChecking=accept-new $p.Local "root@47.103.102.65:$($p.Tmp)"
}
# 再 ssh 里对每个 Tmp → Remote 执行 install，最后 npm run build
```

上传目录（如模型资源）示例：

```powershell
scp public/models/water-sensor-3d/white.png root@47.103.102.65:/tmp/water-white.png
ssh root@47.103.102.65 "mkdir -p /var/www/mydoc/atuofuture/public/models/water-sensor-3d && install -o atuoapp -g atuoapp -m 644 /tmp/water-white.png /var/www/mydoc/atuofuture/public/models/water-sensor-3d/white.png"
```

---

## 5. 备选：服务器上 git pull（不推荐作默认）

仅当确认服务器干净、与远程一致时可用：

```bash
ssh root@47.103.102.65
cd /var/www/mydoc/atuofuture
# 先看脏文件；有本地改动先 stash / 备份，再 pull
sudo -u atuoapp git status
sudo -u atuoapp git pull   # 远程需已配置好 codeup/github
sudo -u atuoapp npm run build
# 按需：systemctl restart atuofuture-home
```

失败时**立刻退回第 2 节 scp 流程**，不要硬拉。

---

## 6. 不要提交 / 不要部署的内容

- `.env`、密钥、证书私钥
- 未要求纳入的设计稿目录（如 `app download/`、本地 `产品模型/` 源工程，除非明确要上 `public/`）
- 本机临时脚本，除非已约定入库

---

## 7. Agent 执行清单（最短版）

1. 确认本次改动文件列表（`git status` / `git diff --name-only`）
2. 提交（用户或仓库规则要求时）→ 推 `github` / `origin`（按规则）
3. `scp` 改动文件到 `root@47.103.102.65:/tmp/...`
4. `ssh`：`install -o atuoapp -g atuoapp -m 644` 覆盖到 `/var/www/mydoc/atuofuture/...`
5. `cd /var/www/mydoc/atuofuture && sudo -u atuoapp npm run build`
6. 改了 `server/` → `systemctl restart atuofuture-home`
7. 回复用户：线上地址 + **普通 F5** + commit（如有）

规则补充见：`.cursor/rules/auto-push-github.mdc`。
