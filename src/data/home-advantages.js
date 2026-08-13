/** 首页首屏：安拓未来五大技术优势 */

export const HOME_ADVANTAGES_INTERVAL_MS = 7000

/**
 * @typedef {{ label: string, href?: string, action?: 'demo' }} AdvantageAction
 * @typedef {{
 *   id: number,
 *   label: string,
 *   title: string,
 *   description: string,
 *   primaryAction: AdvantageAction,
 *   secondaryAction: AdvantageAction,
 *   background: string,
 *   themeClass: string,
 *   visual: string,
 * }} AdvantageSlide
 */

/** @type {AdvantageSlide[]} */
export const ADVANTAGE_SLIDES = [
  {
    id: 1,
    label: '能力 01',
    title: '开放连接，打破系统边界',
    description:
      '提供标准化接口与灵活的系统接入能力，兼容主流软硬件协议，连接客户既有系统、第三方平台与未来新增应用。',
    primaryAction: { label: '查看开放能力', href: '#upgrade' },
    secondaryAction: { label: '预约方案演示', action: 'demo' },
    background: '/images/home-advantages/advantage-open-interface.webp',
    themeClass: 'open-interface',
    visual: 'open-interface',
  },
  {
    id: 2,
    label: '能力 02',
    title: 'AI原生架构，让系统主动理解与执行',
    description:
      '以AI智能体为核心重构业务系统，让不同智能体能够感知需求、协同决策、调用系统并完成任务。',
    primaryAction: { label: '探索智能体', href: 'agents/' },
    secondaryAction: { label: '查看应用场景', href: 'solutions/' },
    background: '/images/home-advantages/advantage-ai-agent.webp',
    themeClass: 'ai-agent',
    visual: 'ai-agent',
  },
  {
    id: 3,
    label: '能力 03',
    title: '大规模无线接入，稳定连接每一个空间',
    description:
      '具备蓝牙、Wi-Fi、IoT等大规模终端接入与现场交付经验，支持多楼层、多区域、多类型设备稳定连接和统一管理。',
    primaryAction: { label: '查看接入能力', href: 'hardware/#gateway' },
    secondaryAction: { label: '预约方案演示', action: 'demo' },
    background: '/images/home-advantages/advantage-wireless-access.webp',
    themeClass: 'wireless-access',
    visual: 'wireless-access',
  },
  {
    id: 4,
    label: '能力 04',
    title: '分层自治，全域协同',
    description:
      '平台、区域与终端层均具备开放接口和独立运行能力，各层级既能形成自身业务闭环，也能在统一架构下协同联动。',
    primaryAction: { label: '了解技术架构', href: '#upgrade' },
    secondaryAction: { label: '查看稳定性设计', href: 'solutions/?id=building' },
    background: '/images/home-advantages/advantage-layered-loop.webp',
    themeClass: 'layered-loop',
    visual: 'layered-loop',
  },
  {
    id: 5,
    label: '能力 05',
    title: '软硬一体，构建完整智能化底座',
    description:
      '从感知终端、控制设备、边缘网关到AI平台和场景应用，形成软硬件协同设计、系统集成与项目交付能力。',
    primaryAction: { label: '查看智能硬件', href: 'hardware/' },
    secondaryAction: { label: '获取整体方案', action: 'demo' },
    background: '/images/home-advantages/advantage-hardware-system.webp',
    themeClass: 'hardware-system',
    visual: 'hardware-system',
  },
]
