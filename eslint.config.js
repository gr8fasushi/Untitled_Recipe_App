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
    // Disable all import resolver rules — eslint-config-expo's bundled TypeScript
    // resolver crashes on default imports and @/ path aliases.
    // TypeScript's `tsc --noEmit` handles all module resolution validation correctly.
    rules: {
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
      'import/named': 'off',
      'import/default': 'off',
      'import/export': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-duplicates': 'off',
    },
  },
  {
    // Exclude functions/ — it has its own TypeScript config and node_modules
    // and is not part of the Expo/React Native project
    ignores: ['node_modules/', 'dist/', '.expo/', 'functions/'],
  },
];
