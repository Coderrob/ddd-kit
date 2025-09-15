module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
    es6: true,
  },
  overrides: [
    {
      files: ['test/**/*.js', 'test/**/*.ts'],
      env: {
        jest: true,
      },
    },
    {
      files: ['src/types/**/*.ts', 'src/validation/**/*.ts', 'src/core/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
            args: 'none',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
      },
    },
    {
      files: ['src/commands/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: 'options',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
            args: 'after-used',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
      },
    },
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: 'options',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        args: 'after-used',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    eqeqeq: ['error', 'always'],
    'consistent-return': 'error',
    'no-implicit-coercion': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
  },
};
