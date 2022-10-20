# defineModel

Declaring and mutate `v-model` props as the same as normal variable using the `defineModel`.

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

## Options

```ts
VueMacros({
  defineModel: {
    /**
     * Unified mode, only works for Vue 2
     *
     * Converts `modelValue` to `value`
     */
    unified: false,
  },
})
```

## Usage

Requires [`@vueuse/core`](https://www.npmjs.com/package/@vueuse/core), install it by yourself before using.

```vue
<script setup lang="ts">
const { modelValue, count } = defineModel<{
  modelValue: string
  count: number
}>()

console.log(modelValue.value)
modelValue.value = 'newValue'
</script>
```

::: warning ❌ Object declaring is not supported.

```vue
<script setup lang="ts">
const { modelValue } = defineModel({
  modelValue: String,
})
</script>
```

:::

## With Reactivity Transform

::: warning

[Reactivity Transform](https://vuejs.org/guide/extras/reactivity-transform.html) is required. You should enable it first. Otherwise, it will lose the reactivity connection.

Unfortunately Reactivity Transform is not implemented in Vue 2, so this macro doesn't support Vue 2 now.

:::

::: warning

Assignment expression is only supported in `<script setup>` block. In other words invalid in `<template>`.

:::

[`@vueuse/core`](https://www.npmjs.com/package/@vueuse/core) is not required.

```vue{7-9}
<script setup lang="ts">
let { modelValue, count } = $defineModel<{
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

```jsonc{6,9-12}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3, // or 2.7 for Vue 2
    "plugins": [
      "@vue-macros/volar/define-model"
      // ...more feature
    ],
    "defineModel": {
      // Only works when target is 2.7.
      "unified": true
    }
  }
}
```
