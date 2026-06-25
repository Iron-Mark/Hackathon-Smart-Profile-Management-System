import { Button } from '@/components/ui/button'
import {
  isDemoBackendEnabled,
  resetDemoBackendState
} from '@/client/demoBackend'
import {
  PUBLIC_DEMO_ACCOUNTS,
  type SeededDemoAccount
} from '@/lib/demoAuth'
import { Info, RotateCcw, ShieldCheck, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

const demoAccountIcon = {
  admin: ShieldCheck,
  faculty: UserRound
} as const

interface DemoAccessPanelProps {
  className?: string
  message?: string
  showSeedAccounts?: boolean
  onUseAccount?: (account: SeededDemoAccount) => void
  onReset?: () => void
}

export function DemoAccessPanel ({
  className = '',
  message = 'Public demo mode is active. Use a seeded account or register with any valid email address.',
  showSeedAccounts = true,
  onUseAccount,
  onReset
}: DemoAccessPanelProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (!isDemoBackendEnabled()) {
    return null
  }

  if (isDismissed) {
    return null
  }

  const handleReset = () => {
    window.sessionStorage.removeItem('smart-profile-demo-login-email')
    window.sessionStorage.removeItem('smart-profile-demo-reset-message')
    resetDemoBackendState()
    onReset?.()
  }

  const snackbar = (
    <section
      aria-label='Demo access'
      className={`fixed left-3 right-3 z-50 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border border-yellow-300/30 bg-zinc-950/95 p-4 text-sm text-yellow-50 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur sm:left-auto sm:right-4 sm:w-80 lg:w-full lg:max-w-sm ${className}`}
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className='flex flex-col gap-3'>
        <div className='flex items-start gap-3'>
          <Info className='mt-0.5 h-5 w-5 shrink-0 text-yellow-200' aria-hidden='true' />
          <div className='min-w-0 flex-1'>
            <p className='font-semibold text-yellow-200'>Demo mode</p>
            <p className='mt-1 text-xs leading-5 text-yellow-50/80' aria-live='polite'>{message}</p>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='-mr-2 -mt-2 min-h-11 min-w-11 shrink-0 text-yellow-100 hover:bg-yellow-300/10 hover:text-white'
            onClick={() => setIsDismissed(true)}
          >
            <X className='h-4 w-4' aria-hidden='true' />
            <span className='sr-only'>Dismiss demo information</span>
          </Button>
        </div>

        {showSeedAccounts && (
          <div className='grid gap-2 sm:grid-cols-2'>
            {PUBLIC_DEMO_ACCOUNTS.map(account => {
              const Icon = demoAccountIcon[account.role]
              return (
                <Button
                  key={account.email}
                  type='button'
                  variant='outline'
                  size='sm'
                  className='min-h-11 justify-start border-yellow-200/40 bg-black/20 text-left text-yellow-50 hover:bg-yellow-300/15'
                  onClick={() => onUseAccount?.(account)}
                >
                  <Icon className='mr-2 h-4 w-4 shrink-0' />
                  <span className='truncate'>{account.label}</span>
                </Button>
              )
            })}
          </div>
        )}

        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='min-h-11 justify-start px-0 text-yellow-100 hover:bg-transparent hover:text-white'
          onClick={handleReset}
        >
          <RotateCcw className='mr-2 h-4 w-4' />
          Reset demo data
        </Button>
      </div>
    </section>
  )

  if (typeof document === 'undefined') {
    return snackbar
  }

  return createPortal(snackbar, document.body)
}
