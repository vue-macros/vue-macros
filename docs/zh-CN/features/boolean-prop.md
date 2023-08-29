# booleanProp

<StabilityLevel level="experimental" />

把 `<Comp checked />` 转换为 `<Comp :checked="true" />`。

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## 基本用法

```vue
<template>
  <Comp checked />
</template>
```

```vue
<script setup lang="ts">
// Comp.vue
defineProps<{
  checked?: any
}>()
</script>
```
