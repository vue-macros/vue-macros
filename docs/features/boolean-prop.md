# booleanProp <PackageVersion name="@vue-macros/boolean-prop" />

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

## Volar Configuration

```jsonc {4,6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["@vue-macros/volar"],
    "vueMacros": {
      "booleanProp": true,
    },
  },
}
```
