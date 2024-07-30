# shortVmodel <PackageVersion name="@vue-macros/short-vmodel" />

<StabilityLevel level="stable" />

A shorthand for `v-model`.

`v-model` -> `::` / `$` / `*`

If you have any questions about this feature, you can comment on [RFC Discussion](https://github.com/vuejs/rfcs/discussions/395).

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     |        :x:         |
| Volar Plugin | :white_check_mark: |

## Options

```ts
interface Options {
  /**
   * @default '$'
   */
  prefix?: '::' | '$' | '*'
}
```

## Usage

### `$` Dollar Sign (Default)

```vue
<template>
  <input $="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo $msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

### `::` Double Binding

```vue
<template>
  <!-- prettier-ignore -->
  <input ::="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo ::msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

### `*` Asterisk Sign

```vue
<template>
  <input *="msg" />
  <!-- => <input v-model="msg" /> -->
  <demo *msg="msg" />
  <!-- => <input v-model:msg="msg" /> -->
</template>
```

## Volar Configuration

```jsonc {4,6-8}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["unplugin-vue-macros/volar"],
    "vueMacros": {
      "shortVmodel": {
        "prefix": "$",
      },
    },
  },
}
```

## Known Issues

- Prettier will format `::=` to `:=` (e.g. `<div ::="msg" />` -> `<div :="msg" />`). The comment `<!-- prettier-ignore -->` is required if prefix is `::`.
