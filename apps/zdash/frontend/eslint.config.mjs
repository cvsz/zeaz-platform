import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist', 'build', 'coverage', '.vite', '.next', 'node_modules', '*.config.*'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.es2024 },
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // === Core required rules (per original specification) ===
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',   // Tolerate for legacy code (non-blocking)

      // === Disabled noisy React compiler / legacy rules ===
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/immutability': 'off',

      'react-refresh/only-export-components': 'off',  // Tolerate for hooks/context files

      // === Full legacy tolerance ===
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-empty': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      'prefer-const': 'off',
    },
  },
  {
    files: ['src/tests/**/*.ts', 'src/tests/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-empty': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-console': 'off',
    },
  }
);
