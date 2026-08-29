import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173';
const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../docs/images');
const VIEWPORT = { width: 1440, height: 900 };

async function setTheme(context, theme) {
  await context.addInitScript((value) => {
    try {
      window.localStorage.setItem('theme', value);
    } catch {
      // Ignore storage failures in restricted contexts.
    }
  }, theme);
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function hideWebVitals(page) {
  await page.addStyleTag({
    content: [
      '[aria-label="Web Vitals"],',
      '[aria-label="Web Vitals panel"] {',
      '  visibility: hidden !important;',
      '}',
    ].join(' '),
  });
}

async function goto(page, pathname) {
  await page.goto(new URL(pathname, BASE_URL).toString(), { waitUntil: 'networkidle' });
  await settle(page);
}

async function login(page, role) {
  await goto(page, '/auth/login');
  await page.getByRole('button', { name: role === 'faculty' ? 'Faculty demo' : 'Admin demo' }).click();
  await page.getByRole('button', { name: 'Login' }).click();
}

async function shot(page, fileName) {
  const filePath = path.join(OUT_DIR, fileName);
  await page.screenshot({
    path: filePath,
    type: 'png',
    animations: 'disabled',
  });
  console.log(`Wrote ${path.relative(process.cwd(), filePath)}`);
}

async function withPage(browser, theme, work) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: theme,
    reducedMotion: 'reduce',
  });
  await setTheme(context, theme);
  const page = await context.newPage();
  try {
    await work(page);
  } finally {
    await context.close();
  }
}

async function capture() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    await withPage(browser, 'light', async (page) => {
      await goto(page, '/');
      await page.getByRole('heading', { name: /CCIS Smart Faculty Profile Management System/i }).waitFor();
      await hideWebVitals(page);
      await shot(page, 'landing-light.png');
    });

    await withPage(browser, 'dark', async (page) => {
      await goto(page, '/');
      await page.getByRole('heading', { name: /CCIS Smart Faculty Profile Management System/i }).waitFor();
      await page.locator('html.dark').waitFor();
      await hideWebVitals(page);
      await shot(page, 'landing-dark.png');
    });

    await withPage(browser, 'light', async (page) => {
      await goto(page, '/');
      await page.getByText('Demo workflow', { exact: true }).evaluate((el) => {
        el.scrollIntoView({ block: 'start', behavior: 'instant' })
      });
      await hideWebVitals(page);
      await settle(page);
      await shot(page, 'landing-workflow.png');
    });

    await withPage(browser, 'light', async (page) => {
      await goto(page, '/auth/login');
      await page.getByRole('heading', { name: 'Welcome Back' }).waitFor();
      await hideWebVitals(page);
      await shot(page, 'login.png');
    });

    await withPage(browser, 'light', async (page) => {
      await login(page, 'faculty');
      await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor();
      await hideWebVitals(page);
      await shot(page, 'faculty-dashboard.png');
    });

    await withPage(browser, 'dark', async (page) => {
      await login(page, 'faculty');
      await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor();
      await page.locator('html.dark').waitFor();
      await hideWebVitals(page);
      await shot(page, 'faculty-dashboard-dark.png');
    });

    await withPage(browser, 'light', async (page) => {
      await login(page, 'faculty');
      await goto(page, '/faculty/uploaded');
      await page.getByRole('heading', { name: /Uploaded Files/ }).waitFor();
      await page.locator('table').waitFor();
      await hideWebVitals(page);
      await settle(page);
      await shot(page, 'uploaded-files.png');
    });

    await withPage(browser, 'light', async (page) => {
      await login(page, 'faculty');
      await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor();
      await goto(page, '/faculty/profile');
      await page.getByText('Smart Profile Builder').waitFor();
      await hideWebVitals(page);
      await settle(page);
      await shot(page, 'profile.png');
    });

    await withPage(browser, 'light', async (page) => {
      await login(page, 'admin');
      await page.getByRole('heading', { name: 'Admin Dashboard' }).waitFor();
      await page.locator('.recharts-wrapper').first().waitFor({ timeout: 10_000 }).catch(() => {});
      await hideWebVitals(page);
      await settle(page);
      await shot(page, 'dashboard.png');
    });

    await withPage(browser, 'light', async (page) => {
      await login(page, 'admin');
      await goto(page, '/admin/approvals');
      await page.getByRole('heading', { name: /approval/i }).waitFor();
      await hideWebVitals(page);
      await settle(page);
      await shot(page, 'approvals.png');
    });

    await withPage(browser, 'light', async (page) => {
      await goto(page, '/');
      const button = page.getByRole('button', { name: 'Web Vitals', exact: true });
      await button.click();
      const panel = page.getByRole('region', { name: 'Web Vitals panel' });
      await panel.waitFor();
      await page
        .waitForFunction(() => document.querySelector('[aria-label="Web Vitals panel"] dt'), { timeout: 10_000 })
        .catch(() => {});
      await settle(page);
      await shot(page, 'web-vitals.png');
    });
  } finally {
    await browser.close();
  }
}

capture().catch((error) => {
  console.error(error);
  process.exit(1);
});
