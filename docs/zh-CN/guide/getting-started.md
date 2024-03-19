# 入门

Vue Macros 是一个库，用于实现尚未被 Vue 正式实现的提案或想法。这意味着它将探索更多宏和语法糖到 Vue 中。

在继续之前，我们假设你已经熟悉 Vue 的基本用法。

## 要求

- Node.js 16.14.0 或更高
- Vue >= 2.7 或 Vue >= 3.0
  - 某些功能需要 Vue >= 3.2.25
- VSCode 安装了 [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) **v1.8.27**（最新的 v1）扩展
  - ❌ 考虑到 2.x 版本尚未稳定，还有一些问题未被解决。并且适配 2.x 对 Vue Macros 几乎是不可逆的升级。所以我们决定目前不兼容 2.x，換而言之，我们依然支持 1.x。
  - ❌ 不支持 WebStorm

## 搭建第一个 Vue Macros 项目

### 安装

::: code-group

```bash [npm]
npm i -g @vue-macros/cli
```

```bash [yarn]
yarn global add @vue-macros/cli
```

```bash [pnpm]
pnpm add -g @vue-macros/cli
```

:::

这一指令将会安装 [@vue-macros/cli](https://github.com/vue-macros/vue-macros-cli)，它是 Vue Macros 官方的项目脚手架工具。

### 初始化

::: code-group

```bash [npm]
npm create vite@latest my-vue-macros -- --template vue-ts
cd my-vue-macros
vue-macros init
```

```bash [yarn]
yarn create vite my-vue-macros --template vue-ts
cd my-vue-macros
vue-macros init
```

```bash [pnpm]
pnpm create vite my-vue-macros --template vue-ts
cd my-vue-macros
vue-macros init
```

你将会看到一些可选的实验性功能提示。

:::

## 示例

- [Vite + Vue 3](https://github.com/vue-macros/vue-macros/tree/main/playground/vue3)
- [Vite + Vue 2](https://github.com/vue-macros/vue-macros/tree/main/playground/vue2)
- [Nuxt 3 + Vue 3](https://github.com/vue-macros/nuxt)
- [Vue CLI + Vue 2](https://github.com/vue-macros/vue2-vue-cli)

🌟 欢迎提供更多示例！

## Nuxt 集成

如果你使用的是 [Nuxt 3](https://nuxt.com/)，请阅读 [Nuxt 集成](./nuxt-integration.md)。

## 打包器集成

如果你使用的是 [Vite](https://vitejs.dev/)、[Rollup](https://rollupjs.org/)、[esbuild](https://esbuild.github.io/)，或 [Webpack](https://webpack.js.org/) 此类打包器，请阅读 [打包器集成](./bundler-integration.md)。
