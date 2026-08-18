import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultSolutionsLibraryContent, validateSolutionsLibraryContent } from '../src/modules/pages/solutions-library-service.js'
import { defaultAgentsLibraryContent, validateAgentsLibraryContent } from '../src/modules/pages/agents-library-service.js'

test('solutions library seeds campus detail', () => {
  const content = validateSolutionsLibraryContent(defaultSolutionsLibraryContent())
  const campus = content.items.find((item) => item.id === 'campus')
  assert.ok(campus)
  assert.equal(campus.name, '智慧园区')
  assert.ok(campus.coreValues.length >= 3)
  assert.ok(campus.approach.length > 10)
})

test('agents library seeds space agent detail', () => {
  const content = validateAgentsLibraryContent(defaultAgentsLibraryContent())
  const space = content.items.find((item) => item.id === 'space')
  assert.ok(space)
  assert.equal(space.name, '空间服务智能体')
  assert.equal(space.workflow.length, 4)
  assert.equal(space.capabilities.length, 4)
})
