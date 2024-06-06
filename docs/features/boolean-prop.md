# booleanProp

<StabilityLevel level="experimental" />

Convert `<Comp checked />` to `<Comp :checked="true" />`.

Convert `<Comp !checked />` to `<Comp :checked="false" />`.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## Options

```ts
interface Options {
  /**
   * @default '!'
   */
  negativePrefix?: string
}
```

## Usage

```vue
<template>
  <Comp checked !enabled />
</template>
```

```vue
<script setup lang="ts">
// Comp.vue
defineProps<{
  checked?: any
  enabled: boolean
}>()
</script>
```
