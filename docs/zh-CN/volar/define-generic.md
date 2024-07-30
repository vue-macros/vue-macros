# templateRef <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="stable" />

使用 `DefineGeneric` 逐个声明单个范型。

> 对于 `setup-sfc` 特别有用。

|   Features   |     Supported      |
| :----------: | :----------------: |
| Volar Plugin | :white_check_mark: |

## Basic Usage

::: code-group

```vue [App.vue] twoslash
<script setup lang="ts">
// @errors: 2322
defineOptions({
  name: 'App',
})

type T = DefineGeneric<number>

defineProps<{
  foo: T
}>()
</script>

<template>
  <App foo="1" />
</template>
```

:::

## Volar 配置

```jsonc {4}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
  },
}
```
