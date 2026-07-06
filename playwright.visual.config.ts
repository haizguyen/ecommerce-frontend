import { defineConfig, devices } from '@playwright/test';

/**
 * Self-contained VISUAL config — separate from playwright.config.ts (which
 * assumes the full docker stack is already up). This one boots the app itself
 * via `npm run dev:mock` (mock data, no backend required) and points the
 * browser at it, so it can run inside an Aiko workflow with nothing else
 * running. Used by `npm run test:visual` and the `visual-verify` node of the
 * project's fe-smart-dev workflow.
 *
 * Screenshots go to `$VISUAL_OUT` (default `e2e-visual/screenshots`); the
 * workflow points that at the run's $ARTIFACTS_DIR so captures land in run
 * artifacts.
 */
const PORT = Number(process.env.VISUAL_PORT ?? 4200);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e-visual',
  fullyParallel: false,
  retries: 0,
  // ng serve cold-builds on first hit — give it room before failing the run.
  timeout: 120_000,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev:mock',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
