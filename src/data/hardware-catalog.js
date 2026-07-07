/** 硬件商城产品目录 —— 对齐 atuofuture.com 产品架构 */
export const HARDWARE_MAIN_CATEGORIES = [
  { id: 'spatial', label: '空间智能' },
  { id: 'retail', label: '新零售' },
  { id: 'digital', label: '3C数码' },
]

export const HARDWARE_CATALOG = [
  {
    id: 'spatial',
    label: '空间智能',
    groups: [
      {
        id: 'basic',
        label: '基础解决方案',
        products: [
          { id: 'desk-sign', name: '电子桌牌', icon: 'tablet', desc: '会议席位动态显示与身份识别，支持模板化内容推送。', price: '询价' },
          { id: 'workstation-screen', name: '工位屏', icon: 'desktop_windows', desc: '个人工位状态屏，展示预约、访客与空间服务信息。', price: '¥1,280 起' },
          { id: 'central-screen', name: '中控屏', icon: 'smart_display', desc: '空间核心交互终端，联动智能体实现导览与会务控制。', price: '¥8,600 起' },
          { id: 'smart-lighting', name: '智能照明', icon: 'lightbulb', desc: '分区调光与策略联动，支持能耗优化与场景模式切换。', price: '¥680 起' },
          { id: 'smart-hvac', name: '智能空调系统', icon: 'ac_unit', desc: '温湿度自适应调节，接入楼宇能源智能体统一调度。', price: '¥2,400 起' },
          { id: 'smart-energy', name: '智能能耗', icon: 'electric_meter', desc: '分项计量与异常告警，支撑空间能耗可视化治理。', price: '¥3,200 起' },
          { id: 'device-control', name: '设备控制', icon: 'tune', desc: '多协议设备统一接入，实现跨系统联动控制。', price: '¥1,560 起' },
          { id: 'sensor', name: '传感器', icon: 'sensors', desc: '环境、人体、门窗等多类型传感采集，即插即用。', price: '¥320 起' },
          { id: 'smart-meeting', name: '智能会议室', icon: 'meeting_room', desc: '会议预约、设备联动、纪要生成一体化套件。', price: '¥12,800 起' },
          { id: 'smart-fire', name: '智能消防', icon: 'local_fire_department', desc: '消防感知与应急联动，对接安防智能体告警闭环。', price: '询价' },
        ],
      },
      {
        id: 'industry',
        label: '行业解决方案',
        products: [
          { id: 'smart-campus', name: '智慧园区', icon: 'domain', desc: '园区级空间智能整体方案，覆盖安防、能源、会务与资产。', price: '方案询价', featured: true },
          { id: 'smart-building', name: '智慧楼宇', icon: 'apartment', desc: '总部大楼数字化运营套件，支持多楼层分区治理。', price: '方案询价' },
          { id: 'smart-classroom', name: '智慧教室', icon: 'school', desc: '教学空间环境自适应与设备集中管控方案。', price: '方案询价' },
          { id: 'smart-apartment', name: '智慧公寓', icon: 'night_shelter', desc: '公寓通行、能耗与安防一体化智能管理。', price: '方案询价' },
          { id: 'smart-store', name: '智慧门店', icon: 'storefront', desc: '门店客流、陈列与环境协同运营方案。', price: '方案询价' },
        ],
      },
      {
        id: 'devices',
        label: '设备',
        products: [
          { id: 'office-device', name: '办公设备', icon: 'print', desc: '办公场景配套智能终端与协作硬件组合。', price: '¥2,980 起' },
          { id: 'central-panel', name: '中控屏', icon: 'dashboard', desc: '空间控制中枢屏，预装 Atuo OS 与 Agent 接入能力。', price: '¥6,800 起' },
          { id: 'switch-ac', name: '开关和空调', icon: 'power', desc: '智能开关与空调控制器，支持远程策略下发。', price: '¥480 起' },
          { id: 'device-sensor', name: '传感器', icon: 'device_thermostat', desc: '标准化传感模组，兼容主流 IoT 网关协议。', price: '¥260 起' },
          { id: 'gateway', name: '网关', icon: 'router', desc: '边缘接入网关，支持子设备汇聚与本地推理缓存。', price: '¥4,200 起', featured: true },
        ],
      },
    ],
  },
  {
    id: 'retail',
    label: '新零售',
    groups: [
      {
        id: 'esl',
        label: '电子价签',
        products: [
          { id: 'eink-esl', name: '墨水屏电子价签', icon: 'sell', desc: '低功耗电子墨水价签，支持批量改价与促销联动。', price: '¥68 起', featured: true },
          { id: 'lcd-esl', name: 'LCD 电子价签', icon: 'tv', desc: '全彩 LCD 价签，适合高频促销与多媒体展示。', price: '¥128 起' },
        ],
      },
      {
        id: 'cold-chain',
        label: '冷链',
        products: [
          { id: 'low-temp-label', name: '低温标签', icon: 'ac_unit', desc: '冷链场景耐低温电子标签，保障全程温控可视。', price: '¥98 起' },
        ],
      },
      {
        id: 'asset',
        label: '资产盘点',
        products: [
          { id: 'aap', name: 'AAP 资产平台', icon: 'inventory_2', desc: "Artink's Asset Platform，零售资产盘点与追踪一体化平台。", price: '方案询价', featured: true },
        ],
      },
    ],
  },
  {
    id: 'digital',
    label: '3C数码',
    groups: [
      {
        id: 'phone-case',
        label: 'AI 墨水屏手机壳',
        products: [
          { id: 'eink-phone-case', name: 'AI 墨水屏手机壳', icon: 'phone_iphone', desc: '可自定义图案与信息展示的 AI 墨水屏手机壳。', price: '¥299 起', featured: true },
        ],
      },
      {
        id: 'photo-frame',
        label: 'AI 电子纸艺术相框',
        products: [
          { id: 'eink-frame', name: 'AI 电子纸艺术相框', icon: 'photo_frame', desc: '电子纸艺术相框，支持 AI 生成内容与日程展示。', price: '¥899 起', featured: true },
        ],
      },
    ],
  },
]
