type ClerkEnv = Record<string, string | undefined>;

export function getClerkPublishableKey(env: ClerkEnv = import.meta.env) {
  return env.VITE_CLERK_PUBLISHABLE_KEY?.trim() || '';
}

export function isClerkEnabledForEnv(env: ClerkEnv = import.meta.env) {
  return Boolean(getClerkPublishableKey(env));
}

export const clerkPublishableKey = getClerkPublishableKey();
export const isClerkEnabled = isClerkEnabledForEnv();
