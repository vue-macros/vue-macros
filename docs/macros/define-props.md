# defineProps <PackageVersion name="@vue-macros/define-props" />

<StabilityLevel level="stable" />

Correct types of destructured props using `$defineProps`.

See also [Vue issue](https://github.com/vuejs/core/issues/6876), [Reactivity Transform RFC](https://github.com/vuejs/rfcs/blob/reactivity-transform/active-rfcs/0000-reactivity-transform.md#defineprops-destructure-details).

|         Features          |     Supported      |
| :-----------------------: | :----------------: |
|           Vue 3           | :white_check_mark: |
|          Nuxt 3           | :white_check_mark: |
|           Vue 2           | :white_check_mark: |
| TypeScript / Volar Plugin | :white_check_mark: |

::: warning

[Reactivity Transform](https://vuejs.org/guide/extras/reactivity-transform.html) is required. You should enable it first.

:::

## Basic Usage

```vue twoslash
<script setup lang="ts">
const { foo } = $defineProps<{
  //     ^?
  foo: string[]
}>()

const fooRef = $$(foo)
//     ^?
</script>
```

## Volar Configuration

```jsonc {4}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
  },
}
```
