import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const toneClass = {
  default: 'border-border bg-muted/40 text-foreground',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-info/30 bg-info/10 text-info',
  success: 'border-success/30 bg-success/10 text-success',
}

export function Notice ({
  children,
  icon: Icon,
  tone = 'default',
  title,
  description,
  className,
}: {
  children?: ReactNode
  icon?: LucideIcon
  tone?: keyof typeof toneClass
  title?: ReactNode
  description?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start gap-3 rounded-md border px-3 py-2.5 text-sm', toneClass[tone], className)}>
      {Icon ? <Icon className='mt-0.5 h-4 w-4 shrink-0' /> : null}
      <div className='min-w-0 leading-6'>
        {title ? <p className='font-medium'>{title}</p> : null}
        {description ? <p className={title ? 'mt-0.5 opacity-90' : undefined}>{description}</p> : null}
        {children}
      </div>
    </div>
  )
}
