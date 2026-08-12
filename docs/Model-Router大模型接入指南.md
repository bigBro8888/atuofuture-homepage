# Model Router（安托未来）大模型 API 接入指南

> 本文对应控制台截图中的 **Model Router** 平台（左侧有「模型广场 / 授权管理 / 开放 API / PAAS接入指南」）。  
> 已在「合肥智能社区」等项目中跑通，Base URL 为：
>
> `https://model-router.edu-aliyun.com`

---

## 1. 这是什么

Model Router 是统一的大模型网关（OpenAI 兼容）：

- 一个 API Key，可调用控制台「模型广场」里授权给你的多款模型  
- 文本对话走标准 `POST /v1/chat/completions`  
- 模型 ID 以卡片上的灰色标识为准，例如：
  - `custom/deepseek-v4-flash`
  - `qwen/qwen3.7-max`
  - `qwen/MiniMax-M2.5`
  - `qwen/glm-5.2`
  - `qwen/kimi-k2.6`

控制台租户示例：杭州安托未来科技有限公司。

---

## 2. 在控制台拿 Key（操作步骤）

1. 登录 Model Router 控制台（界面左上角标题为 **Model Router**）  
2. 打开左侧 **授权管理** 或 **开放 API**  
3. 创建 / 复制 API Key（形如 `sk-...`）  
4. 到 **模型广场** 确认要用的模型已开通，并复制卡片上的 **模型标识**（不是仅显示名）  
5. 需要更完整说明时，点左下角 **PAAS接入指南**

安全要求：

- Key 只放服务端环境变量  
- 不要写进前端、Git、截图、聊天  
- 若已泄露，立刻在控制台作废并重建

---

## 3. 接入三要素（记住即可）

| 项 | 值 |
|----|----|
| Base URL | `https://model-router.edu-aliyun.com/v1` |
| 鉴权 | `Authorization: Bearer <API_KEY>` |
| 对话接口 | `POST /chat/completions` |
| 完整地址 | `https://model-router.edu-aliyun.com/v1/chat/completions` |
| 模型字段 | 使用模型广场里的标识，如 `qwen/qwen3.7-max` |

根路径探活：

```bash
curl https://model-router.edu-aliyun.com
# 正常返回类似：{"service":"model-router","status":"ok"}
```

---

## 4. 环境变量模板

```env
# Model Router（安托未来 / 阿里云教育网关）
MODEL_ROUTER_BASE_URL=https://model-router.edu-aliyun.com/v1
MODEL_ROUTER_API_KEY=sk-你的密钥
MODEL_ROUTER_MODEL=qwen/qwen3.7-max
```

兼容旧项目命名（合肥项目曾用）：

```env
# 历史命名：变量名叫 DASHSCOPE_API_KEY，但实际请求的是 Model Router
DASHSCOPE_API_KEY=sk-你的密钥
```

> 注意：这里的 Key 是 **Model Router 授权 Key**，请求地址是 `model-router.edu-aliyun.com`，  
> **不是** 直接打 `dashscope.aliyuncs.com`。两者不要混用。

---

## 5. 最小请求示例

### 5.1 curl

```bash
curl https://model-router.edu-aliyun.com/v1/chat/completions \
  -H "Authorization: Bearer $MODEL_ROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen/qwen3.7-max",
    "messages": [
      {"role": "system", "content": "你是专业助手，用简洁中文回答。"},
      {"role": "user", "content": "用三句话介绍空间智能体。"}
    ],
    "temperature": 0.2,
    "stream": false
  }'
```

成功时取：

```text
choices[0].message.content
```

### 5.2 Node.js / TypeScript（推荐服务端）

```ts
export async function modelRouterChat(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  model?: string
  temperature?: number
  max_tokens?: number
}) {
  const base = (process.env.MODEL_ROUTER_BASE_URL || 'https://model-router.edu-aliyun.com/v1')
    .replace(/\/+$/, '')
  const apiKey = process.env.MODEL_ROUTER_API_KEY
  const model = params.model || process.env.MODEL_ROUTER_MODEL || 'qwen/qwen3.7-max'

  if (!apiKey) throw new Error('未配置 MODEL_ROUTER_API_KEY')

  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: params.messages,
      temperature: params.temperature ?? 0.2,
      max_tokens: params.max_tokens ?? 800,
      stream: false,
    }),
  })

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500)
    throw new Error(`Model Router HTTP ${response.status}: ${detail}`)
  }

  const data = await response.json() as any
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Model Router 未返回有效 content')
  }
  return { content, raw: data }
}
```

### 5.3 OpenAI SDK 兼容写法

```ts
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.MODEL_ROUTER_API_KEY,
  baseURL: 'https://model-router.edu-aliyun.com/v1',
})

const completion = await client.chat.completions.create({
  model: 'qwen/qwen3.7-max',
  messages: [{ role: 'user', content: '你好' }],
})

console.log(completion.choices[0].message.content)
```

