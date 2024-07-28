# defineProp <PackageVersion name="@vue-macros/define-prop" />

<StabilityLevel level="experimental" />

使用 `defineProp` 逐个声明单个 prop。

|        特性        |        支持        |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

::: warning

`defineProp` 不能与类型声明的 `defineProps` 在同一文件中使用。

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

```vue twoslash
<script setup>
// @experimentalDefinePropProposal=kevinEdition
// ---cut---
// 声明 prop
const count = defineProp('count')

// 从变量名中推断出 prop 名称
const value = defineProp()

// 访问 prop 值
console.log(count.value)
</script>
```

### 选项

```vue twoslash
<script setup lang="ts">
// @experimentalDefinePropProposal=kevinEdition
// ---cut---
// 使用选项声明 prop
const count = defineProp('count', {
  type: Number,
  required: true,
  default: 0,
  validator: (value: number) => value < 20,
})
</script>
```

### TypeScript

```vue twoslash
<script setup lang="ts">
// @experimentalDefinePropProposal=kevinEdition
// ---cut---
// 使用类型为 number 的 prop 声明，并从变量名中推断 prop 的名称
const count = defineProp<number>()
count.value

// 使用默认值为 true 的 TS 类型为 boolean 的 prop 声明
const disabled = defineProp<boolean>('disabled', { default: true })
disabled.value
</script>
```

### 响应性语法糖

```ts
const foo = $defineProp<string>('foo')
//    ^? type: string | undefined
const bar = $(defineProp('bar', { default: 'bar' }))
//    ^? type: string
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

```vue twoslash
<script setup>
// @experimentalDefinePropProposal=johnsonEdition
// ---cut---
// 声明带有默认值 `0` 的 prop `count`
const count = defineProp(0)

// 声明必需的 prop `disabled`
const disabled = defineProp(undefined, true)

// 访问 prop 值
console.log(count.value, disabled.value)
</script>
```

### 选项

```vue twoslash
<script setup lang="ts">
// @experimentalDefinePropProposal=johnsonEdition
// ---cut---
// 使用选项声明属性
const count = defineProp(0, false, {
  type: Number,
  validator: (value: number) => value < 20,
})
</script>
```

### TypeScript

```vue twoslash
<script setup lang="ts">
// @experimentalDefinePropProposal=johnsonEdition
// ---cut---
const count = defineProp<number>()
count.value

// 使用默认值声明 TS 类型为 boolean 的属性
const disabled = defineProp<boolean>(true)
disabled.value
</script>
```

### 响应性语法糖

```vue
<script setup lang="ts">
const foo = $defineProp<number>()
//    ^? type: number | undefined

const bar = $(defineProp(0, true))
//    ^? type: number
</script>
```

## Volar 配置

```jsonc {4,6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["@vue-macros/volar"],
    "vueMacros": {
      "defineProp": true,
    },
    // "kevinEdition" | "johnsonEdition" | false
    "experimentalDefinePropProposal": "kevinEdition",
  },
}
```
