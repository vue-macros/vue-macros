# shortBind

<StabilityLevel level="stable" />

绑定相同数据名称的 `prop` 的语法糖。

`:value` -> `:value="value"`

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## 用法

### 基本用法

```vue
<template>
  <input :msg />
  <!-- => <input :msg="msg" /> -->
  <demo $msg />
  <!-- => <input $msg="msg" /> -->
</template>
```

### 和 `shortVmodel` 一起使用

```vue
<template>
  <input ::msg />
  <!-- => <input ::msg="msg" /> => <input v-model:msg="msg" /> -->
  <demo $msg />
  <!-- => <input $msg="msg" /> => <input v-model:msg="msg" /> -->
  <demo *msg />
  <!-- => <input *msg="msg" /> => <input v-model:msg="msg" /> -->
</template>
```

## Volar 配置

```jsonc {5}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": [
      "@vue-macros/volar/short-bind",
      // ...
    ],
  },
}
```

## ESLint 配置

```jsonc {4}
// .eslintrc
{
  "rules": {
    "vue/valid-v-bind": "off",
  },
}
```
