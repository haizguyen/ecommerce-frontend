import { test, expect } from '@playwright/test';

const SKUS = ['SKU-001', 'SKU-002'];
const API = process.env.E2E_API_URL ?? 'http://localhost:8080';

/**
 * Full-stack flow: UI -> gateway -> order-service -> Service Bus -> inventory-
 * service -> inventory DB. We drive the Angular UI to place an order, then
 * assert the stock read model decrements. Because the decrement happens
 * asynchronously over Service Bus, every wait is an eventual-consistency poll
 * (expect.poll / web-first assertions), never a fixed sleep.
 *
 * Parametrised over each product card so both SKU-001 and SKU-002 are covered;
 * the assertions are identical per SKU, using the per-card testids.
 */
for (const SKU of SKUS) {
  test(`placing an order eventually decrements stock for ${SKU}`, async ({ page, request }) => {
    // Read the starting stock straight from the API (source of truth for the DB).
    const startResp = await request.get(`${API}/api/inventory/${SKU}`);
    expect(startResp.ok()).toBeTruthy();
    const startStock: number = (await startResp.json()).stock;
    expect(startStock).toBeGreaterThan(0);

    // The order flow lives on the product detail page in the redesigned UI.
    await page.goto(`/products/${SKU}`);

    // UI should reflect the same starting stock (poll until hydrated).
    await expect
      .poll(async () => Number(await page.getByTestId(`stock-${SKU}`).textContent()), {
        timeout: 15_000
      })
      .toBe(startStock);

    await page.getByTestId(`place-order-${SKU}`).click();

    // UI eventually shows the decremented value.
    await expect
      .poll(async () => Number(await page.getByTestId(`stock-${SKU}`).textContent()), {
        timeout: 30_000
      })
      .toBe(startStock - 1);

    // Assert through to DB state via the inventory read model.
    await expect
      .poll(async () => (await (await request.get(`${API}/api/inventory/${SKU}`)).json()).stock, {
        timeout: 30_000
      })
      .toBe(startStock - 1);
  });
}
