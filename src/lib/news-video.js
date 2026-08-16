/** 把后台填写的视频地址转成可播放的文件或嵌入页。 */
export function resolveNewsVideo(raw) {
  const url = String(raw || '').trim()
  if (!url) return null
  if (url.startsWith('/') && !url.startsWith('//')) return { kind: 'file', src: url }

  let parsed
  try {
    parsed = new URL(url.startsWith('//') ? `https:${url}` : url)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) return null

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
  const path = parsed.pathname

  const youtubeId = host === 'youtu.be'
    ? path.replace(/^\//, '').split('/')[0]
    : (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com')
      ? (parsed.searchParams.get('v') || path.match(/\/(?:embed|shorts)\/([^/?#]+)/)?.[1] || '')
      : ''
  if (youtubeId) {
    return { kind: 'embed', src: `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}` }
  }

  const bvid = path.match(/\/video\/(BV[\w]+)/i)?.[1] || parsed.searchParams.get('bvid') || ''
  if (host.endsWith('bilibili.com') && bvid) {
    return { kind: 'embed', src: `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&autoplay=0` }
  }

  const qqVid = parsed.searchParams.get('vid') || path.match(/\/([0-9a-z]{11})\.html/i)?.[1] || ''
  if ((host === 'v.qq.com' || host.endsWith('.qq.com')) && qqVid) {
    return { kind: 'embed', src: `https://v.qq.com/txp/iframe/player.html?vid=${encodeURIComponent(qqVid)}` }
  }

  if (/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(path) || url.startsWith('/api/public/uploads/videos/')) {
    return { kind: 'file', src: parsed.toString() }
  }

  return { kind: 'file', src: parsed.toString() }
}
