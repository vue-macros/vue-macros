# hoistStatic

<small>Stability: <code class="!text-green-600">stable</code></small>

With enabling `hoistStatic`, constants declared in macros of `<script setup>` can be referenced.

For Vue >= 3.3, this feature will be turned off by default.

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
