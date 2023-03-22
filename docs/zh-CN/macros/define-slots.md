# defineSlots

<small>稳定性: <code class="!text-yellow-600">不稳定</code></small>

使用 `defineSlots` 可以在 `<script setup>` 中声明 SFC 中插槽的类型

|         特性         |         支持         |
| :------------------: | :------------------: |
|        Vue 3         |  :white_check_mark:  |
|        Nuxt 3        |  :white_check_mark:  |
|        Vue 2         |  :white_check_mark:  |
| Volar Plugin + Vue 3 |  :white_check_mark:  |
| Volar Plugin + Vue 2 | :x: (Volar 还不支持) |

## 基本用法

```vue
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

## Volar 配置

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3, // Volar 暂不支持 2.7 版本
    "plugins": [
      "@vue-macros/volar/define-slots"
      // ...更多功能
    ]
  }
}
```
