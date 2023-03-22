# shortVmodel

<small>稳定性: <code class="!text-green-600">稳定</code></small>

`v-model` 的语法糖。

`v-model` -> `::` / `$` / `*`

如果你对此功能有任何疑问，欢迎在 [RFC](https://github.com/vuejs/rfcs/discussions/395) 中发表评论。

|     特性     |        支持        |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## 设置

### 安装

```bash
npm i @vue-macros/short-vmodel
```

### Vite 集成

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

## 选项

`prefix`: `'::' | '$' | '*'`，默认为 `'$'`

## 用法

### `$` 美元符号 (默认)

```vue
<template>
  <input $="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo $msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

### `::` 双引号

```vue
<template>
  <!-- prettier-ignore -->
  <input ::="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo ::msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

### `*` 星号

```vue
<template>
  <input *="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo *msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

## Volar 配置

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

## 已知的问题

- Prettier 会将 `::=` 格式化为 `:=`，如果 prefix 为 `::`，则需要 prettier-ignore
