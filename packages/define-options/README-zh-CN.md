# unplugin-vue-define-options [![npm](https://img.shields.io/npm/v/unplugin-vue-define-options.svg)](https://npmjs.com/package/unplugin-vue-define-options)

[English](./README.md) | 简体中文

在 `<script setup>` 中可使用 `defineOptions` 宏，以便在 `<script setup>` 中使用 Options API。
尤其是能够在一个函数中设置 `name`、`props`、`emit` 和 `render` 属性。

## 特性

- ✨ 有了这个宏，你就可以在 `<script setup>` 使用 Options API；
- 💚 开箱即用支持 Vue 2 和 Vue 3；
- 🦾 完全支持 TypeScript；
- ⚡️ 支持 Vite、Webpack、Vue CLI、Rollup、esbuild 等, 由 [unplugin](https://github.com/unjs/unplugin) 提供支持。

### 讨论

- [相关 issue](https://github.com/vuejs/core/issues/5218#issuecomment-1032107354)
- [RFC](https://github.com/vuejs/rfcs/discussions/430)

## 使用

### 基本示例

```vue
<script setup lang="ts">
import { useSlots } from 'vue'
defineOptions({
  name: 'Foo',
  inheritAttrs: false,
})
const slots = useSlots()
</script>
```

<details>
<summary>输出代码</summary>

```vue
<script lang="ts">
export default {
  name: 'Foo',
  inheritAttrs: false,
  props: {
    msg: { type: String, default: 'bar' },
  },
  emits: ['change', 'update'],
}
</script>

<script setup>
const slots = useSlots()
</script>
```

</details>

### 在 `<script setup>` 使用 JSX

```vue
<script setup lang="tsx">
defineOptions({
  render() {
    return <h1>Hello World</h1>
  },
})
</script>
```

<details>
<summary>输出代码</summary>

```vue
<script lang="tsx">
export default {
  render() {
    return <h1>Hello World</h1>
  },
}
</script>
```

</details>

## 安装

```bash
npm i unplugin-vue-define-options -D
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import DefineOptions from 'unplugin-vue-define-options/vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [Vue(), DefineOptions()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import DefineOptions from 'unplugin-vue-define-options/rollup'

export default {
  plugins: [DefineOptions()], // Must be before Vue plugin!
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [
    require('unplugin-vue-define-options/esbuild')(), // Must be before Vue plugin!
  ],
})
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-vue-define-options/webpack')()],
}
```

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [require('unplugin-vue-define-options/webpack')()],
  },
}
```

<br></details>

#### TypeScript 支持

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-define-options/macros-global" /* ... */]
  }
}
```

## 赞助

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## 许可证

[MIT](./LICENSE) License © 2022 [三咲智子](https://github.com/sxzz)
