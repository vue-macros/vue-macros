# <div i-logos:eslint inline-block /> ESLint Integration <PackageVersion name="@vue-macros/eslint-config" />

## Installation

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

## Configuration

### Flat Configuration

```js
// eslint.config.js
import vueMacros from '@vue-macros/eslint-config'
export default [
  vueMacros,
  // ...your other configurations
]
```

### Legacy Configuration

```jsonc
// .eslintrc
{
  "extends": [
    "@vue-macros/eslint-config",
    // ...your other configurations
  ],
}
```
