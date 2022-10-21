# hoistStatic

With enabling `hoistStatic`, constants declared in macros of `<script setup>` can be referenced.

If you support this feature, feel free to hit like :+1: or comment on the [Vue PR](https://github.com/vuejs/core/pull/5752). Thanks!

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

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
