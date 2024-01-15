# shortBind

<StabilityLevel level="experimental" />

A shorthand for binding prop with the same data name.

`:value` -> `:value="value"`

If you have any questions about this feature, you can comment on [RFC Discussion](https://github.com/vuejs/rfcs/discussions/405).

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## Usage

### Basic Usage

```vue
<template>
  <input :msg />
  <!-- => <input :msg="msg" /> -->
  <demo $msg />
  <!-- => <input $msg="msg" /> -->
</template>
```

### With `shortVmodel`

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

## Volar Configuration

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

## ESLint Configuration

```jsonc {4}
// .eslintrc
{
  "rules": {
    "vue/valid-v-bind": "off",
  },
}
```
