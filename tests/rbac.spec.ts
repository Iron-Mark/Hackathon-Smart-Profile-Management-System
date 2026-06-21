import { test, expect } from '@playwright/test';
import { appRoute, appRoutePattern } from './helpers';

test.describe('Role-Based Access Control (RBAC)', () => {
  test('unauthorized users are blocked from admin dashboard', async ({ page }) => {
    // Navigate directly to the protected admin dashboard
    await page.goto(appRoute('/admin/dashboard'));

    // Without a valid admin session, the ProtectedRoute should intercept and redirect
    await expect(page).toHaveURL(appRoutePattern('/auth/login'));
  });

  test('landing page renders correctly', async ({ page }) => {
    await page.goto(appRoute('/'));
    await expect(page.locator('body')).toBeVisible();
  });
});
