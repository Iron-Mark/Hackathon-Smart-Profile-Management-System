import type { ReactNode } from 'react'

export function PageHeader ({
  kicker,
  title,
  description,
  actions,
}: {
  kicker?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
      <div className='min-w-0 space-y-1'>
        {kicker ? <p className='text-sm font-medium text-muted-foreground'>{kicker}</p> : null}
        <h1 className='text-3xl font-semibold tracking-tight text-foreground'>{title}</h1>
        {description ? (
          <div className='max-w-2xl text-sm leading-6 text-muted-foreground'>{description}</div>
        ) : null}
      </div>
      {actions ? <div className='flex flex-wrap items-center gap-2 print:hidden'>{actions}</div> : null}
    </header>
  )
}
