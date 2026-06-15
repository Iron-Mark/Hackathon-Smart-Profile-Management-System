import fs from 'fs';
import path from 'path';

const source = path.resolve(process.cwd(), 'dist', 'index.html');
const routeFallbacks = [
  '404.html',
  'admin/accounts/index.html',
  'admin/approvals/index.html',
  'admin/audit-logs/index.html',
  'admin/dashboard/index.html',
  'admin/help/index.html',
  'admin/reports/index.html',
  'admin/settings/index.html',
  'auth/login/index.html',
  'auth/register/index.html',
  'demo-storage/pictures-and-documents/missing/sample/index.html',
  'faculty/dashboard/index.html',
  'faculty/profile/index.html',
  'faculty/settings/index.html',
  'faculty/uploaded/index.html',
];

if (!fs.existsSync(source)) {
  console.error(`Cannot create 404.html because ${source} does not exist.`);
  process.exit(1);
}

for (const fallbackPath of routeFallbacks) {
  const destination = path.resolve(process.cwd(), 'dist', fallbackPath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

console.log(`Created ${routeFallbacks.length} static SPA fallback files.`);
