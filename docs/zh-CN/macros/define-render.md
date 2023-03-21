# defineRender

<small>稳定性: <code class="!text-green-600">稳定</code></small>

使用 `defineRender` 可以直接在 `<script setup>` 中定义渲染函数。

|    特性    |        支持        |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Nuxt 3   | :white_check_mark: |
|   Vue 2    | :white_check_mark: |
| TypeScript | :white_check_mark: |

## 基本用法

```vue
<script setup lang="tsx">
// JSX passed directly
defineRender(
  <div>
    <span>Hello</span>
  </div>
)

// Or using render function
defineRender(() => {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
})
</script>
```
