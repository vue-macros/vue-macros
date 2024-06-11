# defineSlots

<StabilityLevel level="stable" />

使用 `defineSlots` 可以在 `<script setup>` 中声明 SFC 中插槽的类型

在 Vue >= 3.3 中，此功能将默认关闭。

|     特性     |        支持        |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     | :white_check_mark: |
| Volar Plugin | :white_check_mark: |

## 基本用法

### 简写语法

```vue twoslash
<script setup lang="ts">
defineSlots<{
  // 插槽名称
  title: {
    // 作用域插槽
    foo: 'bar' | boolean
  }
}>()
</script>
```

### 完整语法（官方版本）

```vue twoslash
<script setup lang="ts">
defineSlots<{
  title: (scope: { text: string }) => any
}>()
</script>
```

## Volar 配置

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3, // 或 2.7 用于 Vue 2
    "plugins": [
      "@vue-macros/volar/define-slots",
      // ...更多功能
    ],
  },
}
```
