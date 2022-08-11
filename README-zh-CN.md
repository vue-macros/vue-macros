# unplugin-vue-macros [![npm](https://img.shields.io/npm/v/unplugin-vue-macros.svg)](https://npmjs.com/package/unplugin-vue-macros)

[![Unit Test](https://github.com/sxzz/unplugin-vue-macros/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sxzz/unplugin-vue-macros/actions/workflows/unit-test.yml)

[English](./README.md) | 简体中文

扩充 Vue 宏和语法糖。

## 特性

- 扩充 Vue 宏和语法糖；
- 💚 开箱即用支持 Vue 2 和 Vue 3；
- 🦾 完全支持 TypeScript；
- ⚡️ 支持 Vite、Webpack、Vue CLI、Rollup、esbuild 等, 由 [unplugin](https://github.com/unjs/unplugin) 提供支持。

## 安装

```bash
npm i unplugin-vue-macros -D
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import VueMarcos from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [Vue(), VueMarcos()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import VueMarcos from 'unplugin-vue-macros/rollup'

export default {
  plugins: [VueMarcos()], // Must be before Vue plugin!
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
    require('unplugin-vue-macros/esbuild')(), // Must be before Vue plugin!
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
  plugins: [require('unplugin-vue-macros/webpack')()],
}
```

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [require('unplugin-vue-macros/webpack')()],
  },
}
```

<br></details>

## 使用

### `defineOptions`

在 `<script setup>` 中可使用 `defineOptions` 宏，以便在 `<script setup>` 中使用 Options API。
尤其是能够在一个函数中设置 `name`、`props`、`emit` 和 `render` 属性。

> **Note**: 如果你只需要 `defineOptions`，那么[单独的版本](https://github.com/sxzz/unplugin-vue-macros/tree/main/packages/define-options)更适合你。

#### 基础使用

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
}
</script>

<script setup>
const slots = useSlots()
</script>
```

</details>

#### 在 `<script setup>` 使用 JSX

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

### `defineModel`

在 `<script setup>` 中可使用 `defineModel` 宏。
可以像普通变量一样定义和使用 `v-model` 参数。

> **Warning**: 需要依赖 [Reactivity Transform](https://vuejs.org/guide/extras/reactivity-transform.html)。你应该先启动这个功能，否则会丢失响应式。

#### 基础使用

```vue
<script setup lang="ts">
let { modelValue } = defineModel<{
  modelValue: string
}>()

console.log(modelValue)
modelValue = 'newValue'
</script>
```

<details>
<summary>输出代码</summary>

```vue
<script setup lang="ts">
const { modelValue } = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (evt: 'update:modelValue', value: string): void
}>()

console.log(modelValue)
emit('update:modelValue', 'newValue')
</script>
```

</details>

### `hoistStatic`

如果你想中引用一个在 `<script setup>` 声明的常量，这个功能可能会帮到你。

如果支持本特性，请到 [Vue PR](https://github.com/vuejs/core/pull/5752) 中点赞 👍，非常感谢！

#### 基础使用

```vue
<script setup lang="ts">
const name = 'AppFoo'
defineOptions({
  name,
})
</script>
```

<details>
<summary>输出代码</summary>

```vue
<script lang="ts">
const name = 'AppFoo'
export default {
  name,
}
</script>
```

</details>

#### 魔法注释

```vue
<script setup lang="ts">
const name = /* hoist-static */ fn() // 一个甚至不是常量的值
defineOptions({
  name,
})
</script>
```

<details>
<summary>输出代码</summary>

```vue
<script lang="ts">
const name = fn()
export default {
  name,
}
</script>
```

</details>

### TypeScript 支持

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-macros/macros-global" /* ... */]
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
