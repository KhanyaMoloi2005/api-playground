import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default defineConfig(
  { ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**'] },

  // Baseline JavaScript + TypeScript rules for every workspace.
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // Allow intentionally-unused params/vars when prefixed with `_`
      // (e.g. Express error handlers must declare all four parameters).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  // React-specific rules only apply to the client.
  {
    files: ['client/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
  },

  // Must be last: turns off any rules that would conflict with Prettier's formatting.
  prettier,
);
