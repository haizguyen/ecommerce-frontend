/**
 * Frontend unit tests (the `npm run test:ci` layer).
 * Scoped to framework-free helper specs so the suite is fast and deterministic
 * and needs no browser. Component/DOM behaviour is covered by the Playwright
 * E2E layer instead.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.util.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: {
          target: 'ES2022',
          module: 'CommonJS',
          esModuleInterop: true,
          experimentalDecorators: true
        }
      }
    ]
  }
};
