/** @type import('eslint-define-config').ESLintConfig */
const config = {
  globals: {
    $: 'readonly',
    $$: 'readonly',
    $ref: 'readonly',
    $shallowRef: 'readonly',
    $computed: 'readonly',
    $customRef: 'readonly',
    $toRef: 'readonly',
  },
  rules: {
    'vue/no-setup-props-destructure': 'off',
  },
}

module.exports = config
