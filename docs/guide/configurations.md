# Configurations

## Plugin Options

All features are enabled by default, you can disable them by setting the option to `false`.

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
  defineModels: {
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

See the features page for options for each feature.
