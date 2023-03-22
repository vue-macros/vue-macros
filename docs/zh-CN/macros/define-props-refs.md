# definePropsRefs

<small>稳定性: <code class="!text-yellow-600">不稳定</code></small>

从 `defineProps` 中将返回 refs 而不是 reactive 对象，可以在不丢失响应式的情况下解构 props。

`toRefs(defineProps())` => `definePropsRefs()`

|           特性            |        支持        |
| :-----------------------: | :----------------: |
|           Vue 3           | :white_check_mark: |
|          Nuxt 3           | :white_check_mark: |
|           Vue 2           | :white_check_mark: |
| TypeScript / Volar Plugin | :white_check_mark: |

## 基本用法

```vue {2-3,8}
<script setup lang="ts">
// ✅ 解构不丢失响应式 
const { foo, bar } = definePropsRefs<{
  foo: string
  bar: number
}>()
//          ⬇️ Ref<string>
console.log(foo.value, bar.value)
</script>
```

## Volar 配置

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3,
    "plugins": [
      "@vue-macros/volar/define-props-refs"
      // ...更多功能
    ]
  }
}
```
