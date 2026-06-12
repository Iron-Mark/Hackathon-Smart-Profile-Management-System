import { beforeEach, expect, test, vi } from 'vitest';
import { createDemoSupabaseClient, resetDemoSupabaseState } from './demoSupabase';

beforeEach(() => {
  resetDemoSupabaseState();
});

test('signs in seeded demo faculty users and exposes their account type', async () => {
  const supabase = createDemoSupabaseClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'faculty@umak.edu.ph',
    password: 'Faculty123',
  });

  expect(authError).toBeNull();
  expect(authData.user?.id).toBe('demo-faculty-1');

  const { data: account, error: accountError } = await supabase
    .from('account_details')
    .select('type')
    .eq('id', 'demo-faculty-1')
    .single();

  expect(accountError).toBeNull();
  expect(account).toEqual({ type: 'faculty' });
});

test('persists demo submissions and allows admin-style approval updates', async () => {
  const supabase = createDemoSupabaseClient();

  const { error: insertError } = await supabase.from('submissions').insert({
    user_id: 'demo-faculty-1',
    document_type: 'Diplomas',
    file_name: 'demo-diploma.png',
    status: 'Pending',
  });

  expect(insertError).toBeNull();

  const { data: pending } = await supabase
    .from('submissions')
    .select()
    .match({ user_id: 'demo-faculty-1', status: 'Pending' });

  const inserted = pending.find((submission: any) => submission.file_name === 'demo-diploma.png');
  expect(inserted).toBeDefined();
  expect(inserted!.status).toBe('Pending');

  const { error: updateError } = await supabase
    .from('submissions')
    .update({ status: 'Approved' })
    .match({ id: inserted!.id });

  expect(updateError).toBeNull();

  const { data: approved } = await supabase
    .from('submissions')
    .select()
    .match({ id: inserted!.id });

  expect(approved[0].status).toBe('Approved');
});

test('generates signed demo storage URLs for uploaded files', async () => {
  const supabase = createDemoSupabaseClient();

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('pictures-and-documents')
    .upload('demo-faculty-1/Certificates/demo-certificate.png', new Blob(['demo']));

  expect(uploadError).toBeNull();
  expect(uploadData?.path).toBe('demo-faculty-1/Certificates/demo-certificate.png');

  const { data: signedData, error: signedError } = await supabase.storage
    .from('pictures-and-documents')
    .createSignedUrl('demo-faculty-1/Certificates/demo-certificate.png', 3600);

  expect(signedError).toBeNull();
  expect(signedData?.signedUrl).toContain('/demo-storage/pictures-and-documents/');
  expect(signedData?.signedUrl).toContain('expiresIn=3600');
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
  const supabase = createDemoSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'faculty@umak.edu.ph',
    password: 'Faculty123',
  });

  expect(error).toBeNull();
  expect(data.user?.id).toBe('demo-faculty-1');
});
