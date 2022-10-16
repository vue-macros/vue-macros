<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import Empty from './empty.vue'
import Tsx from './tsx.vue'

defineOptions({
  name: 'ExampleDefineOptions',
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

    <empty />
    <tsx />
  </p>
</template>
