import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const sourceRoot =
  'F:/临时下载/stitch_atuo_future_ai_spatial_intelligence_website_redesign/stitch_atuo_future_ai_spatial_intelligence_website_redesign'

const pages = [
  {
    source: 'atuo_future_4/code.html',
    target: 'index.html',
    page: 'home',
    activeNav: 'home',
  },
  {
    source: 'atuo_future_2/code.html',
    target: 'agents/index.html',
    page: 'agents',
    activeNav: 'agents',
  },
  {
    source: 'ai_token_atuo_future/code.html',
    target: 'ai-token/index.html',
    page: 'ai-token',
    activeNav: 'ai-token',
  },
  {
    source: 'atuo_future_1/code.html',
    target: 'solutions/smart-hq/index.html',
    page: 'smart-hq',
    activeNav: 'solutions',
  },
  {
    source: 'atuo_future_3/code.html',
    target: 'about/index.html',
    page: 'about',
    activeNav: 'about',
  },
]

const headReplacement = `<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Geist:wght@400;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/src/styles/main.css"/>`

function stripStitchHead(html) {
  return html
    .replace(/<script src="https:\/\/cdn\.tailwindcss\.com[^"]*"><\/script>\s*/g, '')
    .replace(/<script id="tailwind-config">[\s\S]*?<\/script>\s*/g, '')
    .replace(/<style>[\s\S]*?<\/style>\s*/g, '')
    .replace(/<link href="https:\/\/fonts\.googleapis\.com[^"]*" rel="stylesheet"\/?>\s*/g, '')
}

function injectHead(html) {
  return html.replace(/<head>\s*([\s\S]*?)<\/head>/, (_, inner) => {
    const titleMatch = inner.match(/<title>[\s\S]*?<\/title>/)
    const title = titleMatch ? titleMatch[0] : '<title>Atuo Future</title>'
    return `<head>\n${headReplacement}\n${title}\n</head>`
  })
}

function injectBodyAttrs(html, page) {
  return html.replace(/<body([^>]*)>/, `<body$1 data-page="${page}">`)
}

function injectScript(html) {
  return html.replace(/<script>[\s\S]*?<\/script>\s*<\/body>/, '<script type="module" src="/src/scripts/main.js"></script>\n</body>')
}

function fixPaths(html, depth) {
  const prefix = depth === 0 ? '' : '../'.repeat(depth)
  if (depth > 0) {
    html = html.replace(/href="\/src\//g, `href="${prefix}src/`)
    html = html.replace(/src="\/src\//g, `src="${prefix}src/`)
  }
  return html
}

function linkForText(text, links) {
  const t = text.trim()
  if (t === '首页') return links.home
  if (t.includes('场景化智能体')) return links.agents
  if (t.includes('AI Token')) return links.aiToken
  if (t.includes('空间智能') || t.includes('智慧总部') || t.includes('集团总部') || t.includes('园区综合体') || t.includes('星级酒店') || t.includes('冷链物流') || t.includes('智能园区') || t.includes('智慧商业') || t.includes('AI办公')) return links.solutions
  if (t.includes('产品与') || t.includes('硬件生态') || t.includes('空间数据底座')) return links.about
  if (t.includes('案例')) return links.cases
  if (t.includes('关于我们') || t.includes('公司简介') || t.includes('新闻中心') || t.includes('加入我们') || t.includes('联系我们') && !t.includes('@')) return links.about
  return null
}

function updateNavLinks(html, activeNav, depth) {
  const prefix = depth === 0 ? '' : '../'.repeat(depth)

  const links = {
    home: depth === 0 ? './' : `${prefix}`,
    agents: `${prefix}agents/`,
    aiToken: `${prefix}ai-token/`,
    solutions: `${prefix}solutions/smart-hq/`,
    about: `${prefix}about/`,
    cases: `${prefix}#solutions`,
  }

  html = html.replace(/<a([^>]*?)href="[^"]*"([^>]*?)>([\s\S]*?)<\/a>/g, (match, before, after, text) => {
    const plain = text.replace(/<[^>]+>/g, '').trim()
    const target = linkForText(plain, links)
    if (!target) return match
    return `<a${before}href="${target}"${after}>${text}</a>`
  })

  return html
}

function normalizeSpacing(html) {
  return html
    .replace(/\bpx-64\b/g, 'px-margin-desktop')
    .replace(/\bmax-w-\[1440px\]/g, 'max-w-max-width')
    .replace(/\bright-margin-desktop\b/g, 'mr-margin-desktop')
    .replace(/\bleft-margin-desktop\b/g, 'ml-margin-desktop')
}

for (const { source, target, page, activeNav } of pages) {
  const depth = target.split('/').length - 1
  const sourcePath = join(sourceRoot, source)
  let html = readFileSync(sourcePath, 'utf8')

  html = stripStitchHead(html)
  html = injectHead(html)
  html = injectBodyAttrs(html, page)
  html = injectScript(html)
  html = fixPaths(html, depth)
  html = updateNavLinks(html, activeNav, depth)
  html = normalizeSpacing(html)

  html = html.replace(
    /<span class="font-headline-md text-headline-md font-bold text-primary">Atuo Future<\/span>/g,
    `<a href="${depth === 0 ? './' : '../'.repeat(depth)}" class="font-headline-md text-headline-md font-bold text-primary">Atuo Future</a>`
  )

  if (page === 'home') {
    html = html.replace(
      '<section class="py-32 bg-surface-container-low">',
      '<section id="cases" class="py-32 bg-surface-container-low">'
    )
  }

  const targetPath = join(root, target)
  mkdirSync(dirname(targetPath), { recursive: true })
  writeFileSync(targetPath, html, 'utf8')
  console.log(`✓ ${target}`)
}

console.log('\nAll pages integrated.')
