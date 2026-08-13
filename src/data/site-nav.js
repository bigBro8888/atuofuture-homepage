/** 全站顶部导航：一级 + 二级（mega menu） */
export const SITE_NAV_ITEMS = [
  { id: 'home', label: '首页', segment: '' },
  {
    id: 'solutions',
    label: '行业解决方案',
    segment: 'solutions/',
    children: [
      { id: 'sol-campus', label: '智慧园区', desc: '多楼栋统一运营与园区服务协同', segment: 'solutions/?id=campus' },
      { id: 'sol-building', label: '智慧楼宇', desc: '访客、会议、能耗与运维一体联动', segment: 'solutions/?id=building' },
      { id: 'sol-school', label: '智慧学校', desc: '教室、通行、能耗与信息发布', segment: 'solutions/?id=school' },
      { id: 'sol-hotel', label: '智慧酒店', desc: '客房中控、门锁与能耗服务', segment: 'solutions/?id=hotel' },
      { id: 'sol-apartment', label: '智慧公寓', desc: '分房、授权、水电与费用管理', segment: 'solutions/?id=apartment' },
      { id: 'sol-commercial', label: '商业资产', desc: '招商获客、带看签约与资产运营', segment: 'solutions/?id=commercial' },
    ],
  },
  {
    id: 'agents',
    label: '空间智能体',
    segment: 'agents/',
    children: [
      { id: 'space', label: '空间服务智能体', desc: '空调照明、工单与信息发布统一调度', segment: 'agent-detail/?id=space' },
      { id: 'energy', label: '能源能耗智能体', desc: '分项计量与有无人节能分析', segment: 'agent-detail/?id=energy' },
      { id: 'meeting', label: '会议运维智能体', desc: '预约签到、中控与音视频联动', segment: 'agent-detail/?id=meeting' },
      { id: 'exhibition', label: '展厅智能体', desc: '大屏、孪生、讲解与展项状态', segment: 'agent-detail/?id=exhibition' },
      { id: 'visitor', label: '访客接待智能体', desc: '邀约登记、通行与接待编排', segment: 'agent-detail/?id=visitor' },
      { id: 'opc', label: 'OPC运营智能体', desc: '空间发布、带看、签约与运营协同', segment: 'agent-detail/?id=opc' },
      { id: 'hospitality', label: '酒店公寓智能体', desc: '分房、门锁、客房与费用管理', segment: 'agent-detail/?id=hospitality' },
      { id: 'asset', label: '资产管理智能体', desc: '盘点、领用借还与生命周期', segment: 'agent-detail/?id=asset' },
    ],
  },
  {
    id: 'hardware',
    label: '智能硬件',
    segment: 'hardware/',
    children: [
      { id: 'hw-terminal', label: '终端设备', desc: '开关、空调控制、桌牌、门锁等', segment: 'hardware/#terminal' },
      { id: 'hw-sensor', label: '传感与计量', desc: '毫米波、温湿度、水电表与定位', segment: 'hardware/#sensor' },
      { id: 'hw-gateway', label: '网关与中控', desc: '无线网关、多功能网关与中控屏', segment: 'hardware/#gateway' },
      { id: 'hw-av', label: '音视频会议', desc: '会议中控与音视频终端联动', segment: 'hardware/#av' },
    ],
  },
  { id: 'news', label: '新闻中心', segment: 'news/' },
  {
    id: 'about',
    label: '关于我们',
    segment: 'about/',
    children: [
      { id: 'about-intro', label: '公司介绍', desc: '物理AI与空间智能定位', segment: 'about/#intro' },
      { id: 'about-team', label: '团队与能力', desc: '软件、IoT与交付能力', segment: 'about/#team' },
      { id: 'about-delivery', label: '项目实践', desc: '实施流程与交付方式', segment: 'about/#delivery' },
      { id: 'about-contact', label: '联系我们', desc: '预约演示与商务对接', segment: 'about/#contact' },
    ],
  },
]
