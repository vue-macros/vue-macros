# hoistStatic

<small>稳定性: <code class="!text-green-600">稳定</code></small>

通过启用 `hoistStatic`, 可以引用 `<script setup>`的宏中声明的常量。

如果您支持此功能，请随意点击 :+1: 或者在 [Vue PR](https://github.com/vuejs/core/pull/5752) 上发表评论. 谢谢!

|  特性  |        支持        |
| :----: | :----------------: |
| Vue 3  | :white_check_mark: |
| Nuxt 3 | :white_check_mark: |
| Vue 2  | :white_check_mark: |

## 基本用法

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

## 魔法注释

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
