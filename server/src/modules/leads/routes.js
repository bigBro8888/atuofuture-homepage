import { Router } from 'express'
import { addAudit, addRecord, db, save } from '../../lib/store.js'
import { requireAuth } from '../admin/auth.js'

export const publicLeadsRouter = Router()
export const adminLeadsRouter = Router()

const submitAttempts = new Map()
const MAX_LEADS = 2000

function cleanText(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function rateLimited(ip) {
  const key = ip || 'unknown'
  const now = Date.now()
  const bucket = submitAttempts.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 }
  if (bucket.resetAt < now) {
    bucket.count = 0
    bucket.resetAt = now + 15 * 60 * 1000
  }
  if (bucket.count >= 12) {
    submitAttempts.set(key, bucket)
    return true
  }
  bucket.count += 1
  submitAttempts.set(key, bucket)
  return false
}

function presentLead(item) {
  return {
    id: item.id,
    name: item.name,
    contact: item.contact,
    requirement: item.requirement || '',
    source: item.source || 'demo',
    status: item.status === 'done' ? 'done' : 'new',
    pageUrl: item.pageUrl || '',
    createdAt: item.createdAt,
  }
}

publicLeadsRouter.post('/', async (request, response) => {
  if (rateLimited(request.ip)) {
    return response.status(429).json({ error: 'too_many_attempts', message: '提交过于频繁，请稍后再试' })
  }

  const name = cleanText(request.body?.name, 40)
  const contact = cleanText(request.body?.contact || request.body?.phone, 80)
  const requirement = cleanText(request.body?.requirement || request.body?.message, 2000)
  const source = cleanText(request.body?.source || 'demo', 40) || 'demo'
  const pageUrl = cleanText(request.body?.pageUrl, 300)

  if (!name || name.length < 1) {
    return response.status(400).json({ error: 'invalid_lead', message: '请填写姓名' })
  }
  if (!contact || contact.length < 5) {
    return response.status(400).json({ error: 'invalid_lead', message: '请填写有效联系方式' })
  }

  if (!Array.isArray(db().demoRequests)) db().demoRequests = []
  while (db().demoRequests.length >= MAX_LEADS) db().demoRequests.shift()

  const lead = await addRecord('demoRequests', {
    name,
    contact,
    requirement,
    source,
    pageUrl,
    status: 'new',
    userAgent: String(request.get('user-agent') || '').slice(0, 240),
    ip: String(request.ip || '').slice(0, 64),
  })

  response.status(201).json({ ok: true, id: lead.id })
})

adminLeadsRouter.get('/', requireAuth('stats:read'), (request, response) => {
  if (!Array.isArray(db().demoRequests)) db().demoRequests = []
  const status = String(request.query.status || 'all')
  const items = [...db().demoRequests]
    .filter((item) => {
      if (status === 'new') return item.status !== 'done'
      if (status === 'done') return item.status === 'done'
      return true
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(presentLead)

  response.json({
    items,
    total: db().demoRequests.length,
    unread: db().demoRequests.filter((item) => item.status !== 'done').length,
  })
})

adminLeadsRouter.patch('/:id', requireAuth('stats:read'), async (request, response) => {
  if (!Array.isArray(db().demoRequests)) db().demoRequests = []
  const lead = db().demoRequests.find((item) => item.id === request.params.id)
  if (!lead) return response.status(404).json({ error: 'not_found', message: '线索不存在' })

  const nextStatus = String(request.body?.status || '')
  if (nextStatus === 'done' || nextStatus === 'new') lead.status = nextStatus
  await save()
  await addAudit(request.admin, 'leads.update', lead.id, { status: lead.status })
  response.json({ item: presentLead(lead) })
})

adminLeadsRouter.delete('/:id', requireAuth('config:write'), async (request, response) => {
  if (!Array.isArray(db().demoRequests)) db().demoRequests = []
  const index = db().demoRequests.findIndex((item) => item.id === request.params.id)
  if (index < 0) return response.status(404).json({ error: 'not_found', message: '线索不存在' })
  const [removed] = db().demoRequests.splice(index, 1)
  await save()
  await addAudit(request.admin, 'leads.delete', removed.id, { name: removed.name })
  response.status(204).end()
})
