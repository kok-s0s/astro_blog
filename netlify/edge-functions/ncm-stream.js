// Stream NetEase Cloud Music audio through edge function.
// Sets Referer: music.163.com to bypass CDN hotlink protection.
// Reads NETEASE_COOKIE from Netlify environment variables.

const NCM_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://music.163.com/',
}

export default async function (request) {
  const id = new URL(request.url).searchParams.get('id')

  if (!id || !/^\d+$/.test(id)) {
    return new Response('invalid id', { status: 400 })
  }

  const cookie = Netlify.env.get('NETEASE_COOKIE')
  if (!cookie) {
    return new Response('NETEASE_COOKIE not configured', { status: 503 })
  }

  // Step 1: get signed CDN URL from NetEase API (server-side, with auth cookie)
  let cdnUrl
  try {
    const apiRes = await fetch(
      `https://music.163.com/api/song/enhance/player/url?id=${id}&ids=%5B${id}%5D&br=320000`,
      { headers: { ...NCM_HEADERS, Cookie: cookie } }
    )
    const data = await apiRes.json()
    cdnUrl = data?.data?.[0]?.url
  } catch (e) {
    return new Response('NCM API error: ' + e.message, { status: 502 })
  }

  if (!cdnUrl) {
    return new Response('song unavailable or region-locked', { status: 404 })
  }

  // Step 2: proxy audio from CDN with Referer: music.163.com
  // This satisfies CDN hotlink protection; the browser never sees the real CDN URL
  const proxyHeaders = { ...NCM_HEADERS }
  const range = request.headers.get('Range')
  if (range) proxyHeaders['Range'] = range

  const audioRes = await fetch(cdnUrl, { headers: proxyHeaders })

  const resHeaders = new Headers()
  resHeaders.set('Content-Type', audioRes.headers.get('Content-Type') ?? 'audio/mpeg')
  resHeaders.set('Accept-Ranges', 'bytes')
  resHeaders.set('Cache-Control', 'private, max-age=900')

  const contentLength = audioRes.headers.get('Content-Length')
  if (contentLength) resHeaders.set('Content-Length', contentLength)

  const contentRange = audioRes.headers.get('Content-Range')
  if (contentRange) resHeaders.set('Content-Range', contentRange)

  return new Response(audioRes.body, {
    status: audioRes.status,
    headers: resHeaders,
  })
}
