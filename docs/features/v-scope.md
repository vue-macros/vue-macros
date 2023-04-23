# v-scope

with`v-scope` directive in template,variables can be stored in the template.
[Related-issue](https://github.com/vuejs/rfcs/issues/73)

|  Features  |     Supported      |
| :--------: | :----------------: |
|   Vue 3    | :white_check_mark: |
| TypeScript | :white_check_mark: |

## Basic Usage

::: code-group



```vue
<script setup>
import { ref } from 'vue'

const msg = ref('Hello')
</script>

<template>
  <h1 v-scope="{a: msg + ` Vue`}">{{ a }}</h1>
</template>
```