import test from 'node:test'
import assert from 'node:assert/strict'
import { apkUrlFor, validateVersion } from '../src/modules/apps/version-service.js'

test('accepts the agreed three-part Android version', () => {
  assert.equal(validateVersion(' 1.0.25\r\n'), '1.0.25')
})

test('builds APK URL from the authoritative version rule', () => {
  assert.equal(
    apkUrlFor('1.0.25'),
    'https://file.atuofuture.com/release/artink-1.0.25.apk',
  )
})

test('rejects values that could escape the release path', () => {
  for (const value of ['../1.0.25', '1.0', '1.0.25.apk', 'https://example.com/a.apk', '']) {
    assert.throws(() => validateVersion(value))
  }
})
