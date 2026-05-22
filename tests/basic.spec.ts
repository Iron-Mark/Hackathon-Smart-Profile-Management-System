import { test, expect } from '@playwright/test';

test.describe('Smart Profile Management System E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Landing page loads correctly with core features', async ({ page }) => {
    console.log('Page Title:', await page.title());
    console.log('Body Text:', await page.innerText('body'));
    await expect(page).toHaveTitle(/CCIS Smart FPMS/i);
    await expect(page.getByText(/CCIS Smart Faculty Profile Management System/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Register/i })).toBeVisible();
  });

  test('Navigate to Login page', async ({ page }) => {
    await page.getByRole('button', { name: /Login/i }).click();
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.getByText(/Sign in to your account/i)).toBeVisible();
  });

  test('Navigate to Register page', async ({ page }) => {
    await page.getByRole('button', { name: /Register/i }).click();
    await expect(page).toHaveURL(/.*\/auth\/register/);
    await expect(page.getByText(/Create an account/i)).toBeVisible();
  });
});
