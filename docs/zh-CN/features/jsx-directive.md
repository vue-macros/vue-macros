# jsxDirective

<StabilityLevel level="experimental" />

在 JSX 中使用 Vue 内置指令。

|   指令    |       Vue 3        |       Vue 2        |       Volar        |
| :-------: | :----------------: | :----------------: | :----------------: |
|   v-if    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| v-else-if | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|  v-else   | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|   v-for   | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|  v-once   | :white_check_mark: |        :x:         |                    |
|  v-memo   | :white_check_mark: |        :x:         |                    |

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

    <div v-for={(i, index) in list} v-memo={[foo === i]} key={index}>
      {i}
    </div>
  </>
))
</script>
```

## Volar Configuration

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3,
    "plugins": [
      "@vue-macros/volar/jsx-directive"
      // ...更多功能
    ]
  }
}
```
