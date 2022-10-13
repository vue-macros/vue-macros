# setupSFC

::: warning

Under experimental, use at your risk!

:::

::: tip

If you're using `setupSFC`, then `defineRender` cannot be disabled.

:::

|      Features      |        Supported        |
| :----------------: | :---------------------: |
|       Vue 3        |   :white_check_mark:    |
|       Vue 2        | :question: (Not Tested) |
| TypeScript / Volar |           :x:           |

## Setup

:::: code-group

::: code-group-item Vite

```ts{7-11}
// vite.config.ts
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    VueMacros(),
    Vue({
      include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
      //                   ⬆️ setupSFC pattern need to be added
    }),
  ],
})
```

:::

::: code-group-item Rollup

```ts{6-13}
import Vue from 'unplugin-vue/rollup'
import VueMacros from 'unplugin-vue-macros/rollup'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
          //                   ⬆️ setupSFC pattern need to be added
        }),
      },
    }),
  ],
})
```

:::

::: code-group-item 🚧 esbuild

:construction:

:::

::: code-group-item 🚧 Webpack

:construction:

:::

::::

## Basic Usage

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

## Known Issues

- The source map does not correspond properly in JSX/TSX files.
- TypeScript support is not yet complete.
