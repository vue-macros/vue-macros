# defineSlots

<small>稳定性: <code class="!text-yellow-600">不稳定</code></small>

使用 `defineSlots` 可以在 `<script setup>` 中声明 SFC 中 slots 的类型

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
  // slot name
  title: {
    // scoped slot
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
    "target": 3, // or 2.7 is not supported by Volar.
    "plugins": [
      "@vue-macros/volar/define-slots"
      // ...more feature
    ]
  }
}
```
