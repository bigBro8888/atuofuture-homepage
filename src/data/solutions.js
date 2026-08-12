/** 行业解决方案 */
export const SOLUTIONS = [
  {
    id: 'building',
    name: '智慧楼宇',
    icon: 'apartment',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
    summary: '围绕会议、访客、空间、能耗与安防，打造可感知、可联动、可持续优化的 AI 原生楼宇。',
    canDo: ['会议室自动准备', '访客通行与接待', '分区照明空调策略', '安防与工单闭环'],
    agents: ['space', 'meeting', 'visitor', 'energy'],
  },
  {
    id: 'campus',
    name: '园区运营',
    icon: 'domain',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1400&q=80',
    summary: '打通多楼栋、多系统与多角色服务，覆盖运维调度、能耗分析与安全管理。',
    canDo: ['多楼栋统一调度', '运维工单协同', '园区能耗看板', '安防联防联控'],
    agents: ['space', 'energy', 'asset', 'visitor'],
  },
  {
    id: 'commercial',
    name: '商业资产',
    icon: 'storefront',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
    summary: '聚焦招商、带看、租赁与资产精细化管理，帮助商业空间实现可视可运营。',
    canDo: ['招商带看预约', '空间资源可视化', '能耗与运营联动', '资产盘点台账'],
    agents: ['asset', 'visitor', 'energy', 'space'],
  },
  {
    id: 'meeting',
    name: '会务接待',
    icon: 'handshake',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80',
    summary: '从邀约、到访、通行到会议联动与离场，一次接待流程自动编排。',
    canDo: ['智能邀约', 'VIP 动线引导', '会议空间联动', '接待复盘报表'],
    agents: ['visitor', 'meeting', 'space'],
  },
  {
    id: 'energy',
    name: '能源能耗',
    icon: 'eco',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1400&q=80',
    summary: '分项计量 + 有无人感知，把空调与照明能耗用在真正有人的时刻。',
    canDo: ['分项计量', '用时与能耗分析', '毫米波节能策略', '异常告警'],
    agents: ['energy', 'space'],
  },
  {
    id: 'security',
    name: '安防资产',
    icon: 'security',
    image: 'https://images.unsplash.com/photo-1557597774-9c82bde5d0f9?auto=format&fit=crop&w=1400&q=80',
    summary: '融合资产盘点、异常预警与全生命周期管理，让安全与资产主动治理。',
    canDo: ['资产盘点', '异常预警', '权限与通行', '生命周期管理'],
    agents: ['asset', 'visitor'],
  },
]

export function getSolution(id) {
  return SOLUTIONS.find((s) => s.id === id) ?? SOLUTIONS[0]
}
