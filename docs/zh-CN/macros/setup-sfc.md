# setupSFC

<StabilityLevel level="experimental" />

::: tip

如果你使用的是 `setupSFC`，则不能禁用 `defineRender`。

:::

|        特性        |        支持        |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar |        :x:         |

## 安装

::: code-group

```ts {7-11} [Vite]
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import VueMacros from 'unplugin-vue-macros/vite'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
          //                   ⬆️ 需要添加 setup 模式
        }),
      },
    }),
  ],
})
```

```ts {6-13} [Rollup]
import VueMacros from 'unplugin-vue-macros/rollup'
import Vue from 'unplugin-vue/rollup'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
          //                   ⬆️ 需要添加 setup 模式
        }),
      },
    }),
  ],
})
```

```[🚧 esbuild]
🚧
```

```[🚧 Webpack]
🚧
```

:::

## 基本用法

```tsx twoslash
// Foo.setup.tsx
defineProps<{
  foo: string
}>()

defineEmits<{
  (evt: 'change'): void
}>()

export default () => (
  <div>
    <h1>Hello World</h1>
  </div>
)
```

## 已知的问题

- Source map 在 JSX/TSX 文件中不能正确的映射。
- TypeScript 支持尚未完成。
