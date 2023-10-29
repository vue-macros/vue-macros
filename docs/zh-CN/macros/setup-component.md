# setupComponent

<StabilityLevel level="experimental" />

::: tip

如果使用 `setupComponent` 时，不能禁用 `defineRender`。

默认情况下将会忽略 `node_modules` 中的文件。

:::

使用 `defineSetupComponent` 可以将 `<script setup>` 中的代码放在 **纯 JS/TS(X)** 中，而不需要使用 [Vue Language Tools (Volar)](https://github.com/johnsoncodehk/volar) 扩展。

|    特性    |        支持        |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Nuxt 3   |        :x:         |
|   Vue 2    |        :x:         |
| TypeScript |        :x:         |

另请参见 [Vue Vine](https://vue-vine.dev/) - Vue 函数组件的另一种风格。

## 基本用法

```tsx
export const App = defineSetupComponent(() => {
  defineProps<{
    foo: string
  }>()

  defineEmits<{
    (evt: 'change'): void
  }>()

  defineOptions({
    name: 'App',
  })

  // ...
  return <div />
})
```

## 类型注解

```ts
export const App: SetupFC = () => {
  defineProps<{
    foo: string
  }>()

  defineEmits<{
    (evt: 'change'): void
  }>()

  defineOptions({
    name: 'App',
  })
}
```

## 已知的问题

- TypeScript 支持尚未完成。
- Source map 不能正确映射。
