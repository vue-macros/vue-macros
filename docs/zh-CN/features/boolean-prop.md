# booleanProp

<StabilityLevel level="experimental" />

把 `<Comp checked />` 转换为 `<Comp :checked="true" />`。

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## 设置

### 安装

```bash
npm i -D @vue-macros/boolean-prop
```

### Vite 集成

```ts {9-13}
// vite.config.ts
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import { transformBooleanProp } from '@vue-macros/boolean-prop'

export default defineConfig({
  plugins: [
    Vue({
      template: {
        compilerOptions: {
          nodeTransforms: [transformBooleanProp()],
        },
      },
    }),
  ],
})
```

## 基本用法

```vue
<template>
  <Comp checked />
</template>
```

```vue
<script setup lang="ts">
// Comp.vue
defineProps<{
  checked?: any
}>()
</script>
```
