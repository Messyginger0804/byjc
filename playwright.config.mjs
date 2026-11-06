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
    // Never adopt an unidentified server on this port; use PLAYWRIGHT_BASE_URL to target one explicitly.
    reuseExistingServer: false,
    env: { DATABASE_URL: process.env.DATABASE_URL || 'postgresql://byjc:byjc_dev@127.0.0.1:5432/byjc' },
  },
});
