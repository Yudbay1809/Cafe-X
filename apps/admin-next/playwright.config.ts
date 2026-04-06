import { defineConfig } from '@playwright/test';

const skipWebServer = Boolean(process.env.PW_SKIP_WEB_SERVER);

export default defineConfig({
  testDir: './tests/e2e',
  retries: 1,
  use: {
    baseURL: 'http://127.0.0.1:3002',
    headless: true,
  },
  webServer: skipWebServer ? undefined : {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3002/login',
    timeout: 120000,
    reuseExistingServer: true,
  },
});