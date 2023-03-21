# Reactivity Transform

<small>稳定性: <code class="!text-green-600">稳定</code></small>

|        特性        |        支持        |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

## 安装独立版本

如果你只需要 `Reactivity Transform` 功能，独立版本更适合你。

### 安装

::: code-group

```bash [npm]
npm i -D @vue-macros/reactivity-transform
```

```bash [yarn]
yarn add -D @vue-macros/reactivity-transform
```

```bash [pnpm]
pnpm add -D @vue-macros/reactivity-transform
```

:::

::: code-group

```ts [Vite]
// vite.config.ts
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'

export default defineConfig({
  plugins: [ReactivityTransform()],
})
```

```ts [Rollup]
// rollup.config.js
import ReactivityTransform from '@vue-macros/reactivity-transform/rollup'

export default {
  plugins: [ReactivityTransform()],
}
```

```js [esbuild]
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('@vue-macros/reactivity-transform/esbuild')()],
})
```

```js [Webpack]
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('@vue-macros/reactivity-transform/webpack')()],
}
```

:::

### TypeScript 支持

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["@vue-macros/reactivity-transform/macros-global" /* ... */]
  }
}
```

## 用法

参见 [官方文档](https://cn.vuejs.org/guide/extras/reactivity-transform.html).
