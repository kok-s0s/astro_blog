// Proxy NetEase Cloud Music song URL with VIP authentication.
// Reads NETEASE_COOKIE from Netlify environment variables.
// Forwards the real client IP so NCM signs the CDN URL for the user's IP,
// allowing the browser to fetch it directly without IP mismatch.
export const handler = async function (event) {
  const id = (event.queryStringParameters || {}).id
  if (!id || !/^\d+$/.test(id)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'invalid id' }),
    }
  }

  let cookie = process.env.NETEASE_COOKIE || ''
  if (!cookie) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'NETEASE_COOKIE not configured' }),
    }
  }
  // 兼容用户只存 hex 值（不含 MUSIC_U= 前缀）的情况
  if (!cookie.startsWith('MUSIC_U=') && !cookie.includes('=')) {
    cookie = 'MUSIC_U=' + cookie
  }

  // 获取用户真实 IP，转发给 NCM API，让签名与浏览器实际 IP 一致
  const clientIp =
    (event.headers['x-nf-client-connection-ip'] ||
     event.headers['x-forwarded-for'] ||
     '').split(',')[0].trim()

  try {
    const apiUrl =
      `https://music.163.com/api/song/enhance/player/url` +
      `?id=${id}&ids=%5B${id}%5D&br=320000`

    const apiHeaders = {
      Cookie: cookie,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://music.163.com/',
    }
    if (clientIp) {
      apiHeaders['X-Forwarded-For'] = clientIp
      apiHeaders['X-Real-IP'] = clientIp
    }

    const res = await fetch(apiUrl, { headers: apiHeaders })

    const data = await res.json()
    const url = data?.data?.[0]?.url?.replace(/^http:\/\//, 'https://')

    if (!url) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'song URL unavailable' }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=900',
      },
      body: JSON.stringify({ url }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    }
  }
}
