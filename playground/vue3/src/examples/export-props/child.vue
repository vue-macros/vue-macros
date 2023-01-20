<script setup lang="ts">
export let foo: string
export const bar = 10

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
