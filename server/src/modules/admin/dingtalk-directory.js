import { randomUUID } from 'node:crypto'
import { config } from '../../config.js'
import { db, save } from '../../lib/store.js'

const ROOT_DEPT_ID = 1
const DEFAULT_ROLE = 'editor'
let cachedToken = { value: '', expiresAt: 0 }

export function isDingtalkUser(user) {
  return Boolean(user?.provider === 'dingtalk' || user?.authSub || user?.dingtalkUnionId)
}

async function accessToken() {
  if (cachedToken.value && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
  const { clientId, clientSecret } = config.dingtalk
  if (!clientId || !clientSecret) throw new Error('未配置钉钉应用凭证')
  const response = await fetch('https://api.dingtalk.com/v1.0/oauth2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appKey: clientId, appSecret: clientSecret }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.accessToken) throw new Error(data.message || '获取钉钉访问凭证失败')
  cachedToken = { value: data.accessToken, expiresAt: Date.now() + Number(data.expireIn || 7200) * 1000 }
  return cachedToken.value
}

async function topapi(path, body) {
  const token = await accessToken()
  const response = await fetch(`https://oapi.dingtalk.com${path}?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (data.errcode !== 0) {
    const error = new Error(data.errmsg || `钉钉接口调用失败（${path}）`)
    error.code = data.errcode
    throw error
  }
  return data.result
}

async function listDepartments() {
  const departments = new Map([[ROOT_DEPT_ID, { id: ROOT_DEPT_ID, name: '', parentId: 0 }]])
  const queue = [ROOT_DEPT_ID]
  while (queue.length) {
    const parentId = queue.shift()
    const children = await topapi('/topapi/v2/department/listsub', { dept_id: parentId, language: 'zh_CN' }) || []
    for (const child of children) {
      if (departments.has(child.dept_id)) continue
      departments.set(child.dept_id, { id: child.dept_id, name: child.name, parentId: child.parent_id })
      queue.push(child.dept_id)
    }
  }
  return departments
}

async function listMembers(deptId) {
  const members = []
  let cursor = 0
  for (;;) {
    const result = await topapi('/topapi/v2/user/list', { dept_id: deptId, cursor, size: 100, language: 'zh_CN' })
    members.push(...(result?.list || []))
    if (!result?.has_more) break
    cursor = result.next_cursor
  }
  return members
}

/** 按组织架构同步员工：新员工以默认角色启用；离职员工停用并保留记录。 */
export async function syncDingtalkDirectory(operator) {
  const departments = await listDepartments()
  const employees = new Map()
  for (const dept of departments.values()) {
    for (const member of await listMembers(dept.id)) {
      if (!member.userid || !member.unionid) continue
      const current = employees.get(member.userid) || { ...member, deptIds: new Set() }
      ;(member.dept_id_list || [dept.id]).forEach((id) => current.deptIds.add(id))
      employees.set(member.userid, current)
    }
  }

  const now = new Date().toISOString()
  const users = db().adminUsers
  const seen = new Set()
  const summary = { total: employees.size, created: 0, updated: 0, disabled: 0, reactivated: 0 }

  for (const employee of employees.values()) {
    const departmentNames = [...employee.deptIds]
      .map((id) => departments.get(id)?.name)
      .filter(Boolean)
    let user = users.find((item) => item.dingtalkUnionId === employee.unionid)
      || users.find((item) => item.dingtalkUserId === employee.userid)
    if (!user) {
      user = {
        id: randomUUID(),
        email: '',
        name: String(employee.name || '钉钉用户').slice(0, 80),
        provider: 'dingtalk',
        role: DEFAULT_ROLE,
        enabled: true,
        source: 'dingtalk_sync',
        createdAt: now,
        authorizedAt: now,
        authorizedBy: operator?.id || 'system',
      }
      users.push(user)
      summary.created += 1
    } else {
      summary.updated += 1
      if (!user.role) {
        user.role = DEFAULT_ROLE
        user.enabled = true
        user.authorizedAt = now
        user.authorizedBy = operator?.id || 'system'
      }
      if (user.disabledReason === 'left') {
        user.enabled = true
        summary.reactivated += 1
      }
    }
    user.provider = 'dingtalk'
    user.name = String(employee.name || user.name).slice(0, 80)
    user.dingtalkUserId = employee.userid
    user.dingtalkUnionId = employee.unionid
    user.avatarUrl = employee.avatar || user.avatarUrl || ''
    user.title = employee.title || ''
    user.departments = departmentNames
    user.syncedAt = now
    delete user.leftAt
    delete user.disabledReason
    seen.add(user.id)
  }

  const enabledSupers = () => users.filter((item) => item.role === 'super_admin' && item.enabled).length
  for (const user of users) {
    if (seen.has(user.id) || !user.dingtalkUnionId || user.disabledReason === 'left') continue
    if (user.role === 'super_admin' && user.enabled && enabledSupers() <= 1) continue
    user.enabled = false
    user.disabledReason = 'left'
    user.leftAt = now
    summary.disabled += 1
  }

  db().dingtalkSync = { syncedAt: now, operatorId: operator?.id || 'system', ...summary }
  await save()
  return summary
}
