import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

function readSourceFile(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function extractBlock(css: string, selector: string) {
  const start = css.indexOf(selector);
  expect(start).toBeGreaterThan(-1);
  const open = css.indexOf('{', start);
  const close = css.indexOf('\n}', open);
  return css.slice(open, close + 2);
}

describe('UI contrast and print-safe styling', () => {
  test('keeps dashboard headings on valid Tailwind font utilities', () => {
    const dashboard = readSourceFile('src/pages/admin/dashboard/index.tsx');

    expect(dashboard).not.toContain('font-semi bold');
    expect(dashboard).toContain('Quick Actions');
    expect(dashboard).toContain('font-semibold text-foreground');
  });

  test('forces profile print output back to paper-safe semantic colors', () => {
    const profile = readSourceFile('src/pages/faculty/profile/index.tsx');

    expect(profile).toContain('print:bg-white');
    expect(profile).toContain('print:text-black');
    expect(profile).toContain('print:[--foreground:black]');
    expect(profile).toContain('print:[--card:white]');
    expect(profile).toContain('print:[--card-foreground:black]');
    expect(profile).toContain('print:[--muted-foreground:#374151]');
  });

  test('defines paired light and dark brand tokens with status colors', () => {
    const css = readSourceFile('src/styles/global.css');
    const root = extractBlock(css, ':root {');
    const dark = extractBlock(css, '.dark {');

    for (const token of [
      '--primary:',
      '--primary-foreground:',
      '--success:',
      '--success-foreground:',
      '--warning:',
      '--warning-foreground:',
      '--info:',
      '--info-foreground:',
      '--destructive-foreground:',
      '--hero:',
      '--hero-foreground:',
      '--sidebar:',
    ]) {
      expect(root).toContain(token);
      expect(dark).toContain(token);
    }

    expect(root).toContain('color-scheme: light');
    expect(dark).toContain('color-scheme: dark');
    expect(dark).not.toContain('--primary: oklch(0.922 0 0)');
    expect(root).toMatch(/--primary:\s*oklch\(0\.[3-4].*150\)/);
    expect(dark).toMatch(/--primary:\s*oklch\(0\.7[0-9].*(145|150)\)/);
    expect(root).toMatch(/--sidebar:\s*oklch\(0\.9/);
    expect(dark).toMatch(/--sidebar:\s*oklch\(0\.1[0-9]/);
    expect(root).toContain('--hero:');
    expect(dark).toContain('--hero:');
    expect(css).toContain('--color-hero: var(--hero)');
  });

  test('keeps public chrome on semantic theme tokens instead of locked slate', () => {
    const landing = readSourceFile('src/pages/landing.tsx');
    const login = readSourceFile('src/pages/auth/login.tsx');
    const register = readSourceFile('src/pages/auth/register.tsx');

    expect(landing).toContain('bg-background text-foreground');
    expect(landing).toContain('bg-hero');
    expect(landing).not.toContain('bg-slate-950');
    expect(login).toContain('bg-background');
    expect(login).not.toContain('bg-slate-950');
    expect(register).toContain('bg-background');
    expect(register).not.toContain('bg-slate-950');
  });
});
