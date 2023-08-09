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
import { defineConfig } from 'astro/config'
import Vue from '@astrojs/vue'
import Macros from '@vue-macros/astro'

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

与 [Bundler Integration](./bundler-integration.md#typescript-support) 一致。

## 缺陷

[`shortVmodel`](../macros/short-vmodel.md) 和 [`booleanProp`](../features/boolean-prop.md) 需要被显式添加到 `template.compilerOptions.nodeTransforms` 中，没有办法通过集成自动注入。

与 Vue 3 的使用方式一致。

如下所示：

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
          // 显式地配置 nodeTransforms
          nodeTransforms: [transformShortVmodel()],
        },
      },
    }),
    Macros(),
  ],
})
```

:tada: 恭喜你! 现在已经成功完成了对 Astro 的集成过程。

如果你还想要了解有关宏的更多信息, 请访问 [全部宏](/zh-CN/macros/) :laughing:。
