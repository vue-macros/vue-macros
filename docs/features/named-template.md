# namedTemplate <WarnBadge>Experimental, use at your risk</WarnBadge>

::: warning

:construction: WIP

:::

With enabling `namedTemplate`, `<template>` can be referenced like a variable.

Sometimes we need to reverse the order of the very simple components, and don't want to give the features of Vue template up and use JSX/TSX. Then this feature is much helpful.

If you support this feature, you can go to [the discussion](https://github.com/vuejs/core/discussions/6898) and hit like :+1: or comment.

|      Features      |     Supported      |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Vue 2        |        :x:         |
| TypeScript / Volar |        :x:         |

## Basic Usage

```vue {5-7,10-12,16-18}
<script setup>
const pager = 'top'
</script>

<template name="pager">
  <span>This is pager</span>
</template>

<template>
  <template v-if="pager === 'top'">
    <template is="pager" />
  </template>

  <span>Here is data table</span>

  <template v-if="pager === 'bottom'">
    <template is="pager" />
  </template>
</template>
```

## Known Usage

- TypeScript / Volar support is not yet completed.
