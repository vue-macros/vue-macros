<script lang="ts" setup>
// https://github.com/sxzz/vue-macros/issues/37#issuecomment-1231677842
const [name] = /* hoist-static*/ ['VarCompName']

defineOptions({
  name,
})

const test = (name: string) => name
</script>

<template>
  <div>1</div>
</template>
