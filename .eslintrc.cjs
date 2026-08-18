module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'src-tauri'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // 1. Cyclomatic Complexity & Code Smell Guardrails
    'complexity': ['error', { max: 12 }],
    'max-depth': ['error', 3],
    'max-params': ['error', 4],
    'max-nested-callbacks': ['error', 3],

    // 2. TypeScript Hygiene
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',

    // 3. React & Hook Consistency
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-no-duplicate-props': 'error',

    // 4. Clean Architecture & Anti-Duplication
    'no-duplicate-imports': 'error',
    'no-self-compare': 'error',
    'no-template-curly-in-string': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  },
};
