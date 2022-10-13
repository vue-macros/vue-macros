# setupComponent (Experimental)

::: warning

Under experimental, use at your risk!

:::

With `defineSetupComponent`, `<script setup>` code can be put in **pure JS/TS(X)** without [Volar](https://github.com/johnsoncodehk/volar) extension.

## Basic Usage

```ts
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
})
```

## Type Annotation

```ts
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

- The source map does not correspond properly.
- TypeScript support is not yet complete.
