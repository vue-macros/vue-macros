const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  extends: ['@sxzz'],
  overrides: [
    {
      files: ['**/*.md/*.*'],
      rules: {
        'import/no-mutable-exports': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        'vue/no-export-in-script-setup': 'off',
      },
    },
  ],
  rules: {
    'vue/valid-attribute-name': 'off',
  },
})
