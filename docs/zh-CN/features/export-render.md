# exportRender

<StabilityLevel level="experimental" />

在 Vue SFC `script-setup` 中将默认 export 语句转换为 `defineRender` 参数。

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |     :question:     |
|    Vue 2     |     :question:     |
| Volar Plugin | :white_check_mark: |

## 用法

```vue
<script setup lang="tsx">
// 可以直接传递 JSX
export default <div>ok</div>

// 或使用渲染函数
export default () => <div>ok</div>
</script>
```
