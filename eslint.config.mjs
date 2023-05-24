import { sxzz } from '@sxzz/eslint-config'

export default sxzz([
  {
    ignores: ['playground/vue2', 'playground/nuxt'],
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/valid-attribute-name': 'off',
      'vue/no-export-in-script-setup': 'off',
      'vue/no-dupe-keys': 'off',
    },
  },
  {
    files: ['**/*.md/*.{js,ts,vue}'],
    rules: {
      'no-var': 'off',
      'import/no-mutable-exports': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    files: ['playground/vue3/**'],
    rules: {
      'no-debugger': 'off',
      'no-console': 'off',
      'vue/require-prop-types': 'off',
      'vue/valid-define-props': 'off',
      'vue/valid-attribute-name': 'off',
      'import/no-default-export': 'off',
    },
  },
])
