// Proxy NetEase Cloud Music song URL with VIP authentication.
// Reads NETEASE_COOKIE from Netlify environment variables.
exports.handler = async function (event) {
  const id = (event.queryStringParameters || {}).id
  if (!id || !/^\d+$/.test(id)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'invalid id' }),
    }
  }

  const cookie = process.env.NETEASE_COOKIE
  if (!cookie) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'NETEASE_COOKIE not configured' }),
    }
  }

  try {
    const apiUrl =
      `https://music.163.com/api/song/enhance/player/url` +
      `?id=${id}&ids=%5B${id}%5D&br=320000`

    const res = await fetch(apiUrl, {
      headers: {
        Cookie: cookie,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://music.163.com/',
      },
    })

    const data = await res.json()
    const url = data?.data?.[0]?.url

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
        // Signed CDN URLs expire ~20 min; don't cache too long
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
