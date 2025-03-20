# defineGeneric <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="stable" />

Declare single generic one by one using `DefineGeneric`.

> Especially useful for `setup-sfc`.

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

## Volar Configuration

```jsonc {3} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["vue-macros/volar"],
  },
}
```
