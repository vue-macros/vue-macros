# exportProps

<small py2>Stability: <code class="!text-red-600">experimental</code></small>

[Svelte-like Declaring props](https://svelte.dev/docs#component-format-script-1-export-creates-a-component-prop) for Vue.

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       |         ?          |
|       Vue 2        |         ?          |
| TypeScript / Volar | :white_check_mark: |

## Usage

Using export syntax to declare props.

```vue
<script setup lang="ts">
export let foo: string
export const bar: number = 1 // with default value
</script>
```
