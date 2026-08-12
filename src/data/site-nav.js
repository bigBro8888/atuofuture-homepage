/** 全站顶部导航：一级 + 二级（mega menu） */
export const SITE_NAV_ITEMS = [
  { id: 'home', label: '首页', segment: '' },
  {
    id: 'solutions',
    label: '行业解决方案',
    segment: 'solutions/',
    children: [
      { id: 'sol-building', label: '智慧楼宇', desc: '会议、访客、能耗与安防一体', segment: 'solutions/?id=building' },
      { id: 'sol-campus', label: '园区运营', desc: '多楼栋联动与运维调度', segment: 'solutions/?id=campus' },
      { id: 'sol-commercial', label: '商业资产', desc: '招商租赁与资产运营', segment: 'solutions/?id=commercial' },
      { id: 'sol-meeting', label: '会务接待', desc: '预约到离场全流程编排', segment: 'solutions/?id=meeting' },
      { id: 'sol-energy', label: '能源能耗', desc: '分项计量与节能策略', segment: 'solutions/?id=energy' },
      { id: 'sol-security', label: '安防资产', desc: '视觉识别与生命周期管理', segment: 'solutions/?id=security' },
    ],
  },
  {
    id: 'agents',
    label: '智能体',
    segment: 'agents/',
    children: [
      { id: 'space', label: '空间智能体', desc: '空调、照明、工单与信息发布', segment: 'agent-detail/?id=space' },
      { id: 'energy', label: '能源能耗智能体', desc: '分区计量与有无人节能', segment: 'agent-detail/?id=energy' },
      { id: 'meeting', label: '会议运维智能体', desc: '预约、签到、中控与云视频', segment: 'agent-detail/?id=meeting' },
      { id: 'exhibition', label: '展厅智能体', desc: '3D 大屏与数字孪生', segment: 'agent-detail/?id=exhibition' },
      { id: 'visitor', label: '访客智能体', desc: '来访登记与接待联动', segment: 'agent-detail/?id=visitor' },
      { id: 'hospitality', label: '酒店公寓智能体', desc: '分房、门锁与能耗', segment: 'agent-detail/?id=hospitality' },
      { id: 'asset', label: '资产管理智能体', desc: '盘点与全生命周期', segment: 'agent-detail/?id=asset' },
    ],
  },
  {
    id: 'hardware',
    label: '智能硬件',
    segment: 'hardware/',
    children: [
      { id: 'hw-terminal', label: '终端设备', desc: '开关、插座、桌牌、门锁', segment: 'hardware/#terminal' },
      { id: 'hw-sensor', label: '传感与计量', desc: '毫米波、温湿度、水电表', segment: 'hardware/#sensor' },
      { id: 'hw-gateway', label: '网关与中控', desc: '无线网关、多功能网关、中控屏', segment: 'hardware/#gateway' },
      { id: 'hw-av', label: '音视频会议', desc: '会议中控与音视频终端', segment: 'hardware/#av' },
    ],
  },
  { id: 'news', label: '新闻中心', segment: 'news/' },
  { id: 'about', label: '关于我们', segment: 'about/' },
]
