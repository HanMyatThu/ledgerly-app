import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/data/**', '**/coverage/**'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
      eqeqeq: ['warn', 'always', { null: 'ignore' }],
      'prefer-const': 'warn',
      'consistent-return': 'warn',
      'require-await': 'warn',
      'prefer-template': 'warn',
      'object-shorthand': 'warn',
      'no-else-return': 'warn',
      'no-shadow': 'warn',
      'no-param-reassign': 'warn',
      'array-callback-return': 'warn',
      'default-param-last': 'warn',
    },
  },
  // API, shared package, root config files and all tests run in Node.
  {
    files: ['apps/api/**/*.js', 'packages/**/*.js', '*.js', '**/test/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  // The web app runs in the browser and uses React with JSX.
  {
    files: ['apps/web/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      // __APP_VERSION__ is replaced at build time by Vite's `define`.
      globals: { ...globals.browser, __APP_VERSION__: 'readonly' },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
    },
  },
  {
    files: ['apps/web/src/**/*.test.{js,jsx}', 'apps/web/src/setupTests.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['apps/web/vite.config.js'],
    languageOptions: { globals: globals.node },
  },
];
