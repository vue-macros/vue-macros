# betterDefine

<StabilityLevel level="stable" />

通过开启 `betterDefine` ，支持在 `<script setup>` 中导入 TS 类型来定义 `props` 和 `emits`。

如果你对此功能有任何疑问，欢迎在 [issues](https://github.com/vuejs/core/issues/4294) 中发表评论。

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
import { type BaseProps } from './types'

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

在一些**关键的位置**不支持**复杂类型**。例如：

#### 什么是复杂类型？

- 所有工具类型
  - [内置类型](https://www.typescriptlang.org/docs/handbook/utility-types.html)
  - 来自 `type-fest` 包的所有类型。
  - ...
- 索引签名
  ```ts
  interface Type {
    [key: string]: string
  }
  ```
- 泛型将会被直接忽略

#### 什么是**关键的位置**?

- **props** 的名称

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

- **emits** 的名称

```ts
interface Emits {
  (event: 'something', value: ComplexType): void // ✅
  (event: ComplexType): void // ❌
}
```
