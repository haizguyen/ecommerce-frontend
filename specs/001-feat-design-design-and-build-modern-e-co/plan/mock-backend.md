# Plan Fragment: Mock Backend — Interceptor Route Handlers

## Source: `plan.md` — "Contracts (API / Interfaces)", "Affected Files"

### New endpoints to add to `src/app/mock/mock-backend.interceptor.ts`

Add handlers before the 404 fallback (after line ~146):

| # | Method | Path | Request | Response (200) | Errors |
|---|--------|------|---------|----------------|--------|
| 1 | `GET` | `/api/products/best-sellers` | — | `Product[]` filtered by `tags.includes('bestseller')` | 500 (simulate via `?fail=true`) |
| 2 | `GET` | `/api/products/flash-sale` | `?state=ended` optional | `FlashSale \| null` | 500 |
| 3 | `GET` | `/api/testimonials` | — | `Testimonial[]` | 500 |
| 4 | `GET` | `/api/brands` | — | `Brand[]` | 500 |
| 5 | `POST` | `/api/newsletter/subscribe` | `{ email: string }` | `{ success: true }` | 400 (invalid), 500 (`?fail=true`) |

### Handler patterns to follow

- Use existing `ok()` helper and `LATENCY_MS` constant.
- Use `param()` for query string parsing (existing pattern).
- For `POST /api/newsletter/subscribe`: validate email presence; return 400 if missing, 500 if `?fail=true`, else 200 with `{ success: true }`.
- For `GET /api/products/best-sellers`: filter `PRODUCTS` array by `tags.includes('bestseller')`.
- For `GET /api/products/flash-sale`: return `FLASH_SALE` normally, `null` if `?state=ended`, 500 if `?fail=true`.

### Key decisions
- Flash sale `null` response used by section component to hide entirely from DOM.
- Newsletter always succeeds by default; `?fail=true` for testing error states.
- Follows existing `?state=empty` pattern on cart endpoint.

### Tests
- `GET /api/products/best-sellers` returns `Product[]` with bestseller tag only.
- `GET /api/products/flash-sale` returns `FlashSale` with future `endsAt`.
- `GET /api/products/flash-sale?state=ended` returns `null`.
- `GET /api/testimonials` returns `Testimonial[]`.
- `GET /api/brands` returns `Brand[]`.
- `POST /api/newsletter/subscribe` with valid email returns `{ success: true }`.
- `POST /api/newsletter/subscribe` with empty email returns 400.
- `POST /api/newsletter/subscribe?fail=true` returns 500.
- Unknown `/api/*` routes return 404.
