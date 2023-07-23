<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import Empty from './empty.vue'
import Tsx from './tsx.vue'

defineOptions({
  name: 'ExampleDefineOptions',
  inheritAttrs: false,
})
</script>

<template>
  <div>
    <empty />
    <tsx />
  </div>
</template>
