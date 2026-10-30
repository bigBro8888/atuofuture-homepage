import test from 'node:test'
import assert from 'node:assert/strict'
import { encodeImageAsWebp } from '../src/lib/image-webp.js'

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

test('encodes png buffer as webp', async () => {
  const result = await encodeImageAsWebp(PNG_1X1)
  assert.equal(result.mimeType, 'image/webp')
  assert.equal(result.extension, '.webp')
  assert.ok(result.buffer.length > 0)
  assert.equal(result.buffer[0], 0x52) // RIFF
  assert.equal(result.buffer[8], 0x57) // WEBP
})
