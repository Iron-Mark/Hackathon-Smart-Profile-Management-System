import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const policySql = readFileSync(
  path.resolve(process.cwd(), 'supabase_rls_policies.sql'),
  'utf8'
);

describe('Supabase RLS policies', () => {
  test('do not grant authenticated users unrestricted account role updates', () => {
    expect(policySql).not.toMatch(
      /GRANT\s+SELECT,\s*INSERT,\s*UPDATE(?:,\s*DELETE)?\s+ON\s+public\.account_details\s+TO\s+authenticated;/i
    );
    expect(policySql).toMatch(
      /GRANT\s+UPDATE\s*\(\s*name\s*,\s*"avatarUrl"\s*\)\s+ON\s+public\.account_details\s+TO\s+authenticated;/i
    );
  });

  test('limits self-registration account inserts to faculty rows', () => {
    expect(policySql).toMatch(
      /CREATE\s+POLICY\s+"Users can insert own faculty account details"[\s\S]+ON\s+public\.account_details\s+FOR\s+INSERT[\s\S]+WITH\s+CHECK\s*\(\s*auth\.uid\(\)::text\s*=\s*id\s+AND\s+type\s*=\s*'faculty'\s*\);/i
    );
  });

  test('requires browser audit log inserts to belong to the signed-in user', () => {
    expect(policySql).toMatch(
      /CREATE\s+POLICY\s+"Users can insert own audit logs"[\s\S]+ON\s+public\.audit_logs\s+FOR\s+INSERT[\s\S]+WITH\s+CHECK\s*\(\s*auth\.uid\(\)::text\s*=\s*user_id\s*\);/i
    );
  });
});
