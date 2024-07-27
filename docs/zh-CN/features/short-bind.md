# shortBind <PackageVersion name="@vue-macros/short-bind" />

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

```vue twoslash
<script setup>
const value = 'foo'
</script>

<template>
  <input :value />
  <!-- => <input :value="value" /> -->
</template>
```

### 和 `shortVmodel` 一起使用

```vue
<template>
  <Comp ::msg />
  <!-- => <Comp ::foo="foo" /> => <Comp v-model:foo="foo" /> -->
  <Comp $msg />
  <!-- => <Comp $foo="foo" /> => <Comp v-model:foo="foo" /> -->
  <Comp *msg />
  <!-- => <Comp *foo="foo" /> => <Comp v-model:foo="foo" /> -->
</template>
```

## Volar 配置

```jsonc {4}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["@vue-macros/volar"],
  },
}
```
