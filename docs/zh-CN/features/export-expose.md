# exportExpose

<StabilityLevel level="experimental" />

在 Vue SFC `script-setup` 中将 export 语句转换为 `defineExpose` 参数。

|     特性     |        支持        |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |         ?          |
|    Vue 2     |         ?          |
| Volar Plugin |        :x:         |

## 用法

支持以下语法：

- 局部变量/函数/类
- 别名导出
- 从其他文件导出
- 命名空间导出
- 重命名导出

### 1. 局部变量/函数/类

```vue
<script setup lang="ts">
export const foo: string = 'foo',
  bar = 10
export let baz: string | undefined
export var qux = fn()
export const { a, b, c } = { a: 1, b: 2, c: 3 }

export function fn() {}
export class A {}
</script>
```

::: details 编译后代码

```vue
<script lang="ts">
const foo: string = 'foo',
  bar = 10
let baz: string | undefined
const qux = fn()
const { a, b, c } = { a: 1, b: 2, c: 3 }

function fn() {}
class A {}

defineExpose({
  foo,
  bar,
  baz,
  qux,
  a,
  b,
  c,
  fn,
  A,
})
</script>
```

:::

### 2. 别名导出

```vue
<script setup lang="ts">
export { foo as foo1 }
</script>
```

::: details 编译后代码

```vue
<script setup lang="ts">
defineExpose({
  foo1: foo,
})
</script>
```

:::

### 3. 从其他文件导出

```vue
<script setup lang="ts">
export { foo, type Foo, foo as bar } from './types'
</script>
```

::: details 编译后代码

```vue
<script setup lang="ts">
import {
  type Foo,
  foo as __MACROS_expose_0,
  foo as __MACROS_expose_1,
} from './types'
defineExpose({
  foo: __MACROS_expose_0,
  bar: __MACROS_expose_1,
})
</script>
```

:::

### 4. 命名空间导出

```vue
<script setup lang="ts">
export * as foo from './types'
</script>
```

::: details 编译后代码

```vue
<script setup lang="ts">
import * as __MACROS_expose_0 from './types'
defineExpose({
  foo: __MACROS_expose_0,
})
</script>
```

:::

### 5. 重命名导出

```vue
<script setup lang="ts">
const foo = 1,
  bar = 1

export { foo } from './types'
export * as bar from './types'
</script>
```

::: details 编译后代码

```vue
<script setup lang="ts">
import { foo as __MACROS_expose_0 } from './types'
import * as __MACROS_expose_1 from './types'

const foo = 1,
  bar = 1
defineExpose({
  foo: __MACROS_expose_0,
  bar: __MACROS_expose_1,
})
</script>
```

:::

## 限制

当前不支持以下语法：

```ts
// 1. 全部导出 ❌
export * from '../types'

// 2. 默认导出 ❌
const a = 'a'
export default a
```
