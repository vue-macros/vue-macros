<script setup lang="ts">
import child from './child.vue'
import ReactivityTransform from './reactivity-transform.vue'
import QuasarDemo from './quasar-demo.vue'
</script>

<template>
  <child name="" msg="" :age="10" union="" />
  <reactivity-transform />
  <QuasarDemo model-value="" />
</template>
