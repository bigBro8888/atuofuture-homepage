/** 后台信息架构：路径必须与前台路由一致，便于运营对照。 */
export const ADMIN_SITEMAP = [
  { key: 'site', group: '全站', label: '全站设置', path: '全站共用', hash: 'site', kind: 'site' },
  { key: 'home', group: '网站内容', label: '官网首页', path: '/', hash: 'home', kind: 'home' },
  { key: 'about', group: '网站内容', label: '关于我们', path: '/about/', hash: 'about', kind: 'about' },
  { key: 'solutions', group: '网站内容', label: '行业解决方案', path: '/solutions/', hash: 'page-solutions', kind: 'simple' },
  { key: 'agents', group: '网站内容', label: '空间智能体', path: '/agents/', hash: 'page-agents', kind: 'simple' },
  { key: 'hardware', group: '网站内容', label: '智能硬件', path: '/hardware/', hash: 'page-hardware', kind: 'simple' },
  { key: 'news', group: '网站内容', label: '新闻中心', path: '/news/', hash: 'page-news', kind: 'news' },
  { key: 'ai-token', group: '网站内容', label: 'AI Token', path: '/ai-token/', hash: 'page-ai-token', kind: 'simple' },
  { key: 'config', group: '网站内容', label: 'App 下载页', path: '/app-download/', hash: 'config', kind: 'app' },
]
