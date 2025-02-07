# definePropsRefs <PackageVersion name="@vue-macros/define-props-refs" />

<StabilityLevel level="stable" />

从 `defineProps` 中将返回 refs 而不是 reactive 对象，可以在不丢失响应式的情况下解构 props。

`toRefs(defineProps())` => `definePropsRefs()`

|           特性            |        支持        |
| :-----------------------: | :----------------: |
|           Vue 3           | :white_check_mark: |
|          Nuxt 3           | :white_check_mark: |
|           Vue 2           | :white_check_mark: |
| TypeScript / Volar Plugin | :white_check_mark: |

## 基本用法

```vue twoslash {2-3,8}
<script setup lang="ts">
// ✅ 解构不丢失响应式
const { foo, bar } = definePropsRefs<{
  foo: string
  bar: number
}>()

console.log(foo.value, bar.value)
//           ^?
</script>
```

## 默认值

```vue twoslash {2-3,8}
<script setup lang="ts">
import { withDefaults } from 'unplugin-vue-macros/macros' with { type: 'macro' }

const { foo } = withDefaults(
  definePropsRefs<{
    foo?: string
  }>(),
  { foo: 'test' },
)

console.log(foo.value)
//           ^?
</script>
```

## Volar 配置

```jsonc {3} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
  },
}
```
