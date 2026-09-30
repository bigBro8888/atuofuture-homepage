import { randomUUID } from 'node:crypto'
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { exportJWK, generateKeyPair } from 'jose'
import { authConfig } from './config.js'

async function generateJwks() {
  const { privateKey } = await generateKeyPair('RS256', { modulusLength: 2048, extractable: true })
  const key = await exportJWK(privateKey)
  return { keys: [{ ...key, alg: 'RS256', use: 'sig', kid: randomUUID() }] }
}

export async function loadJwks() {
  if (process.env.AUTH_JWKS_JSON) {
    const value = JSON.parse(process.env.AUTH_JWKS_JSON)
    if (!Array.isArray(value?.keys) || !value.keys.length) throw new Error('AUTH_JWKS_JSON 格式无效')
    return value
  }
  try {
    const value = JSON.parse(await readFile(authConfig.jwksFile, 'utf8'))
    if (!Array.isArray(value?.keys) || !value.keys.length) throw new Error('empty jwks')
    return value
  } catch {
    const value = await generateJwks()
    await mkdir(path.dirname(authConfig.jwksFile), { recursive: true })
    const temporary = `${authConfig.jwksFile}.tmp`
    await writeFile(temporary, JSON.stringify(value, null, 2), { encoding: 'utf8', mode: 0o600 })
    await rename(temporary, authConfig.jwksFile)
    await chmod(authConfig.jwksFile, 0o600).catch(() => {})
    return value
  }
}
