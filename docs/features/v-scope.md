# vScope

<StabilityLevel level="experimental" />

With `v-scope` directive in template, variables can be stored in the template.

- [Related issue](https://github.com/vuejs/rfcs/discussions/505)
- [Related PR](https://github.com/vuejs/core/pull/7218)

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
| Volar / TypeScript |        :x:         |

## Basic Usage

```vue
<script setup>
import { ref } from 'vue'

const msg = ref('Hello')
</script>

<template>
  <h1 v-scope="{ foo: `${msg} Vue` }">{{ foo }}</h1>
</template>
```
