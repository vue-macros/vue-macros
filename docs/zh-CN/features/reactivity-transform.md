# Reactivity Transform <PackageVersion name="@vue-macros/reactivity-transform" />

<StabilityLevel level="stable" />

|        特性        |        支持        |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

## 安装独立版本

如果你只需要 `Reactivity Transform` 功能，独立版本更适合你。

### 安装

::: code-group

```bash [npm]
npm i -D @vue-macros/reactivity-transform
```

```bash [yarn]
yarn add -D @vue-macros/reactivity-transform
```

```bash [pnpm]
pnpm add -D @vue-macros/reactivity-transform
```

:::

::: code-group

```ts [Vite]
// vite.config.ts
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'

export default defineConfig({
  plugins: [ReactivityTransform()],
})
```

```ts [Rollup]
// rollup.config.js
import ReactivityTransform from '@vue-macros/reactivity-transform/rollup'

export default {
  plugins: [ReactivityTransform()],
}
```

```js [esbuild]
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('@vue-macros/reactivity-transform/esbuild')()],
})
```

```js [Webpack]
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('@vue-macros/reactivity-transform/webpack')()],
}
```

:::

### TypeScript 支持

```json [tsconfig.json]
{
  "compilerOptions": {
    // ...
    "types": ["@vue-macros/reactivity-transform/macros-global" /* ... */]
  }
}
```

## ref vs. 响应式变量 {#refs-vs-reactive-variables}

自从引入组合式 API 的概念以来，一个主要的未解决的问题就是 ref 和响应式对象到底用哪个。响应式对象存在解构丢失响应性的问题，而 ref 需要到处使用 `.value` 则感觉很繁琐，并且在没有类型系统的帮助时很容易漏掉 `.value`。

响应性语法糖是一个编译时的转换步骤，让我们可以像这样书写代码：

```vue twoslash
<script setup>
let count = $ref(0)

console.log(count)

function increment() {
  count++
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

这里的这个 `$ref()` 方法是一个**编译时的宏命令**：它不是一个真实的、在运行时会调用的方法。而是用作 Vue 编译器的标记，表明最终的 `count` 变量需要是一个**响应式变量**。

响应式的变量可以像普通变量那样被访问和重新赋值，但这些操作在编译后都会变为带 `.value` 的 ref。比如上面例子中 `<script>` 部分的代码就被编译成了下面这样：

```js{5,8} twoslash
import { ref } from 'vue'

let count = ref(0)

console.log(count.value)

function increment() {
  count.value++
}
```

每一个会返回 ref 的响应式 API 都有一个相对应的、以 `$` 为前缀的宏函数。包括以下这些 API：

- [`ref`](https://vuejs.org/api/reactivity-core#ref) -> `$ref`
- [`computed`](https://vuejs.org/api/reactivity-core#computed) -> `$computed`
- [`shallowRef`](https://vuejs.org/api/reactivity-advanced#shallowref) -> `$shallowRef`
- [`customRef`](https://vuejs.org/api/reactivity-advanced#customref) -> `$customRef`
- [`toRef`](https://vuejs.org/api/reactivity-utilities#toref) -> `$toRef`

当启用响应性语法糖时，这些宏函数都是全局可用的、无需手动导入。但如果你想让它更明显，你也可以选择从 `unplugin-vue-macros/macros` 或 `@vue-macros/reactivity-transform/macros-global` 中引入它们：

```js twoslash
import { $ref } from 'unplugin-vue-macros/macros'
// 适用于独立版本：
// import { $ref } from '@vue-macros/reactivity-transform/macros-global'

const count = $ref(0)
```

## 通过 `$()` 解构 {#destructuring-with}

我们常常会让一个组合函数返回一个含数个 ref 的对象，然后解构得到这些 ref。对于这种场景，响应性语法糖提供了一个 **`$()`** 宏：

```ts twoslash
import { ref } from 'vue'
function useMouse() {
  return {
    x: ref(0),
    y: ref(0),
  }
}
// ---cut---
const { x, y } = $(useMouse())

console.log(x, y)
```

编译输出为：

```js twoslash
import { ref, toRef } from 'vue'
function useMouse() {
  return {
    x: ref(0),
    y: ref(0),
  }
}
// ---cut---
const __temp = useMouse(),
  x = toRef(__temp, 'x'),
  y = toRef(__temp, 'y')

console.log(x.value, y.value)
```

请注意如果 `x` 已经是一个 ref，`toRef(__temp, 'x')` 则会简单地返回它本身，而不会再创建新的 ref。如果一个被解构的值不是 ref (例如是一个函数)，也仍然可以使用，这个值会被包装进一个 ref，因此其他代码都会正常工作。

对 `$()` 的解构在响应式对象**和**包含数个 ref 的对象都可用。

## 用 `$()` 将现存的 ref 转换为响应式对象 {#convert-existing-refs-to-reactive-variables-with}

在某些场景中我们可能已经有了会返回 ref 的函数。然而，Vue 编译器并不能够提前知道该函数会返回一个 ref。那么此时可以使用 `$()` 宏来将现存的 ref 转换为响应式变量。

```js twoslash
import { ref } from 'vue'

function myCreateRef() {
  return ref(0)
}

