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
