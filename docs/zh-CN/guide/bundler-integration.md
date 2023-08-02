# 打包器集成

### 安装

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

```ts [Vite (first-class support)]
// vite.config.ts
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'
// import VueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
        // vueJsx: VueJsx(), // 如果需要
      },
    }),
  ],
})
```

```ts [Rollup (first-class support)]
// rollup.config.js
import Vue from 'unplugin-vue/rollup'
import VueMacros from 'unplugin-vue-macros/rollup'

export default {
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
        // vueJsx: VueJsx(), // 如果需要
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
        // vueJsx: VueJsx(), // 如果需要
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

```js [Vue CLI]
// vue.config.js
const { defineConfig } = require('@vue/cli-service')
const VueMacros = require('unplugin-vue-macros/webpack')

module.exports = defineConfig({
  // ...
  // ⚠️ 重要
  parallel: false,
  configureWebpack: {
    plugins: [VueMacros({})],
  },
})
```

:::

## TypeScript 支持

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

## Volar 支持

有关宏的详细配置请参考每个宏的具体说明。

```bash
npm i -D @vue-macros/volar
```

```json
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": [
      "@vue-macros/volar/define-options",
      "@vue-macros/volar/define-models",
      "@vue-macros/volar/define-props",
      "@vue-macros/volar/define-props-refs",
      "@vue-macros/volar/short-vmodel",
      "@vue-macros/volar/define-slots",
      "@vue-macros/volar/export-props",
      "@vue-macros/volar/jsx-directive"
    ]
    // ...
  }
}
```

:tada: 恭喜你! 目前你已经成功将 `unplugin-vue-macros` 设置完成。

如果你还想要了解有关宏的更多信息, 请访问 [全部宏](/zh-CN/macros/) :laughing:。
