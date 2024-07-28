# defineOptions <PackageVersion name="unplugin-vue-define-options" />

<StabilityLevel level="stable" />

Options API can be declared using the `defineOptions` in `<script setup>`, specifically to be able to set `name`, `props`, `emits`, and `render` inside of one function.

For Vue >= 3.3, this feature will be turned off by default.

|  Features  |     Supported      |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Nuxt 3   | :white_check_mark: |
|   Vue 2    | :white_check_mark: |
| TypeScript | :white_check_mark: |

## Installation Standalone Version

if you need `defineOptions` feature only, the standalone version is more appropriate for you.

### Installation

::: code-group

```bash [npm]
npm i -D unplugin-vue-define-options @vue-macros/volar
```

```bash [yarn]
yarn add -D unplugin-vue-define-options @vue-macros/volar
```

```bash [pnpm]
pnpm add -D unplugin-vue-define-options @vue-macros/volar
```

:::

::: code-group

```ts [Vite]
// vite.config.ts
import DefineOptions from 'unplugin-vue-define-options/vite'

export default defineConfig({
  plugins: [DefineOptions()],
})
```

```ts [Rollup]
// rollup.config.js
import DefineOptions from 'unplugin-vue-define-options/rollup'

export default {
  plugins: [DefineOptions()],
}
```

```js [esbuild]
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('unplugin-vue-define-options/esbuild')()],
})
```

```js [Webpack]
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-vue-define-options/webpack')()],
}
```

:::

### TypeScript Support

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-define-options/macros-global" /* ... */]
  }
}
```

## Basic Usage

```vue twoslash {3-4}
<script setup lang="ts">
defineOptions({
  name: 'Foo',
  inheritAttrs: false,
})

defineProps<{
  foo: number
}>()
</script>

<template>
  <Foo :foo="1" />
</template>
```

::: details Compiled Code

```vue twoslash
<script lang="ts">
export default {
  name: 'Foo',
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
defineProps<{
  foo: number
}>()
</script>

<template>
  <Foo :foo="1" />
</template>
```

:::

## JSX in `<script setup>`

```vue twoslash {3-5}
<script setup lang="tsx">
defineOptions({
  render() {
    return <h1>Hello World</h1>
  },
})
</script>
```

::: details Compiled Code

```vue
<script lang="tsx">
export default {
  render() {
    return <h1>Hello World</h1>
  },
}
</script>
```

:::

## Volar Configuration

```jsonc {4}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["@vue-macros/volar"],
  },
}
```
