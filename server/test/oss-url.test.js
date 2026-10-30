import test from 'node:test'
import assert from 'node:assert/strict'
import { config } from '../src/config.js'
import { normalizeOssPrefix, publicUrlForObject } from '../src/lib/oss.js'

test('normalizes OSS prefix with trailing slash', () => {
  assert.equal(normalizeOssPrefix('website'), 'website/')
  assert.equal(normalizeOssPrefix('website/'), 'website/')
  assert.equal(normalizeOssPrefix('/meeting'), 'meeting/')
  assert.equal(normalizeOssPrefix(''), 'website/')
})

test('builds virtual-hosted public URL from endpoint', () => {
  const prev = { ...config.oss }
  config.oss.bucket = 'atuofuture'
  config.oss.region = 'oss-cn-shanghai'
  config.oss.endpoint = 'https://oss-cn-shanghai.aliyuncs.com'
  config.oss.publicBaseUrl = ''
  config.oss.useHttps = true
  try {
    assert.equal(
      publicUrlForObject('website/news/demo.jpg'),
      'https://atuofuture.oss-cn-shanghai.aliyuncs.com/website/news/demo.jpg',
    )
  } finally {
    Object.assign(config.oss, prev)
  }
})

test('prefers custom public base URL when set', () => {
  const prev = { ...config.oss }
  config.oss.publicBaseUrl = 'https://cdn.example.com'
  try {
    assert.equal(publicUrlForObject('website/news/a.png'), 'https://cdn.example.com/website/news/a.png')
  } finally {
    Object.assign(config.oss, prev)
  }
})
