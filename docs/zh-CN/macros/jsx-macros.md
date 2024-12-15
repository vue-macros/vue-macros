# jsxMacros <PackageVersion name="@vue-macros/jsx-macros" />

<StabilityLevel level="experimental" />

JSX 的宏集合.

|     Directive     |    vue3 / vapor    |   react / preact   |       Volar        |
| :---------------: | :----------------: | :----------------: | :----------------: |
| `defineComponent` | :white_check_mark: |        :x:         | :white_check_mark: |
|   `defineModel`   | :white_check_mark: |        :x:         | :white_check_mark: |
|   `defineSlots`   | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|  `defineExpose`   | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|   `defineStyle`   | :white_check_mark: | :white_check_mark: | :white_check_mark: |

## 选项

```ts
interface Options {
  /**
   * @default 'vue'
   */
  lib?: 'vue' | 'vue/vapor' | 'react' | 'preact'
}
```

## defineComponent

- 支持直接返回 `JSX`.
- 自动收集使用过的 prop 到 defineComponent 的 props 选项中。
- 支持在 `await` 表达式后使用 `getCurrentInstance()`。

```vue twoslash
<script lang="tsx">
// @errors: 2307
import { getCurrentInstance, nextTick, Suspense } from 'vue'

const Comp = defineComponent(
  async (props: {
    foo?: string
    bar?: string
    // ^ 没有使用的 prop 将作为 attribute 自动透传
  }) => {
    await nextTick()
    const i = getCurrentInstance()
    return (
      <div>
        <span>{props.foo}</span>
      </div>
    )
  },
)

export default () => (
  <Suspense>
    <Comp foo="" bar="" />
  </Suspense>
)
</script>
```

::: details 编译后代码

```tsx
import { getCurrentInstance, withAsyncContext } from 'vue'

defineComponent(
  async (props) => {
    let __temp, __restore
    ;([__temp, __restore] = withAsyncContext(() => nextTick())),
      await __temp,
      __restore()
    const i = getCurrentInstance()
    return () => (
      <div>
        <span>{props.foo}</span>
      </div>
    )
  },
  { props: { foo: null } },
)
```

:::

- 解构的 props 将自动重构。
- 如果定义了 rest prop，它将被转换为 `useAttrs()`，并且 `inheritAttrs` 选项默认为 `false`。
- 如果 prop 的默认值以 `!` 结尾，该 prop 将被推断为必传的。

```vue twoslash
<script lang="tsx">
// @errors: 2307 2322
const Comp = defineComponent(
  <T,>({ foo = undefined as T, bar = ''!, ...attrs }) => {
    return (
      <div>
        <span {...attrs}>{foo}</span>
      </div>
    )
  },
)

export default () => <Comp<string> foo={1} bar={''} />
</script>
```

::: details 编译后代码

```tsx
import { createPropsDefaultProxy } from '/vue-macros/jsx-macros/with-defaults'
defineComponent(
  (_props) => {
    const props = createPropsDefaultProxy(_props, { bar: '' })
    const attrs = useAttrs()
    return () => (
      <div>
        <span {...attrs}>{_props.foo}</span>
      </div>
    )
  },
  { props: { foo: null, bar: { required: true } }, inheritAttrs: false },
)
```

:::

## defineModel

- 不支持使用连字符的 model 名称。
- 当表达式以 `!` 结尾时，将被推断为必需的 model。
- 修改后的 model 可以同步读取，无需 `await nextTick()`。相关问题：https://github.com/vuejs/core/issues/11080

```vue twoslash
<script lang="tsx">
// @errors: 2307 2322
import { ref } from 'vue'

function Comp() {
  const modelValue = defineModel<string>()!
  return <div>{modelValue.value}</div>
}

export default () => {
  const foo = ref(1)
  return <Comp v-model={foo.value} />
}
</script>
```

::: details 编译后代码

```tsx
import { ref } from 'vue'
import { useModel } from '/vue-macros/jsx-macros/use-model'

function Comp(_props: {
  modelValue: string
  'onUpdate:modelValue': (value: string) => any
}) {
  const modelValue = useModel<string>(_props, 'modelValue', { required: true })
  return <div>{modelValue.value}</div>
}
```

:::

## defineExpose

就像在 Vue SFC 中一样。

```vue twoslash
<script lang="tsx">
// @errors: 2307
import { shallowRef as useRef } from 'vue'

const Comp = <T,>({ foo = undefined as T }) => {
  defineExpose({
    foo,
  })
  return <div />
}

export default () => {
  const compRef = useRef()
  console.log(compRef.value!.foo === 1)
  return <Comp ref={compRef} foo={1 as const} />
}
</script>
```

## defineSlots

- 如果使用泛型定义插槽，所有插槽将是可选的。

```tsx
const slots = defineSlots<{
  default: () => any
}>()

slots.default?.()
//           ^ optional
```

- 支持默认插槽（推荐）。

```vue twoslash
<script lang="tsx">
// @errors: 2307
function Comp<const T>() {
  const slots = defineSlots({
    title: (props: { bar?: T }) => <div>title slot: {props.bar}</div>,
    default: (props: { foo: number }) => <div>default slot: {props.foo}</div>,
  })

  return (
    <>
      <slots.title />
      <slots.default foo={1} />
    </>
  )
}

// ---cut-start---
// prettier-ignore
// ---cut-end---
export default () => (
  <Comp<1>>
    <template v-slot:title={{ bar }}>
      //                      ^?
      {bar}
    </template>
    <template v-slot={{ foo }}>
      //                ^?
      {foo}
    </template>
  </Comp>
)
</script>
```

## defineStyle

```ts
declare function defineStyle(
  style: string,
  options?: { scoped?: boolean },
): void
```

- 支持在一个文件中定义多个 style 宏。
- 支持 CSS 变量和 JS 变量绑定。
- 支持 CSS 预处理器：`css`、`scss`、`sass`、`less`、`stylus`、`postcss`。

```ts
defineStyle.scss(`...`)
defineStyle.stylus(`...`)
// ...
```

- 支持 scoped 模式。
  - 如果在文件的顶层定义，scoped 选项为 `false`。
  - 如果在函数内定义且不是 `CSS module`，scoped 选项默认为 `true`。

```tsx
function Comp({ color = 'red' }) {
  defineStyle.scss(`
    .foo {
      color: ${color};

      :deep(.bar) {
        color: blue;
      }
    }
  `)
  return <Comp color="red" class="foo bar" />
}

defineStyle(`
  .bar {
    background: black;
  }
`)
```

- 支持 `css modules`, 如果宏是赋值表达式。

```vue twoslash
<script lang="tsx">
// @errors: 2307
export default () => {
  const styles = defineStyle.scss(`
    .foo {
      color: blue;
      .bar {
        background: red;
      }
    }
  `)

  return <div class={styles.bar} />
  //                  ^?
}
</script>
```

## Volar Configuration

```json {5} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
    "vueMacros": {
      "jsxMacros": true,
      "scriptSFC": true
    }
  }
}
```
