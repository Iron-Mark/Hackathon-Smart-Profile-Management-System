import { beforeEach, expect, test, vi } from 'vitest';
import {
  createDemoBackendClient,
  getDemoStoredFileFromUrl,
  resetDemoBackendState,
  syncClerkDemoUser,
} from './demoBackend';

beforeEach(() => {
  resetDemoBackendState();
});

test('signs in seeded demo faculty users and exposes their account type', async () => {
  const backend = createDemoBackendClient();

  const { data: authData, error: authError } = await backend.auth.signInWithPassword({
    email: 'faculty@umak.edu.ph',
    password: 'Faculty123',
  });

  expect(authError).toBeNull();
  expect(authData.user?.id).toBe('demo-faculty-1');

  const { data: account, error: accountError } = await backend
    .from('account_details')
    .select('type')
    .eq('id', 'demo-faculty-1')
    .single();

  expect(accountError).toBeNull();
  expect(account).toEqual({ type: 'faculty' });
});

test('persists demo submissions and allows admin-style approval updates', async () => {
  const backend = createDemoBackendClient();

  const { error: insertError } = await backend.from('submissions').insert({
    user_id: 'demo-faculty-1',
    document_type: 'Diplomas',
    file_name: 'demo-diploma.png',
    status: 'Pending',
  });

  expect(insertError).toBeNull();

  const { data: pending } = await backend
    .from('submissions')
    .select()
    .match({ user_id: 'demo-faculty-1', status: 'Pending' });

  const inserted = pending.find((submission: any) => submission.file_name === 'demo-diploma.png');
  expect(inserted).toBeDefined();
  expect(inserted!.status).toBe('Pending');

  const { error: updateError } = await backend
    .from('submissions')
    .update({ status: 'Approved' })
    .match({ id: inserted!.id });

  expect(updateError).toBeNull();

  const { data: approved } = await backend
    .from('submissions')
    .select()
    .match({ id: inserted!.id });

  expect(approved[0].status).toBe('Approved');
});

test('generates signed demo storage URLs for uploaded files', async () => {
  const backend = createDemoBackendClient();

  const { data: uploadData, error: uploadError } = await backend.storage
    .from('pictures-and-documents')
    .upload('demo-faculty-1/Certificates/demo-certificate.png', new Blob(['demo']));

  expect(uploadError).toBeNull();
  expect(uploadData?.path).toBe('demo-faculty-1/Certificates/demo-certificate.png');

  const { data: signedData, error: signedError } = await backend.storage
    .from('pictures-and-documents')
    .createSignedUrl('demo-faculty-1/Certificates/demo-certificate.png', 3600);

  expect(signedError).toBeNull();
  expect(signedData?.signedUrl).toContain('/demo-storage/?');
  expect(signedData?.signedUrl).toContain('bucket=pictures-and-documents');
  expect(signedData?.signedUrl).toContain('path=demo-faculty-1%2FCertificates%2Fdemo-certificate.png');
  expect(signedData?.signedUrl).toContain('expiresIn=3600');
});

test('resolves fixed-route demo storage previews from query parameters', () => {
  const file = getDemoStoredFileFromUrl(
    '/demo-storage/',
    '?bucket=pictures-and-documents&path=demo-faculty-1%2FCertificates%2Fsample-certificate.svg'
  );

  expect(file?.name).toBe('sample-certificate.svg');
});

test('recovers seeded demo state when browser storage is corrupted', async () => {
  const store = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => store.set(key, value)),
      removeItem: vi.fn((key: string) => store.delete(key)),
      clear: vi.fn(() => store.clear()),
      key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
      get length() {
        return store.size;
      },
    },
  });
  window.localStorage.setItem('smart-profile-demo-state-v1', '{not-json');
  const backend = createDemoBackendClient();

  const { data, error } = await backend.auth.signInWithPassword({
    email: 'faculty@umak.edu.ph',
    password: 'Faculty123',
  });

  expect(error).toBeNull();
  expect(data.user?.id).toBe('demo-faculty-1');
});

test('syncs a Clerk identity into a browser-local faculty demo account', async () => {
  const backend = createDemoBackendClient();

  const { data, error } = await syncClerkDemoUser({
    clerkUserId: 'user_2abc',
    email: 'clerk.faculty@example.com',
    name: 'Clerk Faculty',
  });

  expect(error).toBeNull();
  expect(data?.user?.id).toBe('clerk-user_2abc');

  const { data: currentUser } = await backend.auth.getUser();
  expect(currentUser.user?.id).toBe('clerk-user_2abc');

  const { data: account, error: accountError } = await backend
    .from('account_details')
    .select('type,name,email,clerk_user_id')
    .eq('id', 'clerk-user_2abc')
    .single();

  expect(accountError).toBeNull();
  expect(account).toEqual({
    type: 'faculty',
    name: 'Clerk Faculty',
    email: 'clerk.faculty@example.com',
    clerk_user_id: 'user_2abc',
  });

  const { data: profileRows } = await backend
    .from('profile_details')
    .select()
    .match({ id: 'clerk-user_2abc' });

  expect(profileRows).toHaveLength(1);

  await syncClerkDemoUser({
    clerkUserId: 'user_2abc',
    email: 'renamed.faculty@example.com',
    name: 'Renamed Faculty',
  });

  const { data: accounts } = await backend
    .from('account_details')
    .select()
    .match({ id: 'clerk-user_2abc' });

  expect(accounts).toHaveLength(1);
  expect(accounts[0].email).toBe('renamed.faculty@example.com');
  expect(accounts[0].name).toBe('Renamed Faculty');
});
