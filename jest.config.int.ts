/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  collectCoverage: false,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '\\.(int|e2e)\\.test\\.ts$',
  testTimeout: 8 * 1000,
  maxWorkers: 1,
  /*
   * only one worker for integration tests because multiple tests
   * can access the same resource and can create side effects like false positives
   * that's why integration tests are slower than unit tests
   * and why we will have less integration tests than unit tests
   */
  globalSetup: './src/tests/setup/global-setup.ts',
  globalTeardown: './src/tests/setup/global-teardown.ts',
};
