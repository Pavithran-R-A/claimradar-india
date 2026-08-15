import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: [
      '**/tests/**/*.ts',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/vitest.config.ts',
      '**/scripts/**/*.ts',
    ],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      'eslint.config.mjs',
      '**/next-env.d.ts',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.js',
      '**/*.d.ts',
      '**/scripts/**',
      'scripts/**',
      'supabase/**',
      'vitest.workspace.ts',
      '**/vitest.config.ts',
      // Transient review-diff snapshots kept at the repo root.
      '.review-*',
    ],
  },
);
