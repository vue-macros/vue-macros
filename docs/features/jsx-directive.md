# jsxDirective

<StabilityLevel level="experimental" />

Vue built-in directives for JSX.

|  Directive  |       Vue 3        |       Vue 2        |       Volar        |
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

## Usage

### `v-on`

::: warning

`v-on` only supports binding to an object of event / listener pairs without an argument.

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

## Dynamic Arguments

It is possible to use a JavaScript expression in a directive argument by wrapping it with a pair of `$`:

`v-model`

```tsx
<Comp v-model:$name$={value} />
```

## Modifiers

Modifiers are special postfixes denoted by a `_`, which indicate that a directive should be bound in some special way.

```tsx
<form onSubmit_prevent>
  <input v-model_number={value} />
</form>
```

## Volar Configuration

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3,
    "plugins": [
      "@vue-macros/volar/jsx-directive",
      // ...more feature
    ],
  },
}
```
