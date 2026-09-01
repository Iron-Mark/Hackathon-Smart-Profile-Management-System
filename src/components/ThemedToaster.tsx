import type { ComponentProps } from 'react'
import { useTheme } from 'next-themes'
import { Toaster } from 'sonner'

export function ThemedToaster (props: ComponentProps<typeof Toaster>) {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      {...props}
    />
  )
}
