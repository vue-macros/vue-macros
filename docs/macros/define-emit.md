# defineEmit <PackageVersion name="@vue-macros/define-emit" />

<StabilityLevel level="experimental" />

Declare single emit one by one using `defineEmit`.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     | :white_check_mark: |
|  TypeScript  | :white_check_mark: |
| Volar Plugin | :white_check_mark: |

::: warning

`defineEmit` can not be used with `defineEmits` at same time

:::

## API Reference

```ts
defineEmit<T>(emitName)
defineEmit<T>(emitName, validator)

// emitName parameter can be optional,
// and will be inferred from variable name
const emitName = defineEmit<T>()
```

## Basic Usage

```vue twoslash
<script setup>
// Declare emit
const increment = defineEmit('increment')
// Infer emit name from variable name
const change = defineEmit()
// emit event
increment()
</script>
```

## With Validation

```vue twoslash
<script setup>
// Declare event with validation
const increment = defineEmit('increment', (value) => value < 20)
</script>
```

## TypeScript

```vue twoslash
<script setup lang="ts">
const increment = defineEmit('increment', (value: number) => value < 20)
const decrement = defineEmit<[value: number]>()

increment(2) // pass
// @errors: 2345
increment('2') // TS type error
</script>
```

## Volar Configuration

```jsonc {4,6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["@vue-macros/volar"],
    "vueMacros": {
      "defineEmit": true,
    },
  },
}
```
