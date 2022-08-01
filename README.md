# unplugin-vue-macros [![npm](https://img.shields.io/npm/v/unplugin-vue-macros.svg)](https://npmjs.com/package/unplugin-vue-macros)

[![Unit Test](https://github.com/sxzz/unplugin-vue-macros/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sxzz/unplugin-vue-macros/actions/workflows/unit-test.yml)

English | [简体中文](./README-zh-CN.md)

Extend macros and syntax sugar in Vue.

## Features

- ✨ Extend macros and syntax sugar in Vue.
- 💚 Supports both Vue 2 and Vue 3 out-of-the-box.
- 🦾 Full TypeScript support.
- ⚡️ Supports Vite, Webpack, Vue CLI, Rollup, esbuild and more, powered by [unplugin](https://github.com/unjs/unplugin).

## Installation

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

## Usage

### `defineOptions`

Introduce a macro in `<script setup>`, `defineOptions`,
to use Options API in `<script setup>`, specifically to be able to set `name`, `props`, `emits` and `render` in one function.

> **Note**: if you only need `defineOptions`, [the standalone version](https://github.com/sxzz/unplugin-vue-macros/tree/main/packages/define-options) is better for you.

#### Basic Usage

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
<summary>Output</summary>

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

#### JSX in `<script setup>`

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
<summary>Output</summary>

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

Introduce a macro in `<script setup>`, `defineModel`.
To be able define and change `v-model` props as the same as normal variable.

> **Warning**: [Reactivity Transform](https://vuejs.org/guide/extras/reactivity-transform.html) is required. You should enable it first. Otherwise, it will lose the reactivity connection.

#### Basic Usage

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
<summary>Output</summary>

```vue
<script setup lang="ts">
const { modelValue } = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (evt: 'update:modelValue', value: string): void
}>()

console.log(modelValue)
console.log(emit('update:modelValue', 'newValue'))
</script>
```

</details>

### TypeScript Support

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-macros" /* ... */]
  }
}
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2022 [三咲智子](https://github.com/sxzz)
