# defineModel

<small>稳定性: <code class="!text-green-600">稳定</code></small>

<!-- 使用 `defineModel`声明和改变 `v-model` 的 props 和普通变量相同。 -->

使用 `defineModel` 可以简化之前声明和改变 `v-model` 的步骤，让你可以像使用普通变量那样去使用。

|     特性     |        支持        |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     | :white_check_mark: |
| Volar Plugin | :white_check_mark: |

## 选项

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

## 用法

> 在开始之前，请先自行安装 [`@vueuse/core`](https://www.npmjs.com/package/@vueuse/core)

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

::: warning ❌ 不支持对象声明

```vue
<script setup lang="ts">
const { modelValue } = defineModel({
  modelValue: String,
})
</script>
```

:::

## With Model Options

```vue 3-6
<script setup lang="ts">
const { modelValue } = defineModel<{
  modelValue: ModelOptions<
    string,
    { defaultValue: 'something'; deep: true; passive: true }
  >
}>()
</script>
```

## 响应性语法糖

::: warning

赋值表达式 仅在 `<script setup>` 块中受支持。换句话说，在 `<template>`中无效。

:::

> [`@vueuse/core`](https://www.npmjs.com/package/@vueuse/core) 在这不是必需的。

```vue {7-9}
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

::: details 编译后代码

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

## Volar 配置

```jsonc {6,9-12}
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
