# defineModel

Declaring and mutate `v-model` props as the same as normal variable using the `defineModel`.

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Vue 2        |        :x:         |
| TypeScript / Volar | :white_check_mark: |

::: warning

[Reactivity Transform](https://vuejs.org/guide/extras/reactivity-transform.html) is required. You should enable it first. Otherwise, it will lose the reactivity connection.

Unfortunately Reactivity Transform is not implemented in Vue 2, so this macros doesn't support Vue 2 now.

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

::: details Compiled Code

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

## Volar Configuration

```jsonc{5}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": [
      "@vue-macros/volar/define-model"
      // ...more feature
    ]
  }
}
```
