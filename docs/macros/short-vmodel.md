# shortVmodel

<small>Stability: <code class="!text-yellow-600">unstable</code></small>

A shorthand for `v-model`.

`v-model` -> `::` / `$` / `*`

If you have any questions about this feature, you can comment on [RFC Discussion](https://github.com/vuejs/rfcs/discussions/395).

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Vue 2        |        :x:         |
| TypeScript / Volar | :white_check_mark: |

## Setup

### Installation

```bash
npm i @vue-macros/short-vmodel
```

### Vite Integration

```ts {9-17}
// vite.config.ts
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import { transformShortVmodel } from '@vue-macros/short-vmodel'

export default defineConfig({
  plugins: [
    Vue({
      template: {
        compilerOptions: {
          nodeTransforms: [
            transformShortVmodel({
              prefix: '$',
            }),
          ],
        },
      },
    }),
  ],
})
```

## Options

`prefix`: `'::' | '$' | '*'`, defaults to `'::'`

## Usage

### `::` Double Binding (Default)

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

### `*` Asterisk Sign

```vue
<template>
  <input *="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo *msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

## Volar Configuration

```jsonc {5,9}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": [
      "@vue-macros/volar/short-vmodel"
      // ...
    ],
    // prefix
    "shortVmodel": {
      "prefix": "$"
    }
  }
}
```

## Known Issues

- Prettier will format `::=` to `:=`, prettier-ignore is required if prefix is `::`.
