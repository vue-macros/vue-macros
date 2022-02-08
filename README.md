# unplugin-vue-define-options

Provide a Vue 3 new marco `defineOptions`.

- ✨ With this marco, you can use Options API in `script-setup`.
- ⚡️ Supports Vite, Webpack, Vue CLI, Rollup, esbuild and more, powered by <a href="https://github.com/unjs/unplugin">unplugin</a>.

[Related issue](https://github.com/vuejs/core/issues/5218#issuecomment-1032107354)

Example:

```vue
<script setup lang="ts">
defineOptions({
  name: 'Foo',
  inheritAttrs: false,
})

defineProps<Props>()
// ...
</script>
```

and it will transform to

```vue
<script lang="ts">
export default {
  name: 'Foo',
  inheritAttrs: false,
}
</script>

<script lang="ts" setup>
defineProps<Props>()
// ...
</script>
```

## Installation

```bash
npm i unplugin-vue-define-options -D
```

```ts
// vite.config.ts
import DefineOptions from 'unplugin-vue-define-options/vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    DefineOptions(), // ⚠️ must be placed before `Vue()`
    Vue(),
  ],
})
```
