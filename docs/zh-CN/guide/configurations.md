# 配置

## 插件选项

所有功能将会被默认开启, 您可以将选项设置为 `false` 来禁用它们。

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

有关每个功能的选项，请参考功能页面。
