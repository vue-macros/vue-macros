# shortEmits

<StabilityLevel level="stable" />

简化 `emits` 的定义。

在 Vue >= 3.3 中，此功能将默认关闭。

|    特性    |        功能        |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Vue 2    | :white_check_mark: |
| TypeScript | :white_check_mark: |

## 基本用法

使用 `ShortEmits` 或简写为 `SE`，可以使用元组或方法定义。

```vue
<script setup lang="ts">
const emits = defineEmits<{
  // 元组
  'update:modelValue': [val: string]
  // 方法
  update(val: string): void
}>()
</script>
```

## 和官方版本不同的是

- 官方版本不支持函数式的声明风格。
