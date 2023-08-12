# Astro Integration

### Installation

::: code-group

```bash [npm]
npm i -D @vue-macros/astro
```

```bash [yarn]
yarn add -D @vue-macros/astro
```

```bash [pnpm]
pnpm add -D @vue-macros/astro
```

:::

## Configuration

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import Vue from '@astrojs/vue'
import Macros from '@vue-macros/astro'

export default defineConfig({
  integrations: [
    Vue(),
    Macros({
      // ... configs
    }),
  ],
})
```

## TypeScript Support & Volar Support

Same with [Bundler Integration](./bundler-integration.md#typescript-support)

## Limitations

[`shortVmodel`](../macros/short-vmodel.md) and [`booleanProp`](../features/boolean-prop.md) need to be explicitly added to the `template.compilerOptions.nodeTransforms`, cannot be auto injected.

Same with Vue 3 usage.

For example:

```ts
import { defineConfig } from 'astro/config'
import Vue from '@astrojs/vue'
import Macros from '@vue-macros/astro'
import { transformShortVmodel } from '@vue-macros/short-vmodel'

export default defineConfig({
  integrations: [
    Vue({
      jsx: true,
      template: {
        compilerOptions: {
          // explicit add transformShortVModel to node transforms
          nodeTransforms: [transformShortVmodel()],
        },
      },
    }),
    Macros(),
  ],
})
```

:tada: Congratulations! That's all.

To learn more about the macros, please visit [All Macros](/macros/) :laughing:.
