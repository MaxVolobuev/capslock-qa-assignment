const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    files: [
      'tests/**/*.ts',
      'src/**/*.ts',
      'pages/**/*.ts',
      'utils/**/*.ts',
      'fixtures/**/*.ts',
      'types/**/*.ts',
      'playwright.config.ts',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },

      globals: {
        // node-ish globals
        process: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
        prettier: prettierPlugin,
    },

    rules: {
      // Your custom rules
      'no-undef': 'off', 
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'prettier/prettier': 'warn',
    },
  },

  // Ignore folders
  {
    ignores: [
    '**/node_modules/**',

    // Playwright artifacts
    '**/playwright-report/**',
    '**/test-results/**',
    '**/.playwright/**',
    '**/trace/**',

    // Media & archives
    '**/*.zip',
    '**/*.png',
    '**/*.webm',
    '**/*.har',

    // Build outputs
    '**/build/**',
    '**/dist/**',
    '**/coverage/**',
    ],
  },
];