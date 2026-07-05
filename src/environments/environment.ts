/**
 * Default (real backend) environment.
 *
 * `useMockData` is false here so production and normal `ng serve` builds talk to
 * the real /api gateway. The `mock` build configuration in angular.json swaps
 * this file for environment.mock.ts (file replacement), flipping the flag on.
 */
export const environment = {
  production: false,
  /** When true, HTTP calls to /api are served from local fixtures. */
  useMockData: false
};
