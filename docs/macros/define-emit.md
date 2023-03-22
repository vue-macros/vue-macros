# defineEmit

<small>Stability: <code class="!text-yellow-600">unstable</code></small>

Declare single events with `defineEmit`.

This macro is part of `@vue-macros/single-define` package

|         Features          |     Supported      |
| :-----------------------: | :----------------: |
|           Vue 3           | :white_check_mark: |
|          Nuxt 3           | :white_check_mark: |
|           Vue 2           | :white_check_mark: |
|          TypeScript       | :white_check_mark: |

::: warning

Can not be used with `defineEmits` at same time.

:::

## Basic Usage

```vue
<script setup>
// Declare event foo
const foo = defineEmit('foo')

// emit event
foo()
</script>
```

## Event with validator

```vue
<script setup>
// Declare event foo with validation
const foo = defineEmit('foo', (value) => value.length < 20)
</script>
```

## Typescript
```vue
<script setup lang="ts">
// Declare event foo
const foo = defineEmit('foo', (value: string) => value.length < 20)

// emit event
foo("Hello")
</script>
```