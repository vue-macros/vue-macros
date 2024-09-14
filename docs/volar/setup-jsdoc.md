# setupJsdoc <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="stable" />

Define the component's JSDoc in the script setup block.

|   Features   |     Supported      |
| :----------: | :----------------: |
| Volar Plugin | :white_check_mark: |

## Basic Usage

````vue twoslash
<script setup lang="tsx">
/**
 * @example
 * ```vue
 * <Comp :foo="1" />
 * ```
 */
const Comp = () => <div />
// ---cut---
// @noErrors
import Comp from './Comp.vue'
//     ^?
</script>

<template>
  <Comp />
</template>
````

### There are two places to define

1. The first line of the script setup block.

````vue
<script setup lang="ts">
/**
 * @example
 * ```vue
 * <Comp :foo="1" />
 * ```
 */

defineProps<{
  foo: number
}>()
</script>
````

2. Above the `export default` expression.

::: tip

This feature depends on `exportRender`, and make sure `exportRender` is not disabled.

:::

````vue
<script setup lang="tsx">
defineProps<{
  foo: number
}>()

/**
 * @example
 * ```vue
 * <Comp :foo="1" />
 * ```
 */
export default <div />
</script>
````

## Volar Configuration

```jsonc {3} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
  },
}
```
