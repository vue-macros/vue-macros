# defineProps

<small>稳定性: <code class="!text-green-600">稳定</code></small>

使用 `$defineProps` 可以正确地解构 `props` 的类型

参见 [Vue issue](https://github.com/vuejs/core/issues/6876), [Reactivity Transform RFC](https://github.com/vuejs/rfcs/blob/reactivity-transform/active-rfcs/0000-reactivity-transform.md#defineprops-destructure-details).

|           特性            |        支持        |
| :-----------------------: | :----------------: |
|           Vue 3           | :white_check_mark: |
|          Nuxt 3           | :white_check_mark: |
|           Vue 2           | :white_check_mark: |
| TypeScript / Volar Plugin | :white_check_mark: |

::: warning

在开始之前，你必须先开启 [响应性语法糖](https://cn.vuejs.org/guide/extras/reactivity-transform.html)

:::

## 基本用法

```vue
<script setup lang="ts">
//       ⬇️ ReactiveVariable<string[]>
const { foo } = $defineProps<{
  foo: string[]
}>()

//     ⬇️ Ref<string[]>
const fooRef = $$(foo)
</script>
```

## Volar 配置

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3,
    "plugins": [
      "@vue-macros/volar/define-props"
      // ...更多功能
    ]
  }
}
```
