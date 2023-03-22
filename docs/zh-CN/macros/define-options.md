# defineOptions

<small>稳定性: <code class="!text-green-600">稳定</code></small>

可以通过 `defineOptions` 宏在 `<script setup>` 中使用选项式 API，也就是说可以在一个宏函数中设置 `name`, `props`, `emits`, `render`。

如果你支持此功能，欢迎在 [RFC](https://github.com/vuejs/rfcs/discussions/430) 中点赞 :+1: 或发表评论。

|    特性    |        支持        |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Nuxt 3   | :white_check_mark: |
|   Vue 2    | :white_check_mark: |
| TypeScript | :white_check_mark: |

## 安装独立版本

如果你只需要 `defineOptions` 功能, 那么独立版本更适合你。

### 安装

::: code-group

```bash [npm]
npm i -D unplugin-vue-define-options @vue-macros/volar
```

```bash [yarn]
yarn add -D unplugin-vue-define-options @vue-macros/volar
```

```bash [pnpm]
pnpm add -D unplugin-vue-define-options @vue-macros/volar
```

:::

::: code-group

```ts [Vite]
// vite.config.ts
import DefineOptions from 'unplugin-vue-define-options/vite'

export default defineConfig({
  plugins: [DefineOptions()],
})
```

```ts [Rollup]
// rollup.config.js
import DefineOptions from 'unplugin-vue-define-options/rollup'

export default {
  plugins: [DefineOptions()],
}
```

```js [esbuild]
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('unplugin-vue-define-options/esbuild')()],
})
```

```js [Webpack]
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-vue-define-options/webpack')()],
}
```

:::

### TypeScript 支持

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-define-options/macros-global" /* ... */]
  }
}
```

## 基本用法

```vue {3-6}
<script setup lang="ts">
import { useSlots } from 'vue'
defineOptions({
  name: 'Foo',
  inheritAttrs: false,
})
const slots = useSlots()
</script>
```

::: details 编译后的代码

```vue
<script lang="ts">
export default {
  name: 'Foo',
  inheritAttrs: false,
}
</script>

<script setup>
const slots = useSlots()
</script>
```

:::

## `<script setup>` 中使用 JSX

```vue {3-5}
<script setup lang="tsx">
defineOptions({
  render() {
    return <h1>Hello World</h1>
  },
})
</script>
```

::: details 编译后的代码

```vue
<script lang="tsx">
export default {
  render() {
    return <h1>Hello World</h1>
  },
}
</script>
```

:::

## Volar 配置

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3, // 或 2.7 用于 Vue 2
    "plugins": [
      "@vue-macros/volar/define-options"
      // ...更多功能
    ]
  }
}
```
