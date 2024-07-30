# templateRef <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="experimental" />

Automatically infer type for `templateRef` and `useTemplateRef` <small>(vue3.5)</small>.

|   Features   |     Supported      |
| :----------: | :----------------: |
| Volar Plugin | :white_check_mark: |

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

## Volar Configuration

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
