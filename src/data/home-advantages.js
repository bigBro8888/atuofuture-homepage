/** 首页首屏：公司定位总览 + 五大技术优势 */

export const HOME_ADVANTAGES_INTERVAL_MS = 8000
export const HOME_OVERVIEW_INTERVAL_MS = 9000

/**
 * @typedef {{ label: string, href?: string, action?: 'demo' }} AdvantageAction
 * @typedef {{
 *   id: number,
 *   label: string,
 *   eyebrowEn?: string,
 *   eyebrowZh?: string,
 *   title: string,
 *   description: string,
 *   valueProp?: string,
 *   primaryAction: AdvantageAction,
 *   secondaryAction: AdvantageAction,
 *   background: string,
 *   themeClass: string,
 *   visual: string,
 *   dwellMs?: number,
 * }} AdvantageSlide
 */

/** @type {AdvantageSlide[]} */
export const ADVANTAGE_SLIDES = [
  {
    id: 0,
    label: '公司定位',
    eyebrowEn: 'PHYSICAL AI · SPACE INTELLIGENCE',
    eyebrowZh: '物理AI · 空间智能',
    title: '让空间具备感知、思考与执行能力',
    description:
      '安托未来以空间智能中枢为核心，连接场景智能体、自研智能硬件和第三方系统，为楼宇、园区、学校、酒店、公寓与商业空间提供可开放、可自治、可规模交付的空间智能解决方案。',
    valueProp: '不是单纯卖硬件，也不是普通软件公司，而是把AI智能体、业务系统和真实设备连接起来的物理AI空间智能服务商。',
    primaryAction: { label: '查看整体架构', href: '#upgrade' },
    secondaryAction: { label: '预约方案演示', action: 'demo' },
    background: '/images/home-advantages/advantage-ai-agent.webp',
    themeClass: 'overview',
    visual: 'overview',
    dwellMs: HOME_OVERVIEW_INTERVAL_MS,
  },
  {
    id: 1,
    label: '能力01',
    title: '开放架构，连接现有系统与未来应用',
    description:
      '提供标准化API、MCP与灵活的系统接入能力，既能连接客户现有系统、第三方平台与主流软硬件协议，也为未来新增应用保留扩展空间。',
    valueProp: '系统不被单一厂商绑定，客户、合作伙伴与集成商可以持续扩展自己的应用能力。',
    primaryAction: { label: '查看开放能力', href: '#upgrade' },
    secondaryAction: { label: '预约方案演示', action: 'demo' },
    background: '/images/home-advantages/advantage-open-interface.webp',
    themeClass: 'open-interface',
    visual: 'open-interface',
  },
  {
    id: 2,
    label: '能力02',
    title: 'AI原生架构，让空间主动理解与执行',
    description:
      '以AI智能体为核心重构空间运营系统，让不同智能体能够感知环境、理解需求、协同决策、调用系统与设备，并持续跟踪执行结果。',
    valueProp: '从依赖人工操作的软件平台，升级为能够主动完成任务的场景执行系统。',
    primaryAction: { label: '探索智能体', href: 'agents/' },
    secondaryAction: { label: '查看应用场景', href: 'solutions/' },
    background: '/images/home-advantages/advantage-ai-agent.webp',
    themeClass: 'ai-agent',
    visual: 'ai-agent',
  },
  {
    id: 3,
    label: '能力03',
    title: '大规模无线接入，让复杂项目快速落地',
    description:
      '具备千万平方米级场景的大规模无线商用接入与交付经验，支持多楼栋、多楼层、多区域和多类型终端的稳定连接与统一管理。',
    valueProp: '减少复杂布线和现场联调成本，让项目从网络规划、设备部署到系统交付更加快速、稳定和可复制。',
    primaryAction: { label: '查看接入能力', href: 'hardware/#gateway' },
    secondaryAction: { label: '预约方案演示', action: 'demo' },
    background: '/images/home-advantages/advantage-wireless-access.webp',
    themeClass: 'wireless-access',
    visual: 'wireless-access',
  },
  {
    id: 4,
    label: '能力04',
    title: '分层自治，全域协同',
    description:
      '平台、区域、边缘与终端层均具备开放接口和独立运行能力，各层级既能形成自身业务闭环，也能在统一架构下协同联动。',
    valueProp: '上层网络临时中断时，本地设备和区域系统仍能继续工作；网络恢复后，状态和数据自动同步。',
    primaryAction: { label: '了解技术架构', href: '#system-architecture' },
    secondaryAction: { label: '查看行业方案', href: 'solutions/?id=building' },
    background: '/images/home-advantages/advantage-layered-loop.webp',
    themeClass: 'layered-loop',
    visual: 'layered-loop',
  },
  {
    id: 5,
    label: '能力05',
    title: '软硬协同，构建完整空间智能底座',
    description:
      '从感知终端、控制设备、边缘网关、中控屏到AI平台和场景应用，安托未来形成软硬件协同设计、系统集成与项目交付能力。',
    valueProp: '不只提供软件方案，还能让智能策略真正落地到每一个设备、空间和业务流程。',
    primaryAction: { label: '查看智能硬件', href: 'hardware/' },
    secondaryAction: { label: '获取整体方案', action: 'demo' },
    background: '/images/home-advantages/advantage-hardware-system.webp',
    themeClass: 'hardware-system',
    visual: 'hardware-system',
  },
]
