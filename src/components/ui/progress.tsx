import * as React from 'react'

import { cn } from '@/lib/utils'

function Progress ({
  className,
  value = 0,
  ...props
}: React.ComponentProps<'div'> & { value?: number }) {
  const clamped = Math.min(100, Math.max(0, value ?? 0))

  return (
    <div
      data-slot='progress'
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <div
        data-slot='progress-indicator'
        className='h-full bg-primary transition-[width] duration-200 ease-out'
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export { Progress }
