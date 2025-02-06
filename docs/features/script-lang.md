# scriptLang <PackageVersion name="@vue-macros/script-lang" />

<StabilityLevel level="experimental" />

Set the default language for `<script>` block.

::: tip
Convert `<script setup>` to `<script setup lang="ts">`.
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

```jsonc {3,5-7} [tsconfig.json]
{
  "vueCompilerOptions": {
    "plugins": ["vue-macros/volar"],
    "vueMacros": {
      "scriptLang": {
        "defaultLang": "ts",
      },
    },
  },
}
```
