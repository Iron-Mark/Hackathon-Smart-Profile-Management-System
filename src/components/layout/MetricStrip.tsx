import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type MetricTone = 'default' | 'success' | 'warning' | 'info' | 'destructive'

const toneClass: Record<MetricTone, string> = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  destructive: 'text-destructive',
}

export interface MetricItem {
  label: string
  value: ReactNode
  hint?: string
  icon?: LucideIcon
  tone?: MetricTone
}

export function MetricStrip ({ items, className }: { items: MetricItem[]; className?: string }) {
  const columns =
    items.length === 2
      ? 'grid-cols-2'
      : items.length === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-2 md:grid-cols-4'

  return (
    <div className={cn('grid overflow-hidden rounded-lg border border-border bg-border', columns, className)}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className='bg-background px-4 py-4'>
            <p className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
              {Icon ? <Icon className='h-3.5 w-3.5' /> : null}
              {item.label}
            </p>
            <p className={cn('mt-1 text-2xl font-semibold tabular-nums', toneClass[item.tone ?? 'default'])}>
              {item.value}
            </p>
            {item.hint ? <p className='mt-1 text-xs text-muted-foreground'>{item.hint}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
