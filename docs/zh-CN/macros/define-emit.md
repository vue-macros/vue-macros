# defineEmit

<StabilityLevel level="experimental" />

使用 `defineEmit` 逐个声明单个 emit。

|     特性     |        支持        |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     | :white_check_mark: |
|  TypeScript  | :white_check_mark: |
| Volar Plugin |        :x:         |

::: warning

`defineEmit` 不能与 `defineEmits` 同时使用。

:::

## API 参考

```ts
defineEmit<T>(emitName)
defineEmit<T>(emitName, validator)

// emitName 参数是可选的，
// 并且可从变量名中推断出
const emitName = defineEmit<T>()
```

## 基本用法

```vue
<script setup>
// 声明 emit
const increment = defineEmit('increment')
// 从变量名中推断出 emit 名称
const change = defineEmit()
// emit 事件
increment()
</script>
```

## 带验证的用法

```vue
<script setup>
// 声明带验证的事件
const increment = defineEmit('increment', (value) => value < 20)
</script>
```

## TypeScript

```vue
<script setup lang="ts">
const increment = defineEmit('increment', (value: number) => value < 20)
const decrement = defineEmit<[value: number]>()

increment(2) // pass
increment('2') // TS type error
</script>
```
