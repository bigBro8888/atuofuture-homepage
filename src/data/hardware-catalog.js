/** 智能硬件分组目录 */
export const HARDWARE_SECTIONS = [
  {
    id: 'terminal',
    title: '终端设备',
    desc: '面向空间控制与体验的蓝牙/IoT 终端。',
    products: [
      { name: '蓝牙套开关', icon: 'toggle_on', desc: '照明回路本地与远程控制' },
      { name: '空调控制器', icon: 'ac_unit', desc: '空调启停与温度策略联动' },
      { name: '智能插座', icon: 'power', desc: '用电监测与远程通断' },
      { name: '智能桌牌', icon: 'badge', desc: '会议席位与身份显示' },
      { name: '智能相框', icon: 'photo_frame', desc: '信息发布与欢迎内容' },
      { name: '蓝牙门锁', icon: 'lock', desc: '客房/办公通行授权' },
    ],
  },
  {
    id: 'sensor',
    title: '传感与计量',
    desc: '感知占用、环境与能耗，支撑智能体决策。',
    products: [
      { name: '毫米波计人数', icon: 'groups', desc: '空间人数统计与密度分析' },
      { name: '毫米波 + PIR 人存', icon: 'sensors', desc: '有无人判断，支撑节能策略' },
      { name: '温湿度传感器', icon: 'device_thermostat', desc: '环境舒适度采集' },
      { name: '光照传感器', icon: 'wb_sunny', desc: '照度感知与调光依据' },
      { name: '定位标签', icon: 'location_on', desc: '资产与人员定位' },
      { name: '电表 / 水表', icon: 'speed', desc: '分项计量与能耗归因' },
    ],
  },
  {
    id: 'gateway',
    title: '网关与中控',
    desc: '边缘汇聚、本地联动与第三方协议桥接。',
    products: [
      { name: '无线网关', icon: 'wifi_tethering', desc: '大规模无线终端接入' },
      { name: '多功能网关', icon: 'router', desc: '多协议汇聚与边缘缓存' },
      { name: '中控屏', icon: 'smart_display', desc: '含蓝牙与 IoT 网关能力，可直连自有蓝牙设备' },
      { name: '协议接入', icon: 'hub', desc: '经服务器对接 KNX、BUS 及其他第三方协议' },
    ],
  },
  {
    id: 'av',
    title: '音视频会议',
    desc: '会议中控与音视频终端，服务会议室运维场景。',
    products: [
      { name: '会议中控屏', icon: 'cast', desc: '会议场景一键开停与设备编排' },
      { name: '音视频终端', icon: 'videocam', desc: '云视频与本地会议设备联动' },
    ],
  },
]

export const HARDWARE_MAIN_CATEGORIES = HARDWARE_SECTIONS.map((s) => ({ id: s.id, label: s.title }))
export const HARDWARE_CATALOG = HARDWARE_SECTIONS.map((s) => ({
  id: s.id,
  label: s.title,
  groups: [{ id: s.id, label: s.title, products: s.products.map((p, i) => ({ id: `${s.id}-${i}`, ...p, price: '询价' })) }],
}))
