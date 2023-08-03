# booleanProp

<StabilityLevel level="stable" />

Convert `<Comp checked />` to `<Comp :checked="true" />`.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## Setup

### Installation

```bash
npm i @vue-macros/boolean-prop
```

### Vite Integration

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

## Usage

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
