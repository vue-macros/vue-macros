<script setup lang="tsx">
import { getCurrentInstance } from 'vue'

defineOptions({
  name: 'DemoDefineOptions',
  inheritAttrs: false,
  custom() {
    // Vue bug: sourcemap when JSX/TSX
    debugger
  },
})

const vm = getCurrentInstance()!
const check = () => {
  debugger
  ;(vm.type as any).custom()
}
</script>

<template>
  <p>
    defineOptions TSX demo.
    <button @click="check">Check source map</button>
  </p>
</template>
