# exportExpose

<StabilityLevel level="experimental" />

Transform export statement as `defineExpose` params in Vue SFC `script-setup`.

|   Features   |     Supported      |
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

// also support export with alias
export { foo as foo1 }
</script>
```

::: details Compiled Code

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
  // export with alias
  foo1: foo,
})
</script>
```

:::

Currently does't support these following cases:

```ts
// 1. export all ❌
export * from '../types'

// 2. export default ❌
const a = 'a'
export default a
```
