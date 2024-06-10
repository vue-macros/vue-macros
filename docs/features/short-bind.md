# shortBind

<StabilityLevel level="stable" />

A shorthand for binding prop with the same data name.

`:value` -> `:value="value"`

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## Usage

### Basic Usage

```vue twoslash
<script setup>
const foo = 'foo'
</script>

<template>
  <input :foo />
  <!-- => <input :foo="foo" /> -->
</template>
```

### With `shortVmodel`

```vue
<template>
  <input ::foo />
  <!-- => <input ::foo="foo" /> => <input v-model:foo="foo" /> -->
  <input $foo />
  <!-- => <input $foo="foo" /> => <input v-model:foo="foo" /> -->
  <input *foo />
  <!-- => <input *foo="foo" /> => <input v-model:foo="foo" /> -->
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
