# defineOptions

<small>Stability: <code class="!text-green-600">stable</code></small>

Options API can be declared using the `defineOptions` in `<script setup>`, specifically to be able to set `name`, `props`, `emits`, and `render` inside of one function.

If you support this feature, feel free to hit like :+1: or comment on the [RFC Discussion](https://github.com/vuejs/rfcs/discussions/430). Thanks!

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

## Installation Standalone Version

if you need `defineOptions` feature only, the standalone version is more appropriate for you.

### Installation

:::: code-group

::: code-group-item npm

```bash
npm i -D unplugin-vue-define-options
```

:::

::: code-group-item yarn

```bash
yarn add -D unplugin-vue-define-options
```

:::

::: code-group-item pnpm

```bash
pnpm add -D unplugin-vue-define-options
```

:::

::::

:::: code-group

::: code-group-item Vite

```ts
// vite.config.ts
import DefineOptions from 'unplugin-vue-define-options/vite'

export default defineConfig({
  plugins: [DefineOptions()],
})
```

:::

::: code-group-item Rollup

```ts
// rollup.config.js
import DefineOptions from 'unplugin-vue-define-options/rollup'

export default {
  plugins: [DefineOptions()],
}
```

:::

::: code-group-item esbuild

```js
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('unplugin-vue-define-options/esbuild')()],
})
```

:::

::: code-group-item Webpack

```js
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-vue-define-options/webpack')()],
}
```

:::

::::

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

```vue {3-6}
<script setup lang="ts">
import { useSlots } from 'vue'
defineOptions({
  name: 'Foo',
  inheritAttrs: false,
})
const slots = useSlots()
</script>
```

::: details Compiled Code

```vue
<script lang="ts">
export default {
  name: 'Foo',
  inheritAttrs: false,
}
</script>

<script setup>
const slots = useSlots()
</script>
```

:::

## JSX in `<script setup>`

```vue {3-5}
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

## ℹ️ Vue 2.7 + Webpack

For Vue 2.7 (Vue loader 15) + Webpack, an additional option is required.

:::: code-group

::: code-group-item unplugin-vue-define-options

```ts
const config = {
  plugins: [
    defineOptions({
      include: [/\.vue$/, /\.vue\?vue/],
    }),
  ],
}
```

::: code-group-item unplugin-vue-define-options

```ts
const config = {
  plugins: [
    defineOptions({
      include: [/\.vue$/, /\.vue\?vue/],
    }),
  ],
}
```

:::

::: code-group-item unplugin-vue-macros

```ts
const config = {
  plugins: [
    VueMacros({
      defineOptions: {
        include: [/\.vue$/, /\.vue\?vue/],
      },
    }),
  ],
}
```

:::

::::
