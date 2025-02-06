# jsxDirective <PackageVersion name="@vue-macros/jsx-directive" />

<StabilityLevel level="stable" />

在 JSX 中使用 Vue 内置指令。

|    指令     |       Vue 3        |       Vue 2        |       Volar        |
| :---------: | :----------------: | :----------------: | :----------------: |
|   `v-if`    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| `v-else-if` | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|  `v-else`   | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|   `v-for`   | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|   `v-on`    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|  `v-slot`   | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|  `v-html`   | :white_check_mark: | :white_check_mark: |         /          |
|  `v-once`   | :white_check_mark: |        :x:         |         /          |
|  `v-memo`   | :white_check_mark: |        :x:         |         /          |

## 选项

```ts
interface Options {
  /**
   * @default 'v-'
   */
  prefix?: string
  /**
   * @default 'vue'
   */
  lib?: 'vue' | 'vue/vapor' | 'react' | 'preact' | 'solid' | string
}
```

## 用法

### `v-if`, `v-else-if`, `v-else`

```vue twoslash
<script setup lang="tsx">
const { foo } = defineProps<{
  foo: number
}>()

// ---cut-start---
// prettier-ignore
// ---cut-end---
export default () => (
  <>
    <div v-if={foo === 0}>{foo}</div>

    <div v-else-if={foo === 1}>{foo}</div>
    //                          ^?

    <div v-else>{foo}</div>
    //           ^?
  </>
)
</script>
```

### `v-for`

```vue twoslash
<script setup lang="tsx">
export default () => (
  <div v-for={(item, index) in 4} key={index}>
    {item}
  </div>
)
</script>
```

### `v-slot`

::: code-group

```vue [App.vue] twoslash
<script lang="tsx" setup>
// #region v-slot
import type { FunctionalComponent } from 'vue'

export const Comp: FunctionalComponent<
  {},
  {},
  {
    default: () => any
    slot: (scope: { bar: number }) => any
    slots: (scope: { baz: boolean }) => any
  }
> = () => <div />
// #endregion v-slot
// ---cut---
// @noErrors
import { Comp } from './Comp.tsx'

// ---cut-start---
// prettier-ignore
// ---cut-end---
export default () => (
  <Comp>
    default slot...
    <template v-slot:slot={{ bar }}>
      //              ^|
      {bar}
    </template>
  </Comp>
)
</script>
```

<<< ./jsx-directive.md#v-slot{tsx} [Child.tsx]

:::

### `v-on`

::: warning

`v-on` 仅支持绑定不带参数的事件/监听器对的对象。

:::

```tsx
<form v-on={{ submit }} />
```

## 动态参数

在指令参数上也可以使用一个变量，需要包含在一对 `$` 内：

`v-model`

::: code-group

```vue [App.vue] twoslash
<script setup lang="tsx">
// ---cut-start---
// #region v-model
import { ref, type FunctionalComponent } from 'vue'

export const Comp: FunctionalComponent<
  {
    model: string
    models: string[]
  },
  {
    'update:model': [value: string]
    'update:models': [value: string[]]
  }
> = () => <div />
// #endregion v-model
// ---cut-end---
// @noErrors
import { Comp } from './Comp.tsx'

const name = ref('model')
const model = defineModel<string>()

export default () => (
  <Comp
    v-model:$name$={model.value}
    v-model:model={model.value}
    //       ^|
  />
)
</script>
```

<<< ./jsx-directive.md#v-model{tsx} [Comp.tsx]

:::

`v-slot`

::: code-group

```vue [App.vue] twoslash
<script setup lang="tsx">
// ---cut-start---
// #region v-slot-dynamic
import type { FunctionalComponent } from 'vue'

export const Comp: FunctionalComponent<
  {},
  {},
  {
    default: (scope: { foo: string }) => any
    title: (scope: { bar: number }) => any
  }
> = () => <div />
// #endregion v-slot-dynamic
// ---cut-end---
// @noErrors
import { Comp } from './Comp.tsx'

const slots = defineSlots<{
  default: (scope: { foo: string }) => any
  title: (scope: { bar: number }) => any
}>()

// ---cut-start---
// prettier-ignore
// ---cut-end---
export default () => (
  <Comp>
    <template v-for={(Slot, name) in slots} v-slot:$name$={scope}>
      //                                             ^?
      <Slot {...scope} />
    </template>
  </Comp>
)
</script>
```

<<< ./jsx-directive.md#v-slot-dynamic{tsx} [Comp.tsx]

:::

## 修饰符

修饰符是以 `_` 开头的特殊后缀，表明指令需要以一些特殊的方式被绑定。

```tsx
<form onSubmit_prevent>
  <input v-model_number={value} />
</form>
```

## Volar 配置

```jsonc {3} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
  },
}
```
