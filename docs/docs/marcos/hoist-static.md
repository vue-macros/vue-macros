# hoistStatic

`hoistStatic` allow you to reference a constant declared in `<script setup>`, then this feature may help you.

If you support this feature, you can go to [Vue PR](https://github.com/vuejs/core/pull/5752) and hit like :+1: or comment. Thanks!

Notice that you don't need to use any API.

## Basic Usage

```vue
<script setup lang="ts">
const name = 'AppFoo'
defineOptions({
  name,
})
</script>
```

::: details Output

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
const name = /* hoist-static */ fn() // a value that's even not a constant
defineOptions({
  name,
})
</script>
```

::: details Output

```vue
<script lang="ts">
const name = fn()
export default {
  name,
}
</script>
```

:::
