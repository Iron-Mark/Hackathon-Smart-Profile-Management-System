import { test, expect } from '@playwright/test';
import { appRoute, appRoutePattern } from './helpers';

test('demo faculty upload can be approved by an admin end to end', async ({ page }) => {
  await page.goto(appRoute('/auth/login'));
  await page.getByRole('button', { name: 'Faculty demo' }).click();
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'));
  await expect(page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i })).toBeVisible();
  await expect(page.getByText(/Use sample files only/i)).toBeVisible();

  await page
    .getByRole('region', { name: 'Smart upload' })
    .locator('input[type="file"]')
    .setInputFiles({
      name: 'board-exam-certificate.png',
      mimeType: 'image/png',
      buffer: Buffer.from('demo image content'),
    });
  await page.getByRole('button', { name: 'Submit files' }).click();
  await expect(page.getByText('Type: Certificates')).toBeVisible();

  await page.goto(appRoute('/auth/login'));
  await page.getByRole('button', { name: 'Admin demo' }).click();
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(appRoutePattern('/admin/dashboard'));
  await page.goto(appRoute('/admin/approvals'));

  const uploadedRow = page.locator('tr', { hasText: 'board-exam-certificate.png' });
  await expect(uploadedRow).toContainText('Pending');

  const previewPromise = page.waitForEvent('popup');
  await uploadedRow.getByRole('button', { name: 'View' }).click();
  const previewPage = await previewPromise;
  await expect(previewPage.getByRole('heading', { name: 'Demo File Preview' })).toBeVisible();
  await expect(previewPage.getByText('board-exam-certificate.png', { exact: true })).toBeVisible();
  await previewPage.close();

  await uploadedRow.getByRole('button', { name: 'Approve' }).click();
  await expect(uploadedRow).toContainText('Approved');

  await page.goto(appRoute('/auth/login'));
  await page.getByRole('button', { name: 'Faculty demo' }).click();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.goto(appRoute('/faculty/uploaded'));

  const facultyRow = page.locator('[data-slot="card"]', { hasText: 'board-exam-certificate.png' }).first();
  await expect(facultyRow).toContainText('Approved');

  const facultyPreviewPromise = page.waitForEvent('popup');
  await facultyRow.getByRole('button', { name: 'View' }).click();
  const facultyPreviewPage = await facultyPreviewPromise;
  await expect(facultyPreviewPage.getByRole('heading', { name: 'Demo File Preview' })).toBeVisible();
  await expect(facultyPreviewPage.getByText('Demo preview')).toBeVisible();
  await expect(
    facultyPreviewPage.getByText('board-exam-certificate.png', { exact: true })
  ).toBeVisible();
  await facultyPreviewPage.close();
});

test('public demo allows non-UMak visitors to register and sign in', async ({ page }) => {
  const email = `visitor-${Date.now()}@example.com`;
  const password = 'Visitor123';

  await page.goto(appRoute('/auth/register'));
  await page.getByLabel('Full Name').fill('Public Demo Visitor');
  await page.getByLabel('Email').fill(email);
  await page.locator('input#password').fill(password);
  await page.locator('input#confirm-password').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(appRoutePattern('/auth/login'));

  await page.getByLabel('Email').fill(email);
  await page.locator('input#password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'));
  await expect(page.getByRole('heading', { name: /Welcome, Public Demo Visitor/i })).toBeVisible();
});

test('public demo explains duplicate registration attempts', async ({ page }) => {
  const email = `duplicate-${Date.now()}@example.com`;
  const password = 'Visitor123';

  await page.goto(appRoute('/auth/register'));
  await page.getByLabel('Full Name').fill('Duplicate Demo Visitor');
  await page.getByLabel('Email').fill(email);
  await page.locator('input#password').fill(password);
  await page.locator('input#confirm-password').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(appRoutePattern('/auth/login'));

  await page.goto(appRoute('/auth/register'));
  await page.getByLabel('Full Name').fill('Duplicate Demo Visitor');
  await page.getByLabel('Email').fill(email);
  await page.locator('input#password').fill(password);
  await page.locator('input#confirm-password').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(appRoutePattern('/auth/register'));
  await expect(page.getByText('Email already registered')).toBeVisible();
});

test('demo reset removes visitor accounts and restores seeded access', async ({ page }) => {
  const email = `reset-${Date.now()}@example.com`;
  const password = 'Visitor123';

  await page.goto(appRoute('/auth/register'));
  await page.getByLabel('Full Name').fill('Reset Demo Visitor');
  await page.getByLabel('Email').fill(email);
  await page.locator('input#password').fill(password);
  await page.locator('input#confirm-password').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(appRoutePattern('/auth/login'));
  await page.getByRole('button', { name: 'Reset demo data' }).click();
  await expect(page.getByRole('status')).toContainText('Demo data reset');

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.getByLabel('Email').fill(email);
  await page.locator('input#password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText(/Invalid demo credentials/i)).toBeVisible();
  expect(consoleErrors).toEqual([]);

  await page.getByRole('button', { name: 'Faculty demo' }).click();
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'));
});
