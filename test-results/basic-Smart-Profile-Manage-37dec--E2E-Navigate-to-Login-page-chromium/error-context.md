# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: basic.spec.ts >> Smart Profile Management System E2E >> Navigate to Login page
- Location: tests\basic.spec.ts:17:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Login/i })

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Smart Profile Management System E2E', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('http://localhost:5173');
  6  |   });
  7  | 
  8  |   test('Landing page loads correctly with core features', async ({ page }) => {
  9  |     console.log('Page Title:', await page.title());
  10 |     console.log('Body Text:', await page.innerText('body'));
  11 |     await expect(page).toHaveTitle(/CCIS Smart FPMS/i);
  12 |     await expect(page.getByText(/CCIS Smart Faculty Profile Management System/i)).toBeVisible();
  13 |     await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  14 |     await expect(page.getByRole('button', { name: /Register/i })).toBeVisible();
  15 |   });
  16 | 
  17 |   test('Navigate to Login page', async ({ page }) => {
> 18 |     await page.getByRole('button', { name: /Login/i }).click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  19 |     await expect(page).toHaveURL(/.*\/auth\/login/);
  20 |     await expect(page.getByText(/Sign in to your account/i)).toBeVisible();
  21 |   });
  22 | 
  23 |   test('Navigate to Register page', async ({ page }) => {
  24 |     await page.getByRole('button', { name: /Register/i }).click();
  25 |     await expect(page).toHaveURL(/.*\/auth\/register/);
  26 |     await expect(page.getByText(/Create an account/i)).toBeVisible();
  27 |   });
  28 | });
  29 | 
```