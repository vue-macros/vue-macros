# namedTemplate

<div py2 flex>
  <small>稳定性: <code class="!text-red-600">实验性</code></small>
  <WarnBadge>实验性功能，风险自负</WarnBadge>
</div>

通过开启 `namedTemplate` ，`<template>` 可以像变量一样被引用。

有时候我们需要把非常简单的组件颠倒顺序，但又不想放弃 Vue 模板的特性而使用 JSX/TSX。那么这个功能就非常有用了。

如果你支持此功能，欢迎在 [讨论](https://github.com/vuejs/core/discussions/6898) 中点赞 :+1: 或评论。

|        特性        |        支持        |
| :----------------: | :----------------: |
|       Vue 3        | :white_check_mark: |
|       Nuxt 3       |        :x:         |
|       Vue 2        |        :x:         |
| TypeScript / Volar |        :x:         |

## 基本用法

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

## 已知的问题

- TypeScript / Volar 支持尚未完成。
