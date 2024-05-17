// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import astro from 'eslint-plugin-astro'
import astroParser from 'astro-eslint-parser'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    files: ['**/*.astro'],
    plugins: {
      astro,
    },
    languageOptions: {
      globals: {
        // Enables global variables available in Astro components.
        node: true,
        'astro/astro': true,
        es2020: true,
      },
      parser: astroParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
        // The script of Astro components uses ESM.
        sourceType: 'module',
      },
    },
    rules: {
      ...astro.configs.all.rules,
      'astro/semi': 'off',
    },
  },
  {
    ignores: [
      '.astro',
      '.vscode',
      'dist',
      'node_modules',
      'public',
      'src/env.d.ts',
    ],
  }
)
