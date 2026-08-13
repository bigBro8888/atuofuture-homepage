/** 首页首屏：公司定位总览 + 五大技术优势（西门子式简洁文案） */

export const HOME_ADVANTAGES_INTERVAL_MS = 4000
export const HOME_OVERVIEW_INTERVAL_MS = 4500

/**
 * @typedef {{ label: string, href?: string, action?: 'demo' }} AdvantageAction
 * @typedef {{
 *   id: number,
 *   label: string,
 *   title: string,
 *   description: string,
 *   primaryAction: AdvantageAction,
 *   background: string,
 *   themeClass: string,
 *   dwellMs?: number,
 * }} AdvantageSlide
 */

/** @type {AdvantageSlide[]} */
export const ADVANTAGE_SLIDES = [
  {
    id: 0,
    label: '',
    title: '让空间具备感知、思考与执行能力',
    description:
      '安托未来以空间智能中枢连接场景智能体与智能硬件，为楼宇、园区及各类空间提供可开放、可自治、可规模交付的解决方案。',
    primaryAction: { label: '了解安托未来', href: '#upgrade' },
    background: '/images/home-advantages/advantage-ai-agent.webp',
    themeClass: 'overview',
    dwellMs: HOME_OVERVIEW_INTERVAL_MS,
  },
  {
    id: 1,
    label: '能力 01',
    title: '开放架构，连接现有系统与未来应用',
    description: '以标准化 API 与灵活接入能力，连接客户现有系统、第三方平台，并为新增应用保留扩展空间。',
    primaryAction: { label: '查看开放能力', href: '#upgrade' },
    background: '/images/home-advantages/advantage-open-interface.webp',
    themeClass: 'open-interface',
  },
  {
    id: 2,
    label: '能力 02',
    title: 'AI 原生架构，让空间主动理解与执行',
    description: '以智能体感知环境、理解需求、协同决策并调用设备，将空间运营从人工操作升级为自动执行。',
    primaryAction: { label: '探索智能体', href: 'agents/' },
    background: '/images/home-advantages/advantage-ai-agent.webp',
    themeClass: 'ai-agent',
  },
  {
    id: 3,
    label: '能力 03',
    title: '大规模无线接入，让复杂项目快速落地',
    description: '具备千万平方米级无线商用接入经验，支持多楼栋、多楼层、多类型终端的稳定连接与统一管理。',
    primaryAction: { label: '查看接入能力', href: 'hardware/#gateway' },
    background: '/images/home-advantages/advantage-wireless-access.webp',
    themeClass: 'wireless-access',
  },
  {
    id: 4,
    label: '能力 04',
    title: '分层自治，全域协同',
    description: '平台、区域、边缘与终端均可独立闭环运行，也能在统一架构下协同联动，断网时本地仍可持续工作。',
    primaryAction: { label: '了解技术架构', href: '#upgrade' },
    background: '/images/home-advantages/advantage-layered-loop.webp',
    themeClass: 'layered-loop',
  },
  {
    id: 5,
    label: '能力 05',
    title: '软硬协同，构建完整空间智能底座',
    description: '从感知终端、边缘网关到 AI 平台与场景应用，形成软硬件协同设计与项目交付能力。',
    primaryAction: { label: '查看智能硬件', href: 'hardware/' },
    background: '/images/home-advantages/advantage-hardware-system.webp',
    themeClass: 'hardware-system',
  },
]
