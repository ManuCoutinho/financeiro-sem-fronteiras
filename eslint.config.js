import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'coverage', 'docs'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.strict.rules,
      'no-console': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: 'Leia variáveis de ambiente apenas por src/config/env.ts.',
        },
      ],
    },
  },
  {
    files: ['src/config/**'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['react', 'react-*', 'firebase', 'firebase/*', '../config/*', '../services/*', '../ui/*'] },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.ts', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
);
