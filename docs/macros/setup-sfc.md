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

Using Vite as an example:

```ts{7,9}
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
