# betterDefine

<small>Stability: <code class="!text-green-600">stable</code></small>

With enabling `betterDefine`, imported types is supported in `<script setup>` type-based-macros.

[Related issue](https://github.com/vuejs/core/issues/4294)

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

## Basic Usage

:::: code-group

::: code-group-item App.vue

```vue
<script setup lang="ts">
import type { BaseProps } from './types'

interface Props extends BaseProps {
  foo: string
}
defineProps<Props>()
</script>
```

:::

::: code-group-item types.ts

```ts
export interface BaseProps {
  title: string
}
```

:::

::::
