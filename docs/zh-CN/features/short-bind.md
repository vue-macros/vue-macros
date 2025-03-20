# shortBind <PackageVersion name="@vue-macros/short-bind" />

<StabilityLevel level="stable" />

`:value` -> `:value="value"`

同名简写绑定 prop 。如果 prop 与要绑定的 JavaScript 值同名，则可以进一步缩短语法以省略 prop 值。

对于 Vue >= 3.4，此功能将默认关闭。

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

```jsonc {3} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["vue-macros/volar"],
  },
}
```
