# Reactivity Transform

<StabilityLevel level="stable" />

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

## Installation Standalone Version

if you need Reactivity Transform feature only, the standalone version is more appropriate for you.

### Installation

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

### TypeScript Support

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["@vue-macros/reactivity-transform/macros-global" /* ... */]
  }
}
```

## Usage

Refer to [official docs](https://vuejs.org/guide/extras/reactivity-transform.html).
