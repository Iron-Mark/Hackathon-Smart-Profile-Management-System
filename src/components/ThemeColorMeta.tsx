import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { DARK_THEME_COLOR, LIGHT_THEME_COLOR } from '@/lib/themeColors'

export function ThemeColorMeta () {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return

    meta.setAttribute(
      'content',
      resolvedTheme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR
    )
  }, [resolvedTheme])

  return null
}
