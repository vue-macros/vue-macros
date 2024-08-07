# templateRef <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="experimental" />

自动推断 `templateRef` 和 `useTemplateRef` <small>(vue3.5)</small> 的类型.

|   Features   |     Supported      |
| :----------: | :----------------: |
| Volar Plugin | :white_check_mark: |

## 基本用法

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

```jsonc {4,10}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
    "vueMacros": {
      "templateRef": {
        /**
         * @default ["templateRef", "useTemplateRef"]
         */
        "alias": ["templateRef"],
      },
    },
  },
}
```
