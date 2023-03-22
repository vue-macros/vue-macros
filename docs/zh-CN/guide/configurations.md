# 配置

## 插件选项

在 Vue Macros 中所有功能都将会被默认开启，你可以将选项设置为 `false` 来禁用它们。

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
  defineModel: {
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
