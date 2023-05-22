# exportExpose

<StabilityLevel level="experimental" />

在 Vue SFC `script-setup` 中将 export 语句转换为 `defineExpose` 的参数。

|     特性     |        支持        |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |         ?          |
|    Vue 2     |         ?          |
| Volar Plugin |        :x:         |

## Usage

```vue
<script setup lang="ts">
export const foo: string = 'foo',
  bar = 10
export let baz: string | undefined
export var qux = fn()
export const { a, b, c } = { a: 1, b: 2, c: 3 }

export function fn() {}
export class A {}

// 也支持导出别名 
export { foo as foo1 }
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
  // 导出别名 
  foo1: foo,
})
</script>
```

:::

当前不支持以下情况：

```ts
// 1. 全部导出 ❌
export * from '../types'

// 2. 默认导出 ❌
const a = 'a'
export default a
```
