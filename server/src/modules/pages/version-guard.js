/** 草稿乐观锁：expectedUpdatedAt 与当前不一致则 409 */

export function assertExpectedUpdatedAt(page, expectedUpdatedAt) {
  if (expectedUpdatedAt == null || expectedUpdatedAt === '') return
  const current = String(page?.updatedAt || '')
  if (!current) return
  if (current !== String(expectedUpdatedAt)) {
    const error = new Error('内容已被其他人更新，请刷新后再保存或发布')
    error.status = 409
    error.code = 'version_conflict'
    throw error
  }
}

export function conflictResponse(response, error) {
  const status = Number(error?.status || 500)
  response.status(status).json({
    error: error?.code || (status === 409 ? 'version_conflict' : 'service_error'),
    message: error?.message || '操作失败',
    updatedAt: error?.updatedAt || undefined,
  })
}
