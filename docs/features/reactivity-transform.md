# Reactivity Transform

<StabilityLevel level="stable" />

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

## Installation Standalone Version

if you need Reactivity Transform feature only, the standalone version is more appropriate for you.

### Installation

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

### TypeScript Support

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["@vue-macros/reactivity-transform/macros-global" /* ... */]
  }
}
```

## Refs vs. Reactive Variables {#refs-vs-reactive-variables}

Ever since the introduction of the Composition API, one of the primary unresolved questions is the use of refs vs. reactive objects. It's easy to lose reactivity when destructuring reactive objects, while it can be cumbersome to use `.value` everywhere when using refs. Also, `.value` is easy to miss if not using a type system.

Reactivity Transform is a compile-time transform that allows us to write code like this:

```vue
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

The `$ref()` method here is a **compile-time macro**: it is not an actual method that will be called at runtime. Instead, the Vue compiler uses it as a hint to treat the resulting `count` variable as a **reactive variable.**

Reactive variables can be accessed and re-assigned just like normal variables, but these operations are compiled into refs with `.value`. For example, the `<script>` part of the above component is compiled into:

```js{5,8}
import { ref } from 'vue'

let count = ref(0)

console.log(count.value)

function increment() {
  count.value++
}
```

Every reactivity API that returns refs will have a `$`-prefixed macro equivalent. These APIs include:

- [`ref`](https://vuejs.org/api/reactivity-core#ref) -> `$ref`
- [`computed`](https://vuejs.org/api/reactivity-core#computed) -> `$computed`
- [`shallowRef`](https://vuejs.org/api/reactivity-advanced#shallowref) -> `$shallowRef`
- [`customRef`](https://vuejs.org/api/reactivity-advanced#customref) -> `$customRef`
- [`toRef`](https://vuejs.org/api/reactivity-utilities#toref) -> `$toRef`

These macros are globally available and do not need to be imported when Reactivity Transform is enabled, but you can optionally import them from `vue/macros` if you want to be more explicit:

```js
import { $ref } from 'vue/macros'

const count = $ref(0)
```

## Destructuring with `$()` {#destructuring-with}

It is common for a composition function to return an object of refs, and use destructuring to retrieve these refs. For this purpose, reactivity transform provides the **`$()`** macro:

```js
import { useMouse } from '@vueuse/core'

const { x, y } = $(useMouse())

console.log(x, y)
```

Compiled output:

```js
import { toRef } from 'vue'
import { useMouse } from '@vueuse/core'

const __temp = useMouse(),
  x = toRef(__temp, 'x'),
  y = toRef(__temp, 'y')

console.log(x.value, y.value)
```

Note that if `x` is already a ref, `toRef(__temp, 'x')` will simply return it as-is and no additional ref will be created. If a destructured value is not a ref (e.g. a function), it will still work - the value will be wrapped in a ref so the rest of the code works as expected.

`$()` destructure works on both reactive objects **and** plain objects containing refs.

## Convert Existing Refs to Reactive Variables with `$()` {#convert-existing-refs-to-reactive-variables-with}

In some cases we may have wrapped functions that also return refs. However, the Vue compiler won't be able to know ahead of time that a function is going to return a ref. In such cases, the `$()` macro can also be used to convert any existing refs into reactive variables:

```js
function myCreateRef() {
  return ref(0)
}

const count = $(myCreateRef())
```

## Reactive Props Destructure {#reactive-props-destructure}

There are two pain points with the current `defineProps()` usage in `<script setup>`:

1. Similar to `.value`, you need to always access props as `props.x` in order to retain reactivity. This means you cannot destructure `defineProps` because the resulting destructured variables are not reactive and will not update.

2. When using the [type-only props declaration](https://vuejs.org/api/sfc-script-setup.html#typescript-only-features), there is no easy way to declare default values for the props. We introduced the `withDefaults()` API for this exact purpose, but it's still clunky to use.

We can address these issues by applying a compile-time transform when `defineProps` is used with destructuring, similar to what we saw earlier with `$()`:

```html
<script setup lang="ts">
  interface Props {
    msg: string
    count?: number
    foo?: string
  }

  const {
    msg,
    // default value just works
    count = 1,
    // local aliasing also just works
    // here we are aliasing `props.foo` to `bar`
    foo: bar,
  } = defineProps<Props>()

  watchEffect(() => {
    // will log whenever the props change
    console.log(msg, count, bar)
  })
</script>
```

The above will be compiled into the following runtime declaration equivalent:

```js
export default {
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
}
```

## Retaining Reactivity Across Function Boundaries {#retaining-reactivity-across-function-boundaries}

While reactive variables relieve us from having to use `.value` everywhere, it creates an issue of "reactivity loss" when we pass reactive variables across function boundaries. This can happen in two cases:

### Passing into function as argument {#passing-into-function-as-argument}

Given a function that expects a ref as an argument, e.g.:

```ts
function trackChange(x: Ref<number>) {
  watch(x, (x) => {
    console.log('x changed!')
  })
}

const count = $ref(0)
trackChange(count) // doesn't work!
```

The above case will not work as expected because it compiles to:

```ts
const count = ref(0)
trackChange(count.value)
```

Here `count.value` is passed as a number, whereas `trackChange` expects an actual ref. This can be fixed by wrapping `count` with `$$()` before passing it:

```diff
let count = $ref(0)
- trackChange(count)
+ trackChange($$(count))
```

The above compiles to:

```js
import { ref } from 'vue'

const count = ref(0)
trackChange(count)
```

As we can see, `$$()` is a macro that serves as an **escape hint**: reactive variables inside `$$()` will not get `.value` appended.

### Returning inside function scope {#returning-inside-function-scope}

Reactivity can also be lost if reactive variables are used directly in a returned expression:

```ts
function useMouse() {
  const x = $ref(0)
  const y = $ref(0)

  // listen to mousemove...

  // doesn't work!
  return {
    x,
    y,
  }
}
```

The above return statement compiles to:

```ts
return {
  x: x.value,
  y: y.value,
}
```

In order to retain reactivity, we should be returning the actual refs, not the current value at return time.

Again, we can use `$$()` to fix this. In this case, `$$()` can be used directly on the returned object - any reference to reactive variables inside the `$$()` call will retain the reference to their underlying refs:

```ts
function useMouse() {
  const x = $ref(0)
  const y = $ref(0)

  // listen to mousemove...

  // fixed
  return $$({
    x,
    y,
  })
}
```

### Using `$$()` on destructured props {#using-on-destructured-props}

`$$()` works on destructured props since they are reactive variables as well. The compiler will convert it with `toRef` for efficiency:

```ts
const { count } = defineProps<{ count: number }>()

passAsRef($$(count))
```

compiles to:

```js
export default {
  setup(props) {
    const __props_count = toRef(props, 'count')
    passAsRef(__props_count)
  },
}
```

## TypeScript Integration <sup class="vt-badge ts" /> {#typescript-integration}

Vue provides typings for these macros (available globally) and all types will work as expected. There are no incompatibilities with standard TypeScript semantics, so the syntax will work with all existing tooling.

This also means the macros can work in any files where valid JS / TS are allowed - not just inside Vue SFCs.

Since the macros are available globally, their types need to be explicitly referenced (e.g. in a `env.d.ts` file):

```ts
/// <reference types="unplugin-vue-macros/macros-global" />

// or for standalone version:
/// <reference types="@vue-macros/reactivity-transform/macros-global" />
```

When explicitly importing the macros from `vue/macros`, the type will work without declaring the globals.
