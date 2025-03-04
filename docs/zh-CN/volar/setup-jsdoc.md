# setupJsdoc <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="stable" />

在 `script setup` 块里定义组件的 `JSDoc`。

|   Features   |     Supported      |
| :----------: | :----------------: |
| Volar Plugin | :white_check_mark: |

## 基本用法

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

### 有两个地方可以去定义

1. `script setup` 代码块的第一行.

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

2. 在 `export default` 表达式的上面.

::: tip

这个特性依赖于 `exportRender`，并确保 `exportRender` 没有被禁用。

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

## Volar 配置

```jsonc {3} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["vue-macros/volar"],
  },
}
```
