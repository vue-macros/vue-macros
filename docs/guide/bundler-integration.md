# Bundler Integration <PackageVersion name="vue-macros" />

## Installation

::: tip

Vite and Rollup are fully supported, while other bundlers have limited support.

:::

::: code-group

```bash [npm]
npm i -D vue-macros
```

```bash [yarn]
yarn add -D vue-macros
```

```bash [pnpm]
pnpm add -D vue-macros
```

:::

::: code-group

```ts [Vite]
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import VueMacros from 'vue-macros/vite'
// import VueJsx from '@vitejs/plugin-vue-jsx'
// import VueRouter from 'unplugin-vue-router/vite'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
        // vueJsx: VueJsx(), // if needed
        // vueRouter: VueRouter({ // if needed
        //   extensions: ['.vue', '.setup.tsx']
        // })
      },
      // overrides plugin options
    }),
  ],
})
```

```ts [Rollup]
// rollup.config.js (Requires Rollup 3+)
import Vue from 'unplugin-vue/rollup'
import VueMacros from 'vue-macros/rollup'
// import VueRouter from 'unplugin-vue-router/rollup'

export default {
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
        // vueJsx: VueJsx(), // if needed
        // vueRouter: VueRouter({ // if needed
        //   extensions: ['.vue', '.setup.tsx']
        // })
      },
      // overrides plugin options
    }),
  ],
}
```

```js [esbuild]
// esbuild.config.js
import { build } from 'esbuild'
// import VueRouter from 'unplugin-vue-router/esbuild'

build({
  plugins: [
    require('vue-macros/esbuild')({
      plugins: {
        vue: require('unplugin-vue/esbuild')(),
        // vueJsx: VueJsx(), // if needed
        // vueRouter: VueRouter({ // if needed
        //   extensions: ['.vue', '.setup.tsx']
        // })
      },
      // overrides plugin options
    }),
  ],
})
```

```js [Webpack]
// webpack.config.js (Requires Webpack 5+)
module.exports = {
  /* ... */
  plugins: [
    require('vue-macros/webpack')({
      // overrides plugin options
    }),
  ],
}
```

```js [Rspack]
// rspack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('vue-macros/rspack')({
      // overrides plugin options
    }),
  ],
}
```

```js [Rsbuild]
// rsbuild.config.js
module.exports = {
  // ...
  tools: {
    rspack: {
      plugins: [
        require('vue-macros/rspack')({
          // overrides plugin options
        }),
      ],
    },
  },
}
```

```js [Vue CLI]
// vue.config.js (Requires Vue CLI 5+)
const { defineConfig } = require('@vue/cli-service')
const VueMacros = require('vue-macros/webpack')

module.exports = defineConfig({
  // ...
  // ⚠️ IMPORTANT
  parallel: false,
  configureWebpack: {
    plugins: [
      VueMacros({
        // overrides plugin options
      }),
    ],
  },
})
```

:::

## Configuration

See the [Configurations](./configurations.md) for more details.

```ts twoslash [vue-macros.config.ts]
import { defineConfig } from 'vue-macros'
export default defineConfig({
  // options
})
```

## TypeScript Support

```json {0}
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["vue-macros/macros-global" /* ... */]
  }
}
```

## Volar Support

For detailed configuration, please refer to the description of the specific macro.

```jsonc [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["vue-macros/volar"],
  },
}
```

### Scoped Plugins

`exportExpose`, `exportProps`, and `exportRender` plugins cannot be used
at the same time unless providing a scope.

```ts twoslash [vue-macros.config.ts]
import { defineConfig } from 'vue-macros'
export default defineConfig({
  exportExpose: {
    include: ['**/export-expose/**'],
  },
  exportProps: {
    include: ['**/export-props/**'],
  },
  exportRender: {
    include: ['**/export-render/**'],
  },
})
```

---

:tada: Congratulations! You have successfully set up Vue Macros.

To learn more about the macros, please visit [All Macros](/macros/) :laughing:.
