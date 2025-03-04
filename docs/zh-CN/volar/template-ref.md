# templateRef <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="official" />

自动推断 `templateRef` <small>(来自 [VueUse](https://vueuse.org/core/templateRef/))</small> 和 `useTemplateRef` <small>(Vue 3.5+)</small> 的类型。

::: warning

此功能自 Volar (`vue-tsc`) v2.1.0 起已得到官方支持。
Vue Macros 不再提供此功能作为插件。

:::

| 特性  |        支持        |
| :---: | :----------------: |
| Volar | :white_check_mark: |

## Basic Usage

::: code-group

```vue [App.vue] twoslash
<script setup lang="ts">
// #region comp
import { defineComponent } from 'vue'

export const Comp = defineComponent({
  setup() {
    return { foo: 1 }
  },
})
// #endregion comp
// ---cut---
import { templateRef } from '@vueuse/core'
// @noErrors
import { Comp } from './Comp.ts'

const comp = templateRef('comp')
comp.value?.foo
//           ^?
</script>

<template>
  <Comp ref="comp" />
</template>
```

<<< ./template-ref.md#comp{ts} [Comp.ts]

:::

## Volar 配置

无需额外配置
