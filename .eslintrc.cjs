module.exports = {
  root: true,
  ignorePatterns: ['*.config.js', '*.config.cjs', 'tools/ci-scripts/**/*'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier', 'import', 'security'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  settings: {
    // Removed problematic import resolver for now
  },
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: [
    '*.config.js',
    '*.config.ts',
    'webpack.config.js',
    'webpack.config.ts',
    'tools/ci-scripts/**/*',
  ],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // TypeScript strict rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',

    'import/no-unresolved': 'error',
    // 'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    // 'import/no-absolute-path': 'error',
    // 'import/no-unused-modules': 'error',
    'import/no-deprecated': 'warn',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],

    // Sorting and ordering rules
    'sort-keys': 'off', // Disabled to avoid conflicts with object properties
    'sort-vars': 'error',
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: ['signature', 'field', 'constructor', 'method'],
      },
    ],

    // Security rules
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-unsafe-regex': 'error',

    // General code quality
    'no-unused-vars': 'off', // Use @typescript-eslint/no-unused-vars instead
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        args: 'after-used',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // Enforce consistent coding style
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'consistent-return': 'error',
    'no-implicit-coercion': 'error',
    yoda: 'error',
    'no-bitwise': 'warn',
    'no-lone-blocks': 'error',
    'no-multi-assign': 'error',
    'no-new-object': 'error',
    'no-array-constructor': 'error',
    'no-new-wrappers': 'error',
    'no-extend-native': 'error',
    'no-implicit-globals': 'error',
    'no-invalid-this': 'error',
    'no-shadow': 'off', // Disabled in favor of @typescript-eslint/no-shadow
    '@typescript-eslint/no-shadow': 'error',
    'no-undef': 'error',
    'no-undefined': 'error',
    'no-use-before-define': 'error',
    '@typescript-eslint/no-use-before-define': 'error',

    // Code complexity and maintainability
    'max-lines-per-function': ['error', 50],
    'max-params': ['error', 4],
    'max-depth': ['error', 4],
    'max-nested-callbacks': ['error', 3],
    complexity: ['error', 10],
    'max-lines': ['error', 300],

    // Security rules (additional to plugin)
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // Performance rules
    'no-loop-func': 'error',

    // Best practices
    'no-else-return': 'error',
    'no-lonely-if': 'error',
    'no-unneeded-ternary': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-rename': 'error',
    'prefer-object-spread': 'error',
    'default-case': 'error',
    'default-case-last': 'error',
    'no-fallthrough': 'error',
    'no-case-declarations': 'error',
    'no-constructor-return': 'error',
    'no-duplicate-case': 'error',
    'no-self-compare': 'error',
    'no-template-curly-in-string': 'error',
    'no-unreachable-loop': 'error',
    'require-atomic-updates': 'error',
    'no-param-reassign': 'error',
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'require-await': 'error',
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'no-promise-executor-return': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*'],
      parserOptions: {
        project: './tsconfig.test.json',
      },
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        'no-unused-vars': 'off',
        'max-lines-per-function': 'off',
        complexity: 'off',
      },
    },
    {
      files: ['src/types/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
      },
    },
  ],
};
