import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/react';
import { clerkPublishableKey, isClerkEnabled } from '@/client/clerkConfig';

interface ClerkProviderBoundaryProps {
  children: ReactNode;
}

export function ClerkProviderBoundary({ children }: ClerkProviderBoundaryProps) {
  if (!isClerkEnabled) {
    return <>{children}</>;
  }

  return <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>;
}
