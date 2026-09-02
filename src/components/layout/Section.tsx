import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Section ({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || actions) && (
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div className='min-w-0'>
            {title ? <h2 className='text-lg font-semibold tracking-tight'>{title}</h2> : null}
            {description ? <p className='mt-1 text-sm text-muted-foreground'>{description}</p> : null}
          </div>
          {actions ? <div className='flex flex-wrap gap-2'>{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  )
}

export function Surface ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('overflow-hidden rounded-lg border bg-background', className)}>{children}</div>
  )
}
