# booleanProp

<StabilityLevel level="experimental" />

Convert `<Comp checked />` to `<Comp :checked="true" />`.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## Usage

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
