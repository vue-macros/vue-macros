# defineModel

Volar support :white_check_mark:

`defineModel` allow define and change v-model props as the same as normal variable.

::: warning Required

[Reactivity Transform](https://vuejs.org/guide/extras/reactivity-transform.html) is required. You should enable it first. Otherwise, it will lose the reactivity connection.

:::

::: warning

Assignment expression is only supported in `<script setup>` block. In other words invalid in `<template>`.

:::

## Basic Usage

```vue
<script setup lang="ts">
let { modelValue, count } = defineModel<{
  modelValue: string
  count: number
}>()

console.log(modelValue)
modelValue = 'newValue'
count++
</script>
```

::: details Output

```vue
<script setup lang="ts">
const { modelValue, count } = defineProps<{
  modelValue: string
  count: number
}>()

const emit = defineEmits<{
  (evt: 'update:modelValue', value: string): void
  (evt: 'update:count', value: number): void
}>()

console.log(modelValue)
emit('update:modelValue', 'newValue')
emit('update:count', count + 1)
</script>
```

:::
