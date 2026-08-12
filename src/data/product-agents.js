/** 七类产品智能体（官网矩阵） */
export const PRODUCT_AGENTS = [
  {
    id: 'space',
    name: '空间智能体',
    icon: 'tune',
    kicker: 'SPACE CONTROL',
    summary: '统一调度空调、照明、设备控制、智能工单与信息发布，让空间按场景自动响应。',
    points: ['空调与照明策略联动', '设备控制与状态回读', '智能工单自动流转', '信息发布与门牌联动'],
  },
  {
    id: 'energy',
    name: '能源能耗智能体',
    icon: 'bolt',
    kicker: 'ENERGY',
    summary: '按区域与功能分项计量，结合毫米波有无人感知，把照明与空调的用时和能耗说清楚。',
    points: ['区域/功能分项计量', '照明与空调用时分析', '毫米波有无人节能', '异常能耗告警'],
  },
  {
    id: 'meeting',
    name: '会议运维智能体',
    icon: 'meeting_room',
    kicker: 'MEETING OPS',
    summary: '面向会议室运维：预约、签到、中控与云视频一站式编排，减少人工协调。',
    points: ['会议室预约与冲突检测', '签到核验', '中控设备联动', '云视频会议接入'],
  },
  {
    id: 'exhibition',
    name: '展厅智能体',
    icon: 'view_in_ar',
    kicker: 'SHOWROOM',
    summary: '驱动 3D 大屏与数字孪生，让展厅讲解、内容切换与空间氛围自动编排。',
    points: ['3D 大屏内容编排', '数字孪生联动', '讲解与导览流程', '展项状态可视化'],
  },
  {
    id: 'visitor',
    name: '访客智能体',
    icon: 'badge',
    kicker: 'VISITOR',
    summary: '覆盖来访登记到接待引导，串联通行、通知与会面空间准备。',
    points: ['来访预约与登记', '通行权限下发', '接待提醒', '会面空间联动'],
  },
  {
    id: 'hospitality',
    name: '酒店公寓智能体',
    icon: 'apartment',
    kicker: 'HOSPITALITY',
    summary: '分配房间、蓝牙门锁与客房设备能耗统一管理，提升入住与运营效率。',
    points: ['智能分房', '蓝牙门锁授权', '客房设备控制', '房间能耗统计'],
  },
  {
    id: 'asset',
    name: '资产管理智能体',
    icon: 'inventory_2',
    kicker: 'ASSET',
    summary: '资产盘点、领用借还与全生命周期管理，让资产状态实时可查。',
    points: ['盘点核对', '领用借还', '定位标签联动', '生命周期台账'],
  },
]

export function getProductAgent(id) {
  return PRODUCT_AGENTS.find((a) => a.id === id) ?? PRODUCT_AGENTS[0]
}
