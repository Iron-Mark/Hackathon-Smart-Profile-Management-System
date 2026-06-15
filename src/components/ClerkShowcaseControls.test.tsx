import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ClerkAuthPanel, ClerkShowcaseControls } from './ClerkShowcaseControls';

test('hides Clerk auth panel when no publishable key is configured', () => {
  render(<ClerkAuthPanel mode="login" />);

  expect(screen.queryByText(/continue with clerk/i)).not.toBeInTheDocument();
});

test('hides Clerk app controls when no publishable key is configured', () => {
  render(<ClerkShowcaseControls />);

  expect(screen.queryByText(/clerk organization/i)).not.toBeInTheDocument();
});
