/* eslint perfectionist/sort-objects: "error" */
import type { Rules } from '@sxzz/eslint-config'
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
  'vue/no-export-in-script-setup': 'off', // exportRender / exportExpose / exportProps
  'vue/valid-attribute-name': 'off', // short-vmodel
  'vue/valid-define-props': 'off', // hoistStatic
  'vue/valid-v-bind': 'off', // shortBind + shortVmodel
} satisfies Rules
