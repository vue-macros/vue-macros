# exportRender <PackageVersion name="@vue-macros/export-render" />

<StabilityLevel level="experimental" />

Transform the default export statement, in `<script setup>` of Vue SFC, as a component render function.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |     :question:     |
|    Vue 2     | :white_check_mark: |
| Volar Plugin | :white_check_mark: |

::: tip

This feature depends on `defineRender`, and make sure `defineRender` is not disabled.

:::

## Usage

```vue
<script setup lang="tsx">
// JSX passed directly
export default <div>ok</div>

// Or using render function
export default () => <div>ok</div>
</script>
```

## Volar Configuration

```jsonc {4}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["@vue-macros/volar"],
  },
}
```
