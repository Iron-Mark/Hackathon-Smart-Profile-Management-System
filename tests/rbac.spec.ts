import { test, expect } from '@playwright/test';
import { appRoute } from './helpers';

test.describe('Role-Based Access Control (RBAC)', () => {
  test('unauthorized users are blocked from admin dashboard', async ({ page }) => {
    // Navigate directly to the protected admin dashboard
    await page.goto(appRoute('/admin/dashboard'));

    // Wait for the app to initialize and routing to execute
    await page.waitForLoadState('networkidle');

    // Without a valid admin session, the ProtectedRoute should intercept and redirect
    // By default, unauthenticated users or standard users might be redirected to the landing or faculty page.
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/dashboard');
  });

  test('landing page renders correctly', async ({ page }) => {
    await page.goto(appRoute('/'));
    await expect(page.locator('body')).toBeVisible();
  });
});
