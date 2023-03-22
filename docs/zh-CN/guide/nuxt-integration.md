# Nuxt 集成

### 安装

::: code-group

```bash [npm]
npm i -D @vue-macros/nuxt
```

```bash [yarn]
yarn add -D @vue-macros/nuxt
```

```bash [pnpm]
pnpm add -D @vue-macros/nuxt
```

:::

## 配置

```ts
// nuxt.config.ts
export default {
  modules: [
    '@vue-macros/nuxt',
    // ...
  ],
  macros: {
    // 如果需要，在这里配置插件
  },
}
```

:tada: 恭喜你! 现在已经成功完成了对 Nuxt 的集成过程。

如果你还想要了解有关宏的更多信息, 请访问 [全部宏](/zh-CN/macros/) :laughing:。
