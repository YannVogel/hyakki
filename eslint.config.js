const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

// Dependency rules of docs/ARCHITECTURE.md § 3. Each zone forbids `target` from importing `from`.
const LAYER_ZONES = [
  {
    // Packages are filtered by no-restricted-imports below (only break_infinity.js is allowed).
    target: './src/engine',
    from: '.',
    except: ['./src/engine', './node_modules'],
    message: 'src/engine is pure: it only imports itself.',
  },
  {
    target: ['./src/render', './src/state'],
    from: './src/features',
    message: 'render and state never import features.',
  },
  {
    target: './src/ui',
    from: ['./src/features', './src/state', './src/engine'],
    message: 'ui never imports features, state or engine.',
  },
  {
    target: './src/services',
    from: './src/features',
    message: 'services never import features.',
  },
];

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: ['dist/*', 'coverage/*', 'ios/*', 'android/*', '.expo/*', 'expo-env.d.ts'],
  },
  {
    rules: {
      'import/no-restricted-paths': ['error', { zones: LAYER_ZONES }],
    },
  },
  {
    files: ['jest.setup.js'],
    languageOptions: { globals: { jest: 'readonly' } },
  },
  {
    files: ['src/engine/**/*.ts'],
    ignores: ['src/engine/**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\.{1,2}/)',
              message: 'src/engine only imports itself (relative paths).',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'Date', message: 'Time is injected into the engine (dtMs, nowMs).' },
        { name: 'performance', message: 'Time is injected into the engine (dtMs, nowMs).' },
        { name: 'crypto', message: 'Use the seeded RNG of src/engine/rng.' },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Use the seeded RNG of src/engine/rng.' },
      ],
    },
  },
  {
    // The BigNum adapter is the only door to break_infinity.js.
    files: ['src/engine/numbers/bigNum.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\.{1,2}/|break_infinity\\.js$)',
              message: 'The BigNum adapter only imports break_infinity.js.',
            },
          ],
        },
      ],
    },
  },
]);
