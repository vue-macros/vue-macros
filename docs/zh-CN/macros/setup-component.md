# setupComponent

<StabilityLevel level="experimental" />

::: tip

如果你使用的是 `setupComponent`，则不能禁用 `defineRender`。

默认情况下不会忽略 `node_modules` 中的文件。

:::

<!-- defineSetupComponent，<script setup>  [Volar](https://github.com/johnsoncodehk/volar) 的纯 JS/TS(X) 中 -->

使用 `defineSetupComponent`, 可以将 `<script setup>` 中的代码放在没有 [Volar](https://github.com/johnsoncodehk/volar) 扩展的 **纯 JS/TS(X)** 中。

|    特性    |        支持        |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
|   Nuxt 3   |        :x:         |
|   Vue 2    |        :x:         |
| TypeScript |        :x:         |

## 基本用法

```ts
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
