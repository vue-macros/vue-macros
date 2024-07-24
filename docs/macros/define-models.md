# defineModels <PackageVersion name="@vue-macros/define-models" />

<StabilityLevel level="stable" />

Declaring and mutate `v-model` props as the same as normal variable using the `defineModels`.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     | :white_check_mark: |
| Volar Plugin | :white_check_mark: |

## Options

```ts
VueMacros({
  defineModels: {
    /**
     * Unified mode, only works for Vue 2
     *
     * Converts `modelValue` to `value`
     */
    unified: false,
  },
})
```

## Basic Usage

Requires [`@vueuse/core`](https://www.npmjs.com/package/@vueuse/core), install it by yourself before using.

```vue twoslash
<script setup lang="ts">
const { modelValue, count } = defineModels<{
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
const { modelValue } = defineModels({
  modelValue: String,
})
</script>
```

:::

## With Model Options

```vue twoslash 3-6
<script setup lang="ts">
const { modelValue } = defineModels<{
  modelValue: ModelOptions<
    string,
    { defaultValue: 'something'; deep: true; passive: true }
  >
}>()
</script>
```

## With Reactivity Transform

::: warning

Assignment expression is only supported in `<script setup>` block. In other words invalid in `<template>`.

:::

[`@vueuse/core`](https://www.npmjs.com/package/@vueuse/core) is not required.

```vue twoslash {7-9}
<script setup lang="ts">
let { modelValue, count } = $defineModels<{
  modelValue: string
  count: number
}>()

console.log(modelValue)
modelValue = 'newValue'
count++
</script>
```

::: details Compiled Code

```vue twoslash
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

```jsonc {6,9-12}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3, // or 2.7 for Vue 2
    "plugins": [
      "@vue-macros/volar/define-models",
      // ...more feature
    ],
    "vueMacros": {
      "defineModels": {
        // Only works when target is 2.7.
        "unified": true,
      },
    },
  },
}
```
