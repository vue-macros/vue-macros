# Getting Started

Vue Macros is a library that implements proposals or ideas that have not been officially implemented by Vue. That means it will explore and extend more features and syntax sugar to Vue.

We assume you are already familiar with the basic usages of Vue before you continue.

## Requirements

- Node.js 16.14.0 or higher.
- Vue >= 2.7 or Vue >= 3.0.
  - Some features need Vue >= 3.2.25.
- VSCode installed the [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) **v1.8.27** (the latest v1) extension.
  - ❌ Considering that v2 is not yet stable and some issues remain unresolved, plus adapting to 2.x would mean an almost irreversible upgrade for Vue Macros, we've decided not to support 2.x at this time. In other words, we will continue to support v1.
  - ❌ WebStorm is not supported.

## Creating a Vue Macros Project

### Installation

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

This command will install [@vue-macros/cli](https://github.com/vue-macros/vue-macros-cli), the official Vue Macros scaffolding tool.

### Initialization

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

You will be presented with prompts for several optional experimental features.

:::

## Demos

- [Vite + Vue 3](https://github.com/vue-macros/vite)
- [Vite + Vue 2](https://github.com/vue-macros/vue-macros/tree/main/playground/vue2)
- [Nuxt 3 + Vue 3](https://github.com/vue-macros/nuxt)
- [Vue CLI + Vue 2](https://github.com/vue-macros/vue2-vue-cli)

🌟 More demos are welcome!

## Nuxt Integration

If you're using [Nuxt 3](https://nuxt.com/), read the [Nuxt Integration](./nuxt-integration.md).

## Bundler Integrations

If you're using [Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org/), [esbuild](https://esbuild.github.io/), or [Webpack](https://webpack.js.org/), read the [Bundler Integration](./bundler-integration.md).
