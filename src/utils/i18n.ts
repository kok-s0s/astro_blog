export type Lang = 'zh' | 'en'

export function localizedPath(path: string, lang: Lang) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (lang === 'zh') return normalized
  return normalized === '/' ? '/en/' : `/en${normalized}`
}

export function alternateLangPath(pathname: string) {
  const clean = pathname.replace(/\/$/, '') || '/'
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const path =
    base && base !== '/' && (clean === base || clean.startsWith(`${base}/`))
      ? clean.slice(base.length) || '/'
      : clean

  if (path === '/en') return '/'
  if (path.startsWith('/en/')) return path.replace(/^\/en/, '') || '/'
  return path === '/' ? '/en/' : `/en${path}`
}

