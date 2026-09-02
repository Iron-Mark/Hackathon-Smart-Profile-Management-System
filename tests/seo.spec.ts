import { expect, test } from '@playwright/test';
import { appRoute } from './helpers';

const siteUrl = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/';

test('landing exposes crawlable showcase metadata and static SEO assets', async ({ page, request }) => {
  await page.goto(appRoute('/'));

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'CCIS Smart Faculty Profile Management System'
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', siteUrl);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'index,follow,max-image-preview:large'
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `${siteUrl}og-image.png`
  );
  await expect(page.getByRole('heading', { name: 'Public Demo Facts' })).toBeVisible();
  await expect(page.getByText('Demo data stays in your browser.')).toBeVisible();

  for (const path of [
    '/sitemap.xml',
    '/robots.txt',
    '/llms.txt',
    '/answers.md',
    '/og-image.png',
    '/og/login.png',
    '/og/faculty.png',
    '/og/approvals.png',
    '/fav-icon.png',
    '/pwa-192x192.png',
  ]) {
    const response = await request.get(appRoute(path));
    expect(response.ok(), `${path} should be served by the preview host`).toBe(true);
  }
});

test('private routes swap in a dedicated Open Graph image after render', async ({ page }) => {
  await page.goto(appRoute('/auth/login'));
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `${siteUrl}og/login.png`
  );
  await page.getByRole('button', { name: 'Faculty demo' }).click();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.goto(appRoute('/faculty/dashboard'));
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `${siteUrl}og/faculty.png`
  );
});

test('private and utility app routes are marked noindex after render', async ({ page }) => {
  for (const path of [
    '/auth/login',
    '/auth/register',
    '/admin/dashboard',
    '/faculty/dashboard',
    '/demo-storage/?bucket=pictures-and-documents&path=demo-faculty-1%2FCertificates%2Fsample-certificate.svg',
  ]) {
    await page.goto(appRoute(path));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  }
});
