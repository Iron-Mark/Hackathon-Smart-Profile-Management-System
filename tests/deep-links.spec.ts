import { expect, test } from '@playwright/test';
import { appRoute } from './helpers';

test('static hosting deep links render auth and demo storage routes', async ({ page }) => {
  const loginResponse = await page.goto(appRoute('/auth/login/'));
  expect(loginResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  const registerResponse = await page.goto(appRoute('/auth/register/'));
  expect(registerResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

  const missingPreviewResponse = await page.goto(
    appRoute('/demo-storage/pictures-and-documents/missing/sample/')
  );
  expect(missingPreviewResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Demo File Unavailable' })).toBeVisible();

  const sampleResponse = await page.goto(appRoute('/demo-samples/sample-certificate.svg'));
  expect(sampleResponse?.ok()).toBe(true);
});
