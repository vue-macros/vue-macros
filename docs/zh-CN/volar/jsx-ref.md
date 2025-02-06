# jsxRef <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="experimental" />

自动推断 `useRef` 的类型.

| Features |     Supported      |
| :------: | :----------------: |
|  Volar   | :white_check_mark: |

## 设置自动引入

::: code-group

```ts [vite.config.ts]
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: [
        {
          from: 'vue',
          imports: [['shallowRef', 'useRef']],
        },
      ],
    }),
  ],
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  imports: {
    presets: [
      {
        from: 'vue',
        imports: [['shallowRef', 'useRef']],
      },
    ],
  },
})
```

:::

## Basic Usage

::: code-group

```vue [App.vue] twoslash
<script lang="tsx">
// #region comp
import { defineComponent } from 'vue'

export const Comp = defineComponent({
  setup() {
    return { foo: 1 }
  },
})
// #endregion comp
// ---cut---
import { useRef } from 'vue-macros/runtime'
// 或者 import { shallowRef as useRef } from 'vue'
// @noErrors
import { Comp } from './Comp.ts'

export default defineComponent(() => {
  const comp = useRef()
  comp.value?.foo
  //           ^?

  return () => (
    <>
      <Comp ref={comp} />
    </>
  )
})
</script>
```

<<< ./jsx-ref.md#comp{ts} [Comp.ts]

:::

## Volar Configuration

```jsonc [tsconfig.json] {3,6}
{
  "vueCompilerOptions": {
    "plugins": ["vue-macros/volar"],
    "vueMacros": {
      "jsxRef": {
        "alias": ["useRef"],
      },
    },
  },
}
```
