/**
 * 空间服务智能体详情页
 * 视觉以产品稿 canvas 1:1 呈现，热区负责可点击交互。
 * 坐标为相对 canvas 的百分比（left/top/width/height）。
 */
export const SPACE_AGENT_PAGE = {
  canvas: '/images/agents/space-detail/page-canvas.jpg',
  canvasWidth: 2304,
  canvasHeight: 3920,
  hotspots: [
    {
      id: 'hero-play',
      label: '观看一次自动运行',
      href: '../agents/#agent-story',
      left: 6.5,
      top: 8.6,
      width: 16.2,
      height: 2.3,
    },
    {
      id: 'hero-demo',
      label: '预约场景演示',
      action: 'demo',
      left: 23.5,
      top: 8.6,
      width: 12.2,
      height: 2.3,
    },
    {
      id: 'peer-visitor',
      label: '访客接待智能体',
      href: './?id=visitor',
      left: 10,
      top: 88.4,
      width: 20,
      height: 2.6,
    },
    {
      id: 'peer-asset',
      label: '资产管理智能体',
      href: './?id=asset',
      left: 10,
      top: 91.6,
      width: 20,
      height: 2.6,
    },
    {
      id: 'peer-energy',
      label: '能源能耗智能体',
      href: './?id=energy',
      left: 70,
      top: 88.4,
      width: 20,
      height: 2.6,
    },
    {
      id: 'peer-exhibition',
      label: '展厅智能体',
      href: './?id=exhibition',
      left: 70,
      top: 91.6,
      width: 20,
      height: 2.6,
    },
    {
      id: 'cta-demo',
      label: '预约场景演示',
      action: 'demo',
      left: 3,
      top: 95.2,
      width: 94,
      height: 4.2,
    },
  ],
}
