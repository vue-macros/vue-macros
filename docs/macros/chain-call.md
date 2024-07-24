# chainCall <PackageVersion name="@vue-macros/chain-call" />

<StabilityLevel level="experimental" />

Extends `defineProps`, support call `withDefaults` as a chain.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |     :question:     |
|    Vue 2     |     :question:     |
|  TypeScript  | :white_check_mark: |
| Volar Plugin |        :x:         |

::: tip

- `chainCall` does not support `definePropsRefs`
- To fully support TypeScript, you need to import this macro from `unplugin-vue-macros/macros`.

:::

## Basic Usage

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

::: details Compiled Code

```vue twoslash
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

Also support [props destructuring](../features/reactivity-transform.md) and JSX:

```vue
<script setup lang="ts">
const { foo } = defineProps<{ foo: string }>().withDefaults({
  foo: '111',
})
</script>
```

## TypeScript

To fully support TypeScript, you need to import this macro from `unplugin-vue-macros/macros` with specific syntax.

```vue twoslash
<script setup lang="ts">
import { defineProps } from 'unplugin-vue-macros/macros' with { type: 'macro' }

defineProps<{
  /* ... */
}>().withDefaults({
  /* ... */
})
// ✅ type safe
</script>
```

Works without import assertion, but tsc will report an error:

```ts twoslash
// @errors: 2339
defineProps<{
  /* ... */
}>().withDefaults({
  /* ... */
})
```
