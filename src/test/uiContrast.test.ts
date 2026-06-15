import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

function readSourceFile(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
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

  test('keeps legacy personal info fields theme-aware if the form is reused', () => {
    const form = readSourceFile('src/components/faculty/PersonalInfoForm.tsx');

    expect(form).not.toContain('border-gray-300 shadow-sm focus:border-blue-500');
    expect(form).toContain('border-input bg-background text-foreground');
    expect(form).toContain('placeholder:text-muted-foreground');
    expect(form).toContain('focus:ring-ring');
  });
});
