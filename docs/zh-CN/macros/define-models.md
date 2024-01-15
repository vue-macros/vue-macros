# defineModels

<StabilityLevel level="stable" />

使用 `defineModels` 可以简化声明和修改 `v-model` 值的步骤，就像是在使用一个普通变量一样。

|     特性     |        支持        |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     | :white_check_mark: |
| Volar Plugin | :white_check_mark: |

## 选项

```ts
VueMacros({
  defineModels: {
    /**
     * Unified 模式，仅在 Vue 2 下有效
     *
     * 将 `modelValue` 转换为 `value`
     */
    unified: false,
  },
})
```

## 基本用法

在开始之前，请先自行安装 [`@vueuse/core`](https://www.npmjs.com/package/@vueuse/core)

```vue
<script setup lang="ts">
const { modelValue, count } = defineModels<{
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
const { modelValue } = defineModels({
  modelValue: String,
})
</script>
```

:::

## model 选项

```vue 3-6
<script setup lang="ts">
const { modelValue } = defineModels<{
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

[`@vueuse/core`](https://www.npmjs.com/package/@vueuse/core) 在这不是必需的。

```vue {7-9}
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

::: details 编译后的代码

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
    "target": 3, // 或 2.7 用于 Vue 2
    "plugins": [
      "@vue-macros/volar/define-models",
      // ...更多功能
    ],
    "vueMacros": {
      "defineModels": {
        // 仅在 target 是 2.7 时有效
        "unified": true,
      },
    },
  },
}
```
