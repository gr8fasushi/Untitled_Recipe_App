const expoConfig = require('eslint-config-expo/flat');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...expoConfig,
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Suppress false-positive import resolver warnings for TypeScript path aliases
    rules: {
      'import/namespace': 'off',
      'import/no-duplicates': 'warn',
    },
  },
  {
    // Exclude functions/ — it has its own TypeScript config and node_modules
    // and is not part of the Expo/React Native project
    ignores: ['node_modules/', 'dist/', '.expo/', 'functions/'],
  },
];
