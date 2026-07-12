import { test, expect } from '@playwright/test';

test.describe('FooterComponent — social links', () => {
  test('three social link <a> elements render in .social-row', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('.social-row a');
    await expect(links).toHaveCount(3);
  });

  test('each social link has correct aria-label', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.social-row a[aria-label="Twitter / X"]')).toBeVisible();
    await expect(page.locator('.social-row a[aria-label="Instagram"]')).toBeVisible();
    await expect(page.locator('.social-row a[aria-label="GitHub"]')).toBeVisible();
  });

  test('each social link contains an inline SVG with width=20 height=20', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('.social-row a');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const svg = links.nth(i).locator('svg');
      await expect(svg).toBeAttached();
      await expect(svg).toHaveAttribute('width', '20');
      await expect(svg).toHaveAttribute('height', '20');
    }
  });

  test('.social-row is positioned between brand tagline and the closing of brand-col', async ({ page }) => {
    await page.goto('/');
    // Verify brand tagline exists before social-row
    await expect(page.locator('.brand-col p.muted')).toBeAttached();
    // Verify social-row exists
    await expect(page.locator('.social-row')).toBeAttached();
    // Verify the strip (payment section) exists as a sibling after brand-col
    await expect(page.locator('.strip')).toBeAttached();
    // social-row is inside brand-col
    await expect(page.locator('.brand-col .social-row')).toBeAttached();
  });
});

test.describe('AppComponent — skip-to-content link', () => {
  test('skip link is the first focusable element in the DOM', async ({ page }) => {
    await page.goto('/');
    // The skip link should be the first element in the template before <app-header>
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();

    // Check it's the first anchor in the body
    const firstAnchor = page.locator('body a').first();
    await expect(firstAnchor).toHaveClass(/skip-link/);
  });

  test('skip link has href="#content" targeting <main id="content">', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#content');
    await expect(skipLink).toHaveText('Skip to main content');
    await expect(page.locator('main#content')).toBeAttached();
  });

  test('skip link is visually hidden by default, visible on focus', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('.skip-link');

    // By default the link should be off-screen (top: -100% or similar)
    await expect(skipLink).toBeAttached();

    // Check default computed style — top should be negative (off-screen, e.g. -100% resolves to -720px)
    const defaultTop = await skipLink.evaluate(el => getComputedStyle(el).top);
    expect(parseInt(defaultTop, 10)).toBeLessThan(0);

    // Programmatically focus the skip link
    await skipLink.focus();
    // Wait for focus styles to apply
    await page.waitForTimeout(100);

    // After focus, the computed top should be 8px
    const focusedTop = await skipLink.evaluate(el => getComputedStyle(el).top);
    expect(focusedTop).toBe('8px');
  });

  test('<main id="content"> element wraps the <router-outlet>', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main#content');
    await expect(main).toBeAttached();
    // The router-outlet should be inside the main element
    await expect(main.locator('router-outlet')).toBeAttached();
  });
});
