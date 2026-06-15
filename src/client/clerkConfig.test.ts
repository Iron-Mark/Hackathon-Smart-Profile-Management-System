import { expect, test } from 'vitest';
import { getClerkPublishableKey, isClerkEnabledForEnv } from './clerkConfig';

test('normalizes optional Clerk publishable key from Vite env', () => {
  expect(
    getClerkPublishableKey({
      VITE_CLERK_PUBLISHABLE_KEY: '  pk_test_demo123  ',
    })
  ).toBe('pk_test_demo123');
});

test('keeps Clerk disabled when no publishable key is configured', () => {
  expect(isClerkEnabledForEnv({})).toBe(false);
  expect(isClerkEnabledForEnv({ VITE_CLERK_PUBLISHABLE_KEY: '   ' })).toBe(false);
});
