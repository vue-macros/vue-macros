# Bundler Integration

### Installation

::: code-group

```bash [npm]
npm i -D unplugin-vue-macros
```

```bash [yarn]
yarn add -D unplugin-vue-macros
```

```bash [pnpm]
pnpm add -D unplugin-vue-macros
```

:::

::: code-group

```ts [Vite]
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import VueMacros from 'unplugin-vue-macros/vite'
// import VueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
        // vueJsx: VueJsx(), // if needed
      },
    }),
  ],
})
```

```ts [Rollup]
// rollup.config.js
import VueMacros from 'unplugin-vue-macros/rollup'
import Vue from 'unplugin-vue/rollup'

export default {
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
        // vueJsx: VueJsx(), // if needed
      },
    }),
  ],
}
```

```js [esbuild]
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [
    require('unplugin-vue-macros/esbuild')({
      plugins: {
        vue: require('unplugin-vue/esbuild')(),
        // vueJsx: VueJsx(), // if needed
      },
    }),
  ],
})
```

```js [Webpack]
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-vue-macros/webpack')({})],
}
```

```js [Rspack]
// rspack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-vue-macros/rspack')({})],
}
```

```js [Vue CLI]
// vue.config.js
const { defineConfig } = require('@vue/cli-service')
const VueMacros = require('unplugin-vue-macros/webpack')

module.exports = defineConfig({
  // ...
  // ⚠️ IMPORTANT
  parallel: false,
  configureWebpack: {
    plugins: [VueMacros({})],
  },
})
```

:::

::: tip

Vite and Rollup are fully supported, while other bundlers have limited support.

:::

## TypeScript Support

::: code-group

```json {0} [Vue 3]
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-macros/macros-global" /* ... */]
  }
}
```

```json {0} [Vue 2]
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-macros/vue2-macros-global" /* ... */]
  }
}
```

:::

## Volar Support

For detailed configuration, please refer to the description of the specific macro.

```bash
npm i -D @vue-macros/volar
```

```jsonc
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["@vue-macros/volar"],
    "vueMacros": {
      "setupSFC": true,
      "defineEmit": true,
      "defineProp": true,
      "scriptLang": true,
      "booleanProp": true,
      "templateRef": true,
      "defineGeneric": true,

      // Choose only one of the following
      // "exportProps": true
      // "exportExpose": true
    },
  },
}
```

### Scoped Plugins

`export-expose` and `export-props` plugins cannot be used at the same time unless providing a scope.

```jsonc
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["@vue-macros/volar"],
    "vueMacros": {
      "exportExpose": {
        "include": ["**/export-expose/**"],
      },
      "exportProps": {
        "include": ["**/export-props/**"],
      },
    },
  },
}
```

---

:tada: Congratulations! You have successfully set up Vue Macros.

To learn more about the macros, please visit [All Macros](/macros/) :laughing:.
