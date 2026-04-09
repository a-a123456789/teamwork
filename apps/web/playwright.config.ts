import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm --dir ../.. dev',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
