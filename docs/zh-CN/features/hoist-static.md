# hoistStatic

<StabilityLevel level="stable" />

通过开启 `hoistStatic`, 可以在宏内部引用 `<script setup>` 中的变量

在 Vue >= 3.3 中，此功能将默认关闭。

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

::: details 编译后的代码

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
// 一个甚至不是常量的值
const name = /* hoist-static */ fn()
defineOptions({
  name,
})
</script>
```

::: details 编译后的代码

```vue
<script lang="ts">
const name = fn()
export default {
  name,
}
</script>
```

:::
