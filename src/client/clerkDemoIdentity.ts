import type { ClerkDemoIdentity } from './demoBackend';

interface ClerkEmailAddressLike {
  emailAddress?: string | null;
}

interface ClerkUserLike {
  id?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  primaryEmailAddress?: ClerkEmailAddressLike | null;
  emailAddresses?: ClerkEmailAddressLike[] | null;
}

export function getClerkDemoIdentity(user: ClerkUserLike | null | undefined): ClerkDemoIdentity | null {
  if (!user?.id) return null;

  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.find((address) => Boolean(address.emailAddress))?.emailAddress ||
    '';

  if (!email) return null;

  const fallbackName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return {
    clerkUserId: user.id,
    email,
    name: user.fullName || fallbackName || user.username || email,
  };
}
