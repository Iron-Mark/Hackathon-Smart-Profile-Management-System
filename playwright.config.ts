import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? 'npm run dev';
const webServerUrl = process.env.PLAYWRIGHT_WEB_SERVER_URL ?? baseURL;
const isLiveGitHubPages = (() => {
  try {
    return new URL(baseURL).hostname === 'iron-mark.github.io';
  } catch {
    return false;
  }
})();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: isLiveGitHubPages ? 60 * 1000 : 30 * 1000,
  workers: process.env.CI || isLiveGitHubPages ? 1 : undefined,
  reporter: 'html',
  expect: {
    timeout: isLiveGitHubPages ? 20 * 1000 : 10 * 1000,
  },
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
