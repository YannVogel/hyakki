/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'node',
      preset: 'jest-expo/node',
      testMatch: [
        '<rootDir>/src/engine/**/*.test.ts',
        '<rootDir>/src/architecture.test.ts',
        '<rootDir>/scripts/**/*.test.ts',
      ],
    },
    {
      displayName: 'app',
      preset: 'jest-expo',
      setupFiles: ['react-native-gesture-handler/jestSetup.js', '<rootDir>/jest.setup.js'],
      resolver: '<rootDir>/jest.resolver.js',
      testMatch: ['<rootDir>/{app,src}/**/*.test.{ts,tsx}'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '<rootDir>/src/engine/',
        '<rootDir>/src/architecture.test.ts',
      ],
    },
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/**/testing/**'],
  coverageThreshold: {
    './src/engine/': { lines: 90 },
  },
};
