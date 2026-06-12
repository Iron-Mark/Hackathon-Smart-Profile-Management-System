import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignoredDirs = new Set([
  '.git',
  'dist',
  'node_modules',
  'playwright-report',
  'test-results',
]);

const ignoredFiles = new Set(['package-lock.json']);
const ignoredExtensions = new Set(['.png', '.jpg', '.jpeg']);

const secretPatterns = [
  /sk-proj-[A-Za-z0-9_-]+/,
  /sk-[A-Za-z0-9_-]{20,}/,
  /sb_secret_[A-Za-z0-9_-]+/,
  /service_role\s*[:=]\s*['"][A-Za-z0-9._-]+['"]/i,
  /npm_[A-Za-z0-9]{20,}/,
];

function collectFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return ignoredDirs.has(entry) ? [] : collectFiles(fullPath);
    }

    const relative = path.relative(root, fullPath);
    if (ignoredFiles.has(relative) || ignoredExtensions.has(path.extname(entry).toLowerCase())) {
      return [];
    }

    return [fullPath];
  });
}

const matches = collectFiles(root).flatMap((filePath) => {
  const content = readFileSync(filePath, 'utf8');

  return secretPatterns
    .filter((pattern) => pattern.test(content))
    .map((pattern) => `${path.relative(root, filePath)} matched ${pattern}`);
});

if (matches.length > 0) {
  console.error('Potential secrets found:');
  matches.forEach((match) => console.error(`- ${match}`));
  process.exit(1);
}

console.log('No common secret patterns found.');
