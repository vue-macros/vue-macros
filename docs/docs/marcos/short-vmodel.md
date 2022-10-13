# shortVModel

Volar support :white_check_mark:

v-model: -> `::` / `$` / `*`

A shorthand for v-model.

If you have any questions about this feature, you can comment on [RFC Discussion](https://github.com/vuejs/rfcs/discussions/395).

## Setup

```bash
npm i @vue-macros/short-vmodel
```

Vite integration

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

## Usage

### `::` Double Binding

```vue
<template>
  <!-- prettier-ignore -->
  <input ::="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo ::msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

### `$` Dollar Sign (Recommended)

```vue
<template>
  <input $="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo $msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

## Known Issues

- Prettier will format `::=` to `:=`, prettier-ignore is required if prefix is `::`.
