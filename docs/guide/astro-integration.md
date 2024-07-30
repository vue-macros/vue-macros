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
import Vue from '@astrojs/vue'
import Macros from '@vue-macros/astro'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [
    Vue(),
    Macros({
      // overrides config options
    }),
  ],
})
```

## TypeScript Support & Volar Support

See the corresponding chapter on [Bundler Integration](./bundler-integration.md#typescript-support)

---

:tada: Congratulations! That's all.

To learn more about the macros, please visit [All Macros](/macros/) :laughing:.
