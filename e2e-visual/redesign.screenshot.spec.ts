import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Visual capture harness for design review. Screenshots each key page at
 * desktop + mobile so a reviewer (human or the fe-smart-dev workflow agent)
 * can eyeball the redesign instead of trusting type-check/lint alone.
 *
 * This is a STARTER template — extend it with the app-specific STATES that
 * type-checking can never catch: empty cart, out-of-stock / low-stock badges,
 * long product titles, missing images, loading & error states. Drive those via
 * the mock configuration (`ng serve --configuration mock`) or UI interaction.
 *
 * Output dir: $VISUAL_OUT (default e2e-visual/screenshots). The workflow points
 * it at the run's $ARTIFACTS_DIR.
 */
const OUT = process.env.VISUAL_OUT ?? join('e2e-visual', 'screenshots');
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

// Static, always-reachable routes. Add `/products/:sku` captures once the agent
// knows a valid SKU (see the product-detail block below).
const ROUTES = [
  { slug: 'home', path: '/' },
  { slug: 'products', path: '/products' },
  { slug: 'cart', path: '/cart' },
] as const;

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`${route.slug} @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      // Best-effort settle for lazy content; don't fail the capture on timeout.
      await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
      await page.screenshot({
        path: join(OUT, `${route.slug}-${vp.name}.png`),
        fullPage: true,
      });
    });
  }
}

// Product detail needs a real SKU. Derive one from the listing so the capture
// stays valid as mock data changes; skip gracefully if no product card links.
test('product-detail @ desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/products', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
  const firstProduct = page.locator('a[href*="/products/"]').first();
  if ((await firstProduct.count()) === 0) {
    test.skip(true, 'No product links found on /products (adjust selector for the redesign).');
    return;
  }
  await firstProduct.click();
  await expect(page).toHaveURL(/\/products\/.+/);
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
  await page.screenshot({ path: join(OUT, 'product-detail-desktop.png'), fullPage: true });
});
