const DOMGlobals = ['window', 'document']
const NodeGlobals = ['module', 'require']

// eslint-disable-next-line no-restricted-globals
module.exports = {
  env: {
    browser: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-debugger': 'error',
    'no-unused-vars': [
      'error',
      // we are only using this rule to check for unused arguments since TS
      // catches unused variables but not args.
      { varsIgnorePattern: '.*', args: 'none' }
    ],
    // most of the codebase are expected to be env agnostic
    'no-restricted-globals': ['error', ...DOMGlobals, ...NodeGlobals]
  },
  overrides: [
    {
      files: ['**/__tests__/**'],
      rules: {
        'no-restricted-globals': 'off'
      }
    }
  ],
  ignorePatterns: ['node_modules/', 'dist/']
}