const count = $(myCreateRef())
```

## 响应式 props 解构 {#reactive-props-destructure}

现在的 `<script setup>` 中对 `defineProps` 宏的使用有两个痛点：

1. 和 `.value` 类似，为了保持响应性，你始终需要以 `props.x` 的方式访问这些 prop。这意味着你不能够解构 `defineProps` 的返回值，因为得到的变量将不是响应式的、也不会更新。

2. 当使用[基于类型的 props 的声明](https://cn.vuejs.org/api/sfc-script-setup.html#typescript-only-features)时，无法很方便地声明这些 prop 的默认值。为此我们提供了 `withDefaults()` 这个 API，但使用起来仍然很笨拙。

当 `defineProps` 与解构一起使用时，我们可以通过应用编译时转换来解决这些问题，类似于我们之前看到的 `$()`：

```vue twoslash
<script setup lang="ts">
import { watchEffect } from 'vue'

interface Props {
  msg: string
  count?: number
  foo?: string
}

const {
  msg,
  // 默认值正常可用
  count = 1,
  // 解构时命别名也可用
  // 这里我们就将 `props.foo` 命别名为 `bar`
  foo: bar,
} = defineProps<Props>()

watchEffect(() => {
  // 会在 props 变化时打印
  console.log(msg, count, bar)
})
</script>
```

上面的代码将被编译成下面这样的运行时声明：

```ts twoslash
import { defineComponent, watchEffect } from 'vue'

export default defineComponent({
  props: {
    msg: { type: String, required: true },
    count: { type: Number, default: 1 },
    foo: String,
  },
  setup(props) {
    watchEffect(() => {
      console.log(props.msg, props.count, props.foo)
    })
  },
})
```

## 保持在函数间传递时的响应性 {#retaining-reactivity-across-function-boundaries}

虽然响应式变量使我们可以不再受 `.value` 的困扰，但它也使得我们在函数间传递响应式变量时可能造成“响应性丢失”的问题。这可能在以下两种场景中出现：

### 以参数形式传入函数 {#passing-into-function-as-argument}

假设有一个期望接收一个 ref 对象为参数的函数：

```ts twoslash
import { watch, type Ref } from 'vue'

function trackChange(x: Ref<number>) {
  watch(x, (x) => {
    console.log('x 改变了！')
  })
}

const count = $ref(0)
// @errors: 2345
trackChange(count) // 无效！
```

上面的例子不会正常工作，因为代码被编译成了这样：

```ts
const count = ref(0)
trackChange(count.value)
```

这里的 `count.value` 是以一个 number 类型值的形式传入，然而 `trackChange` 期望接收的是一个真正的 ref。要解决这个问题，可以在将 `count` 作为参数传入之前，用 `$$()` 包装：

```diff
let count = $ref(0)
- trackChange(count)
+ trackChange($$(count))
```

上面的代码将被编译成：

```js
import { ref } from 'vue'

const count = ref(0)
trackChange(count)
```

我们可以看到，`$$()` 的效果就像是一个**转义标识**：`$$()` 中的响应式变量不会追加上 `.value`。

### 作为函数返回值 {#returning-inside-function-scope}

如果将响应式变量直接放在返回值表达式中会丢失掉响应性：

```ts twoslash
function useMouse() {
  const x = $ref(0)
  const y = $ref(0)

  // 监听 mousemove 事件

  // 不起效！
  return {
    x,
    y,
  }
}
```

上面的语句将被翻译为：

```ts
return {
  x: x.value,
  y: y.value,
}
```

为了保持响应性，我们需要返回的是真正的 ref，而不是返回时 ref 内的值。

我们还是可以使用 `$$()` 来解决这个问题。在这个例子中，`$$()` 可以直接用在要返回的对象上，`$$()` 调用时任何对响应式变量的引用都会保留为对相应 ref 的引用：

```ts twoslash
function useMouse() {
  const x = $ref(0)
  const y = $ref(0)

  // 监听 mousemove 事件

  // 修改后起效
  return $$({
    x,
    y,
  })
}
```

### 在已解构的 props 上使用 `$$()` {#using-on-destructured-props}

`$$()` 也适用于已解构的 props，因为它们也是响应式的变量。编译器会高效地通过 `toRef` 来做转换：

```vue twoslash
<script setup lang="ts">
import type { Ref } from 'vue'
function passAsRef(count: Ref<number>) {
  return count
}
// ---cut---
const { count } = defineProps<{ count: number }>()

passAsRef($$(count))
</script>
```

编译结果为：

```ts twoslash
import { defineComponent, toRef, type Ref } from 'vue'
function passAsRef(count: Ref<number>) {
  return count
}
// ---cut---
export default defineComponent({
  props: {
    count: { type: Number, required: true },
  },
  setup(props) {
    const __props_count = toRef(props, 'count')
    passAsRef(__props_count)
  },
})
```

## TypeScript 集成 <sup class="vt-badge ts" /> {#typescript-integration}

Vue 为这些宏函数都提供了类型声明 (全局可用)，因此类型推导都会符合预期。它与标准的 TypeScript 语义没有不兼容之处，因此它的语法可以与所有现有的工具兼容。

这也意味着这些宏函数在任何 JS / TS 文件中都是合法的，不是仅能在 Vue SFC 中使用。

因为这些宏函数都是全局可用的，它们的类型需要被显式地引用 (例如，在 `env.d.ts` 文件中)：

```ts [env.d.ts]
/// <reference types="unplugin-vue-macros/macros-global" />

// 或适用于独立版本：
/// <reference types="@vue-macros/reactivity-transform/macros-global" />
```

若你是从 `unplugin-vue-macros/macros` 或 `@vue-macros/reactivity-transform/macros-global` 中显式引入宏函数时，则不需要像这样全局声明。
