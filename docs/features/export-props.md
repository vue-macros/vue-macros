# exportProps <PackageVersion name="@vue-macros/define-props" />

<StabilityLevel level="experimental" />

[Svelte-like Declaring props](https://svelte.dev/docs#component-format-script-1-export-creates-a-component-prop) for Vue.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |     :question:     |
|    Vue 2     | :white_check_mark: |
| Volar Plugin | :white_check_mark: |

## Pre-requisite

[Props destructuring](https://vuejs.org/guide/components/props.html#reactive-props-destructure) or [Reactivity Transform](./reactivity-transform.md) is **required** to use this feature.

Reactivity Transform is enabled by default in Vue Macros,
while props destructuring is enabled by default in Vue 3.5+.

## Usage

Using export syntax to declare props.

```vue twoslash
<script setup lang="ts">
export let foo: string
export const bar: number = 1 // with default value
</script>
```

## Volar Configuration

```jsonc {4,6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
    "vueMacros": {
      "exportProps": true,
    },
  },
}
```
