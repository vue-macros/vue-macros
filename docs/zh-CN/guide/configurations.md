# 配置

## 插件选项

在 Vue Macros 中所有功能都将会被默认开启，你可以将选项设置为 `false` 来禁用它们。

```ts
VueMacros({
  root: '/your-project-path',

  /**
   * Vue version, 2 or 3.
   *
   * optional, detecting automatically.
   */
  version: 3,

  plugins: {
    vue: Vue(),
    vueJsx: VueJsx(),
  },

  /** Defaults to true  */
  defineModel: {
    /**
     * Unified mode, only works for Vue 2
     *
     * Converts `modelValue` to `value`
     */
    unified: true,
  },

  // Disable features
  hoistStatic: false,

  // ... more features
})
```

有关每个宏的配置选项，请参考对应宏的页面。
