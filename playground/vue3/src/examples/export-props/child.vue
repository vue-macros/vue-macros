<!-- eslint-disable import/no-mutable-exports -->
<!-- eslint-disable vue/no-export-in-script-setup -->
<!-- eslint-disable @typescript-eslint/no-inferrable-types -->
<script setup lang="ts">
export let foo: string
export const bar: number = 10

const check = () => {
  console.log(foo, bar)
  debugger
}
</script>

<template>
  <div>exportProps <button @click="check">Check source map</button></div>
  <div>foo: {{ foo }}</div>
  <div>bar: {{ bar }}</div>
</template>
