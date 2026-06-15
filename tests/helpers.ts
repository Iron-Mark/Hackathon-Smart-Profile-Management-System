export function appRoute (path: string) {
  const explicitBasePath = process.env.PLAYWRIGHT_BASE_PATH?.trim()
  const inferredBasePath = (() => {
    if (explicitBasePath !== undefined) return explicitBasePath
    if (!process.env.PLAYWRIGHT_BASE_URL) return ''

    try {
      return new URL(process.env.PLAYWRIGHT_BASE_URL).pathname
    } catch {
      return ''
    }
  })()
  const normalizedBase =
    inferredBasePath && inferredBasePath !== '/'
      ? `/${inferredBasePath.replace(/^\/+|\/+$/g, '')}`
      : ''
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${normalizedBase}${normalizedPath}`
}

function escapeRegExp (value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function appRoutePattern (path: string) {
  const [pathname, query] = path.split('?')
  const normalizedPathname = pathname.replace(/\/+$/, '')
  const escapedPathname = escapeRegExp(normalizedPathname)
  const escapedQuery = query ? `\\?${escapeRegExp(query)}` : ''

  return new RegExp(`${escapedPathname}/?${escapedQuery}$`)
}
