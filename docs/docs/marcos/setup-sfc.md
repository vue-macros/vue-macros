# setupSFC (Experimental)

::: warning

Under experimental, use at your risk!

:::

::: tip

`defineOptions` is required. If you're using setupComponent, then defineOptions cannot be disabled.

:::

## Setup

Using Vite as an example:

```ts
// vite.config.ts
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    VueMacros(),
    Vue({
      include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/], // ⬅️ setupSFC pattern need to be added
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
