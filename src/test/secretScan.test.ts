import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const root = process.cwd();
const ignoredDirs = new Set([
  '.git',
  'dist',
  'node_modules',
  'playwright-report',
  'test-results',
]);

const secretPatterns = [
  /sk-proj-[A-Za-z0-9_-]+/,
  /sk-[A-Za-z0-9_-]{20,}/,
  /sb_secret_[A-Za-z0-9_-]+/,
  /service_role\s*[:=]\s*['"][A-Za-z0-9._-]+['"]/i,
  /npm_[A-Za-z0-9]{20,}/,
];

const collectFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    const relative = path.relative(root, fullPath);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return ignoredDirs.has(entry) ? [] : collectFiles(fullPath);
    }

    if (
      relative === 'package-lock.json' ||
      relative.endsWith('.png') ||
      relative.endsWith('.jpg') ||
      relative.endsWith('.jpeg')
    ) {
      return [];
    }

    return [fullPath];
  });

describe('secret scanning', () => {
  test('keeps source files free of common private key/token shapes', () => {
    const matches = collectFiles(root).flatMap((filePath) => {
      const content = readFileSync(filePath, 'utf8');
      return secretPatterns
        .filter((pattern) => pattern.test(content))
        .map((pattern) => `${path.relative(root, filePath)} matched ${pattern}`);
    });

    expect(matches).toEqual([]);
  });

  test('exposes the same scan as an npm script', () => {
    const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

    expect(packageJson.scripts['security:scan']).toBe('node scripts/check-secrets.js');
  });
});
