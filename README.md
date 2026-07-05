# Ecommerce Frontend

This is the Angular frontend application for the ecommerce demo walking skeleton. It allows users to place orders and view inventory stock in real-time.

## Prerequisites

- Node 20+

## Installation

```bash
npm install
```

## Running Locally

To run the development server:

```bash
npm start
```

Then open `http://localhost:4200` in your browser.

## Running with Mock Data (offline / design review)

To run the app **fully offline** against local mock data — no backend or gateway
required — use:

```bash
npm run dev:mock
```

This starts the dev server with the `mock` build configuration, which swaps in
`src/environments/environment.mock.ts` (`useMockData: true`). A client-side HTTP
interceptor (`src/app/mock/mock-backend.interceptor.ts`) then answers every
`/api/*` request from fixtures — **no request ever leaves the browser**.

The mock dataset (`src/mocks/`) is organized per entity and easy to extend:

| File | Contents |
| ---- | -------- |
| `products.mock.ts` | Product catalogue — typical items plus edge cases (very long text, missing image, out of stock, low stock) |
| `categories.mock.ts` | Categories, including an empty category |
| `cart.mock.ts` | Populated cart + empty-cart fixture |
| `orders.mock.ts` | Order history spanning every status |
| `user.mock.ts` | Signed-in user profile |

Add a product by appending to `PRODUCTS`; inventory, search and the order flow
derive from it automatically. To review the empty-cart state, request
`/api/cart?state=empty`.

You can also produce a static mock build with `npm run build:mock`.

## Running Tests

To run Jest unit tests:

```bash
npm run test:ci
```
