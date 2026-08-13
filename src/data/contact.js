/** 全站联系与品牌配置（勿散落硬编码电话/邮箱） */

export const BRAND = {
  zhName: '安托未来',
  enName: 'Atuo Future',
  domain: 'atuofuture',
  logoAlt: '安托未来',
  positioning:
    '安托未来是一家以AI智能体为大脑、以智能硬件为感知与执行终端，为楼宇、园区及各类空间提供开放、自治、可规模交付解决方案的物理AI空间智能服务商。',
}

export const CONTACT = {
  email: 'contact@atuofuture.com',
  /** 占位号码已停用，有正式号码后再填写 */
  phone: '',
  phoneDisplay: '',
  businessScope: '楼宇 / 园区 / 学校 / 酒店 / 公寓 / 商业资产',
}

export function contactMailto() {
  return CONTACT.email ? `mailto:${CONTACT.email}` : ''
}

export function contactTelHref() {
  if (!CONTACT.phone) return ''
  return `tel:${CONTACT.phone.replace(/\D/g, '')}`
}
