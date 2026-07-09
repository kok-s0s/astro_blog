export function withBase(path = '/') {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('#')) {
    return path
  }

  const rawBase = import.meta.env.BASE_URL || '/'
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
  const baseWithoutTrailingSlash = base.replace(/\/$/, '')

  if (path === '/') {
    return base
  }

  if (baseWithoutTrailingSlash && baseWithoutTrailingSlash !== '/' && (path === baseWithoutTrailingSlash || path.startsWith(base))) {
    return path
  }

  return `${base}${path.replace(/^\//, '')}`
}