---

## 6. 开发代理（Vite）写法

本地开发可把前端请求代理到 Model Router，避免浏览器 CORS，并把 Key 留在本机环境变量：

```ts
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.MODEL_ROUTER_API_KEY || env.DASHSCOPE_API_KEY

  return {
    server: {
      proxy: {
        '/api/llm/chat': {
          target: 'https://model-router.edu-aliyun.com',
          changeOrigin: true,
          secure: true,
          rewrite: () => '/v1/chat/completions',
          headers: apiKey
            ? {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              }
            : {},
        },
      },
    },
  }
})
```

前端只请求：

```text
POST /api/llm/chat
```

---

## 7. 生产环境推荐架构

```text
浏览器 / App
   │
   ▼
你们自己的后端（鉴权、限流、审计、隐藏 Key）
   │
   ▼
POST https://model-router.edu-aliyun.com/v1/chat/completions
Authorization: Bearer sk-xxx
model: qwen/qwen3.7-max | custom/deepseek-v4-flash | ...
```

不要：

- 前端直连 Model Router 并携带 Key  
- 把 Key 配进 `VITE_*` / `NEXT_PUBLIC_*`  
- 把「百炼兼容地址」和「Model Router 地址」混着用

---

## 8. 模型怎么选

到控制台 **模型广场 → 文本对话** 看卡片：

1. 上面是展示名（如 DeepSeek-V4-Flash）  
2. 下面灰色才是 API `model` 参数（如 `custom/deepseek-v4-flash`）

建议：

- 日常对话 / 高并发：Flash 类（便宜快）  
- 复杂推理 / 方案生成：Max / Pro 类  
- 先用控制台「开始对话」验证模型可用，再写代码

截图中常见标识示例：

```text
custom/deepseek-v4-flash
custom/deepseek-v4-pro
qwen/MiniMax-M2.5
qwen/glm-5.2
qwen/glm-5.1
qwen/kimi-k2.6
qwen/qwen3.6-flash
qwen/qwen3.7-max
qwen/qwen3.7-plus
```

---

## 9. 官网智能体面板怎么接

本仓库前端只认你们自己的后端：

```env
VITE_AGENT_API_URL=https://your-api.example.com/api/agent/chat
```

后端再转调 Model Router：

```js
// 伪代码
const upstream = await fetch('https://model-router.edu-aliyun.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.MODEL_ROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: process.env.MODEL_ROUTER_MODEL || 'qwen/qwen3.7-max',
    messages: [
      { role: 'system', content: '你是安托未来空间智能顾问' },
      ...history,
      { role: 'user', content: message },
    ],
  }),
})

const data = await upstream.json()
return { reply: data.choices?.[0]?.message?.content || '' }
```

---

## 10. 联调检查清单

- [ ] Key 来自 Model Router「授权管理 / 开放 API」，不是随便一个百炼 Key 瞎填  
- [ ] 请求地址是 `https://model-router.edu-aliyun.com/v1/chat/completions`  
- [ ] Header：`Authorization: Bearer sk-...`  
- [ ] `model` 使用模型广场灰色标识（含 `qwen/` 或 `custom/` 前缀）  
- [ ] 能读到 `choices[0].message.content`  
- [ ] 生产环境变量已注入，进程已重启

### 常见报错

| 现象 | 原因 | 处理 |
|------|------|------|
| 401 | Key 无效 / 未带 Bearer | 检查授权管理中的 Key |
| 403 / 模型不可用 | 未授权该模型 | 在控制台开通，或换已授权模型 |
| 404 | Base URL / 路径拼错 | 确认 `/v1/chat/completions` |
| CORS | 浏览器直连网关 | 改走服务端或 Vite 代理 |
| 有 Key 但线上 500 | 环境变量未配置 | Cloudflare / 服务器补 Key 并重启 |

---

## 11. 已跑通参考实现

| 项目 | 文件 | 说明 |
|------|------|------|
| 合肥智能社区 | `functions/api/bailian/chat.ts` | 生产转发到 Model Router |
| 合肥智能社区 | `vite.config.ts` | 本地代理到 `model-router.edu-aliyun.com` |
| 合肥智能社区 | `.env.example` | Key 环境变量示例 |

核心请求（已验证）：

```ts
await fetch('https://model-router.edu-aliyun.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'qwen/qwen3.5-omni-plus', // 按模型广场实际标识替换
    messages,
    temperature: 0.2,
    stream: false,
  }),
})
```

---

## 12. 一页纸速查

```text
平台：Model Router（安托未来租户）
控制台：模型广场 / 授权管理 / 开放 API / PAAS接入指南

Base URL : https://model-router.edu-aliyun.com/v1
Endpoint : POST /chat/completions
Auth     : Authorization: Bearer sk-xxx
Model    : 模型广场灰色标识（如 qwen/qwen3.7-max）
取回复   : choices[0].message.content
```

下一个项目按这张表接，一般就能一次调通。
