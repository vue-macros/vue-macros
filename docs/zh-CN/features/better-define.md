# betterDefine

<small>稳定性: <code class="!text-green-600">稳定</code></small>

通过启用 `betterDefine` ，`<script setup>` type-based-macros 支持导入的类型。

[相关问题](https://github.com/vuejs/core/issues/4294)

|    特性    |        支持        |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Nuxt 3   | :white_check_mark: |
|   Vue 2    | :white_check_mark: |
| TypeScript | :white_check_mark: |

## 基本用法

::: code-group

```vue [App.vue]
<script setup lang="ts">
import type { BaseProps } from './types'

interface Props extends BaseProps {
  foo: string
}
defineProps<Props>()
</script>
```

```ts [types.ts]
export interface BaseProps {
  title: string
}
```

:::

## ⚠️ 限制

### 复杂类型

在一些 key 的位置不支持复杂类型。例如：

#### 什么是复杂类型？

- 所有实用类型
  - [内置类型](https://www.typescriptlang.org/docs/handbook/utility-types.html)
  - 来自 `type-fest` 包的所有类型。
  - ...
- 索引签名
  ```ts
  interface Type {
    [key: string]: string
  }
  ```
- 泛型将被直接忽略

#### 什么是 key 的位置?

- props 的名称

```ts
// ✅
defineProps<{
  foo: ComplexType
}>()

// ❌
defineProps<{
  [ComplexType]: string
}>()
```

- events 的名称

```ts
interface Emits {
  (event: 'something', value: ComplexType): void // ✅
  (event: ComplexType): void // ❌
}
```
