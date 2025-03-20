# templateRef <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="official" />

Automatically infer type for `templateRef` <small>(from [VueUse](https://vueuse.org/core/templateRef/))</small>
and `useTemplateRef` <small>(Vue 3.5+)</small>.

::: warning

This feature is officially supported since Volar (`vue-tsc`) v2.1.0.
Vue Macros is no longer offering this feature as a plugin.

:::

| Features |     Supported      |
| :------: | :----------------: |
|  Volar   | :white_check_mark: |

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

No configuration required.
