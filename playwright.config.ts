import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. Assumes the full stack is already up via docker-compose.e2e.yml
 * and that wait-for-services.sh has confirmed health. Frontend is served at
 * http://localhost:4200 and proxies /api to the gateway.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
