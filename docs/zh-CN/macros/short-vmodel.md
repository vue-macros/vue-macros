# shortVmodel

<StabilityLevel level="stable" />

`v-model` 的语法糖。

`v-model` -> `::` / `$` / `*`

如果你对此功能有任何疑问，欢迎在 [RFC](https://github.com/vuejs/rfcs/discussions/395) 中发表评论。

|     特性     |        支持        |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## 选项

```ts
interface Options {
  /**
   * @default '$'
   */
  prefix?: '::' | '$' | '*'
}
```

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

```jsonc {5,9-11}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": [
      "@vue-macros/volar/short-vmodel",
      // ...
    ],
    "vueMacros": {
      "shortVmodel": {
        "prefix": "$",
      },
    },
  },
}
```

## 已知问题

- Prettier 会将 `::=` 格式化为 `:=`（例如 `<div ::="msg" />` -> `<div :="msg" />`）。如果 prefix 为 `::`，则需要添加注释 `<!-- prettier-ignore -->`
