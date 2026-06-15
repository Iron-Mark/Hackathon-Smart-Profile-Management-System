import { useEffect, useState } from 'react';
import {
  OrganizationSwitcher,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { Building2, KeyRound, UserPlus } from 'lucide-react';
import { isClerkEnabled } from '@/client/clerkConfig';
import { getClerkDemoIdentity } from '@/client/clerkDemoIdentity';
import { syncClerkDemoUser } from '@/client/demoBackend';
import { Button } from '@/components/ui/button';

interface ClerkAuthPanelProps {
  mode: 'login' | 'register';
}

export function ClerkAuthPanel({ mode }: ClerkAuthPanelProps) {
  if (!isClerkEnabled) {
    return null;
  }

  return <EnabledClerkAuthPanel mode={mode} />;
}

function EnabledClerkAuthPanel({ mode }: ClerkAuthPanelProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [syncMessage, setSyncMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const identity = getClerkDemoIdentity(user);
    if (!identity) {
      setSyncMessage('Clerk sign-in succeeded, but no email address was available for the local demo profile.');
      return;
    }

    let cancelled = false;
    setSyncMessage('Preparing your browser-local faculty demo profile...');

    syncClerkDemoUser(identity).then(({ error }) => {
      if (cancelled) return;

      if (error) {
        setSyncMessage(error.message);
        return;
      }

      navigate('/faculty/dashboard', { replace: true });
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, navigate, user]);

  const primaryLabel = mode === 'login' ? 'Continue with Clerk' : 'Sign up with Clerk';

  return (
    <section
      aria-label='Clerk showcase authentication'
      className='rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-50'
    >
      <div className='space-y-3'>
        <div>
          <p className='font-semibold text-emerald-100'>Optional Clerk showcase auth</p>
          <p className='mt-1 text-xs leading-5 text-emerald-50/80'>
            Clerk can sign you in, then this demo creates a local faculty profile in your browser.
          </p>
        </div>

        <Show when='signed-out'>
          <div className='grid gap-2 sm:grid-cols-2'>
            <SignInButton mode='modal'>
              <Button
                type='button'
                variant={mode === 'login' ? 'default' : 'outline'}
                className='min-h-11 justify-start'
              >
                <KeyRound className='mr-2 h-4 w-4' />
                {primaryLabel}
              </Button>
            </SignInButton>
            <SignUpButton mode='modal'>
              <Button
                type='button'
                variant={mode === 'register' ? 'default' : 'outline'}
                className='min-h-11 justify-start'
              >
                <UserPlus className='mr-2 h-4 w-4' />
                Create Clerk user
              </Button>
            </SignUpButton>
          </div>
        </Show>

        <Show when='signed-in'>
          <div className='flex items-center justify-between gap-3 rounded-md border border-emerald-200/20 bg-black/20 p-3'>
            <p className='text-xs text-emerald-50/80' role='status'>
              {syncMessage || 'Clerk session active.'}
            </p>
            <UserButton />
          </div>
        </Show>
      </div>
    </section>
  );
}

export function ClerkShowcaseControls() {
  if (!isClerkEnabled) {
    return null;
  }

  return <EnabledClerkShowcaseControls />;
}

function EnabledClerkShowcaseControls() {
  return (
    <div className='space-y-3 rounded-md border border-sidebar-border/70 p-3 text-sm text-sidebar-foreground'>
      <Show when='signed-out'>
        <div className='grid gap-2'>
          <SignInButton mode='modal'>
            <button
              type='button'
              className='flex min-h-11 w-full items-center gap-2 rounded-md border border-sidebar-border px-3 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            >
              <KeyRound className='h-4 w-4' />
              <span>Sign in with Clerk</span>
            </button>
          </SignInButton>
          <SignUpButton mode='modal'>
            <button
              type='button'
              className='flex min-h-11 w-full items-center gap-2 rounded-md border border-sidebar-border px-3 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            >
              <UserPlus className='h-4 w-4' />
              <span>Create Clerk user</span>
            </button>
          </SignUpButton>
        </div>
      </Show>

      <Show when='signed-in'>
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <p className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70'>
              <Building2 className='h-4 w-4' />
              Clerk organization
            </p>
            <div className='mt-2'>
              <OrganizationSwitcher />
            </div>
          </div>
          <UserButton />
        </div>
      </Show>
    </div>
  );
}
