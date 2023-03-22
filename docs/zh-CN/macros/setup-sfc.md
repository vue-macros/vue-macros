# setupSFC

<small mr-2>
  稳定性: <code class="!text-red-600">实验性</code>
</small>
<WarnBadge>实验性功能，风险自负</WarnBadge>

::: tip

如果你使用的是 `setupSFC`，则不能禁用 `defineRender`。

:::

|        特性        |        支持        |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       |        :x:         |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar |        :x:         |

## 安装

::: code-group

```ts {7-11} [Vite]
// vite.config.ts
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    VueMacros(),
    Vue({
      include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
      //                   ⬆️ 需要添加 setup 模式
    }),
  ],
})
```

```ts {6-13} [Rollup]
import Vue from 'unplugin-vue/rollup'
import VueMacros from 'unplugin-vue-macros/rollup'

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

```tsx
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
