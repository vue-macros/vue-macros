# defineProp

<StabilityLevel level="experimental" />

使用 `defineProp` 逐个声明单个 prop。

|        特性        |        支持        |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

::: warning

`defineProp` 不能与 `defineProps` 在同一文件中使用。

:::

## Kevin 的版本

### API 参考

```ts
defineProp<T>(propName)
defineProp<T>(propName, options)

// propName 是参数可选的,
// 并且可从变量名中推断出
const propName = defineProp<T>()
```

### 基本用法

```vue
<script setup>
// 声明 prop
const count = defineProp('count')
// 从变量名中推断出 prop 名称
const value = defineProp()
// 访问 prop 值
console.log(count.value)
</script>
```

### 选项

```vue
<script setup>
// 使用选项声明 prop
const count = defineProp('count', {
  type: Number,
  required: true,
  default: 0,
  validator: (value) => value < 20,
})
</script>
```

### TypeScript

```vue
<script setup lang="ts">
// 使用类型为 number 的 prop 声明，并从变量名中推断 prop 的名称
const count = defineProp<number>()
count.value
//    ^? type: number | undefined

// 使用默认值为 true 的 TS 类型为 boolean 的 prop 声明
const disabled = defineProp<boolean>('disabled', { default: true })
//    ^? type: boolean
</script>
```

## Johnson 的版本

### API 参考

```ts
// 从变量名中推断出 prop 名称
const propName = defineProp<T>()
const propName = defineProp<T>(defaultValue)
const propName = defineProp<T>(defaultValue, required)
const propName = defineProp<T>(defaultValue, required, rest)
```

### 基本用法

```vue
<script setup>
// 声明带有默认值 `0` 的 prop `count`
const count = defineProp(0)

// 声明必需的 prop `disabled`
const disabled = defineProp(undefined, true)

// 访问 prop 值
console.log(count.value, disabled.value)
</script>
```

### 选项

```vue
<script setup>
// 使用选项声明属性
const count = defineProp(0, false, {
  type: Number,
  validator: (value) => value < 20,
})
</script>
```

### TypeScript

```vue
<script setup lang="ts">
const count = defineProp<number>()
count.value
//    ^? type: number | undefined

// 使用默认值声明 TS 类型为 boolean 的属性
const disabled = defineProp<boolean>(true)
//    ^? type: boolean
</script>
```

## Volar 配置

**需要 Volar >= `1.3.12`**

```jsonc
// tsconfig.json
{
  // ...
  "vueCompilerOptions": {
    // "kevinEdition" | "johnsonEdition" | false
    "experimentalDefinePropProposal": "kevinEdition",
  },
}
```
