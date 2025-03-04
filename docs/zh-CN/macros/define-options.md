# defineOptions <PackageVersion name="unplugin-vue-define-options" />

<StabilityLevel level="stable" />

可以通过 `defineOptions` 宏在 `<script setup>` 中使用选项式 API，也就是说可以在一个宏函数中设置 `name`, `props`, `emits`, `render`。

在 Vue >= 3.3 中，此功能将默认关闭。

|    特性    |        支持        |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Nuxt 3   | :white_check_mark: |
|   Vue 2    | :white_check_mark: |
| TypeScript | :white_check_mark: |

## 安装独立版本

如果你只需要 `defineOptions` 功能, 那么独立版本更适合你。

### 安装

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

### TypeScript 支持

```json [tsconfig.json]
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-define-options/macros-global" /* ... */]
  }
}
```

## 基本用法

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

::: details 编译后的代码

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

## `<script setup>` 中使用 JSX

```vue twoslash {3-5}
<script setup lang="tsx">
defineOptions({
  render() {
    return <h1>Hello World</h1>
  },
})
</script>
```

::: details 编译后的代码

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

## Volar 配置

```jsonc {3} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["vue-macros/volar"],
  },
}
```
