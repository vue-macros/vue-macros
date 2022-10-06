const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  extends: ['@sxzz'],
  rules: {
    'vue/valid-attribute-name': 'off',
  },
})
