/** 智能体能力详情数据 —— 供 agents/detail 页面按 id 渲染 */
export const AGENT_DETAILS = {
  reception: {
    name: '会务接待智能体',
    icon: 'meeting_room',
    accent: '0, 82, 209',
    eyebrow: 'Reception Agent',
    tagline: '全自动化预约、身份核验、引导及会后资源释放，让行政接待效率提升 40%。',
    overview:
      '会务接待智能体贯穿访客从预约、到访、引导到离场的全流程，自动完成身份核验、会议室调度、环境联动与会后资源回收，把行政人员从繁琐的接待事务中解放出来，专注于更高价值的服务体验。',
    capabilities: [
      { icon: 'badge', title: '智慧导航与迎宾', desc: '访客扫码/刷脸即可获取路线导航，屏幕联动个性化欢迎信息。' },
      { icon: 'event_available', title: '会议室智能调度', desc: '自动检测冲突、智能推荐空闲会议室，并联动灯光空调预启动。' },
      { icon: 'verified_user', title: '访客身份核验', desc: '对接白名单与证件识别，实现无接触快速通行与安全留痕。' },
      { icon: 'recycling', title: '会后资源释放', desc: '会议结束自动关闭设备、释放工位与能耗，避免资源空耗。' },
    ],
    workflow: [
      { title: '预约感知', desc: '接收线上预约与临时到访请求，统一进入调度队列。' },
      { title: '身份研判', desc: '核验访客身份与权限，自动分配通行区域。' },
      { title: '引导执行', desc: '导航、迎宾屏、门禁与环境设备联动响应。' },
      { title: '会后优化', desc: '统计使用数据，回收资源并优化后续调度策略。' },
    ],
    metrics: [
      { value: '40%', label: '行政效率提升' },
      { value: '<30s', label: '访客通行耗时' },
      { value: '99%', label: '预约自动化率' },
    ],
    scenarios: ['集团总部大堂', '政务办事大厅', '产业园区访客中心', '高端商务会所'],
  },
  security: {
    name: '安防风险智能体',
    icon: 'security',
    accent: '0, 150, 136',
    eyebrow: 'Security Agent',
    tagline: '基于视觉 AI 的多模态异常检测，实现从「事后回溯」到「事前预警」。',
    overview:
      '安防风险智能体融合视频、门禁与传感数据，持续学习空间内的正常行为模式，对异常人群、越界闯入、遗留物品等风险实时研判并主动预警，构建覆盖周界到核心区域的立体防护网络。',
    capabilities: [
      { icon: 'directions_run', title: '异常行为识别', desc: '识别徘徊、聚集、摔倒、攀爬等异常行为并分级告警。' },
      { icon: 'fence', title: '周界越界预警', desc: '电子围栏实时检测越界闯入，秒级触发联动响应。' },
      { icon: 'groups', title: '人群态势分析', desc: '监测密度与流向，预防拥挤踩踏等公共安全风险。' },
      { icon: 'history', title: '事件回溯检索', desc: '按人/车/事件多维标签快速检索历史片段。' },
    ],
    workflow: [
      { title: '多源感知', desc: '汇聚摄像头、门禁、雷达等多模态数据。' },
      { title: '风险研判', desc: 'AI 模型比对行为基线，识别潜在威胁。' },
      { title: '主动处置', desc: '联动声光警戒、门禁封控与安保派单。' },
      { title: '复盘增强', desc: '沉淀事件样本，持续优化识别准确率。' },
    ],
    metrics: [
      { value: '≥98%', label: '异常识别准确率' },
      { value: '<2s', label: '告警响应时延' },
      { value: '24h', label: '全天候值守' },
    ],
    scenarios: ['企业总部安防', '园区周界防护', '商业综合体', '重点公共场所'],
  },
  fire: {
    name: '消防预防智能体',
    icon: 'local_fire_department',
    accent: '214, 82, 36',
    eyebrow: 'Fire Safety Agent',
    tagline: '联动烟感、温感与视觉监控，全天候守护空间消防安全生命线。',
    overview:
      '消防预防智能体将传统被动报警升级为主动预防，通过视觉烟火检测与多传感融合提前发现火情隐患，同时持续监测疏散通道占用情况，确保关键时刻生命通道畅通。',
    capabilities: [
      { icon: 'sensor_occupied', title: '烟火视觉检测', desc: '毫秒级识别明火与烟雾，弥补传统烟感滞后。' },
      { icon: 'door_sliding', title: '疏散通道监测', desc: '实时检测消防通道堵塞、占用并自动劝阻。' },
      { icon: 'device_thermostat', title: '温感联动预警', desc: '融合温度异常曲线，提前预判电气火灾风险。' },
      { icon: 'campaign', title: '应急联动广播', desc: '火情触发时联动广播、门禁与应急照明疏散。' },
    ],
    workflow: [
      { title: '隐患感知', desc: '视觉与传感协同监测火情与通道状态。' },
      { title: '风险判定', desc: '综合多源信号研判火情等级与位置。' },
      { title: '应急执行', desc: '联动报警、疏散引导与消防系统。' },
      { title: '预案优化', desc: '演练复盘持续完善应急处置预案。' },
    ],
    metrics: [
      { value: '<3s', label: '烟火检出时延' },
      { value: '360°', label: '空间覆盖监测' },
      { value: '0', label: '通道占用漏检目标' },
    ],
    scenarios: ['地下车库', '仓储物流中心', '商业综合体', '数据机房'],
  },
  asset: {
    name: '资产管理智能体',
    icon: 'inventory_2',
    accent: '99, 91, 214',
    eyebrow: 'Asset Agent',
    tagline: '基于 RFID 与空间视觉定位，实现大宗及精密资产的全流程可溯化。',
    overview:
      '资产管理智能体为高价值设备与流动资产建立数字档案，结合 RFID 与视觉定位实现自动盘点与实时追踪，异常离场即时告警，让资产从入库到报废全生命周期清晰可查。',
    capabilities: [
      { icon: 'barcode_reader', title: '资产自动盘点', desc: '无需人工逐件清点，分钟级完成区域全盘。' },
      { icon: 'my_location', title: '实时定位追踪', desc: '空间视觉+RFID 精准定位资产位置。' },
      { icon: 'logout', title: '异常离场告警', desc: '未授权移动或离场即时预警并锁定轨迹。' },
      { icon: 'fact_check', title: '全寿命电子建档', desc: '记录采购、使用、维保到报废全流程数据。' },
    ],
    workflow: [
      { title: '标签感知', desc: 'RFID 与视觉持续采集资产位置状态。' },
      { title: '状态研判', desc: '比对台账识别异常移动与缺失。' },
      { title: '预警执行', desc: '触发告警、锁定并通知责任人。' },
      { title: '数据优化', desc: '沉淀资产画像优化盘点与调拨策略。' },
    ],
    metrics: [
      { value: '99.5%', label: '盘点准确率' },
      { value: '90%', label: '盘点工时节省' },
      { value: '实时', label: '异常离场定位' },
    ],
    scenarios: ['实验室精密仪器', '医院医疗设备', '数据中心资产', '办公固定资产'],
  },
  space: {
    name: '空间运营智能体',
    icon: 'space_dashboard',
    accent: '0, 130, 200',
    eyebrow: 'Space Ops Agent',
    tagline: '热力图分析与工位、场馆动态匹配，优化坪效与使用者体验。',
    overview:
      '空间运营智能体基于人流热力与使用数据洞察空间负载，动态匹配工位、会议与场馆资源，在提升坪效的同时主动调节环境舒适度，让每一平方米都物尽其用。',
    capabilities: [
      { icon: 'insights', title: '空间负载预测', desc: '预测各区域使用高峰，提前调配资源。' },
      { icon: 'thermostat_auto', title: '环境自适应调控', desc: '按人流与时段自动调节温湿度与照明。' },
      { icon: 'chair', title: '工位动态匹配', desc: '灵活工位智能分配，提升共享空间利用率。' },
      { icon: 'query_stats', title: '坪效数据洞察', desc: '可视化空间效率，辅助运营决策。' },
    ],
    workflow: [
      { title: '流量感知', desc: '采集人流热力与设施使用数据。' },
      { title: '负载研判', desc: '识别空间冷热点与资源错配。' },
      { title: '调度执行', desc: '动态分配工位、场馆与环境策略。' },
      { title: '坪效优化', desc: '基于反馈持续优化空间规划。' },
    ],
    metrics: [
      { value: '25%', label: '坪效提升' },
      { value: '30%', label: '闲置资源下降' },
      { value: '实时', label: '环境自调控' },
    ],
    scenarios: ['共享办公空间', '企业总部楼宇', '会展场馆', '图书馆与园区'],
  },
  energy: {
    name: '能源能耗智能体',
    icon: 'bolt',
    accent: '214, 131, 36',
    eyebrow: 'Energy Agent',
    tagline: '精准预测能耗曲线，通过「人走灯灭、按需制冷」实现碳中和目标。',
    overview:
      '能源能耗智能体对建筑用能进行分项计量与预测，结合人流、时段与环境自动优化用能策略，在保障舒适度的前提下持续降低能耗成本，助力空间迈向绿色低碳运营。',
    capabilities: [
      { icon: 'monitoring', title: '能耗异常监测', desc: '识别异常用电波动，定位跑冒滴漏。' },
      { icon: 'eco', title: '节电策略优化', desc: '按需制冷照明，动态压降无效能耗。' },
      { icon: 'stacked_line_chart', title: '能耗曲线预测', desc: '预测负载峰谷，优化能源调度。' },
      { icon: 'co2', title: '碳排放核算', desc: '自动核算碳排数据，支撑双碳目标。' },
    ],
    workflow: [
      { title: '用能感知', desc: '分项计量采集全域能耗数据。' },
      { title: '效率研判', desc: '识别高耗环节与优化空间。' },
      { title: '策略执行', desc: '联动设备执行节能控制指令。' },
      { title: '持续优化', desc: '基于成效反馈迭代节能模型。' },
    ],
    metrics: [
      { value: '25%', label: '综合能耗下降' },
      { value: '实时', label: '异常波动预警' },
      { value: '双碳', label: '碳排核算支撑' },
    ],
    scenarios: ['智慧总部大楼', '产业园区', '星级酒店', '商业综合体'],
  },
  leasing: {
    name: '招商运营智能体',
    icon: 'storefront',
    accent: '0, 150, 136',
    eyebrow: 'Leasing Agent',
    tagline: '客户画像分析与租赁合约自动化，助力商业地产数字化转型。',
    overview:
      '招商运营智能体整合客流、消费与租户经营数据，科学分析业态配比与招商转化，辅助运营方精准招商、优化组合，并实现租赁合约与账单的自动化管理。',
    capabilities: [
      { icon: 'pie_chart', title: '业态占比分析', desc: '洞察业态结构与坪效贡献，优化招商组合。' },
      { icon: 'filter_alt', title: '转化漏斗预测', desc: '预测招商转化路径，提升成交效率。' },
      { icon: 'contract', title: '合约自动化', desc: '租赁合约、账单与到期提醒全流程线上化。' },
      { icon: 'person_search', title: '客户画像洞察', desc: '刻画消费人群画像，指导精准招商。' },
    ],
    workflow: [
      { title: '数据感知', desc: '汇聚客流、消费与租户经营数据。' },
      { title: '价值研判', desc: '分析业态贡献与招商机会点。' },
      { title: '招商执行', desc: '推进意向跟进与合约签订。' },
      { title: '运营优化', desc: '基于经营反馈优化业态组合。' },
    ],
    metrics: [
      { value: '20%', label: '招商转化提升' },
      { value: '自动', label: '合约账单管理' },
      { value: '多维', label: '客户画像分析' },
    ],
    scenarios: ['购物中心', '商业街区', '产业孵化园', '文旅商业体'],
  },
  coldchain: {
    name: '零售冷链智能体',
    icon: 'ac_unit',
    accent: '0, 130, 200',
    eyebrow: 'Cold Chain Agent',
    tagline: '全链条温控监控与预警，确保食品与高精物料的品质安全。',
    overview:
      '零售冷链智能体对冷藏冷冻全链条进行温湿度实时监控，瞬时温升即时告警，并结合设备工况预测维护需求，保障食品药品与高价值物料在全程中的品质与合规。',
    capabilities: [
      { icon: 'thermostat', title: '瞬时温升告警', desc: '实时监测温湿度，异常瞬间即时预警。' },
      { icon: 'build_circle', title: '设备工况预测', desc: '预测制冷设备寿命与故障风险。' },
      { icon: 'route', title: '全链路追溯', desc: '记录从仓储到配送的全程温控数据。' },
      { icon: 'verified', title: '合规品质保障', desc: '生成温控合规报告，满足监管要求。' },
    ],
    workflow: [
      { title: '温控感知', desc: '全链条采集温湿度与设备数据。' },
      { title: '风险研判', desc: '识别温度异常与设备隐患。' },
      { title: '告警执行', desc: '即时通知并联动应急处置。' },
      { title: '品质优化', desc: '沉淀数据优化冷链运营策略。' },
    ],
    metrics: [
      { value: '<1min', label: '温升告警时延' },
      { value: '全程', label: '温控可追溯' },
      { value: '预测', label: '设备寿命管理' },
    ],
    scenarios: ['生鲜零售门店', '医药冷库', '冷链物流仓储', '中央厨房'],
  },
}

export const AGENT_ORDER = [
  'reception',
  'security',
  'fire',
  'asset',
  'space',
  'energy',
  'leasing',
  'coldchain',
]
