# defineOptions

`defineOptions` allow use Options API in `<script setup>`, specifically to be able to set name, props, emits and render in one function.

::: tip
if you only need defineOptions, the [standalone version](https://github.com/sxzz/unplugin-vue-macros/tree/main/packages/define-options) is better for you.
:::

If you support this feature, you can go to [RFC Discussion](https://github.com/vuejs/rfcs/discussions/430) and hit like :+1: or comment. Thanks!

## Basic Usage

```vue
<script setup lang="ts">
import { useSlots } from 'vue'
defineOptions({
  name: 'Foo',
  inheritAttrs: false,
})
const slots = useSlots()
</script>
```

::: details Output

```vue
<script lang="ts">
export default {
  name: 'Foo',
  inheritAttrs: false,
}
</script>

<script setup>
const slots = useSlots()
</script>
```

:::

## JSX in `script setup`

```vue
<script setup lang="tsx">
defineOptions({
  render() {
    return <h1>Hello World</h1>
  },
})
</script>
```

::: details Output

```vue
<script lang="tsx">
export default {
  render() {
    return <h1>Hello World</h1>
  },
}
</script>
```

:::
