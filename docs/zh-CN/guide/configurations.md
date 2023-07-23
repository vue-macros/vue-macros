# 配置

## 插件选项

默认情况下启用所有功能，但以下功能除外。

- `defineOptions` (Vue >= 3.3)
- `defineSlots` (Vue >= 3.3)
- `hoistStatic` (Vue >= 3.3)
- `shortEmits` (Vue >= 3.3)
- `exportExpose`
- `exportProps`
- `setupSFC`

您可以通过将选项设置为 `false` 来禁用它们。

```ts
VueMacros({
  root: '/your-project-path',

  /**
   * Vue 版本，2 或 3
   *
   * 可选，自动检测版本
   */
  version: 3,

  plugins: {
    vue: Vue(),
    vueJsx: VueJsx(),
  },

  /** 默认是 true  */
  defineModels: {
    /**
     * unified 模式，仅在 Vue 2 有效
     *
     * 将 `modelValue` 转换为 `value`
     */
    unified: true,
  },

  // 禁用特性
  hoistStatic: false,

  // ...更多
})
```

有关每个宏的配置选项，请参考对应宏的页面。
