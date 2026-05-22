# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: essential.spec.ts >> Smart Profile Management System - Essential Flows >> Landing page loads correctly
- Location: tests\essential.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1').first()

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Smart Profile Management System - Essential Flows', () => {
  4  |   test('Landing page loads correctly', async ({ page }) => {
  5  |     // Attempt to navigate to the landing page
  6  |     await page.goto('http://localhost:5173/');
  7  |     
  8  |     // Check if main title or key elements are visible
  9  |     // Adjust selector based on actual landing page content
  10 |     const heading = page.locator('h1').first();
> 11 |     await expect(heading).toBeVisible();
     |                           ^ Error: expect(locator).toBeVisible() failed
  12 |   });
  13 | 
  14 |   test('Login page renders and can be interacted with', async ({ page }) => {
  15 |     await page.goto('http://localhost:5173/auth/login');
  16 |     
  17 |     const emailInput = page.getByPlaceholder(/email|example/i).first();
  18 |     const passwordInput = page.getByPlaceholder(/password/i).first();
  19 |     const submitButton = page.locator('button[type="submit"]');
  20 | 
  21 |     await expect(emailInput).toBeVisible();
  22 |     await expect(passwordInput).toBeVisible();
  23 |     await expect(submitButton).toBeVisible();
  24 | 
  25 |     // We do not actually submit to avoid hitting the real Supabase backend 
  26 |     // without a dedicated test environment.
  27 |   });
  28 | });
  29 | 
```