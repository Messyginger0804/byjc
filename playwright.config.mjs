import { defineConfig } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT || 4173);
const localBaseUrl = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || localBaseUrl,
    browserName: 'chromium',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: `npm run dev -- -p ${port}`,
    url: `${localBaseUrl}/api/health/live`,
    reuseExistingServer: !process.env.CI,
    env: { DATABASE_URL: 'postgresql://byjc:byjc_dev@127.0.0.1:5432/byjc' },
  },
});
