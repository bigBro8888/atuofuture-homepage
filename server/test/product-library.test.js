import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultProductLibraryContent, validateProductLibraryContent } from '../src/modules/pages/product-library-service.js'

test('product library seeds hardware catalog details', () => {
  const content = validateProductLibraryContent(defaultProductLibraryContent())
  const flagship = content.items.find((item) => item.id === 'control-screen')
  assert.ok(flagship)
  assert.equal(flagship.name, '中控屏')
  assert.equal(flagship.detailCtaLabel, '查看产品详情')
  assert.equal(flagship.solutionHref, '/solutions/')
  assert.ok(flagship.linkedHardwareIds.includes('control-screen'))
  assert.equal(flagship.story.hero.title, '空间智能中控屏')
  assert.equal(flagship.story.howItWorks.stages.length, 4)
})

test('product library keeps custom association and links', () => {
  const content = validateProductLibraryContent({
    items: [{
      id: 'custom-screen',
      slug: 'custom-screen',
      name: '定制中控',
      coverImage: '/images/hardware/control-screen.jpg',
      linkedHardwareIds: ['control-screen', 'desk-screen'],
      detailCtaLabel: '打开详情',
      solutionLabel: '看方案',
      solutionHref: '/solutions/?id=building',
      story: { hero: { title: '定制标题' } },
    }],
  })
  const item = content.items[0]
  assert.equal(item.slug, 'custom-screen')
  assert.deepEqual(item.linkedHardwareIds, ['control-screen', 'desk-screen'])
  assert.equal(item.detailCtaLabel, '打开详情')
  assert.equal(item.story.hero.title, '定制标题')
  assert.equal(item.story.howItWorks.stages.length, 4)
})
