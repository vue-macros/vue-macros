# exportRender

<StabilityLevel level="experimental" />

在 Vue SFC 的 `<script setup>` 中，把 export default 语句转换为组件的渲染函数。

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |     :question:     |
|    Vue 2     |     :question:     |
| Volar Plugin | :white_check_mark: |

::: tip

这个特性依赖于 `defineRender`，并确保 `defineRender` 没有被禁用。

:::

## 用法

```vue
<script setup lang="tsx">
// 可以直接传递 JSX
export default <div>ok</div>

// 或使用渲染函数
export default () => <div>ok</div>
</script>
```
