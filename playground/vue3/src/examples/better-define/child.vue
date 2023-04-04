<script setup lang="ts">
import { type Warn } from './warning'
import { type BaseEmits, type BaseProps } from './types'
import { type DtsDemo } from './test-dts'

export interface Props extends BaseProps {
  msg: string
}
export interface Emits extends BaseEmits {
  (evt: 'click'): void
}
withDefaults(
  defineProps<
    Props & {
      union?: string | number
      nonStaticValue?: string
      warn?: Warn
    } & DtsDemo
  >(),
  {
    ...{ union: 'defaultValue' },
    ['non' + 'StaticValue']: 'defaultValue',
  }
)

defineEmits<Emits>()
</script>

<template>
  <div>bar</div>
</template>
