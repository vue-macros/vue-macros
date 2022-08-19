<script setup lang="ts">
import { getCurrentInstance } from 'vue'

defineOptions({
  name: 'DemoDefineOptions',
  inheritAttrs: false,
  custom() {
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
    defineOptions demo.
    <button @click="check">Check source map</button>
  </p>
</template>
