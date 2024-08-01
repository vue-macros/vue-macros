# scriptSFC <PackageVersion name="@vue-macros/volar" />

<StabilityLevel level="experimental" />

Enabled Volar support for `.ts` | `.tsx` files.

|   Features   |     Supported      |
| :----------: | :----------------: |
| Volar Plugin | :white_check_mark: |

## Basic Usage

### With `jsxDirective`

::: code-group

```tsx [App.tsx]
import { expectTypeOf } from 'expect-type'

export default ({ foo }: { foo: number }) => (
  <div v-if={foo === 1}>{foo}</div>
  //                     ^ will be inferred as 1
)
```

:::

## Volar Configuration

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
