# shortEmits

<small>稳定性: <code class="!text-green-600">稳定</code></small>

简化 `emits` 的定义

|    特性    |        功能        |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Vue 2    | :white_check_mark: |
| TypeScript | :white_check_mark: |

## 基本用法

使用 `ShortEmits` 或简写为 `SE`，可以使用元组或方法定义。

```vue
<script setup lang="ts">
const emits = defineEmits<
  // `ShortEmits` 或简写为 `SE`
  SE<{
    // 元组
    'update:modelValue': [val: string]
    // 方法
    update(val: string): void
  }>
>()
</script>
```
