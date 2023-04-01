# singleDefine

<StabilityLevel level="experimental" />

Declare single props and events with `defineProp` & `defineEmit`.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     | :white_check_mark: |
|  TypeScript  | :white_check_mark: |
| Volar Plugin |        :x:         |

::: warning

`defineProp` can not be used with `defineProps` at same time

`defineEmit` can not be used with `defineEmits` at same time

:::

## Basic Usage

```vue
<script setup>
// Declare prop
const count = defineProp('count')
// Infer prop name from variable name
const value = defineProp()

// Declare event
const increment = defineEmit('increment')
// Infer emit name from variable name
const change = defineEmit()

// access prop value
console.log(count.value)
// emit event
increment()
</script>
```

## With Options & Validation

```vue
<script setup>
// Declare prop with options
const count = defineProp('count', {
  type: Number,
  required: true,
  default: 0,
  validator: (value) => value < 20,
})

// Declare event with validation
const increment = defineEmit('increment', (value) => value < 20)
</script>
```

## Using Multiple Times

```vue
<script setup>
const count = defineProp()
const maxCount = defineProp()
const increment = defineEmit()
const decrement = defineEmit()
</script>
```

## TypeScript

```vue
<script setup lang="ts">
// Declare prop of type number and infer prop name from variable name
const count = defineProp<number>()
count.value
//    ^? type number

// Declare prop of TS type boolean with default value
const disabled = defineProp<boolean>('disabled', { default: true })

const increment = defineEmit('bar', (value: number) => value < 20)

increment(2) // pass
increment('2') // TS type error
</script>
```
