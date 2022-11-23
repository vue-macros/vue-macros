# defineProps

<small>Stability: <code class="!text-yellow-600">unstable</code></small>

Correct types of destructured props using `$defineProps`.

See also [Vue issue](https://github.com/vuejs/core/issues/6876), [Reactivity Transform RFC](https://github.com/vuejs/rfcs/blob/reactivity-transform/active-rfcs/0000-reactivity-transform.md#defineprops-destructure-details).

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       | :white_check_mark: |
|       Vue 2        |        :x:         |
| TypeScript / Volar | :white_check_mark: |

::: warning

[Reactivity Transform](https://vuejs.org/guide/extras/reactivity-transform.html) is required. You should enable it first.

Unfortunately Reactivity Transform is not implemented in Vue 2, so this macro doesn't support Vue 2 now.

:::

## Basic Usage

```vue
<script setup lang="tsx">
//       ⬇️ ReactiveVariable<string[]>
const { foo } = $defineProps<{
  foo: string[]
}>()

//     ⬇️ Ref<string[]>
const fooRef = $$(foo)
</script>
```

## Volar Configuration

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3,
    "plugins": [
      "@vue-macros/volar/define-props"
      // ...more feature
    ]
  }
}
```
