# Astro 集成

### 安装

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

## 配置

```ts
// astro.config.mjs
import Vue from '@astrojs/vue'
import Macros from '@vue-macros/astro'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [
    Vue(),
    Macros({
      // ... 如果需要，在这里配置插件
    }),
  ],
})
```

## TypeScript 支持 和 Volar 支持

参见 [打包器集成](./bundler-integration.md#typescript-support) 的对应章节。

---

:tada: 恭喜你! 现在已经成功完成了对 Astro 的集成过程。

如果你还想要了解有关宏的更多信息, 请访问 [全部宏](/zh-CN/macros/) :laughing:。
