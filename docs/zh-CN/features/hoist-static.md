# hoistStatic

<small>Stability: <code class="!text-green-600">stable</code></small>

With enabling `hoistStatic`, constants declared in macros of `<script setup>` can be referenced.

If you support this feature, feel free to hit like :+1: or comment on the [Vue PR](https://github.com/vuejs/core/pull/5752). Thanks!

| Features |     Supported      |
| :------: | :----------------: |
|  Vue 3   | :white_check_mark: |
|  Nuxt 3  | :white_check_mark: |
|  Vue 2   | :white_check_mark: |

## Basic Usage

```vue
<script setup lang="ts">
const name = 'AppFoo'
defineOptions({
  name,
})
</script>
```

::: details Compiled Code

```vue
<script lang="ts">
const name = 'AppFoo'
export default {
  name,
}
</script>
```

:::

## Magic Comments

```vue
<script setup lang="ts">
// A value that's even not a constant
const name = /* hoist-static */ fn()
defineOptions({
  name,
})
</script>
```

::: details Compiled Code

```vue
<script lang="ts">
const name = fn()
export default {
  name,
}
</script>
```

:::

### Magic Comments For Template

```vue
<script setup lang="ts">
// Function from another module
import { /* hoist-static */ add } from 'anotherModule'
</script>
<template>
  <!-- You can use something from another module in the template by hoist static -->
 <h1>add(1, 2) </h1>
</template>
```

::: details Compiled Code

```vue
<script lang="ts">
import { add } from 'anotherModule'
export default {
  add,
}
</script>
```

:::
