# defineStyleX <PackageVersion name="@vue-macros/define-stylex" />

<StabilityLevel level="experimental" />

Define and consume [StyleX](https://stylexjs.com/) styles in `<script setup>`.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
| Volar Plugin | :white_check_mark: |
|    Vue 2     | :white_check_mark: |

## Setup

To use StyleX, you should install and configure StyleX first.

### Vite

```sh
pnpm add @stylexjs/stylex vite-plugin-stylex
```

```ts {4,13}
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'
import styleX from 'vite-plugin-stylex'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
      },
    }),
    styleX(), // Must be placed after VueMacros
  ],
})
```

```vue twoslash {9-10}
<!--App.vue-->
<template>
  <div>some content</div>
</template>

<style>
/* import StyleX stylesheet, according to https://github.com/HorusGoul/vite-plugin-stylex */
@stylex stylesheet;
</style>
```

## Basic Usage

```vue twoslash
<script setup lang="ts">
const styles = defineStyleX({
  red: { color: 'red' },
})
</script>

<template>
  <p v-stylex="styles.red">Red Text</p>
</template>
```

:::details Compiled Code

```vue twoslash
<script lang="ts">
import {
  create as _stylex_create,
  attrs as stylex_attrs,
} from '@stylexjs/stylex'

const styles = _stylex_create({
  red: { color: 'red' },
})
</script>

<template>
  <p v-bind="_stylex_attrs(styles.red)">Red Text</p>
</template>
```

:::

Optional and multiple rules are supported.

```vue twoslash
<script setup lang="ts">
defineProps<{ bold?: boolean }>()
const styles = defineStyleX({
  red: { color: 'red' },
  bold: { fontWeight: 'bold' },
})
</script>

<template>
  <p><span v-stylex="(styles.red, bold && styles.bold)">Red</span> Text</p>
</template>
```

:::details Compiled Code

```vue twoslash
<script lang="ts">
const styles = _stylex_create({
  red: { color: 'red' },
  bold: { fontWeight: 'bold' },
})
</script>

<script setup lang="ts">
import {
  attrs as _stylex_attrs,
  create as _stylex_create,
} from '@stylexjs/stylex'
defineProps<{ bold?: boolean }>()
</script>

<template>
  <p>
    <span v-bind="_stylex_attrs(styles.red, bold && styles.bold)">Red</span>
    Text
  </p>
</template>
```

:::
