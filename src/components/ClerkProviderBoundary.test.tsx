import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ClerkProviderBoundary } from './ClerkProviderBoundary';

test('renders children without Clerk when no publishable key is configured', () => {
  render(
    <ClerkProviderBoundary>
      <div>Demo-only app shell</div>
    </ClerkProviderBoundary>
  );

  expect(screen.getByText('Demo-only app shell')).toBeInTheDocument();
});
