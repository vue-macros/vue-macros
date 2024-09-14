# definePropsRefs <PackageVersion name="@vue-macros/define-props-refs" />

<StabilityLevel level="stable" />

Returns refs from `defineProps` instead of a reactive object. It can be destructured without losing reactivity.

`toRefs(defineProps())` => `definePropsRefs()`

|         Features          |     Supported      |
| :-----------------------: | :----------------: |
|           Vue 3           | :white_check_mark: |
|          Nuxt 3           | :white_check_mark: |
|           Vue 2           | :white_check_mark: |
| TypeScript / Volar Plugin | :white_check_mark: |

## Basic Usage

```vue twoslash {2-3,8}
<script setup lang="ts">
// ✅ won't lose reactivity with destructuring
const { foo, bar } = definePropsRefs<{
  foo: string
  bar: number
}>()

console.log(foo.value, bar.value)
//           ^?
</script>
```

## With Default Value

```vue twoslash {2-3,8}
<script setup lang="ts">
import { withDefaults } from 'unplugin-vue-macros/macros'

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

## Volar Configuration

```jsonc {3} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
  },
}
```
