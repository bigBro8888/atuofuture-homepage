import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { authConfig } from './config.js'

let records = {}
let writeQueue = Promise.resolve()

function key(model, id) {
  return `${model}:${id}`
}

function live(record) {
  return record && (!record.expiresAt || record.expiresAt > Date.now())
}

async function persist() {
  await mkdir(path.dirname(authConfig.oidcDataFile), { recursive: true })
  const temporary = `${authConfig.oidcDataFile}.tmp`
  await writeFile(temporary, JSON.stringify(records), { encoding: 'utf8', mode: 0o600 })
  await rename(temporary, authConfig.oidcDataFile)
}

function save() {
  const job = writeQueue.catch(() => {}).then(persist)
  writeQueue = job.catch(() => {})
  return job
}

function prune() {
  let changed = false
  for (const [recordKey, record] of Object.entries(records)) {
    if (!live(record)) {
      delete records[recordKey]
      changed = true
    }
  }
  return changed
}

export async function initOidcAdapter() {
  try {
    records = JSON.parse(await readFile(authConfig.oidcDataFile, 'utf8'))
  } catch {
    records = {}
  }
  if (!records || Array.isArray(records) || typeof records !== 'object') records = {}
  prune()
  await persist()
}

export class JsonOidcAdapter {
  constructor(model) {
    this.model = model
  }

  async upsert(id, payload, expiresIn) {
    prune()
    records[key(this.model, id)] = {
      payload,
      expiresAt: Number.isFinite(expiresIn) ? Date.now() + (expiresIn * 1000) : null,
    }
    await save()
  }

  async find(id) {
    const recordKey = key(this.model, id)
    const record = records[recordKey]
    if (!live(record)) {
      if (record) {
        delete records[recordKey]
        await save()
      }
      return undefined
    }
    return structuredClone(record.payload)
  }

  async findByUid(uid) {
    return this.findByProperty('uid', uid)
  }

  async findByUserCode(userCode) {
    return this.findByProperty('userCode', userCode)
  }

  async findByProperty(property, value) {
    prune()
    for (const [recordKey, record] of Object.entries(records)) {
      if (recordKey.startsWith(`${this.model}:`) && live(record) && record.payload?.[property] === value) {
        return structuredClone(record.payload)
      }
    }
    return undefined
  }

  async consume(id) {
    const record = records[key(this.model, id)]
    if (live(record)) {
      record.payload.consumed = Math.floor(Date.now() / 1000)
      await save()
    }
  }

  async destroy(id) {
    delete records[key(this.model, id)]
    await save()
  }

  async revokeByGrantId(grantId) {
    for (const [recordKey, record] of Object.entries(records)) {
      if (record.payload?.grantId === grantId) {
        delete records[recordKey]
      }
    }
    await save()
  }
}
