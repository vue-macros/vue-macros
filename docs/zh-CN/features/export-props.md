# exportProps <PackageVersion name="@vue-macros/define-props" />

<StabilityLevel level="experimental" />

在 Vue 中使用 [Svelte 风格声明 `props`](https://svelte.dev/docs#component-format-script-1-export-creates-a-component-prop)。

|     特性     |        支持        |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    |         ?          |
|    Vue 2     | :white_check_mark: |
| Volar Plugin | :white_check_mark: |

## 前置条件

要使用此功能，需要 [Reactivity Transform](./reactivity-transform.md)，
但在 Vue Macros 中已经默认启用。

`export let` 将编译为 `defineModel`，该功能在 Vue 3.4+ 中受支持。

## 用法

使用导出语法来声明 `props`。

```vue twoslash
<script setup lang="ts">
export let foo: string
export const bar: number = 1 // 带有默认值
</script>
```

## Volar 配置

```jsonc {3,5} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["vue-macros/volar"],
  },
  "vueMacros": {
    "exportProps": true,
  },
}
```
