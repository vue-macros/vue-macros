# setupComponent

<StabilityLevel level="experimental" />

::: tip

`defineRender` cannot be disabled when using `setupComponent`.

Files in `node_modules` will be ignored by default.

:::

With `defineSetupComponent`, `<script setup>` code can be put in **pure JS/TS(X)** without [Vue Language Tools (Volar)](https://github.com/johnsoncodehk/volar) extension.

|  Features  |     Supported      |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Nuxt 3   |        :x:         |
|   Vue 2    |        :x:         |
| TypeScript |        :x:         |

See also [Vue Vine](https://vue-vine.dev/) - another style for Vue functional component.

## Basic Usage

```tsx twoslash
export const App = defineSetupComponent(() => {
  defineProps<{
    foo: string
  }>()

  defineEmits<{
    (evt: 'change'): void
  }>()

  defineOptions({
    name: 'App',
  })

  // ...
  return <div />
})
```

## Type Annotation

```ts twoslash
export const App: SetupFC = () => {
  defineProps<{
    foo: string
  }>()

  defineEmits<{
    (evt: 'change'): void
  }>()

  defineOptions({
    name: 'App',
  })
}
```

## Known Issues

- TypeScript support is not yet completed.
- The source map does not correspond properly.
