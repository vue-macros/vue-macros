# exportRender

<StabilityLevel level="experimental" />

Transform default export statement as `defineRender` params in Vue SFC `script-setup`.

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |     :question:     |
|    Vue 2     |     :question:     |
| Volar Plugin | :white_check_mark: |

## Usage

```vue
<script setup lang="tsx">
// JSX passed directly
export default <div>ok</div>

// Or using render function
export default () => <div>ok</div>
</script>
```
