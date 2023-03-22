# exportProps

<div py2 flex>
  <small>稳定性: <code class="!text-red-600">实验性</code></small>
  <WarnBadge>实验性功能，风险自负</WarnBadge>
</div>

在 Vue 中使用 [Svelte 风格声明 `props`](https://svelte.dev/docs#component-format-script-1-export-creates-a-component-prop)。

|     特性     |        支持        |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |         ?          |
|    Vue 2     |         ?          |
| Volar Plugin | :white_check_mark: |

## 用法

使用导出语法来声明 `props`。

```vue
<script setup lang="ts">
export let foo: string
export const bar: number = 1 // 带有默认值 
</script>
```
