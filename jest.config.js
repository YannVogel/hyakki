/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'node',
      preset: 'jest-expo/node',
      testMatch: ['<rootDir>/src/engine/**/*.test.ts', '<rootDir>/scripts/**/*.test.ts'],
    },
    {
      displayName: 'app',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/{app,src}/**/*.test.{ts,tsx}'],
      testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/engine/'],
    },
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}'],
  coverageThreshold: {
    './src/engine/': { lines: 90 },
  },
};
