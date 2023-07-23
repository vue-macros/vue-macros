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

Support these syntaxes:

- local variable/function/class
- export with alias
- export from other file
- namespace export
- rename export

### 1. local variable/function/class

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
})
</script>
```

:::

### 2. export with alias

```vue
<script setup lang="ts">
export { foo as foo1 }
</script>
```

::: details Compiled Code

```vue
<script setup lang="ts">
defineExpose({
  foo1: foo,
})
</script>
```

:::

### 3. export from other file

```vue
<script setup lang="ts">
export { foo, type Foo, foo as bar } from './types'
</script>
```

::: details Compiled Code

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

### 4. namespace export

```vue
<script setup lang="ts">
export * as foo from './types'
</script>
```

::: details Compiled Code

```vue
<script setup lang="ts">
import * as __MACROS_expose_0 from './types'
defineExpose({
  foo: __MACROS_expose_0,
})
</script>
```

:::

### 5. rename export

```vue
<script setup lang="ts">
const foo = 1,
  bar = 1

export { foo } from './types'
export * as bar from './types'
</script>
```

::: details Compiled Code

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

## Limitations

Currently does't support these following cases:

```ts
// 1. export all ❌
export * from '../types'

// 2. export default ❌
const a = 'a'
export default a
```
