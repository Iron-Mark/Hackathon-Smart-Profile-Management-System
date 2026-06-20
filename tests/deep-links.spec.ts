import { expect, test } from '@playwright/test';
import { appRoute } from './helpers';

test('static hosting deep links render auth and demo storage routes', async ({ page }) => {
  const loginResponse = await page.goto(appRoute('/auth/login/'));
  expect(loginResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  const registerResponse = await page.goto(appRoute('/auth/register/'));
  expect(registerResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

  const demoStorageBaseResponse = await page.goto(appRoute('/demo-storage'));
  expect(demoStorageBaseResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Demo File Unavailable' })).toBeVisible();

  const demoStorageSlashResponse = await page.goto(appRoute('/demo-storage/'));
  expect(demoStorageSlashResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Demo File Unavailable' })).toBeVisible();

  const missingPreviewResponse = await page.goto(
    appRoute('/demo-storage/pictures-and-documents/missing/sample/')
  );
  expect(missingPreviewResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Demo File Unavailable' })).toBeVisible();

  const sampleResponse = await page.goto(appRoute('/demo-samples/sample-certificate.svg'));
  expect(sampleResponse?.ok()).toBe(true);

  const transcriptResponse = await page.goto(appRoute('/demo-samples/sample-transcript.svg'));
  expect(transcriptResponse?.ok()).toBe(true);

  for (const sampleFile of [
    'sample-diploma.svg',
    'sample-cv.svg',
    'sample-research-summary.svg',
  ]) {
    const response = await page.goto(appRoute(`/demo-samples/${sampleFile}`));
    expect(response?.ok(), `${sampleFile} should resolve`).toBe(true);
  }
});

test('public landing actions resolve without 404s', async ({ page, request }) => {
  const response = await page.goto(appRoute('/'));
  expect(response?.ok()).toBe(true);

  await page.getByRole('link', { name: /start demo/i }).click();
  await expect(page).toHaveURL(/\/auth\/login\?demo=faculty$/);
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  await page.goto(appRoute('/'));
  await page.getByRole('link', { name: /^login$/i }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);

  await page.goto(appRoute('/'));
  await page.getByRole('link', { name: /^register$/i }).click();
  await expect(page).toHaveURL(/\/auth\/register$/);

  await page.goto(appRoute('/'));
  const certificateHref = await page.getByRole('link', { name: /download sample certificate/i }).getAttribute('href');
  expect(certificateHref).toContain('/demo-samples/sample-certificate.svg');
  const certificateResponse = await request.get(certificateHref!);
  expect(certificateResponse.ok()).toBe(true);

  await page.goto(appRoute('/'));
  const transcriptHref = await page.getByRole('link', { name: /download sample transcript/i }).getAttribute('href');
  expect(transcriptHref).toContain('/demo-samples/sample-transcript.svg');
  const transcriptResponse = await request.get(transcriptHref!);
  expect(transcriptResponse.ok()).toBe(true);
});
