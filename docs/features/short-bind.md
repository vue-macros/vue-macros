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
const value = 'foo'
</script>

<template>
  <input :value />
  <!-- => <input :foo="value" /> -->
</template>
```

### With `shortVmodel`

```vue
<template>
  <Comp ::value />
  <!-- => <Comp ::foo="foo" /> => <Comp v-model:foo="foo" /> -->
  <Comp $foo />
  <!-- => <Comp $foo="foo" /> => <Comp v-model:foo="foo" /> -->
  <Comp *foo />
  <!-- => <Comp *foo="foo" /> => <Comp v-model:foo="foo" /> -->
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
