# jsxDirective

<StabilityLevel level="experimental" />

在 `jsx` 中使用 `v-if` 和 `v-for` 指令.

| Features |     Supported      |
| :------: | :----------------: |
|  Vue 3   | :white_check_mark: |
|  Nuxt 3  | :white_check_mark: |
|  Vue 2   | :white_check_mark: |
|  Volar   | :white_check_mark: |

## Usage

```vue
<script setup lang="tsx">
const { foo, list } = defineProps<{
  foo: number
  list: number[]
}>()

defineRender(() => (
  <>
    <div v-if={foo === 0}>
      <div v-if={foo === 0}>0-0</div>
      <div v-else-if={foo === 1}>0-1</div>
      <div v-else>0-2</div>
    </div>

    <div v-for={(i, index) in list} key={index}>
      {i}
    </div>
  </>
))
</script>
```
