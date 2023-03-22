# defineProp

<small>Stability: <code class="!text-yellow-600">unstable</code></small>

Declare single props with `defineProp`.

This macro is part of `@vue-macros/single-define` package

|         Features          |     Supported      |
| :-----------------------: | :----------------: |
|           Vue 3           | :white_check_mark: |
|          Nuxt 3           | :white_check_mark: |
|           Vue 2           | :white_check_mark: |
|          TypeScript       | :white_check_mark: |

::: warning

Can not be used with `defineProps` at same time.

:::

## Basic Usage

```vue
<script setup>
// Declare prop foo
const foo = defineProp('foo')

// access value
console.log(foo.value)
</script>
```

## Prop with options

```vue
<script setup>
// Declare prop foo with options
const foo = defineProp('foo', {
    type: String,
    required: true,
    default: "bar",
    validator: (value) => value.length < 20,
})
</script>
```

## Use multiple times

```vue
<script setup>
// Declare prop foo
const foo = defineProp('foo')

// Declare prop bar
const bar = defineProp('bar')
</script>
```

## Typescript

```vue
<script setup lang="ts">
// Declare prop of type string
const foo = defineProp<string>('foo', {
    validator: (value: string) => value.length < 20,
})
</script>
```


