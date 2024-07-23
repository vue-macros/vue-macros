/* eslint perfectionist/sort-objects: "error" */
import type { Linter } from 'eslint'

export const globals: Linter.Globals = {
  $: 'readonly',
  $$: 'readonly',
  $computed: 'readonly',
  $customRef: 'readonly',
  $defineModels: 'readonly',
  $defineProps: 'readonly',
  $definePropsRefs: 'readonly',
  $ref: 'readonly',
  $shallowRef: 'readonly',
  $toRef: 'readonly',
  defineEmit: 'readonly',
  defineModels: 'readonly',
  defineOptions: 'readonly',
  defineProp: 'readonly',
  defineProps: 'readonly',
  defineRender: 'readonly',
  defineSetupComponent: 'readonly',
  defineSlots: 'readonly',
}

export const rules: Linter.RulesRecord = {
  'vue/no-setup-props-destructure': 'off',
  'vue/valid-v-bind': 'off',
}
