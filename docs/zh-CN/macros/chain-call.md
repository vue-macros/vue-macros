# chainCall

<StabilityLevel level="experimental" />

扩展 `defineProps`，支持链式调用 `withDefaults`。

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |     :question:     |
|    Vue 2     |     :question:     |
|  TypeScript  | :white_check_mark: |
| Volar Plugin |        :x:         |

::: tip

- `chainCall` 不支持 `definePropsRefs`。
- 你需要从 `unplugin-vue-macros/macros` 中导入此宏以获取更好的类型检查。

:::

## 基本用法

```vue
<script setup lang="ts">
const props = defineProps<{
  foo?: string
  bar?: number[]
  baz?: boolean
}>().withDefaults({
  foo: '111',
  bar: () => [1, 2, 3],
})
</script>
```

::: details 编译后的代码

```vue
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    foo?: string
    bar?: number[]
    baz?: boolean
  }>(),
  {
    foo: '111',
    bar: () => [1, 2, 3],
  },
)
</script>
```

:::

也支持 [props 解构](../features/reactivity-transform.md) 和 JSX：

```vue
<script setup lang="tsx">
const { foo } = defineProps<{ foo: string }>().withDefaults({
  foo: '111',
})
</script>
```

## TypeScript

为了更好的类型支持，你需要使用特定的语法从 `unplugin-vue-macros/macros` 中导入此宏。

```vue
<script setup lang="ts">
import { defineProps } from 'unplugin-vue-macros/macros' assert { type: 'macro' }

defineProps<{
  /* ... */
}>().withDefaults({
  /* ... */
})
// ✅ 类型安全
</script>
```

没有 `import` 也可以正常使用，但 `tsc` 会报告一个类型错误：

```ts
defineProps<{
  /* ... */
}>().withDefaults({
  /* ... */
})
// ❌ Property 'withDefaults' does not exist on type 'DefineProps<{ /* ... */ }>'.
```
