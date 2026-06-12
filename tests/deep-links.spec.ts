import { expect, test } from '@playwright/test';
import { appRoute } from './helpers';

test('static hosting deep links render auth and demo storage routes', async ({ page }) => {
  await page.goto(appRoute('/auth/login'));
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  await page.goto(appRoute('/auth/register'));
  await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

  await page.goto(appRoute('/demo-storage/pictures-and-documents/missing/sample.png'));
  await expect(page.getByRole('heading', { name: 'Demo File Unavailable' })).toBeVisible();

  const sampleResponse = await page.goto(appRoute('/demo-samples/sample-certificate.svg'));
  expect(sampleResponse?.ok()).toBe(true);
});
