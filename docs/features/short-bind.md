# shortBind <PackageVersion name="@vue-macros/short-bind" />

<StabilityLevel level="stable" />

`:value` -> `:value="value"`

Same-name shorthand for binding prop. If the attribute has the same name with the JavaScript value being bound, the syntax can be further shortened to omit the attribute value.

For Vue >= 3.4, this feature will be turned off by default.

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

```jsonc {3} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
  },
}
```
