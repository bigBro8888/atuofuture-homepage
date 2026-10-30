/**
 * 后台图片上传：统一走 /pages/media/image → OSS(WebP)
 * folder 对应桶内 website/{folder}/
 */
export function buildImageFormData(file, folder = 'media') {
  const formData = new FormData()
  formData.append('image', file)
  if (folder) formData.append('folder', folder)
  return formData
}

export async function uploadAdminImage(api, file, folder = 'media') {
  const { url } = await api('/pages/media/image', {
    method: 'POST',
    body: buildImageFormData(file, folder),
  })
  return url
}
