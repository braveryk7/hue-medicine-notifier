import js from '@eslint/js';
import globals from 'globals';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import tailwindPlugin from 'eslint-plugin-tailwindcss';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    ignores: ['lib/**/*.js', 'node_modules/**/*', '../processor/**/*'],
  },
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      '@next/next': nextPlugin,
      tailwindcss: tailwindPlugin,
    },
    rules: {
      // Base rules
      ...js.configs.recommended.rules,
      ...typescriptPlugin.configs.recommended.rules,

      // Next.js rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // Tailwind CSS rules
      ...tailwindPlugin.configs.recommended.rules,
    
      // Prettier rules (disabling conflicting rules)
      ...prettierConfig.rules,

      // Custom rules
      quotes: ['error', 'single', { avoidEscape: true }],
      'import/no-unresolved': 0,
      indent: ['error', 2],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'max-len': ['error', { code: 120 }],
      'valid-jsdoc': 'off',
      'require-jsdoc': 'off',
      'import/no-named-as-default': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
    },
  },
];
