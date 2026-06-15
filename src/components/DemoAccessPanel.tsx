import { Button } from '@/components/ui/button'
import {
  isDemoBackendEnabled,
  resetDemoBackendState
} from '@/client/demoBackend'
import { RotateCcw, ShieldCheck, UserRound } from 'lucide-react'

const demoAccounts = [
  {
    label: 'Faculty demo',
    email: 'faculty@umak.edu.ph',
    password: 'Faculty123',
    icon: UserRound
  },
  {
    label: 'Admin demo',
    email: 'admin@umak.edu.ph',
    password: 'Admin123',
    icon: ShieldCheck
  }
]

interface DemoAccessPanelProps {
  className?: string
  message?: string
  showSeedAccounts?: boolean
  onUseAccount?: (account: { email: string; password: string }) => void
  onReset?: () => void
}

export function DemoAccessPanel ({
  className = '',
  message = 'Public demo mode is active. Use a seeded account or register with any valid email address.',
  showSeedAccounts = true,
  onUseAccount,
  onReset
}: DemoAccessPanelProps) {
  if (!isDemoBackendEnabled()) {
    return null
  }

  const handleReset = () => {
    resetDemoBackendState()
    onReset?.()
  }

  return (
    <section
      aria-label='Demo access'
      className={`rounded-lg border border-yellow-300/30 bg-yellow-300/10 p-4 text-sm text-yellow-50 ${className}`}
    >
      <div className='flex flex-col gap-3'>
        <div>
          <p className='font-semibold text-yellow-200'>Demo access</p>
          <p className='mt-1 text-xs leading-5 text-yellow-50/80'>{message}</p>
        </div>

        {showSeedAccounts && (
          <div className='grid gap-2 sm:grid-cols-2'>
            {demoAccounts.map(account => {
              const Icon = account.icon
              return (
                <Button
                  key={account.email}
                  type='button'
                  variant='outline'
                  size='sm'
                  className='justify-start border-yellow-200/40 bg-black/20 text-left text-yellow-50 hover:bg-yellow-300/15'
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
          className='justify-start px-0 text-yellow-100 hover:bg-transparent hover:text-white'
          onClick={handleReset}
        >
          <RotateCcw className='mr-2 h-4 w-4' />
          Reset demo data
        </Button>
      </div>
    </section>
  )
}
