import test from 'node:test'
import assert from 'node:assert/strict'
import { detectPlatform } from '../../src/services/app-download-api.js'

test('detects Android and WeChat embedded browser', () => {
  const result = detectPlatform('Mozilla/5.0 (Linux; Android 14) MicroMessenger/8.0')
  assert.equal(result.name, 'android')
  assert.equal(result.isWechat, true)
})

test('detects iPhone and desktop browsers', () => {
  assert.equal(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)').name, 'ios')
  assert.equal(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)').name, 'desktop')
})

test('detects DingTalk on Android', () => {
  const result = detectPlatform('Mozilla/5.0 (Linux; Android 14) AliApp(DingTalk/7.6.10)')
  assert.equal(result.name, 'android')
  assert.equal(result.isDingTalk, true)
})

test('detects iPad desktop user agent through touch capability', () => {
  const result = detectPlatform('Mozilla/5.0 (Macintosh)', { platform: 'MacIntel', maxTouchPoints: 5 })
  assert.equal(result.name, 'ios')
})
