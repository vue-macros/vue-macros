# defineOptions

<small>稳定性: <code class="!text-green-600">稳定</code></small>

可以使用 `defineOptions`函数在 `<script setup>`中使用选项式 API，也就是说我们可以把 `name`, `props`, `emits`, `render` 放到一个函数里。

如果你支持此功能，欢迎在 [RFC](https://github.com/vuejs/rfcs/discussions/430) 中点赞 :+1: 或发表评论。

|    特性    |        支持        |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Nuxt 3   | :white_check_mark: |
|   Vue 2    | :white_check_mark: |
| TypeScript | :white_check_mark: |

## 安装独立版本

如果你只需要 `defineOptions` 功能, 那么独立版本更加适合你。

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

::: details 编译后代码

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

## JSX in `<script setup>`

```vue {3-5}
<script setup lang="tsx">
defineOptions({
  render() {
    return <h1>Hello World</h1>
  },
})
</script>
```

::: details 编译后代码

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

## Volar Configuration

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3, // or 2.7 for Vue 2
    "plugins": [
      "@vue-macros/volar/define-options"
      // ...more feature
    ]
  }
}
```
