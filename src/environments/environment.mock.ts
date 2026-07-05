/**
 * Mock environment — activated by `npm run dev:mock`
 * (ng serve/build --configuration mock swaps environment.ts for this file).
 *
 * With `useMockData` on, the mock HTTP interceptor answers every /api request
 * from local fixtures, so the app runs fully offline with no real network calls.
 */
export const environment = {
  production: false,
  useMockData: true
};
