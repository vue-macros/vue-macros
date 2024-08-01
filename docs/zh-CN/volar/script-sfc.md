# scriptSFC <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="experimental" />

为 `.ts` 和 `.tsx` 文件提供 Volar 支持.

|   Features   |     Supported      |
| :----------: | :----------------: |
| Volar Plugin | :white_check_mark: |

## 基本用法

### 和 `jsxDirective` 一起使用

::: code-group

```tsx [App.tsx]
import { expectTypeOf } from 'expect-type'

export default ({ foo }: { foo: number }) => (
  <div v-if={foo === 1}>{foo}</div>
  //                     ^ 将被推断为 1
)
```

:::

## Volar 配置

```jsonc {4,6}
// tsconfig.json
{
  "vueCompilerOptions": {
    "plugins": ["@vue-macros/volar"],
    "vueMacros": {
      "scriptSFC": true,
    },
  },
}
```
