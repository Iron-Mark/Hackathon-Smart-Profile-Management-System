import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';

const root = process.cwd();
const readProjectFile = (path: string) => readFileSync(join(root, path), 'utf8');

test('documents optional Clerk publishable key without adding browser secrets', () => {
  const envExample = readProjectFile('.env.example');
  const readme = readProjectFile('README.md');
  const demoBackendDocs = readProjectFile('docs/demo-backend.md');

  expect(envExample).toContain('VITE_CLERK_PUBLISHABLE_KEY=');
  expect(envExample).not.toContain('CLERK_SECRET_KEY');
  expect(readme).toContain('Clerk');
  expect(demoBackendDocs).toContain('Clerk');
  expect(demoBackendDocs).toContain('browser-local');
});
