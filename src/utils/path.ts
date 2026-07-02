export function withBase(path = '/') {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('#')) {
    return path
  }

  const rawBase = import.meta.env.BASE_URL || '/'
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

  if (path === '/') {
    return base
  }

  return `${base}${path.replace(/^\//, '')}`
}
