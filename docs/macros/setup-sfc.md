# setupSFC <PackageVersion name="@vue-macros/setup-sfc" />

<StabilityLevel level="experimental" />

::: tip

If you're using `setupSFC`, then `defineRender` cannot be disabled.

:::

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

## Setup

::: code-group

```ts {7-14} [Vite]
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import VueMacros from 'vue-macros/vite'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
          //                   ⬆️ setupSFC pattern need to be added
        }),
      },
    }),
  ],
})
```

```ts {6-13} [Rollup]
import Vue from 'unplugin-vue/rollup'
import VueMacros from 'vue-macros/rollup'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
          //                   ⬆️ setupSFC pattern need to be added
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

## Basic Usage

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

## Volar Configuration

```jsonc {3,5} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["vue-macros/volar"],
    "vueMacros": {
      "setupSFC": true,
    },
  },
}
```
