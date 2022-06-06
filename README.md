# unplugin-vue-define-options [![npm](https://img.shields.io/npm/v/unplugin-vue-define-options.svg)](https://npmjs.com/package/unplugin-vue-define-options)

[![Unit Test](https://github.com/sxzz/unplugin-vue-define-options/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sxzz/unplugin-vue-define-options/actions/workflows/unit-test.yml)

Introduce a macro in script setup, `defineOptions`, to use Options API in script setup, specifically to be able to set `name`, `props`, `emits` and `render` in one function.

## Features

- ✨ With this marco, you can use Options API in `script-setup`.
- ⚡️ Supports Vite, Webpack, Vue CLI, Rollup, esbuild and more, powered by <a href="https://github.com/unjs/unplugin">unplugin</a>.

### Discussion

- [Related issue](https://github.com/vuejs/core/issues/5218#issuecomment-1032107354)
- [RFC](https://github.com/vuejs/rfcs/discussions/430)

## Usage

### Basic example

```vue
<script setup lang="ts">
import { useSlots } from 'vue'
defineOptions({
  name: 'Foo',
  inheritAttrs: false,
  props: {
    msg: { type: String, default: 'bar' },
  },
  emits: ['change', 'update'],
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

### JSX in `script-setup`

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

## Installation

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

#### TypeScript Support

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-define-options" /* ... */]
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
