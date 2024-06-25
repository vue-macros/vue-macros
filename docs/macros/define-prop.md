# defineProp

<StabilityLevel level="experimental" />

Declare single prop one by one using `defineProp`.

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
|       Vue 2        | :white_check_mark: |
| TypeScript / Volar | :white_check_mark: |

::: warning

`defineProp` can not be used in the same file as type-declared `defineProps`.

:::

## Configuration

```ts
VueMacros({
  defineProp: {
    /**
     * 'kevinEdition' | 'johnsonEdition'
     * @default 'kevinEdition'
     */
    edition: 'kevinEdition',
  },
})
```

### Volar

```jsonc {6,10}
// tsconfig.json
{
  // ...
  "vueCompilerOptions": {
    "plugins": [
      "@vue-macros/volar/define-prop",
      // ...more feature
    ],
    // "kevinEdition" | "johnsonEdition" | false
    "experimentalDefinePropProposal": "kevinEdition",
  },
}
```

## Kevin's Edition (Default)

### API Reference

```ts
defineProp<T>(propName)
defineProp<T>(propName, options)

// propName parameter can be optional,
// and will be inferred from variable name
const propName = defineProp<T>()
```

### Basic Usage

```vue twoslash
<script setup>
// @experimentalDefinePropProposal=kevinEdition
// ---cut---
// Declare prop
const count = defineProp('count')

// Infer prop name from variable name
const value = defineProp()

// access prop value
console.log(count.value)
</script>
```

### With Options

```vue twoslash
<script setup lang="ts">
// @experimentalDefinePropProposal=kevinEdition
// ---cut---
// Declare prop with options
const count = defineProp('count', {
  type: Number,
  required: true,
  default: 0,
  validator: (value: number) => value < 20,
})
</script>
```

### TypeScript

```vue twoslash
<script setup lang="ts">
// @experimentalDefinePropProposal=kevinEdition
// ---cut---
// Declare prop of type number and infer prop name from variable name
const count = defineProp<number>()
count.value

// Declare prop of TS type boolean with default value
const disabled = defineProp<boolean>('disabled', { default: true })
disabled.value
</script>
```

### With Reactivity Transform

```ts
const foo = $defineProp<string>('foo')
//    ^? type: string | undefined

const bar = $(defineProp('bar', { default: 'bar' }))
//    ^? type: string
```

## Johnson's Edition

### API Reference

```ts
// the prop name will be inferred from variable name
const propName = defineProp<T>()
const propName = defineProp<T>(defaultValue)
const propName = defineProp<T>(defaultValue, required)
const propName = defineProp<T>(defaultValue, required, rest)
```

### Basic Usage

```vue twoslash
<script setup>
// @experimentalDefinePropProposal=johnsonEdition
// ---cut---
// declare prop `count` with default value `0`
const count = defineProp(0)

// declare required prop `disabled`
const disabled = defineProp(undefined, true)

// access prop value
console.log(count.value, disabled.value)
</script>
```

### With Options

```vue twoslash
<script setup lang="ts">
// @experimentalDefinePropProposal=johnsonEdition
// ---cut---
// Declare prop with options
const count = defineProp(0, false, {
  type: Number,
  validator: (value: number) => value < 20,
})
</script>
```

### TypeScript

```vue twoslash
<script setup lang="ts">
// @experimentalDefinePropProposal=johnsonEdition
// ---cut---
const count = defineProp<number>()
count.value

// Declare prop of TS type boolean with default value
const disabled = defineProp<boolean>(true)
disabled.value
</script>
```

### With Reactivity Transform

```vue
<script setup lang="ts">
const foo = $defineProp<number>()
//    ^? type: number | undefined

const bar = $(defineProp(0, true))
//    ^? type: number
</script>
```
