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

test('product library keeps custom categories and assigned items', () => {
  const content = validateProductLibraryContent({
    categories: [
      { id: 'control-interaction', name: '控制与交互', lineId: 'space' },
      { id: '', name: '毫米波雷达' },
    ],
    items: [{
      id: 'radar',
      slug: 'radar',
      name: '毫米波雷达',
      category: 'c-placeholder',
    }],
  })
  assert.equal(content.categories[0].name, '控制与交互')
  assert.equal(content.categories[1].name, '毫米波雷达')
  assert.ok(content.categories[1].id)
  const radarCat = content.categories.find((item) => item.name === '毫米波雷达')
  const assigned = validateProductLibraryContent({
    categories: content.categories,
    items: [{ id: 'radar', slug: 'radar', name: '毫米波雷达', category: radarCat.id }],
  })
  assert.equal(assigned.items[0].category, radarCat.id)
})
