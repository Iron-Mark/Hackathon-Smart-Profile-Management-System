import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? 'npm run dev';
const webServerUrl = process.env.PLAYWRIGHT_WEB_SERVER_URL ?? baseURL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: webServerCommand,
    url: webServerUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
