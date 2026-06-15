import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

const mocks = vi.hoisted(() => {
  const getUser = vi.fn();
  const single = vi.fn();
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return { getUser, single, eq, select, from };
});

vi.mock('@/client/backend', () => ({
  default: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('authorizes admin routes with account_details.type matched by id', async () => {
  mocks.getUser.mockResolvedValue({
    data: { user: { id: 'demo-admin-1' } },
    error: null,
  });

  mocks.single.mockImplementation(async () => {
    const lastEqCall = mocks.eq.mock.calls.at(-1);
    const lastSelectCall = mocks.select.mock.calls.at(-1);
    expect(lastEqCall).toBeDefined();
    expect(lastSelectCall).toBeDefined();
    const [field, value] = lastEqCall as unknown as [string, string];
    const [selectedColumn] = lastSelectCall as unknown as [string];

    if (selectedColumn === 'type' && field === 'id' && value === 'demo-admin-1') {
      return { data: { type: 'admin' }, error: null };
    }

    return { data: null, error: { message: 'wrong account lookup' } };
  });

  render(
    <MemoryRouter>
      <ProtectedRoute requiredRole="admin">
        <div>Admin Shell</div>
      </ProtectedRoute>
    </MemoryRouter>
  );

  expect(await screen.findByText('Admin Shell')).toBeInTheDocument();
  expect(mocks.from).toHaveBeenCalledWith('account_details');
  expect(mocks.select).toHaveBeenCalledWith('type');
  expect(mocks.eq).toHaveBeenCalledWith('id', 'demo-admin-1');
});
