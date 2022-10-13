# defineOptions

Options API can be declared using the `defineOptions` in `<script setup>`, specifically to be able to set `name`, `props`, `emits`, and `render` inside of one function.

If you support this feature, you can go to [RFC Discussion](https://github.com/vuejs/rfcs/discussions/430) and hit like :+1: or comment. Thanks!

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

::: tip
if you need `defineOptions` only, the [standalone version](https://github.com/sxzz/unplugin-vue-macros/tree/main/packages/define-options) is better for you.
:::

## Basic Usage

```vue{3-6}
<script setup lang="ts">
import { useSlots } from 'vue'
defineOptions({
  name: 'Foo',
  inheritAttrs: false,
})
const slots = useSlots()
</script>
```

::: details Compiled Code

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

## JSX in `<script setup>`

```vue{3-5}
<script setup lang="tsx">
defineOptions({
  render() {
    return <h1>Hello World</h1>
  },
})
</script>
```

::: details Compiled Code

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
