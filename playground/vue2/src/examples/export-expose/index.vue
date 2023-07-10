<script setup lang="ts">
import { ref } from 'vue'
import { Assert } from '../../assert'
import Child from './child.vue'

const child = ref<InstanceType<typeof Child>>()
</script>

<template>
  <div>
    <Child ref="child" />
    <Assert :l="child?.foo" r="new" />
    <Assert :l="child?.bar" r="bar" />
  </div>
</template>
