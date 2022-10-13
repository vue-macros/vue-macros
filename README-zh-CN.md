# unplugin-vue-macros [![npm](https://img.shields.io/npm/v/unplugin-vue-macros.svg)](https://npmjs.com/package/unplugin-vue-macros)

[![Unit Test](https://github.com/sxzz/unplugin-vue-macros/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sxzz/unplugin-vue-macros/actions/workflows/unit-test.yml)

[English](./README.md) | 简体中文

探索并扩充更多宏和语法糖到 Vue。

## 特性

- ✨ 扩充 Vue 宏和语法糖；
- 💚 开箱即用支持 Vue 2 和 Vue 3；
- 🦾 完全支持 TypeScript；
- ⚡️ 支持 Vite、Webpack、Vue CLI、Rollup、esbuild 等, 由 [unplugin](https://github.com/unjs/unplugin) 提供支持。

## 安装

```bash
npm i unplugin-vue-macros -D
```

<details>
<summary>Vite (一流支持)</summary><br>

```ts
// vite.config.ts
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'
// import VueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
        // vueJsx: VueJsx(), // 如有需要
      },
    }),
  ],
})
```

<br></details>

<details>
<summary>Rollup (一流支持)</summary><br>

```ts
// rollup.config.js
import Vue from 'unplugin-vue/rollup'
import VueMacros from 'unplugin-vue-macros/rollup'

export default {
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
        // vueJsx: VueJsx(), // 如有需要
      },
    }),
  ],
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
    require('unplugin-vue-macros/esbuild')({
      plugins: {
        vue: require('unplugin-vue/esbuild')(),
        // vueJsx: VueJsx(), // 如有需要
      },
    }),
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
  plugins: [
    require('unplugin-vue-macros/webpack')({
      plugins: {
        vue: require('unplugin-vue/webpack')(),
        // vueJsx: VueJsx(), // 如有需要
      },
    }),
  ],
}
```

<br></details>

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

### Volar 支持

```bash
npm i -D @vue-macros/volar
```

```jsonc
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": [
      "@vue-macros/volar/define-model",
      "@vue-macros/volar/short-vmodel"
    ],
    // `shortVmodel` 特性的 prefix
    "shortVmodelPrefix": "$"
  }
}
```

## 使用

### `defineOptions`

在 `<script setup>` 中可使用 `defineOptions` 宏，以便在 `<script setup>` 中使用 Options API。
尤其是能够在一个函数中设置 `name`、`props`、`emit` 和 `render` 属性。

> **Note**: 如果你只需要 `defineOptions`，那么[单独的版本](https://github.com/sxzz/unplugin-vue-macros/tree/main/packages/define-options)更适合你。

如果支持本特性，请到 [RFC 讨论](https://github.com/vuejs/rfcs/discussions/430) 中点赞 👍，非常感谢！

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

✅ Volar 支持

在 `<script setup>` 中可使用 `defineModel` 宏。
可以像普通变量一样定义和使用 `v-model` 参数。

> **Warning**: 需要依赖 [Reactivity Transform](https://vuejs.org/guide/extras/reactivity-transform.html)。你应该先启动这个功能，否则会丢失响应式。

> **Warning**: 赋值表达式仅在 `<script setup>` 块中有效，换言之在 `<template>` 中无效。

#### 基础使用

```vue
<script setup lang="ts">
let { modelValue, count } = defineModel<{
  modelValue: string
  count: number
}>()

console.log(modelValue)
modelValue = 'newValue'
count++
</script>
```

<details>
<summary>输出代码</summary>

```vue
<script setup lang="ts">
const { modelValue, count } = defineProps<{
  modelValue: string
  count: number
}>()

const emit = defineEmits<{
  (evt: 'update:modelValue', value: string): void
  (evt: 'update:count', value: number): void
}>()

console.log(modelValue)
emit('update:modelValue', 'newValue')
emit('update:count', count + 1)
</script>
```

</details>

### `defineRender`

在 `<script setup>` 中可使用 `defineRender` 宏。
可以在 `<script setup>` 定义渲染函数。

#### Basic Usage

```vue
<script setup lang="tsx">
// 直接传递 JSX
defineRender(
  <div>
    <span>Hello</span>
  </div>
)

// 或者使用渲染函数
defineRender(() => {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
})
</script>
```

### `shortEmits`

简化 emits 的定义。

#### 基础使用

```vue
<script setup lang="ts">
const emits = defineEmits<
  // `ShortEmits` 或缩写成 `SE`
  SE<{
    // 元组
    'update:modelValue': [val: string]
    // 函数
    update(val: string): void
  }>
>()
</script>
```

### `shortVmodel`

✅ Volar 支持

`v-model:` -> `::` / `$`/ `*`

缩写 `v-model`。

如果有任何关于本功能的疑问，可以到 [RFC 讨论](https://github.com/vuejs/rfcs/discussions/395) 中留言。

#### 安装

```bash
npm i @vue-macros/short-vmodel
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { transformShortVmodel } from '@vue-macros/short-vmodel'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          nodeTransforms: [
            transformShortVmodel({
              // prefix: '::' | '$' | '*'
              prefix: '$', // defaults to '::'
            }),
          ],
        },
      },
    }),
  ],
})
```

#### 使用

##### `::` 双重绑定

```vue
<template>
  <!-- prettier-ignore -->
  <input ::="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo ::msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

##### `$` 符号 (推荐)

```vue
<template>
  <input $="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo $msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

#### 已知问题

- Prettier 会把 `::=` 格式化为 `:=`。如果 `prefix` 为 `::`，需要使用 `prettier-ignore`。

### `hoistStatic`

如果你想引用一个在 `<script setup>` 中声明的常量，这个功能可能会帮到你。

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

### `setupComponent` (⚠️ 实验性)

> **Warning**: 实验性功能，使用风险自负！

使用 `defineSetupComponent`，`<script setup>` 的代码可以在纯 JS/TS(X) 中使用，不需要 [Volar](https://github.com/johnsoncodehk/volar) 扩展。

#### 基础使用

```ts
export const App = defineSetupComponent(() => {
  defineProps<{
    foo: string
  }>()

  defineEmits<{
    (evt: 'change'): void
  }>()

  defineOptions({
    name: 'App',
  })

  // ...
})
```

### 类型标注

```ts
export const App: SetupFC = () => {
  defineProps<{
    foo: string
  }>()

  defineEmits<{
    (evt: 'change'): void
  }>()

  defineOptions({
    name: 'App',
  })
}
```

#### 已知问题

- [ ] source map 无法正常对应
- [ ] TypeScript 支持尚未完善

### `setupSFC` (⚠️ experimental)

> **Warning**: 实验性功能，使用风险自负！
>
> **Note**: 依赖 `defineOptions`。如果你正使用 `setupComponent`，那么 `defineOptions` 特性不能被禁用。

`<script setup>` 的代码可以在纯 JS/TS(X) 中使用，不需要 [Volar](https://github.com/johnsoncodehk/volar) 扩展。

#### 配置

以 Vite 为例：

```ts
// vite.config.ts
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    VueMacros(),
    Vue({
      include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/], // ⬅️ 需要添加额外的匹配
    }),
  ],
})
```

#### 基础使用

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

#### 已知问题

- [ ] JSX/TSX 文件中，source map 无法正常对应
- [ ] TypeScript 支持尚未完善

## 赞助

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## 贡献者

💕 感谢所有的贡献者！

<p align="center">
  <a href="https://github.com/sxzz/unplugin-vue-macros/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=sxzz/unplugin-vue-macros" />
  </a>
</p>

## 相关库

- [vue-functional-ref](https://github.com/sxzz/vue-functional-ref) - Vue 的函数式 Ref。

## 许可证

[MIT](./LICENSE) License © 2022 [三咲智子](https://github.com/sxzz)
