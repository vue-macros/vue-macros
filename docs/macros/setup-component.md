# setupComponent

<small mr-2>
  Stability: <code class="!text-red-600">experimental</code>
</small>
<WarnBadge>Experimental, use at your risk</WarnBadge>

::: tip

If you're using `setupComponent`, then `defineRender` cannot be disabled.

:::

With `defineSetupComponent`, `<script setup>` code can be put in **pure JS/TS(X)** without [Volar](https://github.com/johnsoncodehk/volar) extension.

|  Features  |     Supported      |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Vue 2    |        :x:         |
| TypeScript |        :x:         |

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

- TypeScript support is not yet completed.
- The source map does not correspond properly.
