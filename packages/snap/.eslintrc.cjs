module.exports = {
  extends: ['../../.eslintrc.cjs'],

  overrides: [
    {
      files: ['.eslintrc.cjs', '*.d.ts'],
      rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        "import/unambiguous": "off",
      }
    }
  ],

  // Keep other configurations as needed
  ignorePatterns: ['dist/'],
};
