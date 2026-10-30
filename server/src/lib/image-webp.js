import sharp from 'sharp'

/**
 * 将上传/转存图片统一编码为 WebP，减小体积。
 * GIF 动画会尽量保留为 animated WebP；失败则退回静态首帧。
 */
export async function encodeImageAsWebp(buffer, { quality = 80 } = {}) {
  if (!buffer?.length) {
    const error = new Error('图片内容为空')
    error.status = 400
    throw error
  }

  try {
    const pipeline = sharp(buffer, { animated: true, failOn: 'none', limitInputPixels: 80_000_000 })
    const meta = await pipeline.metadata()
    if (!meta.format && !meta.width) {
      const error = new Error('无法识别的图片格式')
      error.status = 400
      throw error
    }

    let output
    try {
      output = await sharp(buffer, { animated: true, failOn: 'none', limitInputPixels: 80_000_000 })
        .rotate()
        .webp({ quality, effort: 4, alphaQuality: quality })
        .toBuffer({ resolveWithObject: true })
    } catch {
      // 部分动图编码失败时，退回静态 WebP
      output = await sharp(buffer, { failOn: 'none', limitInputPixels: 80_000_000 })
        .rotate()
        .webp({ quality, effort: 4, alphaQuality: quality })
        .toBuffer({ resolveWithObject: true })
    }

    return {
      buffer: output.data,
      mimeType: 'image/webp',
      extension: '.webp',
      width: output.info.width,
      height: output.info.height,
      bytesIn: buffer.length,
      bytesOut: output.data.length,
    }
  } catch (error) {
    if (error.status) throw error
    const next = new Error(`图片转 WebP 失败：${error.message || '未知错误'}`)
    next.status = 400
    throw next
  }
}
