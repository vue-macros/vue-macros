# scriptLang <PackageVersion name="@vue-macros/script-lang" />

<StabilityLevel level="experimental" />

为 `<script>` 块设置默认语言。

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
   * @default 'ts'
   */
  defaultLang?: 'ts' | 'tsx' | 'jsx' | string
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

```jsonc {4,6-8}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["@vue-macros/volar"],
    "vueMacros": {
      "scriptLang": {
        "defaultLang": "ts",
      },
    },
  },
}
```
