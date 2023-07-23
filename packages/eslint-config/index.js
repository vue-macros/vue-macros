/** @type import('eslint-define-config').ESLintConfig */
const config = {
  globals: {
    $: 'readonly',
    $$: 'readonly',
    $ref: 'readonly',
    $shallowRef: 'readonly',
    $computed: 'readonly',
    $customRef: 'readonly',
    $defineModels: 'readonly',
    $defineProps: 'readonly',
    $definePropsRefs: 'readonly',
    $toRef: 'readonly',
    defineEmit: 'readonly',
    defineModels: 'readonly',
    defineOptions: 'readonly',
    defineProp: 'readonly',
    defineProps: 'readonly',
    defineRender: 'readonly',
    defineSetupComponent: 'readonly',
    defineSlots: 'readonly',
  },
  rules: {
    'vue/no-setup-props-destructure': 'off',
  },
}

module.exports = config
