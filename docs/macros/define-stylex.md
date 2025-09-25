# defineStyleX <PackageVersion name="@vue-macros/define-stylex" />

<StabilityLevel level="experimental" />

Define and consume [StyleX](https://stylexjs.com/) styles in `<script setup>`.

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |
|       Vue 2        | :white_check_mark: |

## Setup

To use StyleX, you should install and configure StyleX first. The steps could change, you may want to check the [official document](https://stylexjs.com/) and the [document of StyleX bundler integrations](https://stylexjs.com/docs/learn/ecosystem/#third-party-bundler-integrations) for the latest information.

### Vite

```sh
pnpm add @stylexjs/stylex @stylex-extend/core @stylex-extend/vite -D
```

```ts [vite.config.ts] {1,13}
import { stylex } from '@stylex-extend/vite'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import VueMacros from 'vue-macros/vite'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
      },
    }),
    stylex(), // Must be placed after Vue Macros
  ],
})
```

```ts [main.ts] {2}
// import StyleX stylesheet, according to https://nonzzz.github.io/stylex-extend/integrations/vite
import 'virtual:stylex.css'
```

## Basic Usage

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

:::details Compiled Code (with some simplifications)

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
// virtual module to provide runtime code
// ---cut-start---
// @ts-ignore
// ---cut-end---
import stylex_attrs from '/vue-macros/define-stylex/stylex-attrs'

// ...
</script>

<template>
  <p v-bind="stylex_attrs(_stylex_props(styles.red))">Red</p>
</template>
```

:::

## Conditional Styles

Optional and multiple rules are supported.

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

:::details Compiled Code (with some simplifications)

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
// ---cut-start---
// @ts-ignore
// ---cut-end---
import stylex_attrs from '/vue-macros/define-stylex/stylex-attrs'

defineProps<{ bold?: boolean }>()
</script>

<template>
  <span v-bind="stylex_attrs(_stylex_props(styles.red, bold && styles.bold))"
    >Red</span
  >
</template>
```

:::
