# defineStyleX <PackageVersion name="@vue-macros/define-stylex" />

<StabilityLevel level="experimental" />

在 `<script setup>` 定义与使用 [StyleX](https://stylexjs.com/) 的 Atomic CSS-in-JS.

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |
|       Vue 2        | :white_check_mark: |

## 配置

在使用这个宏之前，你需要先引入与配置 StyleX。步骤可能会有所变化，你可能需要查看 [StyleX 官方文档](https://stylexjs.com/) 以及 [vite-plugin-stylex](https://github.com/HorusGoul/vite-plugin-stylex) 的文档，以获取最新信息。

### Vite

```sh
pnpm add @stylexjs/stylex vite-plugin-stylex
```

```ts [vite.config.ts] {4,13}
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import StyleX from 'vite-plugin-stylex'
import VueMacros from 'vue-macros/vite'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
      },
    }),
    StyleX(), // 必须放在 Vue Macros 插件后
  ],
})
```

```vue [App.vue] {2-3}
<style>
/* 引入 StyleX 样式表, 参考： https://github.com/HorusGoul/vite-plugin-stylex */
@stylex stylesheet;
</style>
```

## 基本用法

```vue [App.vue] twoslash
<script setup lang="ts">
const styles = defineStyleX({
  red: { color: 'red' },
})

// ...
// ---cut-start---
declare const vStylex: any
// ---cut-end---
</script>

<template>
  <p v-stylex="styles.red">Red</p>
</template>
```

:::details 编译结果（有所简化）

```vue [App.vue] twoslash
<script lang="ts">
const styles = _stylex_create({
  red: { color: 'red' },
})
</script>

<script setup lang="ts">
import {
  create as _stylex_create,
  props as _stylex_props,
} from '@stylexjs/stylex'

// ...
</script>

<template>
  <p v-bind="_stylex_props(styles.red)">Red</p>
</template>
```

:::

## 条件样式

你可以应用多个样式，也可以根据条件应用样式。

```vue [App.vue] twoslash
<script setup lang="ts">
defineProps<{ bold?: boolean }>()

const styles = defineStyleX({
  red: { color: 'red' },
  bold: { fontWeight: 'bold' },
})
// ---cut-start---
declare const vStylex: any
// ---cut-end---
</script>

<template>
  <span v-stylex="(styles.red, bold && styles.bold)">Red</span>
</template>
```

:::details 编译结果（有所简化）

```vue [App.vue] twoslash
<script lang="ts">
const styles = _stylex_create({
  red: { color: 'red' },
  bold: { fontWeight: 'bold' },
})
</script>

<script setup lang="ts">
import {
  create as _stylex_create,
  props as _stylex_props,
} from '@stylexjs/stylex'

defineProps<{ bold?: boolean }>()
</script>

<template>
  <span v-bind="_stylex_props(styles.red, bold && styles.bold)">Red</span>
</template>
```

:::
