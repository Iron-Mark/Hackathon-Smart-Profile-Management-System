import type { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function PageShell ({
  children,
  className,
  contentClassName,
  innerClassName,
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
  innerClassName?: string
}) {
  return (
    <SidebarProvider>
      <div className={cn('flex min-h-screen w-screen bg-background text-foreground', className)}>
        <AppSidebar className='hidden md:block print:hidden' />
        <div className='flex min-w-0 flex-1 flex-col overflow-auto'>
          <div className='flex items-center gap-2 border-b px-4 py-3 md:hidden print:hidden'>
            <SidebarTrigger />
            <span className='text-sm font-medium'>Smart Profile</span>
          </div>
          <main className={cn('flex-1 w-full', contentClassName)}>
            <div className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8', innerClassName)}>{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
