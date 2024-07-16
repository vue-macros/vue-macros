# scriptLang

<StabilityLevel level="experimental" />

如果 `script` 标签没有 `lang` 属性，则默认为 `ts`。

::: tip
把 `<script setup>` 转换为 `<script setup lang="ts">`.
:::

|   Features   |     Supported      |
| :----------: | :----------------: |
|    Vue 3     | :white_check_mark: |
|    Nuxt 3    | :white_check_mark: |
|    Vue 2     | :white_check_mark: |
| Volar Plugin | :white_check_mark: |

## Options

```ts
interface Options {
  /**
   * @property {'ts' | 'tsx' | 'jsx'}
   * @default 'ts'
   */
  default?: string
}
```

## Usage

```vue twoslash
<script setup>
defineProps<{
  foo: string
}>()
</script>
```

## Volar Configuration

```jsonc {6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "target": 3,
    "plugins": [
      "@vue-macros/volar/script-lang",
      // ...more feature
    ],
  },
}
```
