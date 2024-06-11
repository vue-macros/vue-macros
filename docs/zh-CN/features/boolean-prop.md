# booleanProp

<StabilityLevel level="experimental" />

把 `<Comp checked />` 转换为 `<Comp :checked="true" />`。

把 `<Comp !checked />` 转换为 `<Comp :checked="false" />`。

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## 选项

```ts
interface Options {
  /**
   * @default '!'
   */
  negativePrefix?: string
}
```

## 基本用法

<!-- prettier-ignore-start -->
```vue twoslash
<script setup>
import type { FunctionalComponent } from 'vue'

export const Comp: FunctionalComponent<
  {
    checked: true,
    enabled: false,
  },
> = () => null
// ---cut---
// @noErrors
import Comp from './Comp.vue'
</script>

<template>
  <Comp checked !enabled />
  //             ^?
</template>
```
<!-- prettier-ignore-end -->

```vue twoslash
<script setup lang="ts">
// Comp.vue
defineProps<{
  checked: true
  enabled: false
}>()
</script>
```

## Volar 配置

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3,
    "plugins": [
      "@vue-macros/volar/boolean-prop",
      // ...更多功能
    ],
  },
}
```
