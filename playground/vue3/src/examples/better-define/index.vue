<script setup lang="ts">
import Child from './child.vue'
import QuasarDemo from './quasar-demo.vue'
import ReactivityTransform from './reactivity-transform.vue'
import ShortEmits from './short-emits.vue'
</script>

<template>
  <Child name="" msg="" :age="10" union="" />
  <ReactivityTransform />
  <QuasarDemo model-value="" />
  <ShortEmits />
</template>
