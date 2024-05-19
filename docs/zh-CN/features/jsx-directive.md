# jsxDirective

<StabilityLevel level="experimental" />

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

## 用法

### `v-on`

::: warning

`v-on` 仅支持绑定不带参数的事件/监听器对的对象。

:::

```tsx
<form v-on={{ submit }} />
```

### `v-if`, `v-else-if`, `v-else`

```tsx
<div v-if={foo === 0}>
  <div v-if={foo === 0}>0-0</div>
  <div v-else-if={foo === 1}>0-1</div>
  <div v-else>0-2</div>
</div>
```

### `v-for`, `v-memo`

```tsx
<div v-for={(item, index) in list} key={index} v-memo={[foo === item]}>
  {item}
</div>
```

### `v-slot`

```tsx
<Child>
  default slot
  <template v-slot:bottom={{ bar }}>
    <span>{bar}</span>
  </template>
</Child>
```

## 动态参数

在指令参数上也可以使用一个 JavaScript 表达式，需要包含在一对 `$` 内：

`v-model`

```tsx
<Comp v-model:$name$={value} />
```

`v-slot`

```tsx
<Comp>
  <template v-for={(Slot, slotName) in slots} v-slot:$slotName$={scope}>
    <Slot {...scope} />
  </template>
</Comp>
```

## 修饰符

修饰符是以 `_` 开头的特殊后缀，表明指令需要以一些特殊的方式被绑定。

```tsx
<form onSubmit_prevent>
  <input v-model_number={value} />
</form>
```

## Volar 配置

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3,
    "plugins": [
      "@vue-macros/volar/jsx-directive",
      // ...更多功能
    ],
  },
}
```
