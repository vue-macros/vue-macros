# <div i-logos:eslint inline-block /> ESLint 集成 <PackageVersion name="@vue-macros/eslint-config" />

## 安装

::: code-group

```bash [pnpm]
pnpm add -D @vue-macros/eslint-config
```

```bash [yarn]
yarn add -D @vue-macros/eslint-config
```

```bash [npm]
npm i -D @vue-macros/eslint-config
```

:::

## 配置

### Flat 风格配置

```js [eslint.config.js]
import vueMacros from '@vue-macros/eslint-config'
export default [
  vueMacros,
  // ...其他配置
]
```

### 传统风格配置

```jsonc [.eslintrc]
{
  "extends": [
    "@vue-macros/eslint-config",
    // ...其他配置
  ],
}
```
